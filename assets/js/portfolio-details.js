/* =========================================================
   PORTFOLIO DETAILS — Clients / Services / Projects
   Uses the same PortfolioData source as the main frontend.
   ========================================================= */
(function () {
  'use strict';

  const $ = (s, p = document) => p.querySelector(s);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const url = (v) => {
    if (!v) return '#';
    const s = String(v).trim();
    return /^(https?:\/\/|mailto:|\/|#)/i.test(s) ? s : '#';
  };
  const data = (key) => {
    try { return window.PortfolioData?.get?.(key); } catch (_) { return []; }
  };

  function ensureModal() {
    if ($('#portfolioDetailsModal')) return;
    document.body.insertAdjacentHTML('beforeend', `
      <div class="portfolio-details-modal" id="portfolioDetailsModal" aria-hidden="true">
        <div class="portfolio-details-backdrop" data-details-close></div>
        <section class="portfolio-details-dialog" role="dialog" aria-modal="true" aria-labelledby="detailsTitle">
          <button class="portfolio-details-close" type="button" data-details-close aria-label="Close">×</button>
          <div id="detailsContent"></div>
        </section>
      </div>
    `);
    $('[data-details-close]', $('#portfolioDetailsModal')).addEventListener('click', close);
  }

  function open(item, type) {
    ensureModal();
    const modal = $('#portfolioDetailsModal');
    const content = $('#detailsContent');
    const title = item.title || item.name || 'Details';
    const image = item.image || item.thumbnail || item.logo || item.imageUrl || '';
    const tags = Array.isArray(item.tags) ? item.tags : (Array.isArray(item.technologies) ? item.technologies : []);
    const features = Array.isArray(item.features) ? item.features : (Array.isArray(item.included) ? item.included : []);
    const technologies = Array.isArray(item.technologies) ? item.technologies : [];
    const live = url(item.live || item.url || item.demo || item.website);
    const github = url(item.github || item.githubUrl);
    const service = item.service || item.services || '';

    let body = '';
    if (type === 'client') {
      body = `
        <div class="details-hero details-client-hero">
          ${image ? `<img src="${esc(url(image))}" alt="${esc(title)} logo" class="details-main-image details-client-image">` : `<div class="details-image-fallback">${esc(title.charAt(0))}</div>`}
          <div><span class="details-kicker">Client</span><h2 id="detailsTitle">${esc(title)}</h2><p>${esc(item.shortDescription || item.description || service || 'Client partnership')}</p></div>
        </div>
        <div class="details-grid">
          ${item.industry ? `<div><b>Industry</b><span>${esc(item.industry)}</span></div>` : ''}
          ${service ? `<div><b>Service</b><span>${esc(service)}</span></div>` : ''}
          ${item.location ? `<div><b>Location</b><span>${esc(item.location)}</span></div>` : ''}
          ${item.testimonial ? `<div class="details-wide"><b>Testimonial</b><span>${esc(item.testimonial)}</span></div>` : ''}
        </div>
        ${live !== '#' ? `<div class="details-actions"><a class="details-primary" href="${esc(live)}" target="_blank" rel="noopener noreferrer">Visit Website ↗</a></div>` : ''}
      `;
    } else if (type === 'service') {
      body = `
        ${image ? `<img src="${esc(url(image))}" alt="${esc(title)}" class="details-cover-image">` : ''}
        <span class="details-kicker">${esc(item.category || 'Service')}</span>
        <h2 id="detailsTitle">${esc(title)}</h2>
        <p class="details-lead">${esc(item.longDescription || item.detailedDescription || item.description || item.desc || '')}</p>
        ${technologies.length ? `<div class="details-section"><h3>Technologies & Tools</h3><div class="details-tags">${technologies.map(x => `<span>${esc(x)}</span>`).join('')}</div></div>` : ''}
        ${features.length ? `<div class="details-section"><h3>What's Included</h3><ul class="details-list">${features.map(x => `<li>${esc(typeof x === 'object' ? (x.name || x.title || '') : x)}</li>`).join('')}</ul></div>` : ''}
        <div class="details-meta">${item.price ? `<span><b>Starting at</b>${esc(item.price)}</span>` : ''}${item.deliveryTime || item.delivery ? `<span><b>Delivery</b>${esc(item.deliveryTime || item.delivery)}</span>` : ''}</div>
        ${live !== '#' ? `<div class="details-actions"><a class="details-primary" href="${esc(live)}" target="_blank" rel="noopener noreferrer">View Service ↗</a></div>` : `<div class="details-actions"><a class="details-primary" href="#contact" data-details-close>Get This Service →</a></div>`}
      `;
    } else {
      body = `
        ${image ? `<img src="${esc(url(image))}" alt="${esc(title)}" class="details-cover-image">` : ''}
        <span class="details-kicker">${esc(item.category || 'Project')}</span>
        <h2 id="detailsTitle">${esc(title)}</h2>
        <p class="details-lead">${esc(item.fullDescription || item.longDescription || item.description || item.desc || '')}</p>
        ${item.challenge || item.idea ? `<div class="details-section"><h3>Project Idea / Challenge</h3><p>${esc(item.challenge || item.idea)}</p></div>` : ''}
        ${item.solution ? `<div class="details-section"><h3>Solution</h3><p>${esc(item.solution)}</p></div>` : ''}
        ${item.client ? `<div class="details-section"><h3>Client</h3><p>${esc(typeof item.client === 'object' ? (item.client.name || '') : item.client)}</p></div>` : ''}
        ${tags.length ? `<div class="details-section"><h3>Technologies</h3><div class="details-tags">${tags.map(x => `<span>${esc(typeof x === 'object' ? (x.name || x.title || '') : x)}</span>`).join('')}</div></div>` : ''}
        ${item.completionDate || item.date ? `<div class="details-meta"><span><b>Completed</b>${esc(item.completionDate || item.date)}</span></div>` : ''}
        <div class="details-actions">
          ${live !== '#' ? `<a class="details-primary" href="${esc(live)}" target="_blank" rel="noopener noreferrer">Visit Live Website ↗</a>` : ''}
          ${github !== '#' ? `<a class="details-secondary" href="${esc(github)}" target="_blank" rel="noopener noreferrer">View Source Code ↗</a>` : ''}
        </div>
      `;
    }

    content.innerHTML = body;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('details-modal-open');
  }

  function close() {
    const modal = $('#portfolioDetailsModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('details-modal-open');
  }

  function bind() {
    const services = Array.isArray(data('services')) ? data('services').filter(x => x && x.visible !== false && x.active !== false) : [];
    const projects = Array.isArray(data('projects')) ? data('projects').filter(x => x && x.visible !== false && x.active !== false) : [];
    const clients = Array.isArray(data('clients')) ? data('clients').filter(x => x && x.visible !== false && x.active !== false) : [];

    const serviceCards = $$('#servicesGrid .service-card');
    serviceCards.slice(0, services.length).forEach((card, i) => {
      card.classList.add('details-clickable');
      card.addEventListener('click', (e) => { if (!e.target.closest('a,button')) open(services[i], 'service'); });
    });

    $$('#projectsGrid .project-card').forEach((card) => {
      const title = card.querySelector('.project-title')?.textContent?.trim();
      const item = projects.find(p => (p.title || p.name || 'Project') === title);
      if (!item) return;
      card.classList.add('details-clickable');
      card.addEventListener('click', (e) => { if (!e.target.closest('a,button')) open(item, 'project'); });
    });

    $$('#clientsGrid .client-card').forEach((card) => {
      const title = card.querySelector('.client-name')?.textContent?.trim();
      const item = clients.find(c => (c.name || c.title || 'Client') === title);
      if (!item) return;
      card.classList.add('details-clickable');
      card.addEventListener('click', (e) => {
        e.preventDefault();
        open(item, 'client');
      });
    });
  }

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  window.addEventListener('portfolio:data-ready', () => setTimeout(bind, 0));
  window.addEventListener('load', () => setTimeout(bind, 150));
})();
