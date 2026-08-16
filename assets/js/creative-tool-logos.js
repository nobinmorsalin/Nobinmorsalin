/* Authentic creative-tool brand logos. Non-blocking enhancement with existing-logo fallback. */
(() => {
  'use strict';

  const BRAND_LOGOS = {
    'Adobe Premiere Pro': 'https://api.iconify.design/logos:adobe-premiere.svg',
    'After Effects': 'https://api.iconify.design/logos:adobe-after-effects.svg',
    'Adobe Photoshop': 'https://api.iconify.design/logos:adobe-photoshop.svg',
    'Adobe Illustrator': 'https://api.iconify.design/logos:adobe-illustrator.svg',
    'Figma': 'https://api.iconify.design/logos:figma.svg',
    'Canva': 'https://api.iconify.design/logos:canva.svg',
    'CapCut': 'https://api.iconify.design/logos:capcut.svg'
  };

  function enhance(root = document) {
    root.querySelectorAll('.fse-creative-tool img[alt$=" logo"]').forEach(img => {
      const name = img.alt.replace(/ logo$/, '');
      const url = BRAND_LOGOS[name];
      if (!url || img.dataset.brandLogoApplied === 'true') return;

      const fallback = img.currentSrc || img.src;
      img.dataset.brandLogoApplied = 'true';
      img.dataset.brandLogoFallback = fallback;
      img.src = url;
      img.addEventListener('error', () => {
        const previous = img.dataset.brandLogoFallback;
        if (previous && img.src !== previous) {
          img.src = previous;
        }
      }, { once: true });
    });
  }

  const start = () => {
    enhance();
    const observer = new MutationObserver(() => enhance());
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 15000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
