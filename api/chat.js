/* Visitor Live Chat — Neon + Admin Push */
const { neon } = require('@neondatabase/serverless');

async function notifyAdmin(req, conversationId, message) {
  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || 'https';
    if (!host) return;

    const response = await fetch(`${proto}://${host}/api/push-send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '💬 New Live Chat Message',
        body: message.length > 120 ? `${message.slice(0, 117)}...` : message,
        url: `/admin/#messages?conversation=${encodeURIComponent(conversationId)}`,
        icon: '/admin/app-icon.svg',
        badge: '/admin/app-icon.svg',
        tag: `live-chat-${conversationId}-${Date.now()}`
      })
    });

    if (!response.ok) {
      console.error('LIVE CHAT PUSH HTTP', response.status, await response.text().catch(() => ''));
    }
  } catch (error) {
    // Push failure must never prevent the chat message from being saved.
    console.error('LIVE CHAT PUSH ERROR:', error);
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ ok: false, error: 'DATABASE_URL is not configured.' });
    }

    const sql = neon(process.env.DATABASE_URL);
    const body = req.body || {};
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const conversationId = typeof body.conversationId === 'string' ? body.conversationId.trim() : '';

    if (!message) return res.status(400).json({ ok: false, error: 'Message is required.' });
    if (!conversationId) return res.status(400).json({ ok: false, error: 'Conversation ID is required.' });

    await sql`
      CREATE TABLE IF NOT EXISTS portfolio_messages (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await sql`ALTER TABLE portfolio_messages ADD COLUMN IF NOT EXISTS conversation_id TEXT`;
    await sql`ALTER TABLE portfolio_messages ADD COLUMN IF NOT EXISTS sender TEXT`;

    /*
     * A conversation is identified by the visitor's local conversation ID.
     * The first visitor message gets one acknowledgement only. Every later
     * message stays in the same conversation without another bot message.
     */
    const existingConversation = await sql`
      SELECT COUNT(*)::int AS count
      FROM portfolio_messages
      WHERE conversation_id = ${conversationId}
    `;
    const isFirstMessage = Number(existingConversation[0]?.count || 0) === 0;

    const visitorMessage = await sql`
      INSERT INTO portfolio_messages
        (name, email, subject, message, is_read, conversation_id, sender)
      VALUES
        ('Live Chat Visitor', '', 'Live Chat', ${message}, FALSE, ${conversationId}, 'visitor')
      RETURNING id, created_at, conversation_id, sender
    `;

    /* Push every visitor message to the admin device. */
    await notifyAdmin(req, conversationId, message);

    let reply = null;
    let replyId = null;

    if (isFirstMessage) {
      reply = "Thanks for your message! 👋 I've received it and will get back to you soon.";

      const botMessage = await sql`
        INSERT INTO portfolio_messages
          (name, email, subject, message, is_read, conversation_id, sender)
        VALUES
          ('Nobin Morsalin', 'admin@portfolio.local', 'Live Chat Reply', ${reply}, TRUE, ${conversationId}, 'bot')
        RETURNING id, created_at
      `;

      replyId = botMessage[0]?.id || null;
    }

    return res.status(200).json({
      ok: true,
      saved: true,
      isFirstMessage,
      messageId: visitorMessage[0]?.id || null,
      replyId,
      reply
    });
  } catch (error) {
    console.error('LIVE CHAT ERROR:', error);
    return res.status(500).json({ ok: false, error: 'Unable to save chat message.' });
  }
};
