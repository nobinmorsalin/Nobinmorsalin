/* NOBIN PORTFOLIO — MOBILE HERO + NAV POLISH v5 */
(function () {
  'use strict';

  const BREAKPOINT = 680;

  function injectStyles() {
    if (document.getElementById('mobile-hero-polish-v5-css')) return;

    const style = document.createElement('style');
    style.id = 'mobile-hero-polish-v5-css';
    style.textContent = `
      html, body { overflow-x: hidden !important; }

      .hero-sub.hero-typing {
        min-height: 3.5em;
        padding-left: 14px;
        border-left: 2px solid rgba(0,245,160,.35);
        overflow-wrap: anywhere;
      }
      .hero-typing-text { display: inline; }
      .hero-typing-cursor {
        display:inline-block;
        width:7px;
        height:1.05em;
        margin-left:4px;
        vertical-align:-.18em;
        background:#00f5a0;
        animation:hero-type-cursor-v5 .72s steps(1,end) infinite;
      }
      @keyframes hero-type-cursor-v5 { 50% { opacity:0; } }

      .hero-stats .stat {
        position:relative;
        min-width:72px;
        padding:10px 12px;
        border:1px solid rgba(255,255,255,.07);
        border-radius:16px;
        background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.012));
        transition:transform .35s ease,border-color .35s ease,box-shadow .35s ease;
      }
      .hero-stats .stat.stat-counting {
        transform:translateY(-4px);
        border-color:rgba(0,245,160,.3);
        box-shadow:0 10px 28px rgba(0,245,160,.08),inset 0 1px 0 rgba(255,255,255,.07);
      }
      .hero-stats .stat-num { font-variant-numeric:tabular-nums; letter-spacing:-.04em; }

      @media (max-width:${BREAKPOINT}px) {
        body.mobile-menu-open { overflow:hidden !important; }

        .nav { z-index:10050 !important; }
        .nav-toggle {
          display:flex !important;
          position:fixed !important;
          top:14px !important;
          right:16px !important;
          z-index:10070 !important;
          width:48px !important;
          height:48px !important;
          align-items:center !important;
          justify-content:center !important;
          padding:10px !important;
          border:1px solid rgba(255,255,255,.12) !important;
          border-radius:15px !important;
          background:rgba(13,17,23,.82) !important;
          backdrop-filter:blur(16px) !important;
          -webkit-backdrop-filter:blur(16px) !important;
          box-shadow:0 10px 30px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.06) !important;
          -webkit-tap-highlight-color:transparent;
        }
        .nav-toggle span {
          position:absolute !important;
          left:12px !important;
          width:24px !important;
          height:2px !important;
          background:#e6edf3 !important;
          transform-origin:center !important;
          transition:transform .22s ease,opacity .18s ease !important;
        }
        .nav-toggle span:nth-child(1){transform:translateY(-7px)!important}
        .nav-toggle span:nth-child(2){transform:translateY(0)!important}
        .nav-toggle span:nth-child(3){transform:translateY(7px)!important}
        .nav-toggle.is-open span:nth-child(1){transform:rotate(45deg)!important}
        .nav-toggle.is-open span:nth-child(2){opacity:0!important}
        .nav-toggle.is-open span:nth-child(3){transform:rotate(-45deg)!important}
        .nav-toggle.is-open{border-color:rgba(0,245,160,.32)!important;background:rgba(8,18,16,.92)!important}

        .mobile-nav-backdrop {
          position:fixed !important;
          inset:0 !important;
          z-index:10054 !important;
          background:rgba(0,0,0,.54) !important;
          backdrop-filter:blur(5px) !important;
          -webkit-backdrop-filter:blur(5px) !important;
          opacity:0 !important;
          visibility:hidden !important;
          pointer-events:none !important;
          transition:opacity .28s ease,visibility .28s ease !important;
        }
        .mobile-nav-backdrop.is-open {
          opacity:1 !important;
          visibility:visible !important;
          pointer-events:auto !important;
        }

        .nav-links,
        .nav-links.active,
        .nav-links.open {
          display:flex !important;
          position:fixed !important;
          top:0 !important;
          right:0 !important;
          bottom:0 !important;
          left:auto !important;
          width:min(88vw,390px) !important;
          height:100dvh !important;
          min-height:100vh !important;
          margin:0 !important;
          padding:96px 20px 30px !important;
          flex-direction:column !important;
          align-items:stretch !important;
          justify-content:flex-start !important;
          gap:9px !important;
          list-style:none !important;
          counter-reset:mobile-nav !important;
          background:linear-gradient(160deg,rgba(13,19,24,.99),rgba(5,12,14,.99)) !important;
          border-left:1px solid rgba(0,245,160,.16) !important;
          border-top-left-radius:26px !important;
          border-bottom-left-radius:26px !important;
          box-shadow:-24px 0 70px rgba(0,0,0,.42),inset 1px 0 0 rgba(255,255,255,.035) !important;
          opacity:1 !important;
          visibility:visible !important;
          pointer-events:auto !important;
          transform:translate3d(105%,0,0) !important;
          transition:transform .34s cubic-bezier(.22,1,.36,1) !important;
          overflow-y:auto !important;
          overflow-x:hidden !important;
          z-index:10060 !important;
        }
        .nav-links.is-open,
        .nav-links.active.is-open,
        .nav-links.open.is-open { transform:translate3d(0,0,0) !important; }

        .nav-links::before {
          content:'Nobin Morsalin';
          display:block !important;
          color:#e6edf3 !important;
          font-family:var(--font-head,'Syne',sans-serif) !important;
          font-size:1.45rem !important;
          font-weight:800 !important;
          letter-spacing:-.035em !important;
          padding:0 4px 10px !important;
          border-bottom:1px solid rgba(255,255,255,.08) !important;
          margin-bottom:2px !important;
        }
        .nav-links::after {
          content:'FULL-STACK DEVELOPER  /  MENU';
          display:block !important;
          color:rgba(0,245,160,.7) !important;
          font-family:var(--font-mono,'JetBrains Mono',monospace) !important;
          font-size:.62rem !important;
          letter-spacing:.12em !important;
          padding:0 4px 9px !important;
        }
        .nav-links li { width:100% !important; counter-increment:mobile-nav !important; flex:0 0 auto !important; }
        .nav-links li a {
          display:flex !important;
          width:100% !important;
          min-height:56px !important;
          align-items:center !important;
          gap:14px !important;
          padding:12px 15px !important;
          border:1px solid rgba(255,255,255,.065) !important;
          border-radius:16px !important;
          background:rgba(255,255,255,.026) !important;
          color:#e6edf3 !important;
          font-size:1rem !important;
          font-weight:600 !important;
          text-decoration:none !important;
        }
        .nav-links li a::before {
          content:'0' counter(mobile-nav) !important;
          flex:0 0 30px !important;
          color:rgba(0,245,160,.58) !important;
          font-family:var(--font-mono,'JetBrains Mono',monospace) !important;
          font-size:.67rem !important;
        }
        .nav-links li a::after {
          content:'→' !important;
          margin-left:auto !important;
          color:rgba(139,148,158,.5) !important;
        }
        .nav-links li a:active,
        .nav-links li a:hover {
          color:#00f5a0 !important;
          border-color:rgba(0,245,160,.28) !important;
          background:rgba(0,245,160,.065) !important;
        }
        .nav-links li a.nav-cta {
          margin-top:8px !important;
          justify-content:center !important;
          background:linear-gradient(135deg,#00f5a0,#00d4ff) !important;
          color:#06100c !important;
          border-color:transparent !important;
          box-shadow:0 10px 30px rgba(0,245,160,.18) !important;
        }
        .nav-links li a.nav-cta::before,.nav-links li a.nav-cta::after { color:#06100c!important; }

        .hero { min-height:auto!important; padding-top:92px!important; padding-bottom:54px!important; }
        .hero .container { width:100%!important; max-width:100%!important; min-width:0!important; grid-template-columns:minmax(0,1fr)!important; gap:28px!important; padding-left:20px!important; padding-right:20px!important; }
        .hero-content,.hero-visual { width:100%!important; min-width:0!important; max-width:100%!important; }
        .hero-visual { order:-1; }
        .code-card { width:100%!important; max-width:100%!important; min-width:0!important; overflow:hidden!important; }
        .code-body { width:100%!important; max-width:100%!important; padding:17px 15px!important; font-size:11px!important; line-height:1.65!important; white-space:pre-wrap!important; overflow-wrap:anywhere!important; word-break:break-word!important; overflow-x:hidden!important; }
        .hero-title { max-width:100%; font-size:clamp(2.2rem,10vw,3.25rem)!important; line-height:1.02!important; letter-spacing:-.045em!important; overflow-wrap:anywhere; }
        .hero-sub { max-width:100%; font-size:.88rem!important; line-height:1.72!important; margin-bottom:28px!important; }
        .hero-actions { width:100%!important; gap:10px!important; margin-bottom:30px!important; }
        .hero-actions .btn { width:100%!important; min-height:52px!important; justify-content:center!important; flex:1 1 100%!important; }
        .hero-stats { width:100%!important; display:grid!important; grid-template-columns:repeat(3,minmax(0,1fr))!important; gap:8px!important; align-items:stretch!important; }
        .hero-stats .stat { min-width:0!important; padding:11px 5px 10px!important; border-radius:15px!important; }
        .hero-stats .stat-num { font-size:1.45rem!important; }
        .hero-stats .stat-label { font-size:.59rem!important; }
        .hero-stats .stat-divider { display:none!important; }
      }

      @media (max-width:390px) {
        .nav-toggle { right:12px!important; }
        .nav-links { width:min(92vw,390px)!important; padding-left:18px!important; padding-right:18px!important; }
        .nav-logo { font-size:1.05rem!important; }
        .hero .container { padding-left:16px!important; padding-right:16px!important; }
        .code-body { font-size:10px!important; }
        .hero-title { font-size:2.18rem!important; }
        .hero-stats .stat-num { font-size:1.3rem!important; }
        .hero-stats .stat-label { font-size:.55rem!important; }
      }

      @media (prefers-reduced-motion:reduce) {
        .hero-typing-cursor,.hero-stats .stat,.nav-links,.mobile-nav-backdrop { animation:none!important; transition:none!important; }
      }
    `;
    document.head.appendChild(style);
  }

  function setupMobileNavigation() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links || toggle.dataset.mobileNavV5 === '1') return;

    toggle.dataset.mobileNavV5 = '1';
    window.__mobileNavV5Loaded = true;

    const isMobile = () => window.innerWidth <= BREAKPOINT;
    let backdrop = document.querySelector('.mobile-nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'mobile-nav-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.appendChild(backdrop);
    }

    function closeMenu() {
      links.classList.remove('is-open', 'active', 'open');
      toggle.classList.remove('is-open', 'active');
      backdrop.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');
      document.body.classList.remove('mobile-menu-open');
    }

    function openMenu() {
      if (!isMobile()) return;
      links.classList.remove('active', 'open');
      links.classList.add('is-open');
      toggle.classList.add('is-open');
      backdrop.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close navigation menu');
      document.body.classList.add('mobile-menu-open');
    }

    function toggleMenu(event) {
      if (!isMobile()) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      if (links.classList.contains('is-open')) closeMenu();
      else openMenu();
    }

    /* Capture phase intentionally wins over the legacy main.js menu handler. */
    toggle.addEventListener('click', toggleMenu, true);
    backdrop.addEventListener('click', closeMenu);

    links.addEventListener('click', function (event) {
      const anchor = event.target.closest('a');
      if (anchor && isMobile()) closeMenu();
    }, true);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && links.classList.contains('is-open')) closeMenu();
    });

    window.addEventListener('resize', function () {
      if (!isMobile()) closeMenu();
    }, { passive: true });

    /* Fix browser Back/Forward cache restoring the menu in a stale open state. */
    window.addEventListener('pageshow', closeMenu);
    window.addEventListener('pagehide', closeMenu);
    window.addEventListener('popstate', closeMenu);

    closeMenu();
  }

  function setupTyping() {
    const el = document.querySelector('.hero-sub');
    if (!el || el.dataset.heroTypingV5 === '1') return;
    el.dataset.heroTypingV5 = '1';
    el.classList.add('hero-typing');

    const phrases = [
      'Web Development · UI/UX Design · API Integration',
      'Node.js · Laravel · JavaScript · REST APIs',
      'Webhooks · Automation · Server Architecture',
      'End-to-End Digital Systems That Work.'
    ];

    el.innerHTML = '<span class="hero-typing-text"></span><span class="hero-typing-cursor" aria-hidden="true"></span>';
    const target = el.querySelector('.hero-typing-text');

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
      target.textContent = phrases[0];
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const phrase = phrases[phraseIndex];
      if (!deleting) {
        charIndex++;
        target.textContent = phrase.slice(0, charIndex);
        if (charIndex >= phrase.length) {
          deleting = true;
          setTimeout(tick, 1500);
          return;
        }
        setTimeout(tick, 42);
      } else {
        charIndex--;
        target.textContent = phrase.slice(0, charIndex);
        if (charIndex <= 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(tick, 280);
          return;
        }
        setTimeout(tick, 24);
      }
    }
    tick();
  }

  function countVisible(key, fallback) {
    try {
      const data = window.PortfolioData && typeof window.PortfolioData.get === 'function'
        ? window.PortfolioData.get(key)
        : null;
      if (!Array.isArray(data)) return fallback;
      return data.filter(item => item && item.visible !== false && item.active !== false).length;
    } catch (_) {
      return fallback;
    }
  }

  async function loadCountsFromApi() {
    try {
      const response = await fetch(`/api/portfolio?_stats=${Date.now()}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      if (!response.ok) return null;
      const payload = await response.json();
      const data = payload && payload.data;
      if (!data || typeof data !== 'object') return null;
      const count = key => Array.isArray(data[key])
        ? data[key].filter(item => item && item.visible !== false && item.active !== false).length
        : 0;
      return { projects: count('projects'), services: count('services'), clients: count('clients') };
    } catch (_) {
      return null;
    }
  }

  function setupStats() {
    const stats = document.querySelector('.hero-stats');
    if (!stats || stats.dataset.statsV5 === '1') return;
    stats.dataset.statsV5 = '1';

    const elements = [
      document.querySelector('#stat-projects .stat-num'),
      document.querySelector('#stat-services .stat-num'),
      document.querySelector('#stat-clients .stat-num')
    ];
    if (elements.some(el => !el)) return;

    let targets = [countVisible('projects', 3), countVisible('services', 6), countVisible('clients', 4)];
    let running = false;

    const draw = values => elements.forEach((el, index) => {
      el.textContent = `${Math.max(0, Math.round(values[index]))}+`;
    });

    const readLocalTargets = () => {
      targets = [countVisible('projects', 3), countVisible('services', 6), countVisible('clients', 4)];
    };

    const animate = () => {
      if (running) return;
      running = true;
      const start = performance.now();
      const duration = 1100;
      elements.forEach(el => el.closest('.stat')?.classList.add('stat-counting'));

      function frame(now) {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        draw(targets.map(value => value * eased));
        if (progress < 1) {
          requestAnimationFrame(frame);
          return;
        }
        draw(targets);
        elements.forEach(el => el.closest('.stat')?.classList.remove('stat-counting'));
        running = false;
      }
      requestAnimationFrame(frame);
    };

    const reset = () => {
      if (!running) draw([0, 0, 0]);
    };

    readLocalTargets();
    reset();

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            readLocalTargets();
            animate();
          } else {
            reset();
          }
        });
      }, { threshold: 0.35 });
      observer.observe(stats);
    } else {
      animate();
    }

    if (window.__portfolioInitialLoad && typeof window.__portfolioInitialLoad.then === 'function') {
      window.__portfolioInitialLoad.then(() => {
        readLocalTargets();
        const rect = stats.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          reset();
          animate();
        }
      });
    }

    loadCountsFromApi().then(apiCounts => {
      if (!apiCounts) return;
      targets = [apiCounts.projects, apiCounts.services, apiCounts.clients];
      const rect = stats.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0 && !running) {
        reset();
        animate();
      }
    });

    window.setInterval(() => {
      const previous = targets.join(',');
      readLocalTargets();
      if (previous !== targets.join(',')) {
        const rect = stats.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          reset();
          animate();
        }
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
    setTimeout(init, 300);
    setTimeout(init, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
