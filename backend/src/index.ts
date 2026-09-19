import express from 'express';
import { errorHandler } from './middleware/errors';
import { UPLOAD_DIR } from './routes/upload';
import cors from 'cors';
import dotenv from 'dotenv';
import { initFirebase } from './config/firebase';
import { authMiddleware } from './middleware/auth';
import programs from './routes/programs';
import stories from './routes/stories';
import events from './routes/events';
import gallery from './routes/gallery';
import content from './routes/content';
import upload from './routes/upload';
import donations from './routes/donations';
import contacts from './routes/contacts';
import settings from './routes/settings';
import staff from './routes/staff';
import analytics from './routes/analytics';

dotenv.config();
initFirebase();

export const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(UPLOAD_DIR, { dotfiles: 'deny', setHeaders: res => { res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); } }));
app.use(authMiddleware as any);

app.get('/health', (_req,res)=>res.json({ success:true, message:'Lawers Foundation API running', database: process.env.NODE_ENV === 'test' ? 'test' : 'firestore' }));

app.use('/api/programs', programs);
app.use('/api/stories', stories);
app.use('/api/events', events);
app.use('/api/gallery', gallery);
app.use('/api/content', content);
app.use('/api/upload', upload);
app.use('/api/donations', donations);
app.use('/api/contacts', contacts);
app.use('/api/settings', settings);
app.use('/api/staff', staff);
app.use('/api/analytics', analytics);
import adminStats from './routes/admin';
import { resolveAccess } from './services/access';
import { asyncRouter } from './middleware/asyncRouter';
app.use('/api/admin', adminStats);
const authRoutes = asyncRouter();
authRoutes.get(['/role', '/me'], async (req:any,res) => {
  if (!req.user) { res.status(401).json({ success:false, message:'Not authenticated' }); return; }
  const access = await resolveAccess(req.user);
  res.json({ success:true, data:{ ...req.user, ...access } });
});
app.use('/api/auth', authRoutes);

app.use((_req,res)=>res.status(404).json({ success:false, message:'Not found'}));

app.use(errorHandler);
if (require.main === module) app.listen(PORT, ()=>console.log(`Backend running on http://localhost:${PORT}`));
