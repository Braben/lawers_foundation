"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapRole = bootstrapRole;
exports.listRoles = listRoles;
exports.resolveAccess = resolveAccess;
exports.assertCanAssign = assertCanAssign;
const db_1 = require("../config/db");
const features_1 = require("../config/features");
const errors_1 = require("../middleware/errors");
function bootstrapRole(email) {
    const matches = (value) => (value || '').split(',').some(e => e.trim().toLowerCase() === email?.toLowerCase());
    if (!email)
        return 'viewer';
    if (matches(process.env.ADMIN_EMAILS) || matches(process.env.SUPER_ADMINS))
        return 'super_admin';
    if (matches(process.env.CONTENT_PUBLISHERS))
        return 'publisher';
    if (matches(process.env.EVENT_MANAGERS))
        return 'event_manager';
    return 'viewer';
}
async function listRoles() {
    const stored = await db_1.db.getAll('roles');
    return [...features_1.DEFAULT_ROLES.map(role => role.protected ? role : stored.find(r => r.id === role.id) || role), ...stored.filter(role => !features_1.DEFAULT_ROLES.some(r => r.id === role.id))];
}
async function resolveAccess(user) {
    if (bootstrapRole(user.email) === 'super_admin')
        return { role: 'super_admin', permissions: [...features_1.PERMISSIONS], protected: true };
    const staff = await db_1.db.getById('staff', user.uid);
    if (staff?.disabled)
        throw new errors_1.HttpError(403, 'This staff account is disabled.');
    const roleId = staff?.roleId || bootstrapRole(user.email);
    const role = (await listRoles()).find(r => r.id === roleId);
    return { role: roleId, permissions: (role?.permissions || []).filter((p) => features_1.PERMISSIONS.includes(p)), protected: false };
}
function assertCanAssign(actor, permissions) {
    if (permissions.some(p => !actor.permissions.includes(p)))
        throw new errors_1.HttpError(403, 'You cannot grant permissions you do not have.');
}
