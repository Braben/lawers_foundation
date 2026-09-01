const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function req(path: string, opts: RequestInit = {}) {
  const headers: any = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const token = typeof window !== 'undefined' ? localStorage.getItem('lf_token') : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers, cache: 'no-store' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || `API ${res.status}`);
  return json;
}

export const api = {
  getPrograms: () => req('/api/programs').then(r => r.data),
  getProgram: (slug: string) => req(`/api/programs/${slug}`).then(r => r.data),
  getStories: (category?: string) => req(`/api/stories${category && category!=='all' ? `?category=${category}`:''}`).then(r=>r.data),
  getEvents: (category?: string) => req(`/api/events${category && category!=='all'?`?category=${category}`:''}`).then(r=>r.data),
  getGallery: (category?: string) => req(`/api/gallery${category && category!=='all'?`?category=${category}`:''}`).then(r=>r.data),
  getContent: (id: string) => req(`/api/content/${id}`).then(r=>r.data),
  createDonation: (data: any) => req('/api/donations', { method:'POST', body: JSON.stringify(data)}).then(r=>r.data),
  createContact: (data: any) => req('/api/contacts', { method:'POST', body: JSON.stringify(data)}).then(r=>r.data),
  getDonations: () => req('/api/donations').then(r=>r.data),
  getContacts: () => req('/api/contacts').then(r=>r.data),
  create: (col: 'programs'|'stories'|'events'|'gallery', data: any) => req(`/api/${col}`, { method:'POST', body: JSON.stringify(data)}).then(r=>r.data),
  update: (col: string, id: string, data: any) => req(`/api/${col}/${id}`, { method:'PUT', body: JSON.stringify(data)}).then(r=>r.data),
  remove: (col: string, id: string) => req(`/api/${col}/${id}`, { method:'DELETE'}).then(r=>r.data),
  uploadThumbnail: async (file: File, token: string) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${BASE}/api/upload/thumbnail`, { method:'POST', headers: { Authorization:`Bearer ${token}` }, body: fd });
    const j = await res.json();
    if(!res.ok) throw new Error(j.message);
    return j.url as string;
  }
};
