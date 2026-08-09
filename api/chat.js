/* ═══════════════════════════════════════════════
   /api/chat — Live chat auto-reply endpoint
   ═══════════════════════════════════════════════ */

const AUTO_REPLIES = [
  { match: /price|cost|rate|charge|budget/i,     reply: "My rates depend on the project scope. Send me the details via the contact form and I'll give you a custom quote! 💰" },
  { match: /time|long|deadline|fast|quick/i,     reply: "Delivery time varies by project. Simple sites: 3-5 days. Complex apps: 1-3 weeks. Let's discuss your timeline! ⏱️" },
  { match: /api|webhook|integration|connect/i,   reply: "API integrations are my specialty! REST, webhooks, server-to-server — I handle it all. Tell me more about what you need to connect. 🔗" },
  { match: /design|figma|ui|ux|mockup/i,         reply: "Yes! I do UI/UX design in Figma before writing a single line of code. Pixel-perfect and user-focused. 🎨" },
  { match: /react|vue|next|node|stack/i,         reply: "I work with React, Node.js, Vanilla JS, and more. What's your tech preference for the project? ⚡" },
  { match: /hello|hi|hey|salaam|hola/i,          reply: "Hey there! 👋 Great to hear from you. What kind of project are you working on?" },
  { match: /email|smtp|mail/i,                    reply: "SMTP email setup, transactional emails, templates — all handled! I can set up reliable email delivery for your app. 📧" },
  { match: /available|free|hire|work/i,           reply: "I'm currently available for new projects! Use the contact form to tell me more about your project and I'll reply ASAP. 🚀" },
  { match: /thanks|thank you|great|good/i,        reply: "You're welcome! Feel free to reach out via the contact form for anything else. 😊" },
];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'Message required' });

  const matched = AUTO_REPLIES.find(r => r.match.test(message));
  const reply   = matched
    ? matched.reply
    : "Thanks for your message! I'll read it and get back to you soon. For faster response, use the contact form below. 📬";

  /* Small delay to feel natural */
  await new Promise(r => setTimeout(r, 800));

  return res.status(200).json({ reply });
};
