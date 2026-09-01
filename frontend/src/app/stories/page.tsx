'use client';
import { useEffect, useState } from 'react';
import { Container, Section, Heading, Text, Card, Button, FadeIn, Stagger, StaggerItem, ScaleIn, LazyImage } from '@/components/ui';
import Link from 'next/link';
import { api } from '@/lib/api';
import { BlogPost } from '@/types';

const categories = [
  { id: 'all', name: 'All Stories' },
  { id: 'impact-stories', name: 'Impact Stories' },
  { id: 'education', name: 'Education & Skills' },
  { id: 'community', name: 'Community & Health' },
  { id: 'news', name: 'News & Updates' },
  { id: 'research', name: 'Research & Reports' },
];

const FALLBACK: BlogPost[] = [
  { id: '1', slug: 'orphan-scholarship-80-supported', title: '80 Orphans Receiving Scholarships — Hope Restored', excerpt: 'Through the Love of Jesus, 80 children now have books, tutoring and school support.', content: '', featuredImage: '/images/stories/scholarship.jpg', author: { name: 'Lawer and Lawers Team', avatar: ''}, category: 'education', tags: ['orphan','education'], publishedAt: '2024-01-15', updatedAt:'2024-01-15', isFeatured:true, readTime:5},
  { id: '2', slug: 'widows-micro-business-ghs60k', title: '20 Widows Start Businesses — GHS 60,000 Income', excerpt: 'Sewing, baking, hairdressing and digital skills turned into sustainable micro-businesses.', content:'', featuredImage:'/images/stories/women-business.jpg', author:{name:'Lawer and Lawers Team',avatar:''}, category:'community', tags:['widows'], publishedAt:'2024-01-10', updatedAt:'2024-01-10', isFeatured:true, readTime:4},
];

export default function StoriesPage() {
  const [posts, setPosts] = useState<BlogPost[]>(FALLBACK);
  const [filter, setFilter] = useState('all');
  useEffect(()=>{ api.getStories(filter).then(d=>{ if(d?.length) setPosts(d);}).catch(()=>{}); },[filter]);
  const featuredPosts = posts.filter(post => post.isFeatured);
  const regularPosts = posts.filter(post => !post.isFeatured);
  return (
    <>
      <Section background="primary">
        <Container>
          <FadeIn><Heading level={1} className="text-white">Stories & Blog</Heading></FadeIn>
          <FadeIn delay={0.2}><Text size="lg" color="light" className="mt-4 max-w-2xl">Real stories of transformation from Lower Manya Krobo — scholarships, caregiver training, art therapy and community outreach.</Text></FadeIn>
        </Container>
      </Section>
      <Section>
        <Container>
          <FadeIn>
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button key={category.id} onClick={()=>setFilter(category.id)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D] ${filter===category.id ? 'bg-[#2C5F2D] text-white' : 'bg-[#EDF4F2] text-[#4a4a4a] hover:bg-[#d4dfea]'}`}>{category.name}</button>
              ))}
            </div>
          </FadeIn>
        </Container>
      </Section>
      {featuredPosts.length > 0 && (
        <Section background="neutral">
          <Container>
            <FadeIn><Heading level={2} className="mb-8">Featured Stories</Heading></FadeIn>
            <Stagger delay={0.1}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredPosts.map((post) => (
                  <StaggerItem key={post.id}><ScaleIn><Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow h-full"><div className="bg-[#EDF4F2] h-48 flex items-center justify-center"><LazyImage src={post.featuredImage} alt={post.title} aspectRatio="video" className="w-full h-full"/></div><div className="flex flex-col flex-grow p-6"><div className="flex items-center gap-2 text-xs text-[#97BC62] font-medium mb-2"><span>{categories.find(c => c.id === post.category)?.name}</span><span>•</span><span>{post.readTime} min read</span></div><Link href={`/stories/${post.slug}`}><Heading level={3} className="hover:text-[#1e4420] transition-colors">{post.title}</Heading></Link><Text className="mt-3 flex-grow">{post.excerpt}</Text><div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-[#EDF4F2] rounded-full flex items-center justify-center"><Text className="text-xs">{post.author.name.charAt(0)}</Text></div><Text className="text-sm">{post.author.name}</Text></div><Text className="text-sm text-gray-400">{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</Text></div></div></Card></ScaleIn></StaggerItem>
                ))}
              </div>
            </Stagger>
          </Container>
        </Section>
      )}
      <Section>
        <Container>
          <FadeIn><Heading level={2} className="mb-8">Latest Stories</Heading></FadeIn>
          <Stagger delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <StaggerItem key={post.id}><ScaleIn><Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow h-full"><div className="bg-[#EDF4F2] h-48 flex items-center justify-center"><LazyImage src={post.featuredImage} alt={post.title} aspectRatio="video" className="w-full h-full"/></div><div className="flex flex-col flex-grow p-6"><div className="flex items-center gap-2 text-xs text-[#97BC62] font-medium mb-2"><span>{categories.find(c => c.id === post.category)?.name}</span><span>•</span><span>{post.readTime} min read</span></div><Link href={`/stories/${post.slug}`}><Heading level={4} className="hover:text-[#1e4420] transition-colors">{post.title}</Heading></Link><Text className="mt-3 flex-grow text-sm">{post.excerpt}</Text><div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100"><Text className="text-sm text-gray-400">{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</Text><Link href={`/stories/${post.slug}`} className="text-[#2C5F2D] text-sm font-medium hover:underline">Read More →</Link></div></div></Card></ScaleIn></StaggerItem>
              ))}
            </div>
          </Stagger>
        </Container>
      </Section>
      <Section background="secondary">
        <Container><FadeIn><div className="text-center"><Heading level={2} className="text-[#1a1a1a]">Share Your Story</Heading><Text size="lg" className="mt-4 mb-8 max-w-2xl mx-auto text-[#1a1a1a]">Have a story to share? Every story has the power to inspire and create change.</Text><Link href="/contact"><Button variant="primary" size="lg">Submit Your Story</Button></Link></div></FadeIn></Container>
      </Section>
    </>
  );
}
