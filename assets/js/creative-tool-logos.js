/* Authentic creative-tool brand logos + lightweight live hero showcase. */
(() => {
  'use strict';

  const BRAND_LOGOS = {
    'Adobe Premiere Pro': ['https://api.iconify.design/logos:adobe-premiere.svg'],
    'After Effects': ['https://api.iconify.design/logos:adobe-after-effects.svg'],
    'Adobe Photoshop': ['https://api.iconify.design/logos:adobe-photoshop.svg'],
    'Adobe Illustrator': ['https://api.iconify.design/logos:adobe-illustrator.svg'],
    'Figma': ['https://api.iconify.design/logos:figma.svg'],
    'Canva': [
      'https://cdn.simpleicons.org/canva',
      'https://api.iconify.design/logos:canva.svg',
      'https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/canva.svg'
    ],
    'CapCut': [
      'https://cdn.simpleicons.org/capcut/ffffff',
      'https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/capcut.svg',
      'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/capcut/default.svg',
      'https://api.iconify.design/logos:capcut.svg'
    ]
  };

  const HERO_MESSAGES = [
    ['Node.js', 'https://api.iconify.design/logos:nodejs-icon.svg', 'BUILD MODE', 'Fast & clean development'],
    ['Laravel', 'https://api.iconify.design/logos:laravel.svg', 'SYSTEM MODE', 'Scalable web applications'],
    ['API', 'https://api.iconify.design/mdi:api.svg?color=%2300ffc4', 'INTEGRATION MODE', 'APIs & automation that connect'],
    ['Figma', 'https://api.iconify.design/logos:figma.svg', 'DESIGN MODE', 'Premium UI/UX experiences'],
    ['Canva', 'https://cdn.simpleicons.org/canva', 'CREATIVE MODE', 'Posters, brands & visual content'],
    ['CapCut', 'https://cdn.simpleicons.org/capcut/ffffff', 'MOTION MODE', 'Video editing & motion design']
  ];

  function enhance(root = document) {
    root.querySelectorAll('.fse-creative-tool img[alt$=" logo"]').forEach(img => {
      const name = img.alt.replace(/ logo$/, '');
      const urls = BRAND_LOGOS[name];
      if (!urls || img.dataset.brandLogoApplied === 'true') return;

      const fallback = img.currentSrc || img.src;
      img.dataset.brandLogoApplied = 'true';
      img.dataset.brandLogoFallback = fallback;
      img.dataset.brandLogoIndex = '0';

      const tryNext = () => {
        const nextIndex = Number(img.dataset.brandLogoIndex || '0') + 1;
        if (nextIndex < urls.length) {
          img.dataset.brandLogoIndex = String(nextIndex);
          img.src = urls[nextIndex];
          return;
        }
        const previous = img.dataset.brandLogoFallback;
        if (previous && img.src !== previous) img.src = previous;
      };

      img.addEventListener('error', tryNext);
      img.src = urls[0];
    });
  }

  function injectHeroRail() {
    if (document.getElementById('heroLiveRail')) return;
    const visual = document.querySelector('.hero-visual');
    if (!visual) return;

    const rail = document.createElement('div');
    rail.id = 'heroLiveRail';
    rail.className = 'hero-live-rail';
    rail.setAttribute('aria-live', 'polite');
    rail.innerHTML = `
      <div class="hero-live-item">
        <img class="hero-live-logo" alt="Technology logo" decoding="async" referrerpolicy="no-referrer">
        <div class="hero-live-copy">
          <div class="hero-live-kicker"></div>
          <div class="hero-live-text"></div>
        </div>
      </div>
      <div class="hero-live-progress" aria-hidden="true"></div>
    `;
    visual.appendChild(rail);

    const item = rail.querySelector('.hero-live-item');
    const logo = rail.querySelector('.hero-live-logo');
    const kicker = rail.querySelector('.hero-live-kicker');
    const text = rail.querySelector('.hero-live-text');
    const progress = rail.querySelector('.hero-live-progress');
    let index = 0;
    let timer = 0;

    const show = () => {
      item.classList.remove('is-visible');
      progress.style.animation = 'none';
      void progress.offsetWidth;
      const [name, src, label, copy] = HERO_MESSAGES[index];
      logo.alt = `${name} logo`;
      logo.src = src;
      logo.onerror = () => { logo.removeAttribute('src'); logo.alt = name; };
      kicker.textContent = label;
      text.textContent = copy;
      requestAnimationFrame(() => item.classList.add('is-visible'));
      progress.style.animation = 'heroLiveProgress 3.2s linear forwards';
      index = (index + 1) % HERO_MESSAGES.length;
      timer = window.setTimeout(show, 3400);
    };
    show();
    window.addEventListener('pagehide', () => window.clearTimeout(timer), { once: true });
  }

  function injectHeroStyles() {
    if (document.getElementById('heroLiveStyles')) return;
    const style = document.createElement('style');
    style.id = 'heroLiveStyles';
    style.textContent = `
      .hero-live-rail{position:relative;width:min(100%,620px);min-height:78px;margin-top:26px;display:flex;align-items:center;overflow:hidden;border:1px solid rgba(0,255,196,.14);border-radius:16px;background:linear-gradient(135deg,rgba(8,18,22,.82),rgba(8,12,17,.56));box-shadow:inset 0 1px rgba(255,255,255,.035),0 14px 40px rgba(0,0,0,.16);backdrop-filter:blur(12px)}
      .hero-live-rail:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,255,196,.06),transparent 38%,rgba(77,124,255,.035));pointer-events:none}
      .hero-live-item{position:relative;z-index:1;display:flex;align-items:center;gap:13px;width:100%;padding:14px 18px;opacity:0;transform:translateY(10px);transition:opacity .38s ease,transform .38s ease}.hero-live-item.is-visible{opacity:1;transform:translateY(0)}
      .hero-live-logo{width:38px;height:38px;flex:0 0 38px;object-fit:contain;border-radius:10px;filter:drop-shadow(0 0 10px rgba(0,255,196,.16));animation:heroLogoPulse 2.4s ease-in-out infinite}
      .hero-live-copy{min-width:0}.hero-live-kicker{display:flex;align-items:center;gap:7px;margin-bottom:3px;color:rgba(0,255,196,.78);font:500 10px/1.2 'JetBrains Mono',monospace;letter-spacing:.12em;text-transform:uppercase}.hero-live-kicker:before{content:"";width:6px;height:6px;border-radius:50%;background:#00ffc4;box-shadow:0 0 12px #00ffc4;animation:heroDotPulse 1.4s ease-in-out infinite}
      .hero-live-text{color:#e9f1f4;font:600 clamp(14px,1.3vw,18px)/1.3 'Inter',sans-serif;letter-spacing:-.01em}.hero-live-progress{position:absolute;left:0;bottom:0;height:2px;width:0;background:linear-gradient(90deg,#00ffc4,#22d3ee);box-shadow:0 0 12px rgba(0,255,196,.45)}
      @keyframes heroLiveProgress{from{width:0}to{width:100%}}@keyframes heroLogoPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.055)}}@keyframes heroDotPulse{0%,100%{opacity:.55;transform:scale(.8)}50%{opacity:1;transform:scale(1.15)}}
      @media(max-width:900px){.hero-live-rail{width:100%;margin-top:20px;min-height:70px}.hero-live-item{padding:12px 14px;gap:11px}.hero-live-logo{width:34px;height:34px;flex-basis:34px}}
      @media(max-width:600px){.hero-live-rail{margin-top:16px;border-radius:13px;min-height:66px}.hero-live-item{padding:11px 12px}.hero-live-logo{width:30px;height:30px;flex-basis:30px}.hero-live-kicker{font-size:9px}.hero-live-text{font-size:14px}}
      @media(prefers-reduced-motion:reduce){.hero-live-item{transition:none}.hero-live-logo,.hero-live-kicker:before{animation:none}.hero-live-progress{width:100%!important}}
    `;
    document.head.appendChild(style);
  }

  const start = () => {
    enhance();
    injectHeroStyles();
    injectHeroRail();
    const observer = new MutationObserver(() => enhance());
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 15000);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
