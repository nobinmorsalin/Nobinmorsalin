/* Non-blocking rotating hero message rail. External logos load after the page is usable. */
(() => {
  'use strict';
  const messages = [
    ['Node.js', 'https://api.iconify.design/logos:nodejs-icon.svg', 'BUILD MODE', 'Fast & clean development'],
    ['Laravel', 'https://api.iconify.design/logos:laravel.svg', 'SYSTEM MODE', 'Scalable web applications'],
    ['API', 'https://api.iconify.design/mdi:api.svg?color=%2300ffc4', 'INTEGRATION MODE', 'APIs & automation that connect'],
    ['Figma', 'https://api.iconify.design/logos:figma.svg', 'DESIGN MODE', 'Premium UI/UX experiences'],
    ['Canva', 'https://api.iconify.design/logos:canva.svg', 'CREATIVE MODE', 'Posters, brands & visual content'],
    ['CapCut', 'https://api.iconify.design/logos:capcut.svg', 'MOTION MODE', 'Video editing & motion design']
  ];

  function init() {
    const rail = document.getElementById('heroLiveRail');
    if (!rail || rail.dataset.ready === 'true') return;
    rail.dataset.ready = 'true';
    const item = rail.querySelector('.hero-live-item');
    const logo = rail.querySelector('.hero-live-logo');
    const kicker = rail.querySelector('.hero-live-kicker');
    const text = rail.querySelector('.hero-live-text');
    const progress = rail.querySelector('.hero-live-progress');
    if (!item || !logo || !kicker || !text || !progress) return;

    let index = 0;
    let timer = 0;
    const show = () => {
      item.classList.remove('is-visible');
      progress.style.animation = 'none';
      void progress.offsetWidth;
      const [name, src, label, copy] = messages[index];
      logo.alt = `${name} logo`;
      logo.src = src;
      logo.onerror = () => { logo.removeAttribute('src'); logo.alt = name; };
      kicker.textContent = label;
      text.textContent = copy;
      requestAnimationFrame(() => item.classList.add('is-visible'));
      progress.style.animation = 'heroLiveProgress 3.2s linear forwards';
      index = (index + 1) % messages.length;
      timer = window.setTimeout(show, 3400);
    };
    show();
    window.addEventListener('pagehide', () => window.clearTimeout(timer), { once: true });
  }

  const start = () => window.setTimeout(init, 0);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
