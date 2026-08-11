/* =========================================================
   NOBIN MORSALIN — MAIN FRONTEND
   ========================================================= */

(function () {
  'use strict';

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  function escapeHTML(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function safeUrl(url) {
    if (!url) return '#';
    const value = String(url).trim();
    if (
      value.startsWith('https://') ||
      value.startsWith('http://') ||
      value.startsWith('/') ||
      value.startsWith('#') ||
      value.startsWith('mailto:')
    ) return value;
    return '#';
  }

  function getData(key) {
    try {
      if (window.PortfolioData && typeof window.PortfolioData.get === 'function') {
        return window.PortfolioData.get(key);
      }
    } catch (error) {
      console.warn(`Could not load ${key}:`, error);
    }
    return [];
  }

  function getSettings() {
    const settings = getData('settings');
    return settings && typeof settings === 'object' ? settings : {};
  }

  function renderSettings() {
    const settings = getSettings();
    const name = settings.name || 'Nobin Morsalin';
    const email = settings.email || 'admin@nobin.dev';

    $$('.logo-name').forEach((element) => {
      element.textContent = name.split(' ')[0] || 'Nobin';
    });

    $$('.logo-lastname').forEach((element) => {
      const parts = name.trim().split(/\s+/);
      element.textContent = parts.length > 1 ? ` ${parts.slice(1).join(' ')}` : '';
    });

    const aboutTitle = $('#aboutTitle');
    if (aboutTitle && settings.name) {
      aboutTitle.textContent = `Hello, I'm ${settings.name.split(' ')[0]}`;
    }

    const contactEmail = $('#contactEmail');
    if (contactEmail) contactEmail.textContent = email;

    document.title = `${name} — Full-Stack Developer`;
  }

  function renderAbout() {
    const about = getData('about');
    if (!about || typeof about !== 'object') return;

    const title = $('#aboutTitle');
    if (title && about.title) title.textContent = about.title;

    const textContainer = $('#aboutText');
    if (textContainer) {
      const paragraphs = [];
      if (about.bio1) paragraphs.push(`<p>${escapeHTML(about.bio1)}</p>`);
      if (about.bio2) paragraphs.push(`<p>${escapeHTML(about.bio2)}</p>`);
      if (paragraphs.length) textContainer.innerHTML = paragraphs.join('');
    }
  }

  function renderProfileImage() {
    const image = $('#profileImg');
    if (!image) return;

    const settings = getSettings();
    const imageUrl = settings.profileImage || settings.profile_image || settings.avatar || settings.photo;
    if (imageUrl) image.src = imageUrl;
  }

  function renderSkills() {
    const container = $('#skillsGrid');
    if (!container) return;

    const skills = getData('skills');
    if (!Array.isArray(skills)) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = skills.filter(Boolean).map((skill) => {
      const value = typeof skill === 'object' ? skill.name || skill.title || '' : skill;
      if (!value) return '';
      return `<div class="skill-tag">${escapeHTML(value)}</div>`;
    }).join('');
  }

  function serviceCard(service) {
    const icon = service.icon || service.emoji || '⚡';
    const name = service.name || service.title || 'Service';
    const description = service.desc || service.description || 'Professional digital solution.';

    return `
      <article class="service-card">
        <div class="service-icon">${escapeHTML(icon)}</div>
        <h3 class="service-title">${escapeHTML(name)}</h3>
        <p class="service-desc">${escapeHTML(description)}</p>
      </article>
    `;
  }

  function renderServices() {
    const container = $('#servicesGrid');
    if (!container) return;

    const services = getData('services');
    if (!Array.isArray(services)) {
      container.innerHTML = '';
      return;
    }

    const visibleServices = services.filter((service) => {
      if (!service) return false;
      return service.visible !== false && service.active !== false;
    });

    if (!visibleServices.length) {
      container.innerHTML = `
        <div class="service-card">
          <div class="service-icon">⚡</div>
          <h3 class="service-title">Services coming soon</h3>
          <p class="service-desc">New services will be added soon.</p>
        </div>
      `;
      return;
    }

    const firstSet = visibleServices.map(serviceCard).join('');
    const secondSet = visibleServices.map(serviceCard).join('');
    container.innerHTML = firstSet + secondSet;
    container.dataset.marqueeReady = 'true';
  }

  function clientCard(client) {
    const name = client.name || client.title || 'Client';
    const service = client.service || client.services || client.description || 'Digital Solution';
    const logo = client.logo || client.image || client.imageUrl || '';
    let visual = '';

    if (logo) {
      visual = `
        <img src="${escapeHTML(safeUrl(logo))}" alt="${escapeHTML(name)} logo" class="client-logo" loading="lazy"
          onerror="this.style.display='none';this.nextElementSibling.style.display='grid';" />
        <span class="client-logo-fallback" style="display:none" aria-hidden="true">${escapeHTML(name.charAt(0).toUpperCase())}</span>
      `;
    } else {
      visual = `<span class="client-logo-fallback" aria-hidden="true">${escapeHTML(name.charAt(0).toUpperCase())}</span>`;
    }

    const website = safeUrl(client.website || client.url || client.link);
    const content = `
      <div class="client-visual">${visual}</div>
      <div class="client-info">
        <div class="client-name">${escapeHTML(name)}</div>
        <div class="client-service">${escapeHTML(service)}</div>
      </div>
    `;

    if (website !== '#') {
      return `<a href="${escapeHTML(website)}" class="client-card" target="_blank" rel="noopener noreferrer">${content}</a>`;
    }

    return `<article class="client-card">${content}</article>`;
  }

  function renderClients() {
    const container = $('#clientsGrid');
    if (!container) return;

    const clients = getData('clients');
    if (!Array.isArray(clients)) {
      container.innerHTML = '';
      return;
    }

    const visibleClients = clients.filter((client) => {
      if (!client) return false;
      return client.visible !== false && client.active !== false;
    });

    if (!visibleClients.length) {
      container.innerHTML = `
        <article class="client-card">
          <span class="client-logo-fallback">+</span>
          <div class="client-info">
            <div class="client-name">Your Brand</div>
            <div class="client-service">Become a client</div>
          </div>
        </article>
      `;
      return;
    }

    const firstSet = visibleClients.map(clientCard).join('');
    const secondSet = visibleClients.map(clientCard).join('');
    container.innerHTML = secondSet + firstSet;
    container.dataset.marqueeReady = 'true';
  }

  function projectCard(project) {
    const title = project.title || project.name || 'Project';
    const description = project.desc || project.description || '';
    const image = project.image || project.thumbnail || '';
    const tags = Array.isArray(project.tags) ? project.tags : [];

    const imageHTML = image
      ? `<div class="project-image"><img src="${escapeHTML(safeUrl(image))}" alt="${escapeHTML(title)}" loading="lazy" /></div>`
      : `<div class="project-image project-image-placeholder"><span>⌘</span></div>`;

    const tagsHTML = tags.map(tag => `<span class="project-tag">${escapeHTML(tag)}</span>`).join('');
    const live = safeUrl(project.live || project.url || project.demo);
    const github = safeUrl(project.github);

    return `
      <article class="project-card" data-category="${escapeHTML(project.category || 'all')}">
        ${imageHTML}
        <div class="project-content">
          <div class="project-tags">${tagsHTML}</div>
          <h3 class="project-title">${escapeHTML(title)}</h3>
          <p class="project-desc">${escapeHTML(description)}</p>
          <div class="project-links">
            ${live !== '#' ? `<a href="${escapeHTML(live)}" target="_blank" rel="noopener noreferrer">Live ↗</a>` : ''}
            ${github !== '#' ? `<a href="${escapeHTML(github)}" target="_blank" rel="noopener noreferrer">Code ↗</a>` : ''}
          </div>
        </div>
      </article>
    `;
  }

  function renderProjects() {
    const container = $('#projectsGrid');
    if (!container) return;

    const projects = getData('projects');
    if (!Array.isArray(projects)) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = projects.filter(Boolean).map(projectCard).join('');
    setupProjectFilters(projects);
  }

  function setupProjectFilters(projects) {
    const filterBar = $('#filterBar');
    if (!filterBar) return;

    const categories = ['all', ...new Set(projects.map(project => project.category).filter(Boolean))];

    filterBar.innerHTML = categories.map(category => `
      <button class="filter-btn ${category === 'all' ? 'active' : ''}" data-filter="${escapeHTML(category)}" type="button">
        ${escapeHTML(category === 'all' ? 'All' : category)}
      </button>
    `).join('');

    $$('.filter-btn', filterBar).forEach(button => {
      button.addEventListener('click', () => {
        $$('.filter-btn', filterBar).forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const filter = button.dataset.filter;
        $$('.project-card').forEach(card => {
          const category = card.dataset.category || 'all';
          card.style.display = filter === 'all' || category === filter ? '' : 'none';
        });
      });
    });
  }

  function renderWorkflow() {
    const container = $('#workflowGrid');
    if (!container) return;

    const steps = getData('workflow');
    if (!Array.isArray(steps)) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = steps.filter(Boolean).map((step, index) => `
      <article class="workflow-step">
        <div class="workflow-number">${index + 1}</div>
        <div class="workflow-icon">${escapeHTML(step.icon || '⚙️')}</div>
        <h3>${escapeHTML(step.title || '')}</h3>
        <p>${escapeHTML(step.desc || '')}</p>
      </article>
    `).join('');
  }

  function renderStats() {
    const services = getData('services');
    const projects = getData('projects');
    const clients = getData('clients');
    const stats = {
      services: Array.isArray(services) ? services.length : 0,
      projects: Array.isArray(projects) ? projects.length : 0,
      clients: Array.isArray(clients) ? clients.length : 0,
    };

    $$('[data-stat="services"]').forEach(el => { el.textContent = stats.services; });
    $$('[data-stat="projects"]').forEach(el => { el.textContent = stats.projects; });
    $$('[data-stat="clients"]').forEach(el => { el.textContent = stats.clients; });
  }

  function setupNavigation() {
    const menuButton = $('#menuToggle');
    const nav = $('#mainNav');
    if (!menuButton || !nav) return;

    menuButton.addEventListener('click', () => nav.classList.toggle('open'));
    $$('.nav-link', nav).forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));
  }

  function setupContactForm() {
    const form = $('#contactForm');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton?.textContent || '';
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }

      try {
        const formData = new FormData(form);
        const response = await fetch('/api/contact', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) throw new Error(result.error || 'Failed to send message.');

        form.reset();
        alert('Message sent successfully.');
      } catch (error) {
        console.error('Contact form error:', error);
        alert(error.message || 'Could not send your message.');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        }
      }
    });
  }

  function setupSmoothScroll() {
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', event => {
        const id = link.getAttribute('href');
        if (!id || id === '#') return;
        const target = $(id);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function setupImageFallbacks() {
    $$('img').forEach(image => {
      image.addEventListener('error', () => image.classList.add('image-error'), { once: true });
    });
  }

  /* =======================================================
     INITIALIZATION
  ======================================================= */

  async function init() {
    try {
      if (window.PortfolioData && typeof window.PortfolioData.load === 'function') {
        await window.PortfolioData.load();
      }
    } catch (error) {
      console.error('Portfolio data load failed:', error);
    }

    renderSettings();
    renderAbout();
    renderProfileImage();
    renderSkills();
    renderServices();
    renderClients();
    renderProjects();
    renderWorkflow();
    renderStats();

    setupNavigation();
    setupContactForm();
    setupSmoothScroll();
    setupImageFallbacks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();