import express from 'express';
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

dotenv.config();
initFirebase();

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(authMiddleware as any);

app.get('/health', (_req,res)=>res.json({ success:true, message:'Lawers Foundation API running', firebase: process.env.FIREBASE_PROJECT_ID ? 'configured' : 'mock-local-json' }));

app.use('/api/programs', programs);
app.use('/api/stories', stories);
app.use('/api/events', events);
app.use('/api/gallery', gallery);
app.use('/api/content', content);
app.use('/api/upload', upload);
app.use('/api/donations', donations);
app.use('/api/contacts', contacts);

app.use('/api/auth/me', (req:any,res)=>{
  if (!req.user) return res.status(401).json({ success:false, message:'Not authenticated'});
  res.json({ success:true, data:req.user});
});

app.use((_req,res)=>res.status(404).json({ success:false, message:'Not found'}));

app.listen(PORT, ()=>console.log(`Backend running on http://localhost:${PORT}`));
