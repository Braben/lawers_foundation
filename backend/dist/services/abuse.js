"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientAddress = clientAddress;
exports.consumeLimit = consumeLimit;
exports.verifyBotToken = verifyBotToken;
exports.protectSubmission = protectSubmission;
const crypto_1 = require("crypto");
const net_1 = require("net");
const firebase_1 = require("../config/firebase");
const errors_1 = require("../middleware/errors");
const testBuckets = new Map();
const localTest = () => process.env.NODE_ENV === 'test' && process.env.DATA_BACKEND === 'local';
function clientAddress(req) {
    // Vercel overwrites this header. Outside Vercel, trust only the socket.
    const forwarded = process.env.VERCEL === '1' ? req.get('x-forwarded-for')?.split(',')[0].trim() : undefined;
    const address = forwarded || req.socket.remoteAddress || 'unknown';
    if (!(0, net_1.isIP)(address))
        return 'unknown';
    return address.replace(/^::ffff:/, '');
}
async function consumeLimit(scope, subject, maximum, windowMs, now = Date.now()) {
    const secret = process.env.RATE_LIMIT_SECRET || process.env.FIREBASE_PRIVATE_KEY || (localTest() ? 'test-only' : '');
    if (!secret)
        throw new errors_1.HttpError(503, 'Submission protection is unavailable. Please try later.');
    const key = (0, crypto_1.createHmac)('sha256', secret).update(`${scope}:${subject}`).digest('hex');
    const advance = (previous) => {
        const current = previous && previous.resetAt > now ? previous : { count: 0, resetAt: now + windowMs };
        if (current.count >= maximum)
            throw new errors_1.HttpError(429, 'Too many requests. Please try again later.');
        return { count: current.count + 1, resetAt: current.resetAt };
    };
    if (localTest()) {
        testBuckets.set(key, advance(testBuckets.get(key)));
        return;
    }
    const firestore = (0, firebase_1.getFirestore)();
    if (!firestore)
        throw new errors_1.HttpError(503, 'Submission protection is unavailable. Please try later.');
    const ref = firestore.collection('rateLimits').doc(key);
    await firestore.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(ref);
        const value = advance(snapshot.exists ? snapshot.data() : undefined);
        transaction.set(ref, { ...value, expiresAt: new Date(value.resetAt + 86400000) });
    });
}
async function verifyBotToken(token, action) {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret)
        throw new errors_1.HttpError(503, 'The form verification service is not configured. Please contact the administrator.');
    if (typeof token !== 'string' || !token || token.length > 2048)
        throw new errors_1.HttpError(400, 'Complete the verification before submitting.');
    let result;
    try {
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST', body: new URLSearchParams({ secret, response: token }), signal: AbortSignal.timeout(10000),
        });
        if (!response.ok)
            throw new Error('Verification unavailable');
        result = await response.json();
    }
    catch {
        throw new errors_1.HttpError(503, 'Verification is temporarily unavailable. Please try again.');
    }
    const hostname = new URL(process.env.FRONTEND_URL || 'http://localhost:3000').hostname;
    if (!result.success || result.hostname !== hostname || result.action !== action)
        throw new errors_1.HttpError(400, 'Verification failed or expired. Please try again.');
}
function protectSubmission(action) {
    return async (req, res, next) => {
        try {
            await consumeLimit(`form:${action}`, clientAddress(req), 10, 15 * 60000);
            const origin = req.get('origin');
            if (origin && origin !== (process.env.FRONTEND_URL || 'http://localhost:3000').trim().replace(/\/+$/, ''))
                throw new errors_1.HttpError(403, 'Origin not allowed');
            if (req.body?.website)
                throw new errors_1.HttpError(400, 'Unable to accept this submission.');
            if (!localTest())
                await verifyBotToken(req.body?.verificationToken, action);
            await consumeLimit(`form:${action}:daily`, 'global', 1000, 86400000);
            next();
        }
        catch (error) {
            if (error instanceof errors_1.HttpError && error.status === 429)
                res.setHeader('Retry-After', '900');
            next(error);
        }
    };
}
