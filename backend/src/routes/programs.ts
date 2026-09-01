import { Router } from 'express';
import { db } from '../config/db';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const schema = z.object({
  slug: z.string().min(2),
  title: z.string().min(2),
  icon: z.string().optional(),
  shortDescription: z.string().min(10),
  fullDescription: z.string().min(10),
  features: z.array(z.string()).default([]),
  impactStats: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
  gallery: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  order: z.number().default(99),
});

router.get('/', async (req:any, res:any) => {
  const data = await db.getAll('programs');
  data.sort((a: any, b: any) => (a.order || 99) - (b.order || 99));
  res.json({ success: true, data });
});

router.get('/:slug', async (req:any, res:any) => {
  const item = await db.getBySlug('programs', req.params.slug) || await db.getById('programs', req.params.slug);
  if (!item) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: item });
});

router.post('/', requireAuth as any, requireAdmin as any, async (req:any, res:any) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.message });
  const created = await db.create('programs', parsed.data);
  res.status(201).json({ success: true, data: created });
});

router.put('/:id', requireAuth as any, requireAdmin as any, async (req:any, res:any) => {
  const updated = await db.update('programs', (req.params as any).id, req.body);
  res.json({ success: true, data: updated });
});

router.delete('/:id', requireAuth as any, requireAdmin as any, async (req:any, res:any) => {
  await db.remove('programs', (req.params as any).id);
  res.json({ success: true });
});

export default router;
