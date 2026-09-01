import { Container, Section, Heading, Text, Card, CardTitle, CardContent, Button } from '@/components/ui';
import Link from 'next/link';

const involvementOptions = [
  {
    title: 'Donate / Sponsor',
    description: 'Your support can change a life and shape the future of many — giving a vulnerable child or young single parent education, nutrition, health care, shelter, clothing and financial aid.',
    details: [
      'Sponsor education (pre-school to tertiary)',
      'Provide nutrition, health care & shelter',
      'Monthly assistance for widows & elderly',
      'Fund a future city for vulnerable groups',
    ],
    cta: 'Donate Now',
  },
  {
    title: 'Volunteer',
    description: 'Join mentors, trainers and community volunteers helping orphans, widows and caregivers.',
    details: [
      'Tutoring and mentorship',
      'Skills training (sewing, baking, digital)',
      'Counselling & art therapy facilitation',
      'Community outreach & advocacy',
    ],
    cta: 'Apply to Volunteer',
  },
  {
    title: 'Partner',
    description: 'Build partnership with government, private sector and CSOs to leverage resources, expertise and funding for sustainable impact.',
    details: [
      'Government & CSO partnerships',
      'Corporate social responsibility',
      'Educational institutions',
      'House-help hub development',
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
            Donate, Volunteer or spread the word — help orphans fully supported in Lower Manya Krobo and beyond break cycles of poverty.
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
                  'Spread awareness about our work in communities',
                  'Hire a trained, reliable house help / caregiver',
                  'Host a fundraising or visibility event',
                  'Provide pro bono professional services',
                  'Donate clothing, books or start-up kits',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-[#2C5F2D] rounded-full" aria-hidden="true" />
                    <Text>{item}</Text>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#EDF4F2] rounded-xl h-64 flex items-center justify-center">
              <Text color="muted">Change a Life Today — Lower Manya Krobo</Text>
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
                a: 'Donations fund education (scholarships, books, tutoring), nutrition, health care, shelter, clothing and financial aid for orphans; vocational training and micro-business start-up kits for widows and single mothers; and caregiver training.',
              },
              {
                q: 'Can I sponsor a specific child or widow?',
                a: 'Yes — you can sponsor education from pre-school to tertiary or provide monthly assistance to widows and elderly women. Contact us to be matched.',
              },
              {
                q: 'How do I request a trained house help?',
                a: 'We vet and train 30 caregivers in first aid, childcare, geriatrics, etiquette and life skills — then connect them to households. Contact us to hire a reliable helper.',
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
              Education, health care, shelter or a trained caregiver — your support nurtures God-fearing, disciplined children and sustainable livelihoods.
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
