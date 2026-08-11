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

function json(res, status, body) {
  res.status(status).json(body);
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT id, data, version, updated_at
        FROM portfolio_content
        WHERE id = 1
        LIMIT 1
      `;

      if (!rows.length) {
        return json(res, 404, { ok: false, error: 'Portfolio content has not been initialized.' });
      }

      return json(res, 200, {
        ok: true,
        data: rows[0].data,
        version: Number(rows[0].version),
        updated_at: rows[0].updated_at,
      });
    } catch (error) {
      console.error('Portfolio GET error:', error);
      return json(res, 500, { ok: false, error: 'Failed to load portfolio content.' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const body = req.body || {};
      const { section, data, version } = body;

      if (!ALLOWED_SECTIONS.has(section)) {
        return json(res, 400, { ok: false, error: 'Invalid portfolio section.' });
      }

      if (typeof version !== 'number' || !Number.isSafeInteger(version) || version < 1) {
        return json(res, 400, { ok: false, error: 'A valid portfolio version is required.' });
      }

      const rows = await sql`
        UPDATE portfolio_content
        SET
          data = jsonb_set(data, ARRAY[${section}], ${JSON.stringify(data)}::jsonb, true),
          version = version + 1,
          updated_at = NOW()
        WHERE id = 1
          AND version = ${version}
        RETURNING id, data, version, updated_at
      `;

      if (!rows.length) {
        const current = await sql`
          SELECT version
          FROM portfolio_content
          WHERE id = 1
          LIMIT 1
        `;

        if (!current.length) {
          return json(res, 404, { ok: false, error: 'Portfolio content has not been initialized.' });
        }

        return json(res, 409, {
          ok: false,
          error: 'Portfolio content changed since it was loaded. Reload before saving.',
          version: Number(current[0].version),
        });
      }

      return json(res, 200, {
        ok: true,
        data: rows[0].data,
        version: Number(rows[0].version),
        updated_at: rows[0].updated_at,
      });
    } catch (error) {
      console.error('Portfolio PUT error:', error);
      return json(res, 500, { ok: false, error: 'Failed to save portfolio content.' });
    }
  }

  res.setHeader('Allow', 'GET, PUT');
  return json(res, 405, { ok: false, error: 'Method not allowed.' });
}
