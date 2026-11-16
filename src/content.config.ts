import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_IDS } from './data/categories';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    title_vi: z.string().optional(),
    description: z.string().max(180),
    description_vi: z.string().max(220).optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.enum(CATEGORY_IDS),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    sources: z
      .array(
        z.object({
          title: z.string(),
          author: z.string().optional(),
          chapters: z.string().optional(),
          url: z.url({ protocol: /^https?$/ }).optional(),
        }),
      )
      .default([]),
  }),
});

export const collections = { blog };
