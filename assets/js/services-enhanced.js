/*
 * NOBIN MORSALIN — SERVICES CAROUSEL
 * One-card-at-a-time autoplay with a seamless loop.
 * Desktop + mobile responsive. View All disables autoplay while expanded.
 */
(function () {
  'use strict';

  const STEP_DELAY = 3000;
  const TRANSITION_MS = 700;
  const STYLE_ID = 'services-sequential-style-v3';

  let timer = null;
  let resizeTimer = null;
  let index = 0;
  let itemCount = 0;
  let running = false;
  let renderLock = false;
  let sectionObserver = null;

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function safeUrl(value) {
    const v = String(value || '').trim();
    return /^(https?:\/\/|\/|#|mailto:)/i.test(v) ? v : '';
  }

  function elements() {
    const section = document.getElementById('services');
    const track = document.getElementById('servicesGrid');
    const viewport = section?.querySelector('.services-marquee');
    return { section, track, viewport };
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #services .services-marquee {
        position: relative;
        width: 100%;
        max-width: 100%;
        overflow: hidden;
      }

      #services .services-track-sequential {
        display: flex !important;
        flex-wrap: nowrap !important;
        align-items: stretch !important;
        gap: 24px !important;
        width: max-content !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 0 24px 10px !important;
        animation: none !important;
        will-change: transform;
        transform: translate3d(0,0,0);
        transition: transform ${TRANSITION_MS}ms cubic-bezier(.22,.61,.36,1);
      }

      #services .services-track-sequential .professional-service-card {
        flex: 0 0 clamp(280px, 28vw, 320px) !important;
        width: clamp(280px, 28vw, 320px) !important;
        min-width: clamp(280px, 28vw, 320px) !important;
        max-width: 320px !important;
      }

      #services .professional-service-card .service-image {
        width: 100%;
        aspect-ratio: 16 / 10;
        overflow: hidden;
        border-radius: 18px;
        margin-bottom: 18px;
        background: rgba(255,255,255,.04);
      }

      #services .professional-service-card .service-image img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      #services .service-icon { display: none !important; }

      #services.marquee-expanded .services-track-sequential {
        transform: none !important;
        transition: none !important;
      }

      @media (max-width: 680px) {
        #services .services-track-sequential {
          gap: 14px !important;
          padding: 0 16px 10px !important;
        }

        #services .services-track-sequential .professional-service-card {
          flex-basis: calc(100vw - 48px) !important;
          width: calc(100vw - 48px) !important;
          min-width: calc(100vw - 48px) !important;
          max-width: none !important;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #services .services-track-sequential {
          transition: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function clearTimer() {
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
  }

  function isExpanded() {
    return elements().section?.classList.contains('marquee-expanded') === true;
  }

  function getStep(track) {
    const card = track?.querySelector('.professional-service-card');
    if (!card) return 0;
    const gap = parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap || '0') || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function moveTo(nextIndex, animated) {
    const { track } = elements();
    if (!track) return;

    const step = getStep(track);
    if (!step) return;

    track.style.transition = animated
      ? `transform ${TRANSITION_MS}ms cubic-bezier(.22,.61,.36,1)`
      : 'none';
    track.style.transform = `translate3d(${-nextIndex * step}px, 0, 0)`;
  }

  function schedule() {
    clearTimer();
    if (!running || isExpanded() || itemCount <= 1) return;

    timer = window.setTimeout(() => {
      if (!running || isExpanded() || itemCount <= 1) return;

      index += 1;

      /*
       * We render two copies. The first item of the second copy is exactly
       * one full catalogue length away, so after the last real item is shown
       * we can jump back to zero invisibly and continue forever.
       */
      if (index > itemCount) {
        index = 0;
        moveTo(0, false);
        window.requestAnimationFrame(() => schedule());
        return;
      }

      moveTo(index, true);

      if (index === itemCount) {
        window.setTimeout(() => {
          if (!running || isExpanded()) return;
          index = 0;
          moveTo(0, false);
          schedule();
        }, TRANSITION_MS + 60);
      } else {
        schedule();
      }
    }, STEP_DELAY);
  }

  function start() {
    running = true;
    schedule();
  }

  function stop() {
    running = false;
    clearTimer();
  }

  function applyCurrentPosition() {
    if (isExpanded()) {
      moveTo(0, false);
      return;
    }
    index = Math.max(0, Math.min(index, itemCount));
    moveTo(index, false);
  }

  function buildCard(service) {
    const image = safeUrl(service.image) || '/assets/images/service-placeholder.svg';
    const name = service.name || service.title || 'Service';
    const short = service.desc || service.shortDescription || service.description || '';

    return `
      <article class="service-card professional-service-card">
        <div class="service-image">
          <img
            src="${esc(image)}"
            alt="${esc(name)}"
            loading="lazy"
            decoding="async"
            draggable="false"
            onerror="this.onerror=null;this.src='/assets/images/service-placeholder.svg'"
          />
        </div>
        <h3 class="service-title">${esc(name)}</h3>
        <p class="service-desc">${esc(short)}</p>
      </article>
    `;
  }

  function getVisibleServices() {
    if (!window.PortfolioData || typeof window.PortfolioData.get !== 'function') return [];

    const services = window.PortfolioData.get('services');
    if (!Array.isArray(services)) return [];

    return services
      .filter(Boolean)
      .filter(service => service.visible !== false && service.active !== false)
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }

  function setupTrack() {
    const { track } = elements();
    if (!track) return;

    track.classList.add('services-track-sequential');
    track.dataset.marqueeReady = 'true';
  }

  function render() {
    if (renderLock) return;
    renderLock = true;

    installStyles();
    clearTimer();

    const { section, track, viewport } = elements();
    if (!section || !track || !viewport) {
      renderLock = false;
      return;
    }

    const services = getVisibleServices();
    itemCount = services.length;
    index = 0;

    if (!itemCount) {
      track.innerHTML = '';
      stop();
      renderLock = false;
      return;
    }

    const firstCopy = services.map(buildCard).join('');
    const secondCopy = services.map(buildCard).join('');

    /* Two copies = seamless reset after every service has been shown. */
    track.innerHTML = firstCopy + secondCopy;
    setupTrack();
    moveTo(0, false);

    renderLock = false;

    if (!section.classList.contains('marquee-expanded')) start();
  }

  function observeExpandedState() {
    const { section, track } = elements();
    if (!section || !track || sectionObserver) return;

    sectionObserver = new MutationObserver(() => {
      if (section.classList.contains('marquee-expanded')) {
        stop();
        index = 0;
        moveTo(0, false);
      } else {
        index = 0;
        moveTo(0, false);
        start();
      }
    });

    sectionObserver.observe(section, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  function init() {
    installStyles();
    render();
    observeExpandedState();

    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        applyCurrentPosition();
      }, 120);
    }, { passive: true });
  }

  window.refreshProfessionalServices = render;

  /* Keep Admin/data refreshes compatible with the sequential renderer. */
  const originalRefresh = window.refreshPortfolio;
  if (typeof originalRefresh === 'function' && !originalRefresh.__servicesWrapped) {
    const wrappedRefresh = function () {
      originalRefresh();
      window.setTimeout(render, 0);
    };
    wrappedRefresh.__servicesWrapped = true;
    window.refreshPortfolio = wrappedRefresh;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
