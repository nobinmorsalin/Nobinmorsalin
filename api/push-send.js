const webpush = require('web-push');
const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database is not configured.' });
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT = 'mailto:nobinmorsalin7@gmail.com' } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return res.status(500).json({ error: 'VAPID keys are not configured.' });

  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    const { title = 'New Portfolio Message', body = 'You have a new message.', url = '/admin/' } = req.body || {};
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT id, endpoint, p256dh, auth FROM portfolio_push_subscriptions`;
    const results = [];

    for (const row of rows) {
      const subscription = { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } };
      try {
        await webpush.sendNotification(subscription, JSON.stringify({ title, body, url, tag: 'portfolio-message' }));
        results.push({ id: row.id, ok: true });
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          await sql`DELETE FROM portfolio_push_subscriptions WHERE id = ${row.id}`;
        }
        results.push({ id: row.id, ok: false, status: error.statusCode || 500 });
      }
    }

    return res.status(200).json({ ok: true, sent: results.filter(x => x.ok).length, results });
  } catch (error) {
    console.error('PUSH SEND ERROR:', error);
    return res.status(500).json({ error: 'Failed to send notifications.' });
  }
};
