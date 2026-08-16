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
      @media (prefers-reduced-motion: reduce) {
        .premium-reveal {
          opacity: 1 !important;
          transform: none !important;
          filter: none !important;
          transition: none !important;
        }
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
