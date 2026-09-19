"use client";
import { useEffect, useState, FormEvent } from 'react';
import { api, errorMessage } from '@/lib/api';
import { usePermission } from '@/components/admin/AdminLayout';
import type { RoleDefinition } from '@/types';
export default function RolesPage() {
  const canManage=usePermission('roles.manage');
  const [roles,setRoles]=useState<RoleDefinition[]>([]); const [permissions,setPermissions]=useState<string[]>([]);
  const [ownRole,setOwnRole]=useState(''); const [selected,setSelected]=useState('manager');
  const [draft,setDraft]=useState<RoleDefinition|null>(null); const [creating,setCreating]=useState(false);
  const [message,setMessage]=useState(''); const [busy,setBusy]=useState(false);
  useEffect(()=>{Promise.all([api.getRoles(),api.getRole()]).then(([data,access])=>{setRoles(data.roles);setPermissions(data.permissions);setOwnRole(access.role);setDraft(data.roles.find(r=>r.id==='manager')||data.roles[0]);}).catch(e=>setMessage(errorMessage(e)));},[]);
  const locked=!canManage||busy||!!draft?.protected||(!creating&&draft?.id===ownRole);
  const toggle=(permission:string,enabled:boolean)=>{if(!draft)return;let next=draft.permissions.filter(p=>p!==permission);if(enabled){next.push(permission);if(permission.endsWith('.manage'))next.push(permission.replace('.manage','.view'));}else if(permission.endsWith('.view'))next=next.filter(p=>p!==permission.replace('.view','.manage'));setDraft({...draft,permissions:[...new Set(next)]});};
  const save=async(e:FormEvent)=>{e.preventDefault();if(!draft)return;setBusy(true);setMessage('');try{if(creating)await api.createRole(draft);else await api.updateRole(draft.id,draft);const data=await api.getRoles();setRoles(data.roles);setSelected(draft.id);setDraft(data.roles.find(r=>r.id===draft.id)||null);setCreating(false);setMessage('Role saved. Updated permissions apply to API requests immediately.');}catch(e){setMessage(errorMessage(e));}finally{setBusy(false);}};
  return <div className="space-y-6 max-w-4xl"><div><h1 className="text-2xl font-bold">Roles & Permissions</h1><p className="text-sm text-gray-500">CEO starts with full access. Switch individual features on or off for other roles.</p></div>
    <div className="flex gap-3"><select aria-label="Select role" disabled={busy} value={creating?'':selected} onChange={e=>{setSelected(e.target.value);setDraft(roles.find(r=>r.id===e.target.value)||null);setCreating(false);}} className="border bg-white rounded-xl p-3"><option value="" disabled>New role</option>{roles.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select>{canManage&&<button type="button" disabled={busy} onClick={()=>{setCreating(true);setDraft({id:'',name:'',permissions:[]});}} className="border rounded-xl p-3">Create role</button>}</div>
    {message&&<p role="status" className="p-3 bg-[#EDF4F2] rounded-xl">{message}</p>}
    {draft&&<form onSubmit={save} className="bg-white border rounded-2xl p-5 space-y-4"><fieldset disabled={locked} className="space-y-4">
      {creating&&<label className="block text-sm">Role ID<input required pattern="[a-z][a-z0-9_]{1,49}" value={draft.id} onChange={e=>setDraft({...draft,id:e.target.value.toLowerCase()})} placeholder="e.g. communications_manager" className="block mt-1 w-full border rounded-xl p-2"/></label>}
      <label className="block text-sm">Role name<input required minLength={2} maxLength={80} value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} className="block mt-1 w-full border rounded-xl p-2"/></label>
      <div className="grid sm:grid-cols-2 gap-3">{permissions.map(permission=><label key={permission} className="flex items-center gap-3 border rounded-xl p-3"><input type="checkbox" checked={draft.permissions.includes(permission)} onChange={e=>toggle(permission,e.target.checked)}/><span className="capitalize">{permission.replace('.',' — ')}</span></label>)}</div>
      {!locked&&<button className="bg-[#2C5F2D] text-white px-4 py-2 rounded-xl">Save role</button>}
    </fieldset>{draft.protected&&<p className="text-sm text-gray-500">This built-in role is protected.</p>}{!creating&&draft.id===ownRole&&<p className="text-sm text-gray-500">Use another administrator account to change your own role permissions.</p>}</form>}
  </div>;
}
