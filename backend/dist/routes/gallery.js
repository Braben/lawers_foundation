"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../config/db");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const schema = zod_1.z.object({
    title: zod_1.z.string().min(2),
    description: zod_1.z.string().min(5),
    type: zod_1.z.enum(['image', 'video']),
    url: zod_1.z.string().min(5),
    thumbnail: zod_1.z.string().min(3),
    category: zod_1.z.string().default('all'),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
}).superRefine((data, ctx) => {
    if (data.type === 'video') {
        const isLink = /^https?:\/\//.test(data.url);
        const isYoutube = /youtube\.com|youtu\.be|vimeo\.com/.test(data.url);
        if (!isLink)
            ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, message: 'Video must be a link (YouTube/Vimeo URL), not a file upload', path: ['url'] });
        if (data.url.includes(' ') || data.url.endsWith('.mp4'))
            ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, message: 'Videos are link-only — use YouTube/Vimeo URL. Thumbnail & description are set by admin.', path: ['url'] });
    }
});
router.get('/', async (req, res) => {
    const { category } = req.query;
    let data = await db_1.db.getAll('gallery');
    if (category && category !== 'all')
        data = data.filter(d => d.category === category);
    res.json({ success: true, data });
});
router.get('/:id', async (req, res) => {
    const item = await db_1.db.getById('gallery', req.params.id);
    if (!item)
        return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
});
router.post('/', auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ success: false, message: parsed.error.issues.map(i => i.message).join(', ') });
    const payload = { ...parsed.data, uploadedAt: new Date().toISOString() };
    const created = await db_1.db.create('gallery', payload);
    res.status(201).json({ success: true, data: created });
});
router.put('/:id', auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    const updated = await db_1.db.update('gallery', req.params.id, req.body);
    res.json({ success: true, data: updated });
});
router.delete('/:id', auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    await db_1.db.remove('gallery', req.params.id);
    res.json({ success: true });
});
exports.default = router;
