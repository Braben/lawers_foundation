"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.DATA_DIR = void 0;
exports.mergeLocalData = mergeLocalData;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const firebase_1 = require("./firebase");
const errors_1 = require("../middleware/errors");
// Both tsx and compiled builds use the same file. DATA_DIR can point at a persistent volume.
exports.DATA_DIR = process.env.DATA_DIR || path_1.default.resolve(__dirname, '../../src/data');
const DATA_FILE = path_1.default.join(exports.DATA_DIR, 'db.json');
function mergeLocalData(current, legacy) {
    const result = { ...current };
    for (const name of Object.keys(current)) {
        const rows = new Map(current[name].map(row => [row.id, row]));
        for (const row of legacy[name] || []) {
            const existing = rows.get(row.id);
            if (!existing || (Date.parse(row.updatedAt || row.createdAt || '') || 0) > (Date.parse(existing.updatedAt || existing.createdAt || '') || 0))
                rows.set(row.id, row);
        }
        result[name] = [...rows.values()];
    }
    return result;
}
function useFirestore() {
    if (process.env.NODE_ENV === 'test' && process.env.DATA_BACKEND === 'local')
        return false;
    if (!(0, firebase_1.isFirebaseReady)())
        throw new errors_1.HttpError(503, 'Firestore is not configured. Contact the administrator.');
    return true;
}
function readLocal() {
    fs_1.default.mkdirSync(exports.DATA_DIR, { recursive: true });
    if (!fs_1.default.existsSync(DATA_FILE)) {
        const seed = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../../src/config/seed.json'), 'utf8'));
        writeLocal({ ...seed, donations: [], contacts: [], rsvps: [], roles: [], staff: [], settings: [], analyticsEvents: [] });
    }
    let current = { programs: [], stories: [], events: [], gallery: [], siteContent: [], donations: [], contacts: [], rsvps: [], roles: [], staff: [], settings: [], analyticsEvents: [], ...JSON.parse(fs_1.default.readFileSync(DATA_FILE, 'utf8')) };
    const marker = path_1.default.join(exports.DATA_DIR, '.legacy-dist-imported');
    const legacyPath = path_1.default.resolve(__dirname, '../../dist/data/db.json');
    if (!process.env.DATA_DIR && !fs_1.default.existsSync(marker) && fs_1.default.existsSync(legacyPath)) {
        current = mergeLocalData(current, JSON.parse(fs_1.default.readFileSync(legacyPath, 'utf8')));
        writeLocal(current);
        fs_1.default.writeFileSync(marker, new Date().toISOString());
    }
    return current;
}
function writeLocal(data) {
    const temp = `${DATA_FILE}.${(0, crypto_1.randomUUID)()}.tmp`;
    fs_1.default.writeFileSync(temp, JSON.stringify(data, null, 2));
    fs_1.default.renameSync(temp, DATA_FILE);
}
function validateRsvp(event, duplicate, guests) {
    if (event.isPast || (event.endDate || event.date) < new Date().toISOString().slice(0, 10))
        throw new errors_1.HttpError(409, 'Registration is closed for this event.');
    if (!event.registrationRequired)
        throw new errors_1.HttpError(409, 'Registration is not open for this event.');
    if (duplicate)
        throw new errors_1.HttpError(409, 'Already registered with this email.');
    const remaining = Number(event.capacity || 100) - Number(event.registeredCount || 0);
    if (guests > remaining)
        throw new errors_1.HttpError(409, `Only ${Math.max(0, remaining)} places remain.`);
}
exports.db = {
    async createMany(name, records) {
        const payloads = records.map(data => ({ ...data, id: data.id || (0, crypto_1.randomUUID)(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
        if (useFirestore()) {
            const batch = (0, firebase_1.getFirestore)().batch();
            payloads.forEach(row => batch.create((0, firebase_1.getFirestore)().collection(name).doc(row.id), row));
            await batch.commit();
        }
        else {
            const local = readLocal();
            if (payloads.some(row => local[name].some(existing => existing.id === row.id)))
                throw new errors_1.HttpError(409, 'Record already exists.');
            local[name].push(...payloads);
            writeLocal(local);
        }
        return payloads;
    },
    async range(name, field, from, to, limit = 50000) {
        if (useFirestore()) {
            const snap = await (0, firebase_1.getFirestore)().collection(name).where(field, '>=', from).where(field, '<=', to).orderBy(field).limit(limit).get();
            return snap.docs.map(d => ({ ...d.data(), id: d.id }));
        }
        return readLocal()[name].filter(row => row[field] >= from && row[field] <= to).sort((a, b) => String(a[field]).localeCompare(String(b[field]))).slice(0, limit);
    },
    async getAll(name) {
        if (useFirestore()) {
            const snap = await (0, firebase_1.getFirestore)().collection(name).get();
            return snap.docs.map(d => ({ ...d.data(), id: d.id }));
        }
        return readLocal()[name];
    },
    async getById(name, id) {
        if (useFirestore()) {
            const doc = await (0, firebase_1.getFirestore)().collection(name).doc(id).get();
            return doc.exists ? { ...doc.data(), id: doc.id } : null;
        }
        return readLocal()[name].find(x => x.id === id) || null;
    },
    async getBySlug(name, slug) {
        if (useFirestore()) {
            const snap = await (0, firebase_1.getFirestore)().collection(name).where('slug', '==', slug).limit(1).get();
            const doc = snap.docs[0];
            return doc ? { ...doc.data(), id: doc.id } : null;
        }
        return readLocal()[name].find(x => x.slug === slug) || null;
    },
    async create(name, data) {
        const id = data.id || (0, crypto_1.randomUUID)();
        const payload = { ...data, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        if (useFirestore())
            await (0, firebase_1.getFirestore)().collection(name).doc(id).create(payload);
        else {
            const local = readLocal();
            if (local[name].some(x => x.id === id))
                throw new errors_1.HttpError(409, 'Record already exists.');
            local[name].push(payload);
            writeLocal(local);
        }
        return payload;
    },
    async update(name, id, data) {
        const { id: ignoredId, createdAt: ignoredCreatedAt, ...fields } = data;
        const payload = { ...fields, updatedAt: new Date().toISOString() };
        if (name === 'events')
            delete payload.registeredCount;
        const checkCapacity = (current) => {
            if (name === 'events' && payload.capacity !== undefined && Number(payload.capacity) < Number(current.registeredCount || 0))
                throw new errors_1.HttpError(409, 'Capacity cannot be less than the number already registered.');
        };
        if (useFirestore()) {
            const ref = (0, firebase_1.getFirestore)().collection(name).doc(id);
            await (0, firebase_1.getFirestore)().runTransaction(async (transaction) => {
                const current = await transaction.get(ref);
                if (!current.exists)
                    throw new errors_1.HttpError(404, 'Not found');
                checkCapacity(current.data());
                transaction.update(ref, payload);
            });
            return this.getById(name, id);
        }
        const local = readLocal();
        const index = local[name].findIndex(x => x.id === id);
        if (index < 0)
            throw new errors_1.HttpError(404, 'Not found');
        checkCapacity(local[name][index]);
        local[name][index] = { ...local[name][index], ...payload };
        writeLocal(local);
        return local[name][index];
    },
    async remove(name, id) {
        if (useFirestore())
            await (0, firebase_1.getFirestore)().collection(name).doc(id).delete();
        else {
            const local = readLocal();
            local[name] = local[name].filter(x => x.id !== id);
            writeLocal(local);
        }
        return true;
    },
    async query(name, filters = {}) {
        return (await this.getAll(name)).filter(item => Object.entries(filters).every(([k, v]) => v === undefined || v === '' || String(item[k]) === String(v)));
    },
    async registerRsvp(eventId, data) {
        const email = data.email.trim().toLowerCase();
        const id = Buffer.from(`${eventId}:${email}`).toString('base64url');
        const makePayload = (event) => ({ ...data, email, id, eventId, eventTitle: event.title, createdAt: new Date().toISOString() });
        if (useFirestore()) {
            const firestore = (0, firebase_1.getFirestore)();
            const eventRef = firestore.collection('events').doc(eventId);
            const rsvpRef = firestore.collection('rsvps').doc(id);
            return firestore.runTransaction(async (transaction) => {
                const eventDoc = await transaction.get(eventRef);
                if (!eventDoc.exists)
                    throw new errors_1.HttpError(404, 'Event not found');
                const event = eventDoc.data();
                const existing = await transaction.get(firestore.collection('rsvps').where('eventId', '==', eventId));
                validateRsvp(event, existing.docs.some(d => String(d.data().email).toLowerCase() === email), data.guests);
                const payload = makePayload(event);
                transaction.create(rsvpRef, payload);
                transaction.update(eventRef, { registeredCount: Number(event.registeredCount || 0) + data.guests });
                return payload;
            });
        }
        // No await between read and write: capacity and registration commit together.
        const local = readLocal();
        const event = local.events.find(e => e.id === eventId);
        if (!event)
            throw new errors_1.HttpError(404, 'Event not found');
        validateRsvp(event, local.rsvps.some(r => r.eventId === eventId && String(r.email).toLowerCase() === email), data.guests);
        const payload = makePayload(event);
        local.rsvps.push(payload);
        event.registeredCount = Number(event.registeredCount || 0) + data.guests;
        writeLocal(local);
        return payload;
    },
};
