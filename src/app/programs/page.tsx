"use client";

import {
  Container,
  Section,
  Heading,
  Text,
  Card,
  CardTitle,
  CardContent,
  Button,
  FadeIn,
  Stagger,
  StaggerItem,
  ScaleIn,
  CountUp,
} from "@/components/ui";
import Link from "next/link";

const programs = [
  {
    id: "orphan-support",
    slug: "orphan-support",
    title: "Orphan Support Program",
    icon: "🎓",
    shortDescription: "Educational support, shelter and holistic care for partially and fully orphaned children.",
    fullDescription: "From Class 1 through tertiary, we provide materials, financial support and counselling through the Love of Jesus. Orphans receive scholarships, books, tutoring, shelter and character formation to become well-nurtured, disciplined and God-fearing contributors to national development. Five beneficiaries are currently at tertiary level with many already gainfully employed.",
    features: [
      "Scholarships, books and tutoring from pre-school to tertiary",
      "Shelter and residential accommodation support",
      "Counselling for career enhancement and character education",
      "Art & therapy sessions — music, art, sports for healing",
      "Mentorship by adult Christian role models",
      "Nutrition, clothing, health care and financial aid",
    ],
    impactStats: [
      { value: "60", label: "Orphans Targeted" },
      { value: "80", label: "Receiving Scholarships" },
      { value: "50", label: "Enrolled in School" },
      { value: "100%", label: "Holistic Care" },
    ],
  },
  {
    id: "women-empowerment",
    slug: "women-empowerment",
    title: "Women's Empowerment Program",
    icon: "👩‍💼",
    shortDescription: "Entrepreneurship training and micro-finance for widows and single mothers.",
    fullDescription: "We train and support 50 widows and single mothers in entrepreneurship and vocational trades — sewing, baking, hairdressing, computer and digital literacy — then provide start-up kits and micro-finance to launch sustainable micro-businesses. Counselling and support groups foster resilience and self-esteem.",
    features: [
      "Entrepreneurship and business training",
      "Vocational skills: sewing, baking, hairdressing, digital skills",
      "Microfinance and start-up kits for small businesses",
      "Mentorship, counselling and support groups",
      "Monthly assistance for widows and elderly women",
      "Linkage to markets and income-generating projects",
    ],
    impactStats: [
      { value: "70", label: "Widows Targeted" },
      { value: "40", label: "Single Mothers" },
      { value: "20", label: "Businesses Started" },
      { value: "GHS 60k", label: "Income Generated" },
    ],
  },
  {
    id: "house-help-caregiver",
    slug: "house-help-caregiver",
    title: "House Helps & Home Care Services",
    icon: "🏠",
    shortDescription: "A hub for reliable, trained caregivers and house helps.",
    fullDescription: "We identify and train 30 caregivers/house helps with well-structured professional curricula — functional literacy, first aid, childcare, elderly (geriatrics) care, etiquette and wellbeing — then connect trained, seasoned helpers to households needing cleaning, cooking and home care support.",
    features: [
      "Recruitment and vetting of interested caregivers",
      "Professional training by specialists",
      "Functional literacy, first aid, childcare, geriatrics, etiquette",
      "Life skills and wellbeing training",
      "Household placement and follow-up support",
      "Future hub for supply of home helps",
    ],
    impactStats: [
      { value: "30", label: "Caregivers Targeted" },
      { value: "6", label: "Training Modules" },
      { value: "100%", label: "Vetted & Trained" },
      { value: "24/7", label: "Home Support Model" },
    ],
  },
  {
    id: "education-child-development",
    slug: "education-child-development",
    title: "Education & Child Development",
    icon: "📚",
    shortDescription: "Accessible, quality education and skills training for every child.",
    fullDescription: "Education is our core intervention for breaking cycles of poverty. We liaise with headmasters and school management, run exposure visits and empowerment workshops, and use creatively designed counselling to ensure vulnerable children catch up with peers and secure meaningful employment or entrepreneurship.",
    features: [
      "Liaison with schools for targeted interventions",
      "Exposure visits for visibility and aspiration",
      "Awareness creation and empowerment workshops",
      "Counselling for children, students and widows",
      "Support for youth trade and apprenticeship",
      "Digital skills for employability in the digital economy",
    ],
    impactStats: [
      { value: "150", label: "Orphans: Education & Vocational (Strategic)" },
      { value: "5", label: "At Tertiary Now" },
      { value: "70%", label: "Self-Esteem Increase" },
      { value: "5yrs", label: "Programme Duration" },
    ],
  },
  {
    id: "healthcare-wellbeing",
    slug: "healthcare-wellbeing",
    title: "Healthcare & Wellbeing",
    icon: "🩺",
    shortDescription: "Health care support and psychosocial healing for vulnerable groups.",
    fullDescription: "Vulnerable people are supported in provision of health care. We integrate basic caregiving, art & therapy and community counselling so that orphans and widows not only survive but thrive — physically, emotionally and spiritually.",
    features: [
      "Health care provision and referral",
      "40 orphans in art/music therapy sessions",
      "30 widows/single mothers receiving counselling",
      "Psychological support and support groups (70 beneficiaries)",
      "Community outreach and stigma reduction events",
      "First aid and life-skills wellbeing training",
    ],
    impactStats: [
      { value: "40", label: "Art/Music Therapy" },
      { value: "30", label: "Counselling (Widows)" },
      { value: "70", label: "In Support Groups" },
      { value: "4", label: "Community Events" },
    ],
  },
  {
    id: "economic-empowerment",
    slug: "economic-empowerment",
    title: "Economic Empowerment",
    icon: "💪",
    shortDescription: "Micro-business development and sustainable livelihoods.",
    fullDescription: "We support women and youth to establish micro-businesses and income-generating projects with training, mentoring and start-up kits. The goal is economic independence through sustainable livelihoods that allow families to contribute to community and national development.",
    features: [
      "Micro-business establishment support",
      "Start-up kits and financial provision",
      "Vocational training: sewing, baking, hairdressing, computer",
      "Digital skills for the digital economy",
      "Partnerships with gov, private sector & CSOs to leverage resources",
      "Income-generating activities for Foundation sustainability",
    ],
    impactStats: [
      { value: "40", label: "Women Vocationally Trained" },
      { value: "50", label: "Widows/Mothers in Entrepreneurship" },
      { value: "200", label: "Beneficiaries Sensitized" },
      { value: "∞", label: "Sustainable Impact Goal" },
    ],
  },
];

export default function ProgramsPage() {
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
              Empowering orphans, widows, single mothers and caregivers in Lower Manya Krobo, Eastern Region, Ghana — through education, economic empowerment, social support and financial provision to break cycles of poverty.
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
                Five-year target: 60 orphans, 40 single mothers, 70 widows and 30 caregivers — with measurable outputs in education, income and community integration.
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
                    <span className="text-4xl" role="img" aria-hidden="true">
                      {program.icon}
                    </span>
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
                    {program.features.map((feature, fIndex) => (
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
                Build partnerships with government, private sector and CSOs to leverage resources, expertise and funding for sustainable impact.
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
