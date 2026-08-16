/* Premium scroll reveal — additive, accessible and mobile-friendly. */
(() => {
  'use strict';

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const selectors = [
    '.section-label',
    '.section-title',
    '.section-sub',
    '.about-image-wrap',
    '.about-content',
    '.project-card',
    '.workflow-step',
    '.contact-info',
    '.contact-desc',
    '.contact-item',
    '.contact-form-wrap',
    '.form-group',
    '#submitBtn'
  ];

  const dynamicRoots = [
    '#projectsGrid',
    '#workflowSteps',
    '#contactItems',
    '#contactForm'
  ];

  function install() {
    const style = document.createElement('style');
    style.id = 'premium-scroll-reveal-style';
    if (document.getElementById(style.id)) return;
    style.textContent = `
      .premium-reveal {
        opacity: 0;
        transform: translate3d(0, 34px, 0) scale(.985);
        filter: blur(5px);
        transition: opacity .72s cubic-bezier(.22,1,.36,1),
                    transform .72s cubic-bezier(.22,1,.36,1),
                    filter .72s cubic-bezier(.22,1,.36,1);
        transition-delay: var(--reveal-delay, 0ms);
        will-change: opacity, transform, filter;
      }
      .premium-reveal.is-visible {
        opacity: 1;
        transform: translate3d(0,0,0) scale(1);
        filter: blur(0);
      }
      .premium-reveal[data-reveal-index] { --reveal-delay: 0ms; }
      @media (max-width: 680px) {
        .premium-reveal {
          transform: translate3d(0, 22px, 0) scale(.99);
          filter: blur(3px);
          transition-duration: .58s;
        }
      }

      /* About section: cinematic but lightweight motion layer. */
      .about-image-wrap { perspective: 1000px; }
      .about-image-frame {
        isolation: isolate;
        box-shadow: 0 24px 70px rgba(0,0,0,.32), 0 0 0 1px rgba(0,245,160,.04);
        transition: transform .9s cubic-bezier(.22,1,.36,1), box-shadow .9s ease;
      }
      .about-image-wrap.is-visible .about-image-frame {
        animation: aboutFrameFloat 7s ease-in-out 1.05s infinite;
        box-shadow: 0 28px 80px rgba(0,0,0,.38), 0 0 55px rgba(0,245,160,.07);
      }
      .about-image-frame::before {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        padding: 1px;
        background: conic-gradient(from 180deg, transparent 0deg, rgba(0,245,160,.55) 55deg, transparent 115deg, rgba(0,212,255,.4) 205deg, transparent 275deg);
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        opacity: 0;
        animation: aboutOrbit 6s linear 1.1s infinite;
        pointer-events: none;
        z-index: 3;
      }
      .about-image-wrap.is-visible .about-image-frame::before { opacity: .9; }
      .about-img {
        transform: scale(1.015);
        transition: transform 1.1s cubic-bezier(.22,1,.36,1), filter 1.1s ease;
        filter: saturate(.96) contrast(1.02);
      }
      .about-image-wrap.is-visible .about-img {
        animation: aboutImageBreathe 8s ease-in-out 1.15s infinite;
      }
      .about-image-frame::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(115deg, transparent 28%, rgba(255,255,255,.10) 45%, transparent 58%);
        transform: translateX(-120%);
        animation: aboutImageSweep 5.5s cubic-bezier(.22,1,.36,1) 1.25s infinite;
        pointer-events: none;
        z-index: 2;
      }
      .about-badge {
        transition: transform .6s cubic-bezier(.22,1,.36,1), box-shadow .6s ease;
      }
      .about-image-wrap.is-visible .about-badge {
        animation: aboutBadgeFloat 4.5s ease-in-out 1.3s infinite;
        box-shadow: 0 18px 45px rgba(0,0,0,.38), 0 0 28px rgba(0,245,160,.07);
      }
      .about-badge .badge-icon { animation: aboutBadgeIcon 2.8s ease-in-out 1.6s infinite; }

      .about-content.is-visible .section-title {
        animation: aboutTitleIn .85s cubic-bezier(.22,1,.36,1) both;
      }
      .about-content.is-visible .about-text p {
        animation: aboutTextIn .7s cubic-bezier(.22,1,.36,1) both;
      }
      .about-content.is-visible .about-text p:nth-child(1) { animation-delay: .12s; }
      .about-content.is-visible .about-text p:nth-child(2) { animation-delay: .22s; }
      .about-content.is-visible .skills-grid > * {
        animation: aboutChipIn .55s cubic-bezier(.22,1,.36,1) both;
      }
      .about-content.is-visible .skills-grid > *:nth-child(1) { animation-delay: .28s; }
      .about-content.is-visible .skills-grid > *:nth-child(2) { animation-delay: .34s; }
      .about-content.is-visible .skills-grid > *:nth-child(3) { animation-delay: .40s; }
      .about-content.is-visible .skills-grid > *:nth-child(4) { animation-delay: .46s; }
      .about-content.is-visible .skills-grid > *:nth-child(5) { animation-delay: .52s; }
      .about-content.is-visible .skills-grid > *:nth-child(6) { animation-delay: .58s; }
      .about-content.is-visible .skills-grid > *:nth-child(n+7) { animation-delay: .64s; }
      .about-content .btn { transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s ease; }
      .about-content.is-visible .btn { animation: aboutButtonIn .65s cubic-bezier(.22,1,.36,1) .42s both; }
      .about-content .btn:hover { transform: translateY(-3px); }

      @keyframes aboutFrameFloat {
        0%,100% { transform: translateY(0) rotateX(0deg) rotateY(0deg); }
        50% { transform: translateY(-7px) rotateX(.7deg) rotateY(-.7deg); }
      }
      @keyframes aboutImageBreathe {
        0%,100% { transform: scale(1.015); filter: saturate(.96) contrast(1.02); }
        50% { transform: scale(1.035); filter: saturate(1.03) contrast(1.04); }
      }
      @keyframes aboutOrbit { to { transform: rotate(360deg); } }
      @keyframes aboutImageSweep {
        0%,55% { transform: translateX(-120%); }
        72%,100% { transform: translateX(120%); }
      }
      @keyframes aboutBadgeFloat {
        0%,100% { transform: translate3d(0,0,0); }
        50% { transform: translate3d(0,-6px,0); }
      }
      @keyframes aboutBadgeIcon {
        0%,100% { transform: scale(1) rotate(0); }
        50% { transform: scale(1.08) rotate(-5deg); }
      }
      @keyframes aboutTitleIn {
        from { opacity: 0; transform: translate3d(0,16px,0); letter-spacing: -.01em; }
        to { opacity: 1; transform: none; letter-spacing: -.035em; }
      }
      @keyframes aboutTextIn {
        from { opacity: 0; transform: translate3d(18px,10px,0); }
        to { opacity: 1; transform: none; }
      }
      @keyframes aboutChipIn {
        from { opacity: 0; transform: translate3d(0,12px,0) scale(.96); }
        to { opacity: 1; transform: none; }
      }
      @keyframes aboutButtonIn {
        from { opacity: 0; transform: translate3d(0,12px,0); }
        to { opacity: 1; transform: none; }
      }

      @media (max-width: 760px) {
        .about-grid { gap: 54px; }
        .about-image-frame { max-width: 100%; }
        .about-image-wrap.is-visible .about-image-frame { animation-duration: 8s; }
        .about-image-frame::after { animation-duration: 6.5s; }
        .about-content.is-visible .about-text p { transform: translate3d(10px,8px,0); }
      }

      @media (prefers-reduced-motion: reduce) {
        .premium-reveal,
        .premium-stagger > * {
          opacity: 1 !important;
          transform: none !important;
          filter: none !important;
          transition: none !important;
        }
        .about-image-wrap.is-visible .about-image-frame,
        .about-image-wrap.is-visible .about-img,
        .about-image-wrap.is-visible .about-badge,
        .about-badge .badge-icon,
        .about-image-frame::before,
        .about-image-frame::after,
        .about-content.is-visible .section-title,
        .about-content.is-visible .about-text p,
        .about-content.is-visible .skills-grid > *,
        .about-content.is-visible .btn {
          animation: none !important;
        }
        .about-image-frame::before,
        .about-image-frame::after { display: none !important; }
      }
    `;
    document.head.appendChild(style);

    const observed = new WeakSet();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          // Reset in both directions so every re-entry can animate again.
          entry.target.classList.remove('is-visible');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    function collect(root = document) {
      selectors.forEach(selector => {
        const nodes = root.matches?.(selector)
          ? [root]
          : Array.from(root.querySelectorAll(selector));

        nodes.forEach(el => {
          // Marquee cards already have continuous motion; don't make them
          // repeatedly fade as they pass through the viewport.
          if (el.closest('.services-track, .clients-track')) return;
          if (observed.has(el)) return;

          el.classList.add('premium-reveal');
          const parent = el.parentElement;
          const siblings = parent
            ? Array.from(parent.children).filter(x => x.matches?.(selector))
            : [];
          const index = Math.max(0, siblings.indexOf(el));
          el.dataset.revealIndex = index;
          el.style.setProperty('--reveal-delay', `${Math.min(index * 65, 260)}ms`);
          observed.add(el);
          observer.observe(el);
        });
      });
    }

    collect();
    dynamicRoots.forEach(selector => {
      const root = document.querySelector(selector);
      if (root) {
        collect(root);
        const mutationObserver = new MutationObserver(() => collect(root));
        mutationObserver.observe(root, { childList: true, subtree: true });
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();