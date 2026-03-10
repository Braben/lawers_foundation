'use client';

import { Container, Section, Heading, Text, Card, CardTitle, CardContent, Button, FadeIn, Stagger, StaggerItem, ScaleIn, CountUp, LazyImage } from '@/components/ui';
import Link from 'next/link';

const programs = [
  {
    id: 'free-legal-aid',
    slug: 'free-legal-aid',
    title: 'Free Legal Aid',
    icon: '⚖️',
    shortDescription: 'Providing free legal representation and consultation to those who cannot afford legal services.',
    fullDescription: 'Our Free Legal Aid program is the cornerstone of our work. We believe that financial constraint should never be a barrier to justice. Our team of dedicated lawyers provides comprehensive legal support to women and children who cannot afford legal services. From initial consultation to court representation, we guide our clients through every step of the legal process.',
    features: [
      'Court representation in civil and criminal cases',
      'Legal consultation and advice',
      'Document preparation and review',
      'Case management and follow-up',
      'Alternative dispute resolution',
      'Legal aid awareness in communities',
    ],
    impactStats: [
      { value: '5,000+', label: 'Cases Supported' },
      { value: '3,500+', label: 'Legal Consultations' },
      { value: '1,200+', label: 'Court Hearings Attended' },
      { value: '85%', label: 'Success Rate' },
    ],
  },
  {
    id: 'legal-awareness',
    slug: 'legal-awareness',
    title: 'Legal Awareness Programs',
    icon: '📚',
    shortDescription: 'Educational programs to help communities understand their legal rights and how to access justice.',
    fullDescription: 'Knowledge is power. Our Legal Awareness Programs are designed to empower communities with knowledge about their legal rights. Through workshops, campaigns, and educational materials, we reach thousands of people each year, particularly women and children who are often unaware of the protections available to them under the law.',
    features: [
      'Community workshops and seminars',
      'School and college programs',
      'Legal literacy campaigns',
      'Training for grassroots workers',
      'Multilingual educational materials',
      'Digital awareness content',
    ],
    impactStats: [
      { value: '50,000+', label: 'People Reached' },
      { value: '500+', label: 'Workshops Conducted' },
      { value: '200+', label: 'Communities Covered' },
      { value: '25', label: 'Languages Supported' },
    ],
  },
  {
    id: 'rehabilitation-support',
    slug: 'rehabilitation-support',
    title: 'Rehabilitation Support',
    icon: '🤝',
    shortDescription: 'Comprehensive support services for survivors of violence and trauma.',
    fullDescription: 'Recovery from trauma requires more than just legal support. Our Rehabilitation Program provides holistic care to survivors of violence, including counseling, shelter support, vocational training, and referral services. We work to restore dignity and independence to those who have suffered.',
    features: [
      'Professional counseling services',
      'Shelter and housing support',
      'Vocational training programs',
      'Medical referral network',
      'Psychological support groups',
      'Long-term reintegration assistance',
    ],
    impactStats: [
      { value: '2,000+', label: 'Survivors Supported' },
      { value: '500+', label: 'Counseling Sessions' },
      { value: '300+', label: 'Vocational Trainings' },
      { value: '90%', label: 'Reintegration Success' },
    ],
  },
  {
    id: 'policy-advocacy',
    slug: 'policy-advocacy',
    title: 'Policy Advocacy',
    icon: '📢',
    shortDescription: 'Working to create systemic change through research and policy advocacy.',
    fullDescription: 'Individual cases are important, but systemic change is essential for lasting impact. Our Policy Advocacy team works at the local, national, and international levels to push for laws and policies that better protect women and children. Through research, coalition building, and advocacy, we strive to create a more just legal system.',
    features: [
      'Policy research and analysis',
      'Legislative advocacy',
      'Public awareness campaigns',
      'Coalition building with NGOs',
      'Government liaison and engagement',
      'International human rights reporting',
    ],
    impactStats: [
      { value: '15+', label: 'Policy Recommendations' },
      { value: '30+', label: 'Coalition Partners' },
      { value: '5', label: 'Policy Changes Influenced' },
      { value: '100+', label: 'Advocacy Reports' },
    ],
  },
  {
    id: 'child-protection',
    slug: 'child-protection',
    title: 'Child Protection',
    icon: '👶',
    shortDescription: 'Dedicated services to protect and support children in vulnerable situations.',
    fullDescription: 'Children are our most vulnerable population. Our Child Protection program works to safeguard children from abuse, exploitation, and neglect. We provide legal representation for children in court, work with child welfare agencies, and run preventive programs to keep children safe.',
    features: [
      'Legal representation for children',
      'Child welfare case management',
      'Prevention of child labor',
      'Child trafficking awareness',
      'School safety programs',
      'Foster care support',
    ],
    impactStats: [
      { value: '1,500+', label: 'Children Protected' },
      { value: '200+', label: 'Court Cases' },
      { value: '50+', label: 'Schools Covered' },
      { value: '100%', label: 'Safety Outcomes' },
    ],
  },
  {
    id: 'women-empowerment',
    slug: 'women-empowerment',
    title: 'Women Empowerment',
    icon: '💪',
    shortDescription: 'Empowering women with legal knowledge and skills to assert their rights.',
    fullDescription: 'Empowerment begins with knowledge. Our Women Empowerment program goes beyond legal aid to help women understand and assert their rights. Through training programs, support groups, and economic empowerment initiatives, we help women become agents of change in their communities.',
    features: [
      'Rights awareness training',
      'Leadership development',
      'Economic empowerment programs',
      'Self-help groups formation',
      'Entrepreneurship support',
      'Digital literacy training',
    ],
    impactStats: [
      { value: '10,000+', label: 'Women Empowered' },
      { value: '500+', label: 'Self-Help Groups' },
      { value: '1,000+', label: 'Leadership Trained' },
      { value: '80%', label: 'Economic Improvement' },
    ],
  },
];

export default function ProgramsPage() {
  return (
    <>
      <Section background="primary">
        <Container>
          <FadeIn>
            <Heading level={1} className="text-white">Our Programs</Heading>
          </FadeIn>
          <FadeIn delay={0.2}>
            <Text size="lg" color="light" className="mt-4 max-w-2xl">
              Comprehensive programs designed to bring justice, protection, and empowerment 
              to women and children in need.
            </Text>
          </FadeIn>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="text-center mb-12">
            <FadeIn>
              <Heading level={2}>Our Impact at a Glance</Heading>
            </FadeIn>
            <FadeIn delay={0.2}>
              <Text size="lg" className="mt-4 max-w-3xl mx-auto">
                Through our various programs, we have made significant strides in bringing 
                justice and support to those who need it most.
              </Text>
            </FadeIn>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: 75000, suffix: '+', label: 'Lives Impacted' },
              { value: 15, suffix: '+', label: 'Years of Service' },
              { value: 500, suffix: '+', label: 'Partner Organizations' },
              { value: 25, suffix: '', label: 'States Covered' },
            ].map((stat, index) => (
              <FadeIn key={stat.label} delay={0.1 * index}>
                <div className="bg-[#EDF4F2] rounded-xl p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[#2C5F2D]">
                    <CountUp end={stat.value} suffix={stat.suffix} />
                  </div>
                  <Text className="mt-2 text-sm">{stat.label}</Text>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      {programs.map((program, index) => (
        <Section
          key={program.id}
          background={index % 2 === 0 ? 'white' : 'neutral'}
          id={program.id}
        >
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <FadeIn direction={index % 2 === 0 ? 'right' : 'left'}>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl" role="img" aria-hidden="true">
                      {program.icon}
                    </span>
                    <Heading level={2} className="mb-0">{program.title}</Heading>
                  </div>
                  <Text size="lg" className="mb-6">
                    {program.fullDescription}
                  </Text>
                  
                  <Heading level={4} className="mb-4">Key Features</Heading>
                  <ul className="space-y-3 mb-8">
                    {program.features.map((feature, fIndex) => (
                      <FadeIn key={feature} direction="left" delay={0.05 * fIndex}>
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-[#97BC62] rounded-full mt-2 flex-shrink-0" aria-hidden="true" />
                          <Text>{feature}</Text>
                        </li>
                      </FadeIn>
                    ))}
                  </ul>
                  
                  <Link href="/get-involved">
                    <Button>Support This Program</Button>
                  </Link>
                </div>
              </FadeIn>
              
              <FadeIn direction={index % 2 === 0 ? 'left' : 'right'} delay={0.2}>
                <ScaleIn>
                  <Card className="bg-[#EDF4F2] border-2 border-[#97BC62]">
                    <CardTitle as="h3" className="text-center">Our Impact</CardTitle>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {program.impactStats.map((stat, sIndex) => (
                        <FadeIn key={stat.label} delay={0.1 * sIndex}>
                          <div className="text-center p-4 bg-white rounded-lg">
                            <div className="text-2xl md:text-3xl font-bold text-[#2C5F2D]">
                              {stat.value}
                            </div>
                            <Text className="text-xs mt-1">{stat.label}</Text>
                          </div>
                        </FadeIn>
                      ))}
                    </div>
                  </Card>
                </ScaleIn>
              </FadeIn>
            </div>
          </Container>
        </Section>
      ))}

      <Section background="secondary">
        <Container>
          <div className="text-center">
            <FadeIn>
              <Heading level={2} className="text-[#1a1a1a]">Partner with Us</Heading>
            </FadeIn>
            <FadeIn delay={0.2}>
              <Text size="lg" className="mt-4 mb-8 max-w-2xl mx-auto text-[#1a1a1a]">
                Join forces with us to expand our impact. Whether you're a corporation, 
                NGO, or government agency, we can work together to bring justice to more people.
              </Text>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button variant="primary" size="lg">Become a Partner</Button>
                </Link>
                <Link href="/get-involved">
                  <Button variant="outline" size="lg" className="border-[#1a1a1a] text-[#1a1a1a]">
                    Donate Now
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </Container>
      </Section>
    </>
  );
}
