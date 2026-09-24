import { protectSubmission } from '../services/abuse';
import { asyncRouter } from '../middleware/asyncRouter';
import { db } from '../config/db';
import { requireAuth } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { z } from 'zod';
const router = asyncRouter();

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
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(5).max(5000),

});

router.post('/', protectSubmission('contact'), async (req:any,res:any)=>{
  const parsed = schema.safeParse(req.body);
  if(!parsed.success) return res.status(400).json({ success:false, message: parsed.error.issues.map(i=>i.message).join(', ')});
  const tags = autoTags(parsed.data.subject, parsed.data.message, parsed.data.email);
  const payload:any = { ...parsed.data, tags, status:'new', createdAt: new Date().toISOString() };
  const created = await db.create('contacts' as any, payload);
  res.status(201).json({ success:true, data: created, message: 'Message received. We will respond within 24-48 hours.' });
});

router.get('/', requireAuth as any, requirePermission('contacts.view') as any, async (req:any,res:any)=>{
  const { tag } = req.query;
  let data = await db.getAll('contacts' as any) as any[];
  if (tag && tag!=='all') data = data.filter(d=> (d.tags||[]).includes(tag));
  data = data.sort((a,b)=> new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
  res.json({ success:true, data });
});

router.get('/export/csv', requireAuth as any, requirePermission('contacts.view') as any, async (req:any,res:any)=>{
  const { tag } = req.query;
  let data = await db.getAll('contacts' as any) as any[];
  if (tag && tag!=='all') data = data.filter(d=> (d.tags||[]).includes(tag));
  const header = ['Name','Email','Phone','Subject','Message','Tags','CreatedAt'];
  const cell = (value: unknown) => {
    const text = String(value ?? '');
    const safe = /^[=+@\-\t\r\n]/.test(text) ? "'" + text : text;
    return '"' + safe.replace(/"/g, '""') + '"';
  };
  const rows = data.map(d => [d.name, d.email, d.phone, d.subject, d.message, (d.tags || []).join('|'), d.createdAt].map(cell).join(','));
  const csv = [header.join(','), ...rows].join('\n');
  res.setHeader('Content-Type','text/csv');
  res.setHeader('Content-Disposition','attachment; filename="contacts.csv"');
  res.send(csv);
});

router.get('/:id', requireAuth as any, requirePermission('contacts.view') as any, async (req:any,res:any)=>{
  const item = await db.getById('contacts' as any, req.params.id);
  if(!item) return res.status(404).json({ success:false, message:'Not found'});
  res.json({ success:true, data:item });
});

router.put('/:id', requireAuth as any, requirePermission('contacts.manage') as any, async (req:any,res:any)=>{
  const parsed = schema.partial().extend({
    tags:z.array(z.enum(['Donor','Volunteer','Subscriber','Caregiver','Education','General'])).max(6).optional(),
    status:z.enum(['new','in_progress','resolved','archived']).optional(),
  }).strict().refine(value=>Object.keys(value).length>0).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({success:false,message:'Invalid contact update fields.'}); return; }
  const updated = await db.update('contacts', String(req.params.id), parsed.data);
  res.json({ success:true, data:updated });
});

export default router;
