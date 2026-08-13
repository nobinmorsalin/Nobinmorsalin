const CACHE_NAME = 'nobin-admin-v3';

const APP_SHELL = [
  '/admin/',
  '/admin/manifest.webmanifest',
  '/admin/app-icon.svg',
  '/favicon.svg'
];

const ADMIN_PATH = '/admin/';

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
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (
    url.origin !== self.location.origin ||
    !url.pathname.startsWith(ADMIN_PATH)
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request)
    )
  );
});

self.addEventListener('push', event => {
  let data = {};

  try {
    data = event.data
      ? event.data.json()
      : {};
  } catch (error) {
    data = {
      body:
        event.data?.text?.() ||
        'You have a new message.'
    };
  }

  const title =
    data.title ||
    'Nobin Morsalin Admin';

  const options = {
    body:
      data.body ||
      'You have a new message.',

    // Premium branded notification icon
    icon:
      data.icon ||
      '/admin/app-icon.svg',

    // Android notification badge
    badge:
      data.badge ||
      '/admin/app-icon.svg',

    // Every new message gets its own notification
    tag:
      data.tag ||
      `admin-message-${Date.now()}`,

    renotify: true,

    vibrate: [200, 100, 200],

    timestamp: Date.now(),

    data: {
      // IMPORTANT:
      // Always keep notification destination
      // inside the Admin PWA scope.
      url:
        data.url &&
        String(data.url).startsWith('/admin/')
          ? data.url
          : '/admin/#messages',

      appUrl: '/admin/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const notificationData =
    event.notification.data || {};

  let target =
    notificationData.url ||
    '/admin/#messages';

  /*
   * SECURITY / ROUTING RULE
   *
   * Never navigate to:
   * - portfolio homepage
   * - external website
   * - random browser tab
   *
   * Notification clicks are restricted
   * to the Admin PWA scope.
   */

  if (!target.startsWith('/admin/')) {
    target = '/admin/#messages';
  }

  const targetUrl =
    new URL(
      target,
      self.location.origin
    ).href;

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true
      })
      .then(clientList => {

        /*
         * First find an existing ADMIN client only.
         *
         * We intentionally DO NOT use:
         *
         *   list[0]
         *
         * or any arbitrary browser tab.
         */

        const adminClient =
          clientList.find(client => {
            try {
              const url =
                new URL(client.url);

              return (
                url.origin ===
                  self.location.origin &&
                url.pathname.startsWith(
                  ADMIN_PATH
                )
              );
            } catch (_) {
              return false;
            }
          });

        if (adminClient) {

          /*
           * Existing Admin PWA/browser window:
           * navigate ONLY that Admin window.
           */

          return adminClient
            .navigate(targetUrl)
            .then(() => {
              return adminClient.focus();
            })
            .catch(() => {
              return adminClient.focus();
            });
        }

        /*
         * No Admin client is currently open.
         *
         * Open the Admin URL only.
         *
         * If the browser/Android recognizes the
         * installed PWA scope, it will open the
         * installed Admin app.
         */

        return clients.openWindow(
          targetUrl
        );
      })
  );
});
