"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asyncRouter_1 = require("../middleware/asyncRouter");
const db_1 = require("../config/db");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const zod_1 = require("zod");
const video_1 = require("../services/video");
const router = (0, asyncRouter_1.asyncRouter)();
const mediaUrl = zod_1.z.string().max(2048).refine(value => /^(https?:\/\/|\/(?!\/))/.test(value), 'Use a valid image URL');
const schema = zod_1.z.object({
    title: zod_1.z.string().trim().min(2).max(150),
    description: zod_1.z.string().max(2000).default(''),
    type: zod_1.z.enum(['image', 'video']),
    url: mediaUrl,
    thumbnail: mediaUrl.default('/images/lawersfoundation.png'),
    category: zod_1.z.string().default('all'),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
}).superRefine((data, ctx) => {
    if (data.type === 'video' && !(0, video_1.videoSource)(data.url))
        ctx.addIssue({ code: 'custom', message: 'Use an HTTPS YouTube, Vimeo, MP4 or WebM URL', path: ['url'] });
});
const playable = (item) => ({ ...item, ...(item.type === 'video' ? { playback: (0, video_1.videoSource)(item.url) } : {}) });
router.get('/', async (req, res) => {
    const { category } = req.query;
    let data = await db_1.db.getAll('gallery');
    if (category === 'videos')
        data = data.filter(d => d.type === 'video');
    else if (category && category !== 'all')
        data = data.filter(d => d.category === category);
    res.json({ success: true, data: data.map(playable) });
});
router.get('/:id', async (req, res) => {
    const item = await db_1.db.getById('gallery', req.params.id);
    if (!item)
        return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: playable(item) });
});
router.post('/', auth_1.requireAuth, (0, rbac_1.requirePermission)('gallery.manage'), async (req, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ success: false, message: parsed.error.issues.map(i => i.message).join(', ') });
    const payload = { ...parsed.data, uploadedAt: new Date().toISOString() };
    const created = await db_1.db.create('gallery', payload);
    res.status(201).json({ success: true, data: playable(created) });
});
router.put('/:id', auth_1.requireAuth, (0, rbac_1.requirePermission)('gallery.manage'), async (req, res) => {
    const current = await db_1.db.getById('gallery', req.params.id);
    if (!current)
        return res.status(404).json({ success: false, message: 'Not found' });
    const parsed = schema.safeParse({ ...current, ...req.body });
    if (!parsed.success)
        return res.status(400).json({ success: false, message: parsed.error.issues.map(i => i.message).join(', ') });
    const updated = await db_1.db.update('gallery', req.params.id, parsed.data);
    res.json({ success: true, data: playable(updated) });
});
router.delete('/:id', auth_1.requireAuth, (0, rbac_1.requirePermission)('gallery.manage'), async (req, res) => {
    await db_1.db.remove('gallery', req.params.id);
    res.json({ success: true });
});
exports.default = router;
