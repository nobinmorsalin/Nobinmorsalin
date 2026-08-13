/* ═══════════════════════════════════════════════
   /api/chat
   Visitor Live Chat
   Neon Database + Auto Reply + Admin Push
   ═══════════════════════════════════════════════ */

const { neon } = require('@neondatabase/serverless');

const AUTO_REPLIES = [
  {
    match: /price|cost|rate|charge|budget/i,
    reply: "My rates depend on the project scope. Tell me about your project and I'll give you a custom quote! 💰"
  },
  {
    match: /time|long|deadline|fast|quick/i,
    reply: "Delivery time depends on the project. Simple sites usually take 3–5 days, while complex apps can take 1–3 weeks. ⏱️"
  },
  {
    match: /api|webhook|integration|connect/i,
    reply: "API integrations are my specialty! REST APIs, webhooks and server-to-server systems — I can handle them. 🔗"
  },
  {
    match: /design|figma|ui|ux|mockup/i,
    reply: "Yes! I can handle UI/UX design and Figma-based interfaces with a clean, modern look. 🎨"
  },
  {
    match: /react|vue|next|node|stack/i,
    reply: "I work with React, Node.js, Vanilla JS and other modern technologies. ⚡"
  },
  {
    match: /hello|hi|hey|salaam|hola/i,
    reply: "Hey there! 👋 Great to hear from you. What kind of project are you working on?"
  },
  {
    match: /email|smtp|mail/i,
    reply: "I can build SMTP and transactional email systems with reliable delivery. 📧"
  },
  {
    match: /available|free|hire|work/i,
    reply: "I'm currently available for new projects! Tell me what you're building and let's discuss it. 🚀"
  },
  {
    match: /thanks|thank you|great|good/i,
    reply: "You're welcome! 😊 Feel free to tell me more about your project."
  }
];

function getAutoReply(message) {
  const found = AUTO_REPLIES.find(item => item.match.test(message));
  return found
    ? found.reply
    : "Thanks for your message! 👋 I've received it and will get back to you soon.";
}

async function notifyAdmin(message, conversationId) {
  try {
    const host = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : null;

    if (!host) return;

    await fetch(`${host}/api/push-send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '💬 New Live Chat Message',
        body: message.length > 120 ? `${message.slice(0, 117)}...` : message,
        url: `/admin/#messages?conversation=${encodeURIComponent(conversationId)}`,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: `live-chat-${conversationId}`
      })
    });
  } catch (error) {
    // Push failure must never break the live-chat message flow.
    console.error('LIVE CHAT PUSH ERROR:', error);
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ ok: false, error: 'DATABASE_URL is not configured.' });
    }

    const sql = neon(process.env.DATABASE_URL);
    const body = req.body || {};

    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const conversationId = typeof body.conversationId === 'string' ? body.conversationId.trim() : '';

    if (!message) {
      return res.status(400).json({ ok: false, error: 'Message is required.' });
    }

    if (!conversationId) {
      return res.status(400).json({ ok: false, error: 'Conversation ID is required.' });
    }

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

    await sql`
      ALTER TABLE portfolio_messages
      ADD COLUMN IF NOT EXISTS conversation_id TEXT
    `;

    await sql`
      ALTER TABLE portfolio_messages
      ADD COLUMN IF NOT EXISTS sender TEXT
    `;

    const visitorMessage = await sql`
      INSERT INTO portfolio_messages
        (name, email, subject, message, is_read, conversation_id, sender)
      VALUES
        ('Live Chat Visitor', 'livechat@visitor.local', 'Live Chat', ${message}, FALSE, ${conversationId}, 'visitor')
      RETURNING id, created_at
    `;

    // Notify the subscribed admin device after the visitor message is saved.
    await notifyAdmin(message, conversationId);

    const reply = getAutoReply(message);

    const botMessage = await sql`
      INSERT INTO portfolio_messages
        (name, email, subject, message, is_read, conversation_id, sender)
      VALUES
        ('Nobin Morsalin', 'admin@portfolio.local', 'Live Chat Reply', ${reply}, TRUE, ${conversationId}, 'bot')
      RETURNING id, created_at
    `;

    return res.status(200).json({
      ok: true,
      saved: true,
      messageId: visitorMessage[0]?.id || null,
      replyId: botMessage[0]?.id || null,
      reply
    });
  } catch (error) {
    console.error('LIVE CHAT ERROR:', error);
    return res.status(500).json({ ok: false, error: 'Unable to save chat message.' });
  }
};
