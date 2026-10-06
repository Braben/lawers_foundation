import PageContent from './PageContent';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata("Photo and Video Gallery", "See photos and videos from our education, empowerment and community outreach activities in Ghana.", "/gallery");
export default async function Page() {  return <PageContent />; }
