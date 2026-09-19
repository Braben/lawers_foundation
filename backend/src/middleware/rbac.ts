import { Request, Response, NextFunction } from 'express';
import { resolveAccess, bootstrapRole } from '../services/access';
import { HttpError } from './errors';
export const getUserRole = bootstrapRole;
export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = req as any;
      if (!request.user) throw new HttpError(401, 'Authentication required');
      const access = request.access || await resolveAccess(request.user);
      request.access = access;
      if (!access.permissions.includes(permission)) throw new HttpError(403, `Access to ${permission} is disabled for your role.`);
      next();
    } catch (error) { next(error); }
  };
}
