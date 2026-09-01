import { Request, Response, NextFunction } from 'express';
import { getAuth, isFirebaseReady } from '../config/firebase';

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
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1] || '', 'base64').toString());
      (req as any).user = { uid: payload.sub || payload.user_id || 'mock', email: payload.email } as AuthUser;
    } catch { (req as any).user = { uid: 'mock', email: 'mock@example.com' }; }
    return next();
  }
  try {
    const decoded = await getAuth()!.verifyIdToken(token);
    (req as any).user = { uid: decoded.uid, email: decoded.email, name: decoded.name } as AuthUser;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).user) return res.status(401).json({ success: false, message: 'Authentication required. Sign in with Google.' });
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as AuthUser | null;
  if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (admins.length === 0) return next();
  if (!user.email || !admins.includes(user.email.toLowerCase())) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}
