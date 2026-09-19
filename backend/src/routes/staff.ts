import { z } from 'zod';
import { asyncRouter } from '../middleware/asyncRouter';
import { requirePermission } from '../middleware/rbac';
import { resolveAccess, listRoles, assertCanAssign, bootstrapRole } from '../services/access';
import { PERMISSIONS, DEFAULT_ROLES } from '../config/features';
import { getAuth } from '../config/firebase';
import { db } from '../config/db';
import { HttpError } from '../middleware/errors';
const router = asyncRouter();
const id = z.string().regex(/^[a-z][a-z0-9_]{1,49}$/);
const roleSchema = z.object({ name:z.string().trim().min(2).max(80), permissions:z.array(z.string().refine(p=>PERMISSIONS.includes(p),'Unknown permission')).max(PERMISSIONS.length) });
function normalizePermissions(permissions: string[]) {
  return [...new Set(permissions.flatMap(p => p.endsWith('.manage') ? [p, p.replace('.manage','.view')] : [p]))];
}
router.get('/roles', requirePermission('roles.view'), async (_req,res) => res.json({ success:true, data:{ roles:await listRoles(), permissions:PERMISSIONS } }));
router.post('/roles', requirePermission('roles.manage'), async (req:any,res) => {
  const parsed = roleSchema.extend({ id }).safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues.map(i=>i.message).join(', '));
  if ((await listRoles()).some(r=>r.id===parsed.data.id)) throw new HttpError(409,'This role already exists');
  const permissions = normalizePermissions(parsed.data.permissions);
  assertCanAssign(req.access, permissions);
  res.status(201).json({ success:true, data:await db.create('roles',{ ...parsed.data, permissions, protected:false }) });
});
router.put('/roles/:id', requirePermission('roles.manage'), async (req:any,res) => {
  const role = (await listRoles()).find(r=>r.id===req.params.id);
  if (!role) throw new HttpError(404,'Role not found');
  if (role.protected || DEFAULT_ROLES.some(r=>r.id===role.id && r.protected)) throw new HttpError(403,'This built-in role is protected');
  if (req.access.role===role.id) throw new HttpError(409,'You cannot change your own role permissions. Use the main administrator account.');
  const parsed = roleSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400,parsed.error.issues.map(i=>i.message).join(', '));
  const permissions = normalizePermissions(parsed.data.permissions);
  assertCanAssign(req.access, [...role.permissions, ...permissions]);
  const data = { ...parsed.data, permissions, protected:false };
  if (await db.getById('roles',role.id)) await db.update('roles',role.id,data);
  else await db.create('roles',{ id:role.id,...data });
  res.json({ success:true, data:{ id:role.id,...data } });
});
router.get('/accounts', requirePermission('staff.view'), async (_req,res) => {
  const accounts = await db.getAll('staff');
  res.json({ success:true, data:accounts.map(({ id, email, name, roleId, disabled, createdAt }) => ({ id,email,name,roleId,disabled,createdAt })) });
});
// Expose assignable roles without granting permission to edit those roles.
router.get('/assignable-roles', requirePermission('staff.view'), async (req:any,res) => {
  const access = await resolveAccess(req.user);
  res.json({ success:true, data:(await listRoles()).filter(role => role.id !== 'super_admin' && role.permissions.every((p:string)=>access.permissions.includes(p))) });
});
const accountSchema = z.object({ name:z.string().trim().min(2).max(120), email:z.string().trim().email().transform(v=>v.toLowerCase()), password:z.string().min(12).max(128), roleId:id });
router.post('/accounts', requirePermission('staff.manage'), async (req:any,res) => {
  const parsed = accountSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400,parsed.error.issues.map(i=>i.message).join(', '));
  const { password, roleId, name, email } = parsed.data;
  const role = (await listRoles()).find(r=>r.id===roleId);
  if (!role || roleId==='super_admin' || bootstrapRole(email)==='super_admin') throw new HttpError(400,'Choose an assignable staff role and email');
  assertCanAssign(req.access, role.permissions);
  const auth = getAuth(); if (!auth) throw new HttpError(503,'Firebase Authentication is unavailable');
  let created;
  try { created = await auth.createUser({ email, password, displayName:name, disabled:false }); }
  catch (error:any) { throw new HttpError(error.code==='auth/email-already-exists'?409:400, error.code==='auth/email-already-exists'?'This email already has an account.':'Account creation failed. Check the email and password.'); }
  try {
    const profile = await db.create('staff',{ id:created.uid, email, name, roleId, disabled:false });
    res.status(201).json({ success:true, data:profile });
  } catch (error) { await auth.deleteUser(created.uid); throw error; }
});
router.put('/accounts/:id', requirePermission('staff.manage'), async (req:any,res) => {
  const profile = await db.getById('staff',req.params.id);
  if (!profile) throw new HttpError(404,'Staff account not found');
  if (profile.id===req.user.uid || bootstrapRole(profile.email)==='super_admin' || profile.roleId==='super_admin') throw new HttpError(403,'Your own account and the main administrator are protected');
  const parsed = z.object({ roleId:id, disabled:z.boolean() }).safeParse(req.body);
  if (!parsed.success) throw new HttpError(400,'Choose a role and account status');
  const roles = await listRoles();
  const target = roles.find(r=>r.id===parsed.data.roleId);
  const current = roles.find(r=>r.id===profile.roleId);
  if (!target || target.id==='super_admin') throw new HttpError(400,'Role not assignable');
  assertCanAssign(req.access,[...target.permissions,...(current?.permissions || [])]);
  const auth = getAuth(); if (!auth) throw new HttpError(503,'Firebase Authentication is unavailable');
  await auth.updateUser(profile.id,{ disabled:parsed.data.disabled });
  try { await db.update('staff',profile.id,parsed.data); }
  catch (error) { await auth.updateUser(profile.id,{ disabled:!!profile.disabled }); throw error; }
  res.json({ success:true, data:{ ...profile, ...parsed.data } });
});
export default router;
