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

  function installResponsivePipelineStyles() {
    if (document.getElementById('fse-responsive-pipeline-styles')) return;
    const style = document.createElement('style');
    style.id = 'fse-responsive-pipeline-styles';
    style.textContent = `
      /* Responsive visual system for the ecosystem only. All rules are scoped to #fullstack-ecosystem. */
      #fullstack-ecosystem { overflow: hidden; }
      #fullstack-ecosystem .fse-container { width: min(100% - 28px, 1280px); margin-inline: auto; }
      #fullstack-ecosystem .fse-pipeline { width: 100%; max-width: 1240px; box-sizing: border-box; }
      #fullstack-ecosystem .fse-node { box-sizing: border-box; min-width: 0; }
      #fullstack-ecosystem .fse-chip { max-width: 100%; box-sizing: border-box; }
      #fullstack-ecosystem .fse-chip b { min-width: 0; overflow-wrap: anywhere; }
      #fullstack-ecosystem .fse-chip img,
      #fullstack-ecosystem .fse-chip .fse-custom-icon { width: 17px !important; height: 17px !important; min-width: 17px; object-fit: contain; flex: 0 0 17px; filter: none !important; opacity: 1 !important; }

      /* Large desktop: readable 4 + 3 serpentine architecture instead of seven cramped columns. */
      @media (min-width: 1100px) {
        #fullstack-ecosystem .fse-pipeline { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; gap: 22px 18px !important; align-items: stretch; }
        #fullstack-ecosystem .fse-node { min-height: 310px; padding: 22px 19px 19px; }
        #fullstack-ecosystem .fse-node:nth-child(1) { grid-column: 1; grid-row: 1; }
        #fullstack-ecosystem .fse-node:nth-child(2) { grid-column: 2; grid-row: 1; }
        #fullstack-ecosystem .fse-node:nth-child(3) { grid-column: 3; grid-row: 1; }
        #fullstack-ecosystem .fse-node:nth-child(4) { grid-column: 4; grid-row: 1; }
        #fullstack-ecosystem .fse-node:nth-child(5) { grid-column: 3; grid-row: 2; }
        #fullstack-ecosystem .fse-node:nth-child(6) { grid-column: 2; grid-row: 2; }
        #fullstack-ecosystem .fse-node:nth-child(7) { grid-column: 1; grid-row: 2; }
        #fullstack-ecosystem .fse-flow-line { display: none !important; }
        #fullstack-ecosystem .fse-stage-arrow { display: grid; }
        #fullstack-ecosystem .fse-node:nth-child(4) .fse-stage-arrow { transform: rotate(135deg); right: auto; left: 50%; top: auto; bottom: -29px; }
        #fullstack-ecosystem .fse-node:nth-child(5) .fse-stage-arrow { transform: rotate(180deg); }
        #fullstack-ecosystem .fse-node:nth-child(6) .fse-stage-arrow { transform: rotate(180deg); }
        #fullstack-ecosystem .fse-node:nth-child(7) .fse-stage-arrow { display: none; }
        #fullstack-ecosystem .fse-node:nth-child(1)::after,
        #fullstack-ecosystem .fse-node:nth-child(2)::after,
        #fullstack-ecosystem .fse-node:nth-child(3)::after,
        #fullstack-ecosystem .fse-node:nth-child(5)::after,
        #fullstack-ecosystem .fse-node:nth-child(6)::after { content: ''; position: absolute; top: 50%; width: 18px; height: 1px; background: linear-gradient(90deg, rgba(0,245,160,.35), rgba(0,212,255,.2)); pointer-events: none; }
        #fullstack-ecosystem .fse-node:nth-child(1)::after,
        #fullstack-ecosystem .fse-node:nth-child(2)::after,
        #fullstack-ecosystem .fse-node:nth-child(3)::after { right: -19px; }
        #fullstack-ecosystem .fse-node:nth-child(5)::after,
        #fullstack-ecosystem .fse-node:nth-child(6)::after { left: -19px; }
      }

      /* Tablet: two-column connected architecture with comfortable touch targets. */
      @media (min-width: 768px) and (max-width: 1099px) {
        #fullstack-ecosystem .fse-pipeline { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 18px !important; }
        #fullstack-ecosystem .fse-node { min-height: 285px; padding: 20px 17px; }
        #fullstack-ecosystem .fse-flow-line { display: none !important; }
        #fullstack-ecosystem .fse-stage-arrow { display: none !important; }
      }

      /* Mobile: one clear vertical pipeline. No horizontal overflow, no overlapping desktop cards. */
      @media (max-width: 767px) {
        #fullstack-ecosystem { padding: 58px 0 72px !important; }
        #fullstack-ecosystem .fse-container { width: calc(100% - 28px) !important; max-width: 520px !important; }
        #fullstack-ecosystem .fse-heading { margin-bottom: 22px !important; }
        #fullstack-ecosystem .fse-heading-row { display: block !important; }
        #fullstack-ecosystem .fse-heading .section-title { font-size: clamp(1.7rem, 8vw, 2.25rem) !important; line-height: 1.08 !important; max-width: 100% !important; }
        #fullstack-ecosystem .fse-heading .section-sub { font-size: .82rem !important; line-height: 1.6 !important; max-width: 100% !important; }
        #fullstack-ecosystem .fse-readout { display: inline-flex !important; margin-top: 14px; max-width: 100%; }
        #fullstack-ecosystem .fse-architecture { margin-top: 14px !important; padding: 8px 0 0 !important; }
        #fullstack-ecosystem .fse-core { width: 152px !important; height: 152px !important; margin-bottom: 18px !important; }
        #fullstack-ecosystem .fse-core-inner { width: 102px !important; height: 102px !important; }
        #fullstack-ecosystem .fse-core-inner strong { font-size: .92rem !important; }
        #fullstack-ecosystem .fse-core-inner em { font-size: .48rem !important; }
        #fullstack-ecosystem .fse-flow-caption { margin-bottom: 18px !important; }
        #fullstack-ecosystem .fse-pipeline { display: grid !important; grid-template-columns: minmax(0, 1fr) !important; grid-auto-flow: row !important; gap: 34px !important; width: 100% !important; max-width: 520px !important; margin: 0 auto !important; }
        #fullstack-ecosystem .fse-node,
        #fullstack-ecosystem .fse-node:nth-child(n) { grid-column: 1 !important; grid-row: auto !important; min-width: 0 !important; width: 100% !important; min-height: 0 !important; height: auto !important; padding: 18px 16px 17px !important; border-radius: 18px !important; transform: none; }
        #fullstack-ecosystem .fse-node-head { margin-bottom: 14px !important; }
        #fullstack-ecosystem .fse-node-label { font-size: .52rem !important; }
        #fullstack-ecosystem .fse-node h3 { font-size: 1.08rem !important; line-height: 1.16 !important; margin-bottom: 8px !important; }
        #fullstack-ecosystem .fse-node p { font-size: .78rem !important; line-height: 1.55 !important; min-height: 0 !important; margin-bottom: 14px !important; }
        #fullstack-ecosystem .fse-chips { gap: 7px !important; }
        #fullstack-ecosystem .fse-chip { min-height: 34px !important; padding: 7px 9px !important; border-radius: 9px !important; font-size: .68rem !important; max-width: 100% !important; }
        #fullstack-ecosystem .fse-chip b { white-space: normal !important; overflow-wrap: anywhere !important; }
        #fullstack-ecosystem .fse-chip img,
        #fullstack-ecosystem .fse-chip .fse-custom-icon { width: 18px !important; height: 18px !important; min-width: 18px !important; flex-basis: 18px !important; }
        #fullstack-ecosystem .fse-flow-line { display: none !important; }
        #fullstack-ecosystem .fse-stage-arrow { display: grid !important; right: auto !important; left: 50% !important; top: auto !important; bottom: -27px !important; width: 20px !important; height: 20px !important; transform: translateX(-50%) rotate(90deg) !important; }
        #fullstack-ecosystem .fse-node:nth-child(7) .fse-stage-arrow { display: none !important; }
        #fullstack-ecosystem .fse-node::after { display: none !important; }
        #fullstack-ecosystem .fse-node-port { top: 0 !important; left: 50% !important; right: auto !important; transform: translate(-50%, -50%) !important; }
        #fullstack-ecosystem .fse-in { display: block !important; }
        #fullstack-ecosystem .fse-out { display: none !important; }
        #fullstack-ecosystem .fse-foot { display: block !important; margin-top: 24px !important; line-height: 1.6 !important; }
        #fullstack-ecosystem .fse-foot b { display: block; margin-top: 7px; }
      }

      @media (prefers-reduced-motion: reduce) {
        #fullstack-ecosystem .fse-core-orbit,
        #fullstack-ecosystem .fse-core-halo,
        #fullstack-ecosystem .fse-live-dot,
        #fullstack-ecosystem .fse-flow-pulse { animation: none !important; }
        #fullstack-ecosystem .fse-node,
        #fullstack-ecosystem .fse-chip { transition: none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  const start = performance.now();
  const timer = window.setInterval(() => {
    if (apply() || performance.now() - start > 6000) {
      window.clearInterval(timer);
      installResponsivePipelineStyles();
    }
  }, 80);
  window.setTimeout(() => {
    apply();
    installResponsivePipelineStyles();
  }, 0);
})();
