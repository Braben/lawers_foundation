'use client';
import { useEffect, useState } from 'react';
import { Container, Section, Heading, Text, Card, Button } from "@/components/ui";
import Link from "next/link";
import { Event } from "@/types";
import { api } from '@/lib/api';

const eventCategories = [
  { id: "all", name: "All Events" },
  { id: "upcoming", name: "Upcoming" },
  { id: "past", name: "Past Events" },
  { id: "workshop", name: "Workshops" },
  { id: "campaign", name: "Campaigns" },
];

const FALLBACK: Event[] = [
  { id: "1", slug: "awareness-workshop-manya-krobo-2024", title: "Empowerment Workshop — Lower Manya Krobo", description: "Awareness creation and empowerment workshop for orphans, widows and caregivers", date: "2024-03-15", time: "09:00 AM", endTime:"04:00 PM", location:{name:"Community Centre",address:"Lower Manya Krobo",city:"Eastern Region, Ghana"}, image:"/images/events/workshop.jpg", isOnline:false, registrationRequired:true, registrationLink:"/contact", category:"workshop", isFeatured:true, isPast:false },
  { id: "2", slug: "community-outreach-campaign", title: "Community Outreach — 200 Sensitized", description: "Community members sensitized on supporting vulnerable groups", date:"2024-02-20", time:"10:00 AM", location:{name:"Various Communities",address:"Lower Manya Krobo",city:"Eastern Region"}, image:"/images/events/outreach.jpg", isOnline:false, registrationRequired:false, category:"campaign", isFeatured:true, isPast:false },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(FALLBACK);
  const [cat, setCat] = useState('all');
  useEffect(()=>{ api.getEvents(cat).then(d=>{ if(d?.length) setEvents(d);}).catch(()=>{});},[cat]);
  const upcomingEvents = events.filter((event) => !event.isPast);
  const pastEvents = events.filter((event) => event.isPast);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  return (
    <>
      <Section background="primary">
        <Container>
          <Heading level={1} className="text-white">Events & Updates</Heading>
          <Text size="lg" color="light" className="mt-4 max-w-2xl">Join our workshops and outreach in Lower Manya Krobo — all events are now served from the database.</Text>
        </Container>
      </Section>
      <Section>
        <Container>
          <div className="flex flex-wrap gap-2 justify-center">
            {eventCategories.map((category) => (
              <button key={category.id} onClick={()=>setCat(category.id)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D] ${cat===category.id ? 'bg-[#2C5F2D] text-white' : 'bg-[#EDF4F2] text-[#4a4a4a] hover:bg-[#d4dfea]'}`}>{category.name}</button>
            ))}
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <Heading level={2} className="mb-8">Upcoming Events</Heading>
          <div className="space-y-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="flex flex-col md:flex-row overflow-hidden">
                <div className="md:w-64 bg-[#EDF4F2] flex items-center justify-center min-h-[160px] md:min-h-[200px] overflow-hidden">{event.image ? <img src={event.image} alt={event.title} className="w-full h-full object-cover" onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/> : <Text color="muted">Event Image</Text>}</div>
                <div className="flex-1 p-6">
                  <div className="flex flex-wrap items-center gap-2 mb-2"><span className="px-3 py-1 bg-[#97BC62] text-white text-xs font-medium rounded-full">{eventCategories.find((c) => c.id === event.category)?.name}</span>{event.isOnline && (<span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">Online</span>)}</div>
                  <Link href={`/events/${event.slug}`}><Heading level={3} className="hover:text-[#1e4420] transition-colors">{event.title}</Heading></Link>
                  <Text className="mt-2">{event.description}</Text>
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600"><div className="flex items-center gap-2"><span>📅</span><span>{formatDate(event.date)}</span></div><div className="flex items-center gap-2"><span>⏰</span><span>{event.time}{event.endTime ? ` - ${event.endTime}` : ""}</span></div><div className="flex items-center gap-2"><span>📍</span><span>{event.isOnline ? "Online" : event.location.name}</span></div></div>
                  <div className="flex gap-3 mt-4"><Link href={`/events/${event.slug}`}><Button size="sm">View Details</Button></Link>{event.registrationRequired && event.registrationLink && (<Link href={event.registrationLink}><Button size="sm" variant="outline">Register Now</Button></Link>)}</div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
      {pastEvents.length>0 && (
        <Section background="neutral">
          <Container>
            <Heading level={2} className="mb-8">Past Events</Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden"><div className="bg-[#EDF4F2] h-40 flex items-center justify-center overflow-hidden">{event.image ? <img src={event.image} alt={event.title} className="w-full h-full object-cover"/>:<Text color="muted">Past Event</Text>}</div><div className="p-4"><Text className="text-sm text-gray-500 mb-2">{formatDate(event.date)}</Text><Link href={`/events/${event.slug}`}><Heading level={4} className="hover:text-[#1e4420] transition-colors">{event.title}</Heading></Link><Text className="mt-2 text-sm">{event.description.substring(0, 100)}...</Text><Link href={`/events/${event.slug}`} className="inline-block mt-3 text-[#2C5F2D] text-sm font-medium hover:underline">View Details →</Link></div></Card>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
