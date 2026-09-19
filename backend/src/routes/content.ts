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
  const existing = await db.getById('siteContent', req.params.id);
  if (!existing) {
    const created = await db.create('siteContent', { id: req.params.id, ...req.body });
    return res.json({ success:true, data:created});
  }
  const updated = await db.update('siteContent', req.params.id, req.body);
  res.json({ success:true, data:updated});
});
export default router;
