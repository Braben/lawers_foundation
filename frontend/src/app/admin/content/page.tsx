'use client';
import { useState } from 'react';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { MediaLibrary } from '@/components/admin/MediaLibrary';
import { api } from '@/lib/api';

export default function ContentEngine() {
  const [type, setType] = useState<'blog'|'story'>('blog');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('education');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const publish = async () => {
    if(!title || !content) return setMsg('Title and content required');
    setBusy(true); setMsg('');
    try{
      const payload:any = {
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),
        title, excerpt: excerpt || content.replace(/<[^>]*>/g,'').slice(0,120),
        content, featuredImage: image, author: { name:'Admin', avatar:'' },
        category: type==='story' ? 'impact-stories' : category,
        tags: [type], readTime: Math.max(2, Math.ceil(content.length/600)), isFeatured: type==='story'
      };
      // unified publisher — same endpoint, toggle classifies as Blog vs Story
      await api.create('stories', payload);
      setMsg(`Published as ${type.toUpperCase()} ✓ — wired to POST /api/stories`);
      setTitle(''); setExcerpt(''); setContent(''); setImage('');
    }catch(e:any){ setMsg(e.message); } finally{ setBusy(false); }
  };

  return (
    <div className="space-y-6 max-w-[1100px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Content Engine</h1>
          <p className="text-sm text-gray-500">Unified editor — toggle Blog / Story, rich-text, media library → POST /api/stories</p>
        </div>
        <div className="flex p-1 bg-white rounded-full border shadow-sm">
          {(['blog','story'] as const).map(t=>(
            <button key={t} onClick={()=>setType(t)} className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition ${type===t?'bg-[#2C5F2D] text-white shadow':'text-gray-600 hover:bg-gray-50'}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_0.9fr] gap-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="text-xs font-semibold tracking-wide text-[#2C5F2D] uppercase">{type==='blog'?'Blog Post':'Impact Story'} • Rich-text</div>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder={type==='blog'?'Blog title…':'Story title — e.g., 80 Orphans now in school…'} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2C5F2D] text-lg font-semibold"/>
          <input value={excerpt} onChange={e=>setExcerpt(e.target.value)} placeholder="Excerpt (120 chars) — shown on Stories page" className="w-full px-4 py-2.5 rounded-xl border border-gray-200"/>
          <RichTextEditor value={content} onChange={setContent} placeholder="Write your story… Use toolbar for bold, lists, quotes, links"/>
          <div className="grid sm:grid-cols-2 gap-3">
            <select value={category} onChange={e=>setCategory(e.target.value)} className="px-3 py-2.5 rounded-xl border bg-white">
              <option value="education">Education & Skills</option>
              <option value="community">Community & Health</option>
              <option value="news">News & Updates</option>
              <option value="research">Research & Reports</option>
            </select>
            <input value={image} onChange={e=>setImage(e.target.value)} placeholder="Featured image URL (or pick from library →)" className="px-3 py-2.5 rounded-xl border"/>
          </div>
          <button onClick={publish} disabled={busy} className="w-full py-3 rounded-xl bg-[#2C5F2D] text-white font-semibold disabled:opacity-50">{busy?'Publishing…':`Publish as ${type}`}</button>
          {msg && <div className="text-sm p-3 rounded-xl bg-[#EDF4F2] border border-[#97BC62]">{msg}</div>}
          <div className="text-xs text-gray-400">Frontend wired: <code>api.create('stories', …)</code> → <code>POST /api/stories</code> (requires Publisher / Super Admin)</div>
        </div>
        <MediaLibrary onSelect={setImage} selected={image}/>
      </div>
    </div>
  );
}
