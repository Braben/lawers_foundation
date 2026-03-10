import {
  Container,
  Section,
  Heading,
  Text,
  Card,
  Button,
} from "@/components/ui";
import Link from "next/link";
import { Event } from "@/types";

const eventCategories = [
  { id: "all", name: "All Events" },
  { id: "upcoming", name: "Upcoming" },
  { id: "past", name: "Past Events" },
  { id: "webinar", name: "Webinars" },
  { id: "workshop", name: "Workshops" },
  { id: "campaign", name: "Campaigns" },
];

const events: Event[] = [
  {
    id: "1",
    slug: "legal-aid-camp-delhi-2024",
    title: "Free Legal Aid Camp - Delhi",
    description:
      "Join us for a day-long free legal aid camp where our team of lawyers will provide free consultations to those in need. Services include legal advice, document review, and case assessment.",
    date: "2024-02-15",
    time: "10:00 AM",
    endTime: "5:00 PM",
    location: {
      name: "Community Hall",
      address: "123 Justice Lane, Connaught Place",
      city: "New Delhi",
    },
    image: "/images/events/legal-aid-camp.jpg",
    isOnline: false,
    registrationRequired: true,
    registrationLink: "/register/legal-aid-camp",
    category: "workshop",
    isFeatured: true,
    isPast: false,
  },
  {
    id: "2",
    slug: "womens-rights-webinar",
    title: "Webinar: Understanding Women's Legal Rights",
    description:
      "An interactive webinar covering essential legal rights for women in India. Topics include domestic violence laws, workplace harassment, property rights, and more.",
    date: "2024-02-20",
    time: "3:00 PM",
    location: {
      name: "Online",
      address: "",
      city: "",
    },
    image: "/images/events/webinar.jpg",
    isOnline: true,
    meetingLink: "https://zoom.us/meeting/webinar",
    registrationRequired: true,
    registrationLink: "/register/womens-rights-webinar",
    category: "webinar",
    isFeatured: true,
    isPast: false,
  },
  {
    id: "3",
    slug: "child-protection-workshop",
    title: "Child Protection Workshop for Educators",
    description:
      "A comprehensive workshop for teachers and school administrators on identifying and reporting child abuse, creating safe school environments, and supporting vulnerable children.",
    date: "2024-02-25",
    time: "9:00 AM",
    endTime: "4:00 PM",
    location: {
      name: "Training Center",
      address: "45 Education Park",
      city: "Gurgaon",
    },
    image: "/images/events/child-protection.jpg",
    isOnline: false,
    registrationRequired: true,
    registrationLink: "/register/child-protection",
    category: "workshop",
    isFeatured: false,
    isPast: false,
  },
  {
    id: "4",
    slug: "annual-fundraiser-2024",
    title: "Annual Fundraiser Gala 2024",
    description:
      "Our annual fundraising event bringing together supporters, partners, and beneficiaries. Join us for an evening of inspiration and impact.",
    date: "2024-03-10",
    time: "6:00 PM",
    endTime: "10:00 PM",
    location: {
      name: "Grand Hotel",
      address: "78 VIP Road",
      city: "New Delhi",
    },
    image: "/images/events/fundraiser.jpg",
    isOnline: false,
    registrationRequired: true,
    registrationLink: "/register/fundraiser-2024",
    category: "campaign",
    isFeatured: true,
    isPast: false,
  },
  {
    id: "5",
    slug: "legal-literacy-week-2023",
    title: "Legal Literacy Week 2023",
    description:
      "A week-long campaign to spread legal awareness across rural communities. Our team visited 50 villages, conducting workshops and distributing educational materials.",
    date: "2023-11-01",
    time: "9:00 AM",
    endTime: "5:00 PM",
    location: {
      name: "Various Villages",
      address: "Rajasthan",
      city: "Jaipur",
    },
    image: "/images/events/literacy-week.jpg",
    isOnline: false,
    registrationRequired: false,
    category: "campaign",
    isFeatured: false,
    isPast: true,
  },
  {
    id: "6",
    slug: "international-womens-day-2023",
    title: "International Women's Day Celebration",
    description:
      "Celebrating the strength and resilience of women. The event featured survivor stories, award ceremony for women leaders, and cultural performances.",
    date: "2023-03-08",
    time: "10:00 AM",
    endTime: "6:00 PM",
    location: {
      name: "City Convention Center",
      address: "1 Main Square",
      city: "New Delhi",
    },
    image: "/images/events/iwd-2023.jpg",
    isOnline: false,
    registrationRequired: false,
    category: "campaign",
    isFeatured: false,
    isPast: true,
  },
];

export default function EventsPage() {
  const upcomingEvents = events.filter((event) => !event.isPast);
  const pastEvents = events.filter((event) => event.isPast);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <>
      <Section background="primary">
        <Container>
          <Heading level={1} className="text-white">
            Events & Updates
          </Heading>
          <Text size="lg" color="light" className="mt-4 max-w-2xl">
            Join our events, workshops, and campaigns. Together, we can create
            awareness and bring about change.
          </Text>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="flex flex-wrap gap-2 justify-center">
            {eventCategories.map((category) => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D] ${
                  category.id === "all"
                    ? "bg-[#2C5F2D] text-white"
                    : "bg-[#EDF4F2] text-[#4a4a4a] hover:bg-[#d4dfea]"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading level={2} className="mb-8">
            Upcoming Events
          </Heading>
          <div className="space-y-6">
            {upcomingEvents.map((event) => (
              <Card
                key={event.id}
                className="flex flex-col md:flex-row overflow-hidden"
              >
                <div className="md:w-64 bg-[#EDF4F2] flex items-center justify-center min-h-[160px] md:min-h-[200px]">
                  <Text color="muted">Event Image</Text>
                </div>
                <div className="flex-1 p-6">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-[#97BC62] text-white text-xs font-medium rounded-full">
                      {
                        eventCategories.find((c) => c.id === event.category)
                          ?.name
                      }
                    </span>
                    {event.isOnline && (
                      <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                        Online
                      </span>
                    )}
                  </div>
                  <Link href={`/events/${event.slug}`}>
                    <Heading
                      level={3}
                      className="hover:text-[#1e4420] transition-colors"
                    >
                      {event.title}
                    </Heading>
                  </Link>
                  <Text className="mt-2">{event.description}</Text>
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4" aria-hidden="true">
                        📅
                      </span>
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4" aria-hidden="true">
                        ⏰
                      </span>
                      <span>
                        {event.time}
                        {event.endTime ? ` - ${event.endTime}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4" aria-hidden="true">
                        📍
                      </span>
                      <span>
                        {event.isOnline ? "Online" : event.location.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Link href={`/events/${event.slug}`}>
                      <Button size="sm">View Details</Button>
                    </Link>
                    {event.registrationRequired && event.registrationLink && (
                      <Link href={event.registrationLink}>
                        <Button size="sm" variant="outline">
                          Register Now
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="neutral">
        <Container>
          <Heading level={2} className="mb-8">
            Past Events
          </Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <div className="bg-[#EDF4F2] h-40 flex items-center justify-center">
                  <Text color="muted">Past Event</Text>
                </div>
                <div className="p-4">
                  <Text className="text-sm text-gray-500 mb-2">
                    {formatDate(event.date)}
                  </Text>
                  <Link href={`/events/${event.slug}`}>
                    <Heading
                      level={4}
                      className="hover:text-[#1e4420] transition-colors"
                    >
                      {event.title}
                    </Heading>
                  </Link>
                  <Text className="mt-2 text-sm">
                    {event.description.substring(0, 100)}...
                  </Text>
                  <Link
                    href={`/events/${event.slug}`}
                    className="inline-block mt-3 text-[#2C5F2D] text-sm font-medium hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="secondary">
        <Container>
          <div className="text-center">
            <Heading level={2} className="text-[#1a1a1a]">
              Host an Event With Us
            </Heading>
            <Text
              size="lg"
              className="mt-4 mb-8 max-w-2xl mx-auto text-[#1a1a1a]"
            >
              Want to organize a legal awareness event, workshop, or campaign?
              Let'ss collaborate to bring knowledge and justice to more
              communities.
            </Text>
            <Link href="/contact">
              <Button variant="primary" size="lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Heading level={2} align="center">
            Stay Updated
          </Heading>
          <Text size="lg" className="mt-4 text-center max-w-xl mx-auto mb-8">
            Subscribe to our newsletter to get notified about upcoming events
            and important updates.
          </Text>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C5F2D] focus:border-transparent"
              aria-label="Email address for event updates"
            />
            <Button type="submit">Subscribe</Button>
          </form>
        </Container>
      </Section>
    </>
  );
}

export async function getEvents(
  category?: string,
  includePast?: boolean,
): Promise<Event[]> {
  const params = new URLSearchParams();
  if (category && category !== "all") params.append("category", category);
  if (includePast) params.append("includePast", "true");

  const response = await fetch(`/api/events?${params.toString()}`, {
    next: { revalidate: 60 },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }
  return response.json();
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const response = await fetch(`/api/events/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!response.ok) {
    return null;
  }
  return response.json();
}
