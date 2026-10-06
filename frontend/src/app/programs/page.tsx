import PageContent from './PageContent';
import { pageMetadata } from '@/lib/seo';
import { getPublicData } from '@/lib/public-data';
import type { Program } from '@/types';
export const metadata = pageMetadata("Education and Community Support Programs", "Explore programs supporting orphans, women and caregivers through education, vocational training and community support in Ghana.", "/programs");
export default async function Page() { const items = await getPublicData<Program[]>('programs'); return <PageContent initialItems={items} />; }
