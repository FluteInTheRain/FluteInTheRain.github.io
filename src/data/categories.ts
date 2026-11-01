// Add a new blog category here: it becomes valid in post frontmatter and gets its own page
// at /blog/category/<id>/ as soon as one published post uses it.
export const CATEGORY_IDS = ['frontend', 'backend', 'database', 'devops', 'ai', 'system-design'] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  devops: 'DevOps & Cloud',
  ai: 'AI & ML',
  'system-design': 'System Design',
};
