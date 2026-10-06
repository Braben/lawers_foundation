import PageContent from './PageContent';
import { pageMetadata } from '@/lib/seo';
import { getPublicData } from '@/lib/public-data';
import type { Event } from '@/types';
export const metadata = pageMetadata("Community Events and Workshops", "Find foundation workshops, health outreach and community events in Lower Manya Krobo, Ghana.", "/events");
export default async function Page() { const items = await getPublicData<Event[]>('events'); return <PageContent initialItems={items} />; }
