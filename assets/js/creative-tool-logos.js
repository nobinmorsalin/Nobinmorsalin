/* Authentic creative-tool brand logos. Non-blocking enhancement with resilient fallbacks. */
(() => {
  'use strict';

  const BRAND_LOGOS = {
    'Adobe Premiere Pro': ['https://api.iconify.design/logos:adobe-premiere.svg'],
    'After Effects': ['https://api.iconify.design/logos:adobe-after-effects.svg'],
    'Adobe Photoshop': ['https://api.iconify.design/logos:adobe-photoshop.svg'],
    'Adobe Illustrator': ['https://api.iconify.design/logos:adobe-illustrator.svg'],
    'Figma': ['https://api.iconify.design/logos:figma.svg'],
    'Canva': [
      'https://cdn.jsdelivr.net/gh/callback-io/allogo@main/public/logos/canva/icon.svg',
      'https://api.iconify.design/logos:canva.svg'
    ],
    'CapCut': [
      'https://svgicons.com/img/2983/capcut.svg',
      'https://api.iconify.design/logos:capcut.svg'
    ]
  };

  const LIGHT_LOGO_NAMES = new Set(['CapCut']);

  function enhance(root = document) {
    root.querySelectorAll('.fse-creative-tool img[alt$=" logo"]').forEach(img => {
      const name = img.alt.replace(/ logo$/, '');
      const urls = BRAND_LOGOS[name];
      if (!urls || img.dataset.brandLogoApplied === 'true') return;

      const fallback = img.currentSrc || img.src;
      img.dataset.brandLogoApplied = 'true';
      img.dataset.brandLogoFallback = fallback;
      img.dataset.brandLogoIndex = '0';

      if (LIGHT_LOGO_NAMES.has(name)) {
        img.style.filter = 'brightness(0) invert(1)';
      }

      const tryNext = () => {
        const nextIndex = Number(img.dataset.brandLogoIndex || '0') + 1;
        if (nextIndex < urls.length) {
          img.dataset.brandLogoIndex = String(nextIndex);
          img.src = urls[nextIndex];
          return;
        }

        const previous = img.dataset.brandLogoFallback;
        if (previous && img.src !== previous) {
          img.src = previous;
        }
        img.style.filter = '';
      };

      img.addEventListener('error', tryNext);
      img.src = urls[0];
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
