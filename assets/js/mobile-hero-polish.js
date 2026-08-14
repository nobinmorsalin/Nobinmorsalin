/* NOBIN PORTFOLIO — MOBILE HERO + NAV POLISH v3
 * Premium mobile drawer navigation
 * Continuous typing animation
 * Database-backed stat count-up animation
 * Replays stats when they re-enter the viewport
 * Prevents horizontal overflow
 */
(function () {
  'use strict';

  const MOBILE_BREAKPOINT = 680;

  function injectStyles() {
    if (document.getElementById('mobile-hero-polish-v3-css')) return;

    const style = document.createElement('style');
    style.id = 'mobile-hero-polish-v3-css';
    style.textContent = `
      .hero-sub.hero-typing {
        position: relative;
        min-height: 3.5em;
        padding-left: 14px;
        border-left: 2px solid rgba(0,245,160,.35);
        display: block;
        overflow-wrap: anywhere;
      }
      .hero-typing-text { display: inline; }
      .hero-typing-cursor {
        display: inline-block;
        width: 7px;
        height: 1.05em;
        margin-left: 4px;
        vertical-align: -.18em;
        background: var(--accent,#00f5a0);
        animation: hero-type-cursor-v3 .72s steps(1,end) infinite;
      }
      @keyframes hero-type-cursor-v3 { 50% { opacity: 0; } }

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
      .hero-stats .stat-num { font-variant-numeric: tabular-nums; letter-spacing: -.04em; }

      @media (max-width:${MOBILE_BREAKPOINT}px) {
        body.mobile-menu-open { overflow:hidden !important; }
        html,body { overflow-x:hidden !important; }

        .nav { z-index:10050 !important; }
        .nav-inner { position:relative; min-height:48px; }
        .nav-logo { position:relative; z-index:10062; max-width:calc(100vw - 90px); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

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
          flex:0 0 48px !important;
          padding:10px !important;
          border:1px solid rgba(255,255,255,.12) !important;
          border-radius:15px !important;
          background:rgba(13,17,23,.76) !important;
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
        }
        .nav-toggle span:nth-child(1){transform:translateY(-7px)!important}
        .nav-toggle span:nth-child(2){transform:translateY(0)!important}
        .nav-toggle span:nth-child(3){transform:translateY(7px)!important}
        .nav-toggle.is-open { border-color:rgba(0,245,160,.32)!important; background:rgba(8,18,16,.9)!important; }
        .nav-toggle.is-open span:nth-child(1){transform:rotate(45deg)!important}
        .nav-toggle.is-open span:nth-child(2){opacity:0!important;transform:scaleX(0)!important}
        .nav-toggle.is-open span:nth-child(3){transform:rotate(-45deg)!important}

        .mobile-nav-backdrop {
          position:fixed !important;
          inset:0 !important;
          z-index:10054 !important;
          background:rgba(0,0,0,.52) !important;
          backdrop-filter:blur(4px) !important;
          -webkit-backdrop-filter:blur(4px) !important;
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
          padding:112px 22px 34px !important;
          flex-direction:column !important;
          align-items:stretch !important;
          justify-content:flex-start !important;
          gap:9px !important;
          list-style:none !important;
          counter-reset:mobile-nav !important;
          background:linear-gradient(160deg,rgba(13,19,24,.985),rgba(5,12,14,.99)) !important;
          border-left:1px solid rgba(0,245,160,.16) !important;
          border-top-left-radius:26px !important;
          border-bottom-left-radius:26px !important;
          box-shadow:-24px 0 70px rgba(0,0,0,.42),inset 1px 0 0 rgba(255,255,255,.035) !important;
          opacity:1 !important;
          visibility:visible !important;
          pointer-events:auto !important;
          transform:translateX(105%) !important;
          transition:transform .34s cubic-bezier(.22,1,.36,1) !important;
          overflow-y:auto !important;
          overflow-x:hidden !important;
          z-index:10060 !important;
        }

        .nav-links::before {
          content:'Nobin Morsalin';
          display:block !important;
          color:#e6edf3 !important;
          font-family:var(--font-head,'Syne',sans-serif) !important;
          font-size:1.45rem !important;
          font-weight:800 !important;
          letter-spacing:-.035em !important;
          padding:0 4px 8px !important;
          border-bottom:1px solid rgba(255,255,255,.08) !important;
          margin-bottom:8px !important;
        }
        .nav-links::after {
          content:'FULL-STACK DEVELOPER  /  MENU';
          display:block !important;
          color:rgba(0,245,160,.7) !important;
          font-family:var(--font-mono,'JetBrains Mono',monospace) !important;
          font-size:.62rem !important;
          letter-spacing:.12em !important;
          padding:0 4px 10px !important;
          order:0 !important;
        }
        .nav-links.is-open,
        .nav-links.active.is-open,
        .nav-links.open.is-open { transform:translateX(0) !important; }

        .nav-links li {
          width:100% !important;
          counter-increment:mobile-nav !important;
          flex:0 0 auto !important;
        }
        .nav-links li a {
          display:flex !important;
          width:100% !important;
          min-height:58px !important;
          align-items:center !important;
          justify-content:flex-start !important;
          gap:14px !important;
          padding:13px 16px !important;
          border:1px solid rgba(255,255,255,.065) !important;
          border-radius:16px !important;
          background:rgba(255,255,255,.026) !important;
          color:#e6edf3 !important;
          font-size:1rem !important;
          font-weight:600 !important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.025) !important;
          transition:transform .22s ease,border-color .22s ease,background .22s ease,color .22s ease !important;
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
          transform:translateX(-3px) !important;
          transition:transform .22s ease,color .22s ease !important;
        }
        .nav-links li a:hover,
        .nav-links li a:active {
          color:#00f5a0 !important;
          border-color:rgba(0,245,160,.28) !important;
          background:rgba(0,245,160,.065) !important;
          transform:translateX(-3px) !important;
        }
        .nav-links li a:hover::after,
        .nav-links li a:active::after { color:#00f5a0 !important; transform:translateX(2px)!important; }
        .nav-links li a.nav-cta {
          margin-top:9px !important;
          justify-content:center !important;
          background:linear-gradient(135deg,#00f5a0,#00d4ff) !important;
          color:#06100c !important;
          border-color:transparent !important;
          box-shadow:0 10px 30px rgba(0,245,160,.18) !important;
        }
        .nav-links li a.nav-cta::before { color:rgba(6,16,12,.55)!important; }
        .nav-links li a.nav-cta::after { color:#06100c!important; }

        .hero { min-height:auto!important; padding-top:92px!important; padding-bottom:54px!important; align-items:flex-start!important; }
        .hero .container { width:100%!important; max-width:100%!important; min-width:0!important; grid-template-columns:minmax(0,1fr)!important; gap:28px!important; padding-left:20px!important; padding-right:20px!important; overflow:visible!important; }
        .hero-content,.hero-visual { width:100%!important; min-width:0!important; max-width:100%!important; }
        .hero-visual { order:-1; }
        .code-card { width:100%!important; max-width:100%!important; min-width:0!important; overflow:hidden!important; border-radius:16px!important; }
        .code-body { width:100%!important; max-width:100%!important; padding:17px 15px!important; font-size:11px!important; line-height:1.65!important; white-space:pre-wrap!important; overflow-wrap:anywhere!important; word-break:break-word!important; overflow-x:hidden!important; }
        .hero-eyebrow { align-self:flex-start; margin-bottom:18px!important; font-size:.72rem!important; }
        .hero-title { max-width:100%; font-size:clamp(2.2rem,10vw,3.25rem)!important; line-height:1.02!important; letter-spacing:-.045em!important; overflow-wrap:anywhere; }
        .hero-sub { max-width:100%; font-size:.88rem!important; line-height:1.72!important; margin-bottom:28px!important; }
        .hero-actions { width:100%; gap:10px!important; margin-bottom:30px!important; }
        .hero-actions .btn { width:100%!important; min-height:52px!important; justify-content:center!important; flex:1 1 100%!important; border-radius:15px!important; }
        .hero-stats { width:100%!important; display:grid!important; grid-template-columns:repeat(3,minmax(0,1fr))!important; gap:8px!important; align-items:stretch!important; }
        .hero-stats .stat { min-width:0!important; padding:11px 5px 10px!important; border-radius:15px!important; }
        .hero-stats .stat-num { font-size:1.45rem!important; }
        .hero-stats .stat-label { font-size:.59rem!important; letter-spacing:.06em!important; }
        .hero-stats .stat-divider { display:none!important; }
      }

      @media (max-width:390px) {
        .nav-inner { padding-left:16px!important; padding-right:16px!important; }
        .nav-toggle { right:12px!important; }
        .nav-links { width:min(92vw,390px)!important; padding-left:18px!important; padding-right:18px!important; }
        .nav-logo { font-size:1.05rem!important; }
        .hero .container { padding-left:16px!important; padding-right:16px!important; }
        .code-body { font-size:10px!important; padding:15px 13px!important; }
        .hero-title { font-size:2.18rem!important; }
        .hero-stats .stat-num { font-size:1.3rem!important; }
        .hero-stats .stat-label { font-size:.55rem!important; }
      }

      @media (prefers-reduced-motion:reduce) {
        .hero-typing-cursor { animation:none; }
        .hero-stats .stat,.nav-links,.mobile-nav-backdrop { transition:none!important; }
      }
    `;
    document.head.appendChild(style);
  }

  function setupMobileNavigation() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links || toggle.dataset.mobileNavV3 === '1') return;

    toggle.dataset.mobileNavV3 = '1';
    const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

    let backdrop = document.querySelector('.mobile-nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'mobile-nav-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.appendChild(backdrop);
    }

    function sync(open) {
      const value = Boolean(open) && isMobile();
      links.classList.toggle('is-open', value);
      toggle.classList.toggle('is-open', value);
      toggle.classList.toggle('active', value);
      backdrop.classList.toggle('is-open', value);
      toggle.setAttribute('aria-expanded', value ? 'true' : 'false');
      toggle.setAttribute('aria-label', value ? 'Close navigation menu' : 'Open navigation menu');
      document.body.classList.toggle('mobile-menu-open', value);
    }

    function handleToggle(event) {
      if (!isMobile()) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      sync(!links.classList.contains('is-open'));
    }

    toggle.addEventListener('click', handleToggle, true);
    backdrop.addEventListener('click', () => sync(false));

    links.addEventListener('click', function (event) {
      const anchor = event.target.closest('a');
      if (anchor && isMobile()) sync(false);
    }, true);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') sync(false);
    });

    window.addEventListener('resize', function () {
      if (!isMobile()) sync(false);
    }, { passive:true });

    sync(false);
  }

  function setupTyping() {
    const el = document.querySelector('.hero-sub');
    if (!el || el.dataset.heroTypingV3 === '1') return;
    el.dataset.heroTypingV3 = '1';
    el.classList.add('hero-typing');

    const phrases = [
      'Web Development · UI/UX Design · API Integration',
      'Node.js · Laravel · JavaScript · REST APIs',
      'Webhooks · Automation · Server Architecture',
      'End-to-End Digital Systems That Work.'
    ];
    el.innerHTML = '<span class="hero-typing-text"></span><span class="hero-typing-cursor" aria-hidden="true"></span>';
    const target = el.querySelector('.hero-typing-text');
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (reduce) { target.textContent = phrases[0]; return; }

    let phraseIndex=0, charIndex=0, deleting=false;
    function tick() {
      const phrase=phrases[phraseIndex];
      if (!deleting) {
        charIndex++;
        target.textContent=phrase.slice(0,charIndex);
        if (charIndex>=phrase.length) { deleting=true; setTimeout(tick,1500); return; }
        setTimeout(tick,42);
      } else {
        charIndex--;
        target.textContent=phrase.slice(0,charIndex);
        if (charIndex<=0) { deleting=false; phraseIndex=(phraseIndex+1)%phrases.length; setTimeout(tick,280); return; }
        setTimeout(tick,24);
      }
    }
    tick();
  }

  function getStatValues() {
    const fallback={projects:3,services:6,clients:4};
    try {
      const store=window.PortfolioData;
      if (!store || typeof store.get!=='function') return fallback;
      const visible=(key)=>{
        const data=store.get(key);
        if (!Array.isArray(data)) return 0;
        return data.filter(item=>item && item.visible!==false && item.active!==false).length;
      };
      return { projects:visible('projects')||fallback.projects, services:visible('services')||fallback.services, clients:visible('clients')||fallback.clients };
    } catch (_) { return fallback; }
  }

  function setupStats() {
    const stats=document.querySelector('.hero-stats');
    if (!stats || stats.dataset.statsV3==='1') return;
    stats.dataset.statsV3='1';
    const elements=[stats.querySelector('#stat-projects .stat-num'),stats.querySelector('#stat-services .stat-num'),stats.querySelector('#stat-clients .stat-num')];
    if (elements.some(e=>!e)) return;

    let values=[];
    let running=false;
    let hasAnimated=false;

    function refreshTargets(){
      const next=getStatValues();
      values=[next.projects,next.services,next.clients];
      if(!running&&!hasAnimated) elements.forEach(e=>e.textContent='0+');
    }
    function setValue(e,v){e.textContent=`${v}+`;}
    function animate(){
      if(running||!values.length)return;
      running=true; hasAnimated=true;
      const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
      elements.forEach(e=>e.closest('.stat')?.classList.add('stat-counting'));
      if(reduce){elements.forEach((e,i)=>setValue(e,values[i]));elements.forEach(e=>e.closest('.stat')?.classList.remove('stat-counting'));running=false;return;}
      const start=performance.now(),duration=1100;
      function frame(now){
        const progress=Math.min(1,(now-start)/duration);
        const eased=1-Math.pow(1-progress,3);
        elements.forEach((e,i)=>setValue(e,Math.floor(values[i]*eased)));
        if(progress<1){requestAnimationFrame(frame);return;}
        elements.forEach((e,i)=>{setValue(e,values[i]);e.closest('.stat')?.classList.remove('stat-counting');});
        running=false;
      }
      requestAnimationFrame(frame);
    }
    function reset(){if(running)return;elements.forEach(e=>setValue(e,0));hasAnimated=false;}

    refreshTargets();
    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){refreshTargets();animate();}else{reset();}}),{threshold:.45});
      observer.observe(stats);
    } else animate();

    if(window.__portfolioInitialLoad&&typeof window.__portfolioInitialLoad.then==='function') window.__portfolioInitialLoad.then(refreshTargets);
    setInterval(()=>{
      const before=values.join(',');
      refreshTargets();
      if(before!==values.join(',')){const rect=stats.getBoundingClientRect();if(rect.bottom>0&&rect.top<window.innerHeight)animate();}
    },2500);
  }

  function init(){injectStyles();setupMobileNavigation();setupTyping();setupStats();}
  function start(){init();setTimeout(init,300);setTimeout(init,1200);}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
