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
    excerpt: zod_1.z.string().min(10),
    content: zod_1.z.string().default(''),
    featuredImage: zod_1.z.string().default(''),
    author: zod_1.z.object({ name: zod_1.z.string(), avatar: zod_1.z.string().optional() }).default({ name: 'Admin', avatar: '' }),
    category: zod_1.z.string().default('news'),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    isFeatured: zod_1.z.boolean().default(false),
    readTime: zod_1.z.number().default(5),
});
router.get('/', async (req, res) => {
    const { category } = req.query;
    let data = await db_1.db.getAll('stories');
    if (category && category !== 'all')
        data = data.filter(d => d.category === category);
    data.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    res.json({ success: true, data });
});
router.get('/:slug', async (req, res) => {
    const item = await db_1.db.getBySlug('stories', req.params.slug) || await db_1.db.getById('stories', req.params.slug);
    if (!item)
        return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
});
router.post('/', auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ success: false, message: parsed.error.message });
    const payload = { ...parsed.data, publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const created = await db_1.db.create('stories', payload);
    res.status(201).json({ success: true, data: created });
});
router.put('/:id', auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    const updated = await db_1.db.update('stories', req.params.id, { ...req.body, updatedAt: new Date().toISOString() });
    res.json({ success: true, data: updated });
});
router.delete('/:id', auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    await db_1.db.remove('stories', req.params.id);
    res.json({ success: true });
});
exports.default = router;
