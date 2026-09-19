'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, errorMessage } from '@/lib/api';
import type { BlogPost } from '@/types';
import { Container, Section, Heading, Text, LazyImage } from '@/components/ui';
import { RichTextContent } from '@/components/ui/RichTextContent';

export default function StoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [story, setStory] = useState<BlogPost | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { let active = true; api.getStory(slug).then(data => { if (active) setStory(data); }).catch(e => { if (active) setError(errorMessage(e)); }); return () => { active = false; }; }, [slug]);
  if (!story) return <Section><Container><Text>{error || 'Loading story...'}</Text><Link href="/stories" className="underline">Back to stories</Link></Container></Section>;
  return <><Section background="primary"><Container><Heading level={1} className="text-white">{story.title}</Heading><Text color="light" className="mt-4">{story.author.name} · {new Date(story.publishedAt).toLocaleDateString('en-GH')} · {story.readTime} min read</Text></Container></Section>
    <Section><Container><article className="max-w-3xl mx-auto">{story.featuredImage && <LazyImage src={story.featuredImage} alt={story.title} aspectRatio="video" className="rounded-xl mb-8" />}<Text size="lg" className="mb-6">{story.excerpt}</Text><RichTextContent content={story.content} /><Link href="/stories" className="inline-block mt-8 text-[#2C5F2D] underline">Back to stories</Link></article></Container></Section></>;
}
