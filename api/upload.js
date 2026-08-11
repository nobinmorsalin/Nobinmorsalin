import { put } from '@vercel/blob';
import formidable from 'formidable';
import fs from 'node:fs/promises';
import path from 'node:path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_PURPOSES = new Set(['project', 'client', 'profile']);

function json(res, status, body) {
  res.status(status).json(body);
}

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

function safeBaseName(filename = 'image') {
  const extension = path.extname(filename).toLowerCase();
  const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
  return allowedExtensions.has(extension) ? extension : '.bin';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'Method not allowed.' });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return json(res, 500, { ok: false, error: 'Image storage is not configured.' });
  }

  const form = formidable({
    multiples: false,
    maxFiles: 1,
    maxFileSize: MAX_FILE_SIZE,
    keepExtensions: true,
  });

  let uploadedPath;

  try {
    const [fields, files] = await form.parse(req);
    const purpose = first(fields.purpose);
    const file = first(files.file);

    if (!ALLOWED_PURPOSES.has(purpose)) {
      return json(res, 400, { ok: false, error: 'Invalid upload purpose.' });
    }

    if (!file || !file.filepath) {
      return json(res, 400, { ok: false, error: 'An image file is required.' });
    }

    uploadedPath = file.filepath;

    if (!ALLOWED_TYPES.has(file.mimetype)) {
      return json(res, 400, { ok: false, error: 'Unsupported image type.' });
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return json(res, 400, { ok: false, error: 'Image must be between 1 byte and 8 MB.' });
    }

    const extension = safeBaseName(file.originalFilename || 'image');
    const pathname = `portfolio/${purpose}/${crypto.randomUUID()}${extension}`;
    const fileStream = (await import('node:fs')).createReadStream(file.filepath);

    const blob = await put(pathname, fileStream, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.mimetype,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return json(res, 200, {
      ok: true,
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.mimetype,
      size: file.size,
    });
  } catch (error) {
    console.error('Portfolio image upload error:', error);

    if (error?.code === 1009 || /maxFileSize/i.test(String(error?.message || ''))) {
      return json(res, 413, { ok: false, error: 'Image is too large. Maximum size is 8 MB.' });
    }

    return json(res, 500, { ok: false, error: 'Image upload failed.' });
  } finally {
    if (uploadedPath) {
      try {
        await fs.unlink(uploadedPath);
      } catch {
        // Temporary upload cleanup is best-effort.
      }
    }
  }
}
