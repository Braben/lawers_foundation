import { Container, Section, Heading, Text, Card, CardTitle, CardContent, Button } from '@/components/ui';

const programs = [
  {
    id: 'legal-aid',
    title: 'Free Legal Aid',
    description: 'We provide free legal representation and consultation to those who cannot afford legal services.',
    features: [
      'Court representation',
      'Legal consultation',
      'Document preparation',
      'Case management',
    ],
  },
  {
    id: 'awareness',
    title: 'Legal Awareness Programs',
    description: 'Educational programs to help communities understand their legal rights and how to access justice.',
    features: [
      'Community workshops',
      'School programs',
      'Legal literacy campaigns',
      'Training for grassroots workers',
    ],
  },
  {
    id: 'rehabilitation',
    title: 'Rehabilitation Support',
    description: 'Comprehensive support services for survivors of violence and trauma.',
    features: [
      'Counseling services',
      'Shelter support',
      'Vocational training',
      'Referral networks',
    ],
  },
  {
    id: 'advocacy',
    title: 'Policy Advocacy',
    description: 'Working to create systemic change through research and policy advocacy.',
    features: [
      'Policy research',
      'Legislative advocacy',
      'Public campaigns',
      'Coalition building',
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
            Our comprehensive programs address the legal needs of vulnerable women and children.
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
            <Heading level={2} className="text-[#1a1a1a]">Need Legal Assistance?</Heading>
            <Text size="lg" className="mt-4 mb-8 max-w-2xl mx-auto text-[#1a1a1a]">
              If you or someone you know needs legal help, please reach out to us. 
              Our team is here to support you.
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
