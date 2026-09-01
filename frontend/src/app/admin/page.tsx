'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Container, Section, Heading, Text, Button } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function AdminPage() {
  const { user, loading, token, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'gallery'|'stories'|'events'|'programs'>('gallery');
  const [form, setForm] = useState<any>({ title:'', description:'', type:'video', url:'', thumbnail:'', category:'videos', tags:'' });
  const [msg, setMsg] = useState('');

  useEffect(()=>{ if(!loading && !user) router.push('/admin/login'); },[user, loading, router]);

  if (loading) return <Section><Container><Text>Loading...</Text></Container></Section>;
  if (!user) return null;

  const handleSubmit = async () => {
    setMsg('');
    try {
      const payload: any = { ...form, tags: form.tags.split(',').map((s:string)=>s.trim()).filter(Boolean) };
      if (payload.type==='video' && !/^https?:\/\//.test(payload.url)) throw new Error('Video must be a link (YouTube/Vimeo URL)');
      if (tab==='gallery') {
        await api.create('gallery', payload);
      } else if (tab==='stories') {
        await api.create('stories', { slug: payload.title.toLowerCase().replace(/\s+/g,'-'), title: payload.title, excerpt: payload.description, content: payload.description, featuredImage: payload.thumbnail, category: payload.category, tags: payload.tags });
      } else if (tab==='events') {
        await api.create('events', { slug: payload.title.toLowerCase().replace(/\s+/g,'-'), title: payload.title, description: payload.description, date: new Date().toISOString().slice(0,10), time:'10:00 AM', location:{name:payload.category,address:'',city:''}, image: payload.thumbnail, category:'workshop', isFeatured:false, isPast:false });
      } else if (tab==='programs') {
        await api.create('programs', { slug: payload.title.toLowerCase().replace(/\s+/g,'-'), title: payload.title, shortDescription: payload.description.slice(0,80), fullDescription: payload.description, features:[payload.description], impactStats:[{value:'New',label:'Added'}] });
      }
      setMsg('Published! Frontend will fetch from database instantly.');
      setForm({ title:'', description:'', type:'video', url:'', thumbnail:'', category:'videos', tags:'' });
    } catch(e:any){ setMsg(e.message); }
  };

  const handleThumbUpload = async (e:any) => {
    const file = e.target.files?.[0];
    if(!file || !token) return;
    try {
      const url = await api.uploadThumbnail(file, token);
      setForm((f:any)=>({...f, thumbnail:url}));
      setMsg('Thumbnail uploaded to Firebase Storage');
    } catch(err:any){ setMsg(err.message); }
  };

  return (
    <Section>
      <Container>
        <div className="flex justify-between items-center">
          <Heading level={1}>Admin — Post Content</Heading>
          <div className="flex gap-2 items-center"><Text className="text-sm">{user.email}</Text><Button variant="outline" size="sm" onClick={logout}>Logout</Button></div>
        </div>
        <Text className="mt-2">Every frontend content comes from database. Videos are link-only — paste YouTube/Vimeo URL. Thumbnail & description are set by you here and stored via Firebase Storage.</Text>
        <div className="flex gap-2 mt-6">
          {(['gallery','stories','events','programs'] as const).map(t=>(<button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-full text-sm ${tab===t?'bg-[#2C5F2D] text-white':'bg-[#EDF4F2]'}`}>{t}</button>))}
        </div>
        <div className="max-w-2xl mt-6 bg-white p-6 rounded-xl shadow space-y-4">
          <input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full px-4 py-2 border rounded-lg"/>
          <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full px-4 py-2 border rounded-lg" rows={3}/>
          {tab==='gallery' && (
            <>
              <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                <option value="image">Image</option>
                <option value="video">Video (link only)</option>
              </select>
              <input placeholder={form.type==='video' ? 'Video URL (YouTube/Vimeo link only, no file upload)' : 'Image URL'} value={form.url} onChange={e=>setForm({...form,url:e.target.value})} className="w-full px-4 py-2 border rounded-lg"/>
              {form.type==='video' && <Text className="text-xs text-gray-500">Videos are not uploaded — paste a link. Admin sets thumbnail & description.</Text>}
            </>
          )}
          <div>
            <input placeholder="Thumbnail URL (or upload)" value={form.thumbnail} onChange={e=>setForm({...form,thumbnail:e.target.value})} className="w-full px-4 py-2 border rounded-lg"/>
            <input type="file" accept="image/*" onChange={handleThumbUpload} className="mt-2 text-sm"/>
            <Text className="text-xs text-gray-500">Thumbnails stored in Firebase Storage when configured</Text>
          </div>
          <input placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full px-4 py-2 border rounded-lg"/>
          <input placeholder="Tags (comma separated)" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} className="w-full px-4 py-2 border rounded-lg"/>
          <Button onClick={handleSubmit} className="w-full">Publish to Database</Button>
          {msg && <Text className="text-sm">{msg}</Text>}
        </div>
      </Container>
    </Section>
  );
}
