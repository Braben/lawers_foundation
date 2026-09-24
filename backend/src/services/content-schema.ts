import { z } from 'zod';

const title = z.string().trim().min(1).max(250);
const text = z.string().max(10000);
const hero = z.object({title,subtitle:text,ctaPrimary:title.optional(),ctaSecondary:title.optional()}).strict();
const section = z.object({title,text}).strict();
export const contentSchemas = {
  home: z.object({
    hero:hero.optional(), mission:section.optional(),
    missionCards:z.array(z.object({title,content:text}).strict()).max(12).optional(),
    whoWeServe:z.object({title,intro:text,items:z.array(z.string().max(1000)).max(30)}).strict().optional(),
    supportCTA:section.optional(),
    impactStats:z.array(z.object({number:z.number().finite().nonnegative().max(1e9),suffix:z.string().max(20),label:title}).strict()).max(20).optional(),
  }).strict(),
  about:z.object({
    hero:hero.optional(),
    story:z.object({title,paragraphs:z.array(text).max(50)}).strict().optional(),
    vision:text.optional(),mission:text.optional(),
  }).strict(),
};
