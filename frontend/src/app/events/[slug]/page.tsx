'use client';
import { FormVerification } from '@/components/FormVerification';
import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, errorMessage } from '@/lib/api';
import type { Event } from '@/types';
import { Container, Section, Heading, Text, Button, LazyImage } from '@/components/ui';

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [verificationReset, setVerificationReset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', guests: 1 });
  useEffect(() => { let active = true; api.getEvent(slug).then(data => { if (active) setEvent(data); }).catch(e => { if (active) setError(errorMessage(e)); }); return () => { active = false; }; }, [slug]);
  const register = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); if (!event) return; setBusy(true); setError(''); setMessage('');
    try { await api.rsvp(event.id, {...form, verificationToken, website: new FormData(e.currentTarget).get('website')}); setMessage('Your request has been received. Staff will confirm your place after reviewing your details.'); }
    catch (error) { setError(errorMessage(error)); } finally { setBusy(false); setVerificationToken(''); setVerificationReset(v=>v+1); }
  };
  if (!event) return <Section><Container><Text>{error || 'Loading event...'}</Text><Link href="/events" className="underline">Back to events</Link></Container></Section>;
  const isPast = event.isPast || (event.endDate || event.date) < new Date().toISOString().slice(0, 10);
  const remaining = Math.max(0, (event.capacity || 100) - (event.registeredCount || 0));
  return <><Section background="primary"><Container><Heading level={1} className="text-white">{event.title}</Heading><Text color="light" className="mt-4">{new Date(event.date).toLocaleDateString('en-GH')} · {event.time} · {event.isOnline ? 'Online' : event.location.name}</Text></Container></Section>
    <Section><Container><div className="max-w-3xl mx-auto space-y-6">{event.image && <LazyImage src={event.image} alt={event.title} aspectRatio="video" className="rounded-xl" />}<Text className="whitespace-pre-wrap">{event.description}</Text><Text>{event.location.address} {event.location.city}</Text>
      <div id="register">{event.registrationRequired && !isPast && remaining > 0 && !message ? <form onSubmit={register} className="bg-white border rounded-xl p-6 space-y-4"><Heading level={2}>Register</Heading><Text>{remaining} places available</Text>
        <label className="block text-sm">Full name<input required minLength={2} maxLength={150} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="block w-full mt-1 border rounded-lg px-4 py-2" /></label>
        <label className="block text-sm">Email<input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="block w-full mt-1 border rounded-lg px-4 py-2" /></label>
        <label className="block text-sm">Phone (optional)<input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="block w-full mt-1 border rounded-lg px-4 py-2" /></label>
        <label className="block text-sm">People attending, including you<input type="number" required min={1} max={Math.min(5, remaining)} value={form.guests} onChange={e => setForm({ ...form, guests: Number(e.target.value) })} className="block w-full mt-1 border rounded-lg px-4 py-2" /></label>
        <FormVerification action="rsvp" onToken={setVerificationToken} resetKey={verificationReset} />
<Button type="submit" disabled={busy || !verificationToken}>{busy ? 'Registering...' : 'Request a place'}</Button></form> : <Text>{message || (isPast ? 'This event has ended.' : remaining === 0 ? 'This event is fully booked.' : 'Registration is not required. Contact us for more information.')}</Text>}
        {error && <p role="alert" className="text-red-700 mt-3">{error}</p>}
      </div><Link href="/events" className="inline-block text-[#2C5F2D] underline">Back to events</Link></div></Container></Section></>;
}
