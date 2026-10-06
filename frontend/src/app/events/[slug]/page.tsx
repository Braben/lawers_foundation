import EventContent from './EventContent';
import { JsonLd } from '@/components/JsonLd';
import { pageMetadata, eventSchema } from '@/lib/seo';
import { getPublicData } from '@/lib/public-data';
import type { Event } from '@/types';
type Props = { params: Promise<{ slug: string }> };
async function load({ params }: Props) { return getPublicData<Event>(`events/${encodeURIComponent((await params).slug)}`); }
export async function generateMetadata(props: Props) { const event = await load(props); return pageMetadata(event.title, event.description.slice(0,160), `/events/${encodeURIComponent(event.slug)}`, event.image); }
export default async function Page(props: Props) { const event = await load(props); return <><JsonLd data={eventSchema(event)} /><EventContent event={event} /></>; }
