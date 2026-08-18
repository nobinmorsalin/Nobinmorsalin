/* Single-client marquee guard: never show a visual clone when only one logical client exists. */
(() => {
  'use strict';

  const STYLE_ID = 'client-single-fix-v1';
  let timer = null;

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #clients .clients-track.single-client {
        animation: none !important;
        transform: none !important;
        justify-content: center !important;
      }
      #clients .clients-track.single-client .client-chain-link {
        display: none !important;
      }
      #clients .clients-track.single-client .client-card {
        margin-inline: auto;
      }
    `;
    document.head.appendChild(style);
  }

  function sync() {
    const root = document.getElementById('clientsGrid');
    const data = window.PortfolioData?.get?.('clients');
    if (!root || !Array.isArray(data)) return;

    const visible = data.filter((client) => client && client.visible !== false && client.active !== false);
    const cards = Array.from(root.querySelectorAll('.client-card'));

    if (visible.length === 1) {
      // renderClients creates a second DOM copy for marquee continuity; with one
      // logical client that would visibly show the same client twice, so keep one.
      cards.slice(1).forEach((card) => card.remove());
      root.classList.add('single-client');
      root.dataset.logicalClientCount = '1';
      return;
    }

    root.classList.remove('single-client');
    root.dataset.logicalClientCount = String(visible.length);
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(sync, 0);
  }

  installStyles();
  schedule();
  window.addEventListener('portfolio:data-ready', schedule);
  window.addEventListener('load', schedule, { once: true });

  const observe = () => {
    const root = document.getElementById('clientsGrid');
    if (!root) return;
    new MutationObserver(schedule).observe(root, { childList: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observe, { once: true });
  } else {
    observe();
  }
})();
