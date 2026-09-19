"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeVisits = summarizeVisits;
const crypto_1 = require("crypto");
const zod_1 = require("zod");
const asyncRouter_1 = require("../middleware/asyncRouter");
const rbac_1 = require("../middleware/rbac");
const errors_1 = require("../middleware/errors");
const db_1 = require("../config/db");
const router = (0, asyncRouter_1.asyncRouter)();
const pageViewSchema = zod_1.z.object({ eventId: zod_1.z.string().uuid(), visitorId: zod_1.z.string().uuid(), sessionId: zod_1.z.string().uuid(), path: zod_1.z.string().max(300).regex(/^\/(?!\/)[^?#]*$/), referrer: zod_1.z.string().max(200).default('direct') });
const requests = new Map();
router.post('/pageview', async (req, res) => {
    if (req.get('DNT') === '1' || req.get('Sec-GPC') === '1') {
        res.status(202).json({ success: true, data: null });
        return;
    }
    if (req.get('origin') && req.get('origin') !== (process.env.FRONTEND_URL || 'http://localhost:3000'))
        throw new errors_1.HttpError(403, 'Origin not allowed');
    const parsed = pageViewSchema.safeParse(req.body);
    if (!parsed.success)
        throw new errors_1.HttpError(400, 'Invalid visit');
    const path = parsed.data.path;
    if (path.startsWith('/admin') || path.startsWith('/api')) {
        res.status(202).json({ success: true, data: null });
        return;
    }
    const now = Date.now();
    const key = req.ip || 'unknown';
    for (const [address, value] of requests)
        if (now - value.start > 60000)
            requests.delete(address);
    if (requests.size > 10000 && !requests.has(key))
        throw new errors_1.HttpError(429, 'Please try later');
    const rate = requests.get(key) || { start: now, count: 0 };
    rate.count++;
    requests.set(key, rate);
    if (rate.count > 120)
        throw new errors_1.HttpError(429, 'Too many visits');
    const hash = (value) => (0, crypto_1.createHash)('sha256').update(`${process.env.FIREBASE_PROJECT_ID || 'test'}:${value}`).digest('hex');
    let referrer = 'direct';
    try {
        referrer = new URL(parsed.data.referrer).hostname;
    }
    catch { }
    try {
        await db_1.db.create('analyticsEvents', { id: parsed.data.eventId, visitorId: hash(parsed.data.visitorId), sessionId: hash(parsed.data.sessionId), path, referrer, expiresAt: new Date(now + 90 * 86400000) });
    }
    catch (error) {
        if (error.code !== 6 && error.status !== 409)
            throw error;
    }
    res.status(202).json({ success: true, data: null });
});
function summarizeVisits(events, from, to) {
    const days = new Map();
    for (let date = new Date(from); date <= new Date(to); date.setUTCDate(date.getUTCDate() + 1)) {
        const key = date.toISOString().slice(0, 10);
        days.set(key, { date: key, pageViews: 0, visitors: new Set(), sessions: new Set() });
    }
    const pages = Object.create(null);
    const referrers = Object.create(null);
    const visitors = new Set();
    const sessions = new Set();
    for (const event of events) {
        visitors.add(event.visitorId);
        sessions.add(event.sessionId);
        pages[event.path] = (pages[event.path] || 0) + 1;
        referrers[event.referrer || 'direct'] = (referrers[event.referrer || 'direct'] || 0) + 1;
        const day = days.get(event.createdAt.slice(0, 10));
        if (day) {
            day.pageViews++;
            day.visitors.add(event.visitorId);
            day.sessions.add(event.sessionId);
        }
    }
    return { pageViews: events.length, visits: sessions.size, uniqueVisitors: visitors.size,
        daily: [...days.values()].map(d => ({ date: d.date, pageViews: d.pageViews, visits: d.sessions.size, uniqueVisitors: d.visitors.size })),
        topPages: Object.entries(pages).map(([path, views]) => ({ path, views })).sort((a, b) => b.views - a.views).slice(0, 20),
        referrers: Object.entries(referrers).map(([source, views]) => ({ source, views })).sort((a, b) => b.views - a.views).slice(0, 10),
    };
}
router.get('/summary', (0, rbac_1.requirePermission)('analytics.view'), async (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    const parsed = zod_1.z.object({ from: zod_1.z.string().date(), to: zod_1.z.string().date() }).safeParse({ from: req.query.from || new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10), to: req.query.to || today });
    if (!parsed.success)
        throw new errors_1.HttpError(400, 'Use valid start and end dates');
    const { from, to } = parsed.data;
    if (from > to || to > today || Date.parse(to) - Date.parse(from) > 89 * 86400000)
        throw new errors_1.HttpError(400, 'Choose a period of up to 90 days ending today or earlier');
    const events = await db_1.db.range('analyticsEvents', 'createdAt', from + 'T00:00:00.000Z', to + 'T23:59:59.999Z');
    res.json({ success: true, data: { ...summarizeVisits(events, from, to), from, to, truncated: events.length === 50000 } });
});
exports.default = router;
