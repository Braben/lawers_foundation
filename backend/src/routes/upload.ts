import { authorizeImages, completeImage, directUploadSchema } from '../services/direct-upload';
import { consumeLimit } from '../services/abuse';
import { asyncRouter } from '../middleware/asyncRouter';
import multer from 'multer';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';
import { uploadCloudinary } from '../services/cloudinary';
import { db, DATA_DIR } from '../config/db';
import { HttpError } from '../middleware/errors';
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const router = asyncRouter();
router.post('/authorize', requireAuth, requirePermission('gallery.manage'), async (req:any,res)=>{
  const parsed=directUploadSchema.safeParse(req.body);
  if(!parsed.success)throw new HttpError(400,parsed.error.issues.map(issue=>issue.message).join(', '));
  await consumeLimit('gallery:authorize',req.user.uid,30,3600000);
  res.json({success:true,data:authorizeImages(req.user.uid,parsed.data)});
});
router.post('/complete', requireAuth, requirePermission('gallery.manage'), async(req:any,res)=>{
  const parsed=z.object({ticket:z.string().max(16000)}).strict().safeParse(req.body);
  if(!parsed.success)throw new HttpError(400,'Invalid upload completion');
  await consumeLimit('gallery:complete',req.user.uid,300,3600000);
  res.json({success:true,data:await completeImage(parsed.data.ticket,req.user.uid)});
});
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 20, fields: 4 } });
export function imageFormat(buffer: Buffer): { extension: string; mime: string } | null {
  if (buffer.length >= 12 && buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return { extension: 'png', mime: 'image/png' };
  if (buffer.length >= 4 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return { extension: 'jpg', mime: 'image/jpeg' };
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return { extension: 'webp', mime: 'image/webp' };
  return null;
}
const metadataSchema = z.object({ title: z.string().trim().min(2).max(150), description: z.string().trim().max(2000).default(''), category: z.enum(['education','empowerment','caregivers','community','videos']).default('community') });
async function saveFile(fileData: Express.Multer.File) {
  const format = imageFormat(fileData.buffer)!;
  const filename = `${randomUUID()}.${format.extension}`;
  if (process.env.NODE_ENV !== 'test' || process.env.DATA_BACKEND !== 'local') return uploadCloudinary(fileData.buffer,format.mime);
  await fs.mkdir(UPLOAD_DIR,{ recursive:true });
  await fs.writeFile(path.join(UPLOAD_DIR,filename),fileData.buffer,{ flag:'wx' });
  return { url:`${process.env.PUBLIC_API_URL || 'http://localhost:4000'}/uploads/${filename}`, storageProvider:'local', storagePublicId:filename, cleanup:()=>fs.unlink(path.join(UPLOAD_DIR,filename)) };
}
router.post(['/thumbnail','/gallery','/images'], requireAuth, requirePermission('gallery.manage'), upload.fields([{name:'file',maxCount:1},{name:'files',maxCount:20}]), async (req,res) => {
  const uploaded = req.files as Record<string,Express.Multer.File[]> || {};
  const files = [...(uploaded.file || []),...(uploaded.files || [])];
  if (!files.length) throw new HttpError(400,'Choose images to upload');
  if (req.path !== '/images' && files.length !== 1) throw new HttpError(400,'Use the multiple-image upload endpoint');
  if (files.reduce((size,file)=>size+file.size,0)>50*1024*1024) throw new HttpError(413,'Upload at most 50 MB per batch');
  if (files.some(file=>!imageFormat(file.buffer))) throw new HttpError(400,'Every file must be JPEG, PNG or WebP');
  const batchId=randomUUID();
  const metadata=files.map((file,index)=>{
    const title = req.body.title ? `${req.body.title}${files.length>1?' '+(index+1):''}` : (path.parse(file.originalname).name.trim().length>=2?path.parse(file.originalname).name:`Photo ${index+1}`);
    const parsed=metadataSchema.safeParse({title,description:req.body.description || '',category:req.body.category || 'community'});
    if (!parsed.success) throw new HttpError(400,parsed.error.issues.map(i=>i.message).join(', '));
    return parsed.data;
  });
  const saved:Awaited<ReturnType<typeof saveFile>>[]=[];
  try {
    for (const file of files) saved.push(await saveFile(file));
    const items=await db.createMany('gallery',saved.map((file,index)=>({ ...metadata[index],batchId,type:'image',storageProvider:file.storageProvider,storagePublicId:file.storagePublicId,url:file.url,thumbnail:file.url,tags:[],uploadedAt:new Date().toISOString() })));
    res.status(201).json({ success:true, ...(req.path==='/images'?{}:{url:items[0].url}), data:req.path==='/images'?items:items[0] });
  } catch(error) { await Promise.allSettled(saved.map(file=>file.cleanup())); throw error; }
});
export default router;
