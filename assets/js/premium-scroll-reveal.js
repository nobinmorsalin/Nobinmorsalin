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
    '.professional-service-card',
    '.service-card',
    '.project-card',
    '.client-card',
    '.workflow-step',
    '.contact-info',
    '.contact-form-wrap'
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
    `;
    document.head.appendChild(style);

    const elements = [];
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (el.classList.contains('premium-reveal')) return;
        // Avoid revealing duplicate marquee copies individually; the marquee itself remains animated.
        if (el.closest('.services-track, .clients-track') && !el.classList.contains('service-card') && !el.classList.contains('client-card')) return;
        el.classList.add('premium-reveal');
        const parent = el.parentElement;
        const siblings = parent ? Array.from(parent.children).filter(x => x.matches && x.matches(selector)) : [];
        const index = Math.max(0, siblings.indexOf(el));
        el.dataset.revealIndex = index;
        el.style.setProperty('--reveal-delay', `${Math.min(index * 65, 260)}ms`);
        elements.push(el);
      });
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else if (entry.boundingClientRect.top > 0) {
          // Replay when the user scrolls back up and the section enters again.
          entry.target.classList.remove('is-visible');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    elements.forEach(el => observer.observe(el));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
