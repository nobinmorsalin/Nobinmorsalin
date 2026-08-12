import webpush from 'web-push';
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method not allowed' });
    if (!process.env.ADMIN_PUSH_SECRET || req.headers['x-admin-push-secret'] !== process.env.ADMIN_PUSH_SECRET) {
      return res.status(401).json({ ok:false, error:'Unauthorized' });
    }
    const { title, body, url } = req.body || {};
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:nobinmorsalin7@gmail.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT id, endpoint, p256dh, auth FROM admin_push_subscriptions`;
    const payload = JSON.stringify({ title: title || 'New Portfolio Message', body: body || 'A new message has arrived.', url: url || '/admin/#messages' });
    let sent = 0;
    for (const row of rows) {
      try {
        await webpush.sendNotification({ endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } }, payload);
        sent++;
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) await sql`DELETE FROM admin_push_subscriptions WHERE id=${row.id}`;
      }
    }
    return res.status(200).json({ ok:true, sent });
  } catch (error) {
    console.error('PORTFOLIO MESSAGE NOTIFY ERROR:', error);
    return res.status(500).json({ ok:false, error:error.message || 'Notification failed' });
  }
}
