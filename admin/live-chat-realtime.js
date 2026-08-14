/* Admin live-chat refresh — no manual reload required. */
(() => {
  'use strict';

  const INTERVAL = 1200;
  let timer = null;
  let initialized = false;
  let signature = '';
  let requestInFlight = false;

  function isAdminVisible() {
    const wrap = document.getElementById('adminWrap');
    return Boolean(wrap && !wrap.classList.contains('hidden'));
  }

  function currentPanel() {
    const active = document.querySelector('.panel:not(.hidden)');
    return active?.id?.replace('panel-', '') || 'overview';
  }

  function getSignature(messages) {
    if (!Array.isArray(messages) || !messages.length) return '0';
    const newest = messages[0];
    return `${messages.length}:${newest.id}:${newest.created_at}:${newest.is_read}:${newest.sender || ''}`;
  }

  async function refresh(force = false) {
    if (!isAdminVisible() || requestInFlight || typeof window.loadMessagesFromAPI !== 'function') return;

    requestInFlight = true;
    try {
      const messages = await window.loadMessagesFromAPI();
      const nextSignature = getSignature(messages);

      if (!initialized) {
        signature = nextSignature;
        initialized = true;
        return;
      }

      if (!force && nextSignature === signature) return;

      /* Never destroy an active reply textarea. Keep the old signature so the
         same change is picked up immediately after the admin stops typing. */
      const active = document.activeElement;
      const typingReply = active && active.matches('textarea[id^="reply-"]');
      if (typingReply && !force) return;

      signature = nextSignature;

      if (typeof window.renderOverview === 'function') {
        window.renderOverview();
      }

      if (currentPanel() === 'messages' && typeof window.renderMessagesAdmin === 'function') {
        window.renderMessagesAdmin();
      }
    } catch (error) {
      console.error('ADMIN LIVE CHAT REFRESH ERROR:', error);
    } finally {
      requestInFlight = false;
    }
  }

  function start() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => refresh(false), INTERVAL);
    refresh(true);
  }

  function init() {
    start();
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) refresh(true);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
