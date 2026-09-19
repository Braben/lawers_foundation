import { db } from '../config/db';
import { DEFAULT_ROLES, PERMISSIONS } from '../config/features';
import { HttpError } from '../middleware/errors';
import type { AuthUser } from '../middleware/auth';

export function bootstrapRole(email?: string) {
  const matches = (value?: string) => (value || '').split(',').some(e => e.trim().toLowerCase() === email?.toLowerCase());
  if (!email) return 'viewer';
  if (matches(process.env.ADMIN_EMAILS) || matches(process.env.SUPER_ADMINS)) return 'super_admin';
  if (matches(process.env.CONTENT_PUBLISHERS)) return 'publisher';
  if (matches(process.env.EVENT_MANAGERS)) return 'event_manager';
  return 'viewer';
}
export async function listRoles() {
  const stored = await db.getAll('roles');
  return [...DEFAULT_ROLES.map(role => role.protected ? role : stored.find(r => r.id === role.id) || role), ...stored.filter(role => !DEFAULT_ROLES.some(r => r.id === role.id))];
}
export async function resolveAccess(user: AuthUser) {
  if (bootstrapRole(user.email) === 'super_admin') return { role: 'super_admin', permissions: [...PERMISSIONS], protected: true };
  const staff = await db.getById('staff', user.uid);
  if (staff?.disabled) throw new HttpError(403, 'This staff account is disabled.');
  const roleId = staff?.roleId || bootstrapRole(user.email);
  const role = (await listRoles()).find(r => r.id === roleId);
  return { role: roleId, permissions: (role?.permissions || []).filter((p: string) => PERMISSIONS.includes(p)), protected: false };
}
export function assertCanAssign(actor: { permissions: string[] }, permissions: string[]) {
  if (permissions.some(p => !actor.permissions.includes(p))) throw new HttpError(403, 'You cannot grant permissions you do not have.');
}
