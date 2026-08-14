/*
 * ADMIN IMAGE DELETE CONTROL
 * Adds a safe "Remove image" action to every admin image upload field.
 * It clears the hidden image URL used by the existing save handlers,
 * so existing CRUD/upload logic remains untouched.
 */
(() => {
  'use strict';

  const STYLE_ID = 'admin-image-delete-style';
  const BUTTON_CLASS = 'admin-image-remove-btn';
  const processed = new WeakSet();

  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .${BUTTON_CLASS} {
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:7px;
        margin-top:10px;
        min-height:38px;
        padding:8px 14px;
        border:1px solid rgba(255,107,107,.32);
        border-radius:10px;
        background:rgba(255,107,107,.08);
        color:#ff8f8f;
        font:600 13px/1 Inter,system-ui,sans-serif;
        cursor:pointer;
        transition:background .18s ease,border-color .18s ease,transform .18s ease;
      }
      .${BUTTON_CLASS}:hover {
        background:rgba(255,107,107,.15);
        border-color:rgba(255,107,107,.55);
      }
      .${BUTTON_CLASS}:active { transform:scale(.98); }
      .${BUTTON_CLASS}[hidden] { display:none; }
    `;
    document.head.appendChild(style);
  }

  function findHiddenImageField(zone) {
    const group = zone.closest('.form-group') || zone.parentElement;
    if (!group) return null;
    return group.querySelector('input[type="hidden"]');
  }

  function findPreview(zone) {
    return zone.querySelector('img.img-preview, img[id*="Preview"], img');
  }

  function updateButton(button, hiddenInput, preview) {
    const hasImage = Boolean(hiddenInput?.value?.trim() || (preview && preview.getAttribute('src')));
    button.hidden = !hasImage;
  }

  function processZone(zone) {
    if (!zone || processed.has(zone)) return;
    const fileInput = zone.querySelector('input[type="file"]');
    if (!fileInput || !fileInput.accept?.includes('image')) return;

    const hiddenInput = findHiddenImageField(zone);
    const preview = findPreview(zone);
    if (!hiddenInput) return;

    processed.add(zone);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = BUTTON_CLASS;
    button.innerHTML = '🗑️ Remove current image';
    button.hidden = true;

    zone.insertAdjacentElement('afterend', button);

    button.addEventListener('click', () => {
      hiddenInput.value = '';
      fileInput.value = '';

      if (preview) {
        preview.removeAttribute('src');
        preview.style.display = 'none';
      }

      button.hidden = true;

      // Let existing upload/save handlers observe the cleared value.
      hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
      hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const sync = () => updateButton(button, hiddenInput, preview);
    sync();

    hiddenInput.addEventListener('input', sync);
    hiddenInput.addEventListener('change', sync);

    // When a new image is uploaded, existing handlers normally update the
    // hidden field and preview; the listeners above make the button reappear.
    if (preview) {
      const observer = new MutationObserver(sync);
      observer.observe(preview, { attributes: true, attributeFilter: ['src', 'style'] });
    }
  }

  function scan() {
    addStyles();
    document.querySelectorAll('.img-upload-zone').forEach(processZone);
  }

  function init() {
    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
