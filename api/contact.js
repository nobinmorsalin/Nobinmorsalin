const nodemailer = require('nodemailer');
const webpush = require('web-push');
const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !subject || !message) return res.status(400).json({ error: 'All fields are required.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email address.' });
    if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database is not configured.' });

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

    const inserted = await sql`
      INSERT INTO portfolio_messages (name, email, subject, message)
      VALUES (${name}, ${email}, ${subject}, ${message})
      RETURNING id
    `;

    console.log('Message saved to database.', inserted[0]?.id);

    // Push notification to subscribed admin devices. Notification failure never blocks message delivery.
    try {
      const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT = 'mailto:nobinmorsalin7@gmail.com' } = process.env;
      if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
        webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
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
        const subscriptions = await sql`SELECT id, endpoint, p256dh, auth FROM portfolio_push_subscriptions`;
        const payload = JSON.stringify({
          title: '🔔 New Portfolio Message',
          body: `${name}: ${subject}`,
          url: '/admin/',
          tag: 'portfolio-message'
        });
        for (const row of subscriptions) {
          try {
            await webpush.sendNotification({ endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } }, payload);
          } catch (pushError) {
            if (pushError.statusCode === 404 || pushError.statusCode === 410) {
              await sql`DELETE FROM portfolio_push_subscriptions WHERE id = ${row.id}`;
            } else {
              console.error('PUSH DELIVERY ERROR:', pushError);
            }
          }
        }
      }
    } catch (pushSetupError) {
      console.error('PUSH SETUP ERROR:', pushSetupError);
    }

    const { SMTP_HOST = 'smtp.gmail.com', SMTP_PORT = '587', SMTP_USER, SMTP_PASS, CONTACT_TO } = process.env;
    if (!SMTP_USER || !SMTP_PASS || !CONTACT_TO) {
      return res.status(200).json({ ok: true, saved: true, emailSent: false });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10),
      secure: parseInt(SMTP_PORT, 10) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });

    await transporter.sendMail({
      from: `"Portfolio Contact" <${SMTP_USER}>`,
      to: CONTACT_TO,
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#0D1117;color:#E6EDF3;border-radius:12px;overflow:hidden"><div style="background:#00F5A0;padding:24px 32px"><h2 style="margin:0;color:#080C10">New message from your portfolio</h2></div><div style="padding:32px"><p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Subject:</strong> ${escapeHtml(subject)}</p><div style="margin-top:24px;padding:20px;background:#161B22;border-radius:8px;border-left:3px solid #00F5A0">${escapeHtml(message).replace(/\n/g, '<br>')}</div></div></div>`
    });

    await transporter.sendMail({
      from: `"Nobin" <${SMTP_USER}>`,
      to: email,
      subject: `Got your message, ${name}! — Nobin`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#0D1117;color:#E6EDF3;border-radius:12px;overflow:hidden"><div style="background:#00F5A0;padding:24px 32px"><h2 style="margin:0;color:#080C10">Thanks for reaching out!</h2></div><div style="padding:32px"><p>Hey ${escapeHtml(name)}! 👋</p><p style="color:#8B949E">I've received your message and will get back to you within 24 hours.</p><div style="padding:20px;background:#161B22;border-radius:8px;margin-top:20px">${escapeHtml(message).replace(/\n/g, '<br>')}</div><p style="color:#8B949E;margin-top:24px">Talk soon,<br><strong style="color:#E6EDF3">Nobin</strong></p></div></div>`
    });

    return res.status(200).json({ ok: true, saved: true, emailSent: true });
  } catch (error) {
    console.error('CONTACT API ERROR:', error);
    return res.status(500).json({ error: 'Failed to process message.' });
  }
};

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
