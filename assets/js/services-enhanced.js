/*
 * FRONTEND SERVICES ENHANCEMENT
 * Keeps the existing services marquee but presents a clean service preview.
 * Full details remain available through the existing portfolio details modal.
 */
(function () {
  'use strict';

  const SERVICE_PLACEHOLDER = '/assets/images/service-placeholder.svg';

  function hideLegacyServiceIcon() {
    if (document.getElementById('services-image-only-style')) return;
    const style = document.createElement('style');
    style.id = 'services-image-only-style';
    style.textContent = `
      #services .service-icon { display:none !important; }
      #services .professional-service-card .service-image,
      #services .professional-service-card .service-image img {
        display:block;
      }
      #services .professional-service-card .service-image {
        width:100%;
        aspect-ratio:16/10;
        overflow:hidden;
        border-radius:18px;
        margin-bottom:18px;
        background:rgba(255,255,255,.04);
      }
      #services .professional-service-card .service-image img {
        width:100%;
        height:100%;
        object-fit:cover;
      }
      #services .professional-service-card {
        cursor:pointer;
      }
    `;
    document.head.appendChild(style);
  }

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function safeUrl(value) {
    const v = String(value || '').trim();
    return /^(https?:\/\/|\/|#|mailto:)/i.test(v) ? v : '#';
  }

  function renderProfessionalServices() {
    hideLegacyServiceIcon();

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
      const name = s.name || 'Service';
      const shortDescription = s.desc || s.shortDescription || s.description || '';

      return `
        <article class="service-card professional-service-card">
          <div class="service-image">
            <img
              src="${esc(image)}"
              alt="${esc(name)}"
              loading="lazy"
              decoding="async"
              draggable="false"
              onerror="this.onerror=null;this.src='${SERVICE_PLACEHOLDER}'"
            >
          </div>
          <h3 class="service-title">${esc(name)}</h3>
          <p class="service-desc">${esc(shortDescription)}</p>
        </article>`;
    };

    const html = visible.map(card).join('');
    // Two identical copies make the existing CSS marquee continuous.
    container.innerHTML = html + html;
    container.dataset.marqueeReady = 'true';
  }

  hideLegacyServiceIcon();
  document.addEventListener('DOMContentLoaded', renderProfessionalServices);
  window.refreshProfessionalServices = renderProfessionalServices;

  const refreshPortfolio = window.refreshPortfolio;
  if (typeof refreshPortfolio === 'function') {
    window.refreshPortfolio = function () {
      refreshPortfolio();
      renderProfessionalServices();
    };
  }
})();
