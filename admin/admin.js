/* ═══════════════════════════════════════════════
   ADMIN.JS — Portfolio Admin Panel
   ═══════════════════════════════════════════════ */

/* ── MESSAGES STORE ── */
let adminMessages = [];

function getMsgs() {
  return adminMessages;
}

async function loadMessagesFromAPI() {
  try {
    const response = await fetch('/api/messages', {
      method: 'GET',
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Failed to load messages');
    }

    adminMessages = Array.isArray(data.messages)
      ? data.messages
      : [];

    return adminMessages;

  } catch (error) {
    console.error('LOAD MESSAGES ERROR:', error);
    adminMessages = [];
    return [];
  }
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  if (AUTH.check()) showAdmin();
  else showLogin();
});

/* ── LOGIN ── */
function showLogin() {
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('adminWrap').classList.add('hidden');
}

function showAdmin() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('adminWrap').classList.remove('hidden');
  initAdmin();
}

document.getElementById('loginBtn')?.addEventListener('click', () => {
  const u = document.getElementById('loginUser').value;
  const p = document.getElementById('loginPass').value;

  if (AUTH.login(u, p)) {
    showAdmin();
  } else {
    document.getElementById('loginError').classList.remove('hidden');
  }
});

document.getElementById('loginPass')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    document.getElementById('loginBtn').click();
  }
});

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  AUTH.logout();
  showLogin();
});

/* ── PANEL NAVIGATION ── */
async function initAdmin() {

  try {
    if (
      window.PortfolioData &&
      typeof PortfolioData.load === 'function'
    ) {
      await PortfolioData.load();
    }
  } catch (error) {
    console.error(
      'Portfolio data load failed in admin:',
      error
    );
  }

  document.querySelectorAll('.sb-btn').forEach(btn => {

    btn.addEventListener('click', async () => {

      document.querySelectorAll('.sb-btn')
        .forEach(b => b.classList.remove('active'));

      document.querySelectorAll('.panel')
        .forEach(p => p.classList.add('hidden'));

      btn.classList.add('active');

      const panel = document.getElementById(
        'panel-' + btn.dataset.panel
      );

      if (panel) {
        panel.classList.remove('hidden');
      }

      /*
       * Always get the latest messages
       * from Neon when opening Messages.
       */
      if (btn.dataset.panel === 'messages') {
        await loadMessagesFromAPI();
      }

      renderPanel(btn.dataset.panel);
    });

  });

  /*
   * Load messages immediately so
   * Overview also shows correct counts.
   */
  await loadMessagesFromAPI();

  renderPanel('overview');

  initServices();
  initProjects();
  initSkills();
  initWorkflow();
  initSettings();
}

function renderPanel(name) {
  switch (name) {
    case 'overview':
      renderOverview();
      break;

    case 'services':
      renderServicesAdmin();
      break;

    case 'projects':
      renderProjectsAdmin();
      break;

    case 'skills':
      renderSkillsAdmin();
      break;

    case 'workflow':
      renderWorkflowAdmin();
      break;

    case 'messages':
      renderMessagesAdmin();
      break;

    case 'settings':
      loadSettingsAdmin();
      break;
  }
}

/* ══════════════════════════════════════
   OVERVIEW
══════════════════════════════════════ */
function renderOverview() {

  const services =
    PortfolioData.get('services');

  const projects =
    PortfolioData.get('projects');

  const msgs =
    getMsgs();

  const unread =
    msgs.filter(m => !m.read).length;

  document.getElementById(
    'overviewStats'
  ).innerHTML = `
    <div class="stat-card">
      <div class="stat-card-num">
        ${services.length}
      </div>
      <div class="stat-card-label">
        Services
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-card-num">
        ${projects.length}
      </div>
      <div class="stat-card-label">
        Projects
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-card-num">
        ${msgs.length}
      </div>
      <div class="stat-card-label">
        Total Messages
      </div>
    </div>

    <div class="stat-card">
      <div
        class="stat-card-num"
        style="color:${unread ? 'var(--yellow)' : 'var(--accent)'}"
      >
        ${unread}
      </div>
      <div class="stat-card-label">
        Unread
      </div>
    </div>
  `;

  const recentEl =
    document.getElementById(
      'recentMessages'
    );

  if (!msgs.length) {

    recentEl.innerHTML =
      '<div class="no-messages">📬 No messages yet</div>';

  } else {

    recentEl.innerHTML =
      msgs.slice(0, 5).map(m => `
        <div
          class="msg-admin-card ${m.read ? '' : 'msg-unread'}"
        >

          <div class="msg-admin-header">

            <div>
              <span class="msg-admin-from">
                ${m.name}
              </span>

              <span
                class="msg-admin-email"
                style="margin-left:10px"
              >
                ${m.email}
              </span>
            </div>

            <div class="msg-admin-time">
              ${new Date(m.time).toLocaleString()}
            </div>

          </div>

          <div class="msg-admin-subject">
            Subject: ${m.subject}
          </div>

          <div class="msg-admin-body">
            ${m.message}
          </div>

        </div>
      `).join('');
  }
}

/* ══════════════════════════════════════
   SERVICES
══════════════════════════════════════ */
function renderServicesAdmin() {

  const services =
    PortfolioData.get('services');

  const grid =
    document.getElementById(
      'servicesAdmin'
    );

  if (!services.length) {

    grid.innerHTML =
      '<div class="empty-admin">No services yet. Add your first service!</div>';

    return;
  }

  grid.innerHTML =
    services.map(s => `
      <div class="admin-card">

        <div class="admin-card-icon">
          ${s.icon}
        </div>

        <div class="admin-card-title">
          ${s.name}
        </div>

        <div class="admin-card-desc">
          ${s.desc}
        </div>

        <div class="admin-card-actions">

          <button
            class="action-btn"
            onclick="editService('${s.id}')"
          >
            ✏️ Edit
          </button>

          <button
            class="action-btn delete"
            onclick="deleteService('${s.id}')"
          >
            🗑️ Delete
          </button>

        </div>

      </div>
    `).join('');
}

function initServices() {

  document
    .getElementById('addServiceBtn')
    ?.addEventListener(
      'click',
      () => openServiceModal(null)
    );
}

function editService(id) {

  const services =
    PortfolioData.get('services');

  const s =
    services.find(x => x.id === id);

  if (s) {
    openServiceModal(s);
  }
}

async function deleteService(id) {

  if (!confirm('Delete this service?')) {
    return;
  }

  const services =
    PortfolioData
      .get('services')
      .filter(s => s.id !== id);

  try {

    await PortfolioData.save(
      'services',
      services
    );

    renderServicesAdmin();

  } catch (error) {

    alert(
      error.message ||
      'Failed to save services.'
    );
  }
}

function openServiceModal(service) {

  openModal(
    service
      ? 'Edit Service'
      : 'Add Service',

    `
    <div class="form-group">
      <label>Icon (emoji)</label>

      <input
        class="admin-input"
        id="mIcon"
        value="${service?.icon || ''}"
        placeholder="🔗"
      />
    </div>

    <div class="form-group">
      <label>Service Name</label>

      <input
        class="admin-input"
        id="mName"
        value="${service?.name || ''}"
        placeholder="API Integration"
      />
    </div>

    <div class="form-group">
      <label>Description</label>

      <textarea
        class="admin-input"
        id="mDesc"
        rows="3"
        placeholder="What you offer..."
      >${service?.desc || ''}</textarea>
    </div>
    `,

    async () => {

      const name =
        document
          .getElementById('mName')
          .value
          .trim();

      const icon =
        document
          .getElementById('mIcon')
          .value
          .trim();

      const desc =
        document
          .getElementById('mDesc')
          .value
          .trim();

      if (!name) {
        return alert('Name is required');
      }

      let services =
        PortfolioData.get('services');

      if (service) {

        services =
          services.map(
            s =>
              s.id === service.id
                ? {
                    ...s,
                    name,
                    icon,
                    desc
                  }
                : s
          );

      } else {

        services.push({
          id: 's' + Date.now(),
          name,
          icon: icon || '🔧',
          desc
        });
      }

      try {

        await PortfolioData.save(
          'services',
          services
        );

        closeModal();
        renderServicesAdmin();

      } catch (error) {

        alert(
          error.message ||
          'Failed to save service.'
        );
      }
    }
  );
}

/* ══════════════════════════════════════
   IMAGE UPLOAD
══════════════════════════════════════ */

async function uploadPortfolioImage(
  file,
  purpose
) {

  const formData =
    new FormData();

  formData.append(
    'file',
    file
  );

  formData.append(
    'purpose',
    purpose
  );

  const response =
    await fetch(
      '/api/upload',
      {
        method: 'POST',
        body: formData
      }
    );

  const result =
    await response
      .json()
      .catch(() => ({}));

  if (
    !response.ok ||
    !result?.url
  ) {

    throw new Error(
      result?.error ||
      'Image upload failed.'
    );
  }

  return result.url;
}

/* ══════════════════════════════════════
   PROJECTS
══════════════════════════════════════ */
function renderProjectsAdmin() {

  const projects =
    PortfolioData.get('projects');

  const grid =
    document.getElementById(
      'projectsAdmin'
    );

  if (!projects.length) {

    grid.innerHTML =
      '<div class="empty-admin">No projects yet. Add your first project!</div>';

    return;
  }

  grid.innerHTML =
    projects.map(p => `
      <div class="admin-card">

        <div class="project-admin-img">

          ${
            p.image
              ? `
                <img
                  src="${p.image}"
                  alt="${p.title}"
                  style="
                    width:100%;
                    height:100%;
                    object-fit:cover;
                    border-radius:var(--radius)
                  "
                />
              `
              : '🖥️'
          }

        </div>

        <div class="admin-card-title">
          ${p.title}
        </div>

        <div class="admin-card-desc">
          ${p.desc}
        </div>

        <div style="margin-bottom:16px">

          ${
            (p.tags || [])
              .map(
                t =>
                  `
                  <span
                    class="project-tag"
                    style="
                      margin-right:6px;
                      margin-bottom:6px
                    "
                  >
                    ${t}
                  </span>
                  `
              )
              .join('')
          }

        </div>

        <div class="admin-card-actions">

          <button
            class="action-btn"
            onclick="editProject('${p.id}')"
          >
            ✏️ Edit
          </button>

          <button
            class="action-btn delete"
            onclick="deleteProject('${p.id}')"
          >
            🗑️ Delete
          </button>

        </div>

      </div>
    `).join('');
}

function initProjects() {

  document
    .getElementById('addProjectBtn')
    ?.addEventListener(
      'click',
      () => openProjectModal(null)
    );
}

function editProject(id) {

  const p =
    PortfolioData
      .get('projects')
      .find(x => x.id === id);

  if (p) {
    openProjectModal(p);
  }
}

async function deleteProject(id) {

  if (!confirm('Delete this project?')) {
    return;
  }

  const projects =
    PortfolioData
      .get('projects')
      .filter(p => p.id !== id);

  try {

    await PortfolioData.save(
      'projects',
      projects
    );

    renderProjectsAdmin();

  } catch (error) {

    alert(
      error.message ||
      'Failed to save projects.'
    );
  }
}

function openProjectModal(project) {

  openModal(

    project
      ? 'Edit Project'
      : 'Add Project',

    `
    <div class="form-group">
      <label>Project Title</label>

      <input
        class="admin-input"
        id="pTitle"
        value="${project?.title || ''}"
        placeholder="My Awesome Project"
      />
    </div>

    <div class="form-group">
      <label>Description</label>

      <textarea
        class="admin-input"
        id="pDesc"
        rows="3"
      >${project?.desc || ''}</textarea>
    </div>

    <div class="form-group">
      <label>Category</label>

      <input
        class="admin-input"
        id="pCat"
        value="${project?.category || ''}"
        placeholder="Web App"
      />
    </div>

    <div class="form-group">
      <label>Tags (comma separated)</label>

      <input
        class="admin-input"
        id="pTags"
        value="${(project?.tags || []).join(', ')}"
        placeholder="React, Node.js, API"
      />
    </div>

    <div class="form-group">
      <label>Live URL</label>

      <input
        class="admin-input"
        id="pLive"
        value="${project?.live || ''}"
        placeholder="https://..."
      />
    </div>

    <div class="form-group">
      <label>GitHub URL</label>

      <input
        class="admin-input"
        id="pGithub"
        value="${project?.github || ''}"
        placeholder="https://github.com/..."
      />
    </div>

    <div class="form-group">
      <label>Project Image</label>

      <div
        class="img-upload-zone"
        id="imgZone"
      >

        <input
          type="file"
          accept="image/*"
          id="imgFile"
        />

        <div class="upload-icon">
          🖼️
        </div>

        <div class="upload-label">
          Click to upload image (JPG, PNG, WebP)
        </div>

        ${
          project?.image
            ? `
              <img
                src="${project.image}"
                class="img-preview"
                style="display:block"
                id="imgPreview"
              />
            `
            : `
              <img
                class="img-preview"
                id="imgPreview"
              />
            `
        }

      </div>

      <input
        type="hidden"
        id="pImage"
        value="${project?.image || ''}"
      />

    </div>
    `,

    async () => {

      const title =
        document
          .getElementById('pTitle')
          .value
          .trim();

      const desc =
        document
          .getElementById('pDesc')
          .value
          .trim();

      if (!title) {
        return alert('Title is required');
      }

      const tags =
        document
          .getElementById('pTags')
          .value
          .split(',')
          .map(t => t.trim())
          .filter(Boolean);

      const cat =
        document
          .getElementById('pCat')
          .value
          .trim();

      const live =
        document
          .getElementById('pLive')
          .value
          .trim();

      const github =
        document
          .getElementById('pGithub')
          .value
          .trim();

      if (
        window._portfolioImageUploadPromise
      ) {

        try {

          await window
            ._portfolioImageUploadPromise;

        } catch (error) {

          alert(
            error.message ||
            'Image upload failed.'
          );

          return;
        }
      }

      const image =
        document
          .getElementById('pImage')
          .value;

      let projects =
        PortfolioData.get('projects');

      if (project) {

        projects =
          projects.map(
            p =>
              p.id === project.id
                ? {
                    ...p,
                    title,
                    desc,
                    tags,
                    category: cat,
                    live,
                    github,
                    image
                  }
                : p
          );

      } else {

        projects.push({
          id: 'p' + Date.now(),
          title,
          desc,
          tags,
          category: cat,
          live,
          github,
          image
        });
      }

      try {

        await PortfolioData.save(
          'projects',
          projects
        );

        closeModal();
        renderProjectsAdmin();

      } catch (error) {

        alert(
          error.message ||
          'Failed to save project.'
        );
      }
    }
  );

  /*
   * Persistent image upload:
   *
   * File
   * ↓
   * /api/upload
   * ↓
   * Vercel Blob
   * ↓
   * Persistent URL
   */

  setTimeout(() => {

    const imgFile =
      document.getElementById(
        'imgFile'
      );

    const imgPreview =
      document.getElementById(
        'imgPreview'
      );

    const pImage =
      document.getElementById(
        'pImage'
      );

    imgFile?.addEventListener(
      'change',
      () => {

        const file =
          imgFile.files?.[0];

        if (!file) {
          return;
        }

        if (
          file.size >
          8 * 1024 * 1024
        ) {

          alert(
            'Image is too large. Maximum size is 8 MB.'
          );

          imgFile.value = '';

          return;
        }

        const previewUrl =
          URL.createObjectURL(file);

        imgPreview.src =
          previewUrl;

        imgPreview.style.display =
          'block';

        window._portfolioImageUploadPromise =
          uploadPortfolioImage(
            file,
            'project'
          )
          .then(url => {

            pImage.value =
              url;

            imgPreview.src =
              url;

            return url;

          })
          .catch(error => {

            pImage.value = '';

            throw error;
          });
      }
    );

  }, 100);
}

/* ══════════════════════════════════════
   SKILLS
══════════════════════════════════════ */

function renderSkillsAdmin() {

  const skills =
    PortfolioData.get('skills');

  const grid =
    document.getElementById(
      'skillsAdmin'
    );

  grid.innerHTML =
    skills.map((s, i) => `
      <div class="skill-admin-tag">

        ${s}

        <button
          class="skill-remove"
          onclick="removeSkill(${i})"
        >
          ✕
        </button>

      </div>
    `).join('');
}

async function removeSkill(i) {

  const skills =
    PortfolioData.get('skills');

  skills.splice(i, 1);

  try {

    await PortfolioData.save(
      'skills',
      skills
    );

    renderSkillsAdmin();

  } catch (error) {

    alert(
      error.message ||
      'Failed to save skills.'
    );
  }
}

function initSkills() {

  document
    .getElementById('addSkillBtn')
    ?.addEventListener(
      'click',
      async () => {

        const input =
          document.getElementById(
            'newSkillInput'
          );

        const val =
          input?.value?.trim();

        if (!val) {
          return;
        }

        const skills =
          PortfolioData.get('skills');

        if (!skills.includes(val)) {

          skills.push(val);

          try {

            await PortfolioData.save(
              'skills',
              skills
            );

          } catch (error) {

            alert(
              error.message ||
              'Failed to save skills.'
            );

            return;
          }
        }

        input.value = '';

        renderSkillsAdmin();
      }
    );

  document
    .getElementById('newSkillInput')
    ?.addEventListener(
      'keydown',
      e => {

        if (e.key === 'Enter') {

          document
            .getElementById(
              'addSkillBtn'
            )
            .click();
        }
      }
    );
}

/* ══════════════════════════════════════
   WORKFLOW
══════════════════════════════════════ */

function renderWorkflowAdmin() {

  const steps =
    PortfolioData.get('workflow');

  const list =
    document.getElementById(
      'workflowAdmin'
    );

  if (!steps.length) {

    list.innerHTML =
      '<div class="empty-admin">No workflow steps yet.</div>';

    return;
  }

  list.innerHTML =
    steps.map((s, i) => `
      <div class="list-item">

        <div class="list-item-icon">
          ${s.icon}
        </div>

        <div class="list-item-content">

          <div class="list-item-title">
            Step ${i + 1}: ${s.title}
          </div>

          <div class="list-item-desc">
            ${s.desc}
          </div>

        </div>

        <div class="list-item-actions">

          <button
            class="action-btn"
            onclick="editWorkflow('${s.id}')"
          >
            ✏️
          </button>

          <button
            class="action-btn delete"
            onclick="deleteWorkflow('${s.id}')"
          >
            🗑️
          </button>

        </div>

      </div>
    `).join('');
}

function initWorkflow() {

  document
    .getElementById('addWorkflowBtn')
    ?.addEventListener(
      'click',
      () => openWorkflowModal(null)
    );
}

function editWorkflow(id) {

  const s =
    PortfolioData
      .get('workflow')
      .find(x => x.id === id);

  if (s) {
    openWorkflowModal(s);
  }
}

async function deleteWorkflow(id) {

  if (!confirm('Delete this step?')) {
    return;
  }

  const steps =
    PortfolioData
      .get('workflow')
      .filter(s => s.id !== id);

  try {

    await PortfolioData.save(
      'workflow',
      steps
    );

    renderWorkflowAdmin();

  } catch (error) {

    alert(
      error.message ||
      'Failed to save workflow.'
    );
  }
}

function openWorkflowModal(step) {

  openModal(

    step
      ? 'Edit Step'
      : 'Add Workflow Step',

    `
    <div class="form-group">
      <label>Icon (emoji)</label>

      <input
        class="admin-input"
        id="wIcon"
        value="${step?.icon || ''}"
        placeholder="⚙️"
      />
    </div>

    <div class="form-group">
      <label>Step Title</label>

      <input
        class="admin-input"
        id="wTitle"
        value="${step?.title || ''}"
        placeholder="Development"
      />
    </div>

    <div class="form-group">
      <label>Description</label>

      <textarea
        class="admin-input"
        id="wDesc"
        rows="3"
      >${step?.desc || ''}</textarea>
    </div>
    `,

    async () => {

      const title =
        document
          .getElementById('wTitle')
          .value
          .trim();

      const icon =
        document
          .getElementById('wIcon')
          .value
          .trim();

      const desc =
        document
          .getElementById('wDesc')
          .value
          .trim();

      if (!title) {
        return alert('Title is required');
      }

      let steps =
        PortfolioData.get('workflow');

      if (step) {

        steps =
          steps.map(
            s =>
              s.id === step.id
                ? {
                    ...s,
                    title,
                    icon,
                    desc
                  }
                : s
          );

      } else {

        steps.push({
          id: 'w' + Date.now(),
          title,
          icon: icon || '⚙️',
          desc
        });
      }

      try {

        await PortfolioData.save(
          'workflow',
          steps
        );

        closeModal();
        renderWorkflowAdmin();

      } catch (error) {

        alert(
          error.message ||
          'Failed to save workflow.'
        );
      }
    }
  );
}

/* ══════════════════════════════════════
   MESSAGES
══════════════════════════════════════ */

async function renderMessagesAdmin() {

  const el =
    document.getElementById(
      'messagesAdmin'
    );

  if (!el) {
    return;
  }

  /*
   * Always refresh from database
   */
  await loadMessagesFromAPI();

  const msgs =
    getMsgs();

  if (!msgs.length) {

    el.innerHTML =
      '<div class="no-messages">📬 No messages yet</div>';

    return;
  }

  el.innerHTML =
    msgs.map(m => {

      const id =
        m.id;

      const read =
        Boolean(
          m.is_read ??
          m.read
        );

      const created =
        m.created_at ||
        m.time ||
        new Date().toISOString();

      return `
        <div
          class="msg-admin-card ${read ? '' : 'msg-unread'}"
          id="msg-${id}"
        >

          <div class="msg-admin-header">

            <div>

              <span class="msg-admin-from">
                ${escapeHTML(
                  m.name ||
                  'Unknown'
                )}
              </span>

              <a
                href="mailto:${escapeHTML(
                  m.email || ''
                )}"
                class="msg-admin-email"
                style="margin-left:10px"
              >
                ${escapeHTML(
                  m.email || ''
                )}
              </a>

            </div>

            <div
              style="
                display:flex;
                gap:10px;
                align-items:center;
                flex-wrap:wrap;
              "
            >

              <span class="msg-admin-time">
                ${new Date(
                  created
                ).toLocaleString()}
              </span>

              <button
                class="action-btn"
                style="flex:none;padding:4px 10px"
                onclick="markRead(${id})"
                ${read ? 'disabled' : ''}
              >
                ${
                  read
                    ? '✓ Read'
                    : 'Mark read'
                }
              </button>

              <button
                class="action-btn delete"
                style="flex:none;padding:4px 10px"
                onclick="deleteMsg(${id})"
              >
                🗑️
              </button>

            </div>

          </div>

          <div class="msg-admin-subject">
            <strong>Subject:</strong>
            ${escapeHTML(
              m.subject ||
              'Live Chat'
            )}
          </div>

          <div class="msg-admin-body">
            ${escapeHTML(
              m.message || ''
            )}
          </div>

        </div>
      `;

    }).join('');
}

/* ─────────────────────────────
   MARK READ
───────────────────────────── */

async function markRead(id) {

  try {

    const response =
      await fetch(
        '/api/messages',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body:
            JSON.stringify({
              action: 'read',
              id
            })
        }
      );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.ok
    ) {

      throw new Error(
        data.error ||
        'Failed to mark message as read'
      );
    }

    await renderMessagesAdmin();

    renderOverview();

  } catch (error) {

    console.error(
      'MARK READ ERROR:',
      error
    );

    alert(
      'Could not mark message as read.'
    );
  }
}

/* ─────────────────────────────
   DELETE MESSAGE
───────────────────────────── */

async function deleteMsg(id) {

  if (
    !confirm(
      'Delete this message?'
    )
  ) {
    return;
  }

  try {

    const response =
      await fetch(
        '/api/messages',
        {
          method: 'DELETE',

          headers: {
            'Content-Type':
              'application/json'
          },

          body:
            JSON.stringify({
              id
            })
        }
      );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.ok
    ) {

      throw new Error(
        data.error ||
        'Failed to delete message'
      );
    }

    await renderMessagesAdmin();

    renderOverview();

  } catch (error) {

    console.error(
      'DELETE MESSAGE ERROR:',
      error
    );

    alert(
      'Could not delete message.'
    );
  }
}

/* ─────────────────────────────
   CLEAR ALL
───────────────────────────── */

document
  .getElementById(
    'clearMsgsBtn'
  )
  ?.addEventListener(
    'click',
    async () => {

      if (
        !confirm(
          'Delete ALL messages?'
        )
      ) {
        return;
      }

      try {

        const response =
          await fetch(
            '/api/messages',
            {
              method: 'DELETE',

              headers: {
                'Content-Type':
                  'application/json'
              },

              body:
                JSON.stringify({
                  all: true
                })
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.ok
        ) {

          throw new Error(
            data.error ||
            'Failed to clear messages'
          );
        }

        await renderMessagesAdmin();

        renderOverview();

      } catch (error) {

        console.error(
          'CLEAR MESSAGES ERROR:',
          error
        );

        alert(
          'Could not clear messages.'
        );
      }

    }
  );

/* ─────────────────────────────
   HTML ESCAPE
───────────────────────────── */

function escapeHTML(value) {

  return String(
    value ?? ''
  )
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );
}

/* ══════════════════════════════════════
   SETTINGS
══════════════════════════════════════ */

function loadSettingsAdmin() {

  const s =
    PortfolioData.get(
      'settings'
    );

  const a =
    PortfolioData.get(
      'about'
    );

  [
    'Name',
    'Email',
    'Github',
    'Linkedin'
  ].forEach(k => {

    const el =
      document.getElementById(
        'set' + k
      );

    if (el) {

      el.value =
        s[k.toLowerCase()] ||
        '';
    }

  });

  const aTitle =
    document.getElementById(
      'setAboutTitle'
    );

  const aBio1 =
    document.getElementById(
      'setAboutBio1'
    );

  const aBio2 =
    document.getElementById(
      'setAboutBio2'
    );

  if (aTitle) {
    aTitle.value =
      a.title || '';
  }

  if (aBio1) {
    aBio1.value =
      a.bio1 || '';
  }

  if (aBio2) {
    aBio2.value =
      a.bio2 || '';
  }
}

function initSettings() {

  document
    .getElementById(
      'saveProfileBtn'
    )
    ?.addEventListener(
      'click',
      async () => {

        const s =
          PortfolioData.get(
            'settings'
          );

        s.name =
          document
            .getElementById(
              'setName'
            )
            ?.value
            ?.trim() ||
          s.name;

        s.email =
          document
            .getElementById(
              'setEmail'
            )
            ?.value
            ?.trim() ||
          s.email;

        s.github =
          document
            .getElementById(
              'setGithub'
            )
            ?.value
            ?.trim() ||
          s.github;

        s.linkedin =
          document
            .getElementById(
              'setLinkedin'
            )
            ?.value
            ?.trim() ||
          s.linkedin;

        try {

          await PortfolioData.save(
            'settings',
            s
          );

          showSaved();

        } catch (error) {

          alert(
            error.message ||
            'Failed to save settings.'
          );
        }
      }
    );

  document
    .getElementById(
      'saveAboutBtn'
    )
    ?.addEventListener(
      'click',
      async () => {

        const a = {

          title:
            document
              .getElementById(
                'setAboutTitle'
              )
              ?.value
              ?.trim() ||
            '',

          bio1:
            document
              .getElementById(
                'setAboutBio1'
              )
              ?.value
              ?.trim() ||
            '',

          bio2:
            document
              .getElementById(
                'setAboutBio2'
              )
              ?.value
              ?.trim() ||
            ''

        };

        try {

          await PortfolioData.save(
            'about',
            a
          );

          showSaved();

        } catch (error) {

          alert(
            error.message ||
            'Failed to save About content.'
          );
        }
      }
    );

  document
    .getElementById(
      'resetAllBtn'
    )
    ?.addEventListener(
      'click',
      () => {

        if (
          !confirm(
            'Reset ALL data to defaults? This cannot be undone.'
          )
        ) {
          return;
        }

        PortfolioData.resetAll();

        location.reload();
      }
    );
}

function showSaved() {

  const el =
    document.getElementById(
      'settingsSaved'
    );

  if (!el) {
    return;
  }

  el.classList.remove(
    'hidden'
  );

  setTimeout(
    () =>
      el.classList.add(
        'hidden'
      ),
    3000
  );
}

/* ══════════════════════════════════════
   MODAL HELPER
══════════════════════════════════════ */

let _modalSaveCb =
  null;

function openModal(
  title,
  body,
  onSave
) {

  document.getElementById(
    'modalTitle'
  ).textContent =
    title;

  document.getElementById(
    'modalBody'
  ).innerHTML =
    body;

  _modalSaveCb =
    onSave;

  document.getElementById(
    'modalOverlay'
  ).classList.remove(
    'hidden'
  );
}

function closeModal() {

  document.getElementById(
    'modalOverlay'
  ).classList.add(
    'hidden'
  );

  _modalSaveCb =
    null;

  window
    ._portfolioImageUploadPromise =
    null;
}

document
  .getElementById(
    'modalClose'
  )
  ?.addEventListener(
    'click',
    closeModal
  );

document
  .getElementById(
    'modalCancel'
  )
  ?.addEventListener(
    'click',
    closeModal
  );

document
  .getElementById(
    'modalSave'
  )
  ?.addEventListener(
    'click',
    async () => {

      if (!_modalSaveCb) {
        return;
      }

      const saveCb =
        _modalSaveCb;

      try {

        await saveCb();

      } catch (error) {

        console.error(
          'Admin save failed:',
          error
        );

        alert(
          error.message ||
          'Save failed.'
        );
      }
    }
  );

document
  .getElementById(
    'modalOverlay'
  )
  ?.addEventListener(
    'click',
    e => {

      if (
        e.target ===
        document.getElementById(
          'modalOverlay'
        )
      ) {
        closeModal();
      }

    }
  );

/* Export addMsg for API use */
