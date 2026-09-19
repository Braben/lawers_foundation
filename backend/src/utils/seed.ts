import fs from 'fs';
import path from 'path';
import { initFirebase } from '../config/firebase';
import { db, CollectionName } from '../config/db';

async function seed() {
  initFirebase();
  const source = path.resolve(__dirname, '../../src/config/seed.json');
  const content = JSON.parse(fs.readFileSync(source, 'utf8'));
  let added = 0;
  for (const collection of ['programs', 'stories', 'events', 'gallery', 'siteContent'] as CollectionName[]) {
    for (const record of content[collection] || []) {
      if (!await db.getById(collection, record.id)) { await db.create(collection, record); added++; }
    }
  }
  console.log(`Added ${added} missing content records. Existing records were preserved.`);
}
seed().catch(error => { console.error('Seeding failed:', error.message); process.exitCode = 1; });
