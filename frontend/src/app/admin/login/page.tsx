'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Container, Section, Heading, Text, Button } from '@/components/ui';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const { signInWithEmail, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  useEffect(()=>{ if(!loading && user) router.replace('/admin'); },[user, loading, router]);
  if (loading) return <Section><Container><Text>Loading...</Text></Container></Section>;
  if (user) return null;
  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await signInWithEmail(email,password);
      router.replace('/admin');
    } catch(er:any){ setErr(er.message || 'Invalid credentials'); }
    finally{ setBusy(false); }
  };
  return (
    <Section>
      <Container>
        <Heading level={1}>Admin Login</Heading>
        <Text className="mt-2">Sign in with your admin email and password to manage content. Videos are link-only; thumbnails & descriptions are set by you.</Text>
        <form onSubmit={handleEmail} className="max-w-md mt-8 space-y-4 bg-white p-6 rounded-xl shadow">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input placeholder="admin@lawerandlawers.org" value={email} onChange={e=>setEmail(e.target.value)} required type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2C5F2D]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required type="password" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2C5F2D]" />
          </div>
          <Button type="submit" disabled={busy} className="w-full">{busy?'Signing in...':'Sign In'}</Button>
          {err && <Text className="text-red-600 text-sm">{err}</Text>}
          <Text className="text-xs text-gray-500 text-center">No self-registration. Contact system admin to create an admin account.</Text>
        </form>
      </Container>
    </Section>
  );
}
