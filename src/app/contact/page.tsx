'use client';

import { useState, FormEvent } from 'react';
import { Container, Section, Heading, Text, Button } from '@/components/ui';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const contactInfo = [
    { label: 'Address', value: '123 Legal Avenue, New Delhi, India' },
    { label: 'Phone', value: '+91 98765 43210' },
    { label: 'Email', value: 'info@lawersfoundation.org' },
    { label: 'Hours', value: 'Monday - Friday: 9:00 AM - 6:00 PM' },
  ];

  return (
    <>
      <Section background="primary">
        <Container>
          <Heading level={1} className="text-white">Contact Us</Heading>
          <Text size="lg" color="light" className="mt-4 max-w-2xl">
            Have questions or need legal assistance? Get in touch with us.
          </Text>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <Heading level={2}>Get in Touch</Heading>
              <Text size="lg" className="mt-4">
                We are here to help. Whether you need legal assistance, want to 
                volunteer, or have questions about our programs, please reach out.
              </Text>

              <div className="mt-8 space-y-6">
                {contactInfo.map((info) => (
                  <div key={info.label}>
                    <Text className="font-semibold text-[#2C5F2D]">{info.label}</Text>
                    <Text>{info.value}</Text>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Text className="font-semibold text-[#2C5F2D]">Emergency Legal Aid</Text>
                <Text>
                  For urgent legal assistance, call our 24/7 helpline: +91 98765 43210
                </Text>
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
                  <Text className="mt-4">
                    Your message has been received. We will get back to you within 24-48 hours.
                  </Text>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Heading level={3}>Send us a Message</Heading>
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C5F2D] focus:border-transparent"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C5F2D] focus:border-transparent"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C5F2D] focus:border-transparent"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C5F2D] focus:border-transparent"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="">Select a subject</option>
                      <option value="legal-aid">Legal Aid Request</option>
                      <option value="volunteer">Volunteering</option>
                      <option value="donation">Donation Inquiry</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C5F2D] focus:border-transparent"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
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
