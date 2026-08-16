/* Admin navigation state — single routing layer for existing hash-based panels. */
(() => {
  'use strict';

  const ROUTES = new Set([
    'overview',
    'services',
    'projects',
    'clients',
    'skills',
    'workflow',
    'messages',
    'settings'
  ]);

  function normalizeRoute(value) {
    const route = String(value || '')
      .replace(/^#/, '')
      .split('?')[0]
      .trim();

    return ROUTES.has(route) ? route : 'overview';
  }

  function currentRoute() {
    return normalizeRoute(window.location.hash);
  }

  function panelButton(route) {
    return Array.from(document.querySelectorAll('.sidebar .sb-btn'))
      .find(button => button.dataset.panel === route) || null;
  }

  function activatePanel(route) {
    const target = normalizeRoute(route);
    const buttons = Array.from(document.querySelectorAll('.sidebar .sb-btn'));
    const panels = Array.from(document.querySelectorAll('.panel'));
    const button = panelButton(target);

    buttons.forEach(item => item.classList.toggle('active', item === button));
    panels.forEach(panel => panel.classList.toggle('hidden', panel.id !== `panel-${target}`));

    if (target === 'messages' && typeof window.loadMessagesFromAPI === 'function') {
      Promise.resolve(window.loadMessagesFromAPI())
        .then(() => window.renderPanel?.('messages'))
        .catch(() => window.renderPanel?.('messages'));
    } else {
      window.renderPanel?.(target);
    }

    if (target === 'clients') {
      window.renderClientsAdmin?.();
    }
  }

  function navigateAdminSection(route, { replace = false } = {}) {
    const target = normalizeRoute(route);
    const hash = `#${target}`;

    if (window.location.hash !== hash) {
      if (replace) {
        window.history.replaceState(null, '', hash);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      } else {
        window.location.hash = target;
        return;
      }
    }

    activatePanel(target);
  }

  window.navigateAdminSection = navigateAdminSection;

  function handleSidebarClick(event) {
    const button = event.target.closest?.('.sidebar .sb-btn');
    if (!button) return;

    const route = normalizeRoute(button.dataset.panel);
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    navigateAdminSection(route);
  }

  function wireDashboardShortcuts() {
    const overviewStats = document.getElementById('overviewStats');

    if (overviewStats && !overviewStats.dataset.adminRouteBound) {
      overviewStats.dataset.adminRouteBound = '1';
      overviewStats.addEventListener('click', event => {
        const card = event.target.closest('.stat-card');
        if (!card) return;

        const cards = Array.from(overviewStats.querySelectorAll('.stat-card'));
        const index = cards.indexOf(card);
        const route = ['services', 'projects', 'messages', 'messages'][index];
        if (route) navigateAdminSection(route);
      });
    }

    const recentMessages = document.getElementById('recentMessages');
    if (recentMessages && !recentMessages.dataset.adminRouteBound) {
      recentMessages.dataset.adminRouteBound = '1';
      recentMessages.addEventListener('click', event => {
        if (event.target.closest('a,button,input,textarea,select')) return;
        navigateAdminSection('messages');
      });
    }

    document.querySelectorAll('[data-admin-route]').forEach(element => {
      if (element.dataset.adminRouteBound) return;
      element.dataset.adminRouteBound = '1';
      element.addEventListener('click', event => {
        event.preventDefault();
        navigateAdminSection(element.dataset.adminRoute);
      });
    });
  }

  function restoreFromHash() {
    const route = currentRoute();

    if (!window.location.hash) {
      navigateAdminSection('overview', { replace: true });
      return;
    }

    activatePanel(route);
    wireDashboardShortcuts();
  }

  function init() {
    document.addEventListener('click', handleSidebarClick, true);
    window.addEventListener('hashchange', () => {
      activatePanel(currentRoute());
      wireDashboardShortcuts();
    });

    wireDashboardShortcuts();

    /* Restore after the existing async Admin initializer completes. */
    window.setTimeout(restoreFromHash, 0);
    window.setTimeout(restoreFromHash, 150);
    window.setTimeout(restoreFromHash, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
