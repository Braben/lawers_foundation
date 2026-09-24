import { protectSubmission } from '../services/abuse';
import { asyncRouter } from '../middleware/asyncRouter';
import { db } from '../config/db';
import { requireAuth } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { z } from 'zod';
import { getCurrencies } from './settings';
const router = asyncRouter();
export const pledgeSchema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional(),
  currency: z.string().regex(/^[A-Z]{3}$/).optional(),
  amount: z.coerce.number().finite().positive(),
  program: z.string().max(150).optional(),
  campaign: z.string().max(150).optional(),
  frequency: z.enum(['once', 'monthly']).default('once'),
  message: z.string().max(5000).optional(),
});
router.post('/', protectSubmission('pledge'), async (req, res) => {
  const parsed = pledgeSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ success: false, message: parsed.error.issues.map(i => i.message).join(', ') }); return; }
  const settings = await getCurrencies();
  const currency = parsed.data.currency || settings.defaultCurrency;
  if (!settings.currencies.some(c => c.code === currency && c.enabled)) { res.status(400).json({ success:false, message:'This currency is not enabled. Refresh and choose an available currency.' }); return; }
  const digits = new Intl.NumberFormat('en', { style:'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
  if (Math.abs(parsed.data.amount * 10 ** digits - Math.round(parsed.data.amount * 10 ** digits)) > 0.00001) { res.status(400).json({success:false,message:`Use at most ${digits} decimal places for ${currency}.`}); return; }
  const created = await db.create('donations', {
    ...parsed.data, currency, donorName: parsed.data.name,
    campaign: parsed.data.campaign || parsed.data.program || 'General',
    status: 'pledged', paymentStatus: 'not_collected',
  });
  res.status(201).json({ success: true, data: created, message: 'Pledge received. Please contact the administrator for payment details. No payment has been collected.' });
});
// This website records pledges only; it never accepts payment notifications.
router.post('/webhook', (_req, res) => {
  res.status(410).json({ success: false, message: 'Online payments are not supported. Contact the administrator for payment details.' });
});
router.get('/', requireAuth, requirePermission('pledges.view'), async (_req, res) => {
  const data = await db.getAll('donations');
  res.json({ success: true, data: data.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)) });
});
router.get('/:id', requireAuth, requirePermission('pledges.view'), async (req, res) => {
  const item = await db.getById('donations', String(req.params.id));
  if (!item) { res.status(404).json({ success: false, message: 'Not found' }); return; }
  res.json({ success: true, data: item });
});
export default router;
