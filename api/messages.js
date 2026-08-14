/* ═══════════════════════════════════════════════
   /api/messages
   Portfolio + Live Chat Messages API
   Neon PostgreSQL
   ═══════════════════════════════════════════════ */

const { neon } = require('@neondatabase/serverless');

const flagEmoji = (code = 'UN') => {
  const c = String(code).toUpperCase();
  if (!/^[A-Z]{2}$/.test(c) || c === 'UN') return '🌐';
  return String.fromCodePoint(...[...c].map(ch => 127397 + ch.charCodeAt(0)));
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ ok: false, error: 'DATABASE_URL is not configured.' });
    }

    const sql = neon(process.env.DATABASE_URL);

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
    await sql`ALTER TABLE portfolio_messages ADD COLUMN IF NOT EXISTS visitor_ip TEXT`;
    await sql`ALTER TABLE portfolio_messages ADD COLUMN IF NOT EXISTS country_code TEXT`;
    await sql`ALTER TABLE portfolio_messages ADD COLUMN IF NOT EXISTS country_name TEXT`;

    if (req.method === 'GET') {
      const conversationId = typeof req.query?.conversation_id === 'string'
        ? req.query.conversation_id.trim()
        : '';

      if (conversationId) {
        const messages = await sql`
          SELECT id, name, email, subject, message, is_read, created_at,
                 conversation_id, sender, visitor_ip, country_code, country_name
          FROM portfolio_messages
          WHERE conversation_id = ${conversationId}
          ORDER BY created_at ASC
        `;
        return res.status(200).json({ ok: true, messages });
      }

      /*
       * Admin live-chat view: one record = one visitor conversation.
       * This prevents the same visitor from appearing as many separate cards.
       * The transcript is flattened into one message field for compatibility
       * with the existing admin renderer.
       */
      const rows = await sql`
        SELECT id, name, email, subject, message, is_read, created_at,
               conversation_id, sender, visitor_ip, country_code, country_name
        FROM portfolio_messages
        WHERE conversation_id IS NOT NULL
        ORDER BY created_at ASC
      `;

      const normalMessages = await sql`
        SELECT id, name, email, subject, message, is_read, created_at,
               conversation_id, sender, visitor_ip, country_code, country_name
        FROM portfolio_messages
        WHERE conversation_id IS NULL
           OR sender = 'contact'
        ORDER BY created_at DESC
      `;

      const conversations = new Map();

      for (const row of rows) {
        const key = row.conversation_id;
        if (!conversations.has(key)) conversations.set(key, []);
        conversations.get(key).push(row);
      }

      const grouped = [...conversations.values()].map(items => {
        const visitorMessages = items.filter(m => m.sender === 'visitor');
        const latestVisitor = visitorMessages[visitorMessages.length - 1] || items[items.length - 1];
        const latest = items[items.length - 1];
        const id = latestVisitor?.id || latest.id;
        const visitorId = latestVisitor?.conversation_id || latest.conversation_id;
        const countryCode = latestVisitor?.country_code || latest.country_code || 'UN';
        const countryName = latestVisitor?.country_name || latest.country_name || 'Unknown';
        const ip = latestVisitor?.visitor_ip || latest.visitor_ip || 'Unknown';
        const unread = visitorMessages.some(m => !m.is_read);

        const transcript = items.map(item => {
          const who = item.sender === 'admin'
            ? 'Admin'
            : item.sender === 'bot'
              ? 'Auto-reply'
              : 'Visitor';
          const stamp = new Date(item.created_at).toLocaleString('en-US', {
            dateStyle: 'short', timeStyle: 'short'
          });
          return `[${who} · ${stamp}]\n${item.message}`;
        }).join('\n\n');

        return {
          id,
          name: `Visitor · ${String(visitorId).slice(-10)}`,
          email: '',
          subject: `${flagEmoji(countryCode)} ${countryName} · IP ${ip} · ID ${visitorId} · ${items.length} messages`,
          message: transcript,
          is_read: !unread,
          created_at: latest.created_at,
          conversation_id: visitorId,
          sender: 'visitor',
          visitor_ip: ip,
          country_code: countryCode,
          country_name: countryName
        };
      });

      grouped.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return res.status(200).json({
        ok: true,
        messages: [...grouped, ...normalMessages]
      });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const action = body.action;

      if (action === 'create') {
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        const email = typeof body.email === 'string' ? body.email.trim() : '';
        const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
        const message = typeof body.message === 'string' ? body.message.trim() : '';

        if (!name || !email || !subject || !message) {
          return res.status(400).json({ ok: false, error: 'name, email, subject and message are required.' });
        }

        const inserted = await sql`
          INSERT INTO portfolio_messages (name, email, subject, message, is_read, sender)
          VALUES (${name}, ${email}, ${subject}, ${message}, FALSE, 'contact')
          RETURNING id, created_at
        `;
        return res.status(201).json({ ok: true, message: inserted[0] });
      }

      if (action === 'reply') {
        const messageId = Number(body.messageId);
        const reply = typeof body.message === 'string' ? body.message.trim() : '';

        if (!Number.isFinite(messageId) || messageId <= 0) {
          return res.status(400).json({ ok: false, error: 'Valid message ID is required.' });
        }
        if (!reply) return res.status(400).json({ ok: false, error: 'Reply message is required.' });

        const original = await sql`
          SELECT id, conversation_id, visitor_ip, country_code, country_name
          FROM portfolio_messages
          WHERE id = ${messageId}
          LIMIT 1
        `;

        if (!original.length) return res.status(404).json({ ok: false, error: 'Original message not found.' });
        if (!original[0].conversation_id) {
          return res.status(400).json({ ok: false, error: 'This message is not a live-chat conversation.' });
        }

        const conversationId = original[0].conversation_id;

        const inserted = await sql`
          INSERT INTO portfolio_messages
            (name, email, subject, message, is_read, conversation_id, sender, visitor_ip, country_code, country_name)
          VALUES
            ('Nobin Morsalin', '', 'Admin Reply', ${reply}, TRUE, ${conversationId}, 'admin',
             ${original[0].visitor_ip || 'Unknown'}, ${original[0].country_code || 'UN'}, ${original[0].country_name || 'Unknown'})
          RETURNING id, created_at, conversation_id, sender
        `;

        await sql`
          UPDATE portfolio_messages
          SET is_read = TRUE
          WHERE conversation_id = ${conversationId}
            AND sender = 'visitor'
        `;

        return res.status(201).json({ ok: true, reply: inserted[0] });
      }

      if (action === 'read') {
        const id = Number(body.id);
        if (!Number.isFinite(id) || id <= 0) {
          return res.status(400).json({ ok: false, error: 'Message ID is required.' });
        }

        const target = await sql`
          SELECT conversation_id FROM portfolio_messages WHERE id = ${id} LIMIT 1
        `;

        if (target[0]?.conversation_id) {
          await sql`
            UPDATE portfolio_messages
            SET is_read = TRUE
            WHERE conversation_id = ${target[0].conversation_id}
              AND sender = 'visitor'
          `;
        } else {
          await sql`UPDATE portfolio_messages SET is_read = TRUE WHERE id = ${id}`;
        }

        return res.status(200).json({ ok: true });
      }

      return res.status(400).json({ ok: false, error: 'Invalid action.' });
    }

    if (req.method === 'DELETE') {
      const body = req.body || {};

      if (body.all === true) {
        await sql`DELETE FROM portfolio_messages`;
        return res.status(200).json({ ok: true });
      }

      const id = Number(body.id);
      if (Number.isFinite(id) && id > 0) {
        const target = await sql`
          SELECT conversation_id FROM portfolio_messages WHERE id = ${id} LIMIT 1
        `;
        if (target[0]?.conversation_id) {
          await sql`DELETE FROM portfolio_messages WHERE conversation_id = ${target[0].conversation_id}`;
        } else {
          await sql`DELETE FROM portfolio_messages WHERE id = ${id}`;
        }
        return res.status(200).json({ ok: true });
      }

      return res.status(400).json({ ok: false, error: 'Message ID is required.' });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  } catch (error) {
    console.error('MESSAGES API ERROR:', error);
    return res.status(500).json({ ok: false, error: 'Database operation failed.' });
  }
};
