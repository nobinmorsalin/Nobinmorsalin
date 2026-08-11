import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ ok: false, error: 'Blob storage is not configured' });
  }

  try {
    const form = formidable({
      multiples: false,
      maxFiles: 1,
      maxFileSize: MAX_FILE_SIZE,
    });

    const [, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ ok: false, error: 'No image file provided' });
    }

    if (!ALLOWED_TYPES.has(file.mimetype || '')) {
      return res.status(400).json({ ok: false, error: 'Unsupported image type' });
    }

    const extension = (file.originalFilename || '').split('.').pop()?.toLowerCase() || 'bin';
    const pathname = `portfolio/${randomUUID()}.${extension}`;

    const buffer = await import('node:fs/promises').then((fs) => fs.readFile(file.filepath));
    const blob = await put(pathname, buffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.mimetype || undefined,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return res.status(200).json({
      ok: true,
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return res.status(500).json({ ok: false, error: 'Image upload failed' });
  }
}
