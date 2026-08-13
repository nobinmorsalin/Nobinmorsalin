const webpush = require('web-push');
const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method not allowed' });
  if (!process.env.DATABASE_URL) return res.status(500).json({ ok:false, error:'Database is not configured.' });

  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT = 'mailto:nobinmorsalin7@gmail.com' } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return res.status(500).json({ ok:false, error:'VAPID keys are not configured.' });

  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    const {
      title='Nobin Morsalin Admin',
      body='You have a new message.',
      url='/admin/#messages',
      icon='/admin/app-icon.svg',
      badge='/admin/app-icon.svg',
      tag=`admin-message-${Date.now()}`
    } = req.body || {};

    const payload = JSON.stringify({ title, body, url, icon, badge, tag, timestamp:Date.now() });
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT id, endpoint, p256dh, auth FROM portfolio_push_subscriptions`;
    const results = [];

    for (const row of rows) {
      try {
        await webpush.sendNotification({ endpoint:row.endpoint, keys:{ p256dh:row.p256dh, auth:row.auth } }, payload);
        results.push({ id:row.id, ok:true });
      } catch (error) {
        const status = error.statusCode || 500;
        console.error(`PUSH DELIVERY ERROR [${row.id}]`, error);
        if (status === 404 || status === 410) {
          await sql`DELETE FROM portfolio_push_subscriptions WHERE id=${row.id}`;
          results.push({ id:row.id, ok:false, status, removed:true });
        } else results.push({ id:row.id, ok:false, status });
      }
    }

    return res.status(200).json({ ok:true, sent:results.filter(x=>x.ok).length, failed:results.filter(x=>!x.ok).length, total:results.length, results });
  } catch (error) {
    console.error('PUSH SEND ERROR:', error);
    return res.status(500).json({ ok:false, error:'Failed to send notifications.' });
  }
};
