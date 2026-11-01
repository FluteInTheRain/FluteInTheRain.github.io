import { getCollection } from 'astro:content';
import { CATEGORY_IDS, CATEGORY_LABELS, type CategoryId } from '../data/categories';

export async function getPublishedPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft || import.meta.env.DEV);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function readingTime(body = '') {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export const categoryUrl = (id: CategoryId) => `/blog/category/${id}/`;

/** Categories that have at least one published post, in the order defined in categories.ts. */
export function usedCategories(posts: { data: { category: CategoryId } }[]) {
  const used = new Set(posts.map((p) => p.data.category));
  return CATEGORY_IDS.filter((id) => used.has(id)).map((id) => ({ id, label: CATEGORY_LABELS[id] }));
}
