import { clientAddress, consumeLimit } from '../services/abuse';
import { createHash } from 'crypto';
import { z } from 'zod';
import { asyncRouter } from '../middleware/asyncRouter';
import { requirePermission } from '../middleware/rbac';
import { HttpError } from '../middleware/errors';
import { db } from '../config/db';
const router = asyncRouter();
const pageViewSchema = z.object({ eventId:z.string().uuid(), visitorId:z.string().uuid(), sessionId:z.string().uuid(), path:z.string().max(300).regex(/^\/(?!\/)[^?#]*$/), referrer:z.string().max(200).default('direct') });

router.post('/pageview', async (req,res) => {
  if (req.get('DNT')==='1' || req.get('Sec-GPC')==='1') { res.status(202).json({ success:true, data:null }); return; }
  if (req.get('origin') && req.get('origin') !== ((process.env.FRONTEND_URL || 'http://localhost:3000').trim().replace(/\/+$/, ''))) throw new HttpError(403,'Origin not allowed');
  const parsed = pageViewSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400,'Invalid visit');
  const path = parsed.data.path;
  if (path.startsWith('/admin') || path.startsWith('/api')) { res.status(202).json({ success:true,data:null }); return; }
  const now = Date.now();
  await consumeLimit('analytics:minute', clientAddress(req), 120, 60000);
  await consumeLimit('analytics:daily', 'global', 10000, 86400000);
  const hash = (value:string) => createHash('sha256').update(`${process.env.FIREBASE_PROJECT_ID || 'test'}:${value}`).digest('hex');
  let referrer = 'direct';
  try { referrer = new URL(parsed.data.referrer).hostname; } catch {}
  try {
    await db.create('analyticsEvents',{ id:parsed.data.eventId, visitorId:hash(parsed.data.visitorId), sessionId:hash(parsed.data.sessionId), path, referrer, expiresAt:new Date(now+90*86400000) });
  } catch (error:any) { if (error.code!==6 && error.status!==409) throw error; }
  res.status(202).json({ success:true,data:null });
});
export function summarizeVisits(events: Record<string,any>[], from:string, to:string) {
  const days = new Map<string, { date:string; pageViews:number; visitors:Set<string>; sessions:Set<string> }>();
  for (let date = new Date(from); date <= new Date(to); date.setUTCDate(date.getUTCDate()+1)) { const key=date.toISOString().slice(0,10); days.set(key,{ date:key,pageViews:0,visitors:new Set(),sessions:new Set() }); }
  const pages:Record<string,number> = Object.create(null); const referrers:Record<string,number> = Object.create(null);
  const visitors = new Set<string>(); const sessions = new Set<string>();
  for (const event of events) {
    visitors.add(event.visitorId); sessions.add(event.sessionId);
    pages[event.path] = (pages[event.path] || 0)+1; referrers[event.referrer || 'direct']=(referrers[event.referrer || 'direct'] || 0)+1;
    const day = days.get(event.createdAt.slice(0,10));
    if (day) { day.pageViews++; day.visitors.add(event.visitorId); day.sessions.add(event.sessionId); }
  }
  return { pageViews:events.length, visits:sessions.size, uniqueVisitors:visitors.size,
    daily:[...days.values()].map(d=>({ date:d.date, pageViews:d.pageViews, visits:d.sessions.size, uniqueVisitors:d.visitors.size })),
    topPages:Object.entries(pages).map(([path,views])=>({path,views})).sort((a,b)=>b.views-a.views).slice(0,20),
    referrers:Object.entries(referrers).map(([source,views])=>({source,views})).sort((a,b)=>b.views-a.views).slice(0,10),
  };
}
router.get('/summary', requirePermission('analytics.view'), async (req,res) => {
  const today = new Date().toISOString().slice(0,10);
  const parsed = z.object({ from:z.string().date(), to:z.string().date() }).safeParse({ from:req.query.from || new Date(Date.now()-29*86400000).toISOString().slice(0,10), to:req.query.to || today });
  if (!parsed.success) throw new HttpError(400,'Use valid start and end dates');
  const { from,to }=parsed.data;
  if (from>to || to>today || Date.parse(to)-Date.parse(from)>89*86400000) throw new HttpError(400,'Choose a period of up to 90 days ending today or earlier');
  const events = await db.range('analyticsEvents','createdAt',from+'T00:00:00.000Z',to+'T23:59:59.999Z');
  res.json({success:true,data:{ ...summarizeVisits(events,from,to),from,to,truncated:events.length===50000 }});
});
export default router;
