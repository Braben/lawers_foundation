"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.directUploadSchema = exports.MAX_IMAGE_BYTES = void 0;
exports.readTicket = readTicket;
exports.authorizeImages = authorizeImages;
exports.completeImage = completeImage;
const crypto_1 = require("crypto");
const zod_1 = require("zod");
const db_1 = require("../config/db");
const errors_1 = require("../middleware/errors");
exports.MAX_IMAGE_BYTES = 5 * 1024 * 1024;
exports.directUploadSchema = zod_1.z.object({
    files: zod_1.z.array(zod_1.z.object({ name: zod_1.z.string().min(1).max(255), size: zod_1.z.number().int().positive().max(exports.MAX_IMAGE_BYTES) }).strict()).min(1).max(20),
    title: zod_1.z.string().trim().max(140).default(''),
    description: zod_1.z.string().max(2000).default(''),
    category: zod_1.z.enum(['education', 'empowerment', 'caregivers', 'community', 'videos']).default('community'),
}).strict().refine(data => data.files.reduce((sum, file) => sum + file.size, 0) <= 50 * 1024 * 1024, 'Upload at most 50 MB per batch');
function credentials() {
    const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = process.env;
    if (!cloud || !/^[\w-]+$/.test(cloud) || !key || !secret)
        throw new errors_1.HttpError(503, 'Cloudinary uploads are not configured. Contact the administrator.');
    return { cloud, key, secret };
}
function seal(ticket) {
    const payload = Buffer.from(JSON.stringify(ticket)).toString('base64url');
    return `${payload}.${(0, crypto_1.createHmac)('sha256', credentials().secret).update('gallery-ticket:' + payload).digest('base64url')}`;
}
function readTicket(token, uid) {
    const [payload, signature, ...extra] = token.split('.');
    if (!payload || !signature || extra.length)
        throw new errors_1.HttpError(400, 'Invalid upload authorization');
    const expected = (0, crypto_1.createHmac)('sha256', credentials().secret).update('gallery-ticket:' + payload).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !(0, crypto_1.timingSafeEqual)(actual, expected))
        throw new errors_1.HttpError(403, 'Invalid upload authorization');
    let ticket;
    try {
        ticket = JSON.parse(Buffer.from(payload, 'base64url').toString());
    }
    catch {
        throw new errors_1.HttpError(400, 'Invalid upload authorization');
    }
    if (ticket.uid !== uid)
        throw new errors_1.HttpError(403, 'This upload belongs to another account');
    if (ticket.expires < Date.now())
        throw new errors_1.HttpError(410, 'Upload authorization expired. Select the image again.');
    return ticket;
}
function authorizeImages(uid, data) {
    const { cloud, key, secret } = credentials();
    const batchId = (0, crypto_1.randomUUID)();
    const timestamp = String(Math.floor(Date.now() / 1000));
    return data.files.map((file, index) => {
        const id = (0, crypto_1.randomUUID)();
        const publicId = `lawers-foundation/gallery/${id}`;
        const filename = file.name.replace(/\.[^.]+$/, '').trim();
        const title = (data.title ? data.title + (data.files.length > 1 ? ' ' + (index + 1) : '') : filename.length >= 2 ? filename : `Photo ${index + 1}`).slice(0, 150);
        const fields = { public_id: publicId, timestamp, overwrite: 'false', allowed_formats: 'jpg,jpeg,png,webp' };
        const signature = (0, crypto_1.createHash)('sha256').update(Object.keys(fields).sort().map(k => `${k}=${fields[k]}`).join('&') + secret).digest('hex');
        return { ticket: seal({ uid, id, batchId, publicId, size: file.size, title, description: data.description, category: data.category, expires: Date.now() + 3600000 }),
            uploadUrl: `https://api.cloudinary.com/v1_1/${cloud}/image/upload`, fields: { ...fields, api_key: key, signature } };
    });
}
async function completeImage(token, uid) {
    const ticket = readTicket(token, uid);
    const existing = await db_1.db.getById('gallery', ticket.id);
    if (existing)
        return existing;
    const { cloud, key, secret } = credentials();
    // Read provider metadata ourselves; never accept browser-supplied URLs, bytes or formats.
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/resources/image/upload/${encodeURIComponent(ticket.publicId)}`, {
        headers: { Authorization: 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64') }, signal: AbortSignal.timeout(15000), redirect: 'error',
    });
    if (response.status === 404)
        throw new errors_1.HttpError(409, 'The image has not finished uploading. Retry saving it.');
    if (!response.ok)
        throw new errors_1.HttpError(503, 'Could not verify the uploaded image. Please retry; check Cloudinary usage if this continues.');
    const asset = await response.json();
    if (asset.public_id !== ticket.publicId || asset.resource_type !== 'image' || asset.type !== 'upload' || !['jpg', 'jpeg', 'png', 'webp'].includes(String(asset.format)) ||
        !Number.isInteger(asset.bytes) || Number(asset.bytes) <= 0 || Number(asset.bytes) > exports.MAX_IMAGE_BYTES || asset.bytes !== ticket.size || !Number.isInteger(asset.width) || !Number.isInteger(asset.height) || Number(asset.width) <= 0 || Number(asset.height) <= 0) {
        throw new errors_1.HttpError(400, 'Uploaded image does not match the authorized file or exceeds the image limits.');
    }
    const url = String(asset.secure_url);
    if (!url.startsWith(`https://res.cloudinary.com/${cloud}/image/upload/`))
        throw new errors_1.HttpError(502, 'Image storage returned an invalid delivery URL.');
    try {
        return await db_1.db.create('gallery', { id: ticket.id, batchId: ticket.batchId, title: ticket.title, description: ticket.description, category: ticket.category, type: 'image',
            url, thumbnail: url, tags: [], storageProvider: 'cloudinary', storagePublicId: ticket.publicId, uploadedBy: uid, uploadedAt: new Date().toISOString() });
    }
    catch (error) {
        // A retried or concurrent completion can only publish this predetermined ID once.
        if (error.code === 6 || error.status === 409) {
            const saved = await db_1.db.getById('gallery', ticket.id);
            if (saved)
                return saved;
        }
        throw error;
    }
}
