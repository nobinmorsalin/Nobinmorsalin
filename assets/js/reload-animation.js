/* =========================================================
   NOBIN MORSALIN — PREMIUM PAGE RELOAD CONTROLLER
   ========================================================= */
(function () {
  'use strict';

  const loader = document.getElementById('pageLoader');

  const loadLogoEnhancer = () => {
    if (document.getElementById('fse-logo-enhancer-script')) return;
    const enhancer = document.createElement('script');
    enhancer.id = 'fse-logo-enhancer-script';
    enhancer.src = 'assets/js/fullstack-logo-enhancer.js?v=1.0.0';
    enhancer.async = true;
    enhancer.onerror = () => enhancer.remove();
    document.head.appendChild(enhancer);
  };

  const loadEcosystem = () => {
    // Load the additive capability section only after the initial page load
    // has completed. This keeps third-party ecosystem assets out of the
    // critical loading path and prevents them from delaying the portfolio.
    if (document.getElementById('fse-ecosystem-script')) return;
    const ecosystem = document.createElement('script');
    ecosystem.id = 'fse-ecosystem-script';
    ecosystem.src = 'assets/js/fullstack-ecosystem.js?v=1.0.0';
    ecosystem.async = true;
    ecosystem.onload = loadLogoEnhancer;
    ecosystem.onerror = () => ecosystem.remove();
    document.head.appendChild(ecosystem);
  };

  if (!loader) {
    if (document.readyState === 'complete') loadEcosystem();
    else window.addEventListener('load', loadEcosystem, { once: true });
    return;
  }

  const reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hide = () => {
    loader.classList.add('is-hidden');
    window.setTimeout(() => loader.remove(), reduceMotion ? 250 : 650);
  };

  const minimumVisible = reduceMotion ? 180 : 720;
  const startedAt = performance.now();

  const finish = () => {
    const remaining = Math.max(0, minimumVisible - (performance.now() - startedAt));
    window.setTimeout(() => {
      hide();
      // The main portfolio is already loaded and visible before the optional
      // ecosystem module starts, so icon/CDN failures cannot block the page.
      loadEcosystem();
    }, remaining);
  };

  if (document.readyState === 'complete') {
    finish();
  } else {
    window.addEventListener('load', finish, { once: true });
  }

  // Safety net: the page loader can never remain visible indefinitely.
  window.setTimeout(() => {
    hide();
    loadEcosystem();
  }, 2200);
})();
