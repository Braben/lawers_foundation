'use client';
import { useEffect, useState } from 'react';
import { api, apiFetch, errorMessage } from '@/lib/api';
import type { Contact } from '@/types';

const TAGS = ['all','Donor','Volunteer','Subscriber','Caregiver','Education','General'];

export default function ContactDirectory() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tag, setTag] = useState('all');
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    api.getContacts(tag).then(data => { if (active) setContacts(data); }).catch(e => { if (active) setError(errorMessage(e)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [tag]);

  const exportCsv = ()=>{
    const url = `/api/contacts/export/csv${tag!=='all'?`?tag=${tag}`:''}`;
    apiFetch(url)
      .then(r=>r.blob()).then(b=>{
        const u = URL.createObjectURL(b);
        const a=document.createElement('a'); a.href=u; a.download=`contacts${tag!=='all'?'_'+tag:''}.csv`; a.click(); URL.revokeObjectURL(u);
      }).catch(e => setError(errorMessage(e)));
  };

  return (
    <div className="space-y-4">
      {error && <p role="alert">{error}</p>}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Contact Directory</h1>
          <p className="text-sm text-gray-500">Contact inquiries, automatic tags and CSV export.</p>
        </div>
        <button onClick={exportCsv} className="px-4 py-2 rounded-xl bg-[#2C5F2D] text-white text-sm font-semibold shadow">⤓ Export CSV{tag!=='all'?` (${tag})`:''}</button>
      </div>

      <div className="flex gap-2 flex-wrap p-1 bg-white rounded-full border w-fit">
        {TAGS.map(t=>(
          <button key={t} onClick={()=>{ if (t !== tag) { setTag(t); setLoading(true); setError(''); } }} className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${tag===t?'bg-[#2C5F2D] text-white':'text-gray-600 hover:bg-gray-50'}`}>{t}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAF8] text-xs text-gray-500">
              <tr><th className="text-left px-4 py-3">Contact</th><th className="text-left">Subject</th><th className="text-left">Tags</th><th className="text-left">Date</th></tr>
            </thead>
            <tbody>
              {contacts.map(c=>(
                <tr key={c.id} className="border-t hover:bg-[#EDF4F2]/40">
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.email} {c.phone?`• ${c.phone}`:''}</div>
                  </td>
                  <td className="py-3 max-w-[320px]"><div className="font-medium line-clamp-1">{c.subject}</div><div className="text-xs text-gray-500 line-clamp-1">{c.message}</div></td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {(c.tags||[]).map((t:string)=>(
                        <span key={t} className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#EDF4F2] border border-[#97BC62]/40">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading ? <div className="p-8 text-center text-sm text-gray-400">Loading…</div> : !contacts.length ? <div className="p-8 text-center text-sm text-gray-400">No contacts for this tag</div> : <div className="px-4 py-3 text-xs text-gray-400 border-t bg-[#F8FAF8]">{contacts.length} contacts</div>}
      </div>
    </div>
  );
}
