import { Router } from 'express';
import { db } from '../config/db';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { z } from 'zod';
const router = Router();
const schema = z.object({
  slug: z.string().min(2),
  title: z.string().min(2),
  excerpt: z.string().min(10),
  content: z.string().default(''),
  featuredImage: z.string().default(''),
  author: z.object({ name: z.string(), avatar: z.string().optional() }).default({ name: 'Admin', avatar: ''}),
  category: z.string().default('news'),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  readTime: z.number().default(5),
});

router.get('/', async (req: any, res: any) => {
  const { category } = req.query;
  let data = await db.getAll('stories') as any[];
  if (category && category !== 'all') data = data.filter(d => d.category === category);
  data.sort((a,b) => new Date(b.publishedAt).getTime()-new Date(a.publishedAt).getTime());
  res.json({ success: true, data });
});
router.get('/:slug', async (req: any, res: any) => {
  const item = await db.getBySlug('stories', req.params.slug) || await db.getById('stories', req.params.slug);
  if (!item) return res.status(404).json({ success:false, message:'Not found'});
  res.json({ success:true, data:item});
});
router.post('/', requireAuth as any, requireAdmin as any, async (req: any, res: any) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success:false, message:parsed.error.message});
  const payload = { ...parsed.data, publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as any;
  const created = await db.create('stories', payload);
  res.status(201).json({ success:true, data:created});
});
router.put('/:id', requireAuth as any, requireAdmin as any, async (req: any, res:any) => {
  const updated = await db.update('stories', req.params.id, { ...req.body, updatedAt: new Date().toISOString()});
  res.json({ success:true, data:updated});
});
router.delete('/:id', requireAuth as any, requireAdmin as any, async (req:any,res:any)=>{
  await db.remove('stories', req.params.id);
  res.json({success:true});
});
export default router;
