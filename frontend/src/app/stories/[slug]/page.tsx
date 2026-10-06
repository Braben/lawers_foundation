import Link from 'next/link';
import { Container, Section, Heading, Text, LazyImage } from '@/components/ui';
import { ServerRichText } from '@/components/ui/ServerRichText';
import { JsonLd } from '@/components/JsonLd';
import { pageMetadata, storySchema } from '@/lib/seo';
import { getPublicData } from '@/lib/public-data';
import type { BlogPost } from '@/types';
type Props = { params: Promise<{ slug: string }> };
async function load({ params }: Props) { return getPublicData<BlogPost>(`stories/${encodeURIComponent((await params).slug)}`); }
export async function generateMetadata(props: Props) { const story = await load(props); return pageMetadata(story.title, story.excerpt, `/stories/${encodeURIComponent(story.slug)}`, story.featuredImage); }
export default async function StoryDetail(props: Props) {
  const story = await load(props);
  return <><JsonLd data={storySchema(story)} /><Section background="primary"><Container><Heading level={1} className="text-white">{story.title}</Heading><Text color="light" className="mt-4">{story.author.name} · {new Date(story.publishedAt).toLocaleDateString('en-GH')} · {story.readTime} min read</Text></Container></Section>
    <Section><Container><article className="max-w-3xl mx-auto">{story.featuredImage && <LazyImage src={story.featuredImage} alt={story.title} aspectRatio="video" className="rounded-xl mb-8" />}<Text size="lg" className="mb-6">{story.excerpt}</Text><ServerRichText content={story.content} /><Link href="/stories" className="inline-block mt-8 text-[#2C5F2D] underline">Back to stories</Link></article></Container></Section></>;
}
