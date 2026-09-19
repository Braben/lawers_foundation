"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asyncRouter_1 = require("../middleware/asyncRouter");
const db_1 = require("../config/db");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const zod_1 = require("zod");
const router = (0, asyncRouter_1.asyncRouter)();
function autoTags(subject, message, email) {
    const s = `${subject} ${message} ${email}`.toLowerCase();
    const tags = [];
    if (s.includes('donat') || s.includes('sponsor') || s.includes('payment'))
        tags.push('Donor');
    if (s.includes('volunteer') || s.includes('mentor') || s.includes('training'))
        tags.push('Volunteer');
    if (s.includes('subscribe') || s.includes('newsletter'))
        tags.push('Subscriber');
    if (s.includes('caregiver') || s.includes('house help') || s.includes('care'))
        tags.push('Caregiver');
    if (s.includes('orphan') || s.includes('child') || s.includes('education'))
        tags.push('Education');
    if (tags.length === 0)
        tags.push('General');
    return [...new Set(tags)];
}
const schema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
    subject: zod_1.z.string().min(2),
    message: zod_1.z.string().min(5),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
router.post('/', async (req, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ success: false, message: parsed.error.issues.map(i => i.message).join(', ') });
    const tags = parsed.data.tags?.length ? parsed.data.tags : autoTags(parsed.data.subject, parsed.data.message, parsed.data.email);
    const payload = { ...parsed.data, tags, status: 'new', createdAt: new Date().toISOString() };
    const created = await db_1.db.create('contacts', payload);
    res.status(201).json({ success: true, data: created, message: 'Message received. We will respond within 24-48 hours.' });
});
router.get('/', auth_1.requireAuth, (0, rbac_1.requirePermission)('contacts.view'), async (req, res) => {
    const { tag } = req.query;
    let data = await db_1.db.getAll('contacts');
    if (tag && tag !== 'all')
        data = data.filter(d => (d.tags || []).includes(tag));
    data = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, data });
});
router.get('/export/csv', auth_1.requireAuth, (0, rbac_1.requirePermission)('contacts.view'), async (req, res) => {
    const { tag } = req.query;
    let data = await db_1.db.getAll('contacts');
    if (tag && tag !== 'all')
        data = data.filter(d => (d.tags || []).includes(tag));
    const header = ['Name', 'Email', 'Phone', 'Subject', 'Message', 'Tags', 'CreatedAt'];
    const cell = (value) => {
        const text = String(value ?? '');
        const safe = /^[=+@\-\t\r\n]/.test(text) ? "'" + text : text;
        return '"' + safe.replace(/"/g, '""') + '"';
    };
    const rows = data.map(d => [d.name, d.email, d.phone, d.subject, d.message, (d.tags || []).join('|'), d.createdAt].map(cell).join(','));
    const csv = [header.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="contacts.csv"');
    res.send(csv);
});
router.get('/:id', auth_1.requireAuth, (0, rbac_1.requirePermission)('contacts.view'), async (req, res) => {
    const item = await db_1.db.getById('contacts', req.params.id);
    if (!item)
        return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
});
router.put('/:id', auth_1.requireAuth, (0, rbac_1.requirePermission)('contacts.manage'), async (req, res) => {
    const updated = await db_1.db.update('contacts', req.params.id, { ...req.body, updatedAt: new Date().toISOString() });
    res.json({ success: true, data: updated });
});
exports.default = router;
