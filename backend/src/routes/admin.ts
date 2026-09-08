import { Router } from 'express';
import { db } from '../config/db';
const router = Router();

router.get('/stats', async (_req:any,res:any)=>{
  const [donations, events, stories, contacts] = await Promise.all([
    db.getAll('donations' as any) as Promise<any[]>,
    db.getAll('events' as any) as Promise<any[]>,
    db.getAll('stories' as any) as Promise<any[]>,
    db.getAll('contacts' as any) as Promise<any[]>,
  ]);
  const totalDonations = donations.reduce((s,d)=> s + Number(d.amount||0), 0);
  const totalAmount = totalDonations;
  const successful = donations.filter(d=> (d.paymentStatus==='succeeded' || d.status==='succeeded')).length;
  const upcomingEvents = events.filter(e=> !e.isPast).length;
  const recentStories = stories.sort((a,b)=> new Date(b.publishedAt||b.createdAt).getTime() - new Date(a.publishedAt||a.createdAt).getTime()).slice(0,3);
  const donationTrend = donations.slice(-6).map(d=> ({ date: d.createdAt?.slice(0,10), amount: Number(d.amount||0)}));
  res.json({ success:true, data:{
    totalDonations: donations.length,
    totalAmount,
    successful,
    upcomingEvents,
    totalContacts: contacts.length,
    totalStories: stories.length,
    recentStories,
    donationTrend,
    recentDonations: donations.sort((a,b)=> new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()).slice(0,5)
  }});
});

export default router;
