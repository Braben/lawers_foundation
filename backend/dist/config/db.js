"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const firebase_1 = require("./firebase");
const DATA_DIR = path_1.default.join(__dirname, '../data');
const DATA_FILE = path_1.default.join(DATA_DIR, 'db.json');
function ensureFile() {
    if (!fs_1.default.existsSync(DATA_DIR))
        fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs_1.default.existsSync(DATA_FILE)) {
        try {
            const seedPath = path_1.default.join(__dirname, 'seed.json');
            const altSeed = path_1.default.join(__dirname, '../../src/config/seed.json');
            const p = fs_1.default.existsSync(seedPath) ? seedPath : altSeed;
            const seed = JSON.parse(fs_1.default.readFileSync(p, 'utf-8'));
            if (!seed.donations)
                seed.donations = [];
            if (!seed.contacts)
                seed.contacts = [];
            if (!seed.rsvps)
                seed.rsvps = [];
            fs_1.default.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2));
        }
        catch {
            fs_1.default.writeFileSync(DATA_FILE, JSON.stringify({ programs: [], stories: [], events: [], gallery: [], siteContent: [], donations: [], contacts: [], rsvps: [] }, null, 2));
        }
    }
    else {
        try {
            const cur = JSON.parse(fs_1.default.readFileSync(DATA_FILE, 'utf-8'));
            let changed = false;
            if (!cur.donations) {
                cur.donations = [];
                changed = true;
            }
            if (!cur.contacts) {
                cur.contacts = [];
                changed = true;
            }
            if (!cur.rsvps) {
                cur.rsvps = [];
                changed = true;
            }
            if (changed)
                fs_1.default.writeFileSync(DATA_FILE, JSON.stringify(cur, null, 2));
        }
        catch { }
    }
}
function readLocal() {
    ensureFile();
    return JSON.parse(fs_1.default.readFileSync(DATA_FILE, 'utf-8'));
}
function writeLocal(data) {
    fs_1.default.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}
function isFirestoreNotFound(err) {
    return err?.code === 5 || err?.code === 'NOT_FOUND' || /NOT_FOUND|5 NOT_FOUND/i.test(String(err?.message || ''));
}
exports.db = {
    async getAll(name) {
        if ((0, firebase_1.isFirebaseReady)()) {
            try {
                const snap = await (0, firebase_1.getFirestore)().collection(name).get();
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                if (data.length === 0) {
                    const local = readLocal()[name] || [];
                    if (local.length)
                        return local;
                }
                return data;
            }
            catch (e) {
                if (isFirestoreNotFound(e)) {
                    console.warn(`[db] Firestore NOT_FOUND for ${name} — falling back to local JSON. Create Firestore database in Firebase console or check FIREBASE_PROJECT_ID.`);
                    return readLocal()[name] || [];
                }
                throw e;
            }
        }
        return readLocal()[name] || [];
    },
    async getById(name, id) {
        if ((0, firebase_1.isFirebaseReady)()) {
            try {
                const doc = await (0, firebase_1.getFirestore)().collection(name).doc(id).get();
                if (doc.exists)
                    return { id: doc.id, ...doc.data() };
                const fallback = (readLocal()[name] || []).find((x) => x.id === id || x.slug === id) || null;
                return fallback;
            }
            catch (e) {
                if (isFirestoreNotFound(e))
                    return (readLocal()[name] || []).find((x) => x.id === id || x.slug === id) || null;
                throw e;
            }
        }
        const local = readLocal()[name] || [];
        return local.find((x) => x.id === id || x.slug === id) || null;
    },
    async getBySlug(name, slug) {
        if ((0, firebase_1.isFirebaseReady)()) {
            try {
                const snap = await (0, firebase_1.getFirestore)().collection(name).where('slug', '==', slug).limit(1).get();
                if (snap.empty) {
                    const fallback = (readLocal()[name] || []).find((x) => x.slug === slug) || null;
                    return fallback;
                }
                const d = snap.docs[0];
                return { id: d.id, ...d.data() };
            }
            catch (e) {
                if (isFirestoreNotFound(e))
                    return (readLocal()[name] || []).find((x) => x.slug === slug) || null;
                throw e;
            }
        }
        const local = readLocal()[name] || [];
        return local.find((x) => x.slug === slug) || null;
    },
    async create(name, data) {
        const id = data.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const payload = { ...data, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        if ((0, firebase_1.isFirebaseReady)()) {
            try {
                await (0, firebase_1.getFirestore)().collection(name).doc(id).set(payload);
                return payload;
            }
            catch (e) {
                if (isFirestoreNotFound(e)) {
                    console.warn(`[db] Firestore NOT_FOUND on create ${name} — using local JSON`);
                }
                else
                    throw e;
            }
        }
        const local = readLocal();
        local[name] = [...(local[name] || []), payload];
        writeLocal(local);
        return payload;
    },
    async update(name, id, data) {
        if ((0, firebase_1.isFirebaseReady)()) {
            try {
                await (0, firebase_1.getFirestore)().collection(name).doc(id).set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
                const doc = await (0, firebase_1.getFirestore)().collection(name).doc(id).get();
                return { id: doc.id, ...doc.data() };
            }
            catch (e) {
                if (isFirestoreNotFound(e)) {
                    console.warn(`[db] Firestore NOT_FOUND on update ${name} — using local JSON`);
                }
                else
                    throw e;
            }
        }
        const local = readLocal();
        local[name] = (local[name] || []).map((x) => x.id === id ? { ...x, ...data, updatedAt: new Date().toISOString() } : x);
        writeLocal(local);
        return local[name].find((x) => x.id === id);
    },
    async remove(name, id) {
        if ((0, firebase_1.isFirebaseReady)()) {
            try {
                await (0, firebase_1.getFirestore)().collection(name).doc(id).delete();
                return true;
            }
            catch (e) {
                if (isFirestoreNotFound(e)) {
                    console.warn(`[db] Firestore NOT_FOUND on delete ${name} — using local JSON`);
                }
                else
                    throw e;
            }
        }
        const local = readLocal();
        local[name] = (local[name] || []).filter((x) => x.id !== id);
        writeLocal(local);
        return true;
    },
    async query(name, filters = {}) {
        const all = await this.getAll(name);
        return all.filter(item => Object.entries(filters).every(([k, v]) => v === undefined || v === '' || String(item[k]) === String(v)));
    }
};
