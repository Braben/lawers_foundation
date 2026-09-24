'use client';
import { FormVerification } from '@/components/FormVerification';
import { errorMessage } from '@/lib/api';
import { useEffect, useState } from 'react';
import { Container, Section, Heading, Text, Card, CardTitle, CardContent, Button } from '@/components/ui';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { CurrencySettings } from '@/types';

const involvementOptions = [
  {
    title: 'Donate / Sponsor',
    description: 'Your support can change a life and shape the future of many — giving a vulnerable child or young single parent education, nutrition, health care, shelter, clothing and financial aid.',
    details: ['Sponsor education (pre-school to tertiary)','Provide nutrition, health care & shelter','Monthly assistance for widows & elderly','Fund a future city for vulnerable groups'],
    cta: 'Donate Now',
  },
  {
    title: 'Volunteer',
    description: 'Join mentors, trainers and community volunteers helping orphans, widows and caregivers.',
    details: ['Tutoring and mentorship','Skills training (sewing, baking, digital)','Counselling & art therapy facilitation','Community outreach & advocacy'],
    cta: 'Apply to Volunteer',
  },
  {
    title: 'Partner',
    description: 'Build partnership with government, private sector and CSOs to leverage resources, expertise and funding for sustainable impact.',
    details: ['Government & CSO partnerships','Corporate social responsibility','Educational institutions','House-help hub development'],
    cta: 'Partner With Us',
  },
];

export default function GetInvolvedPage() {
  const [donation, setDonation] = useState({ name:'', email:'', phone:'', amount:'', program:'orphan-support', frequency:'once', message:'' });
  const [currencies,setCurrencies]=useState<CurrencySettings|null>(null);
  const [currency,setCurrency]=useState('');
  useEffect(()=>{api.getCurrencies().then(settings=>{setCurrencies(settings);setCurrency(settings.defaultCurrency);}).catch(e=>setDonateErr(errorMessage(e)));},[]);
  const [verificationToken, setVerificationToken] = useState('');
  const [verificationReset, setVerificationReset] = useState(0);
  const [donating, setDonating] = useState(false);
  const [donateMsg, setDonateMsg] = useState('');
  const [donateErr, setDonateErr] = useState('');

  const handleDonate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDonateMsg(''); setDonateErr(''); setDonating(true);
    try{
      await api.createDonation({ name: donation.name, email: donation.email, phone: donation.phone, amount: Number(donation.amount), currency, program: donation.program, frequency: donation.frequency, message: donation.message, verificationToken, website: new FormData(e.currentTarget).get('website') });
      setDonateMsg('Thank you! Your pledge was received. Please contact the administrator using the link below for payment details. No payment has been collected.');
      setDonation({ name:'', email:'', phone:'', amount:'', program:'orphan-support', frequency:'once', message:'' });
    }catch(er: unknown){ setDonateErr(errorMessage(er) || 'Failed to submit donation'); }
    finally{ setDonating(false); setVerificationToken(''); setVerificationReset(v=>v+1); }
  };

  return (
    <>
      <Section background="primary">
        <Container>
          <Heading level={1} className="text-white">Get Involved</Heading>
          <Text size="lg" color="light" className="mt-4 max-w-2xl">Donate, Volunteer or spread the word — help orphans fully supported in Lower Manya Krobo and beyond break cycles of poverty.</Text>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading level={2} align="center">Ways to Contribute</Heading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {involvementOptions.map((option) => (
              <Card key={option.title} className="flex flex-col">
                <CardTitle as="h3">{option.title}</CardTitle>
                <CardContent className="flex-grow">
                  <Text>{option.description}</Text>
                  <ul className="mt-4 space-y-2">
                    {option.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 bg-[#97BC62] rounded-full" aria-hidden="true" />
                        <Text className="text-sm">{detail}</Text>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <div className="mt-6">
                  {option.title === 'Donate / Sponsor' ? (
                    <a href="#donate-form"><Button className="w-full">{option.cta}</Button></a>
                  ) : (
                    <Link href="/contact"><Button className="w-full">{option.cta}</Button></Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="neutral" id="donate-form">
        <Container>
          <Heading level={2} align="center">Donate / Sponsor</Heading>
          <Text className="text-center mt-2 max-w-2xl mx-auto">Leave a donation pledge, then contact our administrator for payment details. Payments are arranged directly with the foundation.</Text>
          <form onSubmit={handleDonate} className="max-w-2xl mx-auto mt-8 bg-white rounded-xl shadow p-6 space-y-4">
            <label className="block text-sm font-medium">Currency<select required disabled={!currencies} value={currency} onChange={e=>setCurrency(e.target.value)} className="block mt-1 w-full px-4 py-2 border rounded-lg"><option value="" disabled>Select currency</option>{currencies?.currencies.map(c=><option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}</select></label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input required value={donation.name} onChange={e=>setDonation({...donation, name:e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2C5F2D]" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input required type="email" value={donation.email} onChange={e=>setDonation({...donation, email:e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2C5F2D]" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input value={donation.phone} onChange={e=>setDonation({...donation, phone:e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2C5F2D]" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount ({currency}) *</label>
                <input required type="number" min="0.001" step={currency ? 1 / 10 ** (new Intl.NumberFormat('en', { style:'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2) : 0.01} value={donation.amount} onChange={e=>setDonation({...donation, amount:e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2C5F2D]" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Program</label>
                <select value={donation.program} onChange={e=>setDonation({...donation, program:e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2C5F2D]">
                  <option value="orphan-support">Orphan Support</option>
                  <option value="women-empowerment">Women&apos;s Empowerment</option>
                  <option value="house-help-caregiver">House Helps & Caregivers</option>
                  <option value="education-child-development">Education & Child Development</option>
                  <option value="healthcare-wellbeing">Healthcare & Wellbeing</option>
                  <option value="economic-empowerment">Economic Empowerment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Frequency</label>
                <select value={donation.frequency} onChange={e=>setDonation({...donation, frequency:e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2C5F2D]">
                  <option value="once">Once</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message (optional)</label>
              <textarea rows={3} value={donation.message} onChange={e=>setDonation({...donation, message:e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2C5F2D]" />
            </div>
            <FormVerification action="pledge" onToken={setVerificationToken} resetKey={verificationReset} />
<Button type="submit" disabled={donating || !currencies || !currency || !verificationToken} className="w-full">{donating ? 'Submitting...' : 'Submit Pledge'}</Button>
            {donateMsg && <Text className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">{donateMsg}</Text>}
            {donateErr && <Text className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{donateErr}</Text>}
            <Text className="text-xs text-gray-500 text-center"><Link href="/contact?subject=donation" className="underline">Contact the administrator for payment details</Link>. We do not collect payments on this website.</Text>
          </form>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading level={2} align="center">Frequently Asked Questions</Heading>
          <div className="mt-8 space-y-6 max-w-3xl mx-auto">
            {[
              { q: 'How are donations used?', a: 'Donations fund education (scholarships, books, tutoring), nutrition, health care, shelter, clothing and financial aid for orphans; vocational training and micro-business start-up kits for widows and single mothers; and caregiver training.' },
              { q: 'Can I sponsor a specific child or widow?', a: 'Yes — you can sponsor education from pre-school to tertiary or provide monthly assistance to widows and elderly women. Contact us to be matched.' },
              { q: 'How do I request a trained house help?', a: 'We vet and train 30 caregivers in first aid, childcare, geriatrics, etiquette and life skills — then connect them to households. Contact us to hire a reliable helper.' },
            ].map((faq) => (
              <Card key={faq.q}>
                <CardTitle as="h3" className="text-lg">{faq.q}</CardTitle>
                <CardContent><Text>{faq.a}</Text></CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="secondary">
        <Container>
          <div className="text-center">
            <Heading level={2} className="text-[#1a1a1a]">Ready to Make a Difference?</Heading>
            <Text size="lg" className="mt-4 mb-8 max-w-2xl mx-auto text-[#1a1a1a]">Education, health care, shelter or a trained caregiver — your support nurtures God-fearing, disciplined children and sustainable livelihoods.</Text>
            <Link href="/contact"><Button variant="primary" size="lg">Contact Us</Button></Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
