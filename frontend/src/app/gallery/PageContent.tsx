"use client";
import { useEffect, useState } from "react";
import { Container, Section, Heading, Text, Button, LazyImage } from "@/components/ui";
import { GalleryItem } from "@/types";
import { api } from "@/lib/api";
import Link from "next/link";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { errorMessage } from "@/lib/api";

const categories = [
  { id: "all", name: "All" },
  { id: "education", name: "Education" },
  { id: "empowerment", name: "Empowerment" },
  { id: "caregivers", name: "Caregivers" },
  { id: "videos", name: "Videos" },
  { id: "community", name: "Community" },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    api.getGallery(activeCategory).then(data => { if (active) { setItems(data); setError(''); } }).catch(e => { if (active) { setItems([]); setError(errorMessage(e)); } });
    return () => { active = false; };
  }, [activeCategory]);
  useEffect(() => {
    if (!selectedItem) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelectedItem(null); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [selectedItem]);
  const filteredItems = items;
  const images = filteredItems.filter((item) => item.type === "image");
  const videos = filteredItems.filter((item) => item.type === "video");

  return (
    <>
      {error && <p role="alert" className="p-4 text-center">{error}</p>}
      <Section background="primary">
        <Container>
          <Heading level={1} className="text-white">
            Gallery
          </Heading>
          <Text size="lg" color="light" className="mt-4 max-w-2xl">
            Explore photos and videos from our programs and community activities.
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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D] ${activeCategory === category.id ? "bg-[#2C5F2D] text-white" : "bg-[#EDF4F2] text-[#4a4a4a] hover:bg-[#d4dfea]"}`}
              >
                {category.name}
              </button>
            ))}
          </div>
          {!items.length && !error && <Text className="text-center">No gallery items in this category yet.</Text>}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="relative group aspect-square bg-[#EDF4F2] rounded-lg overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D]"
                aria-label={`View ${item.title}`}
              >
                {item.type === "image" ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <LazyImage
                      src={item.url || item.thumbnail}
                      alt={item.title}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover"
                    />

                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#2C5F2D]">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
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
            <Heading level={2} className="mb-6">
              Photos
            </Heading>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="relative group aspect-square bg-[#EDF4F2] rounded-lg overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D]"
                  aria-label={`View ${item.title}`}
                >
                  <LazyImage
                    src={item.type === "video" ? item.thumbnail : item.url || item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    width={400}
                    height={400}
                  />
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
            <Heading level={2} className="mb-6">
              Videos
            </Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="relative group bg-[#EDF4F2] rounded-lg overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D] text-left"
                  aria-label={`Play ${item.title}`}
                >
                  <div className="aspect-video flex items-center justify-center relative">
                    <LazyImage
                      src={item.type === "video" ? item.thumbnail : item.url || item.thumbnail}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="w-16 h-16 rounded-full bg-[#2C5F2D] flex items-center justify-center group-hover:scale-110 transition-transform relative">
                      <svg
                        className="w-8 h-8 text-white ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
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
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            {selectedItem.type === "image" ? (
              <div className="aspect-video bg-[#EDF4F2] flex items-center justify-center overflow-hidden">
                <LazyImage
                  src={selectedItem.url}
                  alt={selectedItem.title}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="aspect-video bg-black flex items-center justify-center">
                <VideoPlayer key={selectedItem.id} source={selectedItem.playback} title={selectedItem.title}/>
              </div>
            )}
            <div className="p-6">
              <Heading level={3}>{selectedItem.title}</Heading>
              <Text className="mt-2">{selectedItem.description}</Text>
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedItem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[#EDF4F2] text-sm rounded-full"
                  >
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
            <Heading level={2} className="text-[#1a1a1a]">
              Share Your Photos/Videos
            </Heading>
            <Text
              size="lg"
              className="mt-4 mb-8 max-w-2xl mx-auto text-[#1a1a1a]"
            >
              Have photos or videos? Admin will add videos as links with
              thumbnails & descriptions.
            </Text>
            <Link href="/contact"><Button variant="primary" size="lg">Submit Media</Button></Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
