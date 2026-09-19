import { asyncRouter } from '../middleware/asyncRouter';
import { db } from '../config/db';
import { requirePermission } from '../middleware/rbac';
const router = asyncRouter();
router.get('/stats', requirePermission('analytics.view'), async (req:any,res) => {
  const can = (feature:string) => req.access.permissions.includes(feature+'.view');
  const [donations,events,stories,contacts] = await Promise.all([
    can('pledges')?db.getAll('donations'):[],can('events')?db.getAll('events'):[],can('content')?db.getAll('stories'):[],can('contacts')?db.getAll('contacts'):[],
  ]);
  const pledges=donations.filter(d=>d.status==='pledged');
  const totalsByCurrency:Record<string,number>={};
  for (const pledge of pledges) { const currency=pledge.currency || 'GHS'; totalsByCurrency[currency]=Math.round(((totalsByCurrency[currency] || 0)+Number(pledge.amount || 0))*1000)/1000; }
  res.json({success:true,data:{ totalDonations:pledges.length,totalsByCurrency,upcomingEvents:events.filter(e=>!e.isPast && (e.endDate || e.date)>=new Date().toISOString().slice(0,10)).length,totalContacts:contacts.length,totalStories:stories.length,
    recentStories:stories.sort((a,b)=>Date.parse(b.publishedAt||b.createdAt)-Date.parse(a.publishedAt||a.createdAt)).slice(0,3),
    recentDonations:donations.sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt)).slice(0,5),permissions:req.access.permissions }});
});
export default router;
