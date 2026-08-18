/* Premium client-logo fitting: trims transparent/near-white canvas padding
 * so every uploaded client logo gets the same visual scale without distortion.
 */
(() => {
  'use strict';

  const STYLE_ID = 'client-logo-fit-v1';
  const cache = new Map();

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #clients .client-card.premium-client-card .client-logo {
        width: auto !important;
        height: auto !important;
        max-width: 180px !important;
        max-height: 82px !important;
        object-fit: contain !important;
        object-position: center !important;
      }
      @media (max-width: 680px) {
        #clients .client-card.premium-client-card .client-logo {
          max-width: 140px !important;
          max-height: 64px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function fitLogo(image) {
    if (!image || image.dataset.logoFit === '1') return;
    const source = image.currentSrc || image.src;
    if (!source || source.startsWith('data:')) return;
    image.dataset.logoFit = '1';

    const process = () => {
      try {
        const w = image.naturalWidth;
        const h = image.naturalHeight;
        if (!w || !h || w > 2400 || h > 2400) return;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(image, 0, 0, w, h);

        const pixels = ctx.getImageData(0, 0, w, h).data;
        let minX = w, minY = h, maxX = -1, maxY = -1;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const a = pixels[i + 3];
            const nearWhite = r > 238 && g > 238 && b > 238;
            if (a > 18 && !nearWhite) {
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
            }
          }
        }

        if (maxX < 0 || maxY < 0) return;

        // Keep a small breathing margin around the real logo.
        const padX = Math.max(2, Math.round((maxX - minX + 1) * 0.08));
        const padY = Math.max(2, Math.round((maxY - minY + 1) * 0.08));
        const sx = Math.max(0, minX - padX);
        const sy = Math.max(0, minY - padY);
        const ex = Math.min(w - 1, maxX + padX);
        const ey = Math.min(h - 1, maxY + padY);
        const sw = ex - sx + 1;
        const sh = ey - sy + 1;

        // Avoid replacing images that are already tightly cropped.
        if (sw > w * 0.92 && sh > h * 0.92) return;

        const out = document.createElement('canvas');
        out.width = sw;
        out.height = sh;
        const outCtx = out.getContext('2d');
        if (!outCtx) return;
        outCtx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
        const result = out.toDataURL('image/png');
        cache.set(source, result);
        image.src = result;
      } catch (_) {
        // Cross-origin images without CORS support remain unchanged.
      }
    };

    if (image.complete && image.naturalWidth) process();
    else image.addEventListener('load', process, { once: true });
  }

  function scan() {
    installStyles();
    document.querySelectorAll('#clients .client-card.premium-client-card .client-logo').forEach(fitLogo);
  }

  window.addEventListener('load', () => setTimeout(scan, 100));
  window.addEventListener('portfolio:data-ready', () => setTimeout(scan, 100));
  setTimeout(scan, 400);
  setTimeout(scan, 1200);

  const observer = new MutationObserver(() => setTimeout(scan, 80));
  const start = () => {
    const root = document.getElementById('clientsGrid');
    if (root) observer.observe(root, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
