"use client";

import Link from "next/link";
import {
  Button,
  Container,
  Section,
  Heading,
  Text,
  Card,
  CardTitle,
  CardContent,
  FadeIn,
  Stagger,
  StaggerItem,
  ScaleIn,
  CountUp,
  LazyImage,
} from "@/components/ui";


export type HomeData = {
  hero: { title: string; subtitle: string };
  mission: { title: string; text: string };
  missionCards: { title: string; content: string }[];
  whoWeServe: { title: string; intro: string; items: string[] };
  supportCTA: { title: string; text: string };
  impactStats: { number: number; suffix: string; label: string }[];
};
export default function Home({ data }: { data: HomeData }) {
  return (
    <>
      <Section
        background="primary"
        className="min-h-[80vh] flex items-center relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#97BC62] rounded-full blur-3xl" />
        </div>
        <Container>
          <div className="max-w-3xl relative z-10">
            <FadeIn direction="up" delay={0.2}>
              <Heading level={1} className="text-white mb-6">
                {data.hero.title}
              </Heading>
            </FadeIn>
            <FadeIn direction="up" delay={0.4}>
              <Text size="lg" color="light" className="mb-8">
                {data.hero.subtitle}
              </Text>
            </FadeIn>
            <FadeIn direction="up" delay={0.6}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/get-involved">
                  <Button variant="secondary" size="lg">
                    Get Involved
                  </Button>
                </Link>
                <Link href="/what-we-do">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-[#2C5F2D]"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </Container>
      </Section>

      <Section background="neutral">
        <Container>
          <div className="text-center mb-12">
            <FadeIn direction="up">
              <Heading level={2} align="center">
                {data.mission.title}
              </Heading>
            </FadeIn>
            <FadeIn direction="up" delay={0.2}>
              <Text size="lg" className="mt-4 max-w-2xl mx-auto">
                {data.mission.text}
              </Text>
            </FadeIn>
          </div>
          <Stagger delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {data.missionCards.map((c, i) => (
                <StaggerItem key={c.title}>
                  <ScaleIn delay={i * 0.1}>
                    <Card className="h-full">
                      <CardTitle as="h3">{c.title}</CardTitle>
                      <CardContent>{c.content}</CardContent>
                    </Card>
                  </ScaleIn>
                </StaggerItem>
              ))}
            </div>
          </Stagger>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeIn direction="right">
              <div>
                <Heading level={2}>{data.whoWeServe.title}</Heading>
                <Text size="lg" className="mt-4 mb-6">
                  {data.whoWeServe.intro}
                </Text>
                <ul className="space-y-3">
                  {data.whoWeServe.items.map((item: string, index: number) => (
                    <FadeIn key={item} direction="left" delay={0.1 * index}>
                      <li className="flex items-center gap-3">
                        <span
                          className="w-2 h-2 bg-[#97BC62] rounded-full"
                          aria-hidden="true"
                        />
                        <Text>{item}</Text>
                      </li>
                    </FadeIn>
                  ))}
                </ul>
              </div>
            </FadeIn>
            <FadeIn direction="left" delay={0.3}>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <LazyImage
                  src="/images/impact.jpg"
                  alt="Impact photo"
                  aspectRatio="video"
                  className="w-full h-80"
                />
              </div>
            </FadeIn>
          </div>
        </Container>
      </Section>

      <Section background="secondary">
        <Container>
          <div className="text-center">
            <FadeIn>
              <Heading level={2} className="text-[#1a1a1a]">
                {data.supportCTA.title}
              </Heading>
            </FadeIn>
            <FadeIn delay={0.2}>
              <Text
                size="lg"
                className="mt-4 mb-8 max-w-2xl mx-auto text-[#1a1a1a]"
              >
                {data.supportCTA.text}
              </Text>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/get-involved">
                  <Button variant="primary" size="lg">
                    Donate Now
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <FadeIn>
            <Heading level={2} align="center">
              Our Impact
            </Heading>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-8">
            {data.impactStats.map((stat, index) => (
              <FadeIn key={stat.label} delay={0.1 * index}>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-[#2C5F2D]">
                    <CountUp end={stat.number} suffix={stat.suffix} />
                  </div>
                  <Text className="mt-2">{stat.label}</Text>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
