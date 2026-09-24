'use client';
import { useRef, useEffect } from 'react';
import { cleanEditorHtml } from '@/lib/sanitize-html';

export function RichTextEditor({ value, onChange, placeholder, disabled = false }: { value: string, onChange:(v:string)=>void, placeholder?:string, disabled?:boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{ const safe = cleanEditorHtml(value); if(ref.current && ref.current.innerHTML!==safe) ref.current.innerHTML = safe; },[value]);
  const cmd = (c:string, v?:string)=>{ document.execCommand(c,false,v); ref.current?.focus(); onChange(cleanEditorHtml(ref.current?.innerHTML||'')); };
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className="flex flex-wrap gap-1 p-2 bg-[#F8FAF8] border-b border-gray-100">
        {[
          ['B','bold'],['I','italic'],['U','underline'],
          ['• List','insertUnorderedList'],['1. List','insertOrderedList'],
          ['Link','createLink'],['Quote','formatBlock'],
        ].map(([label, c])=>(
          <button key={label} disabled={disabled} type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>{
            if(c==='createLink'){ const url=prompt('URL'); if(url && /^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(url.trim())) cmd(c,url.trim()); }
            else if(c==='formatBlock') cmd(c,'blockquote');
            else cmd(c);
          }} className="px-2.5 py-1.5 text-xs font-medium border rounded-lg bg-white hover:bg-gray-50">{label}</button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onPaste={e=>{
          e.preventDefault(); if(disabled) return;
          const html=e.clipboardData.getData('text/html');
          if(html) cmd('insertHTML',cleanEditorHtml(html));
          else cmd('insertText',e.clipboardData.getData('text/plain'));
        }}
        onDrop={e=>e.preventDefault()}
        onInput={()=> onChange(cleanEditorHtml(ref.current?.innerHTML||''))}
        data-placeholder={placeholder}
        className="min-h-[180px] p-4 outline-none prose prose-sm max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
      />
    </div>
  );
}
