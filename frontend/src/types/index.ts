export interface Program {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  features: string[];
  impactStats: {
    label: string;
    value: string;
  }[];
  gallery: string[];
  isActive: boolean;
  order: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  isFeatured: boolean;
  readTime: number;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  time: string;
  endTime?: string;
  location: {
    name: string;
    address: string;
    city: string;
  };
  image: string;
  isOnline: boolean;
  meetingLink?: string;
  registrationRequired: boolean;
  registrationLink?: string;
  category: string;
  isFeatured: boolean;
  isPast: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  category: string;
  tags: string[];
  uploadedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
