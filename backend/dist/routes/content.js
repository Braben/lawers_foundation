"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asyncRouter_1 = require("../middleware/asyncRouter");
const db_1 = require("../config/db");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, asyncRouter_1.asyncRouter)();
router.get('/:id', async (req, res) => {
    const item = await db_1.db.getById('siteContent', req.params.id);
    if (!item)
        return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
});
router.get('/', async (req, res) => {
    const data = await db_1.db.getAll('siteContent');
    res.json({ success: true, data });
});
router.put('/:id', auth_1.requireAuth, (0, rbac_1.requirePermission)('content.manage'), async (req, res) => {
    const existing = await db_1.db.getById('siteContent', req.params.id);
    if (!existing) {
        const created = await db_1.db.create('siteContent', { id: req.params.id, ...req.body });
        return res.json({ success: true, data: created });
    }
    const updated = await db_1.db.update('siteContent', req.params.id, req.body);
    res.json({ success: true, data: updated });
});
exports.default = router;
