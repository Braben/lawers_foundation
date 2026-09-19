import { z } from 'zod';
import { asyncRouter } from '../middleware/asyncRouter';
import { requirePermission } from '../middleware/rbac';
import { db } from '../config/db';
import { DEFAULT_CURRENCIES } from '../config/features';
import { HttpError } from '../middleware/errors';
const router = asyncRouter();
const currency = z.string().regex(/^[A-Z]{3}$/).refine(code => Intl.supportedValuesOf('currency').includes(code), 'Use a supported ISO currency code');
export const currencySchema = z.object({
  defaultCurrency: currency,
  currencies: z.array(z.object({ code: currency, name: z.string().trim().min(1).max(80), enabled: z.boolean() })).min(1).max(40),
}).superRefine((value, ctx) => {
  if (new Set(value.currencies.map(c => c.code)).size !== value.currencies.length) ctx.addIssue({ code:'custom', message:'Currency codes must be unique' });
  if (!value.currencies.some(c => c.code === value.defaultCurrency && c.enabled)) ctx.addIssue({ code:'custom', message:'The default currency must be enabled' });
});
export async function getCurrencies() {
  const stored = await db.getById('settings', 'currencies');
  return currencySchema.parse(stored || DEFAULT_CURRENCIES);
}
router.get('/currencies', async (_req,res) => {
  const settings = await getCurrencies();
  res.json({ success:true, data:{ ...settings, currencies:settings.currencies.filter(c => c.enabled) } });
});
router.get('/admin/currencies', requirePermission('settings.view'), async (_req,res) => {
  res.json({ success:true, data:await getCurrencies() });
});
router.put('/currencies', requirePermission('settings.manage'), async (req,res) => {
  const parsed = currencySchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues.map(i=>i.message).join(', '));
  if (await db.getById('settings','currencies')) await db.update('settings','currencies',parsed.data);
  else await db.create('settings',{ id:'currencies', ...parsed.data });
  res.json({ success:true, data:parsed.data });
});
export default router;
