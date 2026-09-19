"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const admin = __importStar(require("firebase-admin"));
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
    for (const email of [...(process.env.ADMIN_EMAILS || '').split(','), ...(process.env.SUPER_ADMINS || '').split(',')].map(s => s.trim()).filter(Boolean)) {
        try {
            const user = await (0, firebase_1.getAuth)().getUserByEmail(email);
            await createMissing('staff', user.uid, { email: user.email || email, name: user.displayName || 'Administrator', roleId: 'super_admin', disabled: false });
        }
        catch (error) {
            if (error.code === 'auth/user-not-found')
                console.warn('A configured administrator does not yet have a Firebase Auth account.');
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
main().catch(error => { console.error('Firestore initialization failed:', error.message); process.exitCode = 1; }).finally(async () => { await Promise.all(admin.apps.map(app => app?.delete())); });
