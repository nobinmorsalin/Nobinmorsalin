import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const ALLOWED_SECTIONS = new Set([
  'settings',
  'about',
  'services',
  'clients',
  'projects',
  'skills',
  'workflow',
]);

const SITE = 'https://nobinmorsalin.vercel.app';

function json(res, status, body) { res.status(status).json(body); }
function xmlEscape(value) { return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;'); }
function slugify(value) { return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item'; }

async function getPortfolio() {
  const rows = await sql`SELECT data, updated_at FROM portfolio_content WHERE id = 1 LIMIT 1`;
  return rows.length ? rows[0] : null;
}

function buildSitemap(data, updatedAt) {
  const urls = [
    { loc: `${SITE}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${SITE}/#about`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${SITE}/#services`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${SITE}/#projects`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${SITE}/#clients`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${SITE}/#contact`, priority: '0.8', changefreq: 'monthly' },
  ];
  for (const item of Array.isArray(data?.services) ? data.services : []) { const name = item.name || item.title; if (name) urls.push({ loc: `${SITE}/services/${slugify(name)}`, priority: '0.8', changefreq: 'weekly' }); }
  for (const item of Array.isArray(data?.projects) ? data.projects : []) { const name = item.title || item.name; if (name) urls.push({ loc: `${SITE}/projects/${slugify(name)}`, priority: '0.9', changefreq: 'weekly' }); }
  for (const item of Array.isArray(data?.clients) ? data.clients : []) { if (item.visible === false) continue; const name = item.name || item.title; if (name) urls.push({ loc: `${SITE}/clients/${slugify(name)}`, priority: '0.7', changefreq: 'monthly' }); }
  const lastmod = updatedAt ? new Date(updatedAt).toISOString() : new Date().toISOString();
  const body = urls.map(item => `  <url><loc>${xmlEscape(item.loc)}</loc><lastmod>${lastmod}</lastmod><changefreq>${item.changefreq}</changefreq><priority>${item.priority}</priority></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

export default async function handler(req, res) {
  const format = req.query?.format;
  if (format === 'robots') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`);
  }
  if (format === 'sitemap') {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    try { const current = await getPortfolio(); return res.status(200).send(buildSitemap(current?.data || {}, current?.updated_at || new Date())); }
    catch (error) { console.error('Sitemap error:', error); return res.status(500).send(buildSitemap({}, new Date())); }
  }

  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache'); res.setHeader('Expires', '0');
    try {
      const rows = await sql`SELECT id, data, version, updated_at FROM portfolio_content WHERE id = 1 LIMIT 1`;
      if (!rows.length) return json(res, 404, { ok: false, error: 'Portfolio content has not been initialized.' });
      return json(res, 200, { ok: true, data: rows[0].data, version: Number(rows[0].version), updated_at: rows[0].updated_at });
    } catch (error) { console.error('Portfolio GET error:', error); return json(res, 500, { ok: false, error: 'Failed to load portfolio content.' }); }
  }

  if (req.method === 'PUT') {
    try {
      const body = req.body || {}; const { section, data, version } = body;
      if (typeof version !== 'number' || !Number.isSafeInteger(version) || version < 0) return json(res, 400, { ok: false, error: 'A valid portfolio version is required.' });
      if (version === 0 && section === null) {
        if (!data || typeof data !== 'object' || Array.isArray(data)) return json(res, 400, { ok: false, error: 'Complete portfolio data is required for initialization.' });
        const rows = await sql`INSERT INTO portfolio_content (id, data, version, updated_at) VALUES (1, ${JSON.stringify(data)}::jsonb, 1, NOW()) ON CONFLICT (id) DO NOTHING RETURNING id, data, version, updated_at`;
        if (rows.length) return json(res, 200, { ok: true, data: rows[0].data, version: Number(rows[0].version), updated_at: rows[0].updated_at, initialized: true });
        const current = await sql`SELECT data, version, updated_at FROM portfolio_content WHERE id = 1 LIMIT 1`;
        if (!current.length) return json(res, 500, { ok: false, error: 'Portfolio initialization could not be completed.' });
        return json(res, 409, { ok: false, error: 'Portfolio content was initialized by another request. Reload before saving.', data: current[0].data, version: Number(current[0].version), updated_at: current[0].updated_at });
      }
      if (!ALLOWED_SECTIONS.has(section)) return json(res, 400, { ok: false, error: 'Invalid portfolio section.' });
      const rows = await sql`UPDATE portfolio_content SET data = jsonb_set(data, ARRAY[${section}], ${JSON.stringify(data)}::jsonb, true), version = version + 1, updated_at = NOW() WHERE id = 1 AND version = ${version} RETURNING id, data, version, updated_at`;
      if (!rows.length) {
        const current = await sql`SELECT version FROM portfolio_content WHERE id = 1 LIMIT 1`;
        if (!current.length) return json(res, 404, { ok: false, error: 'Portfolio content has not been initialized.' });
        return json(res, 409, { ok: false, error: 'Portfolio content changed since it was loaded. Reload before saving.', version: Number(current[0].version) });
      }
      return json(res, 200, { ok: true, data: rows[0].data, version: Number(rows[0].version), updated_at: rows[0].updated_at });
    } catch (error) { console.error('Portfolio PUT error:', error); return json(res, 500, { ok: false, error: 'Failed to save portfolio content.' }); }
  }
  res.setHeader('Allow', 'GET, PUT');
  return json(res, 405, { ok: false, error: 'Method not allowed.' });
}
