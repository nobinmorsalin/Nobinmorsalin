/* =========================================================
   CLIENTS ADMIN — CRUD + Vercel Blob image upload
   Keeps the existing PortfolioData structure simple:
   { id, name, service, logo, website, visible }
========================================================= */
(function () {
  'use strict';

  const esc = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  async function uploadClientLogo(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', 'client');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result?.url) {
      throw new Error(result?.error || 'Client logo upload failed.');
    }

    return result.url;
  }

  function renderClientsAdmin() {
    const grid = document.getElementById('clientsAdmin');
    if (!grid || !window.PortfolioData) return;

    const clients = PortfolioData.get('clients');

    if (!Array.isArray(clients) || !clients.length) {
      grid.innerHTML = '<div class="empty-admin">No clients yet. Add your first client!</div>';
      return;
    }

    grid.innerHTML = clients.map((client) => {
      const name = client?.name || 'Client';
      const service = client?.service || client?.services || 'Digital Solution';
      const logo = client?.logo || client?.image || '';
      const website = client?.website || client?.url || client?.link || '';
      const visible = client?.visible !== false && client?.active !== false;

      return `
        <div class="admin-card">
          <div class="project-admin-img" style="display:grid;place-items:center;overflow:hidden">
            ${logo
              ? `<img src="${esc(logo)}" alt="${esc(name)} logo" style="width:100%;height:100%;object-fit:contain;border-radius:var(--radius)" />`
              : `<span style="font-size:2rem;font-weight:800">${esc(name.charAt(0).toUpperCase())}</span>`
            }
          </div>
          <div class="admin-card-title">${esc(name)}</div>
          <div class="admin-card-desc">${esc(service)}</div>
          <div class="admin-card-desc" style="opacity:.7">
            ${website ? esc(website) : 'No website link'}
            · ${visible ? 'Visible' : 'Hidden'}
          </div>
          <div class="admin-card-actions">
            <button class="action-btn" type="button" data-client-edit="${esc(client.id)}">✏️ Edit</button>
            <button class="action-btn delete" type="button" data-client-delete="${esc(client.id)}">🗑️ Delete</button>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('[data-client-edit]').forEach((button) => {
      button.addEventListener('click', () => openClientModal(button.dataset.clientEdit));
    });

    grid.querySelectorAll('[data-client-delete]').forEach((button) => {
      button.addEventListener('click', () => deleteClient(button.dataset.clientDelete));
    });
  }

  function openClientModal(clientId) {
    const clients = PortfolioData.get('clients');
    const client = clients.find((item) => String(item?.id) === String(clientId)) || null;

    openModal(
      client ? 'Edit Client' : 'Add Client',
      `
        <div class="form-group">
          <label>Client Name</label>
          <input class="admin-input" id="cName" value="${esc(client?.name || '')}" placeholder="Client / Brand name" />
        </div>

        <div class="form-group">
          <label>Service</label>
          <input class="admin-input" id="cService" value="${esc(client?.service || '')}" placeholder="Web Development, API Integration" />
        </div>

        <div class="form-group">
          <label>Website URL (optional)</label>
          <input class="admin-input" id="cWebsite" value="${esc(client?.website || '')}" placeholder="https://example.com" />
        </div>

        <div class="form-group">
          <label>Client Logo</label>
          <div class="img-upload-zone" id="clientLogoZone">
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" id="clientLogoFile" />
            <div class="upload-icon">🏷️</div>
            <div class="upload-label">Upload client logo — JPG, PNG, WebP, GIF or AVIF</div>
            <img id="clientLogoPreview" class="img-preview" ${client?.logo ? `src="${esc(client.logo)}" style="display:block"` : ''} />
          </div>
          <input type="hidden" id="cLogo" value="${esc(client?.logo || '')}" />
        </div>

        <div class="form-group">
          <label style="display:flex;gap:10px;align-items:center">
            <input type="checkbox" id="cVisible" ${client?.visible !== false ? 'checked' : ''} />
            Show this client on the public website
          </label>
        </div>
      `,
      async () => {
        const name = document.getElementById('cName')?.value.trim();
        const service = document.getElementById('cService')?.value.trim();
        const website = document.getElementById('cWebsite')?.value.trim();
        const logo = document.getElementById('cLogo')?.value.trim();
        const visible = Boolean(document.getElementById('cVisible')?.checked);

        if (!name) {
          alert('Client name is required.');
          return;
        }

        if (window._clientLogoUploadPromise) {
          try {
            await window._clientLogoUploadPromise;
          } catch (error) {
            alert(error.message || 'Client logo upload failed.');
            return;
          }
        }

        const latestLogo = document.getElementById('cLogo')?.value.trim() || logo;
        let nextClients = Array.isArray(PortfolioData.get('clients'))
          ? [...PortfolioData.get('clients')]
          : [];

        const record = {
          id: client?.id || `c${Date.now()}`,
          name,
          service,
          logo: latestLogo,
          website,
          visible,
        };

        if (client) {
          nextClients = nextClients.map((item) =>
            String(item?.id) === String(client.id) ? { ...item, ...record } : item
          );
        } else {
          nextClients.push(record);
        }

        try {
          await PortfolioData.save('clients', nextClients);
          closeModal();
          renderClientsAdmin();
        } catch (error) {
          alert(error.message || 'Failed to save client.');
        }
      }
    );

    setTimeout(() => {
      const fileInput = document.getElementById('clientLogoFile');
      const preview = document.getElementById('clientLogoPreview');
      const logoInput = document.getElementById('cLogo');

      fileInput?.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (!file) return;

        if (file.size > 8 * 1024 * 1024) {
          alert('Image is too large. Maximum size is 8 MB.');
          fileInput.value = '';
          return;
        }

        const localPreview = URL.createObjectURL(file);
        preview.src = localPreview;
        preview.style.display = 'block';

        window._clientLogoUploadPromise = uploadClientLogo(file)
          .then((url) => {
            logoInput.value = url;
            preview.src = url;
            return url;
          })
          .catch((error) => {
            logoInput.value = '';
            throw error;
          });
      });
    }, 0);
  }

  async function deleteClient(clientId) {
    if (!confirm('Delete this client?')) return;

    const clients = PortfolioData.get('clients').filter(
      (client) => String(client?.id) !== String(clientId)
    );

    try {
      await PortfolioData.save('clients', clients);
      renderClientsAdmin();
    } catch (error) {
      alert(error.message || 'Failed to delete client.');
    }
  }

  window.renderClientsAdmin = renderClientsAdmin;

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addClientBtn')?.addEventListener('click', () => openClientModal(null));

    document.querySelectorAll('.sidebar .sb-btn[data-panel="clients"]').forEach((button) => {
      button.addEventListener('click', () => {
        setTimeout(renderClientsAdmin, 0);
      });
    });
  });
})();
