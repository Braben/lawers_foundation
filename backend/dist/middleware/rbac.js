"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserRole = getUserRole;
exports.requireRole = requireRole;
function parseEmails(env) {
    return (env || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
}
function getUserRole(email) {
    if (!email)
        return 'viewer';
    const e = email.toLowerCase();
    const supers = parseEmails(process.env.ADMIN_EMAILS || process.env.SUPER_ADMINS);
    const pubs = parseEmails(process.env.CONTENT_PUBLISHERS);
    const events = parseEmails(process.env.EVENT_MANAGERS);
    if (supers.includes(e))
        return 'super_admin';
    if (pubs.includes(e))
        return 'publisher';
    if (events.includes(e))
        return 'event_manager';
    if (supers.length === 0 && pubs.length === 0 && events.length === 0)
        return 'super_admin';
    return 'viewer';
}
function requireRole(...roles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user)
            return res.status(401).json({ success: false, message: 'Authentication required' });
        const role = getUserRole(user.email);
        req.role = role;
        if (roles.length && !roles.includes(role) && role !== 'super_admin') {
            return res.status(403).json({ success: false, message: `Requires role: ${roles.join(' or ')} (your role: ${role})` });
        }
        next();
    };
}
