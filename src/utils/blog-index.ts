// Pure selection logic for the blog index. No imports, so `node --test` can load it.

export interface IndexPost { id: string; date: Date; category: string; featured?: boolean }
export interface TopicSection<T> { category: string; total: number; posts: T[] }
export interface IndexLayout<T> { featured: T | null; alsoNew: T[]; topics: TopicSection<T>[]; archive: T[] }

const ALSO_NEW = 3;
const TOPIC_SIZE = 3;

export function buildIndexLayout<T extends IndexPost>(posts: T[], categoryOrder: readonly string[]): IndexLayout<T> {
  const archive = [...posts].sort((a, b) => b.date.valueOf() - a.date.valueOf());
  const featured = archive.find((p) => p.featured) ?? archive[0] ?? null;
  const alsoNew = archive.filter((p) => p !== featured).slice(0, ALSO_NEW);
  const shown = new Set<T>(featured ? [featured, ...alsoNew] : []);

  const topics: TopicSection<T>[] = [];
  for (const category of categoryOrder) {
    const inCat = archive.filter((p) => p.category === category);
    if (inCat.length < TOPIC_SIZE) continue;
    const fresh = inCat.filter((p) => !shown.has(p));
    const reused = inCat.filter((p) => shown.has(p));
    topics.push({ category, total: inCat.length, posts: [...fresh, ...reused].slice(0, TOPIC_SIZE) });
  }
  return { featured, alsoNew, topics, archive };
}

export function shortTitle(title: string): string {
  const i = title.indexOf(':');
  return i === -1 ? title : title.slice(0, i).trim();
}

export function normalizeSearch(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatHours(totalMinutes: number): string {
  const h = Math.round((totalMinutes / 60) * 10) / 10;
  return `${h}h`;
}
