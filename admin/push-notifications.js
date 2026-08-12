(() => {
  'use strict';

  async function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  }

  async function registerAdminPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return { ok: false, reason: 'unsupported' };

    const configResponse = await fetch('/api/push-config', { cache: 'no-store' });
    if (!configResponse.ok) return { ok: false, reason: 'not-configured' };
    const config = await configResponse.json();
    if (!config.configured || !config.publicKey) return { ok: false, reason: 'not-configured' };

    const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (permission !== 'granted') return { ok: false, reason: 'permission-denied' };

    const registration = await navigator.serviceWorker.register('/admin/sw.js', { scope: '/admin/' });
    await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: await urlBase64ToUint8Array(config.publicKey)
      });
    }

    const response = await fetch('/api/push-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: subscription.toJSON(), adminId: 'default' })
    });
    if (!response.ok) throw new Error('Could not save push subscription');
    localStorage.setItem('adminPushEnabled', '1');
    return { ok: true };
  }

  window.enableAdminNotifications = registerAdminPush;

  function addButton() {
    if (document.getElementById('enablePushBtn')) return;
    const header = document.querySelector('#panel-overview .panel-header');
    if (!header) return;
    const btn = document.createElement('button');
    btn.id = 'enablePushBtn';
    btn.className = 'btn btn-primary';
    btn.type = 'button';
    btn.textContent = '🔔 Enable Notifications';
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        const result = await registerAdminPush();
        if (result.ok) {
          btn.textContent = '🔔 Notifications Enabled';
          btn.classList.add('is-enabled');
        } else if (result.reason === 'permission-denied') {
          alert('Notification permission was denied. Please allow notifications for this site in your browser settings.');
          btn.disabled = false;
        } else if (result.reason === 'not-configured') {
          alert('Push notifications are not configured yet. Add VAPID keys to Vercel Environment Variables first.');
          btn.disabled = false;
        } else {
          alert('This browser does not support push notifications.');
          btn.disabled = false;
        }
      } catch (error) {
        console.error('ADMIN PUSH ERROR:', error);
        alert('Could not enable notifications.');
        btn.disabled = false;
      }
    });
    header.appendChild(btn);
  }

  function init() {
    addButton();
    if (localStorage.getItem('adminPushEnabled') === '1') {
      registerAdminPush().catch(() => {});
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
