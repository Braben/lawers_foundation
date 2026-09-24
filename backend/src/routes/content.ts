import { contentSchemas } from '../services/content-schema';
import { asyncRouter } from '../middleware/asyncRouter';
import { db } from '../config/db';
import { requireAuth } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
const router = asyncRouter();

router.get('/:id', async (req:any,res:any)=>{
  const item = await db.getById('siteContent', req.params.id);
  if(!item) return res.status(404).json({ success:false, message:'Not found'});
  res.json({ success:true, data:item});
});
router.get('/', async (req:any,res:any)=>{
  const data = await db.getAll('siteContent');
  res.json({ success:true, data});
});
router.put('/:id', requireAuth as any, requirePermission('content.manage') as any, async (req:any,res:any)=>{
  const key = String(req.params.id);
  const schema = Object.prototype.hasOwnProperty.call(contentSchemas,key) ? contentSchemas[key as keyof typeof contentSchemas] : undefined;
  const parsed = schema?.safeParse(req.body);
  if (!parsed?.success || !Object.keys(parsed.data).length) return res.status(400).json({success:false,message:'Unknown page or invalid content fields.'});
  const existing = await db.getById('siteContent', key);
  if (!existing) {
    const created = await db.create('siteContent', { ...parsed.data, id: key });
    return res.json({ success:true, data:created});
  }
  const updated = await db.update('siteContent', key, parsed.data);
  res.json({ success:true, data:updated});
});
export default router;
