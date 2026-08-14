/* View All controls for What I Build + Trusted Work. Marquee stays active until expanded. */
(function () {
  'use strict';

  const sections = [
    { heading: /what\s+i\s+build/i, track: '#servicesGrid', marquee: '.services-marquee', card: '.service-card', label: 'View all services' },
    { heading: /trusted\s+work/i, track: '#clientsGrid', marquee: '.clients-marquee', card: '.client-card', label: 'View all work' }
  ];

  function initSection(config) {
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
    const heading = headings.find(h => config.heading.test(h.textContent || ''));
    if (!heading) return;

    const section = heading.closest('section');
    const marquee = section?.querySelector(config.marquee);
    const track = section?.querySelector(config.track);
    if (!section || !marquee || !track || section.querySelector('.marquee-view-all-btn')) return;

    const wrap = document.createElement('div');
    wrap.className = 'marquee-view-all-wrap';
    wrap.innerHTML = `<button type="button" class="marquee-view-all-btn" aria-expanded="false"><span>${config.label}</span><span class="marquee-view-all-icon">＋</span></button>`;
    marquee.insertAdjacentElement('afterend', wrap);

    const button = wrap.querySelector('button');
    button.addEventListener('click', () => {
      const expanded = section.classList.toggle('marquee-expanded');
      button.setAttribute('aria-expanded', String(expanded));
      button.querySelector('span:first-child').textContent = expanded ? 'Show scrolling view' : config.label;
      button.querySelector('.marquee-view-all-icon').textContent = expanded ? '−' : '＋';
      if (expanded) section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  function init() { sections.forEach(initSection); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
