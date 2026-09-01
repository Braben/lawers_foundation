'use client';
import { useEffect, useState } from 'react';
import { Container, Section, Heading, Text, Button } from '@/components/ui';
import { GalleryItem } from '@/types';
import { api } from '@/lib/api';

const categories = [
  { id: 'all', name: 'All' },
  { id: 'education', name: 'Education' },
  { id: 'empowerment', name: 'Empowerment' },
  { id: 'caregivers', name: 'Caregivers' },
  { id: 'videos', name: 'Videos' },
];

const FALLBACK: GalleryItem[] = [
  { id: '1', title: 'Orphan Scholarship Day', description: 'Distributing scholarships, books and counselling', type: 'image', url: '/images/gallery/orphan-day.jpg', thumbnail: '/images/gallery/orphan-day-thumb.jpg', category: 'education', tags: ['orphan'], uploadedAt: '2024-01-15' },
  { id: '7', title: 'Art & Therapy in Action', description: 'Video: 40 orphans in art & music therapy', type: 'video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnail: '/images/gallery/video-1-thumb.jpg', category: 'videos', tags: ['therapy','video'], uploadedAt: '2023-12-01' },
];

function getYoutubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  return m ? m[1] : null;
}

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [items, setItems] = useState<GalleryItem[]>(FALLBACK);
  useEffect(()=>{ api.getGallery(activeCategory).then(d=>{ if(d?.length) setItems(d); else if(activeCategory==='all') setItems(FALLBACK); else setItems([]);}).catch(()=>{});},[activeCategory]);
  const filteredItems = items;
  const images = filteredItems.filter(item => item.type === 'image');
  const videos = filteredItems.filter(item => item.type === 'video');

  return (
    <>
      <Section background="primary">
        <Container>
          <Heading level={1} className="text-white">Gallery</Heading>
          <Text size="lg" color="light" className="mt-4 max-w-2xl">Explore photos and videos from our programs — videos are links only; thumbnails & descriptions are set by admin when posting.</Text>
        </Container>
      </Section>
      <Section>
        <Container>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map((category) => (
              <button key={category.id} onClick={() => setActiveCategory(category.id)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D] ${activeCategory === category.id ? 'bg-[#2C5F2D] text-white' : 'bg-[#EDF4F2] text-[#4a4a4a] hover:bg-[#d4dfea]'}`}>{category.name}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <button key={item.id} onClick={() => setSelectedItem(item)} className="relative group aspect-square bg-[#EDF4F2] rounded-lg overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D]" aria-label={`View ${item.title}`}>
                {item.type === 'image' ? (
                  <div className="w-full h-full flex items-center justify-center"><img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/><span className="absolute inset-0 flex items-center justify-center"><Text color="muted">Photo</Text></span></div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#2C5F2D]"><div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg></div></div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4"><Text className="text-white text-center text-sm font-medium">{item.title}</Text></div>
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
                <button key={item.id} onClick={() => setSelectedItem(item)} className="relative group aspect-square bg-[#EDF4F2] rounded-lg overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D]" aria-label={`View ${item.title}`}>
                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4"><Text className="text-white text-center text-sm font-medium">{item.title}</Text></div>
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
                <button key={item.id} onClick={() => setSelectedItem(item)} className="relative group bg-[#EDF4F2] rounded-lg overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D] text-left" aria-label={`Play ${item.title}`}>
                  <div className="aspect-video flex items-center justify-center relative">
                    <img src={item.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover" onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                    <div className="w-16 h-16 rounded-full bg-[#2C5F2D] flex items-center justify-center group-hover:scale-110 transition-transform relative"><svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg></div>
                  </div>
                  <div className="p-4"><Text className="font-medium">{item.title}</Text><Text className="text-sm mt-1">{item.description}</Text></div>
                </button>
              ))}
            </div>
          </Container>
        </Section>
      )}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedItem(null)} role="dialog" aria-modal="true" aria-label={`Viewing ${selectedItem.title}`}>
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Close gallery view">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {selectedItem.type === 'image' ? (
              <div className="aspect-video bg-[#EDF4F2] flex items-center justify-center overflow-hidden"><img src={selectedItem.url} alt={selectedItem.title} className="w-full h-full object-contain" /></div>
            ) : (
              <div className="aspect-video bg-black flex items-center justify-center">
                {getYoutubeId(selectedItem.url) ? <iframe src={`https://www.youtube.com/embed/${getYoutubeId(selectedItem.url)}`} title={selectedItem.title} className="w-full h-full" allowFullScreen /> : <a href={selectedItem.url} target="_blank" rel="noopener noreferrer" className="text-white underline">Open video link: {selectedItem.url}</a>}
              </div>
            )}
            <div className="p-6"><Heading level={3}>{selectedItem.title}</Heading><Text className="mt-2">{selectedItem.description}</Text><div className="flex flex-wrap gap-2 mt-4">{selectedItem.tags.map((tag) => (<span key={tag} className="px-3 py-1 bg-[#EDF4F2] text-sm rounded-full">{tag}</span>))}</div></div>
          </div>
        </div>
      )}
      <Section background="secondary">
        <Container>
          <div className="text-center"><Heading level={2} className="text-[#1a1a1a]">Share Your Photos/Videos</Heading><Text size="lg" className="mt-4 mb-8 max-w-2xl mx-auto text-[#1a1a1a]">Have photos or videos? Admin will add videos as links with thumbnails & descriptions.</Text><Button variant="primary" size="lg">Submit Media</Button></div>
        </Container>
      </Section>
    </>
  );
}
