import { Router } from 'express';
import multer from 'multer';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { getStorage, isFirebaseReady } from '../config/firebase';
const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5*1024*1024 } });

router.post('/thumbnail', requireAuth as any, requireAdmin as any, upload.single('file'), async (req:any,res:any)=>{
  if (!req.file) return res.status(400).json({ success:false, message:'No file'});
  if (!isFirebaseReady()) {
    return res.json({ success:true, url: `/uploads/${req.file.originalname}`, note: 'Mock — configure Firebase Storage to get real URL. Use external URL for thumbnail instead.'});
  }
  const bucket = getStorage()!.bucket();
  const filename = `thumbnails/${Date.now()}-${req.file.originalname}`;
  const file = bucket.file(filename);
  await file.save(req.file.buffer, { contentType: req.file.mimetype, public: true });
  const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;
  res.json({ success:true, url });
});
export default router;
