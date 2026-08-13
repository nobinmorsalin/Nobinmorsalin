/* Admin PWA push notification client */
(function () {
  'use strict';

  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return null;
    return navigator.serviceWorker.register('/admin/sw.js', { scope: '/admin/' });
  }

  async function enableAdminNotifications() {
    if (!('Notification' in window) || !('PushManager' in window)) {
      throw new Error('Push notifications are not supported on this device/browser.');
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Notification permission was not granted.');
    const registration = await registerServiceWorker();
    const keyResponse = await fetch('/api/admin-push');
    const keyData = await keyResponse.json();
    if (!keyResponse.ok || !keyData.ok || !keyData.publicKey) throw new Error(keyData.error || 'Push service is not configured.');
    const existing = await registration.pushManager.getSubscription();
    const subscription = existing || await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyData.publicKey)
    });
    const response = await fetch('/api/admin-push', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || 'Could not save notification subscription.');
    localStorage.setItem('adminPushEnabled', '1');
    return subscription;
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const rawData = atob((base64String + padding).replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from([...rawData].map(ch => ch.charCodeAt(0)));
  }

  window.AdminPush = { registerServiceWorker, enable: enableAdminNotifications };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', registerServiceWorker);
  else registerServiceWorker();
})();
