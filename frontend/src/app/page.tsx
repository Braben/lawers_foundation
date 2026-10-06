import PageContent, { type HomeData } from './PageContent';
import { getPublicData } from '@/lib/public-data';
import { pageMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { organization } from '@/lib/seo';
export const metadata = pageMetadata("Supporting Orphans, Widows and Caregivers in Ghana", "Education, livelihood training and community support for orphans, widows and caregivers in Lower Manya Krobo, Ghana.", "/");
export default async function Page() { const data = await getPublicData<HomeData>('content/home'); return <><JsonLd data={{ '@context': 'https://schema.org', ...organization }} /><PageContent data={data} /></>; }
