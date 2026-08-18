/* Premium client presentation layer.
 * Keeps Admin/PortfolioData as source of truth.
 * Client cards open the in-site detail modal instead of navigating away.
 * Adds a dark premium logo stage and removes near-white logo backgrounds
 * client-side when the uploaded image permits canvas processing.
 */
(() => {
  'use strict';

  const STYLE_ID = 'premium-client-presentation-v3';
  const processedLogoCache = new Map();

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #clients .clients-marquee {
        overflow: hidden;
        padding: 18px 0 34px;
      }

      #clients .clients-track {
        align-items: stretch;
        will-change: transform;
      }

      #clients .client-card.premium-client-card {
        position: relative;
        display: flex;
        flex: 0 0 clamp(285px, 27vw, 360px);
        width: clamp(285px, 27vw, 360px);
        min-height: 285px;
        flex-direction: column;
        justify-content: space-between;
        overflow: hidden;
        padding: 0;
        border: 1px solid rgba(255,255,255,.085);
        border-radius: 24px;
        background:
          radial-gradient(circle at 82% 12%, rgba(0,255,196,.095), transparent 31%),
          radial-gradient(circle at 15% 35%, rgba(255,255,255,.035), transparent 28%),
          linear-gradient(145deg, #11191d 0%, #0b1115 56%, #080d11 100%);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.055),
          0 22px 55px rgba(0,0,0,.26);
        color: inherit;
        text-decoration: none;
        cursor: pointer;
        outline: none;
        isolation: isolate;
        transition: transform .38s cubic-bezier(.2,.7,.2,1),
                    border-color .38s ease,
                    box-shadow .38s ease;
      }

      #clients .client-card.premium-client-card::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: -1;
        border-radius: inherit;
        background: linear-gradient(120deg, rgba(0,255,196,.055), transparent 35%, transparent 72%, rgba(255,255,255,.025));
        pointer-events: none;
      }

      #clients .client-card.premium-client-card::after {
        content: '';
        position: absolute;
        left: 18px;
        right: 18px;
        bottom: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(0,255,196,.55), transparent);
        opacity: .35;
        pointer-events: none;
      }

      #clients .client-card.premium-client-card:hover,
      #clients .client-card.premium-client-card:focus-visible {
        transform: translateY(-7px);
        border-color: rgba(0,255,196,.30);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.075),
          0 28px 68px rgba(0,0,0,.34),
          0 0 34px rgba(0,255,196,.075);
      }

      #clients .client-card.premium-client-card .client-visual {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 166px;
        min-height: 166px;
        padding: 30px 30px 20px;
        box-sizing: border-box;
        overflow: hidden;
        border-bottom: 1px solid rgba(255,255,255,.055);
        background:
          radial-gradient(circle at 50% 50%, rgba(255,255,255,.035), transparent 43%),
          linear-gradient(180deg, rgba(255,255,255,.018), rgba(0,0,0,.08));
      }

      #clients .client-card.premium-client-card .client-visual::before {
        content: '';
        position: absolute;
        width: 150px;
        height: 150px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0,255,196,.065), transparent 68%);
        filter: blur(4px);
        pointer-events: none;
      }

      #clients .client-card.premium-client-card .client-visual::after {
        content: 'CLIENT';
        position: absolute;
        top: 17px;
        left: 22px;
        color: rgba(190,210,214,.38);
        font: 600 9px/1 var(--font-mono, 'JetBrains Mono', monospace);
        letter-spacing: .18em;
      }

      #clients .client-card.premium-client-card .client-logo {
        position: relative;
        z-index: 1;
        display: block;
        width: auto;
        height: auto;
        max-width: 180px;
        max-height: 82px;
        object-fit: contain;
        object-position: center;
        opacity: .98;
        filter: drop-shadow(0 10px 24px rgba(0,0,0,.24));
        mix-blend-mode: normal;
        transition: transform .38s cubic-bezier(.2,.7,.2,1), filter .38s ease, opacity .38s ease;
      }

      #clients .client-card.premium-client-card:hover .client-logo,
      #clients .client-card.premium-client-card:focus-visible .client-logo {
        transform: scale(1.045);
        filter: drop-shadow(0 12px 28px rgba(0,255,196,.12));
        opacity: 1;
      }

      #clients .client-card.premium-client-card .client-logo-fallback {
        position: relative;
        z-index: 1;
        width: 68px;
        height: 68px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(0,255,196,.18);
        border-radius: 20px;
        color: #f3f7f8;
        background: linear-gradient(145deg, rgba(255,255,255,.08), rgba(0,255,196,.06));
        box-shadow: 0 14px 34px rgba(0,0,0,.22);
        font: 800 1.45rem/1 var(--font-head, Inter, sans-serif);
      }

      #clients .client-card.premium-client-card .client-info {
        position: relative;
        z-index: 2;
        min-height: 118px;
        padding: 20px 22px 21px;
        box-sizing: border-box;
        background: linear-gradient(180deg, rgba(255,255,255,.012), rgba(0,0,0,.10));
      }

      #clients .client-card.premium-client-card .client-info::after {
        content: 'VIEW CASE STUDY  ↗';
        position: absolute;
        right: 22px;
        bottom: 20px;
        color: rgba(0,255,196,.68);
        font: 600 8px/1 var(--font-mono, 'JetBrains Mono', monospace);
        letter-spacing: .09em;
        opacity: 0;
        transform: translateX(5px);
        transition: opacity .3s ease, transform .3s ease;
      }

      #clients .client-card.premium-client-card:hover .client-info::after,
      #clients .client-card.premium-client-card:focus-visible .client-info::after {
        opacity: 1;
        transform: translateX(0);
      }

      #clients .client-card.premium-client-card .client-name {
        padding-right: 125px;
        color: #f2f6f7;
        font: 700 clamp(1rem, 1.5vw, 1.12rem)/1.25 var(--font-head, Inter, sans-serif);
        letter-spacing: -.015em;
      }

      #clients .client-card.premium-client-card .client-service {
        max-width: 92%;
        margin-top: 8px;
        color: rgba(215,226,229,.62);
        font: 500 .78rem/1.55 var(--font-body, Inter, sans-serif);
      }

      @media (max-width: 900px) {
        #clients .client-card.premium-client-card {
          flex-basis: 320px;
          width: 320px;
        }
      }

      @media (max-width: 680px) {
        #clients .clients-marquee { padding: 12px 0 28px; }
        #clients .client-card.premium-client-card {
          flex-basis: min(82vw, 320px);
          width: min(82vw, 320px);
          min-height: 250px;
          border-radius: 21px;
        }
        #clients .client-card.premium-client-card .client-visual {
          height: 142px;
          min-height: 142px;
          padding: 28px 22px 16px;
        }
        #clients .client-card.premium-client-card .client-logo {
          max-width: 155px;
          max-height: 70px;
        }
        #clients .client-card.premium-client-card .client-info {
          min-height: 108px;
          padding: 17px 17px 18px;
        }
        #clients .client-card.premium-client-card .client-name {
          padding-right: 0;
          font-size: 1rem;
        }
        #clients .client-card.premium-client-card .client-service {
          max-width: 100%;
          padding-right: 0;
          margin-top: 7px;
        }
        #clients .client-card.premium-client-card .client-info::after {
          display: none;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #clients .client-card.premium-client-card,
        #clients .client-card.premium-client-card .client-logo {
          transition: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function stripNearWhiteBackground(image) {
    return new Promise((resolve) => {
      if (!image?.src) return resolve(null);
      const source = image.currentSrc || image.src;
      if (!source || source.startsWith('data:')) return resolve(null);
      if (processedLogoCache.has(source)) return resolve(processedLogoCache.get(source));

      const work = () => {
        try {
          const width = image.naturalWidth;
          const height = image.naturalHeight;
          if (!width || !height || width > 1800 || height > 1800) return resolve(null);

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) return resolve(null);
          ctx.drawImage(image, 0, 0, width, height);
          const pixels = ctx.getImageData(0, 0, width, height);
          const data = pixels.data;
          let changed = 0;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            if (a === 0) continue;

            // Preserve real logo colors; only remove pixels that are essentially white.
            const min = Math.min(r, g, b);
            const max = Math.max(r, g, b);
            if (r > 238 && g > 238 && b > 238) {
              data[i + 3] = 0;
              changed++;
            } else if (min > 220 && max - min < 18) {
              data[i + 3] = Math.max(0, Math.round(a * .12));
              changed++;
            }
          }

          if (!changed) return resolve(null);
          ctx.putImageData(pixels, 0, 0);
          const result = canvas.toDataURL('image/png');
          processedLogoCache.set(source, result);
          resolve(result);
        } catch (_) {
          // Cross-origin images without CORS support stay untouched.
          resolve(null);
        }
      };

      if (image.complete && image.naturalWidth) work();
      else image.addEventListener('load', work, { once: true });
    });
  }

  function enhanceLogos() {
    const root = document.getElementById('clientsGrid');
    if (!root) return;
    root.querySelectorAll('.client-card .client-logo').forEach((image) => {
      if (image.dataset.logoEnhanced === '1') return;
      image.dataset.logoEnhanced = '1';
      image.crossOrigin = 'anonymous';
      stripNearWhiteBackground(image).then((transparentSrc) => {
        if (transparentSrc) image.src = transparentSrc;
      });
    });
  }

  function normalizeCards() {
    const root = document.getElementById('clientsGrid');
    if (!root) return;

    root.querySelectorAll('.client-card').forEach((card) => {
      if (card.tagName === 'A') {
        const replacement = document.createElement('article');
        for (const attr of Array.from(card.attributes)) {
          replacement.setAttribute(attr.name, attr.value);
        }
        replacement.removeAttribute('href');
        replacement.removeAttribute('target');
        replacement.removeAttribute('rel');
        replacement.innerHTML = card.innerHTML;
        replacement.classList.add('premium-client-card');
        replacement.setAttribute('tabindex', '0');
        replacement.setAttribute('role', 'button');
        const name = replacement.querySelector('.client-name')?.textContent?.trim() || 'client';
        replacement.setAttribute('aria-label', `View ${name} details`);
        card.replaceWith(replacement);
      } else {
        card.classList.add('premium-client-card');
        if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
        if (!card.hasAttribute('role')) card.setAttribute('role', 'button');
        const name = card.querySelector('.client-name')?.textContent?.trim() || 'client';
        card.setAttribute('aria-label', `View ${name} details`);
      }
    });

    enhanceLogos();
  }

  function bind() {
    installStyles();
    normalizeCards();
  }

  window.addEventListener('portfolio:data-ready', () => setTimeout(bind, 0));
  window.addEventListener('load', () => setTimeout(bind, 80));
  setTimeout(bind, 150);
  setTimeout(bind, 500);
  setTimeout(bind, 1200);

  let observerTimer = null;
  const observer = new MutationObserver(() => {
    clearTimeout(observerTimer);
    observerTimer = setTimeout(bind, 60);
  });

  const startObserver = () => {
    const root = document.getElementById('clientsGrid');
    if (root) observer.observe(root, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver, { once: true });
  } else {
    startObserver();
  }
})();
