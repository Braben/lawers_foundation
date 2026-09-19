import { asyncRouter } from '../middleware/asyncRouter';
import { db } from '../config/db';
import { requireAuth } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { z } from 'zod';
import { videoSource } from '../services/video';
const router = asyncRouter();

const mediaUrl = z.string().max(2048).refine(value => /^(https?:\/\/|\/(?!\/))/.test(value), 'Use a valid image URL');
const schema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().max(2000).default(''),
  type: z.enum(['image','video']),
  url: mediaUrl,
  thumbnail: mediaUrl.default('/images/lawersfoundation.png'),
  category: z.string().default('all'),
  tags: z.array(z.string()).default([]),
 }).superRefine((data,ctx)=>{
  if (data.type==='video' && !videoSource(data.url)) ctx.addIssue({code:'custom',message:'Use an HTTPS YouTube, Vimeo, MP4 or WebM URL',path:['url']});
});
const playable = (item:any) => ({ ...item, ...(item.type==='video'?{playback:videoSource(item.url)}:{}) });

router.get('/', async (req:any,res:any)=>{
  const { category } = req.query;
  let data = await db.getAll('gallery') as any[];
  if (category==='videos') data=data.filter(d=>d.type==='video');
  else if (category && category!=='all') data=data.filter(d=>d.category===category);
  res.json({ success:true, data:data.map(playable)});
});
router.get('/:id', async (req:any,res:any)=>{
  const item = await db.getById('gallery', req.params.id);
  if(!item) return res.status(404).json({ success:false, message:'Not found'});
  res.json({ success:true, data:playable(item)});
});
router.post('/', requireAuth as any, requirePermission('gallery.manage') as any, async (req:any,res:any)=>{
  const parsed = schema.safeParse(req.body);
  if(!parsed.success) return res.status(400).json({ success:false, message: parsed.error.issues.map(i=>i.message).join(', ')});
  const payload = { ...parsed.data, uploadedAt: new Date().toISOString() } as any;
  const created = await db.create('gallery', payload);
  res.status(201).json({ success:true, data:playable(created)});
});
router.put('/:id', requireAuth as any, requirePermission('gallery.manage') as any, async (req:any,res:any)=>{
  const current = await db.getById('gallery', req.params.id);
  if (!current) return res.status(404).json({ success:false, message:'Not found' });
  const parsed = schema.safeParse({ ...current, ...req.body });
  if (!parsed.success) return res.status(400).json({ success:false, message:parsed.error.issues.map(i=>i.message).join(', ') });
  const updated = await db.update('gallery', req.params.id, parsed.data);
  res.json({ success:true, data:playable(updated) });
});
router.delete('/:id', requireAuth as any, requirePermission('gallery.manage') as any, async (req:any,res:any)=>{
  await db.remove('gallery', req.params.id);
  res.json({ success:true});
});
export default router;
