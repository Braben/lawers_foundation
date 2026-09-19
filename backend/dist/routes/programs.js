"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asyncRouter_1 = require("../middleware/asyncRouter");
const db_1 = require("../config/db");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const zod_1 = require("zod");
const router = (0, asyncRouter_1.asyncRouter)();
const schema = zod_1.z.object({
    slug: zod_1.z.string().min(2),
    title: zod_1.z.string().min(2),
    icon: zod_1.z.string().optional(),
    shortDescription: zod_1.z.string().min(10),
    fullDescription: zod_1.z.string().min(10),
    features: zod_1.z.array(zod_1.z.string()).default([]),
    impactStats: zod_1.z.array(zod_1.z.object({ value: zod_1.z.string(), label: zod_1.z.string() })).default([]),
    gallery: zod_1.z.array(zod_1.z.string()).default([]),
    isActive: zod_1.z.boolean().default(true),
    order: zod_1.z.number().default(99),
});
router.get('/', async (req, res) => {
    const data = await db_1.db.getAll('programs');
    data.sort((a, b) => (a.order || 99) - (b.order || 99));
    res.json({ success: true, data });
});
router.get('/:slug', async (req, res) => {
    const item = await db_1.db.getBySlug('programs', req.params.slug) || await db_1.db.getById('programs', req.params.slug);
    if (!item)
        return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
});
router.post('/', auth_1.requireAuth, (0, rbac_1.requirePermission)('content.manage'), async (req, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ success: false, message: parsed.error.message });
    const created = await db_1.db.create('programs', parsed.data);
    res.status(201).json({ success: true, data: created });
});
router.put('/:id', auth_1.requireAuth, (0, rbac_1.requirePermission)('content.manage'), async (req, res) => {
    const current = await db_1.db.getById('programs', req.params.id);
    if (!current)
        return res.status(404).json({ success: false, message: 'Not found' });
    const parsed = schema.safeParse({ ...current, ...req.body });
    if (!parsed.success)
        return res.status(400).json({ success: false, message: parsed.error.issues.map(i => i.message).join(', ') });
    const updated = await db_1.db.update('programs', req.params.id, parsed.data);
    res.json({ success: true, data: updated });
});
router.delete('/:id', auth_1.requireAuth, (0, rbac_1.requirePermission)('content.manage'), async (req, res) => {
    await db_1.db.remove('programs', req.params.id);
    res.json({ success: true });
});
exports.default = router;
