import PageContent from './PageContent';
import { pageMetadata } from '@/lib/seo';
import { getPublicData } from '@/lib/public-data';
import type { BlogPost } from '@/types';
export const metadata = pageMetadata("Impact Stories and Foundation News", "Read stories and updates about scholarships, caregiver training and community outreach in Lower Manya Krobo, Ghana.", "/stories");
export default async function Page() { const items = await getPublicData<BlogPost[]>('stories'); return <PageContent initialItems={items} />; }
