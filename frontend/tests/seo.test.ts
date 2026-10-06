import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pageMetadata, serializeJsonLd, storySchema, eventSchema } from '../src/lib/seo';
import { SITE_URL } from '../src/lib/site';
import type { BlogPost, Event } from '../src/types';

test('page metadata uses distinct canonical URLs and absolute social images', () => {
  const metadata = pageMetadata('Our programs', 'Program information', '/programs', '/images/lawersfoundation.png');
  assert.equal(metadata.alternates?.canonical, `${SITE_URL}/programs`);
  assert.equal(metadata.openGraph?.url, `${SITE_URL}/programs`);
  assert.deepEqual(metadata.openGraph?.images, [`${SITE_URL}/images/lawersfoundation.png`]);
});
test('structured data escapes script injection and omits invalid article dates', () => {
  const story = { slug: 'test', title: '</script><script>alert(1)</script>', excerpt: 'Summary', author: { name: 'Writer' }, featuredImage: '', publishedAt: 'bad', updatedAt: 'bad' } as BlogPost;
  const data = storySchema(story);
  assert.equal('datePublished' in data, false);
  const json = serializeJsonLd(data);
  assert.equal(json.includes('</script>'), false);
  assert.equal(JSON.parse(json).headline, story.title);
});
test('event markup uses Ghana time and omits incomplete locations', () => {
  const event = { slug: 'workshop', title: 'Workshop', date: '2026-11-01', time: '09:00', location: { name: 'Community hall', address: '', city: 'Lower Manya Krobo' } } as Event;
  assert.equal(eventSchema(event)?.startDate, '2026-11-01T09:00:00+00:00');
  assert.equal(eventSchema({ ...event, isOnline: true, meetingLink: undefined }), null);
});
