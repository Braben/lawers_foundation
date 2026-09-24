"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const content_schema_1 = require("../services/content-schema");
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
    const key = String(req.params.id);
    const schema = Object.prototype.hasOwnProperty.call(content_schema_1.contentSchemas, key) ? content_schema_1.contentSchemas[key] : undefined;
    const parsed = schema?.safeParse(req.body);
    if (!parsed?.success || !Object.keys(parsed.data).length)
        return res.status(400).json({ success: false, message: 'Unknown page or invalid content fields.' });
    const existing = await db_1.db.getById('siteContent', key);
    if (!existing) {
        const created = await db_1.db.create('siteContent', { ...parsed.data, id: key });
        return res.json({ success: true, data: created });
    }
    const updated = await db_1.db.update('siteContent', key, parsed.data);
    res.json({ success: true, data: updated });
});
exports.default = router;
