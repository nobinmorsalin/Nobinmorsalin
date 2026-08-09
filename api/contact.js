const nodemailer = require('nodemailer');
const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const {
      name,
      email,
      subject,
      message
    } = req.body || {};

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: 'All fields are required.'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: 'Invalid email address.'
      });
    }

    // -----------------------------
    // DATABASE
    // -----------------------------

    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is missing');

      return res.status(500).json({
        error: 'Database is not configured.'
      });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Make sure table exists
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

    // Save message
    await sql`
      INSERT INTO portfolio_messages
        (name, email, subject, message)
      VALUES
        (${name}, ${email}, ${subject}, ${message})
    `;

    console.log('Message saved to database.');

    // -----------------------------
    // SMTP CONFIGURATION
    // -----------------------------

    const {
      SMTP_HOST = 'smtp.gmail.com',
      SMTP_PORT = '587',
      SMTP_USER,
      SMTP_PASS,
      CONTACT_TO
    } = process.env;

    /*
     * Database save is the important part.
     *
     * If SMTP isn't configured yet,
     * don't make the contact form fail.
     */
    if (!SMTP_USER || !SMTP_PASS || !CONTACT_TO) {
      console.log(
        'SMTP not configured. Message was saved to database.'
      );

      return res.status(200).json({
        ok: true,
        saved: true,
        emailSent: false
      });
    }

    // -----------------------------
    // SMTP TRANSPORTER
    // -----------------------------

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10),
      secure: parseInt(SMTP_PORT, 10) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    // -----------------------------
    // EMAIL TO ADMIN
    // -----------------------------

    await transporter.sendMail({
      from: `"Portfolio Contact" <${SMTP_USER}>`,
      to: CONTACT_TO,
      replyTo: email,
      subject: `[Portfolio] ${subject}`,

      html: `
        <div style="
          font-family:Arial,sans-serif;
          max-width:600px;
          margin:auto;
          background:#0D1117;
          color:#E6EDF3;
          border-radius:12px;
          overflow:hidden;
        ">

          <div style="
            background:#00F5A0;
            padding:24px 32px;
          ">
            <h2 style="
              margin:0;
              color:#080C10;
            ">
              New message from your portfolio
            </h2>
          </div>

          <div style="padding:32px;">

            <p>
              <strong>Name:</strong>
              ${escapeHtml(name)}
            </p>

            <p>
              <strong>Email:</strong>
              ${escapeHtml(email)}
            </p>

            <p>
              <strong>Subject:</strong>
              ${escapeHtml(subject)}
            </p>

            <div style="
              margin-top:24px;
              padding:20px;
              background:#161B22;
              border-radius:8px;
              border-left:3px solid #00F5A0;
            ">
              ${escapeHtml(message).replace(/\n/g, '<br>')}
            </div>

          </div>

        </div>
      `
    });

    // -----------------------------
    // AUTO REPLY TO USER
    // -----------------------------

    await transporter.sendMail({
      from: `"Nobin" <${SMTP_USER}>`,
      to: email,
      subject: `Got your message, ${name}! — Nobin`,

      html: `
        <div style="
          font-family:Arial,sans-serif;
          max-width:600px;
          margin:auto;
          background:#0D1117;
          color:#E6EDF3;
          border-radius:12px;
          overflow:hidden;
        ">

          <div style="
            background:#00F5A0;
            padding:24px 32px;
          ">
            <h2 style="
              margin:0;
              color:#080C10;
            ">
              Thanks for reaching out!
            </h2>
          </div>

          <div style="padding:32px;">

            <p>
              Hey ${escapeHtml(name)}! 👋
            </p>

            <p style="color:#8B949E;">
              I've received your message and will get back
              to you within 24 hours.
            </p>

            <div style="
              padding:20px;
              background:#161B22;
              border-radius:8px;
              margin-top:20px;
            ">
              ${escapeHtml(message).replace(/\n/g, '<br>')}
            </div>

            <p style="
              color:#8B949E;
              margin-top:24px;
            ">
              Talk soon,<br>
              <strong style="color:#E6EDF3;">
                Nobin
              </strong>
            </p>

          </div>

        </div>
      `
    });

    // -----------------------------
    // SUCCESS
    // -----------------------------

    return res.status(200).json({
      ok: true,
      saved: true,
      emailSent: true
    });

  } catch (error) {

    console.error('CONTACT API ERROR:', error);

    return res.status(500).json({
      error: 'Failed to process message.'
    });
  }
};


// ----------------------------------
// HTML ESCAPE
// ----------------------------------

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
