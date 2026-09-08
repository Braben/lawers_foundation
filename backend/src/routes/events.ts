import { Router } from 'express';
import { db } from '../config/db';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { z } from 'zod';
const router = Router();
const schema = z.object({
  slug: z.string().min(2),
  title: z.string().min(2),
  description: z.string().min(10),
  date: z.string(),
  endDate: z.string().optional(),
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
  if (category && category!=='all') data=data.filter(d=>d.category===category);
  res.json({ success:true, data});
});
router.get('/:slug', async (req:any,res:any)=>{
  const item = await db.getBySlug('events', req.params.slug) || await db.getById('events', req.params.slug);
  if(!item) return res.status(404).json({ success:false, message:'Not found'});
  res.json({ success:true, data:item});
});
router.post('/', requireAuth as any, requireAdmin as any, async (req:any,res:any)=>{
  const parsed = schema.safeParse(req.body);
  if(!parsed.success) return res.status(400).json({ success:false, message: parsed.error.message});
  const created = await db.create('events', parsed.data);
  res.status(201).json({ success:true, data:created});
});
router.put('/:id', requireAuth as any, requireAdmin as any, async (req:any,res:any)=>{
  const updated = await db.update('events', req.params.id, req.body);
  res.json({ success:true, data:updated});
});
router.delete('/:id', requireAuth as any, requireAdmin as any, async (req:any,res:any)=>{
  await db.remove('events', req.params.id);
  res.json({ success:true});
});

// RSVP Controller — capacity capped, wired to frontend
const rsvpSchema = z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().optional(), guests: z.number().int().min(1).default(1) });

router.post('/:id/rsvp', async (req:any,res:any)=>{
  const event:any = await db.getById('events', req.params.id) || await db.getBySlug('events', req.params.id);
  if(!event) return res.status(404).json({ success:false, message:'Event not found'});
  const parsed = rsvpSchema.safeParse(req.body);
  if(!parsed.success) return res.status(400).json({ success:false, message: parsed.error.issues.map(i=>i.message).join(', ')});
  const capacity = Number(event.capacity||100);
  const registered = Number(event.registeredCount||0);
  if (registered + parsed.data.guests > capacity) return res.status(409).json({ success:false, message:`Event at capacity (${capacity}). Only ${capacity - registered} spots left.`});
  const rsvps = await db.getAll('rsvps' as any) as any[];
  const existing = rsvps.find(r=> r.eventId===event.id && r.email===parsed.data.email);
  if (existing) return res.status(409).json({ success:false, message:'Already registered with this email'});
  const rsvp = await db.create('rsvps' as any, { eventId: event.id, eventTitle: event.title, ...parsed.data, createdAt: new Date().toISOString() });
  await db.update('events', event.id, { registeredCount: registered + parsed.data.guests });
  res.status(201).json({ success:true, data: rsvp });
});

router.get('/:id/rsvps', requireAuth as any, requireAdmin as any, async (req:any,res:any)=>{
  const event:any = await db.getById('events', req.params.id) || await db.getBySlug('events', req.params.id);
  if(!event) return res.status(404).json({ success:false, message:'Event not found'});
  const all = await db.getAll('rsvps' as any) as any[];
  const list = all.filter(r=> r.eventId===event.id).sort((a,b)=> new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
  res.json({ success:true, data: list, meta:{ capacity: event.capacity, registered: event.registeredCount, remaining: Number(event.capacity)-Number(event.registeredCount||0) }});
});

router.get('/rsvps/all', requireAuth as any, requireAdmin as any, async (_req:any,res:any)=>{
  const all = await db.getAll('rsvps' as any) as any[];
  res.json({ success:true, data: all.sort((a,b)=> new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())});
});

export default router;
