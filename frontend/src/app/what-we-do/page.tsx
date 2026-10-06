import PageContent from './PageContent';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata("What We Do in Ghana", "Explore our education, skills training, family support and community outreach work in Lower Manya Krobo, Ghana.", "/what-we-do");
export default async function Page() {  return <PageContent />; }
