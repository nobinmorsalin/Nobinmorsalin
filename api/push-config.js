module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) return res.status(503).json({ configured: false });
  return res.status(200).json({ configured: true, publicKey: key });
};
