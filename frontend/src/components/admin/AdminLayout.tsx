'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createContext, useContext, useEffect, useState } from 'react';
import { api, errorMessage } from '@/lib/api';
import type { AccessProfile } from '@/types';

const NAV = [
  { href:'/admin', label:'Dashboard', icon:'◧', permission:'analytics.view' },
  { href:'/admin/content', label:'Content Engine', icon:'✎', permission:'content.view' },
  { href:'/admin/gallery', label:'Gallery', icon:'▧', permission:'gallery.view' },
  { href:'/admin/events', label:'Event Manager', icon:'◐', permission:'events.view' },
  { href:'/admin/contacts', label:'Contact Directory', icon:'☷', permission:'contacts.view' },
  { href:'/admin/donations', label:'Donation Pledges', icon:'₵', permission:'pledges.view' },
  { href:'/admin/settings', label:'Currencies', icon:'⚙', permission:'settings.view' },
  { href:'/admin/staff', label:'Staff Accounts', icon:'♙', permission:'staff.view' },
  { href:'/admin/roles', label:'Roles & Permissions', icon:'☑', permission:'roles.view' },
];
const PermissionsContext = createContext<string[]>([]);
export const usePermission = (permission:string) => useContext(PermissionsContext).includes(permission);

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [access, setAccess] = useState<({ uid:string; error?:string } & Partial<AccessProfile>) | null>(null);
  const role = access?.uid === user?.uid ? access?.role : null;
  const roleError = access?.uid === user?.uid ? access?.error : null;
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const refresh = () => api.getRole().then(data => { if (active) setAccess({ uid: user.uid, ...data }); }).catch(error => { if (active) setAccess({ uid: user.uid, error: errorMessage(error) }); });
    refresh();
    window.addEventListener('focus',refresh);
    const timer = window.setInterval(refresh,60000);
    return () => { active = false; window.removeEventListener('focus',refresh); window.clearInterval(timer); };
  }, [user, pathname]);

  const isLogin = pathname === '/admin/login';
  useEffect(()=>{ if(!isLogin && !loading && !user) router.replace('/admin/login'); },[user,loading,router,isLogin]);
  if (isLogin) return <>{children}</>;
  if (loading) return <div className="min-h-screen grid place-items-center bg-[#EDF4F2]"><div className="w-10 h-10 border-4 border-[#2C5F2D] border-t-transparent rounded-full animate-spin"/></div>;
  if (!user) return null;
  if (roleError) return <div className="p-8" role="alert">{roleError}<button onClick={logout} className="block mt-4 underline">Sign out</button></div>;
  if (!role) return <div className="p-8">Checking access...</div>;

  const permissions = access?.permissions || [];
  const canSee = (permission:string) => permissions.includes(permission);

  const currentPage = NAV.find(n => pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href + '/')));
  const allowed = currentPage && canSee(currentPage.permission);

  return (
    <PermissionsContext.Provider value={permissions}><div className="min-h-screen bg-[#F8FAF8] flex">
      <aside className={`bg-[#2C5F2D] text-white w-[280px] shrink-0 sticky top-0 h-screen overflow-y-auto hidden lg:flex flex-col ${mobileOpen?'!flex fixed inset-0 z-40 w-full':''}`}>
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white text-[#2C5F2D] grid place-items-center font-bold">L</div>
            <div>
              <div className="font-bold leading-none">Lawer & Lawers</div>
              <div className="text-xs text-white/70">Admin Dashboard</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-white/15 border border-white/20">{role.replace('_',' ')}</span>
            <span className="truncate text-white/80">{user.email}</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Admin">
          {NAV.filter(n=>canSee(n.permission)).map(item=>{
            const active = pathname===item.href || (item.href!=='/admin' && pathname?.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={()=>setMobileOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${active ? 'bg-white text-[#2C5F2D] shadow' : 'text-white/85 hover:bg-white/10 hover:text-white'}`}>
                <span className="w-7 h-7 grid place-items-center rounded-md bg-white/10 text-sm">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          {role !== 'super_admin' && <div className="px-3 py-3 text-xs text-white/60">Some sections hidden by role ({role})</div>}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link href="/" className="block text-center text-sm py-2 rounded-lg bg-white text-[#2C5F2D] font-medium">← Back to Website</Link>
          <button onClick={logout} className="w-full text-sm py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15">Logout</button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 lg:hidden flex items-center justify-between px-4 py-3">
          <div className="font-bold text-[#2C5F2D]">Admin</div>
          <button onClick={()=>setMobileOpen(v=>!v)} className="px-3 py-1.5 rounded-lg border">{mobileOpen?'Close':'Menu'}</button>
        </header>
        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-[1400px] mx-auto w-full">
          {allowed ? children : <div role="alert">You do not have access to this section. Choose an available section from the menu.{role === 'viewer' && <p>Contact the administrator to request access.</p>}</div>}
        </main>
      </div>
    </div></PermissionsContext.Provider>
  );
}
