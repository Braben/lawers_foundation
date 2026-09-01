"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middleware/auth");
const firebase_1 = require("../config/firebase");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
router.post('/thumbnail', auth_1.requireAuth, auth_1.requireAdmin, upload.single('file'), async (req, res) => {
    if (!req.file)
        return res.status(400).json({ success: false, message: 'No file' });
    if (!(0, firebase_1.isFirebaseReady)()) {
        return res.json({ success: true, url: `/uploads/${req.file.originalname}`, note: 'Mock — configure Firebase Storage to get real URL. Use external URL for thumbnail instead.' });
    }
    const bucket = (0, firebase_1.getStorage)().bucket();
    const filename = `thumbnails/${Date.now()}-${req.file.originalname}`;
    const file = bucket.file(filename);
    await file.save(req.file.buffer, { contentType: req.file.mimetype, public: true });
    const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    res.json({ success: true, url });
});
exports.default = router;
