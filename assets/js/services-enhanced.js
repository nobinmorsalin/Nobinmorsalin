/*
 * FRONTEND SERVICES ENHANCEMENT
 * Keeps the existing service preview and Admin-driven data intact.
 * Services are shown once and move through the catalogue one card at a time.
 * Full details remain available through the existing portfolio details modal.
 */
(function () {
  'use strict';

  const SERVICE_PLACEHOLDER = '/assets/images/service-placeholder.svg';
  const STEP_DELAY = 3200;
  const TRANSITION_MS = 650;

  let autoTimer = null;
  let currentIndex = 0;
  let isPaused = false;
  let resizeTimer = null;
  let observedSection = null;
  let sectionObserver = null;

  function hideLegacyServiceIcon() {
    if (document.getElementById('services-image-only-style')) return;
    const style = document.createElement('style');
    style.id = 'services-image-only-style';
    style.textContent = `
      #services .service-icon { display:none !important; }
      #services .professional-service-card .service-image,
      #services .professional-service-card .service-image img {
        display:block;
      }
      #services .professional-service-card .service-image {
        width:100%;
        aspect-ratio:16/10;
        overflow:hidden;
        border-radius:18px;
        margin-bottom:18px;
        background:rgba(255,255,255,.04);
      }
      #services .professional-service-card .service-image img {
        width:100%;
        height:100%;
        object-fit:cover;
      }
      #services .professional-service-card {
        cursor:pointer;
      }
      /* Sequential catalogue: never render a duplicated visual data set. */
      #services .services-track-sequential {
        animation:none !important;
        transform:translate3d(0,0,0);
        transition:transform ${TRANSITION_MS}ms cubic-bezier(.22,.61,.36,1);
        will-change:transform;
      }
      #services .services-track-sequential.is-paused {
        transition-duration:${TRANSITION_MS}ms;
      }
      #services.marquee-expanded .services-track-sequential {
        transform:none !important;
        transition:none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function safeUrl(value) {
    const v = String(value || '').trim();
    return /^(https?:\/\/|\/|#|mailto:)/i.test(v) ? v : '#';
  }

  function getElements() {
    const section = document.querySelector('#services');
    const container = document.querySelector('#servicesGrid');
    const marquee = section?.querySelector('.services-marquee');
    return { section, container, marquee };
  }

  function clearTimer() {
    if (autoTimer) {
      window.clearTimeout(autoTimer);
      autoTimer = null;
    }
  }

  function getGap(track) {
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '0');
    return Number.isFinite(gap) ? gap : 0;
  }

  function getStep(track) {
    const card = track.querySelector('.professional-service-card');
    if (!card) return 0;
    return card.getBoundingClientRect().width + getGap(track);
  }

  function getVisibleCount(marquee, track, step) {
    if (!step) return 1;
    const available = marquee.getBoundingClientRect().width;
    return Math.max(1, Math.floor((available + getGap(track)) / step));
  }

  function getMaxIndex(marquee, track) {
    const cards = track.querySelectorAll('.professional-service-card');
    if (!cards.length) return 0;
    const step = getStep(track);
    if (!step) return Math.max(0, cards.length - 1);
    return Math.max(0, cards.length - getVisibleCount(marquee, track, step));
  }

  function applyPosition(animated) {
    const { section, marquee, container } = getElements();
    if (!section || !marquee || !container) return;

    const cards = container.querySelectorAll('.professional-service-card');
    if (!cards.length) return;

    const maxIndex = getMaxIndex(marquee, container);
    currentIndex = Math.min(currentIndex, maxIndex);

    if (section.classList.contains('marquee-expanded')) {
      container.style.transition = 'none';
      container.style.transform = 'none';
      return;
    }

    const step = getStep(container);
    if (!step) return;

    container.style.transition = animated
      ? `transform ${TRANSITION_MS}ms cubic-bezier(.22,.61,.36,1)`
      : 'none';
    container.style.transform = `translate3d(${-currentIndex * step}px,0,0)`;
  }

  function scheduleNext() {
    clearTimer();
    if (isPaused) return;

    const { section, marquee, container } = getElements();
    if (!section || !marquee || !container) return;
    if (section.classList.contains('marquee-expanded')) return;

    const cards = container.querySelectorAll('.professional-service-card');
    if (cards.length <= 1) return;

    autoTimer = window.setTimeout(() => {
      const maxIndex = getMaxIndex(marquee, container);

      if (currentIndex < maxIndex) {
        currentIndex += 1;
        applyPosition(true);
        scheduleNext();
        return;
      }

      /*
       * The final card has been shown. Restart from the first card without
       * creating a second visual copy, so duplicate cards never appear.
       */
      currentIndex = 0;
      window.setTimeout(() => {
        applyPosition(false);
        scheduleNext();
      }, TRANSITION_MS + 120);
    }, STEP_DELAY);
  }

  function pause() {
    isPaused = true;
    clearTimer();
  }

  function resume() {
    isPaused = false;
    scheduleNext();
  }

  function bindInteractions(section, marquee, container) {
    if (!marquee || marquee.dataset.sequentialBound === 'true') return;
    marquee.dataset.sequentialBound = 'true';

    marquee.addEventListener('mouseenter', pause, { passive: true });
    marquee.addEventListener('mouseleave', resume, { passive: true });
    marquee.addEventListener('focusin', pause);
    marquee.addEventListener('focusout', resume);

    /* Pause while a user swipes/touches the service rail. */
    marquee.addEventListener('touchstart', pause, { passive: true });
    marquee.addEventListener('touchend', resume, { passive: true });

    if (sectionObserver) sectionObserver.disconnect();
    observedSection = section;
    sectionObserver = new MutationObserver(() => {
      if (!section.classList.contains('marquee-expanded')) {
        container.style.transition = 'none';
        currentIndex = 0;
        container.style.transform = 'translate3d(0,0,0)';
        if (!isPaused) scheduleNext();
      } else {
        clearTimer();
        container.style.transition = 'none';
        container.style.transform = 'none';
      }
    });
    sectionObserver.observe(section, { attributes: true, attributeFilter: ['class'] });
  }

  function setupSequentialMarquee() {
    const { section, container, marquee } = getElements();
    if (!section || !container || !marquee) return;

    hideLegacyServiceIcon();
    container.classList.add('services-track-sequential');
    container.dataset.marqueeReady = 'true';

    currentIndex = 0;
    container.style.transition = 'none';
    container.style.transform = 'translate3d(0,0,0)';

    bindInteractions(section, marquee, container);
    scheduleNext();
  }

  function renderProfessionalServices() {
    hideLegacyServiceIcon();

    const { container } = getElements();
    if (!container || !window.PortfolioData) return;

    clearTimer();
    currentIndex = 0;

    const services = PortfolioData.get('services');
    if (!Array.isArray(services)) return;

    const visible = services
      .filter(Boolean)
      .filter((s) => s.visible !== false && s.active !== false)
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

    if (!visible.length) {
      container.innerHTML = '';
      container.dataset.marqueeReady = 'false';
      return;
    }

    const card = (s) => {
      const image = safeUrl(s.image) !== '#' ? safeUrl(s.image) : SERVICE_PLACEHOLDER;
      const name = s.name || 'Service';
      const shortDescription = s.desc || s.shortDescription || s.description || '';

      return `
        <article class="service-card professional-service-card">
          <div class="service-image">
            <img
              src="${esc(image)}"
              alt="${esc(name)}"
              loading="lazy"
              decoding="async"
              draggable="false"
              onerror="this.onerror=null;this.src='${SERVICE_PLACEHOLDER}'"
            >
          </div>
          <h3 class="service-title">${esc(name)}</h3>
          <p class="service-desc">${esc(shortDescription)}</p>
        </article>`;
    };

    /* Render each Admin service exactly once. */
    container.innerHTML = visible.map(card).join('');
    container.dataset.marqueeReady = 'true';

    setupSequentialMarquee();
  }

  hideLegacyServiceIcon();
  document.addEventListener('DOMContentLoaded', renderProfessionalServices, { once: true });
  window.refreshProfessionalServices = renderProfessionalServices;

  const refreshPortfolio = window.refreshPortfolio;
  if (typeof refreshPortfolio === 'function') {
    window.refreshPortfolio = function () {
      refreshPortfolio();
      renderProfessionalServices();
    };
  }

  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const { section, container } = getElements();
      if (!section || !container) return;
      applyPosition(false);
      if (!section.classList.contains('marquee-expanded') && !isPaused) {
        scheduleNext();
      }
    }, 120);
  }, { passive: true });
})();
