/* ═══════════════════════════════════════════════
   MAIN.JS — Portfolio rendering & interactions
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── NAV SCROLL ── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  /* ── MOBILE NAV ── */
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.querySelector('.nav-links');
  navToggle?.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  /* ── SCROLL REVEAL ── */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.section-title, .service-card, .project-card, .workflow-step, .about-grid > *').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });

  /* ── RENDER EVERYTHING ── */
  renderAbout();
  renderSkills();
  renderServices();
  renderProjects();
  renderWorkflow();
  updateStats();
  loadSettings();

  /* ── CONTACT FORM ── */
  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('submitBtn');
  const formStatus = document.getElementById('formStatus');
  const btnText    = submitBtn?.querySelector('.btn-text');
  const btnLoading = submitBtn?.querySelector('.btn-loading');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));

    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');
    submitBtn.disabled = true;
    formStatus.className = 'form-status';
    formStatus.textContent = '';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (res.ok) {
        formStatus.className = 'form-status success';
        formStatus.textContent = '✅ Message sent! I\'ll reply within 24 hours.';
        form.reset();
      } else {
        throw new Error(json.error || 'Failed to send');
      }
    } catch (err) {
      formStatus.className = 'form-status error';
      formStatus.textContent = '❌ ' + (err.message || 'Something went wrong. Please try again.');
    } finally {
      btnText.classList.remove('hidden');
      btnLoading.classList.add('hidden');
      submitBtn.disabled = false;
    }
  });
});

/* ════════════════════════════════
   RENDER FUNCTIONS
════════════════════════════════ */

function renderAbout() {
  const about = PortfolioData.get('about');
  const el = document.getElementById('aboutTitle');
  const tx = document.getElementById('aboutText');
  if (el) el.textContent = about.title;
  if (tx) tx.innerHTML = `<p>${about.bio1}</p><p>${about.bio2}</p>`;
}

function renderSkills() {
  const skills = PortfolioData.get('skills');
  const grid   = document.getElementById('skillsGrid');
  if (!grid) return;
  grid.innerHTML = skills.map(s =>
    `<span class="skill-tag">${s}</span>`
  ).join('');
}

function renderServices() {
  const services = PortfolioData.get('services');
  const grid     = document.getElementById('servicesGrid');
  if (!grid) return;

  if (!services.length) {
    grid.innerHTML = emptyState('No services added yet');
    return;
  }

  grid.innerHTML = services.map((s, i) => `
    <div class="service-card reveal reveal-delay-${(i % 4) + 1}">
      <span class="service-icon">${s.icon}</span>
      <div class="service-name">${s.name}</div>
      <div class="service-desc">${s.desc}</div>
    </div>
  `).join('');

  observeNewElements();
}

function renderProjects() {
  const projects  = PortfolioData.get('projects');
  const grid      = document.getElementById('projectsGrid');
  const filterBar = document.getElementById('filterBar');
  if (!grid) return;

  if (!projects.length) {
    grid.innerHTML = emptyState('No projects added yet');
    return;
  }

  /* Build filter buttons */
  const cats = ['All', ...new Set(projects.map(p => p.category).filter(Boolean))];
  filterBar.innerHTML = cats.map(c =>
    `<button class="filter-btn ${c === 'All' ? 'active' : ''}" data-filter="${c}">${c}</button>`
  ).join('');

  filterBar.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      grid.querySelectorAll('.project-card').forEach(card => {
        card.style.display = (f === 'All' || card.dataset.cat === f) ? '' : 'none';
      });
    });
  });

  grid.innerHTML = projects.map((p, i) => `
    <div class="project-card reveal reveal-delay-${(i % 3) + 1}" data-cat="${p.category || ''}">
      <div class="project-img-wrap">
        ${p.image
          ? `<img class="project-img" src="${p.image}" alt="${p.title}" onerror="this.parentElement.innerHTML='<div class=\\'project-img-placeholder\\'>🖥️</div>'" />`
          : `<div class="project-img-placeholder">🖥️</div>`
        }
      </div>
      <div class="project-content">
        <div class="project-tags">${(p.tags || []).map(t => `<span class="project-tag">${t}</span>`).join('')}</div>
        <div class="project-title">${p.title}</div>
        <div class="project-desc">${p.desc}</div>
        <div class="project-links">
          ${p.live   ? `<a href="${p.live}"   target="_blank" class="project-link">↗ Live Demo</a>` : ''}
          ${p.github ? `<a href="${p.github}" target="_blank" class="project-link">⌥ GitHub</a>`   : ''}
        </div>
      </div>
    </div>
  `).join('');

  observeNewElements();
}

function renderWorkflow() {
  const steps = PortfolioData.get('workflow');
  const wrap  = document.getElementById('workflowSteps');
  if (!wrap) return;

  wrap.innerHTML = steps.map((s, i) => `
    <div class="workflow-step reveal reveal-delay-${(i % 4) + 1}">
      <div class="step-num">STEP ${String(i + 1).padStart(2, '0')}</div>
      <div class="step-icon">${s.icon}</div>
      <div class="step-title">${s.title}</div>
      <div class="step-desc">${s.desc}</div>
    </div>
  `).join('');

  observeNewElements();
}

function updateStats() {
  const projects = PortfolioData.get('projects');
  const services = PortfolioData.get('services');

  animateCount('stat-projects', projects.length);
  animateCount('stat-services', services.length);
}

function loadSettings() {
  const s = PortfolioData.get('settings');
  const emailEl = document.getElementById('contactEmail');
  if (emailEl && s.email) emailEl.textContent = s.email;
}

/* ── HELPERS ── */
function emptyState(msg) {
  return `<div class="empty-state">
    <div class="empty-state-icon">📂</div>
    <p>${msg}</p>
  </div>`;
}

function animateCount(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  const numEl = el.querySelector('.stat-num');
  if (!numEl) return;
  let current = 0;
  const step = Math.ceil(target / 30);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    numEl.textContent = current + '+';
    if (current >= target) clearInterval(timer);
  }, 50);
}

function observeNewElements() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
}
