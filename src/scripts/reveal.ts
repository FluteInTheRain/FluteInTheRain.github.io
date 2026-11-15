// Subtle section fade-in on scroll. CSS (style.css, html.js .section) hides sections
// only when JS is running; without JS or when printing, everything stays visible.
const targets = Array.from(document.querySelectorAll<HTMLElement>('.section:not(main), .cta-band'));

function show(el: HTMLElement, instant = false) {
  if (instant) el.classList.add('is-instant');
  el.classList.add('is-revealed');
}

function init() {
  // Elements the user is jumping to (URL hash), and everything above them, appear at once.
  let hashId = location.hash.slice(1);
  try {
    hashId = decodeURIComponent(hashId);
  } catch {
    // malformed escape in the URL: use the raw value
  }
  const anchor = hashId ? document.getElementById(hashId) : null;
  if (anchor) {
    for (const el of targets) {
      const above = !!(el.compareDocumentPosition(anchor) & Node.DOCUMENT_POSITION_FOLLOWING);
      if (el === anchor || el.contains(anchor) || above) show(el, true);
    }
  }

  const pending = targets.filter((el) => !el.classList.contains('is-revealed'));

  if (!('IntersectionObserver' in window)) {
    pending.forEach((el) => show(el, true));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          show(e.target as HTMLElement);
          io.unobserve(e.target);
        }
      },
      { threshold: 0, rootMargin: '0px 0px -10% 0px' },
    );
    // Sections already on screen at load skip the transition (class added before the reveal transition can run).
    const vh = window.innerHeight;
    for (const el of pending) {
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) show(el, true);
      else io.observe(el);
    }
  }
}

try {
  init();
} catch {
  // never leave content hidden because of an error here
  targets.forEach((el) => show(el, true));
}
// Tells the failsafe timer in Layout.astro that reveal.ts is in control.
(window as unknown as { __revealReady?: boolean }).__revealReady = true;
