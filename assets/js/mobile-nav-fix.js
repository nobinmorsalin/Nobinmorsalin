/* Mobile navigation stacking fix. Runs after the existing mobile polish + premium UI layers. */
(function () {
  'use strict';

  function install() {
    if (document.getElementById('mobile-nav-fix-v1')) return;

    const style = document.createElement('style');
    style.id = 'mobile-nav-fix-v1';
    style.textContent = `
      @media (max-width: 680px) {
        /* The old .nav z-index creates a stacking context below the backdrop.
           Put the nav itself above the backdrop so its drawer can actually render. */
        .nav#nav {
          z-index: 10080 !important;
        }

        .nav#nav .nav-links,
        .nav#nav .nav-links.active,
        .nav#nav .nav-links.open,
        .nav#nav .nav-links.is-open {
          z-index: 10090 !important;
        }

        .nav#nav .nav-toggle {
          z-index: 10100 !important;
        }

        .mobile-nav-backdrop {
          z-index: 10070 !important;
          backdrop-filter: blur(3px) !important;
          -webkit-backdrop-filter: blur(3px) !important;
        }
      }
    `;
    document.head.appendChild(style);

    const links = document.getElementById('navLinks');
    const toggle = document.getElementById('navToggle');
    if (!links || !toggle) return;

    /* Keep the drawer state visually consistent if another legacy handler
       toggles active/open classes. The existing mobile navigation remains the
       source of truth; this only mirrors its open state. */
    const sync = () => {
      const open = links.classList.contains('is-open') ||
        links.classList.contains('active') ||
        links.classList.contains('open');
      if (open) {
        toggle.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    };

    const observer = new MutationObserver(sync);
    observer.observe(links, { attributes: true, attributeFilter: ['class'] });
    sync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
