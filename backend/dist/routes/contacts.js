"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../config/db");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const schema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
    subject: zod_1.z.string().min(2),
    message: zod_1.z.string().min(5),
});
router.post('/', async (req, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ success: false, message: parsed.error.issues.map(i => i.message).join(', ') });
    const payload = { ...parsed.data, status: 'new', createdAt: new Date().toISOString() };
    const created = await db_1.db.create('contacts', payload);
    res.status(201).json({ success: true, data: created, message: 'Message received. We will respond within 24-48 hours.' });
});
router.get('/', auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    let data = await db_1.db.getAll('contacts');
    data = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, data });
});
router.get('/:id', auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    const item = await db_1.db.getById('contacts', req.params.id);
    if (!item)
        return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
});
router.put('/:id', auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    const updated = await db_1.db.update('contacts', req.params.id, { ...req.body, updatedAt: new Date().toISOString() });
    res.json({ success: true, data: updated });
});
exports.default = router;
