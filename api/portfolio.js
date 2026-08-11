import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const DEFAULTS = {
  settings: {
    name: 'Nobin Morsalin',
    email: 'nobinmorsalin7@gmail.com',
    github: 'https://github.com/nobin',
    linkedin: '',
    profileImage: '',
  },
  about: {
    title: "Hello, I'm Nobin",
    bio1: "I'm a passionate web developer and digital craftsman from Bangladesh. I specialize in building complete digital solutions — from pixel-perfect UI/UX to robust backend systems.",
    bio2: "My expertise spans the full stack: beautiful frontends, powerful APIs, webhook integrations, and server-to-server connections. I don't just build websites — I build systems that work.",
  },
  services: [],
  clients: [],
  projects: [],
  skills: [],
  workflow: [],
};

function normalize(value) {
  return value && typeof value === 'object' ? value : {};
}

function mergeDefaults(data) {
  const source = normalize(data);
  return {
    ...DEFAULTS,
    ...source,
    settings: { ...DEFAULTS.settings, ...normalize(source.settings) },
    about: { ...DEFAULTS.about, ...normalize(source.about) },
    services: Array.isArray(source.services) ? source.services : DEFAULTS.services,
    clients: Array.isArray(source.clients) ? source.clients : DEFAULTS.clients,
    projects: Array.isArray(source.projects) ? source.projects : DEFAULTS.projects,
    skills: Array.isArray(source.skills) ? source.skills : DEFAULTS.skills,
    workflow: Array.isArray(source.workflow) ? source.workflow : DEFAULTS.workflow,
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT id, data, version, updated_at
        FROM portfolio_content
        WHERE id = 1
        LIMIT 1
      `;

      if (!rows.length) {
        return res.status(404).json({
          ok: false,
          data: DEFAULTS,
          version: 0,
          source: 'defaults',
        });
      }

      return res.status(200).json({
        ok: true,
        data: mergeDefaults(rows[0].data),
        version: rows[0].version,
        updated_at: rows[0].updated_at,
        source: 'database',
      });
    }

    if (req.method === 'PUT') {
      const body = req.body && typeof req.body === 'object' ? req.body : {};
      const incoming = normalize(body.data || body);
      const data = mergeDefaults(incoming);
      const version = Number(body.version || 0);

      const rows = await sql`
        INSERT INTO portfolio_content (id, data, version, updated_at)
        VALUES (1, ${JSON.stringify(data)}::jsonb, GREATEST(${version}, 1), NOW())
        ON CONFLICT (id) DO UPDATE
        SET data = EXCLUDED.data,
            version = GREATEST(portfolio_content.version + 1, EXCLUDED.version),
            updated_at = NOW()
        RETURNING id, data, version, updated_at
      `;

      return res.status(200).json({
        ok: true,
        data: rows[0].data,
        version: rows[0].version,
        updated_at: rows[0].updated_at,
        source: 'database',
      });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Portfolio API error:', error);
    return res.status(500).json({ ok: false, error: 'Portfolio API failed' });
  }
}
