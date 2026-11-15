// Subtle section fade-in on scroll. CSS (style.css, html.js .section) hides sections
// only when JS is running; without JS or when printing, everything stays visible.
const targets = Array.from(document.querySelectorAll<HTMLElement>('.section, .cta-band'));

function show(el: HTMLElement, instant = false) {
  if (instant) el.classList.add('is-instant');
  el.classList.add('is-revealed');
}

// Elements the user is jumping to (URL hash), and everything above them, appear at once.
const hashId = decodeURIComponent(location.hash.slice(1));
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
    { threshold: 0.08 },
  );
  // Sections already on screen at load skip the transition (class added before first paint).
  const vh = window.innerHeight;
  for (const el of pending) {
    const r = el.getBoundingClientRect();
    if (r.top < vh && r.bottom > 0) show(el, true);
    else io.observe(el);
  }
}
