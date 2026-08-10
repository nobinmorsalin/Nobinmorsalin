/* ═══════════════════════════════════════════════
   /api/chat — Live Chat + Database
   Saves visitor messages to Neon DB and returns
   an automatic reply.
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

module.exports = async function handler(req, res) {

  /* CORS */
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'POST, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed'
    });
  }

  try {

    /* DATABASE */
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is missing');

      return res.status(500).json({
        ok: false,
        error: 'DATABASE_URL is not configured.'
      });
    }

    const sql = neon(process.env.DATABASE_URL);

    /* REQUEST */
    const { message } = req.body || {};

    if (
      typeof message !== 'string' ||
      !message.trim()
    ) {
      return res.status(400).json({
        ok: false,
        error: 'Message is required.'
      });
    }

    const cleanMessage = message.trim();

    /* Make sure table exists */
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

    /*
     * SAVE LIVE CHAT MESSAGE
     *
     * We use a fixed visitor identity because
     * the current chat UI does not ask for name/email.
     */
    const inserted = await sql`
      INSERT INTO portfolio_messages
        (name, email, subject, message, is_read)
      VALUES
        (
          'Live Chat Visitor',
          'livechat@visitor.local',
          'Live Chat',
          ${cleanMessage},
          FALSE
        )
      RETURNING
        id,
        created_at
    `;

    /* AUTO REPLY */
    const matched = AUTO_REPLIES.find(
      item => item.match.test(cleanMessage)
    );

    const reply = matched
      ? matched.reply
      : "Thanks for your message! 👋 I've received it and will get back to you soon.";

    /* Small natural delay */
    await new Promise(resolve => setTimeout(resolve, 700));

    return res.status(200).json({
      ok: true,
      saved: true,
      messageId: inserted[0]?.id || null,
      reply
    });

  } catch (error) {

    console.error('LIVE CHAT ERROR:', error);

    return res.status(500).json({
      ok: false,
      error: 'Unable to save chat message.'
    });
  }
};
