'use client';
import { errorMessage } from '@/lib/api';
import { useState, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Section, Heading, Text, Button } from '@/components/ui';
import { api } from '@/lib/api';

export default function ContactPage() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ name:'', email:'', phone:'', subject: searchParams.get('subject') === 'donation' ? 'donation' : '', message:'' });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try{
      await api.createContact(formData);
      setSubmitted(true);
    }catch(er: unknown){ setErr(errorMessage(er) || 'Failed to send message'); }
    finally{ setBusy(false); }
  };

  const contactInfo = [
    { label: 'Address', value: 'Lower Manya Krobo Municipality, Eastern Region, Ghana' },

    { label: 'Email', value: 'info@lawerandlawers.org' },
    { label: 'Hours', value: 'Monday - Friday: 9:00 AM - 5:00 PM (GMT)' },
  ];

  return (
    <>
      <Section background="primary">
        <Container>
          <Heading level={1} className="text-white">Contact Us</Heading>
          <Text size="lg" color="light" className="mt-4 max-w-2xl">Need education support, sponsorship, or a trained house help? Get in touch — Lower Manya Krobo, Eastern Region, Ghana.</Text>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <Heading level={2}>Get in Touch</Heading>
              <Text size="lg" className="mt-4">We are here to help — whether you want to sponsor an orphan, empower a widow, hire a caregiver, volunteer or partner with us.</Text>
              <div className="mt-8 space-y-6">
                {contactInfo.map((info) => (
                  <div key={info.label}>
                    <Text className="font-semibold text-[#2C5F2D]">{info.label}</Text>
                    <Text>{info.value}</Text>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Text className="font-semibold text-[#2C5F2D]">Support & Sponsorship</Text>
                <Text>For donation payment details, select Donation Inquiry in the form and send your request to the administrator.</Text>
              </div>

            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-[#97BC62] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <Heading level={3}>Thank You!</Heading>
                  <Text className="mt-4">Your message has been received. Our administrator will contact you using the details you provided.</Text>
                  <Button className="mt-6" onClick={()=>{setSubmitted(false); setFormData({name:'',email:'',phone:'',subject:'',message:''});}}>Send Another Message</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Heading level={3}>Send us a Message</Heading>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input type="text" id="name" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C5F2D] focus:border-transparent" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input type="email" id="email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C5F2D] focus:border-transparent" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" id="phone" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C5F2D] focus:border-transparent" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                    <select id="subject" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C5F2D] focus:border-transparent" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}>
                      <option value="">Select a subject</option>
                      <option value="orphan-sponsorship">Orphan Sponsorship / Education</option>
                      <option value="widow-support">Widow / Single Mother Support</option>
                      <option value="caregiver-househelp">Hire a House Help / Caregiver</option>
                      <option value="volunteer">Volunteering</option>
                      <option value="donation">Donation Inquiry</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                    <textarea id="message" rows={4} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C5F2D] focus:border-transparent" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                  </div>
                  {err && <Text className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{err}</Text>}
                  <Button type="submit" disabled={busy} className="w-full">{busy ? 'Sending...' : 'Send Message'}</Button>
                </form>
              )}
            </div>
          </div>
        </Container>
      </Section>

      <Section background="neutral">
        <Container>
          <div className="bg-[#EDF4F2] rounded-xl h-64 flex items-center justify-center">
            <Text color="muted">Map Placeholder</Text>
          </div>
        </Container>
      </Section>
    </>
  );
}
