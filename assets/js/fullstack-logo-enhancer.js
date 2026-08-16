/* Full-stack ecosystem icon enhancement — visual-only additive patch. */
(() => {
  'use strict';

  const ICON_BASE = 'https://cdn.simpleicons.org/';
  const OFFICIAL = {
    'Node.js': ['nodedotjs', '5FA04E'],
    'HTML5': ['html5', 'E34F26'],
    'CSS': ['css', '663399'],
    'JavaScript': ['javascript', 'F7DF1E'],
    'Tailwind CSS': ['tailwindcss', '06B6D4'],
    'Laravel': ['laravel', 'FF2D20'],
    'PHP': ['php', '777BB4'],
    'MySQL': ['mysql', '4479A1'],
    'UI / UX': ['figma', 'F24E1E'],
    'Motion': ['framer', '0055FF'],
    'REST API': ['swagger', '85EA2D'],
    'API Integration': ['postman', 'FF6C37'],
    'E-commerce': ['woocommerce', '96588A'],
    'Payment Integration': ['stripe', '635BFF'],
    'SEO': ['google', '4285F4'],
    'Meta Pixel': ['meta', '0866FF'],
    'Meta CAPI': ['meta', '0866FF'],
    'Workflow Automation': ['n8n', 'EA4B71']
  };

  const CUSTOM = {
    'Responsive UI': ['#22D3EE', '<rect x="3" y="4" width="18" height="15" rx="2"/><path d="M7 22h10M9 19v3M15 19v3"/>'],
    'Authentication': ['#A78BFA', '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>'],
    'Server Architecture': ['#38BDF8', '<rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/><path d="M7 7h.01M7 17h.01M11 7h6M11 17h6"/>'],
    'Database Design': ['#60A5FA', '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>'],
    'Data Management': ['#34D399', '<path d="M5 5h14M5 12h14M5 19h14"/><circle cx="9" cy="5" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="11" cy="19" r="2"/>'],
    'Webhooks': ['#F59E0B', '<path d="M8 8a4 4 0 1 1 4 4H8m8 4a4 4 0 1 1-4-4h4"/><path d="M17 5l3 3-3 3M7 13l-3 3 3 3"/>'],
    'S2S Callback': ['#14B8A6', '<path d="M5 8h14M19 8l-3-3M19 8l-3 3M19 16H5M5 16l3-3M5 16l3 3"/>'],
    'Postback Systems': ['#8B5CF6', '<path d="M5 12h14M15 8l4 4-4 4M9 16l-4-4 4-4"/>'],
    'Third-party APIs': ['#06B6D4', '<circle cx="6" cy="12" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M8.5 10.5l7-3M8.5 13.5l7 3"/>'],
    'Courier Integration': ['#F97316', '<path d="M3 6h11v11H3zM14 10h4l3 3v4h-7zM7 19a2 2 0 1 0 0 .01M18 19a2 2 0 1 0 0 .01"/>'],
    'Order Systems': ['#F59E0B', '<path d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4"/>'],
    'Admin Systems': ['#94A3B8', '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5L9 6a7 7 0 0 0-1.7 1L5 6 3 9.5 5 11a7 7 0 0 0 0 2l-2 1.5L5 18l2.3-1a7 7 0 0 0 1.7 1l.5 3h5l.5-3a7 7 0 0 0 1.7-1l2.3 1 2-3.5-2-1.5a7 7 0 0 0 .1-1z"/>'],
    'Customer Systems': ['#38BDF8', '<circle cx="12" cy="8" r="3"/><path d="M5 20a7 7 0 0 1 14 0M18 5a3 3 0 0 1 0 6M20 20a5 5 0 0 0-3-4.6"/>'],
    'SMTP / Email': ['#60A5FA', '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6"/>'],
    'Email Automation': ['#A78BFA', '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6M18 3l.7 2.3L21 6l-2.3.7L18 9l-.7-2.3L15 6l2.3-.7z"/>'],
    'Conversion Tracking': ['#F43F5E', '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>'],
    'GPT / Reward Platforms': ['#C084FC', '<path d="M12 2l1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7zM19 15l.6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6z"/>'],
    'Real-time Systems': ['#22D3EE', '<path d="M3 12h3l2-7 4 14 2-7h5"/>'],
    'Custom Web Apps': ['#818CF8', '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01M13 6.5h.01"/>'],
    'Automation': ['#FB7185', '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/><circle cx="12" cy="12" r="4"/>']
  };

  function svgData(color, body) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function apply() {
    const section = document.getElementById('fullstack-ecosystem');
    if (!section) return false;

    section.querySelectorAll('.fse-chip').forEach(chip => {
      const name = chip.getAttribute('title');
      if (!name) return;

      const official = OFFICIAL[name];
      let img = chip.querySelector('img');
      const custom = CUSTOM[name];

      if (official) {
        if (!img) {
          img = document.createElement('img');
          chip.insertBefore(img, chip.firstChild);
        }
        img.src = `${ICON_BASE}${official[0]}/${official[1]}`;
        img.alt = `${name} logo`;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.style.display = 'block';
        chip.classList.remove('fse-no-icon');
        return;
      }

      if (custom) {
        if (img) img.remove();
        let customIcon = chip.querySelector('.fse-custom-icon');
        if (!customIcon) {
          customIcon = document.createElement('img');
          customIcon.className = 'fse-custom-icon';
          customIcon.alt = '';
          customIcon.setAttribute('aria-hidden', 'true');
          chip.insertBefore(customIcon, chip.firstChild);
        }
        customIcon.src = svgData(custom[0], custom[1]);
        chip.classList.remove('fse-no-icon');
      }
    });

    return true;
  }

  const start = performance.now();
  const timer = window.setInterval(() => {
    if (apply() || performance.now() - start > 6000) window.clearInterval(timer);
  }, 80);
  window.setTimeout(apply, 0);
})();
