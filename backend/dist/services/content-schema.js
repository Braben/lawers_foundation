"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentSchemas = void 0;
const zod_1 = require("zod");
const title = zod_1.z.string().trim().min(1).max(250);
const text = zod_1.z.string().max(10000);
const hero = zod_1.z.object({ title, subtitle: text, ctaPrimary: title.optional(), ctaSecondary: title.optional() }).strict();
const section = zod_1.z.object({ title, text }).strict();
exports.contentSchemas = {
    home: zod_1.z.object({
        hero: hero.optional(), mission: section.optional(),
        missionCards: zod_1.z.array(zod_1.z.object({ title, content: text }).strict()).max(12).optional(),
        whoWeServe: zod_1.z.object({ title, intro: text, items: zod_1.z.array(zod_1.z.string().max(1000)).max(30) }).strict().optional(),
        supportCTA: section.optional(),
        impactStats: zod_1.z.array(zod_1.z.object({ number: zod_1.z.number().finite().nonnegative().max(1e9), suffix: zod_1.z.string().max(20), label: title }).strict()).max(20).optional(),
    }).strict(),
    about: zod_1.z.object({
        hero: hero.optional(),
        story: zod_1.z.object({ title, paragraphs: zod_1.z.array(text).max(50) }).strict().optional(),
        vision: text.optional(), mission: text.optional(),
    }).strict(),
};
