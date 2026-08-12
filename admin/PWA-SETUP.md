# Admin PWA + Push setup

Required environment variables:
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` (for example `mailto:nobinmorsalin7@gmail.com`)
- `ADMIN_PUSH_SECRET`
- existing `DATABASE_URL`

Install dependency:
`npm install web-push`

The admin page should include:
- `<link rel="manifest" href="/admin/manifest.webmanifest">`
- `<script src="/admin/push.js" defer></script>`

After the admin is logged in, call `AdminPush.enable()` from a button labelled `Enable Notifications`.

The subscription API stores browser subscriptions in `admin_push_subscriptions` and the service worker displays push messages and opens `/admin/#messages` when tapped.
