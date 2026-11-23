// Blog series: an ordered set of posts with a cover page at /blog/series/<id>/.
// To add a series: add an entry below. Posts are matched by their slug (file name in
// src/content/blog/). Unpublished (draft) posts show as "soon" on the cover page and
// are skipped by the prev/next links in production.

import type { ImageMetadata } from 'astro';
import draftingSet from '../assets/series/drafting-set.jpg';
import ramac305 from '../assets/series/ibm-305-ramac.jpg';
import goGophers from '../assets/series/go-gopher-five-years.jpg';
import stockCert from '../assets/series/stock-certificate-1892.jpg';
import hoseBuilding from '../assets/series/ai-trading/hose-building.jpg';
import backendPlate from '../assets/series/backend-plate.png';

export interface L10n { en: string; vi: string }

/** what the book cover shows (BookCover.astro) and how its photo is credited */
export interface SeriesCoverArt {
  subtitle: L10n;
  image: ImageMetadata;
  alt: string;
  /** CSS object-position for the photo plate */
  position: string;
  /** small label at the cover's foot */
  imprint: string;
  credit: { title: string; author: string; url: string; license: string };
}

/** one column of the reading map; `id` is what `SeriesPart.act` refers to */
export interface SeriesAct { id: string; label: L10n; blurb: L10n }

export interface SeriesPart {
  slug: string;
  /** short name used inside the map */
  topic: L10n;
  /** one line: what the reader walks away with */
  hook: L10n;
  /** id of one of the series' `acts` */
  act: string;
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
  cover: SeriesCoverArt;
  outcomes: L10n[];
  /** map columns, left to right */
  acts: SeriesAct[];
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
  // A drafting set keeps every instrument in its own slot on a grid: the series' idea of fixed scales over eyeballing.
  cover: {
    subtitle: {
      en: 'Hierarchy · Spacing · Type · Colour · Depth',
      vi: 'Phân cấp · Khoảng cách · Chữ · Màu · Chiều sâu',
    },
    image: draftingSet,
    alt: 'A vintage drafting set open on graph paper: compasses, dividers and ruling pens, each resting in its own slot of a blue velvet case.',
    position: '55% 60%',
    imprint: 'UI / UX',
    credit: { title: 'Anker compass set in case', author: 'Slashme', url: 'https://commons.wikimedia.org/wiki/File:Anker_compass_set_in_case.jpg', license: 'CC0' },
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
  acts: [
    {
      id: 'start',
      label: { en: 'Start here', vi: 'Bắt đầu' },
      blurb: { en: 'Decide before you prompt', vi: 'Chốt trước khi prompt' },
    },
    {
      id: 'structure',
      label: { en: 'Structure', vi: 'Cấu trúc' },
      blurb: { en: 'What goes where, how big', vi: 'Cái gì đặt đâu, to cỡ nào' },
    },
    {
      id: 'surface',
      label: { en: 'Surface', vi: 'Bề mặt' },
      blurb: { en: 'How it looks and feels', vi: 'Nhìn và cảm ra sao' },
    },
    {
      id: 'craft',
      label: { en: 'Craft', vi: 'Tay nghề' },
      blurb: { en: 'Polish and taste', vi: 'Độ hoàn thiện và gu' },
    },
  ],
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

const D = {
  tradeOffs: 'trade-offs-in-data-systems-architecture',
  nfr: 'reliable-scalable-maintainable-data-systems',
  models: 'data-models-and-query-languages',
  storage: 'storage-engines-logs-lsm-btree-columns',
  encoding: 'encoding-and-schema-evolution',
  replication: 'replication-when-copies-disagree',
  sharding: 'sharding-keys-ranges-hashes-hot-spots',
  transactions: 'transactions-acid-isolation-anomalies-serializability',
  trouble: 'trouble-with-distributed-systems-networks-clocks-fencing',
  consensus: 'consistency-consensus-linearizability-logical-clocks-raft',
  batch: 'batch-processing-unix-pipes-shuffle-dataflow-lakehouse',
  stream: 'stream-processing-event-logs-cdc-windows-joins',
  unbundling: 'philosophy-of-streaming-systems-unbundling-end-to-end-correctness',
  ethics: 'doing-the-right-thing-ethics-privacy-algorithmic-bias',
};

const ddia: Series = {
  id: 'ddia',
  title: {
    en: 'Data systems, explained by the outages that shaped them',
    vi: 'Hệ thống dữ liệu, giải thích qua những sự cố đã định hình chúng',
  },
  kicker: { en: 'A 14-part series', vi: 'Series 14 bài' },
  tagline: {
    en: 'From one disk to many machines: what each design choice costs, shown with real incidents and demos you can break.',
    vi: 'Từ một ổ đĩa tới nhiều máy: mỗi lựa chọn thiết kế phải trả giá gì, minh họa bằng sự cố thật và demo để bạn tự làm hỏng.',
  },
  pitch: [
    {
      en: 'Most data bugs are not code bugs. A replica that lags, a clock that jumps, a retry that charges twice: the code is fine and the system is still wrong.',
      vi: 'Phần lớn lỗi dữ liệu không nằm ở code. Replica chạy chậm, đồng hồ nhảy giờ, một lần retry trừ tiền hai lần: code không sai mà hệ thống vẫn sai.',
    },
    {
      en: 'Each post takes one layer, from how a database lays bytes on disk to how a fleet of nodes agrees on one log, and walks through the real outage, the diagram of the system involved, and the idea that would have prevented it.',
      vi: 'Mỗi bài lấy một tầng, từ cách database xếp byte xuống đĩa tới cách nhiều node thống nhất một log chung, rồi đi qua sự cố có thật, sơ đồ hệ thống liên quan và ý tưởng lẽ ra đã ngăn được nó.',
    },
  ],
  credit: {
    en: 'Built on Designing Data-Intensive Applications (2nd edition) by Martin Kleppmann and Chris Riccomini, extended with postmortems, architecture diagrams and live demos.',
    vi: 'Dựa trên Designing Data-Intensive Applications (bản 2) của Martin Kleppmann và Chris Riccomini, bổ sung postmortem thật, sơ đồ kiến trúc và demo tương tác.',
  },
  // An IBM 305 RAMAC, the first computer sold with a hard disk (1956): the series starts at one disk and ends at many machines.
  cover: {
    subtitle: {
      en: 'Storage · Replication · Consensus · Streams',
      vi: 'Lưu trữ · Replication · Đồng thuận · Luồng',
    },
    image: ramac305,
    alt: 'An IBM 305 RAMAC installation at the U.S. Army Red River Arsenal: tall cabinets, the 350 disk unit visible behind glass, and an operator at the console.',
    position: '50% 45%',
    imprint: 'SYSTEM DESIGN',
    credit: { title: 'IBM 305 RAMAC', author: 'U.S. Army Red River Arsenal', url: 'https://commons.wikimedia.org/wiki/File:BRL61-IBM_305_RAMAC.jpeg', license: 'Public domain' },
  },
  outcomes: [
    {
      en: 'Pick a data model and storage engine from the access pattern, not from habit.',
      vi: 'Chọn data model và storage engine theo cách dữ liệu được đọc ghi, không theo thói quen.',
    },
    {
      en: 'Predict what users see when replicas lag, shards run hot, or the network splits.',
      vi: 'Đoán trước người dùng thấy gì khi replica chậm, shard quá tải hay mạng bị chia cắt.',
    },
    {
      en: 'Name the isolation anomaly or clock bug behind a "can\'t happen" incident.',
      vi: 'Gọi đúng tên lỗi isolation hay lỗi đồng hồ đứng sau một sự cố "không thể xảy ra".',
    },
    {
      en: 'Design pipelines around logs and derived data that stay correct under retries.',
      vi: 'Thiết kế pipeline xoay quanh log và dữ liệu dẫn xuất, vẫn đúng khi bị retry.',
    },
  ],
  acts: [
    {
      id: 'foundations',
      label: { en: 'Foundations', vi: 'Nền tảng' },
      blurb: { en: 'How one system stores and shapes data', vi: 'Một hệ thống cất và định hình dữ liệu ra sao' },
    },
    {
      id: 'distributed',
      label: { en: 'Distributed data', vi: 'Dữ liệu phân tán' },
      blurb: { en: 'When data lives on many machines', vi: 'Khi dữ liệu nằm trên nhiều máy' },
    },
    {
      id: 'derived',
      label: { en: 'Derived data', vi: 'Dữ liệu dẫn xuất' },
      blurb: { en: "Built from other systems' data", vi: 'Dựng từ dữ liệu hệ thống khác' },
    },
  ],
  parts: [
    {
      slug: D.tradeOffs,
      topic: { en: 'Trade-offs', vi: 'Đánh đổi' },
      hook: {
        en: 'OLTP or analytics, cloud or own servers, one service or many: the choices made before the first line.',
        vi: 'OLTP hay phân tích, cloud hay máy riêng, một service hay nhiều: những lựa chọn có trước dòng code đầu tiên.',
      },
      act: 'foundations',
      builds: [],
    },
    {
      slug: D.nfr,
      topic: { en: 'Reliability', vi: 'Độ tin cậy' },
      hook: {
        en: 'Why average latency lies, how one celebrity post fans out, and what "maintainable" means in practice.',
        vi: 'Vì sao độ trễ trung bình đánh lừa, một bài của người nổi tiếng lan ra thế nào, và "dễ bảo trì" thực ra là gì.',
      },
      act: 'foundations',
      builds: [D.tradeOffs],
    },
    {
      slug: D.models,
      topic: { en: 'Data models', vi: 'Data model' },
      hook: {
        en: 'Documents, tables, graphs and event logs, chosen through migrations real teams made.',
        vi: 'Document, bảng, graph và event log, chọn qua những lần migration các team thật đã làm.',
      },
      act: 'foundations',
      builds: [D.tradeOffs],
    },
    {
      slug: D.storage,
      topic: { en: 'Storage engines', vi: 'Storage engine' },
      hook: {
        en: 'Logs, LSM-trees, B-trees and columns: how bytes sit on disk decides what is fast.',
        vi: 'Log, LSM-tree, B-tree và lưu theo cột: byte nằm trên đĩa ra sao quyết định thao tác nào nhanh.',
      },
      act: 'foundations',
      builds: [D.models],
    },
    {
      slug: D.encoding,
      topic: { en: 'Encoding', vi: 'Encoding' },
      hook: {
        en: 'Change a data format while old and new code run side by side, without breaking readers.',
        vi: 'Đổi định dạng dữ liệu khi code cũ và code mới chạy song song mà không làm vỡ bên đọc.',
      },
      act: 'foundations',
      builds: [D.models],
    },
    {
      slug: D.replication,
      topic: { en: 'Replication', vi: 'Replication' },
      hook: {
        en: 'Leaders, followers and quorums, and what users see when the copies disagree.',
        vi: 'Leader, follower và quorum, và người dùng thấy gì khi các bản sao lệch nhau.',
      },
      act: 'distributed',
      builds: [D.nfr, D.encoding],
    },
    {
      slug: D.sharding,
      topic: { en: 'Sharding', vi: 'Sharding' },
      hook: {
        en: 'Split data across nodes by key range or hash, rebalance it, and keep hot spots and indexes in check.',
        vi: 'Chia dữ liệu qua nhiều node theo dải khoá hoặc hash, cân bằng lại, và giữ hot spot cùng index trong tầm kiểm soát.',
      },
      act: 'distributed',
      builds: [D.storage, D.replication],
    },
    {
      slug: D.transactions,
      topic: { en: 'Transactions', vi: 'Transaction' },
      hook: {
        en: 'What ACID really promises: isolation anomalies, snapshots, write skew and two-phase commit.',
        vi: 'ACID thật sự hứa gì: lỗi isolation, snapshot, write skew và two-phase commit.',
      },
      act: 'distributed',
      builds: [D.storage, D.replication],
    },
    {
      slug: D.trouble,
      topic: { en: 'What breaks', vi: 'Chỗ dễ hỏng' },
      hook: {
        en: 'Lost packets, jumping clocks and paused processes, and why locks need fencing tokens.',
        vi: 'Mất gói tin, đồng hồ nhảy giờ, tiến trình khựng, và vì sao khoá cần fencing token.',
      },
      act: 'distributed',
      builds: [D.replication],
    },
    {
      slug: D.consensus,
      topic: { en: 'Consensus', vi: 'Đồng thuận' },
      hook: {
        en: 'Linearizability, logical clocks and Raft: how unreliable nodes agree on one log.',
        vi: 'Linearizability, đồng hồ logic và Raft: các node hay lỗi thống nhất một log chung ra sao.',
      },
      act: 'distributed',
      builds: [D.transactions, D.trouble],
    },
    {
      slug: D.batch,
      topic: { en: 'Batch processing', vi: 'Xử lý theo lô' },
      hook: {
        en: 'From Unix pipes to distributed shuffles and lakehouses, and where hot keys break them.',
        vi: 'Từ Unix pipe tới shuffle phân tán và lakehouse, và chỗ hot key làm chúng gãy.',
      },
      act: 'derived',
      builds: [D.sharding],
    },
    {
      slug: D.stream,
      topic: { en: 'Stream processing', vi: 'Xử lý luồng' },
      hook: {
        en: 'Event logs, change data capture, windows, watermarks and stream joins.',
        vi: 'Event log, change data capture, window, watermark và join luồng.',
      },
      act: 'derived',
      builds: [D.replication, D.batch],
    },
    {
      slug: D.unbundling,
      topic: { en: 'Unbundling', vi: 'Tháo rời DB' },
      hook: {
        en: 'Build one system from logs and derived views, and keep it correct end to end.',
        vi: 'Dựng một hệ thống từ log và view dẫn xuất, và giữ nó đúng từ đầu tới cuối.',
      },
      act: 'derived',
      builds: [D.consensus, D.stream],
    },
    {
      slug: D.ethics,
      topic: { en: 'Doing it right', vi: 'Làm cho đúng' },
      hook: {
        en: 'Bias that survives dropped columns, feedback loops, and user data as a liability.',
        vi: 'Thiên kiến vẫn còn dù đã xoá cột, vòng lặp phản hồi, và dữ liệu người dùng như một món nợ.',
      },
      act: 'derived',
      builds: [D.unbundling],
    },
  ],
  paths: [
    {
      id: 'full',
      label: { en: 'Read it all', vi: 'Đọc trọn bộ' },
      who: {
        en: 'You want the whole picture, from one disk up to systems built from logs.',
        vi: 'Bạn muốn nắm cả bức tranh, từ một ổ đĩa tới hệ thống dựng từ log.',
      },
      order: Object.values(D),
    },
    {
      id: 'interview',
      label: { en: 'System design interview', vi: 'Phỏng vấn system design' },
      who: {
        en: 'The topics interviewers probe most: latency, replication, sharding, transactions, failure and consensus.',
        vi: 'Những chủ đề hay bị hỏi nhất: độ trễ, replication, sharding, transaction, lỗi và đồng thuận.',
      },
      order: [D.nfr, D.replication, D.sharding, D.transactions, D.trouble, D.consensus, D.stream],
    },
    {
      id: 'distributed',
      label: { en: 'My data is on more than one machine', vi: 'Dữ liệu của tôi nằm trên nhiều máy' },
      who: {
        en: 'You already run replicas or shards and want to know what can go wrong.',
        vi: 'Bạn đã chạy replica hoặc shard và muốn biết điều gì có thể hỏng.',
      },
      order: [D.replication, D.sharding, D.trouble, D.consensus],
    },
    {
      id: 'pipelines',
      label: { en: 'I build data pipelines', vi: 'Tôi làm data pipeline' },
      who: {
        en: 'ETL, CDC and streaming jobs: formats that evolve, batch and stream, and correctness under retries.',
        vi: 'ETL, CDC và job streaming: định dạng thay đổi theo thời gian, batch và stream, và tính đúng khi bị retry.',
      },
      order: [D.tradeOffs, D.encoding, D.batch, D.stream, D.unbundling],
    },
    {
      id: 'database',
      label: { en: 'Picking a database', vi: 'Chọn database' },
      who: {
        en: 'Model first, then storage, then the guarantees you need, then how it splits.',
        vi: 'Chọn model trước, rồi storage, rồi các đảm bảo bạn cần, rồi cách chia dữ liệu.',
      },
      order: [D.models, D.storage, D.transactions, D.sharding],
    },
  ],
};

const G = {
  basics: 'go-first-program-modules-packages',
  types: 'go-variables-types-pointers-functions',
  collections: 'go-slices-maps-strings',
  structs: 'go-structs-methods-interfaces',
  errors: 'go-errors-defer-panic',
  testing: 'go-testing-table-tests',
  goroutines: 'go-goroutines-channels-select',
  context: 'go-context-timeouts-mutexes',
  concurrencyPatterns: 'go-concurrency-patterns-worker-pools-pipelines',
  httpService: 'go-http-service-net-http-json-middleware',
  memory: 'go-memory-data-types-slices-maps-strings',
  abstractions: 'go-abstractions-interfaces-generics-errors',
  concurrency: 'go-concurrency-scheduler-channels-context-mutexes',
  production: 'go-production-stdlib-cpu-cache-gc-kubernetes',
  workflow: 'go-efficiency-workflow-raer-tfbo-hardware-memory',
  hardware: 'go-hardware-cpu-caches-virtual-memory-gc-allocator',
  benchmarking: 'go-observability-metrics-microbenchmarks-benchstat',
  profiling: 'go-profiling-pprof-flamegraphs-off-cpu-continuous',
  patterns: 'go-three-rs-optimization-patterns-streaming-pooling',
  interview: 'go-interview-questions-output-live-coding',
};

const golang: Series = {
  id: 'golang',
  title: {
    en: 'How Go actually works',
    vi: 'Hiểu đúng bản chất Golang',
  },
  kicker: { en: 'A 20-part series', vi: 'Series 20 bài' },
  tagline: {
    en: 'One ladder from your first Go program to concurrent services, runtime traps, profiling, and interview prep.',
    vi: 'Một lộ trình liền mạch từ chương trình Go đầu tiên tới HTTP service, bẫy ngầm runtime, tối ưu hiệu năng và phỏng vấn.',
  },
  pitch: [
    {
      en: 'If you already write Java, Python, or JavaScript, learning Go syntax takes an afternoon — yet tutorials either stop at Hello World or jump straight into scheduler internals. This 20-part ladder climbs step by step: Levels 1–2 take you from your first module to writing, testing, and shipping a small concurrent HTTP service.',
      vi: 'Nếu bạn đã code Java, Python hay JavaScript, nắm cú pháp Go chỉ mất một buổi — nhưng tài liệu thường dừng ở Hello World hoặc nhảy thẳng vào ruột scheduler. Series 20 bài này đi từng bậc: Cấp 1–2 dẫn từ module đầu tiên tới viết, test và dựng một HTTP service chạy đồng thời hoàn chỉnh.',
    },
    {
      en: 'Levels 3–5 build on that service to explain the runtime traps behind classic Go bugs (slice headers, typed nil, GMP scheduling, production timeouts), teach data-driven optimization (RAER, TFBO, CPU caches/GC, benchstat, pprof/fgprof, Three Rs), and finish with interview questions and live-coding drills.',
      vi: 'Cấp 3–5 bám trên chính service đó để giải mã các bẫy runtime kinh điển (slice header, typed nil, bộ lập lịch GMP, timeout production), rèn quy trình tối ưu theo số đo (RAER, TFBO, CPU/GC, benchstat, pprof/fgprof, Three Rs), rồi khép lại bằng bài ôn phỏng vấn.',
    },
  ],
  credit: {
    en: 'Levels 1–2 draw on official Go docs and real production incidents; Levels 3–4 distill 100 Go Mistakes (Teiva Harsanyi) and Efficient Go (Bartłomiej Płotka), with every code sample and benchmark verified on Go 1.27.',
    vi: 'Cấp 1–2 tổng hợp từ tài liệu chuẩn Go và các sự cố thực tế; Cấp 3–4 đúc kết từ 100 Go Mistakes (Teiva Harsanyi) và Efficient Go (Bartłomiej Płotka), mọi ví dụ và benchmark đều chạy kiểm chứng trực tiếp trên Go 1.27.',
  },
  cover: {
    subtitle: {
      en: 'Write Go · Concurrency · Internals · Performance · Interview',
      vi: 'Viết Go · Đồng thời · Bản chất · Tối ưu · Phỏng vấn',
    },
    image: goGophers,
    alt: 'Three Go gophers gathered around an old reel-to-reel computer by Renee French.',
    position: '50% 45%',
    imprint: 'GOLANG',
    credit: {
      title: 'Go gopher five years',
      author: 'Renee French',
      url: 'https://commons.wikimedia.org/wiki/File:Go_gopher_five_years.jpg',
      license: 'CC BY 3.0',
    },
  },
  outcomes: [
    {
      en: 'Write, structure, test, and ship a small concurrent HTTP service in Go using only the standard library.',
      vi: 'Viết, tổ chức, kiểm thử và đóng gói một HTTP service chạy đồng thời bằng thư viện chuẩn Go.',
    },
    {
      en: 'Explain and catch the runtime mechanics behind classic Go bugs: shared slices, typed nil errors, goroutine leaks, and missing timeouts.',
      vi: 'Giải thích và bắt gọn nguyên nhân runtime sau các bug Go kinh điển: slice ghi đè chéo, typed nil, rò goroutine và thiếu timeout.',
    },
    {
      en: 'Prove speed-ups with numbers using RAER budgets, CPU/GC reasoning, benchstat, pprof/fgprof, and Three Rs streaming.',
      vi: 'Chứng minh tối ưu bằng số đo thật qua ngân sách RAER, tư duy CPU/GC, benchstat, pprof/fgprof và mẫu Three Rs.',
    },
    {
      en: 'Check yourself under interview pressure with concept Q&A, predict-the-output puzzles, and race-tested live coding.',
      vi: 'Tự kiểm tra dưới áp lực phỏng vấn qua hỏi-đáp bản chất, đoán output và bài live-code chạy sạch với -race.',
    },
  ],
  acts: [
    {
      id: 'basics',
      label: { en: 'Write Go', vi: 'Viết Go' },
      blurb: { en: 'Write, structure & test Go', vi: 'Viết, tổ chức và test code Go' },
    },
    {
      id: 'concurrency',
      label: { en: 'Run things at once', vi: 'Chạy song song' },
      blurb: { en: 'Run work concurrently & ship HTTP', vi: 'Chạy đồng thời & dựng service' },
    },
    {
      id: 'internals',
      label: { en: 'Under the hood & traps', vi: 'Bên trong & bẫy' },
      blurb: { en: 'Why classic Go bugs happen', vi: 'Vì sao các bug Go xảy ra' },
    },
    {
      id: 'performance',
      label: { en: 'Measure, then optimize', vi: 'Đo rồi mới tối ưu' },
      blurb: { en: 'Prove speed-ups with numbers', vi: 'Chứng minh tối ưu bằng con số' },
    },
    {
      id: 'interview',
      label: { en: 'Check yourself', vi: 'Tự kiểm tra' },
      blurb: { en: 'Answer & code under pressure', vi: 'Trả lời & code khi phỏng vấn' },
    },
  ],
  parts: [
    {
      slug: G.basics,
      topic: { en: 'Go basics', vi: 'Go cơ bản' },
      hook: {
        en: 'Go toolchain, modules and go.mod, packages, internal/ visibility, project layout, and gofmt/go vet.',
        vi: 'Toolchain Go, module và go.mod, package, phạm vi internal/, bố cục thư mục và gofmt/go vet.',
      },
      act: 'basics',
      builds: [],
    },
    {
      slug: G.types,
      topic: { en: 'Types & funcs', vi: 'Kiểu & hàm' },
      hook: {
        en: 'Zero values, numeric conversions, multiple returns, pass-by-value pointers, LIFO defer, and := shadowing.',
        vi: 'Zero value sạch, ép kiểu tường minh, nhiều giá trị trả về, con trỏ truyền tham trị, defer LIFO và bẫy := che biến.',
      },
      act: 'basics',
      builds: [G.basics],
    },
    {
      slug: G.collections,
      topic: { en: 'Collections', vi: 'Slice & map' },
      hook: {
        en: 'Arrays vs slices, len/cap and append, nil vs empty, random map iteration, and UTF-8 bytes vs runes.',
        vi: 'Array khác slice thế nào, len/cap và append, nil vs rỗng, thứ tự map ngẫu nhiên và byte UTF-8 với rune.',
      },
      act: 'basics',
      builds: [G.types],
    },
    {
      slug: G.structs,
      topic: { en: 'Struct & method', vi: 'Struct & method' },
      hook: {
        en: 'No classes: structs, value vs pointer receivers, composition by embedding, implicit interfaces, and type switches.',
        vi: 'Không có class: struct, value/pointer receiver, embedding thay kế thừa, interface ngầm định và type switch.',
      },
      act: 'basics',
      builds: [G.types, G.collections],
    },
    {
      slug: G.errors,
      topic: { en: 'Go errors', vi: 'Lỗi & defer' },
      hook: {
        en: 'Errors as values, %w wrapping, errors.Is/As/Join, handle once, named result err traps, and panic/recover.',
        vi: 'Lỗi là giá trị, bọc %w, errors.Is/As/Join, xử lý lỗi một lần, bẫy err với named result và panic/recover.',
      },
      act: 'basics',
      builds: [G.types, G.structs],
    },
    {
      slug: G.testing,
      topic: { en: 'Go testing', vi: 'Test trong Go' },
      hook: {
        en: 'Table-driven subtests, t.Helper, coverage, -short and build tags, httptest, and a first look at -race.',
        vi: 'Table-driven test, t.Helper, coverage, -short và build tag, httptest và làm quen với cờ -race.',
      },
      act: 'basics',
      builds: [G.structs, G.errors],
    },
    {
      slug: G.goroutines,
      topic: { en: 'Goroutines', vi: 'Goroutine' },
      hook: {
        en: 'Concurrency vs parallelism, go f(), WaitGroup, buffered vs unbuffered channels, select, and stopping every goroutine.',
        vi: 'Concurrency vs parallelism, go f(), WaitGroup, channel có/không buffer, select và đường dừng cho mọi goroutine.',
      },
      act: 'concurrency',
      builds: [G.types, G.collections],
    },
    {
      slug: G.context,
      topic: { en: 'Context & locks', vi: 'Context & khóa' },
      hook: {
        en: 'Propagating deadlines and cancel with context.Context, Mutex/RWMutex, never copying sync types, and channel vs mutex.',
        vi: 'Lan truyền timeout/cancel qua context.Context, Mutex/RWMutex, tránh copy kiểu sync và chọn channel hay mutex.',
      },
      act: 'concurrency',
      builds: [G.errors, G.goroutines],
    },
    {
      slug: G.concurrencyPatterns,
      topic: { en: 'Patterns', vi: 'Mẫu concurrency' },
      hook: {
        en: 'Worker pools, pipelines with cancellation, fan-out/fan-in, semaphores, rate limiting, and errgroup shutdown.',
        vi: 'Worker pool, pipeline kèm hủy ngang, fan-out/fan-in, semaphore, rate limit và tắt gọn với errgroup.',
      },
      act: 'concurrency',
      builds: [G.goroutines, G.context],
    },
    {
      slug: G.httpService,
      topic: { en: 'HTTP service', vi: 'HTTP service' },
      hook: {
        en: 'Assembling levels 1–2 into a stdlib JSON API: routing, middleware, slog, server timeouts, graceful shutdown, and FROM scratch.',
        vi: 'Gom cấp 1–2 thành JSON API chuẩn thư viện Go: routing, middleware, slog, timeout, tắt êm và đóng gói FROM scratch.',
      },
      act: 'concurrency',
      builds: [G.basics, G.errors, G.testing, G.context],
    },
    {
      slug: G.memory,
      topic: { en: 'Go memory', vi: 'Bộ nhớ Go' },
      hook: {
        en: 'Slice headers, append overwrites, slice/map memory leaks, SwissTable maps, range copies, and Trim pitfalls.',
        vi: 'Slice header, append ghi đè ngầm, rò RAM ở slice/map, map SwissTable, range copy và bẫy strings.Trim.',
      },
      act: 'internals',
      builds: [G.collections, G.structs],
    },
    {
      slug: G.abstractions,
      topic: { en: 'Interfaces', vi: 'Sâu về interface' },
      hook: {
        en: 'Interface (type, data) layout, typed-nil traps, consumer interfaces, generics usage, functional options, and embedding.',
        vi: 'Cặp (type, data) của interface, bẫy typed nil, interface phía người gọi, generics, functional options và embedding.',
      },
      act: 'internals',
      builds: [G.structs, G.errors],
    },
    {
      slug: G.concurrency,
      topic: { en: 'GMP & Locks', vi: 'GMP & Locks' },
      hook: {
        en: 'GMP scheduler, data races vs race conditions, Go 1.22 loop vars, random select, nil channels, and the etcd deadlock.',
        vi: 'Bộ lập lịch GMP, data race vs race condition, biến vòng lặp Go 1.22, select ngẫu nhiên, nil channel và deadlock ở etcd.',
      },
      act: 'internals',
      builds: [G.goroutines, G.context],
    },
    {
      slug: G.production,
      topic: { en: 'Production', vi: 'Go production' },
      hook: {
        en: 'http.DefaultClient traps, time.After leaks, JSON and sql.DB pools, closing resources, and K8s CFS throttling.',
        vi: 'Bẫy http.DefaultClient, rò time.After, JSON và pool database/sql, quên return sau http.Error và bóp CPU trên K8s.',
      },
      act: 'internals',
      builds: [G.httpService, G.concurrency],
    },
    {
      slug: G.workflow,
      topic: { en: 'When to tune', vi: 'Khi nào tối ưu' },
      hook: {
        en: 'Why scaling pods does not fix tail latency, efficiency vs speed, RAER budgets, 5 design levels, and TFBO.',
        vi: 'Mở thêm pod không cứu được p99, hiệu suất vs tốc độ, đặt hợp đồng RAER, 5 tầng thiết kế và quy trình TFBO.',
      },
      act: 'performance',
      builds: [G.production],
    },
    {
      slug: G.hardware,
      topic: { en: 'Hardware & GC', vi: 'Phần cứng & GC' },
      hook: {
        en: 'CPU caches and false sharing, struct alignment, escape analysis, VSS vs RSS, tri-color GC, and GOMEMLIMIT.',
        vi: 'Cache CPU và false sharing, căn lề struct, escape analysis, bộ nhớ ảo VSS/RSS, GC ba màu và GOMEMLIMIT.',
      },
      act: 'performance',
      builds: [G.memory, G.workflow],
    },
    {
      slug: G.benchmarking,
      topic: { en: 'Benchmarking', vi: 'Đo & benchstat' },
      hook: {
        en: 'RED/USE metrics, container vs runtime memory, benchmarks that do not lie (b.Loop), benchstat, and macrobenchmarks.',
        vi: 'Chỉ số RED/USE, RAM container vs runtime, viết microbenchmark không tự lừa (b.Loop), benchstat và macrobenchmark.',
      },
      act: 'performance',
      builds: [G.testing, G.workflow, G.hardware],
    },
    {
      slug: G.profiling,
      topic: { en: 'Profiling', vi: 'pprof & fgprof' },
      hook: {
        en: 'Safe /debug/pprof endpoints, Flat vs Cum in flame graphs, alloc_space vs inuse_space, fgprof, and -diff_base.',
        vi: 'Mở /debug/pprof an toàn, đọc Flat/Cum trên flame graph, alloc_space vs inuse_space, fgprof và so sánh -diff_base.',
      },
      act: 'performance',
      builds: [G.benchmarking],
    },
    {
      slug: G.patterns,
      topic: { en: 'Three Rs & I/O', vi: 'Three Rs & I/O' },
      hook: {
        en: 'Do less work, the Three Rs, Sum1 to Sum6Reader streaming in fixed memory, sharding, and sync.Pool trade-offs.',
        vi: 'Làm ít việc hơn, Three Rs, tối ưu Sum1 tới Sum6Reader chạy streaming RAM cố định, sharding và đánh đổi của sync.Pool.',
      },
      act: 'performance',
      builds: [G.hardware, G.profiling],
    },
    {
      slug: G.interview,
      topic: { en: 'Interview prep', vi: 'Ôn phỏng vấn' },
      hook: {
        en: 'Concept Q&A across levels 1–4, predict-the-output traps verified on Go 1.27, and three race-tested live-coding tasks.',
        vi: 'Hỏi-đáp bản chất cấp 1–4, bài tập đoán output kiểm chứng trên Go 1.27 và 3 bài live-coding kèm test -race.',
      },
      act: 'interview',
      builds: [G.concurrencyPatterns, G.memory, G.abstractions, G.concurrency, G.hardware],
    },
  ],
  paths: [
    {
      id: 'full',
      label: { en: 'Read it all (20 parts)', vi: 'Đọc trọn bộ (20 bài)' },
      who: {
        en: 'Climb the whole ladder from your first Go program to concurrency, runtime traps, profiling, and interview prep.',
        vi: 'Đi trọn lộ trình từ chương trình Go đầu tiên qua concurrency, bẫy runtime, tối ưu số đo tới ôn phỏng vấn.',
      },
      order: [
        G.basics, G.types, G.collections, G.structs, G.errors, G.testing,
        G.goroutines, G.context, G.concurrencyPatterns, G.httpService,
        G.memory, G.abstractions, G.concurrency, G.production,
        G.workflow, G.hardware, G.benchmarking, G.profiling, G.patterns,
        G.interview,
      ],
    },
    {
      id: 'new-to-go',
      label: { en: 'New to Go (1–10)', vi: 'Mới học Go (Bài 1–10)' },
      who: {
        en: 'Know another language and want to write, test, and ship a concurrent HTTP service in Go from scratch.',
        vi: 'Đã viết ngôn ngữ khác và muốn nắm Go từ đầu tới lúc viết, test và dựng xong một HTTP service chạy đồng thời.',
      },
      order: [
        G.basics, G.types, G.collections, G.structs, G.errors, G.testing,
        G.goroutines, G.context, G.concurrencyPatterns, G.httpService,
      ],
    },
    {
      id: 'review',
      label: { en: 'Catch the classic bugs (11–14)', vi: 'Bắt các bug kinh điển (Bài 11–14)' },
      who: {
        en: 'Understand the runtime internals behind slice overwrites, typed nil, GMP races, and production K8s traps.',
        vi: 'Hiểu cơ chế runtime sau các lỗi slice đè chéo, typed nil, race trong GMP và bẫy production trên Kubernetes.',
      },
      order: [G.memory, G.abstractions, G.concurrency, G.production],
    },
    {
      id: 'performance',
      label: { en: 'Make slow Go fast (15–19)', vi: 'Tối ưu Go có số đo (Bài 15–19)' },
      who: {
        en: 'Measure before tuning: RAER budgets, CPU caches and GC, benchstat, pprof/fgprof, and Three Rs streaming.',
        vi: 'Đo trước khi sửa: ngân sách RAER, CPU cache và GC, benchstat, soi pprof/fgprof và mẫu Three Rs.',
      },
      order: [G.workflow, G.hardware, G.benchmarking, G.profiling, G.patterns],
    },
    {
      id: 'oncall',
      label: { en: 'Leaks and latency spikes', vi: 'Rò RAM & vọt độ trễ' },
      who: {
        en: 'Service holding memory or stalling under load? Jump straight to memory traps, production timeouts, GC, profiles, and streaming.',
        vi: 'Service ăn RAM không nhả hay p99 vọt cao? Đi thẳng tới bẫy bộ nhớ, timeout production, GC, pprof và streaming.',
      },
      order: [G.memory, G.production, G.hardware, G.profiling, G.patterns],
    },
    {
      id: 'interview',
      label: { en: 'Preparing for a Go interview', vi: 'Ôn phỏng vấn Go' },
      who: {
        en: 'Drill concept questions, output puzzles, and live-coding tasks, with links back to the runtime posts behind each answer.',
        vi: 'Luyện hỏi-đáp, đoán output và live-coding, kèm đường dẫn về đúng bài giải thích cơ chế phía sau.',
      },
      order: [G.interview, G.memory, G.abstractions, G.concurrency, G.production],
    },
  ],
};

const S = {
  ownership: 'what-is-a-stock-ownership-dividends',
  account: 'vietnam-stock-market-venues-open-account',
  orders: 'vietnam-order-types-order-book-ato-atc',
  settlement: 'stock-fees-taxes-settlement-t2-vsd',
  dividends: 'shareholder-rights-dividends-corporate-actions',
  statements: 'reading-financial-statements-investors-5-minutes',
  ratios: 'pe-pb-roe-valuation-ratios-in-context',
  macro: 'macro-industry-what-moves-stock-prices',
  risk: 'margin-trading-risks-beginner-psychology',
  plan: 'portfolio-dca-first-investment-plan',
};

const stocksBasics: Series = {
  id: 'stocks-basics',
  title: {
    en: 'Stock market basics',
    vi: 'Chứng khoán cơ bản',
  },
  kicker: { en: 'A 10-part series', vi: 'Series 10 bài' },
  tagline: {
    en: 'What a share is, how Vietnamese markets run, and how not to lose your first savings.',
    vi: 'Cổ phiếu là gì, thị trường Việt chạy thế nào, và làm sao không mất khoản tiết kiệm đầu tiên.',
  },
  pitch: [
    {
      en: 'Most beginners lose money not because the market is rigged but because they never learned the mechanics: which order types actually fill, when money really arrives (T+2), what a dividend does to the price, and why margin makes every mistake bigger.',
      vi: 'Người mới thua tiền đa số không phải vì thị trường chơi xấu, mà vì họ chưa học cơ chế: lệnh nào thật sự khớp, tiền bao giờ thật sự về (T+2), cổ tức làm giá thay đổi ra sao, và vì sao margin phóng to mọi sai lầm.',
    },
    {
      en: 'Each post takes one step you can act on today — open an account, place an ATO order, skim a financial statement — and explains the machinery behind it with real numbers from Vietnamese markets and the classics of investing.',
      vi: 'Mỗi bài là một bước làm được ngay hôm nay — mở tài khoản, đặt lệnh ATO, lướt qua một BCTC — kèm giải thích cơ chế phía sau bằng số thật từ thị trường Việt và các kinh điển của đầu tư.',
    },
  ],
  credit: {
    en: 'Assembled from Vietnamese market mechanics (HOSE, HNX and VSDC rules, fee schedules, issuer filings) plus investing classics: The Intelligent Investor (Graham), One Up on Wall Street (Lynch) and The Psychology of Money (Housel).',
    vi: 'Tổng hợp từ cơ chế thị trường Việt (quy định HOSE, HNX, VSDC, bảng phí, báo cáo doanh nghiệp) cùng các kinh điển về đầu tư: The Intelligent Investor (Graham), One Up on Wall Street (Lynch) và The Psychology of Money (Housel).',
  },
  // A lithographed 1892 stock certificate: the "basic" unit of the market, before it was a number on a screen.
  cover: {
    subtitle: {
      en: 'Ownership · Orders · Numbers · Discipline',
      vi: 'Sở hữu · Lệnh · Con số · Kỷ luật',
    },
    image: stockCert,
    alt: 'A lithographed stock certificate from 1892 with ornate borders and a central vignette.',
    position: '50% 55%',
    imprint: 'STOCKS',
    credit: {
      title: 'Original company stock certificate',
      author: 'Downingsf',
      url: 'https://commons.wikimedia.org/wiki/File:Original_company_stock_certificate.jpg',
      license: 'CC BY-SA 3.0',
    },
  },
  outcomes: [
    {
      en: 'Say what a share gives you: a claim on earnings and dividends, not a lottery ticket.',
      vi: 'Nói được cổ phiếu cho bạn gì: quyền hưởng lợi nhuận và cổ tức, chứ không phải tấm vé số.',
    },
    {
      en: 'Open an account and trade with intent: ATO/ATC/LO orders, fees, and the T+2 money path.',
      vi: 'Mở tài khoản và đặt lệnh có chủ đích: lệnh ATO/ATC/LO, phí, và dòng tiền T+2.',
    },
    {
      en: 'Skim a financial statement and read PE, PB and ROE with industry context.',
      vi: 'Đọc lướt một BCTC và hiểu PE, PB, ROE đúng theo ngữ cảnh ngành.',
    },
    {
      en: 'Run a first-year plan: DCA, position limits and written rules for when to sell.',
      vi: 'Chạy được kế hoạch năm đầu: DCA, giới hạn tỷ trọng và quy tắc bán viết ra giấy.',
    },
  ],
  acts: [
    {
      id: 'ground',
      label: { en: 'Foundations', vi: 'Nền tảng' },
      blurb: { en: 'What a share is, where to buy one', vi: 'Cổ phiếu là gì, mua ở đâu' },
    },
    {
      id: 'money',
      label: { en: 'The money path', vi: 'Dòng tiền' },
      blurb: { en: 'Fees, settlement, dividends', vi: 'Phí, thanh toán, cổ tức' },
    },
    {
      id: 'read',
      label: { en: 'Reading the numbers', vi: 'Đọc số' },
      blurb: { en: 'Statements, ratios, macro', vi: 'BCTC, chỉ số, vĩ mô' },
    },
    {
      id: 'discipline',
      label: { en: 'Staying in the game', vi: 'Trụ lại trên thị trường' },
      blurb: { en: 'Risk, psychology, a plan', vi: 'Rủi ro, tâm lý, kế hoạch' },
    },
  ],
  parts: [
    {
      slug: S.ownership,
      topic: { en: 'A share is ownership', vi: 'Cổ phiếu là sở hữu' },
      hook: {
        en: 'One share is one slice of a company — earnings, dividends and why prices move.',
        vi: 'Một cổ phiếu là một mảnh doanh nghiệp — lợi nhuận, cổ tức và vì sao giá chạy.',
      },
      act: 'ground',
      builds: [],
    },
    {
      slug: S.account,
      topic: { en: 'Open an account', vi: 'Mở tài khoản' },
      hook: {
        en: 'Choosing a Vietnamese broker and what HOSE, HNX and UPCoM actually are.',
        vi: 'Chọn công ty chứng khoán Việt Nam và HOSE, HNX, UPCoM thực ra là gì.',
      },
      act: 'ground',
      builds: [S.ownership],
    },
    {
      slug: S.orders,
      topic: { en: 'Prices & orders', vi: 'Bảng giá & lệnh' },
      hook: {
        en: 'Reading the board and placing LO, ATO, ATC and MP orders without paying the spread.',
        vi: 'Đọc bảng giá và đặt lệnh LO, ATO, ATC, MP mà không trả giá cho spread.',
      },
      act: 'ground',
      builds: [S.account],
    },
    {
      slug: S.settlement,
      topic: { en: 'Fees & settlement', vi: 'Phí & thanh toán' },
      hook: {
        en: 'Where your money goes after a trade: fees, tax and T+2 settlement through VSDC.',
        vi: 'Tiền của bạn đi đâu sau lệnh: phí, thuế và thanh toán bù trừ T+2 qua VSDC.',
      },
      act: 'money',
      builds: [S.orders],
    },
    {
      slug: S.dividends,
      topic: { en: 'Dividends & rights', vi: 'Cổ tức & quyền' },
      hook: {
        en: 'Cash vs stock dividends, splits, ex-date traps and dilution from new issuance.',
        vi: 'Cổ tức tiền hay cổ phiếu, chia tách, bẫy ex-date và pha loãng khi phát hành thêm.',
      },
      act: 'money',
      builds: [S.settlement],
    },
    {
      slug: S.statements,
      topic: { en: 'Financial statements', vi: 'BCTC' },
      hook: {
        en: 'Five minutes with a financial statement: what to check and what smells wrong.',
        vi: 'Năm phút với một BCTC: đọc gì, và gì là dấu hiệu đáng ngờ.',
      },
      act: 'read',
      builds: [S.ownership],
    },
    {
      slug: S.ratios,
      topic: { en: 'Valuation ratios', vi: 'Chỉ số định giá' },
      hook: {
        en: 'PE, PB and ROE mean nothing without context: industry benchmarks and earnings cycles.',
        vi: 'PE, PB, ROE không có nghĩa nếu thiếu ngữ cảnh: chuẩn ngành và chu kỳ lợi nhuận.',
      },
      act: 'read',
      builds: [S.statements],
    },
    {
      slug: S.macro,
      topic: { en: 'Macro & industry', vi: 'Vĩ mô & ngành' },
      hook: {
        en: 'Interest rates, FX and cycles move whole sectors — read the current, not the noise.',
        vi: 'Lãi suất, tỷ giá và chu kỳ di chuyển cả một ngành — đọc dòng chảy, đừng đọc nhiễu.',
      },
      act: 'read',
      builds: [S.ratios],
    },
    {
      slug: S.risk,
      topic: { en: 'Risk & psychology', vi: 'Rủi ro & tâm lý' },
      hook: {
        en: 'Margin cuts both ways; herd behaviour, FOMO and how beginners actually lose money.',
        vi: 'Margin hai lưỡi; tâm lý đám đông, FOMO và người mới thật sự thua tiền thế nào.',
      },
      act: 'discipline',
      builds: [S.settlement, S.macro],
    },
    {
      slug: S.plan,
      topic: { en: 'Your first plan', vi: 'Kế hoạch đầu tiên' },
      hook: {
        en: 'A first-year plan: position sizing, DCA and written rules for when to sell.',
        vi: 'Kế hoạch năm đầu: tỷ trọng, DCA và quy tắc bán viết ra giấy.',
      },
      act: 'discipline',
      builds: [S.risk],
    },
  ],
  paths: [
    {
      id: 'full',
      label: { en: 'Read it all', vi: 'Đọc trọn bộ' },
      who: {
        en: 'You have an evening or two and want the whole picture, in the order it builds up.',
        vi: 'Bạn có một hai buổi tối và muốn thấy bức tranh trọn vẹn, theo đúng thứ tự xây dần.',
      },
      order: [S.ownership, S.account, S.orders, S.settlement, S.dividends, S.statements, S.ratios, S.macro, S.risk, S.plan],
    },
    {
      id: 'first-trade',
      label: { en: 'Place your first trade', vi: 'Đặt lệnh đầu tiên' },
      who: {
        en: 'You want to trade this week: the mechanics, nothing else yet.',
        vi: 'Bạn muốn đặt lệnh trong tuần này: chỉ cần cơ chế, chuyện khác để sau.',
      },
      order: [S.ownership, S.account, S.orders, S.settlement],
    },
    {
      id: 'long-hold',
      label: { en: 'Invest slow, hold long', vi: 'Đầu tư chậm, nắm dài hạn' },
      who: {
        en: 'You would rather not watch the board every day.',
        vi: 'Bạn không muốn ngồi nhìn bảng giá mỗi ngày.',
      },
      order: [S.ownership, S.statements, S.ratios, S.dividends, S.risk, S.plan],
    },
  ],
};

const B = {
  lifecycle: 'backend-http-request-lifecycle',
  rest: 'backend-rest-api-design',
  validation: 'backend-validation-schemas',
  layering: 'backend-layered-architecture',
  data: 'backend-database-access-layer',
  async: 'backend-async-concurrency-workers',
  auth: 'backend-auth-oauth2-jwt',
  caching: 'backend-caching-queues',
  testing: 'backend-testing-strategy',
  observability: 'backend-observability',
  perf: 'backend-performance-p99',
  deploy: 'backend-production-deploy',
};

const backend: Series = {
  id: 'backend',
  title: {
    en: 'How backend actually works',
    vi: 'Hiểu đúng bản chất Backend',
  },
  kicker: { en: 'A 12-part series', vi: 'Series 12 bài' },
  tagline: {
    en: 'Backend knowledge first, with Python and FastAPI as the running demo — the judgment AI still can’t write for you.',
    vi: 'Kiến thức backend là chính, Python và FastAPI chỉ là bài demo chạy suốt — phần phán đoán mà AI chưa viết hộ được.',
  },
  pitch: [
    {
      en: 'AI writes a FastAPI service in seconds. It still POSTs everything, puts SQL right in the router, blocks the event loop with sync calls, and ships no tests, no logs, no timeouts — because backend is judgment, not syntax.',
      vi: 'AI dựng service FastAPI chỉ trong vài giây. Nhưng nó vẫn POST hết mọi thứ, nhét SQL ngay trong router, chặn event loop bằng lời gọi sync, và không kèm test, log hay timeout — vì backend là phán đoán, không phải cú pháp.',
    },
    {
      en: 'Each post takes one competence — the request lifecycle, API design, layering, data access, async, auth, caching, testing, observability, performance, deploys — explains the idea, then demonstrates it on a small running Python service you can rebuild yourself.',
      vi: 'Mỗi bài đi gọn một năng lực — vòng đời request, thiết kế API, phân tầng, truy cập dữ liệu, async, auth, caching, testing, observability, hiệu năng, triển khai — nói rõ ý, rồi demo ngay trên một service Python nhỏ mà bạn có thể tự dựng lại.',
    },
  ],
  credit: {
    en: 'Backend knowledge demonstrated in Python with FastAPI. FastAPI: Modern Python Web Development (Bill Lubanovic, O’Reilly 2023) is one of the references, alongside MDN, OWASP, the 12-factor app, and official docs.',
    vi: 'Kiến thức backend minh họa bằng Python với FastAPI. FastAPI: Modern Python Web Development (Bill Lubanovic, O’Reilly 2023) là một trong các tài liệu tham khảo, bên cạnh MDN, OWASP, 12-factor app và tài liệu chính thức.',
  },
  // The plate is the series' own demo service: the page every FastAPI app gives you for free.
  cover: {
    subtitle: {
      en: 'Requests · APIs · Layers · Ops',
      vi: 'Request · API · Tầng · Vận hành',
    },
    image: backendPlate,
    alt: 'Swagger UI page of the series’ small FastAPI demo service, listing its /health, /cases and /reports endpoints with Try it out buttons.',
    position: '50% 42%',
    imprint: 'BACKEND',
    credit: {
      title: 'Swagger UI of the series demo service',
      author: 'captured locally',
      url: 'https://fastapi.tiangolo.com/',
      license: 'screenshot',
      origin: 'FastAPI docs',
    },
  },
  outcomes: [
    {
      en: 'Design APIs by resource: right verbs, status codes that mean it, pagination, and idempotency that survives retries.',
      vi: 'Thiết kế API theo resource: đúng verb, status code đúng nghĩa, phân trang và idempotency sống sót qua retry.',
    },
    {
      en: 'Split web, service, and data layers so the router stays thin and business rules stay testable.',
      vi: 'Tách tầng web – service – data để router luôn mỏng và luật nghiệp vụ luôn test được.',
    },
    {
      en: 'Choose sync or async on purpose, size the worker pool, and never block the event loop again.',
      vi: 'Chọn sync hay async có chủ đích, chỉnh đúng pool worker và không bao giờ chặn event loop nữa.',
    },
    {
      en: 'Ship with tests, structured logs, metrics, timeouts, and a zero-downtime deploy you can explain.',
      vi: 'Bàn giao kèm test, log cấu trúc, metric, timeout và một bản deploy không downtime mà bạn giải thích được.',
    },
  ],
  acts: [
    {
      id: 'foundations',
      label: { en: 'Foundations', vi: 'Nền tảng' },
      blurb: { en: 'Requests, API design, validation at the edge', vi: 'Request, thiết kế API, validate ở biên' },
    },
    {
      id: 'building',
      label: { en: 'Building', vi: 'Dựng service' },
      blurb: { en: 'Layers, data access, async, auth', vi: 'Phân tầng, truy cập dữ liệu, async, auth' },
    },
    {
      id: 'operating',
      label: { en: 'Operating', vi: 'Vận hành' },
      blurb: { en: 'Caching, testing, observability, performance, deploys', vi: 'Caching, testing, observability, hiệu năng, triển khai' },
    },
  ],
  parts: [
    {
      slug: B.lifecycle,
      topic: { en: 'Request lifecycle', vi: 'Vòng đời request' },
      hook: {
        en: 'From URL to DNS, TCP, TLS, HTTP — down to the exact line of your code the server runs.',
        vi: 'Từ URL qua DNS, TCP, TLS, HTTP — tới đúng dòng code của bạn mà server chạy.',
      },
      act: 'foundations',
      builds: [],
    },
    {
      slug: B.rest,
      topic: { en: 'REST design', vi: 'Thiết kế REST' },
      hook: {
        en: 'Resources, verbs, status codes, pagination, idempotency — and the AI habits that break each.',
        vi: 'Resource, verb, status code, phân trang, idempotency — và mấy thói quen của AI phá vỡ từng thứ.',
      },
      act: 'foundations',
      builds: [B.lifecycle],
    },
    {
      slug: B.validation,
      topic: { en: 'Validation', vi: 'Validate ở biên' },
      hook: {
        en: 'Typed schemas at the boundary: reject early with 422s, never trust a client.',
        vi: 'Schema có kiểu ở biên: từ chối sớm bằng 422, đừng bao giờ tin client.',
      },
      act: 'foundations',
      builds: [B.rest],
    },
    {
      slug: B.layering,
      topic: { en: 'Layered design', vi: 'Phân tầng' },
      hook: {
        en: 'Web → service → data: why fat routers rot, and where business logic belongs.',
        vi: 'Web → service → data: vì sao router béo là thảm họa và logic nghiệp vụ nằm ở đâu.',
      },
      act: 'building',
      builds: [B.validation],
    },
    {
      slug: B.data,
      topic: { en: 'Data access', vi: 'Tầng dữ liệu' },
      hook: {
        en: 'Connection pools, a transaction per request, migrations, and the N+1 you can feel in p99.',
        vi: 'Connection pool, một transaction mỗi request, migration và lỗi N+1 thấy ngay ở p99.',
      },
      act: 'building',
      builds: [B.layering],
    },
    {
      slug: B.async,
      topic: { en: 'Async & workers', vi: 'Async & worker' },
      hook: {
        en: 'Event loop vs threads vs processes: when async wins, and the sync call that sinks it.',
        vi: 'Event loop, thread, process: async thắng ở đâu, và lời gọi sync nào làm chìm nó.',
      },
      act: 'building',
      builds: [B.lifecycle],
    },
    {
      slug: B.auth,
      topic: { en: 'Auth', vi: 'Xác thực' },
      hook: {
        en: 'Sessions vs JWT vs OAuth2, password hashing, scopes — and not becoming the confused deputy.',
        vi: 'Session, JWT, OAuth2, băm mật khẩu, scope — và đừng trở thành confused deputy.',
      },
      act: 'building',
      builds: [B.rest, B.data],
    },
    {
      slug: B.caching,
      topic: { en: 'Caching & jobs', vi: 'Cache & job nền' },
      hook: {
        en: 'Cache patterns, TTLs, invalidation, and background jobs that run at-least-once.',
        vi: 'Mẫu cache, TTL, invalidation, và job nền chạy at-least-once.',
      },
      act: 'operating',
      builds: [B.data],
    },
    {
      slug: B.testing,
      topic: { en: 'Testing', vi: 'Kiểm thử' },
      hook: {
        en: 'The pyramid in practice: unit vs integration vs e2e, fakes over mocks, load as a check.',
        vi: 'Kim tự tháp kiểm thử: unit, integration, e2e, fake hơn mock, và load test như một bước.',
      },
      act: 'operating',
      builds: [B.layering],
    },
    {
      slug: B.observability,
      topic: { en: 'Observability', vi: 'Observability' },
      hook: {
        en: 'Structured logs, metrics, traces, correlation IDs: debug by evidence, not by guess.',
        vi: 'Log cấu trúc, metric, trace, correlation ID: debug bằng chứng cứ, không đoán mò.',
      },
      act: 'operating',
      builds: [B.testing],
    },
    {
      slug: B.perf,
      topic: { en: 'Performance', vi: 'Hiệu năng' },
      hook: {
        en: 'p99 over averages, profiling before rewriting, timeouts, backpressure, load tests.',
        vi: 'p99 thay vì trung bình, profile trước khi viết lại, timeout, backpressure, load test.',
      },
      act: 'operating',
      builds: [B.observability, B.async],
    },
    {
      slug: B.deploy,
      topic: { en: 'Deploys', vi: 'Triển khai' },
      hook: {
        en: '12-factor config, Docker, Kubernetes, health checks, graceful shutdown, zero-downtime rolls.',
        vi: 'Config kiểu 12-factor, Docker, Kubernetes, health check, graceful shutdown, deploy không downtime.',
      },
      act: 'operating',
      builds: [B.perf, B.observability],
    },
  ],
  paths: [
    {
      id: 'full',
      label: { en: 'Read it all', vi: 'Đọc cả 12 bài' },
      who: {
        en: 'From the first byte of a request to a zero-downtime deploy.',
        vi: 'Từ byte đầu tiên của request tới bản deploy không downtime.',
      },
      order: [B.lifecycle, B.rest, B.validation, B.layering, B.data, B.async, B.auth, B.caching, B.testing, B.observability, B.perf, B.deploy],
    },
    {
      id: 'ai-review',
      label: { en: 'Reviewing AI-written services', vi: 'Soi service do AI viết' },
      who: {
        en: 'Catch the API shape, layering, and test gaps AI tools routinely leave behind.',
        vi: 'Bắt mấy lỗi hình dáng API, phân tầng và thiếu test mà AI hay để lại.',
      },
      order: [B.rest, B.validation, B.layering, B.testing],
    },
    {
      id: 'oncall',
      label: { en: 'Incident at 3 a.m.', vi: 'Sự cố lúc 3 giờ sáng' },
      who: {
        en: 'Service slow or down? Evidence first: logs, traces, p99, then the deploy path.',
        vi: 'Service chậm hoặc chết? Chứng cứ trước: log, trace, p99, rồi tới đường deploy.',
      },
      order: [B.observability, B.perf, B.async, B.deploy],
    },
  ],
};

const AT = {
  market: 'ai-trading-the-market',
  signals: 'ai-trading-signals',
  data: 'ai-trading-data',
  statistics: 'ai-trading-statistics',
  regime: 'ai-trading-regime',
  factors: 'ai-trading-factors',
  portfolio: 'ai-trading-portfolio',
  prediction: 'ai-trading-prediction',
  explainable: 'ai-trading-explainable-ai',
  clustering: 'ai-trading-clustering',
  graphs: 'ai-trading-graphs',
  backtest: 'ai-trading-backtest',
  production: 'ai-trading-production',
  deepLearning: 'ai-trading-deep-learning',
  sequence: 'ai-trading-sequence-models',
  orderFlow: 'ai-trading-order-flow',
  nlp: 'ai-trading-financial-nlp',
  gnn: 'ai-trading-gnn',
  rl: 'ai-trading-reinforcement-learning',
  alpha: 'ai-trading-alpha',
  agents: 'ai-trading-agents',
  investmentOs: 'ai-trading-investment-os',
};

const aiTrading: Series = {
  id: 'ai-trading',
  title: {
    en: 'AI for market systems, from the first order to the agent that decides',
    vi: 'AI trong chứng khoán, từ cây lệnh đầu tiên tới agent ra quyết định',
  },
  kicker: { en: 'A 22-part series', vi: 'Series 22 bài' },
  tagline: {
    en: 'Written for beginners: how markets actually trade, where the signal hides in the noise, and how AI earns — or loses — its place in the loop.',
    vi: 'Viết cho người mới: thị trường khớp lệnh ra sao, tín hiệu nằm đâu trong nhiễu, và AI lấy gì mà sống — hoặc thua — trong chuỗi quyết định này.',
  },
  pitch: [
    {
      en: 'Markets are the hardest place to apply machine learning: the signal is faint, the data is never repeated, and everything fights back the moment you trade on it. Most introductions skip that and jump straight to models.',
      vi: 'Thị trường là nơi khó nhất để áp dụng machine learning: tín hiệu rất mỏng, dữ liệu không bao giờ lặp lại, và mọi thứ đều phản ứng lại ngay khi bạn dùng nó. Phần lớn tài liệu bỏ qua điều đó và nhảy thẳng vào mô hình.',
    },
    {
      en: 'This series walks the whole path in order: what an order book is, why prices barely repeat themselves, how data quietly lies, then supervised learning, backtests that do not flatter you, deep learning on the order book, and finally agents that read the news and allocate capital. Every idea lands on a Vietnamese market case.',
      vi: 'Series đi cả con đường theo thứ tự: sổ lệnh là gì, vì sao giá gần như không bao giờ lặp lại, dữ liệu nói dối kiểu nào, rồi supervised learning, backtest không tự lỡ mình, deep learning trên sổ lệnh, và cuối cùng là agent đọc tin và phân bổ vốn. Mọi ý tưởng đều hạ xuống một case thị trường Việt Nam.',
    },
  ],
  credit: {
    en: 'Built on the public curriculum and research of 51labs (Machine Learning for Financial Market), extended with public papers and Vietnamese market cases.',
    vi: 'Dựa trên chương trình và nghiên cứu công khai của 51labs (Machine Learning for Financial Market), bổ sung paper công khai và case thị trường Việt Nam.',
  },
  // The Ho Chi Minh Stock Exchange building (District 1, HCMC): where Vietnamese orders are matched.
  cover: {
    subtitle: {
      en: 'Market · Machine Learning · Deep Learning · RL & Agents',
      vi: 'Thị trường · Machine Learning · Học sâu · RL & Agent',
    },
    image: hoseBuilding,
    alt: 'The Ho Chi Minh Stock Exchange building on Nguyen Thai Binh street, District 1: a restored French-colonial facade under a clear sky.',
    position: '50% 40%',
    imprint: 'AI × MARKETS',
    credit: {
      title: 'So Giao Dich chung khoan tphcm, Nguyen Thai Binh, Quan 1, TPHCM',
      author: 'trungydang',
      url: 'https://commons.wikimedia.org/wiki/File:So_Giao_Dich_chung_khoan_tphcm-Nguy%E1%BB%85n_Th%C3%A1i_B%C3%ACnh,_Qu%E1%BA%ADn_1,_TPHCM,_Vi%E1%BB%87t_Nam_-_panoramio.jpg',
      license: 'CC BY 3.0',
    },
  },
  outcomes: [
    {
      en: 'Read an order book and a price chart without guessing what they mean.',
      vi: 'Đọc được sổ lệnh và biểu đồ giá mà không phải đoán.',
    },
    {
      en: 'Say why a model that looked brilliant in a backtest can still lose money.',
      vi: 'Giải thích được vì sao một mô hình đẹp trong backtest vẫn có thể thua lỗ.',
    },
    {
      en: 'Judge a financial data pipeline by what it would have shown on any past date.',
      vi: 'Đánh giá pipeline dữ liệu tài chính theo thứ nó hiển thị tại bất kỳ ngày quá khứ nào.',
    },
    {
      en: 'Know what AI can decide in a trading system — and what must stay human.',
      vi: 'Biết AI quyết được gì trong hệ thống giao dịch — và gì phải giữ cho con người.',
    },
  ],
  acts: [
    {
      id: 'market',
      label: { en: 'The Market', vi: 'Thị trường' },
      blurb: { en: 'How trades actually happen', vi: 'Giao dịch thật sự diễn ra ra sao' },
    },
    {
      id: 'ml',
      label: { en: 'Machine Learning', vi: 'Machine Learning' },
      blurb: { en: 'Learn without fooling yourself', vi: 'Học mà không tự lỡ mình' },
    },
    {
      id: 'dl',
      label: { en: 'Deep Learning', vi: 'Học sâu' },
      blurb: { en: 'Neural nets meet the order book', vi: 'Mạng nơ-ron gặp sổ lệnh' },
    },
    {
      id: 'agentic',
      label: { en: 'RL & Agents', vi: 'RL & Agent' },
      blurb: { en: 'Systems that decide and act', vi: 'Hệ thống tự ra quyết định' },
    },
  ],
  parts: [
    {
      slug: AT.market,
      topic: { en: 'The Market', vi: 'Thị trường' },
      hook: {
        en: 'Order book, matching, candles, limit up/down: the machine every strategy lives inside.',
        vi: 'Sổ lệnh, khớp lệnh, nến, limit up/down: cỗ máy mà mọi chiến lược phải sống trong đó.',
      },
      act: 'market',
      builds: [],
    },
    {
      slug: AT.signals,
      topic: { en: 'Signals', vi: 'Tín hiệu' },
      hook: {
        en: 'Why markets are the hardest place for AI: faint signal, no repeats, everyone fights back.',
        vi: 'Vì sao thị trường là nơi khó nhất cho AI: tín hiệu mỏng, không lặp lại, và ai cũng phản công.',
      },
      act: 'market',
      builds: [AT.market],
    },
    {
      slug: AT.data,
      topic: { en: 'Data', vi: 'Dữ liệu' },
      hook: {
        en: 'Point-in-time data, survivorship bias, corporate actions: how financial data quietly lies.',
        vi: 'Point-in-time, survivorship bias, corporate actions: dữ liệu tài chính nói dối kiểu nào.',
      },
      act: 'market',
      builds: [AT.market],
    },
    {
      slug: AT.statistics,
      topic: { en: 'Statistics', vi: 'Thống kê' },
      hook: {
        en: 'Returns, Sharpe, regression, regularization — the only math this series needs.',
        vi: 'Lợi suất, Sharpe, hồi quy, regularization — lượng toán duy nhất series cần.',
      },
      act: 'market',
      builds: [AT.signals],
    },
    {
      slug: AT.regime,
      topic: { en: 'Regime', vi: 'Chu kỳ thị trường' },
      hook: {
        en: 'Markets change personality; EWMA to HMM, and why last year’s rules stop working.',
        vi: 'Thị trường đổi tính cách; từ EWMA tới HMM, và vì sao luật của năm ngoái ngừng chạy.',
      },
      act: 'market',
      builds: [AT.statistics],
    },
    {
      slug: AT.factors,
      topic: { en: 'Factors', vi: 'Factor' },
      hook: {
        en: 'Momentum, value, size: what a factor is, and why thousands died in the factor zoo.',
        vi: 'Momentum, value, size: factor là gì, và vì sao hàng nghìn factor chết trong factor zoo.',
      },
      act: 'market',
      builds: [AT.data],
    },
    {
      slug: AT.portfolio,
      topic: { en: 'Portfolio', vi: 'Danh mục' },
      hook: {
        en: 'Optimization, risk parity, margin — and what the 2020–25 HOSE margin cuts did to prices.',
        vi: 'Tối ưu, risk parity, margin — và margin cuts HOSE 2020–25 làm gì với giá.',
      },
      act: 'market',
      builds: [AT.regime, AT.factors],
    },
    {
      slug: AT.prediction,
      topic: { en: 'Prediction', vi: 'Dự đoán' },
      hook: {
        en: 'Supervised learning on returns: trees, ensembles, and the Kaggle lessons.',
        vi: 'Supervised learning trên lợi suất: tree, ensemble, và bài học từ Kaggle.',
      },
      act: 'ml',
      builds: [AT.data, AT.statistics],
    },
    {
      slug: AT.explainable,
      topic: { en: 'Explainable AI', vi: 'AI giải thích được' },
      hook: {
        en: 'Why the model ranked it, XAI in finance, and predict-then-rank done right.',
        vi: 'Vì sao mô hình xếp nó cao, XAI trong tài chính, và predict-then-rank đúng cách.',
      },
      act: 'ml',
      builds: [AT.prediction],
    },
    {
      slug: AT.clustering,
      topic: { en: 'Clustering', vi: 'Phân cụm' },
      hook: {
        en: 'Unsupervised structure: clusters, dendrograms, hierarchical risk parity.',
        vi: 'Cấu trúc không nhãn: phân cụm, dendrogram, hierarchical risk parity.',
      },
      act: 'ml',
      builds: [AT.statistics],
    },
    {
      slug: AT.graphs,
      topic: { en: 'Graphs', vi: 'Đồ thị' },
      hook: {
        en: 'Stocks as a network: community detection on VN100, graphs for regime detection.',
        vi: 'Cổ phiếu như một mạng lưới: community detection trên VN100, graph cho regime.',
      },
      act: 'ml',
      builds: [AT.clustering, AT.regime],
    },
    {
      slug: AT.backtest,
      topic: { en: 'Backtest', vi: 'Backtest' },
      hook: {
        en: 'Walk-forward, purged CV, deflated Sharpe: testing without flattering yourself.',
        vi: 'Walk-forward, purged CV, deflated Sharpe: kiểm định mà không tự lừa mình.',
      },
      act: 'ml',
      builds: [AT.prediction],
    },
    {
      slug: AT.production,
      topic: { en: 'Production', vi: 'Triển khai' },
      hook: {
        en: 'From signal to live system: TCA, price impact, and Knight Capital’s 45 minutes.',
        vi: 'Từ signal tới hệ thống thật: TCA, price impact, và 45 phút của Knight Capital.',
      },
      act: 'ml',
      builds: [AT.backtest],
    },
    {
      slug: AT.deepLearning,
      topic: { en: 'Deep Learning', vi: 'Học sâu' },
      hook: {
        en: 'Linear to MLP: what deep nets change about the prediction problem.',
        vi: 'Từ linear tới MLP: deep net đổi gì trong bài toán dự đoán.',
      },
      act: 'dl',
      builds: [AT.prediction],
    },
    {
      slug: AT.sequence,
      topic: { en: 'Sequence Models', vi: 'Mô hình chuỗi' },
      hook: {
        en: 'LSTM, Transformer, Deep Momentum Network, SharpeLoss: learning from time.',
        vi: 'LSTM, Transformer, Deep Momentum Network, SharpeLoss: học từ chuỗi thời gian.',
      },
      act: 'dl',
      builds: [AT.deepLearning],
    },
    {
      slug: AT.orderFlow,
      topic: { en: 'Order Flow', vi: 'Dòng lệnh' },
      hook: {
        en: 'Inside the microstructure: imbalance, DeepLOB, and reading the book like a model.',
        vi: 'Trong vi cấu trúc: imbalance, DeepLOB, và đọc sổ lệnh như một mô hình.',
      },
      act: 'dl',
      builds: [AT.sequence],
    },
    {
      slug: AT.nlp,
      topic: { en: 'Financial NLP', vi: 'NLP tài chính' },
      hook: {
        en: 'LLMs read the news: thematic investing, Alpha 6.8, sentiment before price.',
        vi: 'LLM đọc tin: thematic investing, Alpha 6.8, cảm xúc đi trước giá.',
      },
      act: 'dl',
      builds: [AT.deepLearning],
    },
    {
      slug: AT.gnn,
      topic: { en: 'GNN', vi: 'GNN' },
      hook: {
        en: 'Graph attention for stock ranking and regime-adaptive portfolios.',
        vi: 'Graph attention cho xếp hạng cổ phiếu và danh mục thích ứng regime.',
      },
      act: 'dl',
      builds: [AT.graphs, AT.sequence],
    },
    {
      slug: AT.rl,
      topic: { en: 'Reinforcement Learning', vi: 'Học tăng cường' },
      hook: {
        en: 'MDP to DQN/PPO: an agent learns to trade — and learns to hack your backtest.',
        vi: 'MDP tới DQN/PPO: agent học giao dịch — và học cách hack backtest của bạn.',
      },
      act: 'agentic',
      builds: [AT.deepLearning, AT.orderFlow],
    },
    {
      slug: AT.alpha,
      topic: { en: 'Alpha', vi: 'Alpha' },
      hook: {
        en: 'Search for strategies: genetic programming, MCTS, MuZero-inspired discovery.',
        vi: 'Tìm kiếm chiến lược: genetic programming, MCTS, khai phá kiểu MuZero.',
      },
      act: 'agentic',
      builds: [AT.rl],
    },
    {
      slug: AT.agents,
      topic: { en: 'Agents', vi: 'Agent' },
      hook: {
        en: 'LLM agents do the research: RAG, news pipelines, agentic valuation.',
        vi: 'LLM agent làm phần nghiên cứu: RAG, pipeline tin tức, agentic valuation.',
      },
      act: 'agentic',
      builds: [AT.nlp],
    },
    {
      slug: AT.investmentOs,
      topic: { en: 'Investment OS', vi: 'Hệ thống đầu tư' },
      hook: {
        en: 'Multi-agent investment teams, evaluation, and the limits of delegating judgement.',
        vi: 'Đội đầu tư đa agent, đánh giá, và giới hạn của việc giao phó phán đoán.',
      },
      act: 'agentic',
      builds: [AT.rl, AT.agents],
    },
  ],
  paths: [
    {
      id: 'full',
      label: { en: 'Read it all', vi: 'Đọc hết series' },
      who: {
        en: 'From zero to the agent team, in order.',
        vi: 'Từ số 0 tới đội agent, theo đúng thứ tự.',
      },
      order: Object.values(AT),
    },
    {
      id: 'beginner',
      label: { en: 'New to markets & AI', vi: 'Chưa biết gì, đi từ đầu' },
      who: {
        en: 'You have never traded or trained a model. Act 1 is your course.',
        vi: 'Bạn chưa từng giao dịch hay huấn luyện mô hình. Act 1 là khóa học của bạn.',
      },
      order: [AT.market, AT.signals, AT.data, AT.statistics, AT.regime, AT.factors, AT.portfolio],
    },
    {
      id: 'ml',
      label: { en: 'ML engineer entering quant', vi: 'ML engineer chuyển sang quant' },
      who: {
        en: 'You know sklearn and PyTorch. Skip the tutorials, learn the market.',
        vi: 'Bạn rành sklearn và PyTorch. Bỏ phần tutorial, học phần thị trường.',
      },
      order: [AT.data, AT.statistics, AT.prediction, AT.backtest, AT.production, AT.deepLearning, AT.sequence, AT.orderFlow],
    },
    {
      id: 'quant',
      label: { en: 'Traditional quant learning AI', vi: 'Quant truyền thống học AI' },
      who: {
        en: 'You know portfolios and risk. See what the models add.',
        vi: 'Bạn rành danh mục và rủi ro. Xem mô hình thêm được gì.',
      },
      order: [AT.signals, AT.statistics, AT.regime, AT.factors, AT.portfolio, AT.prediction, AT.explainable, AT.clustering, AT.backtest],
    },
  ],
};

export const SERIES: Record<string, Series> = {
  [refactoringUi.id]: refactoringUi,
  [ddia.id]: ddia,
  [golang.id]: golang,
  [aiTrading.id]: aiTrading,
  [backend.id]: backend,
  [stocksBasics.id]: stocksBasics,
};
export const SERIES_IDS = Object.keys(SERIES);

export function seriesOfPost(slug: string) {
  for (const s of Object.values(SERIES)) {
    const index = s.parts.findIndex((p) => p.slug === slug);
    if (index >= 0) return { series: s, index, part: s.parts[index] };
  }
  return null;
}

export const seriesUrl = (id: string) => `/blog/series/${id}/`;

/** position of an act in its series (0-based); drives the per-act colour classes `act-0`…`act-3` */
export function actIndex(series: Series, actId: string): number {
  const i = series.acts.findIndex((a) => a.id === actId);
  if (i < 0) throw new Error(`Series "${series.id}": unknown act "${actId}"`);
  return i;
}
