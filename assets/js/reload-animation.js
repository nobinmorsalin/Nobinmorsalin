/* =========================================================
   NOBIN MORSALIN — PREMIUM PAGE RELOAD CONTROLLER
   ========================================================= */
(function () {
  'use strict';

  const loader = document.getElementById('pageLoader');
  if (!loader) return;

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
    window.setTimeout(hide, remaining);
  };

  if (document.readyState === 'complete') {
    finish();
  } else {
    window.addEventListener('load', finish, { once: true });
  }

  window.setTimeout(hide, 2200);
})();
