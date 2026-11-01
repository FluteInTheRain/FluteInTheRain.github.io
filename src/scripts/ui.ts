const themeBtn = document.getElementById('theme-toggle');
themeBtn?.addEventListener('click', () => {
  const root = document.documentElement;
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch {}
});

const hamburger = document.getElementById('nav-hamburger');
const navLinks = document.getElementById('nav-links');
if (hamburger && navLinks) {
  const setOpen = (open: boolean) => {
    navLinks.classList.toggle('is-open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  };
  hamburger.addEventListener('click', () => setOpen(!navLinks.classList.contains('is-open')));
  navLinks.querySelectorAll('.nav-link').forEach((l) => l.addEventListener('click', () => setOpen(false)));
}
