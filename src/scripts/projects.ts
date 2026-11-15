// Projects section: Company/Personal tabs + master-detail list.
// Without JS (or in print) the server-rendered markup shows every project stacked;
// adding .is-enhanced switches style.css to the tabbed layout.
const phone = window.matchMedia('(max-width: 768px)');

function pauseVideos(root: Element) {
  root.querySelectorAll('video').forEach((v) => v.pause());
}

function controlled(el: Element): HTMLElement | null {
  const id = el.getAttribute('aria-controls');
  return id ? document.getElementById(id) : null;
}

function setOpen(item: HTMLButtonElement, open: boolean) {
  item.setAttribute('aria-expanded', String(open));
  const detail = controlled(item);
  if (!detail) return;
  if (!open) pauseVideos(detail);
  detail.classList.toggle('is-open', open);
}

function initProjects(section: HTMLElement) {
  const tabs = Array.from(section.querySelectorAll<HTMLButtonElement>('.proj-tab'));
  const panels = Array.from(section.querySelectorAll<HTMLElement>('.proj-panel'));
  const itemsOf = (panel: HTMLElement) =>
    Array.from(panel.querySelectorAll<HTMLButtonElement>('.proj-item'));

  function selectTab(tab: HTMLButtonElement) {
    const target = controlled(tab);
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((panel) => {
      const on = panel === target;
      if (!on) pauseVideos(panel);
      panel.classList.toggle('is-active', on);
    });
  }

  function selectItem(item: HTMLButtonElement) {
    const panel = item.closest<HTMLElement>('.proj-panel');
    if (!panel) return;
    if (item.getAttribute('aria-expanded') === 'true') {
      // Desktop keeps one project always shown; phone accordion can collapse it.
      if (phone.matches) setOpen(item, false);
      return;
    }
    // Closing an open item above this one shifts it up; browsers without CSS
    // scroll anchoring (Safari) would leave it off-screen, so keep it in place.
    const before = item.getBoundingClientRect().top;
    itemsOf(panel).forEach((other) => {
      if (other !== item) setOpen(other, false);
    });
    setOpen(item, true);
    if (phone.matches) {
      const shift = item.getBoundingClientRect().top - before;
      if (shift) window.scrollBy({ top: shift, behavior: 'instant' });
    }
  }

  section.classList.add('is-enhanced');

  const initialTab = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
  if (initialTab) selectTab(initialTab);
  else panels.forEach((panel) => panel.classList.add('is-active'));

  // Phone starts fully collapsed so the visitor sees the whole list first;
  // desktop keeps the server-selected first item open.
  panels.forEach((panel) => {
    itemsOf(panel).forEach((item) => {
      if (phone.matches) setOpen(item, false);
      else if (item.getAttribute('aria-expanded') === 'true') setOpen(item, true);
    });
  });

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (e) => {
      let next: number;
      if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      else return;
      e.preventDefault();
      selectTab(tabs[next]);
      tabs[next].focus();
    });
  });

  panels.forEach((panel) => {
    const items = itemsOf(panel);
    items.forEach((item, i) => {
      item.addEventListener('click', () => selectItem(item));
      item.addEventListener('keydown', (e) => {
        let next: number;
        if (e.key === 'ArrowDown') next = Math.min(i + 1, items.length - 1);
        else if (e.key === 'ArrowUp') next = Math.max(i - 1, 0);
        else return;
        e.preventDefault();
        if (next === i) return;
        // Arrow keys only move and open; they never collapse an already-open item.
        if (items[next].getAttribute('aria-expanded') !== 'true') selectItem(items[next]);
        items[next].focus();
      });
    });
  });

  // Leaving phone width with every item collapsed would leave the desktop
  // detail column empty, so reopen the first item of such a panel.
  phone.addEventListener('change', () => {
    if (phone.matches) return;
    panels.forEach((panel) => {
      const items = itemsOf(panel);
      if (items.length && !items.some((it) => it.getAttribute('aria-expanded') === 'true')) {
        setOpen(items[0], true);
      }
    });
  });
}

document.querySelectorAll<HTMLElement>('[data-projects]').forEach(initProjects);
