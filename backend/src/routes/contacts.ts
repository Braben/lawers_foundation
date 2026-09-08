import { Router } from 'express';
import { db } from '../config/db';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { z } from 'zod';
const router = Router();

function autoTags(subject: string, message: string, email: string): string[] {
  const s = `${subject} ${message} ${email}`.toLowerCase();
  const tags: string[] = [];
  if (s.includes('donat') || s.includes('sponsor') || s.includes('payment')) tags.push('Donor');
  if (s.includes('volunteer') || s.includes('mentor') || s.includes('training')) tags.push('Volunteer');
  if (s.includes('subscribe') || s.includes('newsletter')) tags.push('Subscriber');
  if (s.includes('caregiver') || s.includes('house help') || s.includes('care')) tags.push('Caregiver');
  if (s.includes('orphan') || s.includes('child') || s.includes('education')) tags.push('Education');
  if (tags.length===0) tags.push('General');
  return [...new Set(tags)];
}

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(2),
  message: z.string().min(5),
  tags: z.array(z.string()).optional(),
});

router.post('/', async (req:any,res:any)=>{
  const parsed = schema.safeParse(req.body);
  if(!parsed.success) return res.status(400).json({ success:false, message: parsed.error.issues.map(i=>i.message).join(', ')});
  const tags = parsed.data.tags?.length ? parsed.data.tags : autoTags(parsed.data.subject, parsed.data.message, parsed.data.email);
  const payload:any = { ...parsed.data, tags, status:'new', createdAt: new Date().toISOString() };
  const created = await db.create('contacts' as any, payload);
  res.status(201).json({ success:true, data: created, message: 'Message received. We will respond within 24-48 hours.' });
});

router.get('/', requireAuth as any, requireAdmin as any, async (req:any,res:any)=>{
  const { tag } = req.query;
  let data = await db.getAll('contacts' as any) as any[];
  if (tag && tag!=='all') data = data.filter(d=> (d.tags||[]).includes(tag));
  data = data.sort((a,b)=> new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
  res.json({ success:true, data });
});

router.get('/export/csv', requireAuth as any, requireAdmin as any, async (req:any,res:any)=>{
  const { tag } = req.query;
  let data = await db.getAll('contacts' as any) as any[];
  if (tag && tag!=='all') data = data.filter(d=> (d.tags||[]).includes(tag));
  const header = ['Name','Email','Phone','Subject','Message','Tags','CreatedAt'];
  const rows = data.map(d=> [d.name, d.email, d.phone||'', d.subject, `"${String(d.message).replace(/"/g,'""')}"`, (d.tags||[]).join('|'), d.createdAt].map(v=> `"${String(v).replace(/"/g,'""')}"`).join(','));
  const csv = [header.join(','), ...rows].join('\n');
  res.setHeader('Content-Type','text/csv');
  res.setHeader('Content-Disposition','attachment; filename="contacts.csv"');
  res.send(csv);
});

router.get('/:id', requireAuth as any, requireAdmin as any, async (req:any,res:any)=>{
  const item = await db.getById('contacts' as any, req.params.id);
  if(!item) return res.status(404).json({ success:false, message:'Not found'});
  res.json({ success:true, data:item });
});

router.put('/:id', requireAuth as any, requireAdmin as any, async (req:any,res:any)=>{
  const updated = await db.update('contacts' as any, req.params.id, { ...req.body, updatedAt: new Date().toISOString()});
  res.json({ success:true, data:updated });
});

export default router;
