/* Renders the entire page from data/content.json.
   Edit that JSON file to change any text on the site — nothing here is hardcoded content. */

const ICONS = {
  github: '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 3.3 5.4 3.6 5.4 3.6a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 10c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  linkedin: '<rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/><path d="M8 9h4v2.5A4.5 4.5 0 0 1 21 14v7h-4v-6.5a2 2 0 0 0-4 0V21H8z"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.2l.8-4H14V7a1 1 0 0 1 1-1h3z"/>',
  scholar: '<path d="M12 3 2 8l10 5 8-4.1V15h2V8Z"/><path d="M6 10.5V15c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5"/>',
  youtube: '<rect x="2" y="6" width="20" height="12" rx="4"/><path d="M10 9.5v5l4.5-2.5Z" fill="currentColor" stroke="none"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 7 10-7"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v1M12 20v1M4.2 4.2l.7.7M19.1 19.1l.7.7M3 12h1M20 12h1M4.2 19.8l.7-.7M19.1 4.9l.7-.7"/>',
  hamburger: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M6 18 18 6"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  chart: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
  award: '<circle cx="12" cy="8" r="5"/><path d="M8.5 12.5 7 22l5-3 5 3-1.5-9.5"/>',
};

function icon(name, size = 18) {
  const body = ICONS[name] || '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/* ---------- Theme ---------- */
function initTheme() {
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.innerHTML = icon(next === 'dark' ? 'sun' : 'moon', 18);
}

/* ---------- Section renderers ---------- */
function renderNav(data) {
  const { person, nav } = data;
  const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const links = nav.links.map((l) => `<a class="nav-link" href="${esc(l.href)}">${esc(l.label)}</a>`).join('');
  return `
    <div class="nav">
      <div class="container nav-inner">
        <div>
          <div class="nav-name">${esc(person.name)}</div>
          <div class="nav-role">${esc(person.role)}</div>
        </div>
        <div class="nav-links" id="nav-links">${links}</div>
        <div class="nav-actions">
          <a class="btn btn-outline-red" href="${esc(nav.resumeUrl)}">Resume</a>
          <button class="icon-btn" id="theme-toggle" type="button" aria-label="Toggle dark mode">${icon(currentTheme === 'dark' ? 'sun' : 'moon', 18)}</button>
          <button class="icon-btn nav-hamburger" id="nav-hamburger" type="button" aria-label="Toggle menu">${icon('hamburger', 18)}</button>
        </div>
      </div>
    </div>`;
}

function renderHero(data) {
  const { person, hero } = data;
  const socials = hero.socials.map((s) => `<a class="icon-btn brand-${esc(s.icon)}" href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.icon)}">${icon(s.icon, 17)}</a>`).join('');
  const avatarInner = person.avatar
    ? `<img src="${esc(person.avatar)}" alt="${esc(person.name)}">`
    : `<span>${esc(person.initials)}</span>`;
  const downloadAttr = hero.ctaSecondary.filename ? ` download="${esc(hero.ctaSecondary.filename)}"` : '';
  return `
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <p class="eyebrow hero-eyebrow">${esc(hero.eyebrow)}</p>
          <h1 class="hero-heading">${esc(hero.heading)}</h1>
          <p class="hero-bio">${esc(hero.bio)}</p>
          <div class="hero-cta-row">
            <a class="btn btn-primary" href="mailto:${esc(person.email)}">${esc(hero.ctaPrimary.label)}</a>
            <a class="btn btn-outline" href="${esc(hero.ctaSecondary.href)}"${downloadAttr}>${esc(hero.ctaSecondary.label)}</a>
          </div>
          <div class="hero-socials">${socials}</div>
        </div>
        <div class="hero-avatar-wrap">
          <div class="hero-avatar">${avatarInner}</div>
        </div>
      </div>
    </section>
    <div class="gradient-bar"></div>`;
}

function renderHighlights(data) {
  const tints = ['tint-red', 'tint-gold'];
  const items = data.highlights.map((h, i) => {
    const tint = tints[i % tints.length];
    return `
    <div class="card highlight ${tint}">
      <div class="highlight-icon ${tint}">${icon(h.icon, 22)}</div>
      <h3>${esc(h.title)}</h3>
      <p>${esc(h.desc)}</p>
      <a class="highlight-link" href="${esc(h.cta.href)}">${esc(h.cta.label)} &rarr;</a>
    </div>`;
  }).join('');
  return `
    <section class="container highlights-wrap">
      <div class="highlights-grid">${items}</div>
    </section>`;
}

function renderExperience(data) {
  const e = data.experience;
  const items = e.items.map((it, i) => `
    <div class="timeline-row">
      <div class="timeline-gutter">
        <div class="timeline-dot"></div>
        ${i < e.items.length - 1 ? '<div class="timeline-line"></div>' : ''}
      </div>
      <div class="card t-card">
        <div class="t-head"><span class="t-date">${esc(it.dateRange)}</span></div>
        <h3 class="t-role">${esc(it.role)}</h3>
        <p class="t-org">${esc(it.org)}</p>
        <p class="t-desc">${esc(it.desc)}</p>
      </div>
    </div>`).join('');
  return `
    <section class="section" id="experience">
      <div class="container">
        <p class="eyebrow">${esc(e.eyebrow)}</p>
        <h2 class="section-title">${esc(e.heading)}</h2>
        <p class="section-sub">${esc(e.subheading)}</p>
        <div>${items}</div>
      </div>
    </section>`;
}

function viewLink(url) {
  if (!url) return '';
  return `<a class="credential-link" href="${esc(url)}" target="_blank" rel="noopener">View &rarr;</a>`;
}

function credentialCard(item) {
  const meta = item.school
    ? `${esc(item.school)} &middot; ${esc(item.years)}`
    : `${esc(item.issuer)} &middot; ${esc(item.year)}`;
  const extra = item.gpa ? `<div class="credential-extra">GPA ${esc(item.gpa)}</div>` : '';
  const title = item.degree || item.title;
  return `
    <div class="card credential-card">
      <div class="credential-icon">${icon('award', 21)}</div>
      <div class="credential-body">
        <div class="credential-title">${esc(title)}</div>
        <div class="credential-meta">${meta}</div>
        ${extra}
        ${viewLink(item.url)}
      </div>
    </div>`;
}

function renderEducation(data) {
  const ed = data.education;
  const degrees = ed.degrees.map(credentialCard).join('');
  const certs = ed.certificates.map(credentialCard).join('');
  return `
    <section class="section" id="education">
      <div class="container">
        <p class="eyebrow">${esc(ed.eyebrow)}</p>
        <h2 class="section-title">${esc(ed.heading)}</h2>
        <p class="section-sub">${esc(ed.subheading)}</p>
        <div class="education-grid">
          <div>
            <p class="sub-label">Education</p>
            <div class="credential-list">${degrees}</div>
          </div>
          <div>
            <p class="sub-label">Certificates</p>
            <div class="credential-list">${certs}</div>
          </div>
        </div>
      </div>
    </section>`;
}

function renderSkills(data) {
  const s = data.skills;
  const groups = s.groups.map((g) => `
    <div class="card skill-card">
      <p class="skill-cat"><span class="skill-cat-dot"></span>${esc(g.category)}</p>
      <div class="skill-tags">${g.items.map((i) => `<span class="tag">${esc(i)}</span>`).join('')}</div>
    </div>`).join('');
  return `
    <section class="section alt-bg">
      <div class="container">
        <p class="eyebrow">${esc(s.eyebrow)}</p>
        <h2 class="section-title">${esc(s.heading)}</h2>
        <p class="section-sub">${esc(s.subheading)}</p>
        <div class="skills-grid">${groups}</div>
      </div>
    </section>`;
}

function projectCard(p) {
  const tags = p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('');
  const links = (p.links || []).length
    ? `<div class="project-links">${p.links.map((l) => `<a class="project-link" href="${esc(l.href)}">${esc(l.label)} &rarr;</a>`).join('')}</div>`
    : '';
  return `
    <div class="card project-card">
      <h3 class="project-title">${esc(p.title)}</h3>
      <span class="project-org">${esc(p.org)}</span>
      <p class="project-desc">${esc(p.desc)}</p>
      <div class="project-tags">${tags}</div>
      ${links}
    </div>`;
}

function projectGroup(group, marginBottom) {
  if (!group || !group.items || !group.items.length) return '';
  const style = marginBottom ? ' style="margin-bottom: 44px;"' : '';
  return `
    <p class="sub-label">${esc(group.label)}</p>
    <div class="projects-grid"${style}>${group.items.map(projectCard).join('')}</div>`;
}

function renderProjects(data) {
  const p = data.projects;
  return `
    <section class="section" id="projects">
      <div class="container">
        <p class="eyebrow">${esc(p.eyebrow)}</p>
        <h2 class="section-title">${esc(p.heading)}</h2>
        <p class="section-sub">${esc(p.subheading)}</p>
        ${projectGroup(p.company, !!(p.personal && p.personal.items && p.personal.items.length))}
        ${projectGroup(p.personal, false)}
      </div>
    </section>`;
}

function renderResearch(data) {
  const r = data.research;
  if (!r) return '';
  const pubs = r.publications.map((pub) => `
    <div class="card pub-card">
      <a class="pub-title" href="${esc(pub.href)}">${esc(pub.title)}</a>
      <div class="pub-meta">${esc(pub.venue)} &middot; ${esc(pub.year)}</div>
    </div>`).join('');
  return `
    <section class="section research-band" id="research">
      <div class="container">
        <p class="eyebrow">${esc(r.eyebrow)}</p>
        <h2 class="section-title">${esc(r.heading)}</h2>
        <p class="section-sub">${esc(r.subheading)}</p>
        <div class="pub-grid">${pubs}</div>
        <a class="btn btn-outline-band" href="${esc(r.scholarLink)}">View All On Google Scholar &rarr;</a>
      </div>
    </section>`;
}

function renderCta(data) {
  const c = data.cta;
  return `
    <section class="cta-band">
      <div class="container">
        <h2>${esc(c.heading)}</h2>
        <p>${esc(c.subtext)}</p>
        <a class="btn btn-primary" href="mailto:${esc(data.person.email)}">${esc(c.button.label)}</a>
      </div>
    </section>`;
}

function renderFooter(data) {
  const f = data.footer;
  const elsewhere = f.elsewhere.map((l) => `<a class="footer-link" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('');
  const quickLinks = f.quickLinks.map((l) => `<a class="footer-link" href="${esc(l.href)}">${esc(l.label)}</a>`).join('');
  return `
    <footer class="footer" id="contact">
      <div class="container">
        <div class="footer-grid">
          <div>
            <h2 class="footer-heading">${esc(f.heading)}</h2>
            <a class="footer-email" href="mailto:${esc(f.email)}">${esc(f.email)}</a>
          </div>
          <div>
            <p class="footer-col-title">${esc(f.elsewhereLabel || 'Elsewhere')}</p>
            <div class="footer-link-list">${elsewhere}</div>
          </div>
          <div>
            <p class="footer-col-title">${esc(f.quickLinksLabel || 'Quick Links')}</p>
            <div class="footer-link-list">${quickLinks}</div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>${esc(f.copyright)}</span>
          <span>${esc(f.location)}</span>
        </div>
      </div>
    </footer>`;
}

/* ---------- Wiring ---------- */
function attachEvents() {
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  const hamburger = document.getElementById('nav-hamburger');
  const navLinks = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      hamburger.innerHTML = icon(isOpen ? 'close' : 'hamburger', 18);
    });
    navLinks.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        hamburger.innerHTML = icon('hamburger', 18);
      });
    });
  }
}

function render(data) {
  document.title = data.meta.title;
  const desc = document.querySelector('meta[name="description"]') || (() => {
    const m = document.createElement('meta');
    m.setAttribute('name', 'description');
    document.head.appendChild(m);
    return m;
  })();
  desc.setAttribute('content', data.meta.description);

  const app = document.getElementById('app');
  app.innerHTML = [
    `<div class="page">`,
    renderNav(data),
    renderHero(data),
    renderHighlights(data),
    renderExperience(data),
    renderEducation(data),
    renderSkills(data),
    renderProjects(data),
    renderResearch(data),
    renderCta(data),
    renderFooter(data),
    `</div>`,
  ].join('');

  attachEvents();
}

async function init() {
  initTheme();
  try {
    const res = await fetch('data/content.json');
    if (!res.ok) throw new Error(`Failed to load content.json (${res.status})`);
    const data = await res.json();
    render(data);
  } catch (err) {
    document.getElementById('app').innerHTML =
      `<div style="padding:40px;font-family:sans-serif;">Could not load site content: ${esc(err.message)}</div>`;
    console.error(err);
  }
}

init();
