import type { Metadata } from 'next';
import type { BlogPost, Event } from '../types';
import { SITE_URL } from './site';

export const organization = { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'Lawer and Lawers Foundation', url: SITE_URL, logo: `${SITE_URL}/images/lawersfoundation.png` };
export function pageMetadata(title: string, description: string, path: string, image?: string): Metadata {
  const url = new URL(path, SITE_URL).href;
  const images = image ? [new URL(image, SITE_URL).href] : undefined;
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: 'website', siteName: organization.name, images }, twitter: { card: images ? 'summary_large_image' : 'summary', title, description, images } };
}
export function serializeJsonLd(data: unknown) { return JSON.stringify(data).replace(/</g, '\\u003c'); }
export function storySchema(story: BlogPost) {
  const url = `${SITE_URL}/stories/${encodeURIComponent(story.slug)}`;
  return { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: story.title, description: story.excerpt, url, mainEntityOfPage: url,
    ...(story.featuredImage ? { image: new URL(story.featuredImage, SITE_URL).href } : {}),
    ...(Number.isFinite(Date.parse(story.publishedAt)) ? { datePublished: new Date(story.publishedAt).toISOString() } : {}),
    ...(Number.isFinite(Date.parse(story.updatedAt)) ? { dateModified: new Date(story.updatedAt).toISOString() } : {}),
    author: { '@type': 'Person', name: story.author.name }, publisher: organization };
}
export function eventSchema(event: Event) {
  // Do not guess an online meeting URL or advertise incomplete event details.
  if (!event.date || (event.isOnline ? !event.meetingLink?.startsWith('https://') : !event.location.name)) return null;
  const date = /^\d{2}:\d{2}$/.test(event.time) ? `${event.date}T${event.time}:00+00:00` : event.date;
  return { '@context': 'https://schema.org', '@type': 'Event', name: event.title, description: event.description,
    url: `${SITE_URL}/events/${encodeURIComponent(event.slug)}`, startDate: date,
    ...(event.endDate ? { endDate: event.endDate } : {}),
    ...(event.image ? { image: new URL(event.image, SITE_URL).href } : {}),
    eventAttendanceMode: `https://schema.org/${event.isOnline ? 'Online' : 'Offline'}EventAttendanceMode`,
    location: event.isOnline ? { '@type': 'VirtualLocation', url: event.meetingLink } : { '@type': 'Place', name: event.location.name, address: { '@type': 'PostalAddress', streetAddress: event.location.address, addressLocality: event.location.city, addressCountry: 'GH' } }, organizer: organization };
}
