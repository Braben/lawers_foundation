"use client";
import { useEffect, useState, FormEvent } from 'react';
import { api, errorMessage } from '@/lib/api';
import { usePermission } from '@/components/admin/AdminLayout';
import type { CurrencySettings } from '@/types';
export default function SettingsPage() {
  const canManage=usePermission('settings.manage');
  const [settings,setSettings]=useState<CurrencySettings|null>(null);
  const [message,setMessage]=useState(''); const [busy,setBusy]=useState(false);
  const [code,setCode]=useState(''); const [name,setName]=useState('');
  useEffect(()=>{ api.getAdminCurrencies().then(setSettings).catch(e=>setMessage(errorMessage(e))); },[]);
  const save=async(e:FormEvent)=>{ e.preventDefault(); if(!settings)return; setBusy(true);setMessage('');try { setSettings(await api.saveCurrencies(settings));setMessage('Currency settings saved.'); }catch(e){setMessage(errorMessage(e));}finally{setBusy(false);} };
  return <div className="space-y-6 max-w-3xl"><div><h1 className="text-2xl font-bold">Pledge Currencies</h1><p className="text-sm text-gray-500">Choose the currencies donors can pledge in. Payments are arranged with the administrator.</p></div>
    {message && <p role="status" className="p-3 bg-[#EDF4F2] rounded-xl">{message}</p>}
    {settings ? <form onSubmit={save} className="bg-white rounded-2xl border p-5 space-y-5"><fieldset disabled={!canManage||busy} className="space-y-5">
      <label className="block text-sm">Default currency<select value={settings.defaultCurrency} onChange={e=>setSettings({...settings,defaultCurrency:e.target.value})} className="block mt-1 border rounded-xl p-2 w-full">{settings.currencies.filter(c=>c.enabled).map(c=><option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}</select></label>
      <div className="space-y-3">{settings.currencies.map(currency=><label key={currency.code} className="flex items-center justify-between gap-4 border rounded-xl p-3"><span>{currency.code} — {currency.name}</span><span className="flex gap-2 items-center"><input type="checkbox" checked={currency.enabled} onChange={e=>setSettings({...settings,currencies:settings.currencies.map(c=>c.code===currency.code?{...c,enabled:e.target.checked}:c)})}/>Enabled</span></label>)}</div>
      <div className="flex flex-wrap gap-3"><input aria-label="Currency code" placeholder="ISO code, e.g. CAD" maxLength={3} value={code} onChange={e=>setCode(e.target.value.toUpperCase())} className="border rounded-xl p-2"/><input aria-label="Currency name" placeholder="Currency name" value={name} onChange={e=>setName(e.target.value)} className="border rounded-xl p-2"/><button type="button" onClick={()=>{if(!/^[A-Z]{3}$/.test(code)||!name.trim()||settings.currencies.some(c=>c.code===code)){setMessage('Enter a unique three-letter currency code and name.');return;}setSettings({...settings,currencies:[...settings.currencies,{code,name:name.trim(),enabled:true}]});setCode('');setName('');}} className="border rounded-xl px-3 py-2">Add currency</button></div>
      {canManage&&<button className="px-4 py-2 bg-[#2C5F2D] text-white rounded-xl">{busy?'Saving...':'Save currencies'}</button>}
    </fieldset><p className="text-xs text-gray-500">Keep the default currency enabled. Disabling a currency prevents new pledges; existing pledge amounts and currencies are preserved.</p></form>:!message&&<p>Loading currencies...</p>}
  </div>;
}
