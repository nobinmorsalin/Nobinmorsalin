const webpush = require('web-push');
const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed'
    });
  }

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({
      ok: false,
      error: 'Database is not configured.'
    });
  }

  const {
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
    VAPID_SUBJECT = 'mailto:nobinmorsalin7@gmail.com'
  } = process.env;

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return res.status(500).json({
      ok: false,
      error: 'VAPID keys are not configured.'
    });
  }

  try {
    webpush.setVapidDetails(
      VAPID_SUBJECT,
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );

    const {
      title = 'New Portfolio Message',
      body = 'You have a new message.',
      url = '/admin/#messages',
      icon = '/admin/app-icon.svg',
      badge = '/admin/app-icon.svg',
      image = undefined,
      tag = `portfolio-message-${Date.now()}`
    } = req.body || {};

    const sql = neon(process.env.DATABASE_URL);

    const rows = await sql`
      SELECT id, endpoint, p256dh, auth
      FROM portfolio_push_subscriptions
    `;

    const results = [];

    for (const row of rows) {
      const subscription = {
        endpoint: row.endpoint,
        keys: {
          p256dh: row.p256dh,
          auth: row.auth
        }
      };

      const payload = {
        title,
        body,
        url,
        icon,
        badge,
        tag,
        timestamp: Date.now()
      };

      // Only include image when supplied.
      if (image) {
        payload.image = image;
      }

      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify(payload)
        );

        results.push({
          id: row.id,
          ok: true
        });

      } catch (error) {
        const status = error.statusCode || 500;

        console.error(
          `PUSH DELIVERY ERROR [subscription ${row.id}]:`,
          error
        );

        // Remove expired/invalid subscriptions.
        if (status === 404 || status === 410) {
          try {
            await sql`
              DELETE FROM portfolio_push_subscriptions
              WHERE id = ${row.id}
            `;

            results.push({
              id: row.id,
              ok: false,
              status,
              removed: true
            });
          } catch (deleteError) {
            console.error(
              `FAILED TO REMOVE SUBSCRIPTION ${row.id}:`,
              deleteError
            );

            results.push({
              id: row.id,
              ok: false,
              status,
              removed: false
            });
          }
        } else {
          results.push({
            id: row.id,
            ok: false,
            status
          });
        }
      }
    }

    const sent = results.filter(result => result.ok).length;
    const failed = results.filter(result => !result.ok).length;

    return res.status(200).json({
      ok: true,
      sent,
      failed,
      total: results.length,
      results
    });

  } catch (error) {
    console.error('PUSH SEND ERROR:', error);

    return res.status(500).json({
      ok: false,
      error: 'Failed to send notifications.',
      details: process.env.NODE_ENV === 'development'
        ? error.message
        : undefined
    });
  }
};
