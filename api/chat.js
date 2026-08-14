/* Visitor Live Chat — Neon + Admin Push */
const { neon } = require('@neondatabase/serverless');

function getVisitorMeta(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  const ip = String(forwarded || realIp || '').split(',')[0].trim() || 'Unknown';
  const countryCode = String(req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'] || '').trim().toUpperCase() || 'UN';
  const countryNames = { BD:'Bangladesh', US:'United States', GB:'United Kingdom', CA:'Canada', AU:'Australia', DE:'Germany', FR:'France', IN:'India', PK:'Pakistan', AE:'United Arab Emirates', SA:'Saudi Arabia', MY:'Malaysia', SG:'Singapore', JP:'Japan', KR:'South Korea', NL:'Netherlands', IT:'Italy', ES:'Spain' };
  return { ip, countryCode, countryName: countryNames[countryCode] || countryCode };
}

async function notifyAdmin(req, conversationId, message) {
  try {
    const publicSite = String(process.env.PUBLIC_SITE_URL || 'https://nobinmorsalin.vercel.app').replace(/\/$/, '');
    const response = await fetch(`${publicSite}/api/push-send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({
        title: 'New Live Chat Message',
        body: message.length > 120 ? `${message.slice(0, 117)}...` : message,
        url: `/admin/#messages?conversation=${encodeURIComponent(conversationId)}`,
        icon: '/admin/app-icon.svg',
        badge: '/admin/app-icon.svg',
        tag: `live-chat-${conversationId}`
      })
    });
    if (!response.ok) console.error('LIVE CHAT PUSH HTTP', response.status, await response.text().catch(() => ''));
  } catch (error) {
    console.error('LIVE CHAT PUSH ERROR:', error);
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    if (!process.env.DATABASE_URL) return res.status(500).json({ ok: false, error: 'DATABASE_URL is not configured.' });

    const sql = neon(process.env.DATABASE_URL);
    const body = req.body || {};
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const conversationId = typeof body.conversationId === 'string' ? body.conversationId.trim() : '';
    const visitor = getVisitorMeta(req);

    if (!message) return res.status(400).json({ ok: false, error: 'Message is required.' });
    if (!conversationId) return res.status(400).json({ ok: false, error: 'Conversation ID is required.' });

    await sql`CREATE TABLE IF NOT EXISTS portfolio_messages (id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, subject TEXT NOT NULL, message TEXT NOT NULL, is_read BOOLEAN DEFAULT FALSE, created_at TIMESTAMPTZ DEFAULT NOW())`;
    await sql`ALTER TABLE portfolio_messages ADD COLUMN IF NOT EXISTS conversation_id TEXT`;
    await sql`ALTER TABLE portfolio_messages ADD COLUMN IF NOT EXISTS sender TEXT`;
    await sql`ALTER TABLE portfolio_messages ADD COLUMN IF NOT EXISTS visitor_ip TEXT`;
    await sql`ALTER TABLE portfolio_messages ADD COLUMN IF NOT EXISTS country_code TEXT`;
    await sql`ALTER TABLE portfolio_messages ADD COLUMN IF NOT EXISTS country_name TEXT`;

    const existingBotReply = await sql`
      SELECT id FROM portfolio_messages
      WHERE conversation_id = ${conversationId} AND sender = 'bot'
      ORDER BY created_at ASC LIMIT 1
    `;
    const isFirstMessage = existingBotReply.length === 0;

    const visitorMessage = await sql`
      INSERT INTO portfolio_messages (name, email, subject, message, is_read, conversation_id, sender, visitor_ip, country_code, country_name)
      VALUES ('Live Chat Visitor', '', 'Live Chat', ${message}, FALSE, ${conversationId}, 'visitor', ${visitor.ip}, ${visitor.countryCode}, ${visitor.countryName})
      RETURNING id, created_at, conversation_id, sender
    `;

    await notifyAdmin(req, conversationId, message);

    let reply = null;
    let replyId = null;
    if (isFirstMessage) {
      reply = "Thanks for your message! I've received it and will get back to you soon.";
      const botMessage = await sql`
        INSERT INTO portfolio_messages (name, email, subject, message, is_read, conversation_id, sender, visitor_ip, country_code, country_name)
        VALUES ('Nobin Morsalin', '', 'Live Chat Reply', ${reply}, TRUE, ${conversationId}, 'bot', ${visitor.ip}, ${visitor.countryCode}, ${visitor.countryName})
        RETURNING id, created_at
      `;
      replyId = botMessage[0]?.id || null;
    }

    return res.status(200).json({ ok: true, saved: true, isFirstMessage, visitor: { id: conversationId, ip: visitor.ip, countryCode: visitor.countryCode, countryName: visitor.countryName }, messageId: visitorMessage[0]?.id || null, replyId, reply });
  } catch (error) {
    console.error('LIVE CHAT ERROR:', error);
    return res.status(500).json({ ok: false, error: 'Unable to save chat message.' });
  }
};
