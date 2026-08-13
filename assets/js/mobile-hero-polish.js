/* NOBIN PORTFOLIO — MOBILE HERO + NAV FIX v2
 * - Reliable mobile hamburger navigation
 * - Continuous typing animation
 * - Database-backed stat count-up animation
 * - Replays stats when they re-enter the viewport
 * - Prevents horizontal overflow
 */
(function () {
  'use strict';

  const MOBILE_BREAKPOINT = 680;

  function injectStyles() {
    if (document.getElementById('mobile-hero-polish-v2-css')) return;

    const style = document.createElement('style');
    style.id = 'mobile-hero-polish-v2-css';
    style.textContent = `
      /* ==============================
         HERO TYPING
      ============================== */
      .hero-sub.hero-typing {
        position: relative;
        min-height: 3.5em;
        padding-left: 14px;
        border-left: 2px solid rgba(0,245,160,.35);
        display: block;
        overflow-wrap: anywhere;
      }

      .hero-typing-text {
        display: inline;
      }

      .hero-typing-cursor {
        display: inline-block;
        width: 7px;
        height: 1.05em;
        margin-left: 4px;
        vertical-align: -.18em;
        background: var(--accent, #00f5a0);
        animation: hero-type-cursor-v2 .72s steps(1,end) infinite;
      }

      @keyframes hero-type-cursor-v2 {
        50% { opacity: 0; }
      }

      /* ==============================
         STATS
      ============================== */
      .hero-stats .stat {
        position: relative;
        min-width: 72px;
        padding: 10px 12px;
        border: 1px solid rgba(255,255,255,.07);
        border-radius: 16px;
        background: linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.012));
        box-shadow: inset 0 1px 0 rgba(255,255,255,.05);
        transition: transform .35s ease,border-color .35s ease,box-shadow .35s ease;
      }

      .hero-stats .stat.stat-counting {
        transform: translateY(-4px);
        border-color: rgba(0,245,160,.3);
        box-shadow: 0 10px 28px rgba(0,245,160,.08),inset 0 1px 0 rgba(255,255,255,.07);
      }

      .hero-stats .stat-num {
        font-variant-numeric: tabular-nums;
        letter-spacing: -.04em;
      }

      /* ==============================
         MOBILE NAVIGATION
      ============================== */
      @media (max-width: ${MOBILE_BREAKPOINT}px) {
        body.mobile-menu-open {
          overflow: hidden !important;
        }

        .nav {
          z-index: 10050 !important;
        }

        .nav-inner {
          position: relative;
          min-height: 48px;
        }

        .nav-toggle {
          display: flex !important;
          position: relative;
          z-index: 10052;
          width: 46px;
          height: 46px;
          align-items: center;
          justify-content: center;
          flex: 0 0 46px;
          padding: 10px;
          border: 1px solid rgba(255,255,255,.10);
          border-radius: 13px;
          background: rgba(13,17,23,.78);
          backdrop-filter: blur(14px);
          -webkit-tap-highlight-color: transparent;
        }

        .nav-toggle span {
          position: absolute;
          left: 11px;
          width: 24px;
          height: 2px;
          transform-origin: center;
        }

        .nav-toggle span:nth-child(1) { transform: translateY(-7px); }
        .nav-toggle span:nth-child(2) { transform: translateY(0); }
        .nav-toggle span:nth-child(3) { transform: translateY(7px); }

        .nav-toggle.is-open {
          border-color: rgba(0,245,160,.30);
          background: rgba(0,245,160,.08);
        }

        .nav-toggle.is-open span:nth-child(1) { transform: rotate(45deg); }
        .nav-toggle.is-open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .nav-toggle.is-open span:nth-child(3) { transform: rotate(-45deg); }

        .nav-links,
        .nav-links.active,
        .nav-links.open {
          display: flex !important;
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100dvh !important;
          min-height: 100vh !important;
          margin: 0 !important;
          padding: 96px 24px 40px !important;
          flex-direction: column !important;
          align-items: stretch !important;
          justify-content: flex-start !important;
          gap: 8px !important;
          list-style: none !important;
          background: rgba(5,9,12,.985) !important;
          backdrop-filter: blur(22px) !important;
          -webkit-backdrop-filter: blur(22px) !important;
          border: 0 !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          transform: translateY(-10px) !important;
          transition: opacity .22s ease,transform .22s ease,visibility .22s ease !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          z-index: 10051 !important;
        }

        .nav-links.is-open,
        .nav-links.active.is-open,
        .nav-links.open.is-open {
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          transform: translateY(0) !important;
        }

        .nav-links li {
          width: 100% !important;
        }

        .nav-links a {
          display: flex !important;
          width: 100% !important;
          min-height: 54px !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 14px 18px !important;
          border: 1px solid rgba(255,255,255,.07) !important;
          border-radius: 14px !important;
          background: rgba(255,255,255,.025) !important;
          color: var(--text, #e6edf3) !important;
          font-size: 1rem !important;
          font-weight: 600 !important;
        }

        .nav-links a:hover,
        .nav-links a:active {
          color: var(--accent, #00f5a0) !important;
          border-color: rgba(0,245,160,.25) !important;
          background: rgba(0,245,160,.07) !important;
        }

        .nav-links a.nav-cta {
          margin-top: 6px !important;
          background: var(--accent, #00f5a0) !important;
          color: #06100c !important;
          border-color: transparent !important;
        }

        .nav-logo {
          position: relative;
          z-index: 10052;
          max-width: calc(100vw - 90px);
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Hero */
        .hero {
          min-height: auto !important;
          padding-top: 92px !important;
          padding-bottom: 54px !important;
          align-items: flex-start !important;
        }

        .hero .container {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          grid-template-columns: minmax(0,1fr) !important;
          gap: 28px !important;
          padding-left: 20px !important;
          padding-right: 20px !important;
          overflow: visible !important;
        }

        .hero-content,
        .hero-visual {
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
        }

        .hero-visual { order: -1; }

        .code-card {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          overflow: hidden !important;
          border-radius: 16px !important;
        }

        .code-body {
          width: 100% !important;
          max-width: 100% !important;
          padding: 17px 15px !important;
          font-size: 11px !important;
          line-height: 1.65 !important;
          white-space: pre-wrap !important;
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
          overflow-x: hidden !important;
        }

        .hero-eyebrow {
          align-self: flex-start;
          margin-bottom: 18px !important;
          font-size: .72rem !important;
        }

        .hero-title {
          max-width: 100%;
          font-size: clamp(2.2rem,10vw,3.25rem) !important;
          line-height: 1.02 !important;
          letter-spacing: -.045em !important;
          overflow-wrap: anywhere;
        }

        .hero-sub {
          max-width: 100%;
          font-size: .88rem !important;
          line-height: 1.72 !important;
          margin-bottom: 28px !important;
        }

        .hero-actions {
          width: 100%;
          gap: 10px !important;
          margin-bottom: 30px !important;
        }

        .hero-actions .btn {
          width: 100% !important;
          min-height: 52px !important;
          justify-content: center !important;
          flex: 1 1 100% !important;
          border-radius: 15px !important;
        }

        .hero-stats {
          width: 100% !important;
          display: grid !important;
          grid-template-columns: repeat(3,minmax(0,1fr)) !important;
          gap: 8px !important;
          align-items: stretch !important;
        }

        .hero-stats .stat {
          min-width: 0 !important;
          padding: 11px 5px 10px !important;
          border-radius: 15px !important;
        }

        .hero-stats .stat-num { font-size: 1.45rem !important; }
        .hero-stats .stat-label { font-size: .59rem !important; letter-spacing: .06em !important; }
        .hero-stats .stat-divider { display: none !important; }
      }

      @media (max-width: 390px) {
        .nav-inner { padding-left: 16px !important; padding-right: 16px !important; }
        .nav-logo { font-size: 1.05rem !important; }
        .hero .container { padding-left: 16px !important; padding-right: 16px !important; }
        .code-body { font-size: 10px !important; padding: 15px 13px !important; }
        .hero-title { font-size: 2.18rem !important; }
        .hero-stats .stat-num { font-size: 1.3rem !important; }
        .hero-stats .stat-label { font-size: .55rem !important; }
      }

      @media (prefers-reduced-motion: reduce) {
        .hero-typing-cursor { animation: none; }
        .hero-stats .stat { transition: none; }
        .nav-links { transition: none !important; }
      }

      html, body { overflow-x: hidden !important; }
    `;
    document.head.appendChild(style);
  }

  function setupMobileNavigation() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links || toggle.dataset.mobileNavV2 === '1') return;

    toggle.dataset.mobileNavV2 = '1';

    const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

    function sync(open) {
      const value = Boolean(open) && isMobile();
      links.classList.toggle('is-open', value);
      toggle.classList.toggle('is-open', value);
      toggle.classList.toggle('active', value);
      toggle.setAttribute('aria-expanded', value ? 'true' : 'false');
      toggle.setAttribute('aria-label', value ? 'Close navigation menu' : 'Open navigation menu');
      document.body.classList.toggle('mobile-menu-open', value);
    }

    function handleToggle(event) {
      if (!isMobile()) return;
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
      sync(!links.classList.contains('is-open'));
    }

    /* Capture phase prevents conflicting legacy .active/.open handlers. */
    toggle.addEventListener('click', handleToggle, true);

    links.addEventListener('click', function (event) {
      const anchor = event.target.closest('a');
      if (!anchor) return;
      if (isMobile()) sync(false);
    }, true);

    document.addEventListener('click', function (event) {
      if (!isMobile() || !links.classList.contains('is-open')) return;
      if (links.contains(event.target) || toggle.contains(event.target)) return;
      sync(false);
    }, true);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') sync(false);
    });

    window.addEventListener('resize', function () {
      if (!isMobile()) sync(false);
    }, { passive: true });

    sync(false);
  }

  function setupTyping() {
    const el = document.querySelector('.hero-sub');
    if (!el || el.dataset.heroTypingV2 === '1') return;

    el.dataset.heroTypingV2 = '1';
    el.classList.add('hero-typing');

    const phrases = [
      'Web Development · UI/UX Design · API Integration',
      'Node.js · Laravel · JavaScript · REST APIs',
      'Webhooks · Automation · Server Architecture',
      'End-to-End Digital Systems That Work.'
    ];

    el.innerHTML = '<span class="hero-typing-text"></span><span class="hero-typing-cursor" aria-hidden="true"></span>';

    const target = el.querySelector('.hero-typing-text');
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      target.textContent = phrases[0];
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const phrase = phrases[phraseIndex];

      if (!deleting) {
        charIndex += 1;
        target.textContent = phrase.slice(0, charIndex);

        if (charIndex >= phrase.length) {
          deleting = true;
          window.setTimeout(tick, 1500);
          return;
        }

        window.setTimeout(tick, 42);
        return;
      }

      charIndex -= 1;
      target.textContent = phrase.slice(0, charIndex);

      if (charIndex <= 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        window.setTimeout(tick, 280);
        return;
      }

      window.setTimeout(tick, 24);
    }

    tick();
  }

  function getStatValues() {
    const fallback = { projects: 3, services: 6, clients: 4 };

    try {
      const store = window.PortfolioData;
      if (!store || typeof store.get !== 'function') return fallback;

      const visible = (key) => {
        const data = store.get(key);
        if (!Array.isArray(data)) return 0;
        return data.filter((item) => item && item.visible !== false && item.active !== false).length;
      };

      return {
        projects: visible('projects') || fallback.projects,
        services: visible('services') || fallback.services,
        clients: visible('clients') || fallback.clients
      };
    } catch (_) {
      return fallback;
    }
  }

  function setupStats() {
    const stats = document.querySelector('.hero-stats');
    if (!stats || stats.dataset.statsV2 === '1') return;

    stats.dataset.statsV2 = '1';

    const elements = [
      stats.querySelector('#stat-projects .stat-num'),
      stats.querySelector('#stat-services .stat-num'),
      stats.querySelector('#stat-clients .stat-num')
    ];

    if (elements.some((element) => !element)) return;

    let values = [];
    let running = false;
    let hasAnimated = false;

    function refreshTargets() {
      const next = getStatValues();
      values = [next.projects, next.services, next.clients];

      if (!running && !hasAnimated) {
        elements.forEach((element, index) => {
          element.textContent = '0+';
        });
      }
    }

    function setValue(element, value) {
      element.textContent = `${value}+`;
    }

    function animate() {
      if (running || !values.length) return;
      running = true;
      hasAnimated = true;

      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      elements.forEach((element) => {
        const stat = element.closest('.stat');
        if (stat) stat.classList.add('stat-counting');
      });

      if (reduce) {
        elements.forEach((element, index) => setValue(element, values[index]));
        elements.forEach((element) => {
          const stat = element.closest('.stat');
          if (stat) stat.classList.remove('stat-counting');
        });
        running = false;
        return;
      }

      const start = performance.now();
      const duration = 1100;

      function frame(now) {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);

        elements.forEach((element, index) => {
          setValue(element, Math.floor(values[index] * eased));
        });

        if (progress < 1) {
          requestAnimationFrame(frame);
          return;
        }

        elements.forEach((element, index) => {
          setValue(element, values[index]);
          const stat = element.closest('.stat');
          if (stat) stat.classList.remove('stat-counting');
        });

        running = false;
      }

      requestAnimationFrame(frame);
    }

    function reset() {
      if (running) return;
      elements.forEach((element) => setValue(element, 0));
      hasAnimated = false;
    }

    refreshTargets();

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            refreshTargets();
            animate();
          } else {
            reset();
          }
        });
      }, { threshold: 0.45 });

      observer.observe(stats);
    } else {
      animate();
    }

    /* PortfolioData loads asynchronously. Re-read counts after it finishes. */
    if (window.__portfolioInitialLoad && typeof window.__portfolioInitialLoad.then === 'function') {
      window.__portfolioInitialLoad.then(() => refreshTargets());
    }

    window.setInterval(() => {
      const before = values.join(',');
      refreshTargets();
      if (before !== values.join(',')) {
        const rect = stats.getBoundingClientRect();
        const visible = rect.bottom > 0 && rect.top < window.innerHeight;
        if (visible) animate();
      }
    }, 2500);
  }

  function init() {
    injectStyles();
    setupMobileNavigation();
    setupTyping();
    setupStats();
  }

  function start() {
    init();
    window.setTimeout(init, 300);
    window.setTimeout(init, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
