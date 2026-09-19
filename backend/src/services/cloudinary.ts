import { createHash, randomUUID } from 'crypto';
import { HttpError } from '../middleware/errors';

export async function uploadCloudinary(buffer: Buffer, mime: string) {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !/^[a-zA-Z0-9_-]+$/.test(cloud) || !key || !secret) {
    throw new HttpError(503, 'Picture uploads need Cloudinary configuration. Ask the administrator to configure the backend.');
  }
  const publicId = `lawers-foundation/gallery/${randomUUID()}`;
  async function send(action: string, fields: Record<string, string>) {
    const values = { ...fields, timestamp: String(Math.floor(Date.now() / 1000)) };
    const signature = createHash('sha256').update(Object.entries(values).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('&') + secret).digest('hex');
    const body = new FormData();
    for (const [k, v] of Object.entries(values)) body.append(k, v);
    body.append('api_key', key!);
    body.append('signature', signature);
    if (action === 'upload') body.append('file', `data:${mime};base64,${buffer.toString('base64')}`);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/${action}`, { method: 'POST', body, signal: AbortSignal.timeout(60000), redirect: 'error' });
    if (!response.ok) throw new HttpError(503, 'Picture storage is unavailable. Check the Cloudinary credentials and free-plan usage.');
    return await response.json() as { secure_url?: string; public_id?: string; result?: string };
  }
  const cleanup = async () => {
    const result = await send('destroy', { public_id: publicId, invalidate: 'true' });
    if (result.result !== 'ok' && result.result !== 'not found') throw new Error('Cloudinary cleanup failed');
  };
  try {
    const result = await send('upload', { public_id: publicId, overwrite: 'false' });
    if (!result.secure_url?.startsWith('https://') || result.public_id !== publicId) throw new HttpError(502, 'Picture storage returned an invalid upload response.');
    return { url: result.secure_url, storageProvider: 'cloudinary', storagePublicId: publicId, cleanup };
  } catch (error) {
    // The provider may have saved a file even if its response was interrupted.
    try { await cleanup(); } catch { console.error('[upload] Cloudinary cleanup could not be confirmed for', publicId); }
    throw error;
  }
}
