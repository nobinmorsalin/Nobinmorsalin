/*
 * NOBIN MORSALIN — SERVICES INFINITE MARQUEE
 * Continuous, seamless conveyor-style scrolling.
 * Desktop + mobile responsive. View All pauses the marquee while expanded.
 */
(function () {
  'use strict';

  const SPEED_DESKTOP = 42;
  const SPEED_MOBILE = 30;
  const STYLE_ID = 'services-infinite-marquee-v5';

  let resizeTimer = null;
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

      #services .services-track-infinite {
        display: flex !important;
        flex-wrap: nowrap !important;
        align-items: stretch !important;
        gap: 24px !important;
        width: max-content !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 0 24px 10px !important;
        animation-name: servicesInfiniteScroll;
        animation-duration: var(--services-marquee-duration, 30s);
        animation-timing-function: linear;
        animation-iteration-count: infinite;
        animation-direction: normal;
        animation-play-state: running;
        will-change: transform;
        transform: translate3d(0,0,0);
      }

      @keyframes servicesInfiniteScroll {
        from { transform: translate3d(0,0,0); }
        to { transform: translate3d(calc(-1 * var(--services-loop-distance, 0px)),0,0); }
      }

      #services .services-track-infinite .professional-service-card {
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

      /* IMPORTANT: these rules intentionally outrank the marquee flex rules.
         View All must become a real vertical catalogue on every breakpoint. */
      #services.marquee-expanded .services-marquee {
        overflow: visible !important;
      }

      #services.marquee-expanded .services-track-infinite {
        display: grid !important;
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        grid-auto-flow: row !important;
        align-items: stretch !important;
        gap: 24px !important;
        width: min(100%, 1160px) !important;
        max-width: 1160px !important;
        min-width: 0 !important;
        margin: 0 auto !important;
        padding: 10px 24px 18px !important;
        animation: none !important;
        animation-play-state: paused !important;
        transform: none !important;
        will-change: auto !important;
      }

      #services.marquee-expanded .services-track-infinite .professional-service-card {
        display: block !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: none !important;
        flex: none !important;
        margin: 0 !important;
      }

      #services.marquee-expanded .services-track-infinite .view-all-duplicate {
        display: none !important;
      }

      @media (max-width: 900px) {
        #services.marquee-expanded .services-track-infinite {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 16px !important;
          padding-inline: 16px !important;
        }
      }

      @media (max-width: 680px) {
        #services .services-track-infinite {
          gap: 14px !important;
          padding: 0 16px 10px !important;
          animation-duration: var(--services-marquee-duration-mobile, 30s);
        }

        #services .services-track-infinite .professional-service-card {
          flex-basis: calc(100vw - 48px) !important;
          width: calc(100vw - 48px) !important;
          min-width: calc(100vw - 48px) !important;
          max-width: none !important;
        }

        #services.marquee-expanded .services-track-infinite {
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 14px !important;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          padding: 8px 16px 16px !important;
        }

        #services.marquee-expanded .services-track-infinite .professional-service-card {
          width: 100% !important;
          min-width: 0 !important;
          max-width: none !important;
          flex: none !important;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #services .services-track-infinite {
          animation-duration: 60s !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function isExpanded() {
    return elements().section?.classList.contains('marquee-expanded') === true;
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

  function setupTrack(track) {
    track.classList.remove('services-track-sequential');
    track.classList.add('services-track-infinite');
    track.dataset.marqueeReady = 'true';
  }

  function calculateLoopDistance(track, itemCount) {
    const cards = Array.from(track.querySelectorAll('.professional-service-card'));
    if (!itemCount || cards.length < itemCount * 2) return 0;

    const firstLeft = cards[0].getBoundingClientRect().left;
    const secondCopyFirst = cards[itemCount].getBoundingClientRect().left;
    let distance = secondCopyFirst - firstLeft;

    if (!Number.isFinite(distance) || distance <= 0) {
      const last = cards[itemCount - 1].getBoundingClientRect();
      distance = (last.right - firstLeft) + (parseFloat(getComputedStyle(track).gap) || 0);
    }

    return Number.isFinite(distance) && distance > 0 ? Math.round(distance * 100) / 100 : 0;
  }

  function applySpeed(track) {
    const distance = Number(track.dataset.loopDistance || 0);
    if (!distance) return;

    const mobile = window.matchMedia('(max-width: 680px)').matches;
    const speed = mobile ? SPEED_MOBILE : SPEED_DESKTOP;
    const duration = Math.max(10, distance / speed);

    track.style.setProperty('--services-loop-distance', `${distance}px`);
    track.style.setProperty('--services-marquee-duration', `${duration}s`);
    track.style.setProperty('--services-marquee-duration-mobile', `${duration}s`);

    if (!isExpanded()) {
      track.style.animation = 'none';
      void track.offsetWidth;
      track.style.animation = '';
    }
  }

  function render() {
    if (renderLock) return;
    renderLock = true;

    installStyles();

    const { section, track, viewport } = elements();
    if (!section || !track || !viewport) {
      renderLock = false;
      return;
    }

    const services = getVisibleServices();
    if (!services.length) {
      track.innerHTML = '';
      renderLock = false;
      return;
    }

    const copy = services.map(buildCard).join('');
    track.innerHTML = copy + copy;
    setupTrack(track);

    requestAnimationFrame(() => {
      const distance = calculateLoopDistance(track, services.length);
      track.dataset.loopDistance = String(distance);
      applySpeed(track);
      renderLock = false;
    });
  }

  function observeExpandedState() {
    const { section, track } = elements();
    if (!section || !track || sectionObserver) return;

    sectionObserver = new MutationObserver(() => {
      if (section.classList.contains('marquee-expanded')) {
        track.style.animation = 'none';
        track.style.animationPlayState = 'paused';
        track.style.transform = 'none';
      } else {
        track.style.animationPlayState = 'running';
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
      resizeTimer = window.setTimeout(render, 160);
    }, { passive: true });
  }

  window.refreshProfessionalServices = render;

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
