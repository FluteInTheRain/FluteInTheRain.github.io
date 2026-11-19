import { SERIES, seriesOfPost, seriesUrl, type Series, type SeriesPart } from '../data/series';
import { getPublishedPosts, readingTime } from './blog';

export interface PartView {
  part: SeriesPart;
  /** 1-based position in the series */
  n: number;
  /** true when the post is visible in this build (drafts count only in `astro dev`) */
  published: boolean;
  url: string | null;
  title: string;
  titleVi?: string;
  mins: number | null;
}

export interface SeriesView {
  series: Series;
  url: string;
  parts: PartView[];
  publishedCount: number;
  /** first published part in series order, the cover's "start here" target */
  first: PartView | null;
}

export async function getSeriesView(id: string): Promise<SeriesView> {
  const series = SERIES[id];
  if (!series) throw new Error(`Unknown series "${id}"`);
  const posts = new Map((await getPublishedPosts()).map((p) => [p.id, p]));
  const parts = series.parts.map((part, i): PartView => {
    const post = posts.get(part.slug);
    return {
      part,
      n: i + 1,
      published: Boolean(post),
      url: post ? `/blog/${post.id}/` : null,
      title: post?.data.title ?? part.topic.en,
      titleVi: post ? post.data.title_vi : part.topic.vi,
      mins: post ? readingTime(post.body) : null,
    };
  });
  return {
    series,
    url: seriesUrl(series.id),
    parts,
    publishedCount: parts.filter((p) => p.published).length,
    first: parts.find((p) => p.published) ?? null,
  };
}

export async function getSeriesNav(slug: string) {
  const found = seriesOfPost(slug);
  if (!found) return null;
  const view = await getSeriesView(found.series.id);
  const current = view.parts[found.index];
  const prev = view.parts.slice(0, found.index).reverse().find((p) => p.published) ?? null;
  const next = view.parts.slice(found.index + 1).find((p) => p.published) ?? null;
  return { view, current, prev, next };
}
