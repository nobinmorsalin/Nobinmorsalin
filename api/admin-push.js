import webpush from 'web-push';
import { sql } from '@vercel/postgres';

function configure() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:nobinmorsalin7@gmail.com';
  if (!publicKey || !privateKey) throw new Error('VAPID keys are not configured');
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export default async function handler(req, res) {
  try {
    configure();
    if (req.method === 'POST') {
      const { subscription } = req.body || {};
      if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
        return res.status(400).json({ ok: false, error: 'Invalid push subscription' });
      }
      await sql`CREATE TABLE IF NOT EXISTS admin_push_subscriptions (
        id BIGSERIAL PRIMARY KEY,
        endpoint TEXT UNIQUE NOT NULL,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`INSERT INTO admin_push_subscriptions (endpoint,p256dh,auth)
        VALUES (${subscription.endpoint},${subscription.keys.p256dh},${subscription.keys.auth})
        ON CONFLICT (endpoint) DO UPDATE SET p256dh=EXCLUDED.p256dh, auth=EXCLUDED.auth, updated_at=NOW()`;
      return res.status(200).json({ ok: true });
    }
    if (req.method === 'GET') {
      return res.status(200).json({ ok: true, publicKey: process.env.VAPID_PUBLIC_KEY });
    }
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('ADMIN PUSH ERROR:', error);
    return res.status(500).json({ ok: false, error: error.message || 'Push service error' });
  }
}
