import { defineCollection, z } from "astro:content";

const guides = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    game: z.string().optional(),
    tags: z.array(z.string()).default([]),
    youtubeUrl: z.string().optional(),
    heroImage: z.string().optional(),
    affiliateBlock: z.array(z.string()).optional(),
  }),
});

const newsletter = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    issueNumber: z.number().int().positive(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    beehiivUrl: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  guides,
  newsletter,
};
