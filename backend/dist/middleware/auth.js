"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
const firebase_1 = require("../config/firebase");
async function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        req.user = null;
        return next();
    }
    const token = header.split(' ')[1];
    if (!(0, firebase_1.isFirebaseReady)()) {
        try {
            const payload = JSON.parse(Buffer.from(token.split('.')[1] || '', 'base64').toString());
            req.user = { uid: payload.sub || payload.user_id || 'mock', email: payload.email };
        }
        catch {
            req.user = { uid: 'mock', email: 'mock@example.com' };
        }
        return next();
    }
    try {
        const decoded = await (0, firebase_1.getAuth)().verifyIdToken(token);
        req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name };
        next();
    }
    catch (e) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
}
function requireAuth(req, res, next) {
    if (!req.user)
        return res.status(401).json({ success: false, message: 'Authentication required. Sign in with Google.' });
    next();
}
function requireAdmin(req, res, next) {
    const user = req.user;
    if (!user)
        return res.status(401).json({ success: false, message: 'Authentication required' });
    const admins = (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const supers = (process.env.SUPER_ADMINS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const all = [...admins, ...supers].filter(Boolean);
    if (all.length === 0)
        return next();
    if (!user.email || !all.includes(user.email.toLowerCase())) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
}
