// Blog series: an ordered set of posts with a cover page at /blog/series/<id>/.
// To add a series: add an entry below. Posts are matched by their slug (file name in
// src/content/blog/). Unpublished (draft) posts show as "soon" on the cover page and
// are skipped by the prev/next links in production.

import type { ImageMetadata } from 'astro';
import coverUi from '../assets/series/cover-ui-bauhaus-stair.jpg';
import coverData from '../assets/series/cover-data-hard-drive.jpg';
import coverGo from '../assets/series/cover-go-stones.jpg';
import coverStocks from '../assets/series/cover-stocks-nyse-floor.jpg';
import coverBackend from '../assets/series/cover-backend-rack.jpg';
import coverAi from '../assets/series/cover-ai-robonaut.jpg';

export interface L10n { en: string; vi: string }

/** what the book cover shows (BookCover.astro) and how its photo is credited */
export interface SeriesCoverArt {
  /** cover title in parts: `accent` is the topic word, drawn in the series colour. English only. */
  title: { lead?: string; accent: string; rest?: string };
  /** one-line cover subtitle, English only */
  tagline: string;
  /** hue (OKLCH degrees) of the series colour on its cover */
  hue: number;
  image: ImageMetadata;
  alt: string;
  /** CSS object-position for the cover photo */
  position: string;
  /** `origin` names the host when it is not Wikimedia Commons (read by SeriesCover.astro) */
  credit: { title: string; author: string; url: string; license: string; origin?: string };
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
  cover: {
    title: { accent: 'UI Design', rest: ' for Developers' },
    tagline: 'Ship interfaces that don’t look generated',
    hue: 265,
    image: coverUi,
    alt: 'A spiral staircase with a wrought-iron balustrade in the Bauhaus University main building in Weimar, lit by tall windows.',
    position: '50% 55%',
    credit: {
      title: 'Weimar Bauhaus-Universität Hauptgebäude 406',
      author: 'GFreihalter',
      url: 'https://commons.wikimedia.org/wiki/File:Weimar_Bauhaus-Universit%C3%A4t_Hauptgeb%C3%A4ude_406.jpg',
      license: 'CC BY-SA 3.0',
    },
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
  cover: {
    title: { accent: 'Data', rest: ' Systems Under Pressure' },
    tagline: 'Explained by the outages that shaped them',
    hue: 35,
    image: coverData,
    alt: 'An IDE hard drive with its cover removed, showing the silver platter, the actuator arm and the read/write head.',
    position: '55% 50%',
    credit: {
      title: 'Open hard-drive',
      author: 'Zzubnik',
      url: 'https://commons.wikimedia.org/wiki/File:Open_hard-drive.jpg',
      license: 'Public domain',
    },
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
  fundBasics: 'go-fundamentals-toolchain-modules-packages-types',
  fundComposite: 'go-fundamentals-composite-types-structs-methods-interfaces',
  fundConcurrency: 'go-fundamentals-errors-concurrency-goroutines-channels-testing',
  memory: 'go-memory-data-types-slices-maps-strings',
  abstractions: 'go-abstractions-interfaces-generics-errors',
  concurrency: 'go-concurrency-scheduler-channels-context-mutexes',
  production: 'go-production-stdlib-cpu-cache-gc-kubernetes',
  workflow: 'go-efficiency-workflow-raer-tfbo-hardware-memory',
  hardware: 'go-hardware-cpu-caches-virtual-memory-gc-allocator',
  benchmarking: 'go-observability-metrics-microbenchmarks-benchstat',
  profiling: 'go-profiling-pprof-flamegraphs-off-cpu-continuous',
  patterns: 'go-three-rs-optimization-patterns-streaming-pooling',
};

const golang: Series = {
  id: 'golang',
  title: {
    en: 'How Go actually works',
    vi: 'Hiểu đúng bản chất Golang',
  },
  kicker: { en: 'A 12-part series', vi: 'Series 12 bài' },
  tagline: {
    en: 'A step-by-step path from Go basics to runtime traps and data-driven performance optimization.',
    vi: 'Đi trọn lộ trình từ Go cơ bản qua các bẫy ngầm runtime tới đo đạc và tối ưu hiệu năng có cơ sở.',
  },
  pitch: [
    {
      en: 'Learning Go is fast, yet jumping straight from syntax to production leaves dangerous blind spots: sub-slices overwriting shared arrays, typed nil errors passing != nil checks, dropped goroutines on HTTP timeouts, and megabytes of hidden heap garbage.',
      vi: 'Học cú pháp Go chỉ mất vài ngày, nhưng nhảy thẳng ra làm dự án hay viết cùng AI rất dễ vướng bẫy: slice con ghi đè mảng gốc, lỗi typed nil vượt qua check err != nil, rò goroutine khi request tắt và đống rác heap làm GC khựng lại.',
    },
    {
      en: 'Parts 1–3 build Go fundamentals from zero (modules, types, pointers, interfaces, goroutines, tests); Parts 4–7 uncover subtle runtime mistakes; Parts 8–12 master data-driven optimization (RAER, TFBO, CPU caches/GC, benchstat, pprof/fgprof, and Three Rs streaming).',
      vi: 'Phần 1–3 đi từ nền tảng Go cơ bản (module, con trỏ, slice, interface, goroutine, test); Phần 4–7 mổ xẻ các bẫy ngầm theo sách 100 Go Mistakes; Phần 8–12 khép trọn quy trình tối ưu theo Efficient Go (RAER, TFBO, phần cứng/GC, benchstat, pprof/fgprof và Three Rs).',
    },
  ],
  credit: {
    en: 'Parts 1–3 draw on official Go docs (Effective Go, The Go Blog, Tour of Go); Parts 4–7 distill 100 Go Mistakes (Teiva Harsanyi); Parts 8–12 synthesize Efficient Go (Bartłomiej Płotka), verified with Apple M2 Go 1.27 benchmarks and interactive tools.',
    vi: 'Phần 1–3 tổng hợp từ tài liệu chuẩn Go (Effective Go, The Go Blog); Phần 4–7 đúc kết từ 100 Go Mistakes (Teiva Harsanyi); Phần 8–12 dựa trên Efficient Go (Bartłomiej Płotka), chạy kiểm chứng trực tiếp trên Go 1.27 kèm mô phỏng tương tác.',
  },
  cover: {
    title: { lead: 'How ', accent: 'Go', rest: ' Actually Works' },
    tagline: 'From the scheduler to the cache line',
    hue: 205,
    image: coverGo,
    alt: 'Black and white stones on a wooden board during a game of Go.',
    position: '50% 60%',
    credit: {
      title: 'Go -- 2021 -- 6732',
      author: 'Dietmar Rabich',
      url: 'https://commons.wikimedia.org/wiki/File:Go_--_2021_--_6732.jpg',
      license: 'CC BY-SA 4.0',
    },
  },
  outcomes: [
    {
      en: 'Write idiomatic Go modules, slices, maps, interfaces, error wrapping, goroutines, and race-free table tests.',
      vi: 'Viết chuẩn Go ngay từ đầu: module, slice, map, interface ngầm định, bọc lỗi %w, goroutine và unit test -race.',
    },
    {
      en: 'Catch shared slice mutations, typed nil errors, goroutine leaks, and missing HTTP/SQL timeouts cleanly.',
      vi: 'Bắt ngay các lỗi slice đè chéo, typed nil, map không tự co, rò goroutine và thiếu timeout trên production.',
    },
    {
      en: 'Reason about CPU L1 cache lines, compiler inlining/BCE, VSS vs RSS memory, and GOMEMLIMIT pacing.',
      vi: 'Hiểu cơ chế phần cứng (L1 cache, trình biên dịch BCE/escape), bộ nhớ ảo VSS/RSS và nhịp dọn rác GC.',
    },
    {
      en: 'Prove speedups with benchstat, find bottlenecks via pprof/fgprof, and stream multi-GB files in 8 KB Heap.',
      vi: 'Chứng minh hiệu năng bằng benchstat, soi đúng hàm nghẽn với pprof/fgprof và tối ưu streaming O(1) RAM.',
    },
  ],
  acts: [
    {
      id: 'basics',
      label: { en: 'Core Syntax', vi: 'Go cơ bản' },
      blurb: { en: 'Types, slices, errors & tests', vi: 'Cú pháp, kiểu, lỗi & test' },
    },
    {
      id: 'internals',
      label: { en: 'Internals & Bugs', vi: 'Lõi & Bẫy' },
      blurb: { en: 'Slices, ifaces, GMP & K8s', vi: 'Slice, iface, GMP & K8s' },
    },
    {
      id: 'measurement',
      label: { en: 'Measure First', vi: 'Đo & Phần cứng' },
      blurb: { en: 'RAER, CPU/GC & benchstat', vi: 'RAER, CPU/GC & benchstat' },
    },
    {
      id: 'optimization',
      label: { en: 'Profile & Tune', vi: 'Soi & Tối ưu' },
      blurb: { en: 'pprof, fgprof & Three Rs', vi: 'pprof, fgprof & Three Rs' },
    },
  ],
  parts: [
    {
      slug: G.fundBasics,
      topic: { en: 'Syntax & Types', vi: 'Cú pháp & Kiểu' },
      hook: {
        en: 'Design philosophy, modules & internal/, zero values, pass-by-value pointers, and LIFO defer.',
        vi: 'Triết lý thiết kế, module/internal/, zero value sạch, con trỏ truyền tham trị và ngăn xếp defer.',
      },
      act: 'basics',
      builds: [],
    },
    {
      slug: G.fundComposite,
      topic: { en: 'Structs & Map', vi: 'Struct & Slice' },
      hook: {
        en: 'Fixed arrays vs dynamic slices, preallocation, comma-ok maps, struct embedding, and implicit interfaces.',
        vi: 'Phân biệt array với slice, cấp phát trước make(), tra map comma-ok, embedding và interface ngầm định.',
      },
      act: 'basics',
      builds: [G.fundBasics],
    },
    {
      slug: G.fundConcurrency,
      topic: { en: 'Errors & Tests', vi: 'Lỗi & Goroutine' },
      hook: {
        en: 'Wrapping errors with %w, goroutines & WaitGroup, channels, select, context timeouts, and go test -race.',
        vi: 'Bọc lỗi %w với errors.Is, goroutine, WaitGroup, channel/select, context timeout và test -race.',
      },
      act: 'basics',
      builds: [G.fundBasics, G.fundComposite],
    },
    {
      slug: G.memory,
      topic: { en: 'Slice & Map', vi: 'Bộ nhớ & Map' },
      hook: {
        en: 'Slice headers, append overwrites, maps that never shrink, range value copies, and UTF-8 runes.',
        vi: 'Slice header, append ghi đè ngầm, map không tự co, range copy giá trị và chuỗi UTF-8.',
      },
      act: 'internals',
      builds: [G.fundComposite],
    },
    {
      slug: G.abstractions,
      topic: { en: 'Design & Error', vi: 'Thiết kế & Lỗi' },
      hook: {
        en: 'Consumer interfaces, typed nil traps, type embedding, defer timing, and wrapping errors with %w.',
        vi: 'Interface phía người gọi, bẫy typed nil, type embedding, thời điểm chạy defer và bọc lỗi %w.',
      },
      act: 'internals',
      builds: [G.fundComposite, G.fundConcurrency],
    },
    {
      slug: G.concurrency,
      topic: { en: 'GMP & Locks', vi: 'GMP & Locks' },
      hook: {
        en: 'The GMP scheduler, channels vs. mutexes, context cancellation, nil channels, and reentrant locks.',
        vi: 'Bộ lập lịch GMP, channel vs. mutex, hủy context, nil channel và lỗi tự khóa chính mình.',
      },
      act: 'internals',
      builds: [G.fundConcurrency],
    },
    {
      slug: G.production,
      topic: { en: 'Prod & K8s', vi: 'Prod & K8s' },
      hook: {
        en: 'HTTP/SQL timeouts, CPU cache lines, escape analysis, GC, and Kubernetes CFS throttling.',
        vi: 'Timeout HTTP/SQL, CPU cache line, escape analysis, GC và bóp CPU trên Kubernetes.',
      },
      act: 'internals',
      builds: [G.memory, G.concurrency],
    },
    {
      slug: G.workflow,
      topic: { en: 'RAER & TFBO', vi: 'RAER & TFBO' },
      hook: {
        en: 'Why scaling pods fails tail latency, written RAER budgets, 5 Optimization Design Levels, and TFBO.',
        vi: 'Mở thêm pod không cứu được p99, đặt hợp đồng RAER, 5 Tầng thiết kế và quy trình TFBO 9 bước.',
      },
      act: 'measurement',
      builds: [G.production],
    },
    {
      slug: G.hardware,
      topic: { en: 'CPU & GC RAM', vi: 'CPU & GC RAM' },
      hook: {
        en: 'L1 cache lines, Inlining & BCE flags, napkin math, Linux VSS vs RSS page faults, and GOMEMLIMIT.',
        vi: 'Cache CPU 64B, cờ compiler Inlining/BCE, bộ nhớ ảo VSS/RSS, mcache và nhịp chạy GOGC/GOMEMLIMIT.',
      },
      act: 'measurement',
      builds: [G.memory, G.workflow],
    },
    {
      slug: G.benchmarking,
      topic: { en: 'Benchstat', vi: 'Đo & Benchstat' },
      hook: {
        en: 'Prometheus RED/USE histograms, HeapInuse vs RSS, dead-code elimination lies, and benchstat p-values.',
        vi: 'Prometheus RED/USE Histogram, HeapInuse vs RSS, bẫy compiler xóa code và đọc benchstat.',
      },
      act: 'measurement',
      builds: [G.workflow, G.hardware],
    },
    {
      slug: G.profiling,
      topic: { en: 'pprof & fgprof', vi: 'pprof & fgprof' },
      hook: {
        en: 'Safe /debug/pprof ports, Flat vs Cum in Flame Graphs, alloc_space vs inuse_space, fgprof & Parca diffs.',
        vi: 'Cổng /debug/pprof an toàn, đọc Flat/Cum trên Flame Graph, fgprof Off-CPU và Parca -diff_base.',
      },
      act: 'optimization',
      builds: [G.benchmarking],
    },
    {
      slug: G.patterns,
      topic: { en: 'Three Rs & I/O', vi: 'Three Rs & I/O' },
      hook: {
        en: 'Cutting bytes.Split and strconv waste, 8 KB streaming, sharded SectionReaders, and sync.Pool cautions.',
        vi: 'Bỏ bytes.Split & strconv chậm, streaming 8 KB cố định, chia khúc SectionReader và bẫy sync.Pool.',
      },
      act: 'optimization',
      builds: [G.hardware, G.profiling],
    },
  ],
  paths: [
    {
      id: 'full',
      label: { en: 'Read it all (12 parts)', vi: 'Đọc trọn bộ 12 bài' },
      who: {
        en: 'Go from scratch all the way through internals, benchmarks, profiling, and Three Rs optimization.',
        vi: 'Đi trọn lộ trình từ Go căn bản qua các bẫy ngầm tới đo đạc và tối ưu hiệu năng thực chiến.',
      },
      order: [
        G.fundBasics, G.fundComposite, G.fundConcurrency,
        G.memory, G.abstractions, G.concurrency, G.production,
        G.workflow, G.hardware, G.benchmarking, G.profiling, G.patterns,
      ],
    },
    {
      id: 'beginners',
      label: { en: 'New to Go & Code Review (1–7)', vi: 'Người mới & Review AI (Bài 1–7)' },
      who: {
        en: 'Master Go syntax, types, concurrency, and catch the bugs AI coding tools routinely slip in.',
        vi: 'Nắm vững cú pháp, thiết kế kiểu, concurrency và bắt đúng lỗi mà AI rất hay viết lọt qua test.',
      },
      order: [G.fundBasics, G.fundComposite, G.fundConcurrency, G.memory, G.abstractions, G.concurrency, G.production],
    },
    {
      id: 'efficient-go',
      label: { en: 'Make slow Go fast (8–12)', vi: 'Tối ưu Go theo số đo (Bài 8–12)' },
      who: {
        en: 'Focus purely on Efficient Go: RAER, TFBO, CPU/GC hardware, benchstat, pprof/fgprof, and Three Rs.',
        vi: 'Đi thẳng vào 5 bài Efficient Go: RAER, phần cứng/GC, benchstat, soi pprof và mẫu Three Rs.',
      },
      order: [G.workflow, G.hardware, G.benchmarking, G.profiling, G.patterns],
    },
    {
      id: 'oncall',
      label: { en: 'Leaks & latency spikes', vi: 'Săn lỗi ăn RAM & chậm p99' },
      who: {
        en: 'Service holding RAM or stalling under load? Inspect memory traps, K8s ops, profiles, and streaming.',
        vi: 'Service tụt hiệu năng hoặc ăn RAM không nhả? Đọc thẳng bẫy RAM, K8s, phần cứng GC, pprof và streaming.',
      },
      order: [G.memory, G.production, G.hardware, G.profiling, G.patterns],
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
  cover: {
    title: { accent: 'Stock Market', rest: ' Basics' },
    tagline: 'Own a slice of a company, safely',
    hue: 75,
    image: coverStocks,
    alt: 'Brokers on the New York Stock Exchange trading floor in black and white, one holding up a slip of paper.',
    position: '62% 55%',
    credit: {
      title: 'NY stock exchange traders floor',
      author: 'Thomas J. O\'Halloran (Library of Congress)',
      url: 'https://commons.wikimedia.org/wiki/File:NY_stock_exchange_traders_floor_LC-U9-10548-6.jpg',
      license: 'Public domain',
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
  cover: {
    title: { lead: 'How ', accent: 'Backend', rest: ' Actually Works' },
    tagline: 'What happens after the request lands',
    hue: 150,
    image: coverBackend,
    alt: 'Blue and yellow network cables running into a rack of servers in a data center.',
    position: '50% 50%',
    credit: {
      title: 'IBM Portable Modular Data Center',
      author: 'Raysonho @ Open Grid Scheduler / Grid Engine',
      url: 'https://commons.wikimedia.org/wiki/File:IBMPortableModularDataCenter3.jpg',
      license: 'CC BY 3.0',
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
  cover: {
    title: { accent: 'AI', rest: ' for Market Systems' },
    tagline: 'From the first order to the agent that decides',
    hue: 285,
    image: coverAi,
    alt: 'Robonaut 2, a humanoid robot, facing an astronaut in a white spacesuit against a deep blue background.',
    position: '30% 50%',
    credit: {
      title: 'Face-Off Robonaut',
      author: 'Robert Markowitz (NASA)',
      url: 'https://commons.wikimedia.org/wiki/File:Face-Off_Robonaut.jpg',
      license: 'Public domain',
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
