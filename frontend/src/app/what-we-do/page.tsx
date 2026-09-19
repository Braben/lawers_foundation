import { Container, Section, Heading, Text, Button } from '@/components/ui';

const programs = [
  {
    id: 'education-child-development',
    title: 'Education & Child Development',
    description: 'Scholarships, books and tutoring from pre-school to tertiary — plus counselling to help orphans pursue education through the Love of Jesus.',
    features: [
      'Scholarships & material support',
      'Tutoring and school liaison',
      'Mentorship by Christian role models',
      'Art & therapy sessions',
    ],
  },
  {
    id: 'women-empowerment',
    title: 'Women & Youth Economic Empowerment',
    description: 'Vocational skills and micro-business support for widows, single mothers and youth to live sustainably.',
    features: [
      'Sewing, baking, hairdressing, computer literacy',
      'Entrepreneurship & start-up kits',
      'Digital skills for the digital economy',
      'Monthly assistance for widows',
    ],
  },
  {
    id: 'house-help-caregiver',
    title: 'House Helps & Caregiver Training',
    description: 'Reliable, trained house helps and caregivers for homes needing cleaning, cooking, childcare and elderly care.',
    features: [
      'First aid & life skills training',
      'Childcare & geriatrics care',
      'Etiquette and wellbeing',
      'Household placement hub',
    ],
  },
  {
    id: 'community-health',
    title: 'Healthcare, Wellbeing & Community',
    description: 'Health care provision, psychosocial support and community outreach to foster belonging and resilience.',
    features: [
      'Health care referrals',
      'Counselling and support groups',
      'Community events & advocacy',
      'Persons with Disabilities support',
    ],
  },
];

export default function WhatWeDoPage() {
  return (
    <>
      <Section background="primary">
        <Container>
          <Heading level={1} className="text-white">What We Do</Heading>
          <Text size="lg" color="light" className="mt-4 max-w-2xl">
            Empowering orphans, widows, single mothers and caregivers in Lower Manya Krobo, Eastern Region, Ghana through education, skills training and sustainable livelihoods.
          </Text>
        </Container>
      </Section>

      {programs.map((program, index) => (
        <Section
          key={program.id}
          background={index % 2 === 0 ? 'white' : 'neutral'}
          id={program.id}
        >
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Heading level={2}>{program.title}</Heading>
                <Text size="lg" className="mt-4">
                  {program.description}
                </Text>
                <ul className="mt-6 space-y-3">
                  {program.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-[#97BC62] rounded-full" aria-hidden="true" />
                      <Text>{feature}</Text>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#EDF4F2] rounded-xl h-80 flex items-center justify-center">
                <Text color="muted">{program.title} Image</Text>
              </div>
            </div>
          </Container>
        </Section>
      ))}

      <Section background="secondary">
        <Container>
          <div className="text-center">
            <Heading level={2} className="text-[#1a1a1a]">Need Support or Want to Help?</Heading>
            <Text size="lg" className="mt-4 mb-8 max-w-2xl mx-auto text-[#1a1a1a]">
              Whether you are an orphan, widow, caregiver seeking training, or a family needing a trusted house help — we are here to support you.
            </Text>
            <Button variant="primary" size="lg">
              Contact Us
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
