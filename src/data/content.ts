import content from './content.json';
import contentVi from './content-vi.json';

export default content;
export { contentVi };
export type Content = typeof content;

export const ui = {
  resume: { en: 'Resume', vi: 'Hồ sơ (CV)' },
  educationSub: { en: 'Education', vi: 'Học vấn' },
  certificatesSub: { en: 'Certificates', vi: 'Chứng chỉ' },
  viewCredential: { en: 'View →', vi: 'Xem →' },
  scholarBtn: { en: 'View All On Google Scholar →', vi: 'Xem tất cả trên Google Scholar →' },
  writingEyebrow: { en: 'Writing', vi: 'Bài viết' },
  latestHeading: { en: 'Latest from the blog', vi: 'Bài viết mới nhất' },
  latestSub: {
    en: 'Notes on the engineering problems I run into and how I solve them.',
    vi: 'Ghi chép về những bài toán kỹ thuật (engineering problems) thực tế và cách mình xử lý.',
  },
  allPosts: { en: 'All posts →', vi: 'Tất cả bài viết →' },
  allPostsBack: { en: '← All posts', vi: '← Tất cả bài viết' },
  blogTitle: { en: 'Writing', vi: 'Bài viết kỹ thuật' },
  blogEmpty: {
    en: 'First posts are on the way. Check back soon.',
    vi: 'Những bài viết đầu tiên đang được hoàn thiện. Hẹn bạn quay lại sớm nhé.',
  },
  allCategory: { en: 'All', vi: 'Tất cả' },
  minRead: { en: 'min read', vi: 'phút đọc' },
  updated: { en: 'Updated', vi: 'Cập nhật' },
  references: { en: 'References', vi: 'Tài liệu tham khảo' },
  rssFeed: { en: 'RSS feed', vi: 'Nguồn cấp RSS' },
} as const;
