'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '◧', roles: ['super_admin','publisher','event_manager'] as const },
  { href: '/admin/content', label: 'Content Engine', icon: '✎', roles: ['super_admin','publisher'] as const },
  { href: '/admin/events', label: 'Event Manager', icon: '◐', roles: ['super_admin','event_manager'] as const },
  { href: '/admin/contacts', label: 'Contact Directory', icon: '☷', roles: ['super_admin'] as const },
  { href: '/admin/donations', label: 'Donation Log', icon: '₵', roles: ['super_admin'] as const },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string>('super_admin');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('lf_token') : null;
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/role`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r=>r.json()).then(j=> j.data?.role && setRole(j.data.role)).catch(()=>{});
  }, [user]);

  const isLogin = pathname === '/admin/login';
  useEffect(()=>{ if(!isLogin && !loading && !user) router.replace('/admin/login'); },[user,loading,router,isLogin]);
  if (isLogin) return <>{children}</>;
  if (loading) return <div className="min-h-screen grid place-items-center bg-[#EDF4F2]"><div className="w-10 h-10 border-4 border-[#2C5F2D] border-t-transparent rounded-full animate-spin"/></div>;
  if (!user) return null;

  const canSee = (roles: readonly string[]) => role==='super_admin' || roles.includes(role as any);

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex">
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
          {NAV.filter(n=>canSee(n.roles)).map(item=>{
            const active = pathname===item.href || (item.href!=='/admin' && pathname?.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={()=>setMobileOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${active ? 'bg-white text-[#2C5F2D] shadow' : 'text-white/85 hover:bg-white/10 hover:text-white'}`}>
                <span className="w-7 h-7 grid place-items-center rounded-md bg-white/10 text-sm">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          {!canSee(['super_admin']) && <div className="px-3 py-3 text-xs text-white/60">Some sections hidden by role ({role})</div>}
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
          {children}
        </main>
      </div>
    </div>
  );
}
