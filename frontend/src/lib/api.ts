import type { ApiResponse, Program, BlogPost, Event, GalleryItem, Donation, Contact, Rsvp, AdminStats, AccessProfile, CurrencySettings, VisitAnalytics, RoleDefinition, StaffAccount } from '@/types';
import { auth } from './firebase';
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export function errorMessage(error: unknown) { return error instanceof Error ? error.message : 'The request could not be completed. Please try again.'; }
export async function apiFetch(path: string, opts: RequestInit = {}) {
  const headers = new Headers(opts.headers);
  if (!(opts.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (auth.currentUser) headers.set('Authorization', `Bearer ${await auth.currentUser.getIdToken()}`);
  const res = await fetch(`${BASE}${path}`, { ...opts, headers, cache: 'no-store' });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message || `Request failed (${res.status})`);
  }
  return res;
}
export async function apiRequest<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, opts);
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.message || 'Request failed');
  return json.data;
}
const filter = (category?: string) => category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
export const api = {
  getCurrencies: () => apiRequest<CurrencySettings>('/api/settings/currencies'),
  getAdminCurrencies: () => apiRequest<CurrencySettings>('/api/settings/admin/currencies'),
  saveCurrencies: (data: CurrencySettings) => apiRequest<CurrencySettings>('/api/settings/currencies', { method:'PUT', body:JSON.stringify(data) }),
  getAnalytics: (from: string, to: string) => apiRequest<VisitAnalytics>(`/api/analytics/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
  getRoles: () => apiRequest<{ roles: RoleDefinition[]; permissions: string[] }>('/api/staff/roles'),
  createRole: (data: { id: string; name: string; permissions: string[] }) => apiRequest<RoleDefinition>('/api/staff/roles', { method:'POST', body:JSON.stringify(data) }),
  updateRole: (id: string, data: { name: string; permissions: string[] }) => apiRequest<RoleDefinition>(`/api/staff/roles/${encodeURIComponent(id)}`, { method:'PUT', body:JSON.stringify(data) }),
  getStaff: () => apiRequest<StaffAccount[]>('/api/staff/accounts'),
  getAssignableRoles: () => apiRequest<RoleDefinition[]>('/api/staff/assignable-roles'),
  createStaff: (data: { name: string; email: string; password: string; roleId: string }) => apiRequest<StaffAccount>('/api/staff/accounts', { method:'POST', body:JSON.stringify(data) }),
  updateStaff: (id: string, data: { roleId: string; disabled: boolean }) => apiRequest<StaffAccount>(`/api/staff/accounts/${encodeURIComponent(id)}`, { method:'PUT', body:JSON.stringify(data) }),
  uploadImages: async (files: File[], metadata: { title: string; description: string; category: string }) => {
    const body = new FormData(); files.forEach(file => body.append('files',file));
    Object.entries(metadata).forEach(([key,value]) => body.append(key,value));
    return apiRequest<GalleryItem[]>('/api/upload/images', { method:'POST',body });
  },
  getPrograms: () => apiRequest<Program[]>('/api/programs'),
  getProgram: (slug: string) => apiRequest<Program>(`/api/programs/${encodeURIComponent(slug)}`),
  getStories: (category?: string) => apiRequest<BlogPost[]>(`/api/stories${filter(category)}`),
  getStory: (slug: string) => apiRequest<BlogPost>(`/api/stories/${encodeURIComponent(slug)}`),
  getEvents: (category?: string) => apiRequest<Event[]>(`/api/events${filter(category)}`),
  getEvent: (slug: string) => apiRequest<Event>(`/api/events/${encodeURIComponent(slug)}`),
  getGallery: (category?: string) => apiRequest<GalleryItem[]>(`/api/gallery${filter(category)}`),
  getContent: <T>(id: string) => apiRequest<T>(`/api/content/${encodeURIComponent(id)}`),
  createDonation: (data: object) => apiRequest<Donation>('/api/donations', { method: 'POST', body: JSON.stringify(data) }),
  createContact: (data: object) => apiRequest<Contact>('/api/contacts', { method: 'POST', body: JSON.stringify(data) }),
  getDonations: () => apiRequest<Donation[]>('/api/donations'),
  getContacts: (tag = 'all') => apiRequest<Contact[]>(`/api/contacts?tag=${encodeURIComponent(tag)}`),
  getStats: () => apiRequest<AdminStats>('/api/admin/stats'),
  getRole: () => apiRequest<AccessProfile>('/api/auth/role'),
  getRsvps: (id: string) => apiRequest<Rsvp[]>(`/api/events/${encodeURIComponent(id)}/rsvps`),
  rsvp: (id: string, data: object) => apiRequest<Rsvp>(`/api/events/${encodeURIComponent(id)}/rsvp`, { method: 'POST', body: JSON.stringify(data) }),
  create: (col: 'programs' | 'stories' | 'events' | 'gallery', data: object) => apiRequest<unknown>(`/api/${col}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (col: string, id: string, data: object) => apiRequest<unknown>(`/api/${col}/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (col: string, id: string) => apiRequest<unknown>(`/api/${col}/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  uploadImage: async (file: File, metadata: { title: string; description: string; category: string }) => {
    const body = new FormData(); body.append('file', file);
    Object.entries(metadata).forEach(([key, value]) => body.append(key, value));
    return apiRequest<GalleryItem>('/api/upload/gallery', { method: 'POST', body });
  },
};
