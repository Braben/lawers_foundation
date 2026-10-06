import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/site';
import { API_BASE } from '../lib/api-base';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ['', '/about', '/what-we-do', '/programs', '/stories', '/events', '/gallery', '/get-involved', '/contact'];
  const entries: MetadataRoute.Sitemap = pages.map(path => ({ url: `${SITE_URL}${path || '/'}` }));
  const collections = await Promise.all(['stories', 'events'].map(async collection => {
    const response = await fetch(`${API_BASE}/api/${collection}`, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`Sitemap: ${collection} unavailable`);
    const result = await response.json();
    if (!result.success || !Array.isArray(result.data)) throw new Error(`Sitemap: invalid ${collection} response`);
    return result.data.flatMap((item: { slug?: string; updatedAt?: string }): MetadataRoute.Sitemap => {
      if (!item.slug) return [];
      const modified = item.updatedAt ? new Date(item.updatedAt) : undefined;
      return [{ url: `${SITE_URL}/${collection}/${encodeURIComponent(item.slug)}`, ...(modified && Number.isFinite(modified.getTime()) ? { lastModified: modified } : {}) }];
    });
  }));
  return [...new Map([...entries, ...collections.flat()].map(entry => [entry.url, entry])).values()];
}
