/* ═══════════════════════════════════════════════
   /api/contact — Contact form handler
   Vercel Serverless Function (Node.js)

   Required Vercel Environment Variables:
   SMTP_HOST     = smtp.gmail.com
   SMTP_PORT     = 587
   SMTP_USER     = your@gmail.com
   SMTP_PASS     = your-gmail-app-password
   CONTACT_TO    = your@gmail.com
   ═══════════════════════════════════════════════ */

const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  /* CORS */
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, subject, message } = req.body || {};

  /* Validate */
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  /* SMTP config from env */
  const {
    SMTP_HOST  = 'smtp.gmail.com',
    SMTP_PORT  = '587',
    SMTP_USER,
    SMTP_PASS,
    CONTACT_TO,
  } = process.env;

  if (!SMTP_USER || !SMTP_PASS || !CONTACT_TO) {
    console.error('SMTP env vars not configured');
    /* Still return 200 so form doesn't break on non-configured deploys */
    return res.status(200).json({ ok: true, note: 'SMTP not configured — message logged only.' });
  }

  const transporter = nodemailer.createTransport({
    host:   SMTP_HOST,
    port:   parseInt(SMTP_PORT),
    secure: parseInt(SMTP_PORT) === 465,
    auth:   { user: SMTP_USER, pass: SMTP_PASS },
  });

  /* Email to owner */
  await transporter.sendMail({
    from:    `"Portfolio Contact" <${SMTP_USER}>`,
    to:      CONTACT_TO,
    subject: `[Portfolio] ${subject}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0D1117;color:#E6EDF3;border-radius:12px;overflow:hidden">
        <div style="background:#00F5A0;padding:24px 32px">
          <h2 style="margin:0;color:#080C10;font-size:1.25rem">New message from your portfolio</h2>
        </div>
        <div style="padding:32px">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#8B949E;width:100px">From</td><td style="padding:8px 0;font-weight:600">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#8B949E">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#00F5A0">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#8B949E">Subject</td><td style="padding:8px 0">${subject}</td></tr>
          </table>
          <div style="margin-top:24px;padding:20px;background:#161B22;border-radius:8px;border-left:3px solid #00F5A0">
            <p style="margin:0;line-height:1.7;color:#E6EDF3">${message.replace(/\n/g, '<br>')}</p>
          </div>
          <div style="margin-top:20px">
            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}"
               style="display:inline-block;background:#00F5A0;color:#080C10;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
              Reply to ${name} →
            </a>
          </div>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #21262D;font-size:.75rem;color:#484F58">
          Sent from your portfolio contact form • ${new Date().toLocaleString()}
        </div>
      </div>
    `,
  });

  /* Auto-reply to sender */
  await transporter.sendMail({
    from:    `"Nobin" <${SMTP_USER}>`,
    to:      email,
    subject: `Got your message, ${name}! — Nobin`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0D1117;color:#E6EDF3;border-radius:12px;overflow:hidden">
        <div style="background:#00F5A0;padding:24px 32px">
          <h2 style="margin:0;color:#080C10">Thanks for reaching out!</h2>
        </div>
        <div style="padding:32px">
          <p style="margin-bottom:16px">Hey ${name}! 👋</p>
          <p style="margin-bottom:16px;color:#8B949E">I've received your message and will get back to you within 24 hours.</p>
          <div style="padding:20px;background:#161B22;border-radius:8px;border-left:3px solid #21262D;margin-bottom:24px">
            <p style="margin:0;font-size:.875rem;color:#8B949E"><strong style="color:#E6EDF3">Your message:</strong><br>${message.replace(/\n/g,'<br>')}</p>
          </div>
          <p style="color:#8B949E">Talk soon,<br><strong style="color:#E6EDF3">Nobin</strong></p>
        </div>
      </div>
    `,
  });

  return res.status(200).json({ ok: true });
};
