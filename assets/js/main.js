/* =========================================================
   NOBIN MORSALIN — MAIN FRONTEND
   ========================================================= */

(function () {
  'use strict';

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));


  /* =======================================================
     HELPERS
  ======================================================= */

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
    ) {
      return value;
    }

    return '#';
  }


  function getData(key) {
    try {
      if (
        window.PortfolioData &&
        typeof window.PortfolioData.get === 'function'
      ) {
        return window.PortfolioData.get(key);
      }
    } catch (error) {
      console.warn(`Could not load ${key}:`, error);
    }

    return [];
  }


  function getSettings() {
    const settings = getData('settings');

    return settings && typeof settings === 'object'
      ? settings
      : {};
  }


  /* =======================================================
     SITE SETTINGS
  ======================================================= */

  function renderSettings() {
    const settings = getSettings();

    const name =
      settings.name ||
      'Nobin Morsalin';

    const email =
      settings.email ||
      'admin@nobin.dev';


    /* Header */

    $$('.logo-name').forEach((element) => {
      element.textContent = name.split(' ')[0] || 'Nobin';
    });

    $$('.logo-lastname').forEach((element) => {
      const parts = name.trim().split(/\s+/);

      element.textContent =
        parts.length > 1
          ? ` ${parts.slice(1).join(' ')}`
          : '';
    });


    /* About fallback */

    const aboutTitle = $('#aboutTitle');

    if (
      aboutTitle &&
      settings.name
    ) {
      aboutTitle.textContent =
        `Hello, I'm ${settings.name.split(' ')[0]}`;
    }


    /* Contact email */

    const contactEmail = $('#contactEmail');

    if (contactEmail) {
      contactEmail.textContent = email;
    }


    /* Page title */

    document.title =
      `${name} — Full-Stack Developer`;
  }


  /* =======================================================
     ABOUT
  ======================================================= */

  function renderAbout() {
    const about = getData('about');

    if (!about || typeof about !== 'object') {
      return;
    }


    const title = $('#aboutTitle');

    if (title && about.title) {
      title.textContent = about.title;
    }


    const textContainer = $('#aboutText');

    if (textContainer) {

      const paragraphs = [];

      if (about.bio1) {
        paragraphs.push(
          `<p>${escapeHTML(about.bio1)}</p>`
        );
      }

      if (about.bio2) {
        paragraphs.push(
          `<p>${escapeHTML(about.bio2)}</p>`
        );
      }

      if (paragraphs.length) {
        textContainer.innerHTML =
          paragraphs.join('');
      }
    }
  }


  /* =======================================================
     PROFILE IMAGE
  ======================================================= */

  function renderProfileImage() {
    const image = $('#profileImg');

    if (!image) return;

    const settings = getSettings();

    const imageUrl =
      settings.profileImage ||
      settings.profile_image ||
      settings.avatar ||
      settings.photo;

    if (imageUrl) {
      image.src = imageUrl;
    }
  }


  /* =======================================================
     SKILLS
  ======================================================= */

  function renderSkills() {
    const container = $('#skillsGrid');

    if (!container) return;

    const skills = getData('skills');

    if (!Array.isArray(skills)) {
      container.innerHTML = '';
      return;
    }


    container.innerHTML = skills
      .filter(Boolean)
      .map((skill) => {

        const value =
          typeof skill === 'object'
            ? skill.name || skill.title || ''
            : skill;

        if (!value) return '';

        return `
          <div class="skill-tag">
            ${escapeHTML(value)}
          </div>
        `;

      })
      .join('');
  }


  /* =======================================================
     SERVICES
  ======================================================= */

  function serviceCard(service) {

    const icon =
      service.icon ||
      service.emoji ||
      '⚡';

    const name =
      service.name ||
      service.title ||
      'Service';

    const description =
      service.desc ||
      service.description ||
      'Professional digital solution.';


    return `
      <article class="service-card">

        <div class="service-icon">
          ${escapeHTML(icon)}
        </div>

        <h3 class="service-title">
          ${escapeHTML(name)}
        </h3>

        <p class="service-desc">
          ${escapeHTML(description)}
        </p>

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


    const visibleServices =
      services.filter((service) => {

        if (!service) return false;

        if (
          service.visible === false ||
          service.active === false
        ) {
          return false;
        }

        return true;
      });


    if (!visibleServices.length) {
      container.innerHTML = `
        <div class="service-card">
          <div class="service-icon">⚡</div>
          <h3 class="service-title">
            Services coming soon
          </h3>
          <p class="service-desc">
            New services will be added soon.
          </p>
        </div>
      `;

      return;
    }


    /*
      Duplicate the cards.

      This is required for a seamless marquee.
    */

    const firstSet =
      visibleServices
        .map(serviceCard)
        .join('');

    const secondSet =
      visibleServices
        .map(serviceCard)
        .join('');


    container.innerHTML =
      firstSet +
      secondSet;


    container.dataset.marqueeReady = 'true';
  }


  /* =======================================================
     CLIENTS
  ======================================================= */

  function clientCard(client) {

    const name =
      client.name ||
      client.title ||
      'Client';

    const service =
      client.service ||
      client.services ||
      client.description ||
      'Digital Solution';


    const logo =
      client.logo ||
      client.image ||
      client.imageUrl ||
      '';


    let visual = '';


    if (logo) {

      visual = `
        <img
          src="${escapeHTML(safeUrl(logo))}"
          alt="${escapeHTML(name)} logo"
          class="client-logo"
          loading="lazy"
          onerror="
            this.style.display='none';
            this.nextElementSibling.style.display='grid';
          "
        />

        <span
          class="client-logo-fallback"
          style="display:none"
          aria-hidden="true"
        >
          ${escapeHTML(
            name.charAt(0).toUpperCase()
          )}
        </span>
      `;

    } else {

      visual = `
        <span
          class="client-logo-fallback"
          aria-hidden="true"
        >
          ${escapeHTML(
            name.charAt(0).toUpperCase()
          )}
        </span>
      `;
    }


    const website =
      safeUrl(
        client.website ||
        client.url ||
        client.link
      );


    const content = `
      <div class="client-visual">
        ${visual}
      </div>

      <div class="client-info">

        <div class="client-name">
          ${escapeHTML(name)}
        </div>

        <div class="client-service">
          ${escapeHTML(service)}
        </div>

      </div>
    `;


    if (website !== '#') {

      return `
        <a
          href="${escapeHTML(website)}"
          class="client-card"
          target="_blank"
          rel="noopener noreferrer"
        >
          ${content}
        </a>
      `;

    }


    return `
      <article class="client-card">
        ${content}
      </article>
    `;
  }


  function renderClients() {
    const container = $('#clientsGrid');

    if (!container) return;

    const clients = getData('clients');

    if (!Array.isArray(clients)) {
      container.innerHTML = '';
      return;
    }


    const visibleClients =
      clients.filter((client) => {

        if (!client) return false;

        return (
          client.visible !== false &&
          client.active !== false
        );
      });


    if (!visibleClients.length) {

      container.innerHTML = `
        <article class="client-card">

          <span class="client-logo-fallback">
            +
          </span>

          <div class="client-info">

            <div class="client-name">
              Your Brand
            </div>

            <div class="client-service">
              Become a client
            </div>

          </div>

        </article>
      `;

      return;
    }


    /*
      First copy + second copy.

      CSS moves this track from
      LEFT → RIGHT.
    */

    const firstSet =
      visibleClients
        .map(clientCard)
        .join('');

    const secondSet =
      visibleClients
        .map(clientCard)
        .join('');


    /*
      Important:
      We put the duplicate BEFORE the original.

      This makes the left-to-right animation
      seamless.
    */

    container.innerHTML =
      secondSet +
      firstSet;

    container.dataset.marqueeReady = 'true';
  }


  /* =======================================================
     PROJECTS
  ======================================================= */

  function projectCard(project) {

    const title =
      project.title ||
      project.name ||
      'Project';

    const description =
      project.desc ||
      project.description ||
      '';

    const image =
      project.image ||
      project.thumbnail ||
      '';


    const tags =
      Array.isArray(project.tags)
        ? project.tags
        : [];


    const imageHTML =
      image
        ? `
          <div class="project-image">

            <img
              src="${escapeHTML(
                safeUrl(image)
              )}"
              alt="${escapeHTML(title)}"
              loading="lazy"
            />

          </div>
        `
        : `
          <div class="project-image project-image-placeholder">
            <span>⌘</span>
          </div>
        `;


    const tagsHTML =
      tags
        .map(
          tag => `
            <span class="project-tag">
              ${escapeHTML(tag)}
            </span>
          `
        )
        .join('');


    const live =
      safeUrl(
        project.live ||
        project.url ||
        project.demo
      );


    const github =
      safeUrl(project.github);


    return `
      <article
        class="project-card"
        data-category="${escapeHTML(
          project.category || 'all'
        )}"
      >

        ${imageHTML}

        <div class="project-content">

          <div class="project-tags">
            ${tagsHTML}
          </div>

          <h3 class="project-title">
            ${escapeHTML(title)}
          </h3>

          <p class="project-desc">
            ${escapeHTML(description)}
          </p>

          <div class="project-links">

            ${
              live !== '#'
                ? `
                  <a
                    href="${escapeHTML(live)}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Live ↗
                  </a>
                `
                : ''
            }

            ${
              github !== '#'
                ? `
                  <a
                    href="${escapeHTML(github)}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Code ↗
                  </a>
                `
                : ''
            }

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


    container.innerHTML =
      projects
        .filter(Boolean)
        .map(projectCard)
        .join('');


    setupProjectFilters(projects);
  }


  /* =======================================================
     PROJECT FILTERS
  ======================================================= */

  function setupProjectFilters(projects) {

    const filterBar = $('#filterBar');

    if (!filterBar) return;


    const categories = [
      'all',
      ...new Set(
        projects
          .map(project => project.category)
          .filter(Boolean)
      )
    ];


    filterBar.innerHTML =
      categories
        .map(category => {

          const label =
            category === 'all'
              ? 'All'
              : category;

          return `
            <button
              class="filter-btn ${
                category === 'all'
                  ? 'active'
                  : ''
              }"
              data-filter="${escapeHTML(category)}"
              type="button"
            >
              ${escapeHTML(label)}
            </button>
          `;
        })
        .join('');


    $$('.filter-btn', filterBar)
      .forEach(button => {

        button.addEventListener(
          'click',
          () => {

            $$('.filter-btn', filterBar)
              .forEach(btn =>
                btn.classList.remove('active')
              );

            button.classList.add('active');


            const filter =
              button.dataset.filter;


            $$('.project-card')
              .forEach(card => {

                const category =
                  card.dataset.category ||
                  'all';


                if (
                  filter === 'all' ||
                  category === filter
                ) {

                  card.style.display = '';

                } else {

                  card.style.display = 'none';

                }

              });
          }
        );

      });
  }


  /* =======================================================
     WORKFLOW
  ======================================================= */

  function renderWorkflow() {

    const container =
      $('#workflowSteps');

    if (!container) return;


    const workflow =
      getData('workflow');


    if (!Array.isArray(workflow)) {
      container.innerHTML = '';
      return;
    }


    container.innerHTML =
      workflow
        .filter(Boolean)
        .map((step, index) => {

          return `
            <div class="workflow-step">

              <div class="workflow-number">
                ${String(index + 1).padStart(2, '0')}
              </div>

              <div class="workflow-icon">
                ${escapeHTML(
                  step.icon || '⚡'
                )}
              </div>

              <h3>
                ${escapeHTML(
                  step.title ||
                  step.name ||
                  'Step'
                )}
              </h3>

              <p>
                ${escapeHTML(
                  step.desc ||
                  step.description ||
                  ''
                )}
              </p>

            </div>
          `;

        })
        .join('');
  }


  /* =======================================================
     STATS
  ======================================================= */

  function renderStats() {

    const projects =
      getData('projects');

    const services =
      getData('services');

    const clients =
      getData('clients');


    const projectNumber =
      $('#stat-projects .stat-num');

    const serviceNumber =
      $('#stat-services .stat-num');

    const clientNumber =
      $('#stat-clients .stat-num');


    if (projectNumber) {

      projectNumber.textContent =
        Array.isArray(projects)
          ? projects.length + '+'
          : '0';

    }


    if (serviceNumber) {

      serviceNumber.textContent =
        Array.isArray(services)
          ? services.length + '+'
          : '0';

    }


    if (clientNumber) {

      clientNumber.textContent =
        Array.isArray(clients)
          ? clients.length + '+'
          : '0';

    }
  }


  /* =======================================================
     NAVIGATION
  ======================================================= */

  function setupNavigation() {

    const toggle =
      $('#navToggle');

    const links =
      $('#navLinks');


    if (!toggle || !links) {
      return;
    }


    toggle.addEventListener(
      'click',
      () => {

        const open =
          links.classList.toggle('active');

        toggle.classList.toggle(
          'active',
          open
        );

        toggle.setAttribute(
          'aria-expanded',
          String(open)
        );

      }
    );


    $$('.nav-links a', links)
      .forEach(link => {

        link.addEventListener(
          'click',
          () => {

            links.classList.remove('active');

            toggle.classList.remove(
              'active'
            );

            toggle.setAttribute(
              'aria-expanded',
              'false'
            );

          }
        );

      });


    /*
      Navbar scroll state
    */

    const nav =
      $('#nav');

    if (nav) {

      const updateNav =
        () => {

          nav.classList.toggle(
            'scrolled',
            window.scrollY > 30
          );

        };

      window.addEventListener(
        'scroll',
        updateNav,
        { passive: true }
      );

      updateNav();
    }
  }


  /* =======================================================
     CONTACT FORM
  ======================================================= */

  function setupContactForm() {

    const form =
      $('#contactForm');

    if (!form) return;


    form.addEventListener(
      'submit',
      async (event) => {

        event.preventDefault();

        const button =
          $('#submitBtn', form);

        const buttonText =
          $('.btn-text', form);

        const loading =
          $('.btn-loading', form);

        const status =
          $('#formStatus');


        if (button) {
          button.disabled = true;
        }

        if (buttonText) {
          buttonText.classList.add(
            'hidden'
          );
        }

        if (loading) {
          loading.classList.remove(
            'hidden'
          );
        }


        if (status) {
          status.textContent =
            'Sending message...';

          status.className =
            'form-status';
        }


        const formData =
          new FormData(form);

        const payload = {

          name:
            String(
              formData.get('name') || ''
            ).trim(),

          email:
            String(
              formData.get('email') || ''
            ).trim(),

          subject:
            String(
              formData.get('subject') || ''
            ).trim(),

          message:
            String(
              formData.get('message') || ''
            ).trim(),

        };


        try {

          const response =
            await fetch(
              '/api/contact',
              {
                method: 'POST',

                headers: {
                  'Content-Type':
                    'application/json'
                },

                body:
                  JSON.stringify(payload)
              }
            );

          const result =
            await response.json()
              .catch(() => ({}));


          if (!response.ok) {
            throw new Error(
              result.message ||
              'Unable to send message.'
            );
          }


          if (status) {
            status.textContent =
              result.message ||
              'Message sent successfully!';

            status.className =
              'form-status success';
          }


          form.reset();

        } catch (error) {

          console.error(
            'Contact form error:',
            error
          );

          if (status) {
            status.textContent =
              error.message ||
              'Something went wrong. Please try again.';

            status.className =
              'form-status error';
          }

        } finally {

          if (button) {
            button.disabled = false;
          }

          if (buttonText) {
            buttonText.classList.remove(
              'hidden'
            );
          }

          if (loading) {
            loading.classList.add(
              'hidden'
            );
          }

        }

      }
    );
  }


  /* =======================================================
     SMOOTH SCROLL
  ======================================================= */

  function setupSmoothScroll() {

    $$('a[href^="#"]')
      .forEach(link => {

        link.addEventListener(
          'click',
          event => {

            const targetID =
              link.getAttribute('href');

            if (
              !targetID ||
              targetID === '#'
            ) {
              return;
            }


            const target =
              document.querySelector(
                targetID
              );

            if (!target) {
              return;
            }

            event.preventDefault();


            const nav =
              $('#nav');

            const navHeight =
              nav
                ? nav.offsetHeight
                : 0;

            const top =
              target.getBoundingClientRect()
                .top +
              window.scrollY -
              navHeight;

            window.scrollTo({
              top,
              behavior:
                'smooth'
            });

          }
        );

      });
  }


  /* =======================================================
     IMAGE LAZY LOADING SAFETY
  ======================================================= */

  function setupImageFallbacks() {

    $$('img')
      .forEach(image => {

        image.addEventListener(
          'error',
          () => {

            image.classList.add(
              'image-error'
            );

          },
          { once: true }
        );

      });
  }


  /* =======================================================
     REFRESH DATA
     Useful after Admin changes.
  ======================================================= */

  window.refreshPortfolio =
    function () {

      renderSettings();
      renderAbout();
      renderProfileImage();
      renderSkills();

      renderServices();
      renderClients();

      renderProjects();
      renderWorkflow();

      renderStats();

    };


  /* =======================================================
     INITIALIZE
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


  /* =======================================================
     START AFTER DOM READY
  ======================================================= */

  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      init
    );

  } else {

    init();
  }

})();
