import { AdminLayout } from '@/components/admin/AdminLayout';
export const metadata = { robots: { index: false, follow: false } };
export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
