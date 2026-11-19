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
  blogEyebrow: { en: 'Blog', vi: 'Blog' },
  statPosts: { en: 'posts', vi: 'bài viết' },
  statSeries: { en: 'book series', vi: 'series sách' },
  statReading: { en: 'of reading', vi: 'thời gian đọc' },
  latest: { en: 'Latest', vi: 'Mới nhất' },
  alsoNew: { en: 'Also new', vi: 'Cũng mới' },
  readThePost: { en: 'Read the post →', vi: 'Đọc bài viết →' },
  partOf: { en: 'Part {n} of {m}', vi: 'Phần {n}/{m}' },
  bookSeries: { en: 'Book series', vi: 'Series theo sách' },
  bookSeriesHint: { en: 'Read in order, or follow a path', vi: 'Đọc theo thứ tự, hoặc chọn một lộ trình' },
  viewAll: { en: 'View all →', vi: 'Xem tất cả →' },
  postsCount: { en: 'posts', vi: 'bài' },
  archive: { en: 'Archive', vi: 'Lưu trữ' },
  archiveHint: { en: 'Every post, newest first', vi: 'Mọi bài viết, mới nhất trước' },
  showAll: { en: 'Show all', vi: 'Hiện tất cả' },
  searchPosts: { en: 'Search posts', vi: 'Tìm bài viết' },
  noMatch: { en: 'No posts match', vi: 'Không có bài nào khớp' },
  openSeries: { en: 'Open the series →', vi: 'Xem cả series →' },
  soon: { en: 'soon', vi: 'sắp có' },
  allPublished: { en: 'all published', vi: 'đã đăng đủ' },
} as const;
