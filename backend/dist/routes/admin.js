"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asyncRouter_1 = require("../middleware/asyncRouter");
const db_1 = require("../config/db");
const rbac_1 = require("../middleware/rbac");
const router = (0, asyncRouter_1.asyncRouter)();
router.get('/stats', (0, rbac_1.requirePermission)('analytics.view'), async (req, res) => {
    const can = (feature) => req.access.permissions.includes(feature + '.view');
    const [donations, events, stories, contacts] = await Promise.all([
        can('pledges') ? db_1.db.getAll('donations') : [], can('events') ? db_1.db.getAll('events') : [], can('content') ? db_1.db.getAll('stories') : [], can('contacts') ? db_1.db.getAll('contacts') : [],
    ]);
    const pledges = donations.filter(d => d.status === 'pledged');
    const totalsByCurrency = {};
    for (const pledge of pledges) {
        const currency = pledge.currency || 'GHS';
        totalsByCurrency[currency] = Math.round(((totalsByCurrency[currency] || 0) + Number(pledge.amount || 0)) * 1000) / 1000;
    }
    res.json({ success: true, data: { totalDonations: pledges.length, totalsByCurrency, upcomingEvents: events.filter(e => !e.isPast && (e.endDate || e.date) >= new Date().toISOString().slice(0, 10)).length, totalContacts: contacts.length, totalStories: stories.length,
            recentStories: stories.sort((a, b) => Date.parse(b.publishedAt || b.createdAt) - Date.parse(a.publishedAt || a.createdAt)).slice(0, 3),
            recentDonations: donations.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 5), permissions: req.access.permissions } });
});
exports.default = router;
