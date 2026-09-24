import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { getFirestore, isFirebaseReady } from './firebase';
import { HttpError } from '../middleware/errors';
export type CollectionName = 'programs' | 'stories' | 'events' | 'gallery' | 'siteContent' | 'donations' | 'contacts' | 'rsvps' | 'roles' | 'staff' | 'settings' | 'analyticsEvents';
type Row = Record<string, any>;
type DbShape = Record<CollectionName, Row[]>;
// Both tsx and compiled builds use the same file. DATA_DIR can point at a persistent volume.
export const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../../src/data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');
export function mergeLocalData(current: DbShape, legacy: Partial<DbShape>): DbShape {
  const result = { ...current };
  for (const name of Object.keys(current) as CollectionName[]) {
    const rows = new Map(current[name].map(row => [row.id, row]));
    for (const row of legacy[name] || []) {
      const existing = rows.get(row.id);
      if (!existing || (Date.parse(row.updatedAt || row.createdAt || '') || 0) > (Date.parse(existing.updatedAt || existing.createdAt || '') || 0)) rows.set(row.id, row);
    }
    result[name] = [...rows.values()];
  }
  return result;
}
function useFirestore() {
  if (process.env.NODE_ENV === 'test' && process.env.DATA_BACKEND === 'local') return false;
  if (!isFirebaseReady()) throw new HttpError(503, 'Firestore is not configured. Contact the administrator.');
  return true;
}
function readLocal(): DbShape {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const seed = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../src/config/seed.json'), 'utf8'));
    writeLocal({ ...seed, donations: [], contacts: [], rsvps: [], roles: [], staff: [], settings: [], analyticsEvents: [] });
  }
  let current: DbShape = { programs: [], stories: [], events: [], gallery: [], siteContent: [], donations: [], contacts: [], rsvps: [], roles: [], staff: [], settings: [], analyticsEvents: [], ...JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) };
  const marker = path.join(DATA_DIR, '.legacy-dist-imported');
  const legacyPath = path.resolve(__dirname, '../../dist/data/db.json');
  if (!process.env.DATA_DIR && !fs.existsSync(marker) && fs.existsSync(legacyPath)) {
    current = mergeLocalData(current, JSON.parse(fs.readFileSync(legacyPath, 'utf8')));
    writeLocal(current);
    fs.writeFileSync(marker, new Date().toISOString());
  }
  return current;
}
function writeLocal(data: DbShape) {
  const temp = `${DATA_FILE}.${randomUUID()}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(data, null, 2));
  fs.renameSync(temp, DATA_FILE);
}
function validateRsvp(event: Row, duplicate: boolean, guests: number) {
  if (event.isPast || (event.endDate || event.date) < new Date().toISOString().slice(0, 10)) throw new HttpError(409, 'Registration is closed for this event.');
  if (!event.registrationRequired) throw new HttpError(409, 'Registration is not open for this event.');
  if (duplicate) throw new HttpError(409, 'Already registered with this email.');
  const remaining = Number(event.capacity || 100) - Number(event.registeredCount || 0);
  if (guests > remaining) throw new HttpError(409, `Only ${Math.max(0, remaining)} places remain.`);
}
export const db = {
  async createMany(name: CollectionName, records: Row[]): Promise<Row[]> {
    const payloads = records.map(data => ({ ...data, id: data.id || randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
    if (useFirestore()) {
      const batch = getFirestore()!.batch();
      payloads.forEach(row => batch.create(getFirestore()!.collection(name).doc(row.id), row));
      await batch.commit();
    } else {
      const local = readLocal();
      if (payloads.some(row => local[name].some(existing => existing.id === row.id))) throw new HttpError(409, 'Record already exists.');
      local[name].push(...payloads); writeLocal(local);
    }
    return payloads;
  },
  async range(name: CollectionName, field: string, from: string, to: string, limit = 50000) {
    if (useFirestore()) {
      const snap = await getFirestore()!.collection(name).where(field, '>=', from).where(field, '<=', to).orderBy(field).limit(limit).get();
      return snap.docs.map(d => ({ ...d.data(), id: d.id })) as Row[];
    }
    return readLocal()[name].filter(row => row[field] >= from && row[field] <= to).sort((a,b) => String(a[field]).localeCompare(String(b[field]))).slice(0, limit);
  },
  async getAll(name: CollectionName): Promise<Row[]> {
    if (useFirestore()) {
      const snap = await getFirestore()!.collection(name).get();
      return snap.docs.map(d => ({ ...d.data(), id: d.id }));
    }
    return readLocal()[name];
  },
  async getById(name: CollectionName, id: string): Promise<Row | null> {
    if (useFirestore()) {
      const doc = await getFirestore()!.collection(name).doc(id).get();
      return doc.exists ? { ...doc.data(), id: doc.id } : null;
    }
    return readLocal()[name].find(x => x.id === id) || null;
  },
  async getBySlug(name: CollectionName, slug: string): Promise<Row | null> {
    if (useFirestore()) {
      const snap = await getFirestore()!.collection(name).where('slug', '==', slug).limit(1).get();
      const doc = snap.docs[0];
      return doc ? { ...doc.data(), id: doc.id } : null;
    }
    return readLocal()[name].find(x => x.slug === slug) || null;
  },
  async create(name: CollectionName, data: Row) {
    const id = data.id || randomUUID();
    const payload = { ...data, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    if (useFirestore()) await getFirestore()!.collection(name).doc(id).create(payload);
    else {
      const local = readLocal();
      if (local[name].some(x => x.id === id)) throw new HttpError(409, 'Record already exists.');
      local[name].push(payload); writeLocal(local);
    }
    return payload;
  },
  async update(name: CollectionName, id: string, data: Row) {
    const { id: ignoredId, createdAt: ignoredCreatedAt, ...fields } = data;
    const payload: Row = { ...fields, updatedAt: new Date().toISOString() };
    if (name === 'events') delete payload.registeredCount;
    const checkCapacity = (current: Row) => {
      if (name === 'events' && payload.capacity !== undefined && Number(payload.capacity) < Number(current.registeredCount || 0)) throw new HttpError(409, 'Capacity cannot be less than the number already registered.');
    };
    if (useFirestore()) {
      const ref = getFirestore()!.collection(name).doc(id);
      await getFirestore()!.runTransaction(async transaction => {
        const current = await transaction.get(ref);
        if (!current.exists) throw new HttpError(404, 'Not found');
        checkCapacity(current.data()!);
        transaction.update(ref, payload);
      });
      return this.getById(name, id);
    }
    const local = readLocal();
    const index = local[name].findIndex(x => x.id === id);
    if (index < 0) throw new HttpError(404, 'Not found');
    checkCapacity(local[name][index]);
    local[name][index] = { ...local[name][index], ...payload }; writeLocal(local);
    return local[name][index];
  },
  async remove(name: CollectionName, id: string) {
    if (useFirestore()) await getFirestore()!.collection(name).doc(id).delete();
    else { const local = readLocal(); local[name] = local[name].filter(x => x.id !== id); writeLocal(local); }
    return true;
  },
  async query(name: CollectionName, filters: Record<string, unknown> = {}) {
    return (await this.getAll(name)).filter(item => Object.entries(filters).every(([k, v]) => v === undefined || v === '' || String(item[k]) === String(v)));
  },
  async reviewRsvp(eventId: string, rsvpId: string, status: 'approved' | 'rejected', reviewer: string) {
    const review = (event: Row, rsvp: Row) => {
      if (rsvp.eventId !== eventId) throw new HttpError(404, 'Registration not found');
      if (rsvp.status !== 'pending') throw new HttpError(409, 'This registration has already been reviewed');
      if (status === 'approved') validateRsvp(event, false, Number(rsvp.guests));
      return { status, reviewedBy: reviewer, reviewedAt: new Date().toISOString() };
    };
    if (useFirestore()) {
      const firestore = getFirestore()!;
      const eventRef = firestore.collection('events').doc(eventId);
      const rsvpRef = firestore.collection('rsvps').doc(rsvpId);
      return firestore.runTransaction(async transaction => {
        const [event, rsvp] = await transaction.getAll(eventRef, rsvpRef);
        if (!event.exists || !rsvp.exists) throw new HttpError(404, 'Registration not found');
        const fields = review(event.data()!, rsvp.data()!);
        transaction.update(rsvpRef, fields);
        if (status === 'approved') transaction.update(eventRef, { registeredCount: Number(event.data()!.registeredCount || 0) + Number(rsvp.data()!.guests) });
        return { ...rsvp.data(), ...fields, id: rsvpId };
      });
    }
    const local = readLocal();
    const event = local.events.find(e => e.id === eventId), rsvp = local.rsvps.find(r => r.id === rsvpId);
    if (!event || !rsvp) throw new HttpError(404, 'Registration not found');
    Object.assign(rsvp, review(event, rsvp));
    if (status === 'approved') event.registeredCount = Number(event.registeredCount || 0) + Number(rsvp.guests);
    writeLocal(local); return rsvp;
  },
  async registerRsvp(eventId: string, data: { name: string; email: string; phone?: string; guests: number }) {
    const email = data.email.trim().toLowerCase();
    const id = Buffer.from(`${eventId}:${email}`).toString('base64url');
    const makePayload = (event: Row) => ({ ...data, email, id, eventId, eventTitle: event.title, status: 'pending', createdAt: new Date().toISOString() });
    if (useFirestore()) {
      const firestore = getFirestore()!;
      const eventRef = firestore.collection('events').doc(eventId);
      const rsvpRef = firestore.collection('rsvps').doc(id);
      return firestore.runTransaction(async transaction => {
        const eventDoc = await transaction.get(eventRef);
        if (!eventDoc.exists) throw new HttpError(404, 'Event not found');
        const event = eventDoc.data()!;
        const existing = await transaction.get(firestore.collection('rsvps').where('eventId', '==', eventId));
        validateRsvp(event, existing.docs.some(d => String(d.data().email).toLowerCase() === email), data.guests);
        const payload = makePayload(event);
        transaction.create(rsvpRef, payload);

        return payload;
      });
    }
    // No await between read and write: capacity and registration commit together.
    const local = readLocal();
    const event = local.events.find(e => e.id === eventId);
    if (!event) throw new HttpError(404, 'Event not found');
    validateRsvp(event, local.rsvps.some(r => r.eventId === eventId && String(r.email).toLowerCase() === email), data.guests);
    const payload = makePayload(event);
    local.rsvps.push(payload);
    writeLocal(local); return payload;
  },
};
