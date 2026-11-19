// Add a new blog category here: it becomes valid in post frontmatter and gets its own page
// at /blog/category/<id>/ as soon as one published post uses it.
export const CATEGORY_IDS = ['frontend', 'backend', 'database', 'devops', 'ai', 'system-design', 'finance', 'ui-ux'] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  devops: 'DevOps & Cloud',
  ai: 'AI & ML',
  'system-design': 'System Design',
  finance: 'Finance',
  'ui-ux': 'UI / UX',
};

export const CATEGORY_LABELS_VI: Record<CategoryId, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Cơ sở dữ liệu (Database)',
  devops: 'DevOps',
  ai: 'Trí tuệ nhân tạo (AI)',
  'system-design': 'Thiết kế hệ thống (System Design)',
  finance: 'Tài chính (Finance)',
  'ui-ux': 'Giao diện & trải nghiệm (UI / UX)',
};
