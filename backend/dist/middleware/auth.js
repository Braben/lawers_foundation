"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
exports.authMiddleware = authMiddleware;
exports.requireAuth = requireAuth;
const firebase_1 = require("../config/firebase");
const rbac_1 = require("./rbac");
async function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        req.user = null;
        return next();
    }
    const token = header.split(' ')[1];
    if (!(0, firebase_1.isFirebaseReady)()) {
        return res.status(503).json({ success: false, message: 'Authentication is not configured. Contact the administrator.' });
    }
    try {
        const decoded = await (0, firebase_1.getAuth)().verifyIdToken(token, true);
        req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name };
        next();
    }
    catch (e) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
}
function requireAuth(req, res, next) {
    if (!req.user)
        return res.status(401).json({ success: false, message: 'Authentication required. Sign in with your staff account.' });
    next();
}
exports.requireAdmin = (0, rbac_1.requirePermission)('staff.manage');
