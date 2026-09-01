import { Container, Section, Heading, Text, Card, CardTitle, CardContent } from '@/components/ui';

export default function AboutPage() {
  return (
    <>
      <Section background="primary">
        <Container>
          <Heading level={1} className="text-white">About Lawer and Lawers Foundation</Heading>
          <Text size="lg" color="light" className="mt-4 max-w-2xl">
            From a Family Support Project in the early 2000s to a formal Foundation — winning souls for Christ and helping deprived children, especially orphans, in Lower Manya Krobo, Eastern Region, Ghana.
          </Text>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Heading level={2}>Our Story</Heading>
              <Text size="lg" className="mt-4">
                Started as a Family Support Project providing financial and material support to students — especially secondary and tertiary — and training underprivileged in trades and micro-business for women.
              </Text>
              <Text className="mt-4">
                As more people sought help following our track record, the need for higher interventions grew. Many from the initial group are now well-established, contributing to community and national development — monumental testimonies to the Foundation. Operating informally at first, we recently formalised to expand programmes and reach more people.
              </Text>
              <Text className="mt-4">
                Today orphans from this project are in various levels of formal and informal education across Ghana, with some studying outside the country. We work in Lower Manya Krobo Municipality where many communities lack social safety nets.
              </Text>
            </div>
            <div className="bg-[#EDF4F2] rounded-xl h-80 flex items-center justify-center">
              <Text color="muted">Family Support Project — since early 2000s</Text>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="neutral">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white">
              <CardTitle as="h3">Vision</CardTitle>
              <CardContent>
                To create a world where everyone has access to quality education and skills training, enabling them to acquire the necessary skills and knowledge to succeed in their careers for holistic sustainable livelihood and contribute effectively to economic growth and national development.
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardTitle as="h3">Mission</CardTitle>
              <CardContent>
                To become a premier hub for training, character education, and employment opportunities in Ghana, empowering vulnerable individuals, particularly those from disadvantaged background with relevant skills and knowledge to secure meaningful employment or start their own businesses for sustainable livelihoods and to enhance human development.
              </CardContent>
            </Card>
          </div>
          <div className="mt-8">
            <Heading level={3}>Main Objective</Heading>
            <Text className="mt-2">To empower vulnerable populations in the project area through Education, Economic empowerment and social support for holistic human development.</Text>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading level={2} align="center">Our Values</Heading>
          <Text size="lg" className="mt-4 max-w-2xl mx-auto text-center">
            Specific core values: to win souls for Christ and to help deprived children especially orphans.
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <Card>
              <CardTitle as="h3">Human Dignity</CardTitle>
              <CardContent>
                Every child has a right to stay alive and to receive good care — equal opportunities whether parents are alive or not.
              </CardContent>
            </Card>
            <Card>
              <CardTitle as="h3">Accountability & Loyalty</CardTitle>
              <CardContent>
                Transparent stewardship of resources, faithful to our beneficiaries, partners and communities in Lower Manya Krobo and beyond.
              </CardContent>
            </Card>
            <Card>
              <CardTitle as="h3">Love for All Humans Regardless</CardTitle>
              <CardContent>
                Rooted in the Love of Jesus, we extend hope to orphans, widows, single mothers, caregivers and persons with disabilities.
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <Card>
              <CardTitle as="h3">Why We Exist — Justification</CardTitle>
              <CardContent>
                The extended family system can no longer absorb every child; socio-economic pressures leave deprived children facing child labour, prostitution and other vices. We provide the missing safety net.
              </CardContent>
            </Card>
            <Card>
              <CardTitle as="h3">Future Plans</CardTitle>
              <CardContent>
                Build a city to serve as shelter for vulnerable children, youth, women, men and disabled; provide wholistic care from pre-school to tertiary; monthly assistance for widows/old people; and a hub for house and other helps.
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      <Section background="neutral">
        <Container>
          <Heading level={2}>Strategic Objectives</Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <Card>
              <CardTitle as="h3">Education & Empowerment</CardTitle>
              <CardContent>Provide educational support and vocational training to 150 orphans, enhancing future prospects, with counselling for career enhancement.</CardContent>
            </Card>
            <Card>
              <CardTitle as="h3">Economic Empowerment</CardTitle>
              <CardContent>Train and support 50 widows and single mothers in entrepreneurship, promoting economic independence.</CardContent>
            </Card>
            <Card>
              <CardTitle as="h3">Social Support</CardTitle>
              <CardContent>Offer social support and community outreach to 200 beneficiaries fostering belonging and resilience.</CardContent>
            </Card>
            <Card>
              <CardTitle as="h3">Sustainability</CardTitle>
              <CardContent>Establish partnerships and income-generating activities to ensure long-term impact and growth.</CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading level={2}>Our Team & Approach</Heading>
          <Text size="lg" className="mt-4 max-w-2xl">
            We identify and confirm orphaned children and widows, liaise with headmasters, train caregivers with professionals, run exposure visits, awareness workshops and well-structured counselling — with Christian role models guiding young people.
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {[
              { name: 'Board & Management', role: 'Governance & Vision' },
              { name: 'Caregiver Trainers', role: 'Professional Care Training' },
              { name: 'Community Volunteers', role: 'Outreach & Mentorship' },
            ].map((member) => (
              <div key={member.name} className="text-center">
                <div className="bg-[#EDF4F2] rounded-xl h-48 mb-4 flex items-center justify-center">
                  <Text color="muted">Photo</Text>
                </div>
                <Heading level={4} as="h3">{member.name}</Heading>
                <Text color="secondary">{member.role}</Text>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
