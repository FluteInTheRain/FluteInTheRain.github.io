// Interactive post enhancements: Reading Progress Bar, TOC Active Spy, and Image Lightbox Zoom

// 1. Reading Progress Bar
const progressBar = document.getElementById('reading-progress');
if (progressBar) {
  const updateProgress = () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
      progressBar.style.width = `${progress}%`;
    }
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

// 2. Table of Contents Active Spy & Bilingual Sync
const tocLinks = document.querySelectorAll<HTMLAnchorElement>('.toc-link');
const articleHeadings = document.querySelectorAll<HTMLElement>('.prose h2');

if (tocLinks.length > 0 && articleHeadings.length > 0) {
  const headingMap = new Map<string, HTMLAnchorElement>();
  tocLinks.forEach((link) => {
    const slug = link.getAttribute('data-slug');
    if (slug) headingMap.set(slug, link);
  });

  // Tag TOC items with respective language attribute so they automatically show/hide with lang toggle
  articleHeadings.forEach((h) => {
    if (h.id && headingMap.has(h.id)) {
      const link = headingMap.get(h.id)!;
      const tocItem = link.closest('.toc-item');
      if (tocItem) {
        if (h.closest('[data-lang-en]')) {
          tocItem.setAttribute('data-lang-en', '');
        } else if (h.closest('[data-lang-vi]')) {
          tocItem.setAttribute('data-lang-vi', '');
        }
      }
    }
  });

  let activeHeadingId: string | null = null;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeHeadingId = entry.target.id;
          break;
        }
      }

      if (activeHeadingId && headingMap.has(activeHeadingId)) {
        tocLinks.forEach((l) => l.classList.remove('is-active'));
        const activeLink = headingMap.get(activeHeadingId);
        if (activeLink) {
          activeLink.classList.add('is-active');
        }
      }
    },
    {
      rootMargin: '-80px 0px -65% 0px',
      threshold: 0,
    }
  );

  articleHeadings.forEach((h) => {
    if (h.id) observer.observe(h);
  });
}

// 3. Image Lightbox / Click-to-Zoom
const zoomableImages = document.querySelectorAll<HTMLImageElement>('img[data-zoomable]');
if (zoomableImages.length > 0) {
  // Create modal singleton
  let modal = document.getElementById('image-lightbox-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'image-lightbox-modal';
    modal.className = 'lightbox-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Image preview');
    modal.innerHTML = `
      <div class="lightbox-backdrop"></div>
      <div class="lightbox-content">
        <img class="lightbox-img" src="" alt="" />
        <button type="button" class="lightbox-close" aria-label="Close zoom">&times;</button>
        <div class="lightbox-caption"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const lightboxImg = modal.querySelector<HTMLImageElement>('.lightbox-img')!;
  const lightboxCaption = modal.querySelector<HTMLElement>('.lightbox-caption')!;
  const backdrop = modal.querySelector<HTMLElement>('.lightbox-backdrop')!;
  const closeBtn = modal.querySelector<HTMLElement>('.lightbox-close')!;

  const closeModal = () => {
    modal?.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  const openModal = (img: HTMLImageElement) => {
    const figure = img.closest('figure');
    const figcaption = figure?.querySelector('figcaption');
    
    // Use currentSrc or src
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || '';
    if (figcaption) {
      lightboxCaption.innerHTML = figcaption.innerHTML;
      lightboxCaption.style.display = 'block';
    } else {
      lightboxCaption.style.display = 'none';
    }

    modal?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  zoomableImages.forEach((img) => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => openModal(img));
  });

  backdrop.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal || (e.target as HTMLElement).classList.contains('lightbox-content')) {
      closeModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('is-open')) {
      closeModal();
    }
  });
}
