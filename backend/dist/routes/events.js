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
    capacity: zod_1.z.number().int().positive().default(100),
    registeredCount: zod_1.z.number().int().default(0),
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
// RSVP Controller — capacity capped, wired to frontend
const rsvpSchema = zod_1.z.object({ name: zod_1.z.string().min(2), email: zod_1.z.string().email(), phone: zod_1.z.string().optional(), guests: zod_1.z.number().int().min(1).default(1) });
router.post('/:id/rsvp', async (req, res) => {
    const event = await db_1.db.getById('events', req.params.id) || await db_1.db.getBySlug('events', req.params.id);
    if (!event)
        return res.status(404).json({ success: false, message: 'Event not found' });
    const parsed = rsvpSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ success: false, message: parsed.error.issues.map(i => i.message).join(', ') });
    const capacity = Number(event.capacity || 100);
    const registered = Number(event.registeredCount || 0);
    if (registered + parsed.data.guests > capacity)
        return res.status(409).json({ success: false, message: `Event at capacity (${capacity}). Only ${capacity - registered} spots left.` });
    const rsvps = await db_1.db.getAll('rsvps');
    const existing = rsvps.find(r => r.eventId === event.id && r.email === parsed.data.email);
    if (existing)
        return res.status(409).json({ success: false, message: 'Already registered with this email' });
    const rsvp = await db_1.db.create('rsvps', { eventId: event.id, eventTitle: event.title, ...parsed.data, createdAt: new Date().toISOString() });
    await db_1.db.update('events', event.id, { registeredCount: registered + parsed.data.guests });
    res.status(201).json({ success: true, data: rsvp });
});
router.get('/:id/rsvps', auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    const event = await db_1.db.getById('events', req.params.id) || await db_1.db.getBySlug('events', req.params.id);
    if (!event)
        return res.status(404).json({ success: false, message: 'Event not found' });
    const all = await db_1.db.getAll('rsvps');
    const list = all.filter(r => r.eventId === event.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, data: list, meta: { capacity: event.capacity, registered: event.registeredCount, remaining: Number(event.capacity) - Number(event.registeredCount || 0) } });
});
router.get('/rsvps/all', auth_1.requireAuth, auth_1.requireAdmin, async (_req, res) => {
    const all = await db_1.db.getAll('rsvps');
    res.json({ success: true, data: all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) });
});
exports.default = router;
