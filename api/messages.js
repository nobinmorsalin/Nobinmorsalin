/* ═══════════════════════════════════════════════
   /api/messages
   Portfolio + Live Chat Messages API
   Neon PostgreSQL
   ═══════════════════════════════════════════════ */

const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {

  res.setHeader(
    'Access-Control-Allow-Origin',
    '*'
  );

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, DELETE, OPTIONS'
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {

    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        ok: false,
        error: 'DATABASE_URL is not configured.'
      });
    }

    const sql = neon(
      process.env.DATABASE_URL
    );

    /*
     * Existing table.
     */
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
     * Live-chat columns.
     */
    await sql`
      ALTER TABLE portfolio_messages
      ADD COLUMN IF NOT EXISTS conversation_id TEXT
    `;

    await sql`
      ALTER TABLE portfolio_messages
      ADD COLUMN IF NOT EXISTS sender TEXT
    `;


    /* ═══════════════════════════════
       GET
    ═══════════════════════════════ */

    if (req.method === 'GET') {

      const conversationId =
        typeof req.query?.conversation_id === 'string'
          ? req.query.conversation_id.trim()
          : '';

      /*
       * Visitor requests only its own conversation.
       * Includes visitor + bot + admin replies.
       */
      if (conversationId) {

        const messages = await sql`
          SELECT
            id,
            name,
            email,
            subject,
            message,
            is_read,
            created_at,
            conversation_id,
            sender
          FROM portfolio_messages
          WHERE conversation_id = ${conversationId}
          ORDER BY created_at ASC
        `;

        return res.status(200).json({
          ok: true,
          messages
        });
      }

      /*
       * Admin gets normal messages + visitor messages
       * but bot auto-replies are hidden from the main
       * Admin message list.
       */
      const messages = await sql`
        SELECT
          id,
          name,
          email,
          subject,
          message,
          is_read,
          created_at,
          conversation_id,
          sender
        FROM portfolio_messages
        WHERE sender IS NULL
           OR sender <> 'bot'
        ORDER BY created_at DESC
      `;

      return res.status(200).json({
        ok: true,
        messages
      });
    }


    /* ═══════════════════════════════
       POST
    ═══════════════════════════════ */

    if (req.method === 'POST') {

      const body = req.body || {};

      const action = body.action;


      /* ─────────────────────────────
         CREATE NORMAL MESSAGE
      ───────────────────────────── */

      if (action === 'create') {

        const name =
          typeof body.name === 'string'
            ? body.name.trim()
            : '';

        const email =
          typeof body.email === 'string'
            ? body.email.trim()
            : '';

        const subject =
          typeof body.subject === 'string'
            ? body.subject.trim()
            : '';

        const message =
          typeof body.message === 'string'
            ? body.message.trim()
            : '';

        if (
          !name ||
          !email ||
          !subject ||
          !message
        ) {
          return res.status(400).json({
            ok: false,
            error:
              'name, email, subject and message are required.'
          });
        }

        const inserted = await sql`
          INSERT INTO portfolio_messages
            (
              name,
              email,
              subject,
              message,
              is_read,
              sender
            )
          VALUES
            (
              ${name},
              ${email},
              ${subject},
              ${message},
              FALSE,
              'contact'
            )
          RETURNING
            id,
            created_at
        `;

        return res.status(201).json({
          ok: true,
          message: inserted[0]
        });
      }


      /* ─────────────────────────────
         ADMIN REPLY
      ───────────────────────────── */

      if (action === 'reply') {

        const messageId =
          Number(body.messageId);

        const reply =
          typeof body.message === 'string'
            ? body.message.trim()
            : '';

        if (
          !Number.isFinite(messageId) ||
          messageId <= 0
        ) {
          return res.status(400).json({
            ok: false,
            error: 'Valid message ID is required.'
          });
        }

        if (!reply) {
          return res.status(400).json({
            ok: false,
            error: 'Reply message is required.'
          });
        }

        /*
         * Find the original live-chat message.
         */
        const original = await sql`
          SELECT
            id,
            conversation_id
          FROM portfolio_messages
          WHERE id = ${messageId}
          LIMIT 1
        `;

        if (!original.length) {
          return res.status(404).json({
            ok: false,
            error: 'Original message not found.'
          });
        }

        const conversationId =
          original[0].conversation_id;

        if (!conversationId) {
          return res.status(400).json({
            ok: false,
            error:
              'This message is not a live-chat conversation.'
          });
        }

        /*
         * Save Admin reply into the same conversation.
         */
        const inserted = await sql`
          INSERT INTO portfolio_messages
            (
              name,
              email,
              subject,
              message,
              is_read,
              conversation_id,
              sender
            )
          VALUES
            (
              'Nobin Morsalin',
              'admin@portfolio.local',
              'Admin Reply',
              ${reply},
              TRUE,
              ${conversationId},
              'admin'
            )
          RETURNING
            id,
            created_at,
            conversation_id,
            sender
        `;

        /*
         * Mark original visitor message as read.
         */
        await sql`
          UPDATE portfolio_messages
          SET is_read = TRUE
          WHERE id = ${messageId}
        `;

        return res.status(201).json({
          ok: true,
          reply: inserted[0]
        });
      }


      /* ─────────────────────────────
         MARK READ
      ───────────────────────────── */

      if (action === 'read') {

        const id =
          Number(body.id);

        if (
          !Number.isFinite(id) ||
          id <= 0
        ) {
          return res.status(400).json({
            ok: false,
            error: 'Message ID is required.'
          });
        }

        await sql`
          UPDATE portfolio_messages
          SET is_read = TRUE
          WHERE id = ${id}
        `;

        return res.status(200).json({
          ok: true
        });
      }


      return res.status(400).json({
        ok: false,
        error: 'Invalid action.'
      });
    }


    /* ═══════════════════════════════
       DELETE
    ═══════════════════════════════ */

    if (req.method === 'DELETE') {

      const body = req.body || {};


      if (body.all === true) {

        await sql`
          DELETE FROM portfolio_messages
        `;

        return res.status(200).json({
          ok: true
        });
      }


      const id =
        Number(body.id);

      if (
        Number.isFinite(id) &&
        id > 0
      ) {

        await sql`
          DELETE FROM portfolio_messages
          WHERE id = ${id}
        `;

        return res.status(200).json({
          ok: true
        });
      }


      return res.status(400).json({
        ok: false,
        error: 'Message ID is required.'
      });
    }


    return res.status(405).json({
      ok: false,
      error: 'Method not allowed.'
    });

  } catch (error) {

    console.error(
      'MESSAGES API ERROR:',
      error
    );

    return res.status(500).json({
      ok: false,
      error: 'Database operation failed.'
    });
  }
};
