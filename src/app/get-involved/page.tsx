import { Container, Section, Heading, Text, Card, CardTitle, CardContent, Button } from '@/components/ui';
import Link from 'next/link';

const involvementOptions = [
  {
    title: 'Donate',
    description: 'Your financial support helps us provide free legal aid to those who need it most.',
    details: [
      'One-time donations',
      'Monthly giving',
      'Corporate partnerships',
      'Fundraising events',
    ],
    cta: 'Donate Now',
  },
  {
    title: 'Volunteer',
    description: 'Join our team of dedicated volunteers and make a difference in your community.',
    details: [
      'Legal professionals',
      'Social workers',
      'Students',
      'General volunteers',
    ],
    cta: 'Apply to Volunteer',
  },
  {
    title: 'Partner',
    description: 'Collaborate with us to expand our reach and impact.',
    details: [
      'NGOs and civil society',
      'Corporate social responsibility',
      'Government programs',
      'Educational institutions',
    ],
    cta: 'Partner With Us',
  },
];

export default function GetInvolvedPage() {
  return (
    <>
      <Section background="primary">
        <Container>
          <Heading level={1} className="text-white">Get Involved</Heading>
          <Text size="lg" color="light" className="mt-4 max-w-2xl">
            Join us in our mission to bring justice to every woman and child. 
            There are many ways to make a difference.
          </Text>
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
                  <Button className="w-full">{option.cta}</Button>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="neutral">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Heading level={2}>Other Ways to Help</Heading>
              <ul className="mt-6 space-y-4">
                {[
                  'Spread awareness about our work',
                  'Host a fundraising event',
                  'Provide pro bono legal services',
                  'Donate office supplies or equipment',
                  'Offer professional services',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-[#2C5F2D] rounded-full" aria-hidden="true" />
                    <Text>{item}</Text>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#EDF4F2] rounded-xl h-64 flex items-center justify-center">
              <Text color="muted">Get Involved Image</Text>
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading level={2} align="center">Frequently Asked Questions</Heading>
          <div className="mt-8 space-y-6 max-w-3xl mx-auto">
            {[
              {
                q: 'How are donations used?',
                a: 'Your donations directly fund legal aid services, awareness programs, and rehabilitation support for women and children in need.',
              },
              {
                q: 'Can I volunteer remotely?',
                a: 'Yes, we offer remote volunteering opportunities including legal research, translation services, and online awareness campaigns.',
              },
              {
                q: 'How do I apply to volunteer?',
                a: 'Fill out our volunteer application form, and our team will contact you within 48 hours.',
              },
            ].map((faq) => (
              <Card key={faq.q}>
                <CardTitle as="h3" className="text-lg">{faq.q}</CardTitle>
                <CardContent>
                  <Text>{faq.a}</Text>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="secondary">
        <Container>
          <div className="text-center">
            <Heading level={2} className="text-[#1a1a1a]">Ready to Make a Difference?</Heading>
            <Text size="lg" className="mt-4 mb-8 max-w-2xl mx-auto text-[#1a1a1a]">
              Contact us today to learn more about how you can get involved.
            </Text>
            <Link href="/contact">
              <Button variant="primary" size="lg">Contact Us</Button>
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
