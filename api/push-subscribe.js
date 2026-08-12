const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database is not configured.' });

  try {
    const { subscription, adminId = 'default' } = req.body || {};
    if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return res.status(400).json({ error: 'Invalid push subscription.' });
    }

    const sql = neon(process.env.DATABASE_URL);
    await sql`
      CREATE TABLE IF NOT EXISTS portfolio_push_subscriptions (
        id BIGSERIAL PRIMARY KEY,
        admin_id TEXT NOT NULL,
        endpoint TEXT NOT NULL UNIQUE,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      INSERT INTO portfolio_push_subscriptions (admin_id, endpoint, p256dh, auth)
      VALUES (${adminId}, ${subscription.endpoint}, ${subscription.keys.p256dh}, ${subscription.keys.auth})
      ON CONFLICT (endpoint) DO UPDATE SET
        admin_id = EXCLUDED.admin_id,
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        updated_at = NOW()
    `;

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('PUSH SUBSCRIBE ERROR:', error);
    return res.status(500).json({ error: 'Failed to save push subscription.' });
  }
};
