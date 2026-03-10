'use client';

import { Container, Section, Heading, Text, Card, Button, FadeIn, Stagger, StaggerItem, ScaleIn, LazyImage } from '@/components/ui';
import Link from 'next/link';
import { BlogPost } from '@/types';

const categories = [
  { id: 'all', name: 'All Stories' },
  { id: 'impact-stories', name: 'Impact Stories' },
  { id: 'legal-awareness', name: 'Legal Awareness' },
  { id: 'events', name: 'Events' },
  { id: 'news', name: 'News & Updates' },
  { id: 'research', name: 'Research & Reports' },
];

const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'survivor-story-radha',
    title: 'From Victim to Victor: Radha\'s Journey to Justice',
    excerpt: 'After years of domestic abuse, Radha found the courage to seek help. Our legal team supported her through the entire process, helping her secure custody of her children and a restraining order against her abuser.',
    content: '',
    featuredImage: '/images/stories/radha-story.jpg',
    author: { name: 'Priya Sharma', avatar: '/images/authors/priya.jpg' },
    category: 'impact-stories',
    tags: ['domestic violence', 'legal aid', 'survivor'],
    publishedAt: '2024-01-15',
    updatedAt: '2024-01-15',
    isFeatured: true,
    readTime: 8,
  },
  {
    id: '2',
    slug: 'legal-literacy-campaign-success',
    title: 'Breaking Barriers: Our Biggest Legal Literacy Campaign Yet',
    excerpt: 'Over 10,000 women in rural communities learned about their legal rights through our recent awareness campaign. See how we transformed lives through knowledge.',
    content: '',
    featuredImage: '/images/stories/literacy-campaign.jpg',
    author: { name: 'Amit Kumar', avatar: '/images/authors/amit.jpg' },
    category: 'impact-stories',
    tags: ['awareness', 'rural', 'women empowerment'],
    publishedAt: '2024-01-10',
    updatedAt: '2024-01-10',
    isFeatured: true,
    readTime: 5,
  },
  {
    id: '3',
    slug: 'child-protection-success',
    title: 'Rescuing Children from Labor: A Success Story',
    excerpt: 'Our child protection unit successfully rescued 15 children from forced labor and ensured they were rehabilitated and enrolled in schools.',
    content: '',
    featuredImage: '/images/stories/child-protection.jpg',
    author: { name: 'Sunita Devi', avatar: '/images/authors/sunita.jpg' },
    category: 'impact-stories',
    tags: ['child protection', 'rescue', 'rehabilitation'],
    publishedAt: '2024-01-05',
    updatedAt: '2024-01-05',
    isFeatured: false,
    readTime: 6,
  },
  {
    id: '4',
    slug: 'understanding-domestic-violence-law',
    title: 'Understanding Domestic Violence Law: A Comprehensive Guide',
    excerpt: 'Learn about the protections available under domestic violence laws and how to access them.',
    content: '',
    featuredImage: '/images/blog/legal-guide.jpg',
    author: { name: 'Adv. Meera Patel', avatar: '/images/authors/meera.jpg' },
    category: 'legal-awareness',
    tags: ['domestic violence', 'legal guide', 'rights'],
    publishedAt: '2023-12-28',
    updatedAt: '2023-12-28',
    isFeatured: false,
    readTime: 12,
  },
  {
    id: '5',
    slug: 'womens-rights-india',
    title: 'Women\'s Legal Rights in India',
    excerpt: 'A comprehensive overview of the legal rights available to women in India.',
    content: '',
    featuredImage: '/images/blog/womens-rights.jpg',
    author: { name: 'Adv. Sarah Johnson', avatar: '/images/authors/sarah.jpg' },
    category: 'legal-awareness',
    tags: ['women rights', 'legal', 'india'],
    publishedAt: '2023-12-20',
    updatedAt: '2023-12-20',
    isFeatured: false,
    readTime: 15,
  },
  {
    id: '6',
    slug: 'annual-report-2023',
    title: 'Annual Report 2023: Transforming Lives Together',
    excerpt: 'Our annual report highlights the incredible impact we\'ve made together.',
    content: '',
    featuredImage: '/images/stories/annual-report.jpg',
    author: { name: 'Foundation Team', avatar: '/images/authors/team.jpg' },
    category: 'news',
    tags: ['annual report', 'impact', '2023'],
    publishedAt: '2023-12-15',
    updatedAt: '2023-12-15',
    isFeatured: true,
    readTime: 10,
  },
];

export default function StoriesPage() {
  const featuredPosts = blogPosts.filter(post => post.isFeatured);
  const regularPosts = blogPosts.filter(post => !post.isFeatured);

  return (
    <>
      <Section background="primary">
        <Container>
          <FadeIn>
            <Heading level={1} className="text-white">Stories & Blog</Heading>
          </FadeIn>
          <FadeIn delay={0.2}>
            <Text size="lg" color="light" className="mt-4 max-w-2xl">
              Real stories of transformation, legal insights, and updates from our work 
              in empowering women and children.
            </Text>
          </FadeIn>
        </Container>
      </Section>

      <Section>
        <Container>
          <FadeIn>
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D] ${
                    category.id === 'all'
                      ? 'bg-[#2C5F2D] text-white'
                      : 'bg-[#EDF4F2] text-[#4a4a4a] hover:bg-[#d4dfea]'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </FadeIn>
        </Container>
      </Section>

      {featuredPosts.length > 0 && (
        <Section background="neutral">
          <Container>
            <FadeIn>
              <Heading level={2} className="mb-8">Featured Stories</Heading>
            </FadeIn>
            <Stagger delay={0.1}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredPosts.map((post) => (
                  <StaggerItem key={post.id}>
                    <ScaleIn>
                      <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow h-full">
                        <div className="bg-[#EDF4F2] h-48 flex items-center justify-center">
                          <LazyImage
                            src={post.featuredImage}
                            alt={post.title}
                            aspectRatio="video"
                            className="w-full h-full"
                          />
                        </div>
                        <div className="flex flex-col flex-grow p-6">
                          <div className="flex items-center gap-2 text-xs text-[#97BC62] font-medium mb-2">
                            <span>{categories.find(c => c.id === post.category)?.name}</span>
                            <span>•</span>
                            <span>{post.readTime} min read</span>
                          </div>
                          <Link href={`/stories/${post.slug}`}>
                            <Heading level={3} className="hover:text-[#1e4420] transition-colors">
                              {post.title}
                            </Heading>
                          </Link>
                          <Text className="mt-3 flex-grow">{post.excerpt}</Text>
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-[#EDF4F2] rounded-full flex items-center justify-center">
                                <Text className="text-xs">{post.author.name.charAt(0)}</Text>
                              </div>
                              <Text className="text-sm">{post.author.name}</Text>
                            </div>
                            <Text className="text-sm text-gray-400">
                              {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                            </Text>
                          </div>
                        </div>
                      </Card>
                    </ScaleIn>
                  </StaggerItem>
                ))}
              </div>
            </Stagger>
          </Container>
        </Section>
      )}

      <Section>
        <Container>
          <FadeIn>
            <Heading level={2} className="mb-8">Latest Stories</Heading>
          </FadeIn>
          <Stagger delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <StaggerItem key={post.id}>
                  <ScaleIn>
                    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow h-full">
                      <div className="bg-[#EDF4F2] h-48 flex items-center justify-center">
                        <LazyImage
                          src={post.featuredImage}
                          alt={post.title}
                          aspectRatio="video"
                          className="w-full h-full"
                        />
                      </div>
                      <div className="flex flex-col flex-grow p-6">
                        <div className="flex items-center gap-2 text-xs text-[#97BC62] font-medium mb-2">
                          <span>{categories.find(c => c.id === post.category)?.name}</span>
                          <span>•</span>
                          <span>{post.readTime} min read</span>
                        </div>
                        <Link href={`/stories/${post.slug}`}>
                          <Heading level={4} className="hover:text-[#1e4420] transition-colors">
                            {post.title}
                          </Heading>
                        </Link>
                        <Text className="mt-3 flex-grow text-sm">{post.excerpt}</Text>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                          <Text className="text-sm text-gray-400">
                            {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                          </Text>
                          <Link href={`/stories/${post.slug}`} className="text-[#2C5F2D] text-sm font-medium hover:underline">
                            Read More →
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </ScaleIn>
                </StaggerItem>
              ))}
            </div>
          </Stagger>
        </Container>
      </Section>

      <Section background="secondary">
        <Container>
          <FadeIn>
            <div className="text-center">
              <Heading level={2} className="text-[#1a1a1a]">Share Your Story</Heading>
              <Text size="lg" className="mt-4 mb-8 max-w-2xl mx-auto text-[#1a1a1a]">
                Have a story to share? We believe every story has the power to inspire 
                and create change.
              </Text>
              <Link href="/contact">
                <Button variant="primary" size="lg">Submit Your Story</Button>
              </Link>
            </div>
          </FadeIn>
        </Container>
      </Section>

      <Section>
        <Container>
          <FadeIn>
            <Heading level={2} align="center">Subscribe to Our Newsletter</Heading>
          </FadeIn>
          <FadeIn delay={0.2}>
            <Text size="lg" className="mt-4 text-center max-w-xl mx-auto mb-8">
              Get the latest stories, updates, and legal insights delivered to your inbox.
            </Text>
          </FadeIn>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C5F2D] focus:border-transparent"
              aria-label="Email address for newsletter"
            />
            <Button type="submit">Subscribe</Button>
          </form>
        </Container>
      </Section>
    </>
  );
}

export async function getStories(category?: string): Promise<BlogPost[]> {
  const response = await fetch(`/api/stories${category ? `?category=${category}` : ''}`, {
    next: { revalidate: 60 },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch stories');
  }
  return response.json();
}

export async function getStoryBySlug(slug: string): Promise<BlogPost | null> {
  const response = await fetch(`/api/stories/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!response.ok) {
    return null;
  }
  return response.json();
}
