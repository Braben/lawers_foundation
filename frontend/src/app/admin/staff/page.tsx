"use client";
import { useEffect, useState, FormEvent } from 'react';
import { api, errorMessage } from '@/lib/api';
import { usePermission } from '@/components/admin/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import type { StaffAccount, RoleDefinition } from '@/types';
const empty={name:'',email:'',password:'',roleId:'manager'};
export default function StaffPage(){
  const canManage=usePermission('staff.manage'); const {user}=useAuth();
  const [accounts,setAccounts]=useState<StaffAccount[]>([]); const [roles,setRoles]=useState<RoleDefinition[]>([]);
  const [form,setForm]=useState(empty);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
  useEffect(()=>{Promise.all([api.getStaff(),api.getAssignableRoles()]).then(([accounts,roles])=>{setAccounts(accounts);setRoles(roles);}).catch(e=>setMessage(errorMessage(e)));},[]);
  const create=async(e:FormEvent)=>{e.preventDefault();setBusy(true);setMessage('');try{const account=await api.createStaff(form);setAccounts(current=>[...current,account]);setForm(empty);setMessage('Account created. Share the initial password with the staff member securely.');}catch(e){setMessage(errorMessage(e));}finally{setBusy(false);}};
  const save=async(account:StaffAccount)=>{setBusy(true);setMessage('');try{const updated=await api.updateStaff(account.id,{roleId:account.roleId,disabled:account.disabled});setAccounts(current=>current.map(a=>a.id===updated.id?updated:a));setMessage('Account access updated.');}catch(e){setMessage(errorMessage(e));}finally{setBusy(false);}};
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Staff Accounts</h1><p className="text-sm text-gray-500">Create managers, CEO accounts and other staff roles.</p></div>
    {message&&<p role="status" className="p-3 bg-[#EDF4F2] rounded-xl">{message}</p>}
    {canManage&&<form onSubmit={create} className="bg-white border rounded-2xl p-5 space-y-4 max-w-2xl"><h2 className="font-semibold">Create account</h2><fieldset disabled={busy} className="space-y-4">
      <label className="block text-sm">Name<input required minLength={2} maxLength={120} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="block w-full mt-1 border rounded-xl p-2"/></label>
      <label className="block text-sm">Email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="block w-full mt-1 border rounded-xl p-2"/></label>
      <label className="block text-sm">Initial password (at least 12 characters)<input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="block w-full mt-1 border rounded-xl p-2"/></label>
      <label className="block text-sm">Role<select required value={form.roleId} onChange={e=>setForm({...form,roleId:e.target.value})} className="block w-full mt-1 border rounded-xl p-2"><option value="" disabled>Select a role</option>{roles.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
      <button className="px-4 py-2 rounded-xl bg-[#2C5F2D] text-white">{busy?'Creating...':'Create account'}</button>
    </fieldset></form>}
    <div className="space-y-3">{accounts.map(account=><div key={account.id} className="bg-white border rounded-xl p-4 flex flex-wrap gap-4 items-center"><div className="flex-1 min-w-48"><p className="font-semibold">{account.name}</p><p className="text-sm text-gray-500">{account.email}</p></div>
      <select aria-label={`Role for ${account.name}`} disabled={!canManage||busy||account.id===user?.uid||account.roleId==='super_admin'} value={account.roleId} onChange={e=>setAccounts(current=>current.map(a=>a.id===account.id?{...a,roleId:e.target.value}:a))} className="border rounded-xl p-2">{!roles.some(r=>r.id===account.roleId)&&<option value={account.roleId}>{account.roleId}</option>}{roles.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={!account.disabled} disabled={!canManage||busy||account.id===user?.uid||account.roleId==='super_admin'} onChange={e=>setAccounts(current=>current.map(a=>a.id===account.id?{...a,disabled:!e.target.checked}:a))}/>Enabled</label>
      {canManage&&account.id!==user?.uid&&account.roleId!=='super_admin'&&<button disabled={busy} onClick={()=>save(account)} className="border rounded-xl px-3 py-2">Save</button>}
    </div>)}</div>{!accounts.length&&<p className="text-sm text-gray-500">No dashboard-created staff accounts yet. The configured main administrator remains authorized.</p>}
  </div>;
}
