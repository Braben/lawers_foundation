"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app_1 = require("firebase-admin/app");
const firebase_1 = require("../config/firebase");
const features_1 = require("../config/features");
const db_1 = require("../config/db");
async function main() {
    (0, firebase_1.initFirebase)();
    const firestore = (0, firebase_1.getFirestore)();
    if (!firestore)
        throw new Error('Configure Firebase credentials first');
    let created = 0;
    const createMissing = async (collection, id, data) => {
        await firestore.runTransaction(async (transaction) => {
            const ref = firestore.collection(collection).doc(id);
            if ((await transaction.get(ref)).exists)
                return;
            transaction.create(ref, { ...data, id, createdAt: data.createdAt || new Date().toISOString(), updatedAt: data.updatedAt || new Date().toISOString() });
            created++;
        });
    };
    for (const role of features_1.DEFAULT_ROLES)
        await createMissing('roles', role.id, role);
    await createMissing('settings', 'currencies', features_1.DEFAULT_CURRENCIES);
    await createMissing('settings', 'analytics', { retentionDays: 90, sessionTimeoutMinutes: 30, enabled: true });
    // Run only as a trusted operator. Resolve configured accounts once to immutable UIDs;
    // runtime authorization never trusts email allowlists.
    const provision = [
        { roleId: 'super_admin', values: [process.env.ADMIN_EMAILS, process.env.SUPER_ADMINS] },
        { roleId: 'publisher', values: [process.env.CONTENT_PUBLISHERS] },
        { roleId: 'event_manager', values: [process.env.EVENT_MANAGERS] },
    ];
    for (const group of provision)
        for (const email of group.values.flatMap(value => (value || '').split(',')).map(s => s.trim()).filter(Boolean)) {
            try {
                const user = await (0, firebase_1.getAuth)().getUserByEmail(email);
                await createMissing('staff', user.uid, { email: user.email || email, name: user.displayName || 'Staff', roleId: group.roleId, disabled: user.disabled });
            }
            catch (error) {
                if (error.code === 'auth/user-not-found')
                    console.warn('A configured staff account does not yet exist in Firebase Auth.');
                else
                    throw error;
            }
        }
    if (process.argv.includes('--migrate-local')) {
        const names = ['programs', 'stories', 'events', 'gallery', 'siteContent', 'donations', 'contacts', 'rsvps', 'roles', 'staff', 'settings', 'analyticsEvents'];
        let merged = Object.fromEntries(names.map(name => [name, []]));
        for (const file of [path_1.default.resolve(__dirname, '../../dist/data/db.json'), path_1.default.resolve(__dirname, '../../src/data/db.json')]) {
            if (fs_1.default.existsSync(file))
                merged = (0, db_1.mergeLocalData)(merged, JSON.parse(fs_1.default.readFileSync(file, 'utf8')));
        }
        for (const name of ['programs', 'stories', 'events', 'gallery', 'siteContent', 'donations', 'contacts', 'rsvps']) {
            for (const record of merged[name]) {
                if (!record.id)
                    continue;
                if (name === 'donations' && !record.currency)
                    record.currency = 'GHS';
                await createMissing(name, String(record.id), record);
            }
        }
    }
    console.log(`Firestore initialized: ${created} missing records added; existing records preserved.`);
}
main().catch(error => { console.error('Firestore initialization failed:', error.message); process.exitCode = 1; }).finally(async () => { await Promise.all((0, app_1.getApps)().map(app => (0, app_1.deleteApp)(app))); });
