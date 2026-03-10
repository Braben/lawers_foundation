import { Container, Section, Heading, Text, Card, CardTitle, CardContent } from '@/components/ui';

export default function AboutPage() {
  return (
    <>
      <Section background="primary">
        <Container>
          <Heading level={1} className="text-white">About Us</Heading>
          <Text size="lg" color="light" className="mt-4 max-w-2xl">
            Learn about our journey and commitment to justice for all.
          </Text>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Heading level={2}>Our Story</Heading>
              <Text size="lg" className="mt-4">
                Lawers Foundation was established with a vision to make legal 
                justice accessible to everyone, regardless of their socioeconomic 
                status. We believe that knowledge of the law is the first step 
                towards empowerment.
              </Text>
              <Text className="mt-4">
                Our founders, a group of legal professionals and social workers, 
                recognized the desperate need for legal support among marginalized 
                communities. What started as a small legal aid clinic has grown 
                into a comprehensive organization serving thousands each year.
              </Text>
            </div>
            <div className="bg-[#EDF4F2] rounded-xl h-80 flex items-center justify-center">
              <Text color="muted">Our Story Image</Text>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="neutral">
        <Container>
          <Heading level={2} align="center">Our Values</Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            <Card>
              <CardTitle as="h3">Integrity</CardTitle>
              <CardContent>
                We uphold the highest ethical standards in all our interactions 
                with clients, partners, and communities.
              </CardContent>
            </Card>
            <Card>
              <CardTitle as="h3">Compassion</CardTitle>
              <CardContent>
                We approach every case with empathy and understanding, recognizing 
                the human dignity of all we serve.
              </CardContent>
            </Card>
            <Card>
              <CardTitle as="h3">Excellence</CardTitle>
              <CardContent>
                We strive for excellence in everything we do, from legal 
                representation to community outreach.
              </CardContent>
            </Card>
            <Card>
              <CardTitle as="h3">Inclusivity</CardTitle>
              <CardContent>
                We serve all, regardless of caste, religion, gender, or 
                socioeconomic status.
              </CardContent>
            </Card>
            <Card>
              <CardTitle as="h3">Transparency</CardTitle>
              <CardContent>
                We maintain complete transparency in our operations and 
                financial matters.
              </CardContent>
            </Card>
            <Card>
              <CardTitle as="h3">Collaboration</CardTitle>
              <CardContent>
                We believe in working together with governments, NGOs, and 
                communities to create lasting change.
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading level={2}>Our Team</Heading>
          <Text size="lg" className="mt-4 max-w-2xl">
            Our team consists of experienced lawyers, social workers, counselors, 
            and dedicated volunteers who work tirelessly to bring justice to 
            those who need it most.
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {[
              { name: 'Executive Director', role: 'Leadership' },
              { name: 'Legal Director', role: 'Legal Team' },
              { name: 'Program Manager', role: 'Programs' },
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
