/* ═══════════════════════════════════════════════
   /api/messages
   Portfolio Messages API
   Neon PostgreSQL
   ═══════════════════════════════════════════════ */

const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {

  /* CORS */
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

    /* DATABASE CHECK */
    if (!process.env.DATABASE_URL) {

      return res.status(500).json({
        ok: false,
        error: 'DATABASE_URL is not configured.'
      });
    }

    const sql =
      neon(process.env.DATABASE_URL);


    /* ═══════════════════════════════
       CREATE TABLE
    ═══════════════════════════════ */

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


    /* ═══════════════════════════════
       GET — ALL MESSAGES
    ═══════════════════════════════ */

    if (req.method === 'GET') {

      const messages = await sql`
        SELECT
          id,
          name,
          email,
          subject,
          message,
          is_read,
          created_at
        FROM portfolio_messages
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
         CREATE MESSAGE
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
            error: 'name, email, subject and message are required.'
          });
        }

        const inserted = await sql`
          INSERT INTO portfolio_messages
            (
              name,
              email,
              subject,
              message,
              is_read
            )
          VALUES
            (
              ${name},
              ${email},
              ${subject},
              ${message},
              FALSE
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
         MARK AS READ
      ───────────────────────────── */

      if (action === 'read') {

        const id = body.id;

        if (!id) {

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

      /* Delete all */
      if (body.all === true) {

        await sql`
          DELETE FROM portfolio_messages
        `;

        return res.status(200).json({
          ok: true
        });
      }


      /* Delete one */
      if (body.id) {

        await sql`
          DELETE FROM portfolio_messages
          WHERE id = ${body.id}
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


    /* ═══════════════════════════════
       METHOD NOT ALLOWED
    ═══════════════════════════════ */

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
