"use client";
import { useEffect, useState, useRef, FormEvent } from 'react';
import { api, errorMessage } from '@/lib/api';
import { LazyImage } from '@/components/ui';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { usePermission } from '@/components/admin/AdminLayout';
import type { GalleryItem } from '@/types';
const empty={title:'',description:'',category:'community',url:'',thumbnail:''};
export default function GalleryManager(){
  const canManage=usePermission('gallery.manage');
  const [items,setItems]=useState<GalleryItem[]>([]);const [form,setForm]=useState(empty);
  const [files,setFiles]=useState<File[]>([]);const [editing,setEditing]=useState<GalleryItem|null>(null);
  const [mode,setMode]=useState<'image'|'video'>('image');const [preview,setPreview]=useState<GalleryItem|null>(null);
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
  const input=useRef<HTMLInputElement>(null);
  useEffect(()=>{api.getGallery().then(setItems).catch(e=>setMessage(errorMessage(e)));},[]);
  const reset=()=>{setForm(empty);setFiles([]);setEditing(null);if(input.current)input.current.value='';};
  const save=async(event:FormEvent)=>{
    event.preventDefault();setBusy(true);setMessage('');
    try{
      if(editing) await api.update('gallery',editing.id,{title:form.title,description:form.description,category:form.category,...(editing.type==='video'?{url:form.url,thumbnail:form.thumbnail||'/images/lawersfoundation.png'}:{})});
      else if(mode==='video') await api.create('gallery',{...form,type:'video',thumbnail:form.thumbnail||'/images/lawersfoundation.png',tags:[]});
      else{
        if(!files.length||files.length>20)throw new Error('Choose between 1 and 20 images.');
        if(files.some(f=>f.size>5*1024*1024))throw new Error('Each image must be 5 MB or smaller.');
        if(files.reduce((n,f)=>n+f.size,0)>50*1024*1024)throw new Error('The batch must be 50 MB or smaller.');
        await api.uploadImages(files,{title:form.title,description:form.description,category:form.category});
      }
      setItems(await api.getGallery());reset();setMessage('Gallery saved. New media is available on the public gallery.');
    }catch(error){setMessage(errorMessage(error));}finally{setBusy(false);}
  };
  const remove=async(item:GalleryItem)=>{if(!window.confirm(`Remove "${item.title}" from the gallery?`))return;setBusy(true);try{await api.remove('gallery',item.id);setItems(current=>current.filter(i=>i.id!==item.id));if(editing?.id===item.id)reset();setMessage('Removed from the gallery.');}catch(error){setMessage(errorMessage(error));}finally{setBusy(false);}};
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Gallery</h1><p className="text-sm text-gray-500">Upload multiple images or add videos visitors can play on the website.</p></div>
    {canManage&&<form onSubmit={save} className="bg-white rounded-2xl p-5 border shadow-sm space-y-4 max-w-2xl"><fieldset disabled={busy} className="space-y-4">
      <h2 className="font-semibold">{editing?'Edit media':mode==='image'?'Upload images':'Add a video'}</h2>
      {!editing&&<div className="flex gap-3">{(['image','video'] as const).map(type=><button key={type} type="button" onClick={()=>{reset();setMode(type);}} className={`px-4 py-2 rounded-xl border ${mode===type?'bg-[#2C5F2D] text-white':'bg-white'}`}>{type==='image'?'Images':'Video URL'}</button>)}</div>}
      {!editing&&mode==='image'&&<label className="block text-sm">Images (up to 20; JPEG, PNG or WebP; 5 MB each)<input ref={input} multiple type="file" accept="image/jpeg,image/png,image/webp" required onChange={e=>setFiles(Array.from(e.target.files||[]))} className="block mt-2 w-full border rounded-xl p-3"/>{files.length>0&&<span className="block mt-2">{files.length} selected: {files.map(f=>f.name).join(', ')}</span>}</label>}
      {(editing?.type==='video'||(!editing&&mode==='video'))&&<><label className="block text-sm">Video URL<input type="url" required placeholder="https://www.youtube.com/watch?v=..." value={form.url} onChange={e=>setForm({...form,url:e.target.value})} className="block w-full mt-1 border rounded-xl p-2"/></label><p className="text-xs text-gray-500">YouTube, Vimeo, or a publicly accessible HTTPS MP4/WebM file. The host must allow embedded playback.</p><label className="block text-sm">Thumbnail URL (optional)<input value={form.thumbnail} onChange={e=>setForm({...form,thumbnail:e.target.value})} className="block w-full mt-1 border rounded-xl p-2"/></label></>}
      <label className="block text-sm">{!editing&&mode==='image'?'Title prefix (optional; otherwise use filenames)':'Title'}<input required={!!editing||mode==='video'} minLength={2} maxLength={140} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="block mt-1 w-full border rounded-xl px-3 py-2"/></label>
      <label className="block text-sm">Description<textarea maxLength={2000} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="block mt-1 w-full border rounded-xl px-3 py-2" rows={3}/></label>
      <label className="block text-sm">Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="block mt-1 w-full border rounded-xl px-3 py-2">{['community','education','empowerment','caregivers','videos'].map(c=><option key={c} value={c}>{c}</option>)}</select></label>
      <div className="flex gap-3"><button className="px-4 py-2 rounded-xl bg-[#2C5F2D] text-white disabled:opacity-50">{busy?'Saving...':editing?'Save changes':mode==='image'?'Upload images':'Add video'}</button>{editing&&<button type="button" onClick={reset} className="px-4 py-2 border rounded-xl">Cancel</button>}</div>
    </fieldset></form>}
    {message&&<p role="status" className="p-3 bg-[#EDF4F2] rounded-xl">{message}</p>}
    {preview&&<div className="bg-white border rounded-xl p-4"><div className="flex justify-between mb-3"><h2>{preview.title}</h2><button onClick={()=>setPreview(null)} className="underline">Close preview</button></div><div className="aspect-video bg-black"><VideoPlayer key={preview.id} source={preview.playback} title={preview.title}/></div></div>}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{items.map(item=><article key={item.id} className="bg-white rounded-xl border overflow-hidden"><LazyImage src={item.thumbnail||item.url} alt={item.title} aspectRatio="video"/><div className="p-4 space-y-2"><h2 className="font-semibold">{item.title}</h2><p className="text-sm text-gray-500">{item.description}</p><p className="text-xs text-gray-500">{item.category} · {item.type}</p><div className="flex gap-3">{item.type==='video'&&<button onClick={()=>setPreview(item)} className="underline text-sm">Play</button>}{canManage&&<><button disabled={busy} onClick={()=>{setEditing(item);setForm({title:item.title,description:item.description,category:item.category,url:item.url,thumbnail:item.thumbnail});}} className="text-sm underline">Edit</button><button disabled={busy} onClick={()=>remove(item)} className="text-sm text-red-700 underline">Remove</button></>}</div></div></article>)}</div>
    {!items.length&&<p className="text-sm text-gray-500">No media yet.</p>}
  </div>;
}
