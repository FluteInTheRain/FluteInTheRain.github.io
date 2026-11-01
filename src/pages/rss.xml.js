import rss from '@astrojs/rss';
import content from '../data/content.json';
import { CATEGORY_LABELS } from '../data/categories';
import { getPublishedPosts } from '../utils/blog';

export async function GET(context) {
  const posts = await getPublishedPosts();
  return rss({
    title: `${content.person.name} — Blog`,
    description: 'Technical write-ups on backend engineering, payments, messaging, and AI-powered search.',
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/blog/${p.id}/`,
      categories: [CATEGORY_LABELS[p.data.category], ...p.data.tags],
    })),
    customData: '<language>en</language>',
  });
}
