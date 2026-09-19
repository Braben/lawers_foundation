"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const asyncRouter_1 = require("../middleware/asyncRouter");
const rbac_1 = require("../middleware/rbac");
const access_1 = require("../services/access");
const features_1 = require("../config/features");
const firebase_1 = require("../config/firebase");
const db_1 = require("../config/db");
const errors_1 = require("../middleware/errors");
const router = (0, asyncRouter_1.asyncRouter)();
const id = zod_1.z.string().regex(/^[a-z][a-z0-9_]{1,49}$/);
const roleSchema = zod_1.z.object({ name: zod_1.z.string().trim().min(2).max(80), permissions: zod_1.z.array(zod_1.z.string().refine(p => features_1.PERMISSIONS.includes(p), 'Unknown permission')).max(features_1.PERMISSIONS.length) });
function normalizePermissions(permissions) {
    return [...new Set(permissions.flatMap(p => p.endsWith('.manage') ? [p, p.replace('.manage', '.view')] : [p]))];
}
router.get('/roles', (0, rbac_1.requirePermission)('roles.view'), async (_req, res) => res.json({ success: true, data: { roles: await (0, access_1.listRoles)(), permissions: features_1.PERMISSIONS } }));
router.post('/roles', (0, rbac_1.requirePermission)('roles.manage'), async (req, res) => {
    const parsed = roleSchema.extend({ id }).safeParse(req.body);
    if (!parsed.success)
        throw new errors_1.HttpError(400, parsed.error.issues.map(i => i.message).join(', '));
    if ((await (0, access_1.listRoles)()).some(r => r.id === parsed.data.id))
        throw new errors_1.HttpError(409, 'This role already exists');
    const permissions = normalizePermissions(parsed.data.permissions);
    (0, access_1.assertCanAssign)(req.access, permissions);
    res.status(201).json({ success: true, data: await db_1.db.create('roles', { ...parsed.data, permissions, protected: false }) });
});
router.put('/roles/:id', (0, rbac_1.requirePermission)('roles.manage'), async (req, res) => {
    const role = (await (0, access_1.listRoles)()).find(r => r.id === req.params.id);
    if (!role)
        throw new errors_1.HttpError(404, 'Role not found');
    if (role.protected || features_1.DEFAULT_ROLES.some(r => r.id === role.id && r.protected))
        throw new errors_1.HttpError(403, 'This built-in role is protected');
    if (req.access.role === role.id)
        throw new errors_1.HttpError(409, 'You cannot change your own role permissions. Use the main administrator account.');
    const parsed = roleSchema.safeParse(req.body);
    if (!parsed.success)
        throw new errors_1.HttpError(400, parsed.error.issues.map(i => i.message).join(', '));
    const permissions = normalizePermissions(parsed.data.permissions);
    (0, access_1.assertCanAssign)(req.access, [...role.permissions, ...permissions]);
    const data = { ...parsed.data, permissions, protected: false };
    if (await db_1.db.getById('roles', role.id))
        await db_1.db.update('roles', role.id, data);
    else
        await db_1.db.create('roles', { id: role.id, ...data });
    res.json({ success: true, data: { id: role.id, ...data } });
});
router.get('/accounts', (0, rbac_1.requirePermission)('staff.view'), async (_req, res) => {
    const accounts = await db_1.db.getAll('staff');
    res.json({ success: true, data: accounts.map(({ id, email, name, roleId, disabled, createdAt }) => ({ id, email, name, roleId, disabled, createdAt })) });
});
// Expose assignable roles without granting permission to edit those roles.
router.get('/assignable-roles', (0, rbac_1.requirePermission)('staff.view'), async (req, res) => {
    const access = await (0, access_1.resolveAccess)(req.user);
    res.json({ success: true, data: (await (0, access_1.listRoles)()).filter(role => role.id !== 'super_admin' && role.permissions.every((p) => access.permissions.includes(p))) });
});
const accountSchema = zod_1.z.object({ name: zod_1.z.string().trim().min(2).max(120), email: zod_1.z.string().trim().email().transform(v => v.toLowerCase()), password: zod_1.z.string().min(12).max(128), roleId: id });
router.post('/accounts', (0, rbac_1.requirePermission)('staff.manage'), async (req, res) => {
    const parsed = accountSchema.safeParse(req.body);
    if (!parsed.success)
        throw new errors_1.HttpError(400, parsed.error.issues.map(i => i.message).join(', '));
    const { password, roleId, name, email } = parsed.data;
    const role = (await (0, access_1.listRoles)()).find(r => r.id === roleId);
    if (!role || roleId === 'super_admin' || (0, access_1.bootstrapRole)(email) === 'super_admin')
        throw new errors_1.HttpError(400, 'Choose an assignable staff role and email');
    (0, access_1.assertCanAssign)(req.access, role.permissions);
    const auth = (0, firebase_1.getAuth)();
    if (!auth)
        throw new errors_1.HttpError(503, 'Firebase Authentication is unavailable');
    let created;
    try {
        created = await auth.createUser({ email, password, displayName: name, disabled: false });
    }
    catch (error) {
        throw new errors_1.HttpError(error.code === 'auth/email-already-exists' ? 409 : 400, error.code === 'auth/email-already-exists' ? 'This email already has an account.' : 'Account creation failed. Check the email and password.');
    }
    try {
        const profile = await db_1.db.create('staff', { id: created.uid, email, name, roleId, disabled: false });
        res.status(201).json({ success: true, data: profile });
    }
    catch (error) {
        await auth.deleteUser(created.uid);
        throw error;
    }
});
router.put('/accounts/:id', (0, rbac_1.requirePermission)('staff.manage'), async (req, res) => {
    const profile = await db_1.db.getById('staff', req.params.id);
    if (!profile)
        throw new errors_1.HttpError(404, 'Staff account not found');
    if (profile.id === req.user.uid || (0, access_1.bootstrapRole)(profile.email) === 'super_admin' || profile.roleId === 'super_admin')
        throw new errors_1.HttpError(403, 'Your own account and the main administrator are protected');
    const parsed = zod_1.z.object({ roleId: id, disabled: zod_1.z.boolean() }).safeParse(req.body);
    if (!parsed.success)
        throw new errors_1.HttpError(400, 'Choose a role and account status');
    const roles = await (0, access_1.listRoles)();
    const target = roles.find(r => r.id === parsed.data.roleId);
    const current = roles.find(r => r.id === profile.roleId);
    if (!target || target.id === 'super_admin')
        throw new errors_1.HttpError(400, 'Role not assignable');
    (0, access_1.assertCanAssign)(req.access, [...target.permissions, ...(current?.permissions || [])]);
    const auth = (0, firebase_1.getAuth)();
    if (!auth)
        throw new errors_1.HttpError(503, 'Firebase Authentication is unavailable');
    await auth.updateUser(profile.id, { disabled: parsed.data.disabled });
    try {
        await db_1.db.update('staff', profile.id, parsed.data);
    }
    catch (error) {
        await auth.updateUser(profile.id, { disabled: !!profile.disabled });
        throw error;
    }
    res.json({ success: true, data: { ...profile, ...parsed.data } });
});
exports.default = router;
