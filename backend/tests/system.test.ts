import { test, before, after, mock } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Server } from 'node:http';
import express from 'express';

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lawers-test-'));
process.env.DATA_DIR = directory;
process.env.NODE_ENV = 'test';
process.env.DATA_BACKEND = 'local';
for (const key of ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_STORAGE_BUCKET', 'ADMIN_EMAILS', 'SUPER_ADMINS', 'CONTENT_PUBLISHERS', 'EVENT_MANAGERS']) process.env[key] = '';
let server: Server;
let staffServer: Server;
let base: string;
let staffBase: string;
let db: typeof import('../src/config/db').db;
const seed = { programs: [], stories: [], events: [], gallery: [], siteContent: [], donations: [], contacts: [], rsvps: [], roles: [], staff: [], settings: [], analyticsEvents: [] };
fs.writeFileSync(path.join(directory, 'db.json'), JSON.stringify(seed));
const start = (app: express.Express) => new Promise<{ server: Server; base: string }>(resolve => {
  const server = app.listen(0, '127.0.0.1', () => resolve({ server, base: `http://127.0.0.1:${(server.address() as { port: number }).port}` }));
});
const request = (url: string, body: object) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
before(async () => {
  const { app } = await import('../src/index');
  ({ server, base } = await start(app));
  ({ db } = await import('../src/config/db'));
  // Test-only authenticated harness: production auth is exercised on the real app above.
  const staff = express(); staff.use(express.json());
  staff.use((req, _res, next) => { (req as express.Request & { user: object }).user = { uid: req.headers['x-test-uid'] || 'test', email: req.headers['x-test-email'] || 'publisher@example.com' }; next(); });
  staff.use('/upload', (await import('../src/routes/upload')).default);
  staff.use('/gallery', (await import('../src/routes/gallery')).default);
  staff.use('/stories', (await import('../src/routes/stories')).default);
  staff.use('/events', (await import('../src/routes/events')).default);
  staff.use('/settings',(await import('../src/routes/settings')).default);
  staff.use('/staff',(await import('../src/routes/staff')).default);
  staff.use('/analytics',(await import('../src/routes/analytics')).default);
  staff.use('/donations',(await import('../src/routes/donations')).default);
  staff.use('/stats', (await import('../src/routes/admin')).default);
  staff.use((await import('../src/middleware/errors')).errorHandler);
  ({ server: staffServer, base: staffBase } = await start(staff));
});
after(async () => {
  await Promise.all([server, staffServer].map(s => new Promise<void>((resolve, reject) => s.close(error => error ? reject(error) : resolve()))));
  const target = path.resolve(directory);
  assert.equal(path.dirname(target), path.resolve(os.tmpdir()));
  assert.ok(path.basename(target).startsWith('lawers-test-'));
  fs.rmSync(target, { recursive: true });
  const admin = await import('firebase-admin');
  await Promise.all(admin.apps.map(app=>app?.delete()));
});

test('production API rejects anonymous stats and forged tokens without Firebase', async () => {
  assert.equal((await fetch(`${base}/api/admin/stats`)).status, 401);
  assert.equal((await fetch(`${base}/api/donations`)).status, 401);
  assert.equal((await fetch(`${base}/api/donations`, { headers: { Authorization: 'Bearer forged' } })).status, 503);
});
test('roles default to viewer and combine both administrator lists', async () => {
  const { getUserRole } = await import('../src/middleware/rbac');
  assert.equal(getUserRole('stranger@example.com'), 'viewer');
  process.env.ADMIN_EMAILS = 'admin@example.com'; process.env.SUPER_ADMINS = 'super@example.com';
  process.env.CONTENT_PUBLISHERS = 'publisher@example.com'; process.env.EVENT_MANAGERS = 'events@example.com';
  assert.equal(getUserRole('ADMIN@example.com'), 'super_admin');
  assert.equal(getUserRole('super@example.com'), 'super_admin');
  assert.equal(getUserRole('publisher@example.com'), 'publisher');
  assert.equal(getUserRole('events@example.com'), 'event_manager');
  assert.equal((await fetch(`${staffBase}/stats/stats`)).status, 403);
});
test('pledges cannot claim payment, require an amount, and disable the webhook', async () => {
  const data = { name: 'Test Donor', email: 'donor@example.com', amount: 50, paymentStatus: 'succeeded', status: 'succeeded' };
  const response = await request(`${base}/api/donations`, data);
  assert.equal(response.status, 201);
  const item = (await response.json()).data;
  assert.equal(item.status, 'pledged'); assert.equal(item.paymentStatus, 'not_collected');
  assert.equal((await request(`${base}/api/donations`, { ...data, amount: 0 })).status, 400);
  assert.equal((await request(`${base}/api/donations`, { name: data.name, email: data.email })).status, 400);
  assert.equal((await request(`${base}/api/donations/webhook`, data)).status, 410);
  assert.equal((await db.getAll('donations')).length, 1);
});
test('publisher uploads persist bytes and metadata, appear publicly, and can be edited and removed', async () => {
  const bytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
  const form = new FormData(); form.append('file', new Blob([bytes], { type: 'image/png' }), '../../test.png');
  form.append('title', 'Community day'); form.append('description', ''); form.append('category', 'community');
  const response = await fetch(`${staffBase}/upload/gallery`, { method: 'POST', body: form });
  assert.equal(response.status, 201); const item = (await response.json()).data;
  const filename = new URL(item.url).pathname.split('/').pop()!;
  assert.deepEqual(fs.readFileSync(path.join(directory, 'uploads', filename)), bytes);
  assert.equal((await fetch(`${base}/uploads/${filename}`)).status, 200);
  assert.ok((await (await fetch(`${base}/api/gallery`)).json()).data.some((row: { id: string }) => row.id === item.id));
  const update = await fetch(`${staffBase}/gallery/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Updated caption', id: 'cannot-replace-id' }) });
  assert.equal(update.status, 200); assert.equal((await update.json()).data.id, item.id);
  assert.equal((await fetch(`${staffBase}/gallery/${item.id}`, { method: 'DELETE' })).status, 200);
  assert.equal((await db.getAll('gallery')).length, 0);
});
test('uploads reject executable and oversized files and non-publishers', async () => {
  const form = new FormData(); form.append('file', new Blob(['<svg onload="alert(1)"/>'], { type: 'image/png' }), 'fake.png');
  assert.equal((await fetch(`${staffBase}/upload/gallery`, { method: 'POST', body: form })).status, 400);
  assert.equal((await fetch(`${staffBase}/upload/gallery`, { method: 'POST', body: form, headers: { 'x-test-email': 'events@example.com' } })).status, 403);
  const big = new FormData(); big.append('file', new Blob([new Uint8Array(5 * 1024 * 1024 + 1)]), 'big.png');
  assert.equal((await fetch(`${staffBase}/upload/gallery`, { method: 'POST', body: big })).status, 413);
});
test('publishers can create stories; event managers can create events but not stories', async () => {
  const story = { slug: 'test-story', title: 'Test story', excerpt: 'An example story for testing.' };
  assert.equal((await request(`${staffBase}/stories`, story)).status, 201);
  assert.equal((await fetch(`${staffBase}/stories`, { method: 'POST', headers: { 'x-test-email': 'events@example.com', 'Content-Type': 'application/json' }, body: JSON.stringify(story) })).status, 403);
  assert.equal((await fetch(`${staffBase}/events`, { method: 'POST', headers: { 'x-test-email': 'events@example.com', 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: 'staff-event', title: 'Staff event', description: 'Community event registration.', date: '2099-01-01', location: { name: 'Community centre' }, registrationRequired: true }) })).status, 201);
});
test('RSVPs enforce capacity atomically, normalize emails, and close past events', async () => {
  const event = await db.create('events', { slug: 'capacity-event', title: 'Capacity test', date: '2099-01-01', registrationRequired: true, capacity: 2, registeredCount: 0 });
  const responses = await Promise.all(['one', 'two', 'three'].map(name => request(`${base}/api/events/${event.id}/rsvp`, { name: `${name} guest`, email: `${name}@example.com`, guests: 1 })));
  assert.deepEqual(responses.map(r => r.status).sort(), [201, 201, 409]);
  assert.equal((await db.getById('events', event.id))!.registeredCount, 2);
  await db.update('events', event.id, { registeredCount: 0 });
  assert.equal((await db.getById('events', event.id))!.registeredCount, 2);
  await assert.rejects(db.update('events', event.id, { capacity: 1 }), { status: 409 });
  const other = await db.create('events', { slug: 'duplicate', title: 'Duplicate test', date: '2099-01-01', registrationRequired: true, capacity: 10 });
  assert.equal((await request(`${base}/api/events/${other.id}/rsvp`, { name: 'Test Guest', email: 'USER@example.com' })).status, 201);
  assert.equal((await request(`${base}/api/events/${other.id}/rsvp`, { name: 'Test Guest', email: 'user@example.com' })).status, 409);
  await db.update('events', other.id, { date: '2020-01-01' });
  assert.equal((await request(`${base}/api/events/${other.id}/rsvp`, { name: 'New Guest', email: 'new@example.com' })).status, 409);
  const past = (await (await fetch(`${base}/api/events?category=past`)).json()).data;
  assert.ok(past.some((row: { id: string }) => row.id === other.id));
});
test('missing updates return 404 rather than creating partial records', async () => {
  await assert.rejects(db.update('stories', 'missing', { title: 'Missing' }), { status: 404 });
});
test('legacy local records merge without duplicates and preserve newer edits', async () => {
  const { mergeLocalData } = await import('../src/config/db');
  const current = { ...seed, contacts: [{ id: 'shared', name: 'Newer', updatedAt: '2026-09-01' }] };
  const legacy = { contacts: [{ id: 'shared', name: 'Older', updatedAt: '2026-08-01' }, { id: 'legacy', name: 'Preserved' }], donations: [{ id: 'pledge', amount: 50 }] };
  const merged = mergeLocalData(current, legacy);
  assert.equal(merged.contacts.length, 2);
  assert.equal(merged.contacts.find(row => row.id === 'shared')!.name, 'Newer');
  assert.equal(merged.donations.length, 1);
  assert.deepEqual(mergeLocalData(merged, legacy), merged);
});

const asAdmin = { 'x-test-email':'admin@example.com','Content-Type':'application/json' };
test('currencies are administrator-configured and enforced on pledges', async()=>{
  const settings={defaultCurrency:'USD',currencies:[{code:'GHS',name:'Cedi',enabled:false},{code:'USD',name:'US dollar',enabled:true}]};
  assert.equal((await fetch(`${staffBase}/settings/currencies`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(settings)})).status,403);
  assert.equal((await fetch(`${staffBase}/settings/currencies`,{method:'PUT',headers:asAdmin,body:JSON.stringify({...settings,defaultCurrency:'GHS'})})).status,400);
  assert.equal((await fetch(`${staffBase}/settings/currencies`,{method:'PUT',headers:asAdmin,body:JSON.stringify(settings)})).status,200);
  const publicSettings=(await (await fetch(`${base}/api/settings/currencies`)).json()).data;
  assert.deepEqual(publicSettings.currencies.map((c:any)=>c.code),['USD']);
  const donor={name:'Currency Test',email:'currency@example.com',amount:50};
  assert.equal((await request(`${base}/api/donations`,{...donor,currency:'GHS'})).status,400);
  const accepted=await request(`${base}/api/donations`,{...donor,currency:'USD'});
  assert.equal(accepted.status,201);assert.equal((await accepted.json()).data.currency,'USD');
  assert.equal((await request(`${base}/api/donations`,{...donor,currency:'USD',amount:1.234})).status,400);
});
test('bulk gallery uploads are atomic and reject a mixed invalid batch',async()=>{
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
  const before=(await db.getAll('gallery')).length;
  const form=new FormData();form.append('files',new Blob([png]),'one.png');form.append('files',new Blob([png]),'two.png');
  const response=await fetch(`${staffBase}/upload/images`,{method:'POST',body:form});assert.equal(response.status,201);
  const items=(await response.json()).data;assert.equal(items.length,2);assert.equal(items[0].batchId,items[1].batchId);
  assert.notEqual(items[0].url,items[1].url);
  const invalid=new FormData();invalid.append('files',new Blob([png]),'valid.png');invalid.append('files',new Blob(['bad']),'invalid.png');
  assert.equal((await fetch(`${staffBase}/upload/images`,{method:'POST',body:invalid})).status,400);
  assert.equal((await db.getAll('gallery')).length,before+2);
});
test('video links are normalized to safe in-app players',async()=>{
  const {videoSource}=await import('../src/services/video');
  assert.equal(videoSource('https://www.youtube.com/watch?v=dQw4w9WgXcQ')?.src,'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  assert.equal(videoSource('https://vimeo.com/123456789')?.src,'https://player.vimeo.com/video/123456789');
  assert.equal(videoSource('https://cdn.example.com/video.mp4?token=abc')?.kind,'file');
  assert.equal(videoSource('https://youtube.com.attacker.example/watch?v=dQw4w9WgXcQ'),null);
  assert.equal(videoSource('javascript:alert(1)'),null);
  const response=await request(`${staffBase}/gallery`,{type:'video',title:'Community video',url:'https://vimeo.com/123456789',description:'',category:'community'});
  assert.equal(response.status,201);assert.equal((await response.json()).data.playback.kind,'embed');
  const videos=(await (await fetch(`${base}/api/gallery?category=videos`)).json()).data;
  assert.ok(videos.length>0);assert.ok(videos.every((item:any)=>item.type==='video'));
});
test('analytics deduplicates views, counts sessions, and excludes admin and private query strings',async()=>{
  const {randomUUID}=await import('crypto');
  const visitorId=randomUUID(),sessionId=randomUUID();
  const first={eventId:randomUUID(),visitorId,sessionId,path:'/about',referrer:'https://example.com/private?email=hidden@example.com'};
  assert.equal((await request(`${base}/api/analytics/pageview`,first)).status,202);
  await request(`${base}/api/analytics/pageview`,first);
  await request(`${base}/api/analytics/pageview`,{...first,eventId:randomUUID(),path:'/gallery'});
  await request(`${base}/api/analytics/pageview`,{...first,eventId:randomUUID(),path:'/admin'});
  assert.equal((await request(`${base}/api/analytics/pageview`,{...first,eventId:randomUUID(),path:'/contact?email=private@example.com'})).status,400);
  assert.equal((await fetch(`${base}/api/analytics/summary`)).status,401);
  const response=await fetch(`${staffBase}/analytics/summary`,{headers:asAdmin});assert.equal(response.status,200);
  const data=(await response.json()).data;assert.equal(data.pageViews,2);assert.equal(data.visits,1);assert.equal(data.uniqueVisitors,1);assert.equal(data.referrers[0].source,'example.com');
  const records=await db.getAll('analyticsEvents');assert.equal(records[0].ip,undefined);assert.notEqual(records[0].visitorId,visitorId);
});
test('custom permissions are immediately enforced and protected roles cannot be changed',async()=>{
  assert.equal((await fetch(`${staffBase}/staff/roles/super_admin`,{method:'PUT',headers:asAdmin,body:JSON.stringify({name:'Changed',permissions:[]})})).status,403);
  assert.equal((await fetch(`${staffBase}/staff/roles/viewer`,{method:'PUT',headers:asAdmin,body:JSON.stringify({name:'Changed',permissions:['staff.manage']})})).status,403);
  const create=await fetch(`${staffBase}/staff/roles`,{method:'POST',headers:asAdmin,body:JSON.stringify({id:'gallery_viewer',name:'Gallery viewer',permissions:['gallery.view']})});assert.equal(create.status,201);
  await db.create('staff',{id:'limited',email:'limited@example.com',roleId:'gallery_viewer',disabled:false});
  const headers={'x-test-uid':'limited','x-test-email':'limited@example.com','Content-Type':'application/json'};
  const payload={type:'video',title:'Video title',url:'https://vimeo.com/123456789'};
  assert.equal((await fetch(`${staffBase}/gallery`,{method:'POST',headers,body:JSON.stringify(payload)})).status,403);
  await fetch(`${staffBase}/staff/roles/gallery_viewer`,{method:'PUT',headers:asAdmin,body:JSON.stringify({name:'Gallery manager',permissions:['gallery.manage']})});
  assert.equal((await fetch(`${staffBase}/gallery`,{method:'POST',headers,body:JSON.stringify(payload)})).status,201);
  await db.update('staff','limited',{disabled:true});
  assert.equal((await fetch(`${staffBase}/gallery`,{method:'POST',headers,body:JSON.stringify(payload)})).status,403);
  await db.create('staff',{id:'ceo-test',email:'ceo@example.com',roleId:'ceo',disabled:false});
  const {resolveAccess}=await import('../src/services/access');const {PERMISSIONS}=await import('../src/config/features');
  assert.deepEqual((await resolveAccess({uid:'ceo-test',email:'ceo@example.com'})).permissions,PERMISSIONS);
  assert.equal((await fetch(`${staffBase}/staff/roles/ceo`,{method:'PUT',headers:{...headers,'x-test-uid':'ceo-test','x-test-email':'ceo@example.com'},body:JSON.stringify({name:'CEO',permissions:[]})})).status,409);
});
test('staff creation uses Firebase Auth, stores no password, and cleans up if Firestore fails',async()=>{
  const admin=await import('firebase-admin');admin.initializeApp({projectId:'lawers-test'});
  const auth=admin.auth();let removed='';
  mock.method(auth,'createUser',async(data:any)=>({uid:'created-staff',email:data.email}));
  mock.method(auth,'deleteUser',async(uid:string)=>{removed=uid;});
  mock.method(auth,'updateUser',async(uid:string)=>({uid}));
  const data={name:'Test Manager',email:'manager@example.com',password:'A-long-test-password-123',roleId:'manager'};
  const response=await fetch(`${staffBase}/staff/accounts`,{method:'POST',headers:asAdmin,body:JSON.stringify(data)});assert.equal(response.status,201);
  const saved=await db.getById('staff','created-staff');assert.equal(saved?.password,undefined);assert.equal(saved?.roleId,'manager');
  const duplicate=await fetch(`${staffBase}/staff/accounts`,{method:'POST',headers:asAdmin,body:JSON.stringify(data)});assert.equal(duplicate.status,409);assert.equal(removed,'created-staff');
  assert.equal((await fetch(`${staffBase}/staff/accounts/created-staff`,{method:'PUT',headers:asAdmin,body:JSON.stringify({roleId:'ceo',disabled:false})})).status,200);
  assert.equal((await fetch(`${staffBase}/staff/accounts/created-staff`,{method:'PUT',headers:{...asAdmin,'x-test-uid':'created-staff'},body:JSON.stringify({roleId:'viewer',disabled:true})})).status,403);
  mock.restoreAll();
});
