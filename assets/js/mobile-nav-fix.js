/* Mobile navigation + Trusted Work visual polish. */
(function () {
  'use strict';

  function install() {
    if (document.getElementById('mobile-nav-fix-v2')) return;

    const style = document.createElement('style');
    style.id = 'mobile-nav-fix-v2';
    style.textContent = `
      @media (max-width: 680px) {
        /* Keep the existing mobile drawer above its backdrop. */
        .nav#nav { z-index: 10080 !important; }
        .nav#nav .nav-links,
        .nav#nav .nav-links.active,
        .nav#nav .nav-links.open,
        .nav#nav .nav-links.is-open { z-index: 10090 !important; }
        .nav#nav .nav-toggle { z-index: 10100 !important; }
        .mobile-nav-backdrop {
          z-index: 10070 !important;
          backdrop-filter: blur(3px) !important;
          -webkit-backdrop-filter: blur(3px) !important;
        }
      }

      /* Trusted Work — premium contained card, without changing its content. */
      .trusted-work-polished {
        position: relative !important;
        width: min(1180px, calc(100% - 32px)) !important;
        margin-left: auto !important;
        margin-right: auto !important;
        padding: clamp(24px, 4vw, 42px) !important;
        border: 1px solid rgba(255,255,255,.09) !important;
        border-radius: 24px !important;
        background:
          radial-gradient(circle at 15% 0%, rgba(0,245,160,.07), transparent 34%),
          linear-gradient(180deg, rgba(13,20,24,.94), rgba(7,12,15,.92)) !important;
        box-shadow:
          0 24px 70px rgba(0,0,0,.24),
          inset 0 1px 0 rgba(255,255,255,.035) !important;
        overflow: hidden !important;
      }

      .trusted-work-polished .trusted-work-track,
      .trusted-work-polished .clients-track,
      .trusted-work-polished .client-track,
      .trusted-work-polished [class*="marquee"],
      .trusted-work-polished [class*="track"] {
        will-change: transform !important;
      }

      /* Slightly faster than the previous continuous side-scroll. */
      .trusted-work-polished .trusted-work-track,
      .trusted-work-polished .clients-track,
      .trusted-work-polished .client-track,
      .trusted-work-polished [class*="marquee"],
      .trusted-work-polished [class*="track"] {
        animation-duration: 80% !important;
      }

      @media (max-width: 680px) {
        .trusted-work-polished {
          width: calc(100% - 20px) !important;
          padding: 20px 14px !important;
          border-radius: 20px !important;
        }
      }
    `;
    document.head.appendChild(style);

    const links = document.getElementById('navLinks');
    const toggle = document.getElementById('navToggle');
    if (links && toggle) {
      const sync = () => {
        const open = links.classList.contains('is-open') ||
          links.classList.contains('active') ||
          links.classList.contains('open');
        toggle.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      };
      const observer = new MutationObserver(sync);
      observer.observe(links, { attributes: true, attributeFilter: ['class'] });
      sync();
    }

    polishTrustedWork();
  }

  function polishTrustedWork() {
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
    const heading = headings.find(el => /trusted\s+work/i.test(el.textContent || ''));
    if (!heading) return;

    const section = heading.closest('section') || heading.closest('[class*="section"]') || heading.parentElement;
    if (!section) return;
    section.classList.add('trusted-work-polished');

    /* Find the actual animated track without depending on one specific class name. */
    const candidates = Array.from(section.querySelectorAll('*')).filter(el => {
      const cs = getComputedStyle(el);
      const animated = cs.animationName && cs.animationName !== 'none';
      const overflowing = el.scrollWidth > el.clientWidth + 8;
      return animated && (overflowing || /track|marquee|client/i.test(el.className || ''));
    });

    candidates.forEach(el => {
      const cs = getComputedStyle(el);
      const current = parseFloat(cs.animationDuration);
      if (Number.isFinite(current) && current > 0) {
        el.style.setProperty('animation-duration', `${Math.max(8, current * 0.8)}s`, 'important');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
