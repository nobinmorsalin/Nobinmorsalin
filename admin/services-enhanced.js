/*
 * SERVICES ENHANCEMENT — professional service CMS fields
 * Loaded after admin.js so existing admin behavior remains intact.
 */

function renderServicesAdmin() {
  const services = PortfolioData.get('services') || [];
  const grid = document.getElementById('servicesAdmin');
  if (!grid) return;

  if (!services.length) {
    grid.innerHTML = '<div class="empty-admin">No services yet. Add your first service!</div>';
    return;
  }

  grid.innerHTML = services.map((s) => `
    <div class="admin-card">
      <div class="admin-card-icon" style="overflow:hidden;">
        ${s.image ? `<img src="${escapeAdminAttr(s.image)}" alt="${escapeAdminAttr(s.name || 'Service')}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius);" />` : escapeAdminHtml(s.icon || '🛠️')}
      </div>
      <div class="admin-card-title">${escapeAdminHtml(s.name || 'Service')}</div>
      <div class="admin-card-desc">${escapeAdminHtml(s.desc || s.description || '')}</div>
      ${s.category ? `<div class="admin-card-desc"><strong>Category:</strong> ${escapeAdminHtml(s.category)}</div>` : ''}
      ${s.technologies?.length ? `<div class="admin-card-desc"><strong>Tech:</strong> ${escapeAdminHtml(s.technologies.join(', '))}</div>` : ''}
      ${s.price || s.deliveryTime ? `<div class="admin-card-desc">${s.price ? `From ${escapeAdminHtml(s.price)}` : ''}${s.price && s.deliveryTime ? ' · ' : ''}${s.deliveryTime ? escapeAdminHtml(s.deliveryTime) : ''}</div>` : ''}
      <div class="admin-card-actions">
        <button class="action-btn" onclick="editService('${escapeAdminAttr(s.id)}')">✏️ Edit</button>
        <button class="action-btn delete" onclick="deleteService('${escapeAdminAttr(s.id)}')">🗑️ Delete</button>
      </div>
    </div>
  `).join('');
}

function initServices() {
  document.getElementById('addServiceBtn')?.addEventListener('click', () => openServiceModal(null));
}

function editService(id) {
  const service = (PortfolioData.get('services') || []).find((x) => x.id === id);
  if (service) openServiceModal(service);
}

async function deleteService(id) {
  if (!confirm('Delete this service?')) return;
  const services = (PortfolioData.get('services') || []).filter((s) => s.id !== id);
  try {
    await PortfolioData.save('services', services);
    renderServicesAdmin();
  } catch (error) {
    alert(error.message || 'Failed to save services.');
  }
}

function openServiceModal(service) {
  window._serviceImageUploadPromise = null;

  openModal(
    service ? 'Edit Service' : 'Add Service',
    `
      <div class="form-group"><label>Service Name *</label><input class="admin-input" id="sName" value="${escapeAdminAttr(service?.name || '')}" placeholder="Full-Stack Web Development" /></div>
      <div class="form-group"><label>Icon / Emoji</label><input class="admin-input" id="sIcon" value="${escapeAdminAttr(service?.icon || '')}" placeholder="💻" /></div>
      <div class="form-group"><label>Short Description</label><textarea class="admin-input" id="sDesc" rows="3" placeholder="What this service offers...">${escapeAdminHtml(service?.desc || '')}</textarea></div>
      <div class="form-group"><label>Detailed Description</label><textarea class="admin-input" id="sLongDesc" rows="4" placeholder="Explain the service, approach and outcome...">${escapeAdminHtml(service?.longDescription || service?.details || '')}</textarea></div>
      <div class="form-group"><label>Category</label><input class="admin-input" id="sCategory" value="${escapeAdminAttr(service?.category || '')}" placeholder="Web Development" /></div>
      <div class="form-group"><label>Technologies / Tools</label><input class="admin-input" id="sTech" value="${escapeAdminAttr((service?.technologies || []).join(', '))}" placeholder="Node.js, Laravel, MySQL, API" /></div>
      <div class="form-group"><label>What's Included / Features</label><textarea class="admin-input" id="sFeatures" rows="4" placeholder="Responsive UI\nAPI integration\nDeployment\nMaintenance">${escapeAdminHtml((service?.features || []).join('\n'))}</textarea></div>
      <div class="form-group"><label>Starting Price <small>(optional)</small></label><input class="admin-input" id="sPrice" value="${escapeAdminAttr(service?.price || '')}" placeholder="$100+" /></div>
      <div class="form-group"><label>Delivery Time <small>(optional)</small></label><input class="admin-input" id="sDelivery" value="${escapeAdminAttr(service?.deliveryTime || '')}" placeholder="3–7 days" /></div>
      <div class="form-group"><label>Service URL / CTA <small>(optional)</small></label><input class="admin-input" id="sUrl" value="${escapeAdminAttr(service?.url || service?.link || '')}" placeholder="https://..." /></div>
      <div class="form-group"><label>Service Image</label><div class="img-upload-zone" id="serviceImgZone"><input type="file" accept="image/*" id="serviceImgFile" /><div class="upload-icon">🖼️</div><div class="upload-label">Click to upload image (JPG, PNG, WebP)</div><img class="img-preview" id="serviceImgPreview" ${service?.image ? `src="${escapeAdminAttr(service.image)}" style="display:block"` : ''} /></div><input type="hidden" id="sImage" value="${escapeAdminAttr(service?.image || '')}" /></div>
      <div class="form-group"><label><input type="checkbox" id="sFeatured" ${service?.featured ? 'checked' : ''}/> Featured / Popular</label></div>
      <div class="form-group"><label><input type="checkbox" id="sVisible" ${service?.visible !== false ? 'checked' : ''}/> Visible on frontend</label></div>
      <div class="form-group"><label>Display Order</label><input type="number" class="admin-input" id="sOrder" value="${Number.isFinite(service?.order) ? service.order : 0}" min="0" /></div>
    `,
    async () => {
      const name = document.getElementById('sName').value.trim();
      if (!name) return alert('Service name is required');

      if (window._serviceImageUploadPromise) {
        try { await window._serviceImageUploadPromise; }
        catch (error) { alert(error.message || 'Image upload failed.'); return; }
      }

      const services = PortfolioData.get('services') || [];
      const value = {
        id: service?.id || ('s' + Date.now()),
        name,
        icon: document.getElementById('sIcon').value.trim() || '🛠️',
        desc: document.getElementById('sDesc').value.trim(),
        longDescription: document.getElementById('sLongDesc').value.trim(),
        category: document.getElementById('sCategory').value.trim(),
        technologies: document.getElementById('sTech').value.split(',').map((x) => x.trim()).filter(Boolean),
        features: document.getElementById('sFeatures').value.split('\n').map((x) => x.trim()).filter(Boolean),
        price: document.getElementById('sPrice').value.trim(),
        deliveryTime: document.getElementById('sDelivery').value.trim(),
        url: document.getElementById('sUrl').value.trim(),
        image: document.getElementById('sImage').value.trim(),
        featured: document.getElementById('sFeatured').checked,
        visible: document.getElementById('sVisible').checked,
        order: Number(document.getElementById('sOrder').value) || 0
      };

      const next = service ? services.map((s) => s.id === service.id ? { ...s, ...value } : s) : [...services, value];
      try {
        await PortfolioData.save('services', next);
        closeModal();
        renderServicesAdmin();
      } catch (error) {
        alert(error.message || 'Failed to save service.');
      }
    }
  );

  setTimeout(() => {
    const input = document.getElementById('serviceImgFile');
    const preview = document.getElementById('serviceImgPreview');
    const imageField = document.getElementById('sImage');
    input?.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 8 * 1024 * 1024) {
        alert('Image is too large. Maximum size is 8 MB.');
        input.value = '';
        return;
      }
      preview.src = URL.createObjectURL(file);
      preview.style.display = 'block';
      window._serviceImageUploadPromise = uploadPortfolioImage(file, 'service').then((url) => {
        imageField.value = url;
        preview.src = url;
        return url;
      }).catch((error) => { imageField.value = ''; throw error; });
    });
  }, 100);
}

function escapeAdminHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
function escapeAdminAttr(value) { return escapeAdminHtml(value); }
