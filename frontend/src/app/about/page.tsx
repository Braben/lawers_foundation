import PageContent from './PageContent';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata("About Our Foundation", "Learn about Lawer and Lawers Foundation and our work supporting vulnerable families in Lower Manya Krobo, Ghana.", "/about");
export default async function Page() {  return <PageContent />; }
