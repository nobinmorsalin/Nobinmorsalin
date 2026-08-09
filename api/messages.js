const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {

    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        error: 'DATABASE_URL is not configured.'
      });
    }

    const sql = neon(process.env.DATABASE_URL);

    /*
     * Make sure table exists
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
     * GET
     * Return all messages
     */

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


    /*
     * POST
     * Mark message as read
     */

    if (req.method === 'POST') {

      const {
        action,
        id
      } = req.body || {};

      if (action === 'read' && id) {

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
        error: 'Invalid action.'
      });
    }


    /*
     * DELETE
     * Delete one/all messages
     */

    if (req.method === 'DELETE') {

      const {
        id,
        all
      } = req.body || {};

      if (all === true) {

        await sql`
          DELETE FROM portfolio_messages
        `;

        return res.status(200).json({
          ok: true
        });
      }

      if (id) {

        await sql`
          DELETE FROM portfolio_messages
          WHERE id = ${id}
        `;

        return res.status(200).json({
          ok: true
        });
      }

      return res.status(400).json({
        error: 'Message ID is required.'
      });
    }


    return res.status(405).json({
      error: 'Method not allowed.'
    });

  } catch (error) {

    console.error('MESSAGES API ERROR:', error);

    return res.status(500).json({
      error: 'Database operation failed.'
    });
  }
};
