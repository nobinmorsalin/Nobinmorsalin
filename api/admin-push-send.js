import webpush from 'web-push';
import { neon } from '@neondatabase/serverless';

function configure() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:nobinmorsalin7@gmail.com';
  if (!publicKey || !privateKey) throw new Error('VAPID keys are not configured');
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method not allowed' });
    configure();
    const secret = req.headers['x-admin-push-secret'];
    if (!process.env.ADMIN_PUSH_SECRET || secret !== process.env.ADMIN_PUSH_SECRET) {
      return res.status(401).json({ ok:false, error:'Unauthorized' });
    }
    const { title, body, url } = req.body || {};
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT id, endpoint, p256dh, auth FROM admin_push_subscriptions`;
    const payload = JSON.stringify({ title: title || 'New Portfolio Message', body: body || 'A new message has arrived.', url: url || '/admin/#messages' });
    const expired = [];
    for (const row of rows) {
      try {
        await webpush.sendNotification({ endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } }, payload);
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) expired.push(row.id);
        else console.error('PUSH DELIVERY ERROR:', error);
      }
    }
    if (expired.length) await sql`DELETE FROM admin_push_subscriptions WHERE id = ANY(${expired})`;
    return res.status(200).json({ ok:true, sent: rows.length - expired.length, removed: expired.length });
  } catch (error) {
    console.error('ADMIN PUSH SEND ERROR:', error);
    return res.status(500).json({ ok:false, error:error.message || 'Push send failed' });
  }
}
