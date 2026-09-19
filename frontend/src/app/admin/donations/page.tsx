'use client';
import { useEffect, useState } from 'react';
import { api, errorMessage } from '@/lib/api';
import type { Donation } from '@/types';

export default function DonationLedger() {
  const [rows, setRows] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');
  useEffect(() => {
    api.getDonations().then(setRows).catch(e => setError(errorMessage(e))).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      {error && <p role="alert">{error}</p>}
      <div>
        <h1 className="text-2xl font-bold">Donation Log</h1>
        <p className="text-sm text-gray-500">Pledges and donor contact details. Donors contact the administrator to arrange payment outside this website.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border shadow-sm"><div className="text-xs text-gray-500 uppercase font-semibold">Total Pledged</div><div className="text-xl font-bold">{Object.entries(rows.filter(r=>r.status==='pledged').reduce<Record<string,number>>((totals,row)=>{const currency=row.currency||'GHS';totals[currency]=(totals[currency]||0)+Number(row.amount||0);return totals;},{})).map(([currency,total])=><div key={currency}>{currency} {total.toLocaleString()}</div>)}</div><div className="text-xs text-gray-500">{rows.length} pledges</div></div>
        <div className="bg-white rounded-2xl p-4 border shadow-sm"><div className="text-xs text-gray-500 uppercase font-semibold">Pledged</div><div className="text-xl font-bold text-green-700">{rows.filter(r=> r.status==='pledged').length}</div><div className="text-xs text-gray-500">vs {rows.filter(r=> r.status!=='pledged').length} legacy records</div></div>
        <div className="bg-white rounded-2xl p-4 border shadow-sm"><div className="text-xs text-gray-500 uppercase font-semibold">Campaigns</div><div className="text-xl font-bold">{new Set(rows.map(r=> r.campaign||r.program||'General')).size}</div><div className="text-xs text-gray-500">General • Orphan Support • Women Empowerment…</div></div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAF8] text-xs text-gray-500">
              <tr><th className="text-left px-4 py-3">Donor</th><th className="text-left">Amount</th><th className="text-left">Campaign</th><th className="text-left">Pledge Status</th><th className="text-left">Phone</th><th className="text-left">Date</th></tr>
            </thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id} className="border-t hover:bg-[#EDF4F2]/30">
                  <td className="px-4 py-3"><div className="font-medium">{r.donorName||r.name}</div><div className="text-xs text-gray-500">{r.email}</div></td>
                  <td className="py-3 font-semibold">{r.currency || 'GHS'} {Number(r.amount||0).toLocaleString()}</td>
                  <td className="py-3"><span className="px-2 py-1 rounded-full text-xs bg-[#EDF4F2] border">{r.campaign||r.program||'General'}</span></td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium border ${ r.status==='pledged'?'bg-green-50 text-green-700 border-green-200': r.status!=='pledged'?'bg-amber-50 text-amber-700 border-amber-200':'bg-red-50 text-red-700 border-red-200'}`}>{r.status === 'pledged' ? 'Pledged' : 'Legacy record'}</span></td>
                  <td className="py-3 font-mono text-xs">{r.phone||'—'}</td>
                  <td className="py-3 text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading ? <div className="p-8 text-center text-sm text-gray-400">Loading pledges…</div> : !rows.length ? <div className="p-8 text-center text-sm text-gray-400">No donation pledges yet.</div> : null}
        <div className="px-4 py-3 text-xs text-gray-400 border-t bg-[#F8FAF8] flex items-center justify-between">
          <span>Read-only • No edit/delete • Super Admin only</span>
          <span className="hidden sm:inline">{rows.length} pledges • No online payments</span>
        </div>
      </div>
    </div>
  );
}
