"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pledgeSchema = void 0;
const asyncRouter_1 = require("../middleware/asyncRouter");
const db_1 = require("../config/db");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const zod_1 = require("zod");
const settings_1 = require("./settings");
const router = (0, asyncRouter_1.asyncRouter)();
exports.pledgeSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2).max(150),
    email: zod_1.z.string().trim().email().max(254),
    phone: zod_1.z.string().trim().max(40).optional(),
    currency: zod_1.z.string().regex(/^[A-Z]{3}$/).optional(),
    amount: zod_1.z.coerce.number().finite().positive(),
    program: zod_1.z.string().max(150).optional(),
    campaign: zod_1.z.string().max(150).optional(),
    frequency: zod_1.z.enum(['once', 'monthly']).default('once'),
    message: zod_1.z.string().max(5000).optional(),
});
router.post('/', async (req, res) => {
    const parsed = exports.pledgeSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, message: parsed.error.issues.map(i => i.message).join(', ') });
        return;
    }
    const settings = await (0, settings_1.getCurrencies)();
    const currency = parsed.data.currency || settings.defaultCurrency;
    if (!settings.currencies.some(c => c.code === currency && c.enabled)) {
        res.status(400).json({ success: false, message: 'This currency is not enabled. Refresh and choose an available currency.' });
        return;
    }
    const digits = new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
    if (Math.abs(parsed.data.amount * 10 ** digits - Math.round(parsed.data.amount * 10 ** digits)) > 0.00001) {
        res.status(400).json({ success: false, message: `Use at most ${digits} decimal places for ${currency}.` });
        return;
    }
    const created = await db_1.db.create('donations', {
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
router.get('/', auth_1.requireAuth, (0, rbac_1.requirePermission)('pledges.view'), async (_req, res) => {
    const data = await db_1.db.getAll('donations');
    res.json({ success: true, data: data.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)) });
});
router.get('/:id', auth_1.requireAuth, (0, rbac_1.requirePermission)('pledges.view'), async (req, res) => {
    const item = await db_1.db.getById('donations', String(req.params.id));
    if (!item) {
        res.status(404).json({ success: false, message: 'Not found' });
        return;
    }
    res.json({ success: true, data: item });
});
exports.default = router;
