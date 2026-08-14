/*
 * FRONTEND SERVICES ENHANCEMENT
 * Keeps the existing services marquee but uses image visuals for every service.
 */
(function () {
  'use strict';

  const SERVICE_PLACEHOLDER = '/assets/images/service-placeholder.svg';

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function safeUrl(value) {
    const v = String(value || '').trim();
    return /^(https?:\/\/|\/|#|mailto:)/i.test(v) ? v : '#';
  }

  function renderProfessionalServices() {
    const container = document.querySelector('#servicesGrid');
    if (!container || !window.PortfolioData) return;

    const services = PortfolioData.get('services');
    if (!Array.isArray(services)) return;

    const visible = services
      .filter(Boolean)
      .filter((s) => s.visible !== false && s.active !== false)
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

    if (!visible.length) return;

    const card = (s) => {
      const image = safeUrl(s.image) !== '#' ? safeUrl(s.image) : SERVICE_PLACEHOLDER;
      const features = Array.isArray(s.features) ? s.features.slice(0, 4) : [];
      const technologies = Array.isArray(s.technologies) ? s.technologies.slice(0, 6) : [];
      const link = safeUrl(s.url || s.link);
      const name = s.name || 'Service';

      return `
        <article class="service-card professional-service-card">
          <div class="service-image">
            <img
              src="${esc(image)}"
              alt="${esc(name)}"
              loading="lazy"
              decoding="async"
              onerror="this.onerror=null;this.src='${SERVICE_PLACEHOLDER}'"
            >
          </div>
          <h3 class="service-title">${esc(name)}</h3>
          ${s.category ? `<div class="service-category">${esc(s.category)}</div>` : ''}
          <p class="service-desc">${esc(s.desc || s.description || '')}</p>
          ${s.longDescription ? `<p class="service-long-desc">${esc(s.longDescription)}</p>` : ''}
          ${technologies.length ? `<div class="service-tech">${technologies.map((t) => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
          ${features.length ? `<ul class="service-features">${features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
          ${(s.price || s.deliveryTime) ? `<div class="service-meta">${s.price ? `<span>${esc(s.price)}</span>` : ''}${s.deliveryTime ? `<span>${esc(s.deliveryTime)}</span>` : ''}</div>` : ''}
          ${s.featured ? `<div class="service-featured">Featured</div>` : ''}
          ${link !== '#' ? `<a class="btn btn-ghost service-cta" href="${esc(link)}" target="_blank" rel="noopener">View Service ↗</a>` : ''}
        </article>`;
    };

    const html = visible.map(card).join('');
    container.innerHTML = html + html;
    container.dataset.marqueeReady = 'true';
  }

  document.addEventListener('DOMContentLoaded', renderProfessionalServices);
  window.refreshProfessionalServices = renderProfessionalServices;
})();
