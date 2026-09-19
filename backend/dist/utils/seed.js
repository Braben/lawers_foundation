"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const firebase_1 = require("../config/firebase");
const db_1 = require("../config/db");
async function seed() {
    (0, firebase_1.initFirebase)();
    const source = path_1.default.resolve(__dirname, '../../src/config/seed.json');
    const content = JSON.parse(fs_1.default.readFileSync(source, 'utf8'));
    let added = 0;
    for (const collection of ['programs', 'stories', 'events', 'gallery', 'siteContent']) {
        for (const record of content[collection] || []) {
            if (!await db_1.db.getById(collection, record.id)) {
                await db_1.db.create(collection, record);
                added++;
            }
        }
    }
    console.log(`Added ${added} missing content records. Existing records were preserved.`);
}
seed().catch(error => { console.error('Seeding failed:', error.message); process.exitCode = 1; });
