"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencySchema = void 0;
exports.getCurrencies = getCurrencies;
const zod_1 = require("zod");
const asyncRouter_1 = require("../middleware/asyncRouter");
const rbac_1 = require("../middleware/rbac");
const db_1 = require("../config/db");
const features_1 = require("../config/features");
const errors_1 = require("../middleware/errors");
const router = (0, asyncRouter_1.asyncRouter)();
const currency = zod_1.z.string().regex(/^[A-Z]{3}$/).refine(code => Intl.supportedValuesOf('currency').includes(code), 'Use a supported ISO currency code');
exports.currencySchema = zod_1.z.object({
    defaultCurrency: currency,
    currencies: zod_1.z.array(zod_1.z.object({ code: currency, name: zod_1.z.string().trim().min(1).max(80), enabled: zod_1.z.boolean() })).min(1).max(40),
}).superRefine((value, ctx) => {
    if (new Set(value.currencies.map(c => c.code)).size !== value.currencies.length)
        ctx.addIssue({ code: 'custom', message: 'Currency codes must be unique' });
    if (!value.currencies.some(c => c.code === value.defaultCurrency && c.enabled))
        ctx.addIssue({ code: 'custom', message: 'The default currency must be enabled' });
});
async function getCurrencies() {
    const stored = await db_1.db.getById('settings', 'currencies');
    return exports.currencySchema.parse(stored || features_1.DEFAULT_CURRENCIES);
}
router.get('/currencies', async (_req, res) => {
    const settings = await getCurrencies();
    res.json({ success: true, data: { ...settings, currencies: settings.currencies.filter(c => c.enabled) } });
});
router.get('/admin/currencies', (0, rbac_1.requirePermission)('settings.view'), async (_req, res) => {
    res.json({ success: true, data: await getCurrencies() });
});
router.put('/currencies', (0, rbac_1.requirePermission)('settings.manage'), async (req, res) => {
    const parsed = exports.currencySchema.safeParse(req.body);
    if (!parsed.success)
        throw new errors_1.HttpError(400, parsed.error.issues.map(i => i.message).join(', '));
    if (await db_1.db.getById('settings', 'currencies'))
        await db_1.db.update('settings', 'currencies', parsed.data);
    else
        await db_1.db.create('settings', { id: 'currencies', ...parsed.data });
    res.json({ success: true, data: parsed.data });
});
exports.default = router;
