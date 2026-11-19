// Blog series: an ordered set of posts with a cover page at /blog/series/<id>/.
// To add a series: add an entry below. Posts are matched by their slug (file name in
// src/content/blog/). Unpublished (draft) posts show as "soon" on the cover page and
// are skipped by the prev/next links in production.

export interface L10n { en: string; vi: string }

export type ActId = 'start' | 'structure' | 'surface' | 'craft';

export interface SeriesPart {
  slug: string;
  /** short name used inside the map */
  topic: L10n;
  /** one line: what the reader walks away with */
  hook: L10n;
  act: ActId;
  /** slugs this part builds on (drawn as the "builds on" hint) */
  builds: string[];
}

export interface SeriesPath {
  id: string;
  label: L10n;
  /** who it is for */
  who: L10n;
  /** slugs in reading order */
  order: string[];
}

export interface Series {
  id: string;
  title: L10n;
  kicker: L10n;
  tagline: L10n;
  pitch: L10n[];
  credit: L10n;
  outcomes: L10n[];
  acts: Record<ActId, { label: L10n; blurb: L10n }>;
  parts: SeriesPart[];
  paths: SeriesPath[];
}

const refactoringUi: Series = {
  id: 'refactoring-ui',
  title: {
    en: 'UI design for developers who ship with AI',
    vi: 'Thiết kế UI cho developer đang code cùng AI',
  },
  kicker: { en: 'A 9-part series', vi: 'Series 9 bài' },
  tagline: {
    en: 'Turn "it looks off" into a checklist you can name, fix, and prompt.',
    vi: 'Biến cảm giác "nhìn sao sao ấy" thành danh sách lỗi bạn gọi được tên, sửa được và ra lệnh được cho AI.',
  },
  pitch: [
    {
      en: 'AI can build a screen in a minute. It cannot tell you why that screen looks like every other AI screen.',
      vi: 'AI dựng một màn hình chỉ trong một phút. Nhưng nó không nói được vì sao màn hình đó trông giống hệt mọi màn hình AI khác.',
    },
    {
      en: 'Each post takes one part of the problem (hierarchy, spacing, type, colour, depth, images, polish) and gives you a rule you can check by eye, a live demo you can break, and a real product that already does it right.',
      vi: 'Mỗi bài lấy một mảnh của vấn đề (phân cấp, khoảng cách, chữ, màu, chiều sâu, ảnh, độ hoàn thiện) và đưa bạn một quy tắc kiểm tra được bằng mắt, một demo để tự bấm thử, và một sản phẩm thật đang làm đúng điều đó.',
    },
  ],
  credit: {
    en: 'Built on Refactoring UI by Adam Wathan and Steve Schoger, then extended with live demos, real-product screenshots and audits of this very site.',
    vi: 'Dựa trên Refactoring UI của Adam Wathan và Steve Schoger, bổ sung demo tương tác, ảnh chụp sản phẩm thật và các lần soát lỗi ngay trên chính blog này.',
  },
  outcomes: [
    {
      en: 'Name what is wrong with a screen in one word: hierarchy, spacing, type, colour, depth.',
      vi: 'Gọi tên lỗi của một màn hình bằng một từ: phân cấp, khoảng cách, chữ, màu, chiều sâu.',
    },
    {
      en: 'Write prompts that carry decisions instead of adjectives like "modern" and "clean".',
      vi: 'Viết prompt mang theo quyết định thay vì những tính từ như "hiện đại", "gọn gàng".',
    },
    {
      en: 'Replace eyeballed values with scales for spacing, type, shades and shadows.',
      vi: 'Thay giá trị chọn bằng mắt bằng các thang đo cho khoảng cách, cỡ chữ, sắc độ và đổ bóng.',
    },
    {
      en: 'Review AI-generated UI against a checklist, then train your eye past the rules.',
      vi: 'Duyệt UI do AI tạo theo một checklist, rồi rèn mắt đi xa hơn các quy tắc.',
    },
  ],
  acts: {
    start: {
      label: { en: 'Start here', vi: 'Bắt đầu' },
      blurb: { en: 'Decide before you prompt', vi: 'Chốt trước khi prompt' },
    },
    structure: {
      label: { en: 'Structure', vi: 'Cấu trúc' },
      blurb: { en: 'What goes where, how big', vi: 'Cái gì đặt đâu, to cỡ nào' },
    },
    surface: {
      label: { en: 'Surface', vi: 'Bề mặt' },
      blurb: { en: 'How it looks and feels', vi: 'Nhìn và cảm ra sao' },
    },
    craft: {
      label: { en: 'Craft', vi: 'Tay nghề' },
      blurb: { en: 'Polish and taste', vi: 'Độ hoàn thiện và gu' },
    },
  },
  parts: [
    {
      slug: 'design-before-you-prompt',
      topic: { en: 'Start from scratch', vi: 'Bắt đầu từ đầu' },
      hook: {
        en: 'Why AI UIs look the same, and the few decisions to lock in before you prompt.',
        vi: 'Vì sao UI do AI trông na ná nhau, và vài quyết định cần chốt trước khi prompt.',
      },
      act: 'start',
      builds: [],
    },
    {
      slug: 'visual-hierarchy-rank-before-you-style',
      topic: { en: 'Hierarchy', vi: 'Phân cấp' },
      hook: {
        en: 'Rank content first, then style it. De-emphasise instead of shouting louder.',
        vi: 'Xếp hạng nội dung trước rồi mới tạo kiểu. Làm dịu phần phụ thay vì hét to phần chính.',
      },
      act: 'structure',
      builds: ['design-before-you-prompt'],
    },
    {
      slug: 'spacing-is-a-system',
      topic: { en: 'Spacing', vi: 'Khoảng cách' },
      hook: {
        en: 'Pick spacing from a short scale and give each element only the width it needs.',
        vi: 'Chọn khoảng cách từ một thang ngắn và chỉ cho mỗi phần tử đúng độ rộng nó cần.',
      },
      act: 'structure',
      builds: ['visual-hierarchy-rank-before-you-style'],
    },
    {
      slug: 'typography-is-a-scale-not-a-slider',
      topic: { en: 'Typography', vi: 'Chữ' },
      hook: {
        en: 'A hand-built type scale, readable line lengths, and line-height that follows size.',
        vi: 'Thang cỡ chữ tự dựng, độ dài dòng dễ đọc và line-height đi theo cỡ chữ.',
      },
      act: 'structure',
      builds: ['visual-hierarchy-rank-before-you-style'],
    },
    {
      slug: 'color-is-a-palette-not-a-picker',
      topic: { en: 'Colour', vi: 'Màu sắc' },
      hook: {
        en: 'Shade ladders in HSL, tinted greys, and contrast that stays accessible.',
        vi: 'Thang sắc độ bằng HSL, xám pha sắc và độ tương phản vẫn đạt chuẩn tiếp cận.',
      },
      act: 'surface',
      builds: ['visual-hierarchy-rank-before-you-style', 'typography-is-a-scale-not-a-slider'],
    },
    {
      slug: 'depth-is-light-not-drop-shadow',
      topic: { en: 'Depth', vi: 'Chiều sâu' },
      hook: {
        en: 'Think light from above: an elevation scale, two-part shadows, and flat depth.',
        vi: 'Nghĩ như ánh sáng chiếu từ trên xuống: thang độ cao, bóng hai lớp và chiều sâu cho thiết kế phẳng.',
      },
      act: 'surface',
      builds: ['spacing-is-a-system', 'color-is-a-palette-not-a-picker'],
    },
    {
      slug: 'images-need-containers-not-hope',
      topic: { en: 'Images', vi: 'Hình ảnh' },
      hook: {
        en: 'Containers for user uploads, readable text over photos, icons at their real size.',
        vi: 'Khung chứa cho ảnh người dùng tải lên, chữ đọc được trên ảnh, icon đúng kích thước gốc.',
      },
      act: 'surface',
      builds: ['spacing-is-a-system', 'color-is-a-palette-not-a-picker'],
    },
    {
      slug: 'finishing-touches-that-make-ui-feel-real',
      topic: { en: 'Finishing touches', vi: 'Hoàn thiện' },
      hook: {
        en: 'The last 5%: upgraded defaults, accent borders, real empty states, fewer borders.',
        vi: '5% cuối: nâng cấp mặc định, viền nhấn, empty state đàng hoàng, bớt viền.',
      },
      act: 'craft',
      builds: ['color-is-a-palette-not-a-picker', 'depth-is-light-not-drop-shadow', 'images-need-containers-not-hope'],
    },
    {
      slug: 'leveling-up-your-design-eye',
      topic: { en: 'Train your eye', vi: 'Rèn mắt nhìn' },
      hook: {
        en: 'How to keep improving after the rules run out: study, copy, rebuild.',
        vi: 'Cách tiếp tục tiến bộ khi hết quy tắc để thuộc: quan sát, chép lại, dựng lại.',
      },
      act: 'craft',
      builds: ['finishing-touches-that-make-ui-feel-real'],
    },
  ],
  paths: [
    {
      id: 'full',
      label: { en: 'Read it all', vi: 'Đọc trọn bộ' },
      who: {
        en: 'You have an evening or two and want the whole system, in the order it builds up.',
        vi: 'Bạn có một hai buổi tối và muốn nắm cả hệ thống, theo đúng thứ tự xây dần.',
      },
      order: [
        'design-before-you-prompt',
        'visual-hierarchy-rank-before-you-style',
        'spacing-is-a-system',
        'typography-is-a-scale-not-a-slider',
        'color-is-a-palette-not-a-picker',
        'depth-is-light-not-drop-shadow',
        'images-need-containers-not-hope',
        'finishing-touches-that-make-ui-feel-real',
        'leveling-up-your-design-eye',
      ],
    },
    {
      id: 'generic',
      label: { en: 'My AI UI looks generic', vi: 'UI AI làm ra nhìn na ná' },
      who: {
        en: 'The code works but every screen looks like the average. Start with what to decide, then the biggest levers.',
        vi: 'Code chạy ổn nhưng màn nào cũng nhìn như đồ đại trà. Bắt đầu từ việc cần chốt, rồi tới những đòn bẩy lớn nhất.',
      },
      order: [
        'design-before-you-prompt',
        'visual-hierarchy-rank-before-you-style',
        'typography-is-a-scale-not-a-slider',
        'color-is-a-palette-not-a-picker',
        'leveling-up-your-design-eye',
      ],
    },
    {
      id: 'flat',
      label: { en: 'It looks flat or cheap', vi: 'Nhìn phẳng và rẻ tiền' },
      who: {
        en: 'Layout is fine, yet the screen feels lifeless. Fix rank, depth and the last details.',
        vi: 'Bố cục ổn nhưng màn hình thiếu sức sống. Sửa thứ bậc, chiều sâu và những chi tiết cuối.',
      },
      order: [
        'visual-hierarchy-rank-before-you-style',
        'depth-is-light-not-drop-shadow',
        'finishing-touches-that-make-ui-feel-real',
      ],
    },
    {
      id: 'quick',
      label: { en: 'Only 30 minutes', vi: 'Chỉ có 30 phút' },
      who: {
        en: 'The three posts that change a screen the most per minute read.',
        vi: 'Ba bài làm màn hình thay đổi nhiều nhất trên mỗi phút đọc.',
      },
      order: [
        'visual-hierarchy-rank-before-you-style',
        'spacing-is-a-system',
        'typography-is-a-scale-not-a-slider',
      ],
    },
    {
      id: 'real-data',
      label: { en: 'Real photos and data break it', vi: 'Ảnh và dữ liệu thật làm vỡ UI' },
      who: {
        en: 'It looked fine with placeholders. Now user photos, long names and empty lists arrive.',
        vi: 'Lúc dùng dữ liệu mẫu thì ổn. Giờ ảnh người dùng, tên dài và danh sách trống ập tới.',
      },
      order: [
        'spacing-is-a-system',
        'images-need-containers-not-hope',
        'finishing-touches-that-make-ui-feel-real',
      ],
    },
  ],
};

export const SERIES: Record<string, Series> = { [refactoringUi.id]: refactoringUi };
export const SERIES_IDS = Object.keys(SERIES);

export function seriesOfPost(slug: string) {
  for (const s of Object.values(SERIES)) {
    const index = s.parts.findIndex((p) => p.slug === slug);
    if (index >= 0) return { series: s, index, part: s.parts[index] };
  }
  return null;
}

export const seriesUrl = (id: string) => `/blog/series/${id}/`;
