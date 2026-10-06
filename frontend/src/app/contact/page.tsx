import { Suspense } from 'react';
import PageContent from './PageContent';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata("Contact Our Foundation", "Contact Lawer and Lawers Foundation about programs, volunteering, partnerships and supporting families in Ghana.", "/contact");
export default async function Page() {  return <Suspense fallback={<p>Loading contact form...</p>}><PageContent /></Suspense>; }
