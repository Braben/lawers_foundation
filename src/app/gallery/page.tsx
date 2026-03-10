'use client';

import { useState } from 'react';
import { Container, Section, Heading, Text, Button } from '@/components/ui';
import { GalleryItem } from '@/types';

const categories = [
  { id: 'all', name: 'All' },
  { id: 'legal-aid', name: 'Legal Aid' },
  { id: 'awareness', name: 'Awareness Programs' },
  { id: 'workshops', name: 'Workshops' },
  { id: 'events', name: 'Events' },
  { id: 'rehabilitation', name: 'Rehabilitation' },
  { id: 'videos', name: 'Videos' },
];

const galleryItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Free Legal Aid Camp',
    description: 'Our lawyers providing free consultations at a community camp',
    type: 'image',
    url: '/images/gallery/legal-aid-1.jpg',
    thumbnail: '/images/gallery/legal-aid-1-thumb.jpg',
    category: 'legal-aid',
    tags: ['legal aid', 'camp', 'community'],
    uploadedAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Women Empowerment Workshop',
    description: 'Participants at our women empowerment workshop learning about their rights',
    type: 'image',
    url: '/images/gallery/empowerment-1.jpg',
    thumbnail: '/images/gallery/empowerment-1-thumb.jpg',
    category: 'awareness',
    tags: ['women', 'empowerment', 'workshop'],
    uploadedAt: '2024-01-10',
  },
  {
    id: '3',
    title: 'School Legal Literacy Program',
    description: 'Teaching students about child rights and legal protections',
    type: 'image',
    url: '/images/gallery/school-program.jpg',
    thumbnail: '/images/gallery/school-program-thumb.jpg',
    category: 'awareness',
    tags: ['school', 'children', 'education'],
    uploadedAt: '2024-01-05',
  },
  {
    id: '4',
    title: 'Child Protection Training',
    description: 'Training session for teachers on identifying child abuse',
    type: 'image',
    url: '/images/gallery/child-training.jpg',
    thumbnail: '/images/gallery/child-training-thumb.jpg',
    category: 'workshops',
    tags: ['child protection', 'training', 'teachers'],
    uploadedAt: '2023-12-28',
  },
  {
    id: '5',
    title: 'Annual Gala 2023',
    description: 'Highlights from our annual fundraising gala',
    type: 'image',
    url: '/images/gallery/gala-2023.jpg',
    thumbnail: '/images/gallery/gala-2023-thumb.jpg',
    category: 'events',
    tags: ['gala', 'fundraiser', 'event'],
    uploadedAt: '2023-12-15',
  },
  {
    id: '6',
    title: 'Rehabilitation Center Visit',
    description: 'Our team visiting beneficiaries at the rehabilitation center',
    type: 'image',
    url: '/images/gallery/rehabilitation.jpg',
    thumbnail: '/images/gallery/rehabilitation-thumb.jpg',
    category: 'rehabilitation',
    tags: ['rehabilitation', 'support', 'care'],
    uploadedAt: '2023-12-10',
  },
  {
    id: '7',
    title: 'Understanding Domestic Violence Laws',
    description: 'Educational video on domestic violence laws and protections',
    type: 'video',
    url: 'https://www.youtube.com/embed/example1',
    thumbnail: '/images/gallery/video-1-thumb.jpg',
    category: 'videos',
    tags: ['domestic violence', 'legal', 'education'],
    uploadedAt: '2023-12-01',
  },
  {
    id: '8',
    title: 'Women Rights Awareness Campaign',
    description: 'Street play performance during our awareness campaign',
    type: 'image',
    url: '/images/gallery/campaign-1.jpg',
    thumbnail: '/images/gallery/campaign-1-thumb.jpg',
    category: 'awareness',
    tags: ['campaign', 'awareness', 'street play'],
    uploadedAt: '2023-11-20',
  },
  {
    id: '9',
    title: 'Legal Aid Success Stories',
    description: 'Video featuring survivors sharing their journey to justice',
    type: 'video',
    url: 'https://www.youtube.com/embed/example2',
    thumbnail: '/images/gallery/video-2-thumb.jpg',
    category: 'videos',
    tags: ['success story', 'survivor', 'inspiration'],
    uploadedAt: '2023-11-15',
  },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const filteredItems = activeCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  const images = filteredItems.filter(item => item.type === 'image');
  const videos = filteredItems.filter(item => item.type === 'video');

  return (
    <>
      <Section background="primary">
        <Container>
          <Heading level={1} className="text-white">Gallery</Heading>
          <Text size="lg" color="light" className="mt-4 max-w-2xl">
            Explore photos and videos from our programs, events, and impact stories. 
            See the real work behind our mission.
          </Text>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D] ${
                  activeCategory === category.id
                    ? 'bg-[#2C5F2D] text-white'
                    : 'bg-[#EDF4F2] text-[#4a4a4a] hover:bg-[#d4dfea]'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="relative group aspect-square bg-[#EDF4F2] rounded-lg overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D]"
                aria-label={`View ${item.title}`}
              >
                {item.type === 'image' ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Text color="muted">Photo</Text>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#2C5F2D]">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                  <Text className="text-white text-center text-sm font-medium">
                    {item.title}
                  </Text>
                </div>
              </button>
            ))}
          </div>
        </Container>
      </Section>

      {images.length > 0 && (
        <Section background="neutral">
          <Container>
            <Heading level={2} className="mb-6">Photos</Heading>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="relative group aspect-square bg-[#EDF4F2] rounded-lg overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D]"
                  aria-label={`View ${item.title}`}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Text color="muted">Photo</Text>
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <Text className="text-white text-center text-sm font-medium">
                      {item.title}
                    </Text>
                  </div>
                </button>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {videos.length > 0 && (
        <Section>
          <Container>
            <Heading level={2} className="mb-6">Videos</Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="relative group bg-[#EDF4F2] rounded-lg overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D]"
                  aria-label={`Play ${item.title}`}
                >
                  <div className="aspect-video flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#2C5F2D] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                  <div className="p-4">
                    <Text className="font-medium">{item.title}</Text>
                    <Text className="text-sm mt-1">{item.description}</Text>
                  </div>
                </button>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Viewing ${selectedItem.title}`}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close gallery view"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {selectedItem.type === 'image' ? (
              <div className="aspect-video bg-[#EDF4F2] flex items-center justify-center">
                <Text color="muted">Full Size Image</Text>
              </div>
            ) : (
              <div className="aspect-video bg-black flex items-center justify-center">
                <Text color="light">Video Player</Text>
              </div>
            )}
            
            <div className="p-6">
              <Heading level={3}>{selectedItem.title}</Heading>
              <Text className="mt-2">{selectedItem.description}</Text>
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedItem.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-[#EDF4F2] text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Section background="secondary">
        <Container>
          <div className="text-center">
            <Heading level={2} className="text-[#1a1a1a]">Share Your Photos/Videos</Heading>
            <Text size="lg" className="mt-4 mb-8 max-w-2xl mx-auto text-[#1a1a1a]">
              Have photos or videos from our events or programs? Share them with us 
              to help spread awareness about our work.
            </Text>
            <Button variant="primary" size="lg">Submit Media</Button>
          </div>
        </Container>
      </Section>
    </>
  );
}

export async function getGalleryItems(category?: string): Promise<GalleryItem[]> {
  const response = await fetch(`/api/gallery${category ? `?category=${category}` : ''}`, {
    next: { revalidate: 60 },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch gallery items');
  }
  return response.json();
}
