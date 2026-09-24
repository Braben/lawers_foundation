import { protectSubmission } from '../services/abuse';
import { asyncRouter } from '../middleware/asyncRouter';
import { db } from '../config/db';
import { requireAuth } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { z } from 'zod';
const router = asyncRouter();
const schema = z.object({
  slug: z.string().min(2),
  title: z.string().min(2),
  description: z.string().min(10),
  date: z.string().date(),
  endDate: z.string().date().optional(),
  time: z.string().default('10:00 AM'),
  endTime: z.string().optional(),
  location: z.object({ name: z.string(), address: z.string().default(''), city: z.string().default('')}),
  image: z.string().default(''),
  isOnline: z.boolean().default(false),
  meetingLink: z.string().optional(),
  registrationRequired: z.boolean().default(false),
  registrationLink: z.string().optional(),
  category: z.string().default('workshop'),
  isFeatured: z.boolean().default(false),
  isPast: z.boolean().default(false),
  capacity: z.number().int().positive().default(100),
  registeredCount: z.number().int().default(0),
});
router.get('/', async (req:any,res:any)=>{
  const { category } = req.query;
  let data = await db.getAll('events') as any[];
  data = data.map(e => ({ ...e, isPast: e.isPast || (e.endDate || e.date) < new Date().toISOString().slice(0,10) }));
  if (category === 'past') data = data.filter(e => e.isPast);
  else if (category === 'upcoming') data = data.filter(e => !e.isPast);
  else if (category && category !== 'all') data = data.filter(e => e.category === category);
  res.json({ success:true, data});
});
router.get('/:slug', async (req:any,res:any)=>{
  const item = await db.getBySlug('events', req.params.slug) || await db.getById('events', req.params.slug);
  if(!item) return res.status(404).json({ success:false, message:'Not found'});
  res.json({ success:true, data:item});
});
router.post('/', requireAuth as any, requirePermission('events.manage') as any, async (req:any,res:any)=>{
  const parsed = schema.safeParse(req.body);
  if(!parsed.success) return res.status(400).json({ success:false, message: parsed.error.message});
  const created = await db.create('events', { ...parsed.data, registeredCount: 0 });
  res.status(201).json({ success:true, data:created});
});
router.put('/:id', requireAuth as any, requirePermission('events.manage') as any, async (req:any,res:any)=>{
  const current = await db.getById('events', req.params.id);
  if (!current) return res.status(404).json({ success:false, message:'Not found' });
  const parsed = schema.safeParse({ ...current, ...req.body });
  if (!parsed.success) return res.status(400).json({ success:false, message:parsed.error.issues.map(i=>i.message).join(', ') });
  if (parsed.data.capacity < Number(current.registeredCount || 0)) return res.status(409).json({ success:false, message:'Capacity cannot be less than the number already registered.' });
  parsed.data.registeredCount = Number(current.registeredCount || 0);
  const updated = await db.update('events', req.params.id, parsed.data);
  res.json({ success:true, data:updated });
});
router.delete('/:id', requireAuth as any, requirePermission('events.manage') as any, async (req:any,res:any)=>{
  await db.remove('events', req.params.id);
  res.json({ success:true});
});

// RSVP Controller — capacity capped, wired to frontend
const rsvpSchema = z.object({ name: z.string().trim().min(2).max(150), email: z.string().trim().email().max(254), phone: z.string().max(40).optional(), guests: z.number().int().min(1).max(5).default(1) });

router.post('/:id/rsvp', protectSubmission('rsvp'), async (req:any,res:any)=>{
  const event:any = await db.getById('events', req.params.id) || await db.getBySlug('events', req.params.id);
  if(!event) return res.status(404).json({ success:false, message:'Event not found'});
  const parsed = rsvpSchema.safeParse(req.body);
  if(!parsed.success) return res.status(400).json({ success:false, message: parsed.error.issues.map(i=>i.message).join(', ')});
  const rsvp = await db.registerRsvp(event.id, parsed.data);
  res.status(201).json({ success:true, data: rsvp });
});

router.put('/:id/rsvps/:rsvpId', requireAuth, requirePermission('events.manage'), async (req:any,res) => {
  const parsed = z.object({status:z.enum(['approved','rejected'])}).strict().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({success:false,message:'Choose approve or reject.'}); return; }
  const data = await db.reviewRsvp(String(req.params.id), String(req.params.rsvpId), parsed.data.status, req.user.uid);
  res.json({success:true,data});
});

router.get('/:id/rsvps', requireAuth as any, requirePermission('events.view') as any, async (req:any,res:any)=>{
  const event:any = await db.getById('events', req.params.id) || await db.getBySlug('events', req.params.id);
  if(!event) return res.status(404).json({ success:false, message:'Event not found'});
  const all = await db.getAll('rsvps' as any) as any[];
  const list = all.filter(r=> r.eventId===event.id).sort((a,b)=> new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
  res.json({ success:true, data: list, meta:{ capacity: event.capacity, registered: event.registeredCount, remaining: Number(event.capacity)-Number(event.registeredCount||0) }});
});

router.get('/rsvps/all', requireAuth as any, requirePermission('events.view') as any, async (_req:any,res:any)=>{
  const all = await db.getAll('rsvps' as any) as any[];
  res.json({ success:true, data: all.sort((a,b)=> new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())});
});

export default router;
