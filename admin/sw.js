const CACHE_NAME = 'nobin-admin-v2';
const APP_SHELL = ['/admin/','/admin/manifest.webmanifest'];
const ADMIN_SCOPE = '/admin/';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith('/admin')) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { body: event.data?.text?.() || 'You have a new message.' };
  }

  const title = data.title || 'New Portfolio Message';
  const options = {
    body: data.body || 'A new message has arrived.',
    icon: data.icon || '/admin/app-icon.svg',
    badge: data.badge || '/admin/app-icon.svg',
    tag: data.tag || 'portfolio-message',
    renotify: true,
    data: { url: data.url || '/admin/#messages' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const rawTarget = event.notification.data?.url || '/admin/#messages';
  const target = rawTarget.startsWith('/') ? rawTarget : '/admin/#messages';
  const targetUrl = new URL(target, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      // Only reuse an Admin/PWA window. Never redirect the public portfolio tab.
      const adminClient = list.find(client => {
        try {
          const url = new URL(client.url);
          return url.origin === self.location.origin && url.pathname.startsWith(ADMIN_SCOPE) && 'focus' in client;
        } catch (_) {
          return false;
        }
      });

      if (adminClient) {
        return adminClient.navigate(targetUrl).then(() => adminClient.focus());
      }

      // If the installed PWA is not currently open, open the Admin start URL.
      // On supported Android PWA installations this is handled by the installed app.
      return self.clients.openWindow(targetUrl);
    })
  );
});
