import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { uploadCloudinary } from '../src/services/cloudinary';

test('Cloudinary signs server-side uploads and deletes the same asset on rollback', async () => {
  process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
  process.env.CLOUDINARY_API_KEY = 'test-key';
  process.env.CLOUDINARY_API_SECRET = 'test-secret';
  let id = '';
  const actions: string[] = [];
  const transport = mock.method(globalThis, 'fetch', async (url: string, options: RequestInit) => {
    const form = options.body as FormData;
    const values: Record<string, string> = {};
    form.forEach((v, k) => { if (!['api_key', 'signature', 'file'].includes(k)) values[k] = String(v); });
    const expected = createHash('sha256').update(Object.keys(values).sort().map(k => `${k}=${values[k]}`).join('&') + 'test-secret').digest('hex');
    assert.equal(form.get('signature'), expected);
    assert.equal(form.get('api_key'), 'test-key');
    assert.equal(form.get('api_secret'), null);
    assert.ok(url.startsWith('https://api.cloudinary.com/v1_1/test-cloud/image/'));
    if (url.endsWith('/upload')) {
      actions.push('upload');
      id = String(form.get('public_id'));
      assert.match(id, /^lawers-foundation\/gallery\/[a-f0-9-]+$/);
      assert.equal(form.get('overwrite'), 'false');
      assert.equal(form.get('file'), 'data:image/png;base64,aW1hZ2U=');
      return Response.json({ secure_url: 'https://res.cloudinary.com/test-cloud/image/upload/test.png', public_id: id });
    }
    actions.push('destroy');
    assert.equal(form.get('public_id'), id);
    assert.equal(form.get('invalidate'), 'true');
    return Response.json({ result: 'ok' });
  });
  try {
    const saved = await uploadCloudinary(Buffer.from('image'), 'image/png');
    assert.equal(saved.storageProvider, 'cloudinary');
    assert.equal(saved.storagePublicId, id);
    await saved.cleanup();
    assert.deepEqual(actions, ['upload', 'destroy']);
  } finally { transport.mock.restore(); }
});

test('Cloudinary provider errors are sanitized and incomplete uploads are cleaned up', async () => {
  const actions: string[] = [];
  const transport = mock.method(globalThis, 'fetch', async (url: string) => {
    actions.push(url.endsWith('/upload') ? 'upload' : 'destroy');
    return url.endsWith('/upload') ? Response.json({ error: { message: 'private-provider-detail' } }, { status: 401 }) : Response.json({ result: 'not found' });
  });
  try {
    await assert.rejects(uploadCloudinary(Buffer.from('image'), 'image/png'), error => {
      assert.equal((error as any).status, 503);
      assert.ok(!(error as Error).message.includes('private-provider-detail'));
      return true;
    });
    assert.deepEqual(actions, ['upload', 'destroy']);
  } finally { transport.mock.restore(); }
});

test('missing Cloudinary configuration fails before sending images anywhere', async () => {
  delete process.env.CLOUDINARY_API_SECRET;
  const transport = mock.method(globalThis, 'fetch', async () => { throw new Error('Must not call provider'); });
  try {
    await assert.rejects(uploadCloudinary(Buffer.from('image'), 'image/png'), { status: 503 });
    assert.equal(transport.mock.callCount(), 0);
  } finally { transport.mock.restore(); }
});
