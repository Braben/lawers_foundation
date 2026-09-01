import fs from 'fs';
import path from 'path';
import { getFirestore, isFirebaseReady } from './firebase';

export type CollectionName = 'programs' | 'stories' | 'events' | 'gallery' | 'siteContent' | 'donations' | 'contacts';

const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

type DbShape = Record<CollectionName, any[]>;

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    try {
      const seedPath = path.join(__dirname, 'seed.json');
      const altSeed = path.join(__dirname, '../../src/config/seed.json');
      const p = fs.existsSync(seedPath) ? seedPath : altSeed;
      const seed = JSON.parse(fs.readFileSync(p, 'utf-8'));
      if (!seed.donations) seed.donations = [];
      if (!seed.contacts) seed.contacts = [];
      fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2));
    } catch {
      fs.writeFileSync(DATA_FILE, JSON.stringify({ programs:[], stories:[], events:[], gallery:[], siteContent:[], donations:[], contacts:[] }, null, 2));
    }
  } else {
    try {
      const cur = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      let changed=false;
      if (!cur.donations) { cur.donations=[]; changed=true; }
      if (!cur.contacts) { cur.contacts=[]; changed=true; }
      if (changed) fs.writeFileSync(DATA_FILE, JSON.stringify(cur, null, 2));
    } catch {}
  }
}

function readLocal(): DbShape {
  ensureFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}
function writeLocal(data: DbShape) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export const db = {
  async getAll(name: CollectionName) {
    if (isFirebaseReady()) {
      const snap = await getFirestore()!.collection(name).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    return readLocal()[name] || [];
  },
  async getById(name: CollectionName, id: string) {
    if (isFirebaseReady()) {
      const doc = await getFirestore()!.collection(name).doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }
    const local = readLocal()[name] || [];
    return local.find((x: any) => x.id === id || x.slug === id) || null;
  },
  async getBySlug(name: CollectionName, slug: string) {
    if (isFirebaseReady()) {
      const snap = await getFirestore()!.collection(name).where('slug', '==', slug).limit(1).get();
      if (snap.empty) return null;
      const d = snap.docs[0];
      return { id: d.id, ...d.data() };
    }
    const local = readLocal()[name] || [];
    return local.find((x: any) => x.slug === slug) || null;
  },
  async create(name: CollectionName, data: any) {
    const id = data.id || `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    const payload = { ...data, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    if (isFirebaseReady()) {
      await getFirestore()!.collection(name).doc(id).set(payload);
      return payload;
    }
    const local = readLocal();
    local[name] = [...(local[name] || []), payload];
    writeLocal(local);
    return payload;
  },
  async update(name: CollectionName, id: string, data: any) {
    if (isFirebaseReady()) {
      await getFirestore()!.collection(name).doc(id).set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
      const doc = await getFirestore()!.collection(name).doc(id).get();
      return { id: doc.id, ...doc.data() };
    }
    const local = readLocal();
    local[name] = (local[name] || []).map((x: any) => x.id === id ? { ...x, ...data, updatedAt: new Date().toISOString() } : x);
    writeLocal(local);
    return local[name].find((x: any) => x.id === id);
  },
  async remove(name: CollectionName, id: string) {
    if (isFirebaseReady()) {
      await getFirestore()!.collection(name).doc(id).delete();
      return true;
    }
    const local = readLocal();
    local[name] = (local[name] || []).filter((x: any) => x.id !== id);
    writeLocal(local);
    return true;
  },
  async query(name: CollectionName, filters: Record<string, any> = {}) {
    const all = await this.getAll(name) as any[];
    return all.filter(item => Object.entries(filters).every(([k,v]) => v === undefined || v === '' || String(item[k]) === String(v)));
  }
};
