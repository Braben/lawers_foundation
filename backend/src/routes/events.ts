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
export default router;
