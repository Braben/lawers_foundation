"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../config/db");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const schema = zod_1.z.object({
    slug: zod_1.z.string().min(2),
    title: zod_1.z.string().min(2),
    description: zod_1.z.string().min(10),
    date: zod_1.z.string(),
    endDate: zod_1.z.string().optional(),
    time: zod_1.z.string().default('10:00 AM'),
    endTime: zod_1.z.string().optional(),
    location: zod_1.z.object({ name: zod_1.z.string(), address: zod_1.z.string().default(''), city: zod_1.z.string().default('') }),
    image: zod_1.z.string().default(''),
    isOnline: zod_1.z.boolean().default(false),
    meetingLink: zod_1.z.string().optional(),
    registrationRequired: zod_1.z.boolean().default(false),
    registrationLink: zod_1.z.string().optional(),
    category: zod_1.z.string().default('workshop'),
    isFeatured: zod_1.z.boolean().default(false),
    isPast: zod_1.z.boolean().default(false),
});
router.get('/', async (req, res) => {
    const { category } = req.query;
    let data = await db_1.db.getAll('events');
    if (category && category !== 'all')
        data = data.filter(d => d.category === category);
    res.json({ success: true, data });
});
router.get('/:slug', async (req, res) => {
    const item = await db_1.db.getBySlug('events', req.params.slug) || await db_1.db.getById('events', req.params.slug);
    if (!item)
        return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
});
router.post('/', auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ success: false, message: parsed.error.message });
    const created = await db_1.db.create('events', parsed.data);
    res.status(201).json({ success: true, data: created });
});
router.put('/:id', auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    const updated = await db_1.db.update('events', req.params.id, req.body);
    res.json({ success: true, data: updated });
});
router.delete('/:id', auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    await db_1.db.remove('events', req.params.id);
    res.json({ success: true });
});
exports.default = router;
