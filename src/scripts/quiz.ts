// Quiz player: turns the static markup of /blog/<post>/quiz/ into one-question-at-a-time with immediate grading.
// All logic that can be tested lives in src/utils/quiz.ts; this file only wires it to the DOM.

import { gradeAnswer, loadProgress, saveProgress, scoreByLevel, type Store } from '../utils/quiz';
import type { Level } from '../data/quiz/types';

const root = document.querySelector<HTMLElement>('[data-quiz]');

if (root) {
  const slug = root.dataset.post ?? '';
  const key = `quiz:${slug}`;
  let store: Store | null = null;
  try { store = window.localStorage; } catch { store = null; }

  const sets = [...root.querySelectorAll<HTMLElement>('.quiz-set')];
  const questions = [...root.querySelectorAll<HTMLElement>('.quiz-q')];
  const summary = root.querySelector<HTMLElement>('[data-summary]')!;
  const progressBox = root.querySelector<HTMLElement>('[data-progress]')!;
  const progressBar = root.querySelector<HTMLElement>('[data-progress-bar]')!;
  const progressDone = root.querySelector<HTMLElement>('[data-progress-done]')!;
  const setsNav = root.querySelector<HTMLElement>('[data-sets-nav]')!;
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-goto-set]')];

  let progress = loadProgress(store, key);
  let current = -1;

  const answerOf = (q: HTMLElement) => (q.dataset.answer ?? '').split(',');
  const optionsOf = (q: HTMLElement) => [...q.querySelectorAll<HTMLButtonElement>('.quiz-opt')];
  const isAnswered = (q: HTMLElement) => Boolean(progress[q.dataset.q ?? '']);
  const setOf = (q: HTMLElement) => q.closest<HTMLElement>('.quiz-set')!;
  const save = () => saveProgress(store, key, progress);

  /** "<span en>…</span><span vi>…</span>" built from DOM nodes; the site CSS shows the right one */
  const bilingual = (en: string, vi: string) => {
    const frag = document.createDocumentFragment();
    for (const [attr, text] of [['data-lang-en', en], ['data-lang-vi', vi]] as const) {
      const span = document.createElement('span');
      span.setAttribute(attr, '');
      span.textContent = text;
      frag.append(span);
    }
    return frag;
  };

  const resultBadge = (right: boolean) => {
    const span = document.createElement('span');
    span.className = 'quiz-result';
    span.dataset.result = '';
    span.append(right ? bilingual('Correct. ', 'Đúng. ') : bilingual('Not quite. ', 'Chưa đúng. '));
    return span;
  };

  /** show a question as answered: colours, explanation, locked options */
  function applyResult(q: HTMLElement, chosen: string[]) {
    const grade = gradeAnswer({ answer: answerOf(q) }, chosen);
    q.classList.add('is-answered', grade.correct ? 'is-right' : 'is-wrong');
    for (const opt of optionsOf(q)) {
      const id = opt.dataset.opt ?? '';
      opt.disabled = true;
      opt.setAttribute('aria-pressed', String(chosen.includes(id)));
      opt.classList.remove('is-picked');
      if (answerOf(q).includes(id)) opt.classList.add('is-right');
      else if (chosen.includes(id)) opt.classList.add('is-wrong');
    }
    q.querySelectorAll<HTMLElement>('.quiz-why-wrong li').forEach((li) => {
      li.classList.toggle('is-picked', chosen.includes(li.dataset.for ?? ''));
    });
    const verdict = q.querySelector<HTMLElement>('[data-verdict]')!;
    verdict.querySelector('[data-result]')?.remove();
    verdict.prepend(resultBadge(grade.correct));
    q.querySelector<HTMLElement>('[data-explain]')!.hidden = false;
    const next = q.querySelector<HTMLButtonElement>('.quiz-next')!;
    const last = Number(q.dataset.n) === questions.length;
    next.replaceChildren(last ? bilingual('See result', 'Xem kết quả') : bilingual('Next', 'Tiếp'));
    next.hidden = false;
    const check = q.querySelector<HTMLButtonElement>('.quiz-check');
    if (check) check.hidden = true;
  }

  function resetQuestion(q: HTMLElement) {
    q.classList.remove('is-answered', 'is-right', 'is-wrong');
    for (const opt of optionsOf(q)) {
      opt.disabled = false;
      opt.setAttribute('aria-pressed', 'false');
      opt.classList.remove('is-picked', 'is-right', 'is-wrong');
    }
    q.querySelectorAll('.quiz-why-wrong li').forEach((li) => li.classList.remove('is-picked'));
    q.querySelector('[data-verdict] [data-result]')?.remove();
    q.querySelector<HTMLElement>('[data-explain]')!.hidden = true;
    q.querySelector<HTMLButtonElement>('.quiz-next')!.hidden = true;
    const check = q.querySelector<HTMLButtonElement>('.quiz-check');
    if (check) { check.hidden = false; check.disabled = true; }
  }

  function updateProgress() {
    const done = questions.filter(isAnswered).length;
    progressDone.textContent = String(done);
    progressBar.style.width = `${(done / questions.length) * 100}%`;
    chips.forEach((chip) => {
      const set = sets.find((s) => s.dataset.set === chip.dataset.gotoSet);
      const qs = set ? [...set.querySelectorAll<HTMLElement>('.quiz-q')] : [];
      chip.classList.toggle('is-done', qs.length > 0 && qs.every(isAnswered));
    });
  }

  function show(i: number, scroll: boolean) {
    current = i;
    summary.hidden = true;
    questions.forEach((q, k) => q.classList.toggle('is-current', k === i));
    const set = setOf(questions[i]);
    sets.forEach((s) => s.classList.toggle('is-current', s === set));
    chips.forEach((chip) => chip.classList.toggle('is-current', chip.dataset.gotoSet === set.dataset.set));
    if (scroll) set.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showSummary() {
    current = -1;
    questions.forEach((q) => q.classList.remove('is-current'));
    sets.forEach((s) => s.classList.remove('is-current'));
    chips.forEach((chip) => chip.classList.remove('is-current'));
    const results = questions.map((q) => ({
      level: q.dataset.level as Level,
      correct: gradeAnswer({ answer: answerOf(q) }, progress[q.dataset.q ?? ''] ?? []).correct,
    }));
    const byLevel = scoreByLevel(results);
    summary.querySelector('[data-score-right]')!.textContent = String(results.filter((r) => r.correct).length);
    summary.querySelector('[data-score-total]')!.textContent = String(results.length);
    summary.querySelectorAll<HTMLElement>('[data-level-row]').forEach((row) => {
      const s = byLevel[row.dataset.levelRow as Level];
      row.querySelector('[data-level-score]')!.textContent = `${s.right} / ${s.total}`;
    });
    summary.querySelector<HTMLElement>('[data-retry-wrong]')!.hidden = results.every((r) => r.correct);
    summary.hidden = false;
    summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const firstUnanswered = () => {
    const i = questions.findIndex((q) => !isAnswered(q));
    return i === -1 ? 0 : i;
  };

  function answer(q: HTMLElement, chosen: string[]) {
    progress[q.dataset.q ?? ''] = chosen;
    save();
    applyResult(q, chosen);
    updateProgress();
  }

  // ---- events
  questions.forEach((q) => {
    const multi = q.dataset.type === 'multi';
    const check = q.querySelector<HTMLButtonElement>('.quiz-check');
    optionsOf(q).forEach((opt) => {
      opt.addEventListener('click', () => {
        if (isAnswered(q)) return;
        const id = opt.dataset.opt ?? '';
        if (!multi) { answer(q, [id]); return; }
        const picked = optionsOf(q).filter((o) => o.classList.contains('is-picked'));
        const willPick = !opt.classList.contains('is-picked');
        if (willPick && picked.length >= answerOf(q).length) return; // already holding two
        opt.classList.toggle('is-picked', willPick);
        opt.setAttribute('aria-pressed', String(willPick));
        if (check) check.disabled = optionsOf(q).filter((o) => o.classList.contains('is-picked')).length !== answerOf(q).length;
      });
    });
    check?.addEventListener('click', () => {
      const chosen = optionsOf(q).filter((o) => o.classList.contains('is-picked')).map((o) => o.dataset.opt ?? '');
      if (chosen.length === answerOf(q).length) answer(q, chosen);
    });
    q.querySelector('.quiz-next')?.addEventListener('click', () => {
      const i = questions.indexOf(q);
      if (i + 1 >= questions.length) { showSummary(); return; }
      show(i + 1, true);
    });
  });

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const set = sets.find((s) => s.dataset.set === chip.dataset.gotoSet);
      if (!set) return;
      const qs = [...set.querySelectorAll<HTMLElement>('.quiz-q')];
      const target = qs.find((q) => !isAnswered(q)) ?? qs[0];
      show(questions.indexOf(target), true);
    });
  });

  summary.querySelector('[data-retry-wrong]')?.addEventListener('click', () => {
    questions.forEach((q) => {
      const chosen = progress[q.dataset.q ?? ''];
      if (chosen && !gradeAnswer({ answer: answerOf(q) }, chosen).correct) {
        delete progress[q.dataset.q ?? ''];
        resetQuestion(q);
      }
    });
    save();
    updateProgress();
    show(firstUnanswered(), true);
  });

  summary.querySelector('[data-reset]')?.addEventListener('click', () => {
    progress = {};
    save();
    questions.forEach(resetQuestion);
    updateProgress();
    show(0, true);
  });

  // ---- start
  root.classList.add('js-quiz');
  progressBox.hidden = false;
  setsNav.hidden = false;
  questions.forEach((q) => {
    resetQuestion(q);
    const chosen = progress[q.dataset.q ?? ''];
    const ids = optionsOf(q).map((o) => o.dataset.opt ?? '');
    if (chosen && chosen.every((c) => ids.includes(c)) && chosen.length > 0) applyResult(q, chosen);
    else delete progress[q.dataset.q ?? ''];
  });
  updateProgress();
  if (questions.every(isAnswered)) { show(0, false); showSummary(); }
  else show(firstUnanswered(), false);
}
