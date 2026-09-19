"use client";
import { useState } from 'react';
export function VideoPlayer({source,title}:{source?:{kind:'embed'|'file';src:string}|null;title:string}) {
  const [failed,setFailed]=useState(false);
  if (!source || failed) return <p className="p-4 text-white">This video is unavailable. Please contact the foundation.</p>;
  if (source.kind==='file') return <video controls playsInline preload="metadata" className="w-full h-full" aria-label={title} onError={()=>setFailed(true)}><source src={source.src}/><track kind="captions"/></video>;
  return <iframe src={source.src} title={title} className="w-full h-full" allow="encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>;
}
