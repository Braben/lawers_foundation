import { Request, Response, NextFunction } from 'express';
import { getAuth, isFirebaseReady } from '../config/firebase';
import { requirePermission } from './rbac';

export interface AuthUser {
  uid: string;
  email?: string;
  name?: string;
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    (req as any).user = null;
    return next();
  }
  const token = header.split(' ')[1];
  if (!isFirebaseReady()) {
    return res.status(503).json({ success: false, message: 'Authentication is not configured. Contact the administrator.' });
  }
  try {
    const decoded = await getAuth()!.verifyIdToken(token, true);
    (req as any).user = { uid: decoded.uid, email: decoded.email, name: decoded.name } as AuthUser;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).user) return res.status(401).json({ success: false, message: 'Authentication required. Sign in with your staff account.' });
  next();
}

export const requireAdmin = requirePermission('staff.manage');
