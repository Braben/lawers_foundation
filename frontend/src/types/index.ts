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
  capacity?: number;
  registeredCount?: number;
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
  playback?: { kind: 'embed' | 'file'; src: string } | null;
  batchId?: string;
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

export interface Donation {
  id: string; name: string; donorName?: string; email: string; phone?: string;
  amount: number; currency?: string; campaign?: string; program?: string; frequency: string;
  message?: string; status: string; paymentStatus?: string; createdAt: string;
}
export interface Contact {
  id: string; name: string; email: string; phone?: string; subject: string;
  message: string; tags: string[]; createdAt: string;
}
export interface Rsvp {
  status?: 'pending' | 'approved' | 'rejected'; id: string; name: string; email: string; phone?: string; guests: number; createdAt: string }
export interface AdminStats {
  totalDonations: number; totalsByCurrency: Record<string, number>;
  upcomingEvents: number; totalContacts: number; totalStories: number;
  recentStories: BlogPost[]; recentDonations: Donation[]; permissions: string[];
}
export type Role = string;
export interface AccessProfile { role: string; permissions: string[]; protected?: boolean }
export interface RoleDefinition { id: string; name: string; permissions: string[]; protected?: boolean }
export interface StaffAccount { id: string; name: string; email: string; roleId: string; disabled: boolean; createdAt?: string }
export interface CurrencySettings { defaultCurrency: string; currencies: { code: string; name: string; enabled: boolean }[] }
export interface VisitAnalytics {
  from: string; to: string; pageViews: number; visits: number; uniqueVisitors: number; truncated: boolean;
  daily: { date: string; pageViews: number; visits: number; uniqueVisitors: number }[];
  topPages: { path: string; views: number }[]; referrers: { source: string; views: number }[];
}
