"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPLOAD_DIR = void 0;
exports.imageFormat = imageFormat;
const direct_upload_1 = require("../services/direct-upload");
const abuse_1 = require("../services/abuse");
const asyncRouter_1 = require("../middleware/asyncRouter");
const multer_1 = __importDefault(require("multer"));
const crypto_1 = require("crypto");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const cloudinary_1 = require("../services/cloudinary");
const db_1 = require("../config/db");
const errors_1 = require("../middleware/errors");
exports.UPLOAD_DIR = path_1.default.join(db_1.DATA_DIR, 'uploads');
const router = (0, asyncRouter_1.asyncRouter)();
router.post('/authorize', auth_1.requireAuth, (0, rbac_1.requirePermission)('gallery.manage'), async (req, res) => {
    const parsed = direct_upload_1.directUploadSchema.safeParse(req.body);
    if (!parsed.success)
        throw new errors_1.HttpError(400, parsed.error.issues.map(issue => issue.message).join(', '));
    await (0, abuse_1.consumeLimit)('gallery:authorize', req.user.uid, 30, 3600000);
    res.json({ success: true, data: (0, direct_upload_1.authorizeImages)(req.user.uid, parsed.data) });
});
router.post('/complete', auth_1.requireAuth, (0, rbac_1.requirePermission)('gallery.manage'), async (req, res) => {
    const parsed = zod_1.z.object({ ticket: zod_1.z.string().max(16000) }).strict().safeParse(req.body);
    if (!parsed.success)
        throw new errors_1.HttpError(400, 'Invalid upload completion');
    await (0, abuse_1.consumeLimit)('gallery:complete', req.user.uid, 300, 3600000);
    res.json({ success: true, data: await (0, direct_upload_1.completeImage)(parsed.data.ticket, req.user.uid) });
});
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 20, fields: 4 } });
function imageFormat(buffer) {
    if (buffer.length >= 12 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
        return { extension: 'png', mime: 'image/png' };
    if (buffer.length >= 4 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255)
        return { extension: 'jpg', mime: 'image/jpeg' };
    if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP')
        return { extension: 'webp', mime: 'image/webp' };
    return null;
}
const metadataSchema = zod_1.z.object({ title: zod_1.z.string().trim().min(2).max(150), description: zod_1.z.string().trim().max(2000).default(''), category: zod_1.z.enum(['education', 'empowerment', 'caregivers', 'community', 'videos']).default('community') });
async function saveFile(fileData) {
    const format = imageFormat(fileData.buffer);
    const filename = `${(0, crypto_1.randomUUID)()}.${format.extension}`;
    if (process.env.NODE_ENV !== 'test' || process.env.DATA_BACKEND !== 'local')
        return (0, cloudinary_1.uploadCloudinary)(fileData.buffer, format.mime);
    await promises_1.default.mkdir(exports.UPLOAD_DIR, { recursive: true });
    await promises_1.default.writeFile(path_1.default.join(exports.UPLOAD_DIR, filename), fileData.buffer, { flag: 'wx' });
    return { url: `${process.env.PUBLIC_API_URL || 'http://localhost:4000'}/uploads/${filename}`, storageProvider: 'local', storagePublicId: filename, cleanup: () => promises_1.default.unlink(path_1.default.join(exports.UPLOAD_DIR, filename)) };
}
router.post(['/thumbnail', '/gallery', '/images'], auth_1.requireAuth, (0, rbac_1.requirePermission)('gallery.manage'), upload.fields([{ name: 'file', maxCount: 1 }, { name: 'files', maxCount: 20 }]), async (req, res) => {
    const uploaded = req.files || {};
    const files = [...(uploaded.file || []), ...(uploaded.files || [])];
    if (!files.length)
        throw new errors_1.HttpError(400, 'Choose images to upload');
    if (req.path !== '/images' && files.length !== 1)
        throw new errors_1.HttpError(400, 'Use the multiple-image upload endpoint');
    if (files.reduce((size, file) => size + file.size, 0) > 50 * 1024 * 1024)
        throw new errors_1.HttpError(413, 'Upload at most 50 MB per batch');
    if (files.some(file => !imageFormat(file.buffer)))
        throw new errors_1.HttpError(400, 'Every file must be JPEG, PNG or WebP');
    const batchId = (0, crypto_1.randomUUID)();
    const metadata = files.map((file, index) => {
        const title = req.body.title ? `${req.body.title}${files.length > 1 ? ' ' + (index + 1) : ''}` : (path_1.default.parse(file.originalname).name.trim().length >= 2 ? path_1.default.parse(file.originalname).name : `Photo ${index + 1}`);
        const parsed = metadataSchema.safeParse({ title, description: req.body.description || '', category: req.body.category || 'community' });
        if (!parsed.success)
            throw new errors_1.HttpError(400, parsed.error.issues.map(i => i.message).join(', '));
        return parsed.data;
    });
    const saved = [];
    try {
        for (const file of files)
            saved.push(await saveFile(file));
        const items = await db_1.db.createMany('gallery', saved.map((file, index) => ({ ...metadata[index], batchId, type: 'image', storageProvider: file.storageProvider, storagePublicId: file.storagePublicId, url: file.url, thumbnail: file.url, tags: [], uploadedAt: new Date().toISOString() })));
        res.status(201).json({ success: true, ...(req.path === '/images' ? {} : { url: items[0].url }), data: req.path === '/images' ? items : items[0] });
    }
    catch (error) {
        await Promise.allSettled(saved.map(file => file.cleanup()));
        throw error;
    }
});
exports.default = router;
