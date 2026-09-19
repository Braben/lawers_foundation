'use client';
import { errorMessage } from '@/lib/api';
import { useEffect, useState } from 'react';
import { usePermission } from '@/components/admin/AdminLayout';
import { api } from '@/lib/api';
import type { Event, Rsvp } from '@/types';

export default function EventManager() {
  const canManage=usePermission('events.manage');
  const [form, setForm] = useState({ title:'', description:'', date:'', time:'10:00 AM', location:'Community Centre, Lower Manya Krobo', capacity:100, category:'workshop' });
  const [events, setEvents] = useState<Event[]>([]);
  const [selected, setSelected] = useState<Event | null>(null);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [msg, setMsg] = useState('');

  const load = ()=>{
    api.getEvents().then(setEvents).catch(e => setMsg(errorMessage(e)));
  };
  useEffect(()=>{ load(); },[]);

  const create = async (e: React.FormEvent)=>{
    e.preventDefault(); setMsg('');
    try{
      const payload = {
        slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
        title: form.title, description: form.description, date: form.date, time: form.time,
        location: { name: form.location, address:'Lower Manya Krobo', city:'Eastern Region' },
        capacity: Number(form.capacity), registeredCount:0, registrationRequired: true, category: form.category
      };
      await api.create('events', payload);
      setMsg('Event created. Registration is open.');
      load(); setForm({ title:'', description:'', date:'', time:'10:00 AM', location:'Community Centre, Lower Manya Krobo', capacity:100, category:'workshop' });
    }catch(er: unknown){ setMsg(errorMessage(er)); }
  };

  const openRsvps = async (ev: Event)=>{
    setSelected(ev); setRsvps([]);
    try { setRsvps(await api.getRsvps(ev.id)); } catch (error) { setMsg(errorMessage(error)); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Event Manager</h1>
        <p className="text-sm text-gray-500">Create events, set capacity and review registrations.</p>
      </div>
      <div className="grid lg:grid-cols-[0.95fr_1.2fr] gap-6">
        <form onSubmit={create} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3"><fieldset disabled={!canManage} className="space-y-4">
          <div className="text-sm font-semibold text-[#2C5F2D]">Create Event</div>
          <input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Title" className="w-full px-3 py-2.5 rounded-xl border"/>
          <textarea required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Description" rows={3} className="w-full px-3 py-2.5 rounded-xl border"/>
          <div className="grid grid-cols-2 gap-3">
            <input required type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="px-3 py-2.5 rounded-xl border"/>
            <input value={form.time} onChange={e=>setForm({...form,time:e.target.value})} placeholder="10:00 AM" className="px-3 py-2.5 rounded-xl border"/>
          </div>
          <input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Location" className="w-full px-3 py-2.5 rounded-xl border"/>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">Capacity<input type="number" min={1} value={form.capacity} onChange={e=>setForm({...form,capacity:Number(e.target.value)})} className="w-full mt-1 px-3 py-2.5 rounded-xl border"/></label>
            <label className="text-sm">Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full mt-1 px-3 py-2.5 rounded-xl border bg-white"><option value="workshop">Workshop</option><option value="campaign">Campaign</option></select></label>
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-[#2C5F2D] text-white font-semibold">Create Event</button>
          {msg && <div className="text-sm p-2 rounded-lg bg-[#EDF4F2]">{msg}</div>}
        </fieldset></form>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Events & Registrations</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-[#EDF4F2]">{events.length} events</span>
          </div>
          <div className="space-y-2 max-h-[520px] overflow-auto pr-1">
            {events.map(ev=>(
              <div key={ev.id} className="p-3 rounded-xl border flex items-center justify-between gap-3 hover:bg-gray-50">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{ev.title}</div>
                  <div className="text-xs text-gray-500">{ev.date} • {ev.location?.name} • {ev.registeredCount||0}/{ev.capacity||100} registered</div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden"><div className="h-full bg-[#97BC62]" style={{width:`${Math.min(100, ((ev.registeredCount||0)/(ev.capacity||100))*100)}%`}}/></div>
                </div>
                <button onClick={()=>openRsvps(ev)} className="shrink-0 px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-[#EDF4F2]">RSVPs →</button>
              </div>
            ))}
            {!events.length && <div className="text-sm text-gray-400 text-center py-8">No events yet</div>}
          </div>
          {selected && (
            <div className="mt-4 p-3 rounded-xl bg-[#F8FAF8] border">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-sm">{selected.title} — RSVPs</div>
                <button onClick={()=>setSelected(null)} className="text-xs border px-2 py-1 rounded-lg bg-white">Close</button>
              </div>
              <div className="text-xs text-gray-500 mb-2">Capacity capped: {selected.capacity} • {rsvps.length} registered • {Math.max(0,(selected.capacity||100)-rsvps.reduce((s,r)=>s+Number(r.guests||1),0))} spots left</div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-gray-500"><tr><th className="text-left py-1">Name</th><th className="text-left">Email</th><th className="text-left">Guests</th><th className="text-left">Date</th></tr></thead>
                  <tbody>
                    {rsvps.map(r=>(
                      <tr key={r.id} className="border-t"><td className="py-1">{r.name}</td><td>{r.email}</td><td>{r.guests}</td><td>{new Date(r.createdAt).toLocaleDateString()}</td></tr>
                    ))}
                  </tbody>
                </table>
                {!rsvps.length && <div className="text-xs text-gray-400 py-4 text-center">No registrations yet. Visitors can register from the event page.</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
