import { Router } from 'express';
import { db } from '../config/db';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { z } from 'zod';
const router = Router();

const schema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  type: z.enum(['image','video']),
  url: z.string().min(5),
  thumbnail: z.string().min(3),
  category: z.string().default('all'),
  tags: z.array(z.string()).default([]),
}).superRefine((data, ctx) => {
  if (data.type === 'video') {
    const isLink = /^https?:\/\//.test(data.url);
    const isYoutube = /youtube\.com|youtu\.be|vimeo\.com/.test(data.url);
    if (!isLink) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Video must be a link (YouTube/Vimeo URL), not a file upload', path: ['url']});
    if (data.url.includes(' ') || data.url.endsWith('.mp4')) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Videos are link-only — use YouTube/Vimeo URL. Thumbnail & description are set by admin.', path: ['url']});
  }
});

router.get('/', async (req:any,res:any)=>{
  const { category } = req.query;
  let data = await db.getAll('gallery') as any[];
  if (category && category!=='all') data=data.filter(d=>d.category===category);
  res.json({ success:true, data});
});
router.get('/:id', async (req:any,res:any)=>{
  const item = await db.getById('gallery', req.params.id);
  if(!item) return res.status(404).json({ success:false, message:'Not found'});
  res.json({ success:true, data:item});
});
router.post('/', requireAuth as any, requireAdmin as any, async (req:any,res:any)=>{
  const parsed = schema.safeParse(req.body);
  if(!parsed.success) return res.status(400).json({ success:false, message: parsed.error.issues.map(i=>i.message).join(', ')});
  const payload = { ...parsed.data, uploadedAt: new Date().toISOString() } as any;
  const created = await db.create('gallery', payload);
  res.status(201).json({ success:true, data:created});
});
router.put('/:id', requireAuth as any, requireAdmin as any, async (req:any,res:any)=>{
  const updated = await db.update('gallery', req.params.id, req.body);
  res.json({ success:true, data:updated});
});
router.delete('/:id', requireAuth as any, requireAdmin as any, async (req:any,res:any)=>{
  await db.remove('gallery', req.params.id);
  res.json({ success:true});
});
export default router;
