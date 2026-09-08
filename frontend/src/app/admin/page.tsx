'use client';
import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/admin/MetricCard';
import Link from 'next/link';

export default function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const token = typeof window!=='undefined' ? localStorage.getItem('lf_token') : null;
    fetch(`${base}/api/admin/stats`, { headers: token?{Authorization:`Bearer ${token}`}:{} as any, cache:'no-store' })
      .then(r=>r.json()).then(j=> setStats(j.data)).catch(()=>{}).finally(()=> setLoading(false));
  },[]);
  if (loading) return <div className="animate-pulse space-y-4"><div className="h-24 bg-white rounded-2xl"/><div className="h-64 bg-white rounded-2xl"/></div>;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Dashboard Overview</h1>
        <p className="text-sm text-gray-500">High-level metrics — aligned with Lawer & Lawers branding (#2C5F2D / #97BC62 / #EDF4F2)</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Donations" value={`${stats?.totalDonations ?? 0}`} sub={`GHS ${stats?.totalAmount ?? 0} • ${stats?.successful ?? 0} succeeded`} icon="₵" trend="Live from Donation Log"/>
        <MetricCard title="Upcoming Events" value={stats?.upcomingEvents ?? 0} sub={`${stats?.totalStories ?? 0} posts published`} icon="◐" trend={`${stats?.totalContacts ?? 0} contacts`}/>
        <MetricCard title="Content Performance" value={stats?.recentStories?.[0]?.title?.slice(0,22) || 'No posts yet'} sub={`${stats?.recentStories?.length ?? 0} recent`} icon="✎" trend="Top story"/>
        <MetricCard title="Community" value={`${stats?.totalContacts ?? 0} contacts`} sub="Donors • Volunteers • Subscribers" icon="☷" trend="CRM Light"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Content Performance</h3>
            <Link href="/admin/content" className="text-xs font-medium text-[#2C5F2D] border px-2 py-1 rounded-lg">Open Content Engine →</Link>
          </div>
          <div className="space-y-3">
            {(stats?.recentStories||[]).map((s:any)=>(
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-[#EDF4F2]">
                <div><div className="font-medium text-sm line-clamp-1">{s.title}</div><div className="text-xs text-gray-500">{s.category} • {new Date(s.publishedAt||s.createdAt).toLocaleDateString()}</div></div>
                <span className="text-xs px-2 py-1 rounded-full bg-white border">{s.readTime||5} min</span>
              </div>
            ))}
            {!stats?.recentStories?.length && <div className="text-sm text-gray-400">No content yet — publish a Blog or Story</div>}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold mb-3">Quick Actions</h3>
          <div className="grid gap-2">
            <Link href="/admin/content" className="w-full text-left px-4 py-3 rounded-xl bg-[#2C5F2D] text-white font-medium">＋ New Blog / Story</Link>
            <Link href="/admin/events" className="w-full text-left px-4 py-3 rounded-xl bg-white border font-medium">＋ Create Event (with capacity)</Link>
            <Link href="/admin/contacts" className="w-full text-left px-4 py-3 rounded-xl bg-white border font-medium">⤓ Export Contacts CSV</Link>
            <Link href="/admin/donations" className="w-full text-left px-4 py-3 rounded-xl bg-[#EDF4F2] border border-[#97BC62] font-medium">View Donation Ledger</Link>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-[#EDF4F2] text-xs text-gray-600">Role-based access: Super Admin sees all • Publisher → Content • Event Manager → Events/RSVPs</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h3 className="font-semibold mb-3">Recent Donations</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500"><tr><th className="text-left py-2">Donor</th><th className="text-left">Amount</th><th className="text-left">Campaign</th><th className="text-left">Status</th></tr></thead>
            <tbody>
              {(stats?.recentDonations||[]).map((d:any)=>(
                <tr key={d.id} className="border-t"><td className="py-2">{d.donorName||d.name}</td><td>GHS {d.amount}</td><td>{d.campaign||d.program||'General'}</td><td><span className={`px-2 py-1 rounded-full text-xs ${d.paymentStatus==='succeeded'?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'}`}>{d.paymentStatus||d.status}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
