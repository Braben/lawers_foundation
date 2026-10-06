import { test } from 'node:test';
import assert from 'node:assert/strict';
import sitemap from '../src/app/sitemap';
import robots from '../src/app/robots';

test('sitemap includes current content, encodes slugs and excludes private routes', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ success: true, data: [{ slug: 'a & b', updatedAt: '2026-10-01T00:00:00Z' }, { slug: 'a & b' }, {}] });
  try {
    const entries = await sitemap();
    assert.equal(entries.length, 11);
    assert.ok(entries.some(entry => entry.url.endsWith('/stories/a%20%26%20b')));
    assert.ok(entries.some(entry => entry.url.endsWith('/events/a%20%26%20b')));
    assert.ok(entries.every(entry => !entry.url.includes('/admin') && !entry.url.includes('/api/')));
    assert.ok(String(robots().sitemap).endsWith('/sitemap.xml'));
    globalThis.fetch = async () => new Response('', { status: 503 });
    await assert.rejects(sitemap(), /unavailable/);
  } finally { globalThis.fetch = original; }
});
