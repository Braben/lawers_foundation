import { Router } from 'express';
import { db } from '../config/db';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { z } from 'zod';
const router = Router();

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  amount: z.number().positive().optional(),
  amountGHS: z.union([z.number(), z.string()]).optional(),
  program: z.string().optional(),
  frequency: z.enum(['once','monthly']).default('once'),
  message: z.string().optional(),
  method: z.string().optional(),
});

router.post('/', async (req:any,res:any)=>{
  const body = { ...req.body };
  if (typeof body.amount === 'string') body.amount = Number(body.amount);
  if (typeof body.amountGHS === 'string') body.amount = Number(body.amountGHS);
  const parsed = schema.safeParse(body);
  if(!parsed.success) return res.status(400).json({ success:false, message: parsed.error.issues.map(i=>i.message).join(', ')});
  const payload:any = { ...parsed.data, status:'pending', createdAt: new Date().toISOString() };
  const created = await db.create('donations' as any, payload);
  res.status(201).json({ success:true, data: created });
});

router.get('/', requireAuth as any, requireAdmin as any, async (req:any,res:any)=>{
  let data = await db.getAll('donations' as any) as any[];
  data = data.sort((a,b)=> new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
  res.json({ success:true, data });
});

router.get('/:id', requireAuth as any, requireAdmin as any, async (req:any,res:any)=>{
  const item = await db.getById('donations' as any, req.params.id);
  if(!item) return res.status(404).json({ success:false, message:'Not found'});
  res.json({ success:true, data:item });
});

router.put('/:id', requireAuth as any, requireAdmin as any, async (req:any,res:any)=>{
  const updated = await db.update('donations' as any, req.params.id, { ...req.body, updatedAt: new Date().toISOString()});
  res.json({ success:true, data:updated });
});

export default router;
