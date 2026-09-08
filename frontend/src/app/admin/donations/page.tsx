'use client';
import { useEffect, useState } from 'react';

export default function DonationLedger() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const token = typeof window!=='undefined' ? localStorage.getItem('lf_token') : null;
    fetch(`${base}/api/donations`, { headers: token?{Authorization:`Bearer ${token}`}:{} as any })
      .then(r=>r.json()).then(j=> setRows(j.data||[])).finally(()=> setLoading(false));
  },[]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Donation Log</h1>
        <p className="text-sm text-gray-500">Secure read-only ledger from payment gateway webhook <code>POST /api/donations/webhook</code> • wired to <code>GET /api/donations</code> • no edit/delete</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border shadow-sm"><div className="text-xs text-gray-500 uppercase font-semibold">Total Volume</div><div className="text-xl font-bold">GHS {rows.reduce((s,r)=> s+Number(r.amount||0),0).toLocaleString()}</div><div className="text-xs text-gray-500">{rows.length} transactions</div></div>
        <div className="bg-white rounded-2xl p-4 border shadow-sm"><div className="text-xs text-gray-500 uppercase font-semibold">Succeeded</div><div className="text-xl font-bold text-green-700">{rows.filter(r=> (r.paymentStatus||r.status)==='succeeded').length}</div><div className="text-xs text-gray-500">vs {rows.filter(r=> (r.paymentStatus||r.status)==='pending').length} pending</div></div>
        <div className="bg-white rounded-2xl p-4 border shadow-sm"><div className="text-xs text-gray-500 uppercase font-semibold">Campaigns</div><div className="text-xl font-bold">{new Set(rows.map(r=> r.campaign||r.program||'General')).size}</div><div className="text-xs text-gray-500">General • Orphan Support • Women Empowerment…</div></div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAF8] text-xs text-gray-500">
              <tr><th className="text-left px-4 py-3">Donor</th><th className="text-left">Amount</th><th className="text-left">Campaign</th><th className="text-left">Payment Status</th><th className="text-left">Txn ID</th><th className="text-left">Date</th></tr>
            </thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id} className="border-t hover:bg-[#EDF4F2]/30">
                  <td className="px-4 py-3"><div className="font-medium">{r.donorName||r.name}</div><div className="text-xs text-gray-500">{r.email}</div></td>
                  <td className="py-3 font-semibold">GHS {Number(r.amount||0).toLocaleString()}</td>
                  <td className="py-3"><span className="px-2 py-1 rounded-full text-xs bg-[#EDF4F2] border">{r.campaign||r.program||'General'}</span></td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium border ${ (r.paymentStatus||r.status)==='succeeded'?'bg-green-50 text-green-700 border-green-200': (r.paymentStatus||r.status)==='pending'?'bg-amber-50 text-amber-700 border-amber-200':'bg-red-50 text-red-700 border-red-200'}`}>{r.paymentStatus||r.status}</span></td>
                  <td className="py-3 font-mono text-xs">{r.transactionId||'—'}</td>
                  <td className="py-3 text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading ? <div className="p-8 text-center text-sm text-gray-400">Loading ledger…</div> : !rows.length ? <div className="p-8 text-center text-sm text-gray-400">No transactions yet — webhook POST /api/donations/webhook will populate</div> : null}
        <div className="px-4 py-3 text-xs text-gray-400 border-t bg-[#F8FAF8] flex items-center justify-between">
          <span>Read-only • No edit/delete • Super Admin only</span>
          <span className="hidden sm:inline">Secure: {rows.length} rows • Gateway → webhook → DB → this table</span>
        </div>
      </div>
    </div>
  );
}
