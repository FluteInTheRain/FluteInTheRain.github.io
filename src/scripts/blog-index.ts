// Search and "Show all" for the blog index archive.
// The page works without this script: every archive row is in the HTML, and this script only
// collapses rows past `data-initial` (by adding .is-collapsed) and reveals the search box.
import { normalizeSearch } from '../utils/blog-index';

const archive = document.querySelector<HTMLElement>('#archive');
const form = document.querySelector<HTMLFormElement>('[data-blog-search]');
const input = document.querySelector<HTMLInputElement>('#blog-search');
const sections = document.querySelector<HTMLElement>('[data-index-sections]');

if (archive && form && input) {
  const rows = Array.from(archive.querySelectorAll<HTMLElement>('.archive-row'));
  const more = archive.querySelector<HTMLButtonElement>('.archive-more');
  const empty = archive.querySelector<HTMLElement>('.archive-empty');
  const initial = Number(archive.dataset.initial ?? 8);
  const collapsible = rows.length > initial;
  let expanded = false;

  const showCollapsed = () => {
    archive.classList.toggle('is-collapsed', collapsible && !expanded);
    if (more) more.hidden = !(collapsible && !expanded);
  };

  const apply = (raw: string) => {
    const q = normalizeSearch(raw);
    if (!q) {
      sections && (sections.hidden = false);
      rows.forEach((r) => (r.hidden = false));
      if (empty) empty.hidden = true;
      showCollapsed();
      return;
    }
    const words = q.split(' ');
    let hits = 0;
    sections && (sections.hidden = true);
    archive.classList.remove('is-collapsed');
    if (more) more.hidden = true;
    for (const r of rows) {
      const hay = r.dataset.search ?? '';
      const match = words.every((w) => hay.includes(w));
      r.hidden = !match;
      if (match) hits++;
    }
    if (empty) empty.hidden = hits > 0;
  };

  const syncUrl = (raw: string) => {
    try {
      const url = new URL(window.location.href);
      if (raw.trim()) url.searchParams.set('q', raw);
      else url.searchParams.delete('q');
      history.replaceState(null, '', url);
    } catch {
      // the URL is only a convenience for sharing a search
    }
  };

  const setPlaceholder = () => {
    const vi = document.documentElement.getAttribute('data-lang') === 'vi';
    input.placeholder = (vi ? input.dataset.phVi : input.dataset.phEn) ?? '';
  };

  form.hidden = false;
  setPlaceholder();
  window.addEventListener('langchange', setPlaceholder);
  form.addEventListener('submit', (e) => e.preventDefault());

  more?.addEventListener('click', () => {
    expanded = true;
    showCollapsed();
  });

  input.addEventListener('input', () => {
    apply(input.value);
    syncUrl(input.value);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && input.value) {
      input.value = '';
      apply('');
      syncUrl('');
    }
  });

  const initialQuery = new URLSearchParams(window.location.search).get('q') ?? '';
  input.value = initialQuery;
  apply(initialQuery);
}
