"use client";
import { useEffect, useState } from "react";
import {
  Container,
  Section,
  Heading,
  Text,
  Card,
  CardTitle,
  ScaleIn,
  Button,
  FadeIn,
  CountUp,
} from "@/components/ui";
import Link from "next/link";
import { api } from "@/lib/api";

const FALLBACK = [
  {
    id: "orphan-support",
    slug: "orphan-support",
    title: "Orphan Support Program",
    icon: "🎓",
    shortDescription: "Educational support, shelter and holistic care",
    fullDescription: "From Class 1 through tertiary...",
    features: [
      "Scholarships, books and tutoring",
      "Shelter support",
      "Counselling",
    ],
    impactStats: [
      { value: "60", label: "Orphans Targeted" },
      { value: "80", label: "Receiving Scholarships" },
      { value: "50", label: "Enrolled" },
      { value: "100%", label: "Holistic Care" },
    ],
  },
  {
    id: "women-empowerment",
    slug: "women-empowerment",
    title: "Women's Empowerment Program",
    icon: "👩‍💼",
    shortDescription: "Entrepreneurship...",
    fullDescription: "We train...",
    features: [
      "Entrepreneurship",
      "Vocational skills",
      "income generating projects",
    ],
    impactStats: [
      { value: "70", label: "Widows" },
      { value: "40", label: "Single Mothers" },
      { value: "20", label: "Businesses" },
      { value: "GHS 60k", label: "Income" },
    ],
  },
  {
    id: "house-help-caregiver",
    slug: "house-help-caregiver",
    title: "House Helps & Home Care Services",
    icon: "🏠",
    shortDescription: "A hub for reliable caregivers",
    fullDescription: "We identify...",
    features: [
      "Recruitment",
      "Professional training",
      "Posting of care givers; Links to agencies for placement.",
    ],
    impactStats: [
      { value: "30", label: "Caregivers" },
      { value: "6", label: "Modules" },
      { value: "100%", label: "Vetted" },
      { value: "24/7", label: "Support" },
    ],
  },
  {
    id: "education-child-development",
    slug: "education-child-development",
    title: "Education & Child Development",
    icon: "📚",
    shortDescription: "Accessible education",
    fullDescription: "Education is...",
    features: [
      "Liaison with schools",
      "Provide books, uniforms and other interactions",
    ],
    impactStats: [
      { value: "150", label: "Strategic" },
      { value: "5", label: "Tertiary" },
      { value: "70%", label: "Self-Esteem" },
      { value: "5yrs", label: "Duration" },
    ],
  },
  {
    id: "healthcare-wellbeing",
    slug: "healthcare-wellbeing",
    title: "Healthcare & Wellbeing",
    icon: "🩺",
    shortDescription: "Health care support",
    fullDescription: "Vulnerable people...",
    features: ["Health care provision"],
    impactStats: [
      { value: "40", label: "Therapy" },
      { value: "30", label: "Counselling" },
      { value: "70", label: "Support Groups" },
      { value: "4", label: "Events" },
    ],
  },
  {
    id: "economic-empowerment",
    slug: "economic-empowerment",
    title: "Economic Empowerment",
    icon: "💪",
    shortDescription: "Micro-business",
    fullDescription: "We support...",
    features: [
      "Micro-business",
      "Food Processing & Handicrafts",
      "Enabling Environment",
      "Skills and Education Training",
    ],
    impactStats: [
      { value: "40", label: "Trained" },
      { value: "50", label: "Entrepreneurs" },
      { value: "200", label: "Sensitized" },
      { value: "∞", label: "Goal" },
    ],
  },
];

export default function ProgramsPage() {
  const [programs, setPrograms] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .getPrograms()
      .then((d) => {
        setPrograms(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  return (
    <>
      <Section background="primary">
        <Container>
          <FadeIn>
            <Heading level={1} className="text-white">
              Our Programs
            </Heading>
          </FadeIn>
          <FadeIn delay={0.2}>
            <Text size="lg" color="light" className="mt-4 max-w-2xl">
              Empowering orphans, widows, single mothers and caregivers in Lower
              Manya Krobo, Eastern Region, Ghana — through education, economic
              empowerment, social support and financial provision to break
              cycles of poverty.
            </Text>
          </FadeIn>
        </Container>
      </Section>
      <Section>
        <Container>
          {loading && <Text>Loading programs...</Text>}
          <div className="text-center mb-12">
            <FadeIn>
              <Heading level={2}>Our Impact at a Glance</Heading>
            </FadeIn>
            <FadeIn delay={0.2}>
              <Text size="lg" className="mt-4 max-w-3xl mx-auto">
                Five-year target: 60 orphans, 40 single mothers, 70 widows and
                30 caregivers — with measurable outputs in education, income and
                community integration.
              </Text>
            </FadeIn>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: 60, suffix: "", label: "Orphans Targeted" },
              { value: 70, suffix: "", label: "Widows Targeted" },
              { value: 30, suffix: "", label: "Caregivers Trained" },
              { value: 200, suffix: "", label: "Sensitized Community" },
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
          background={index % 2 === 0 ? "white" : "neutral"}
          id={program.id}
        >
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <FadeIn direction={index % 2 === 0 ? "right" : "left"}>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {/* <span className="text-4xl" role="img" aria-hidden="true">
                      {program.icon}
                    </span> */}
                    <Heading level={2} className="mb-0">
                      {program.title}
                    </Heading>
                  </div>
                  <Text size="lg" className="mb-6">
                    {program.fullDescription}
                  </Text>
                  <Heading level={4} className="mb-4">
                    Key Features
                  </Heading>
                  <ul className="space-y-3 mb-8">
                    {program.features.map((feature: string, fIndex: number) => (
                      <FadeIn
                        key={feature}
                        direction="left"
                        delay={0.05 * fIndex}
                      >
                        <li className="flex items-start gap-3">
                          <span
                            className="w-2 h-2 bg-[#97BC62] rounded-full mt-2 flex-shrink-0"
                            aria-hidden="true"
                          />
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
              <FadeIn
                direction={index % 2 === 0 ? "left" : "right"}
                delay={0.2}
              >
                <ScaleIn>
                  <Card className="bg-[#EDF4F2] border-2 border-[#97BC62]">
                    <CardTitle as="h3" className="text-center">
                      Our Impact
                    </CardTitle>
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
              <Heading level={2} className="text-[#1a1a1a]">
                Partner with Us
              </Heading>
            </FadeIn>
            <FadeIn delay={0.2}>
              <Text
                size="lg"
                className="mt-4 mb-8 max-w-2xl mx-auto text-[#1a1a1a]"
              >
                Build partnerships with government, private sector and CSOs to
                leverage resources, expertise and funding for sustainable
                impact.
              </Text>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button variant="primary" size="lg">
                    Become a Partner
                  </Button>
                </Link>
                <Link href="/get-involved">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-[#1a1a1a] text-[#1a1a1a]"
                  >
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
