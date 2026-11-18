import React, { useState, useEffect, useRef, useId } from 'react';
// Colour icon drawn at the top of each node: real product logos (Redis, PostgreSQL, Kafka, AWS...)
// and flat colour pictograms for generic things. Files live in public/icons/flow/ (sources and
// licences in its README.md); loaded with <image>, so they never clash with ids in the hidden EN/VI copy.
const NODE_ICONS = [
  'video', 'scissors', 'storage', 'workflow', 'scan', 'split', 'memory', 'film', 'audio', 'mobile', 'gateway',
  'database', 'engine', 'celebrity', 'queue', 'server', 'mailbox', 'friends', 'log', 'merge', 'ec2',
] as const;
const iconHref = (name: FlowIconName) => `/icons/flow/${name}.svg`;

export type FlowIconName = (typeof NODE_ICONS)[number];

export interface FlowNode {
  id: string;
  labelEn: string;
  labelVi: string;
  subEn: string;
  subVi: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  icon?: FlowIconName;
  type?: 'default' | 'source' | 'storage' | 'bottleneck' | 'worker' | 'success';
}

// How much load an edge carries: drawn as a thin/faint, normal, or thick/dark arrow.
export type EdgeWeight = 'light' | 'normal' | 'heavy';

const EDGE_WEIGHTS: EdgeWeight[] = ['light', 'normal', 'heavy'];

// Arrowhead length (SVG user units) per weight; the line stops this far short of the target.
const ARROW_LEN: Record<EdgeWeight, number> = { light: 7, normal: 9, heavy: 14 };

// Arrowhead colour: grey when idle, accent when carrying traffic, red when it is a bottleneck.
type ArrowState = 'idle' | 'active' | 'danger';
const ARROW_STATES: ArrowState[] = ['idle', 'active', 'danger'];

const LEGEND_ITEMS: { weight: EdgeWeight; en: string; vi: string }[] = [
  { weight: 'heavy', en: 'Heavy load', vi: 'Tải nặng' },
  { weight: 'normal', en: 'Normal', vi: 'Bình thường' },
  { weight: 'light', en: 'Light load', vi: 'Tải nhẹ' },
];

export interface FlowEdge {
  id: string;
  from: string;
  to: string;
  labelEn?: string;
  labelVi?: string;
  style?: 'solid' | 'dashed' | 'bottleneck';
  weight?: EdgeWeight;
  curve?: 'straight' | 'curved-up' | 'curved-down' | 'vertical';
}

export interface FlowStep {
  stepIndex: number;
  activeNodeIds: string[];
  activeEdgeIds: string[];
  alertNodeId?: string;
  alertLabelEn?: string;
  alertLabelVi?: string;
  successNodeId?: string;
  successLabelEn?: string;
  successLabelVi?: string;
  packet?: {
    edgeId: string;
    labelEn?: string;
    labelVi?: string;
  };
  metrics?: {
    latency: string;
    throughput: string;
    costImpact: string;
  };
  narrativeEn: string;
  narrativeVi: string;
  badge?: {
    textEn: string;
    textVi: string;
    type: 'info' | 'warning' | 'success' | 'danger';
  };
}

export interface FlowScenario {
  id: string;
  titleEn: string;
  titleVi: string;
  summaryEn: string;
  summaryVi: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  steps: FlowStep[];
  overallMetricEn?: string;
  overallMetricVi?: string;
}

// Preset: Amazon Prime Video Architecture Comparison with generous spacing
const PRIME_VIDEO_SCENARIOS: FlowScenario[] = [
  {
    id: 'serverless',
    titleEn: '1. Serverless, as first built',
    titleVi: '1. Bản serverless ban đầu',
    summaryEn: 'Separate serverless steps pass every frame through S3, and Step Functions orchestrates each one. It hit a hard limit at around 5% of the expected load.',
    summaryVi: 'Các bước serverless riêng rẽ chuyền từng khung hình qua S3, Step Functions điều phối từng bước. Hệ thống đụng giới hạn cứng ở khoảng 5% tải dự kiến.',
    nodes: [
      { id: 'video-source', labelEn: 'Live stream', labelVi: 'Luồng trực tiếp', subEn: 'video input', subVi: 'nguồn video', x: 20, y: 160, width: 115, height: 80, icon: 'video', type: 'source' },
      { id: 'converter', labelEn: 'Media converter', labelVi: 'Bộ chuyển đổi', subEn: 'frames and audio', subVi: 'tách khung hình, âm thanh', x: 235, y: 160, width: 130, height: 80, icon: 'scissors', type: 'worker' },
      { id: 's3-bucket', labelEn: 'Amazon S3', labelVi: 'Amazon S3', subEn: 'every frame stops here', subVi: 'khung hình nào cũng ghé qua', x: 475, y: 160, width: 165, height: 80, icon: 'storage', type: 'bottleneck' },
      { id: 'step-fn', labelEn: 'Step Functions', labelVi: 'Step Functions', subEn: 'orchestrates each step', subVi: 'điều phối từng bước', x: 475, y: 24, width: 165, height: 80, icon: 'workflow', type: 'default' },
      { id: 'defect-detector', labelEn: 'Defect detectors', labelVi: 'Bộ bắt lỗi', subEn: 'video and audio', subVi: 'hình và tiếng', x: 745, y: 160, width: 145, height: 80, icon: 'scan', type: 'worker' },
    ],
    edges: [
      { id: 'e1', from: 'video-source', to: 'converter', labelEn: 'stream', labelVi: 'luồng video', curve: 'straight' },
      { id: 'e2', from: 'converter', to: 's3-bucket', labelEn: 'write frames', labelVi: 'ghi khung hình', style: 'bottleneck', weight: 'heavy', curve: 'straight' },
      { id: 'e3', from: 'step-fn', to: 's3-bucket', labelEn: 'state changes', labelVi: 'đổi trạng thái', style: 'dashed', curve: 'vertical' },
      { id: 'e4', from: 's3-bucket', to: 'defect-detector', labelEn: 'read frames', labelVi: 'đọc khung hình', style: 'bottleneck', weight: 'heavy', curve: 'straight' },
    ],
    steps: [
      {
        stepIndex: 1,
        activeNodeIds: ['video-source', 'converter'],
        activeEdgeIds: ['e1'],
        packet: { edgeId: 'e1', labelEn: 'stream', labelVi: 'luồng video' },
        badge: { textEn: 'Take in the stream', textVi: 'Nhận luồng', type: 'info' },
        narrativeEn: 'A live stream comes in, and the media converter splits it into video frames and audio.',
        narrativeVi: 'Luồng trực tiếp đi vào, bộ chuyển đổi tách nó thành khung hình và âm thanh.',
      },
      {
        stepIndex: 2,
        activeNodeIds: ['converter', 's3-bucket'],
        activeEdgeIds: ['e2'],
        alertNodeId: 's3-bucket',
        alertLabelEn: 'Many small S3 calls',
        alertLabelVi: 'Rất nhiều lần gọi S3',
        packet: { edgeId: 'e2', labelEn: 'frames', labelVi: 'khung hình' },
        badge: { textEn: 'Cost #1: S3 calls', textVi: 'Chi phí #1: gọi S3', type: 'warning' },
        narrativeEn: 'Every frame is written to S3 so the next step can pick it up. Each write is a billed request.',
        narrativeVi: 'Khung hình nào cũng được ghi lên S3 để bước sau lấy về. Mỗi lần ghi là một request tính tiền.',
      },
      {
        stepIndex: 3,
        activeNodeIds: ['s3-bucket', 'step-fn'],
        activeEdgeIds: ['e3'],
        alertNodeId: 'step-fn',
        alertLabelEn: 'Hits account limits',
        alertLabelVi: 'Đụng giới hạn tài khoản',
        packet: { edgeId: 'e3', labelEn: 'state change', labelVi: 'đổi trạng thái' },
        badge: { textEn: 'Bottleneck: orchestration', textVi: 'Nút nghẽn: điều phối', type: 'danger' },
        narrativeEn: 'Step Functions makes several state transitions for every second of every stream. That hit AWS account limits, and each transition is billed.',
        narrativeVi: 'Step Functions chuyển trạng thái nhiều lần cho mỗi giây của mỗi luồng. Vậy là đụng giới hạn tài khoản AWS, mà lần chuyển nào cũng tính tiền.',
      },
      {
        stepIndex: 4,
        activeNodeIds: ['s3-bucket', 'defect-detector'],
        activeEdgeIds: ['e4'],
        alertNodeId: 's3-bucket',
        alertLabelEn: 'Read back again',
        alertLabelVi: 'Lại đọc về lần nữa',
        packet: { edgeId: 'e4', labelEn: 'frames', labelVi: 'khung hình' },
        badge: { textEn: 'Cost #2: reads', textVi: 'Chi phí #2: đọc lại', type: 'warning' },
        narrativeEn: 'Each detector downloads the frames back from S3 to check them, so every frame pays for a write and several reads.',
        narrativeVi: 'Từng bộ bắt lỗi lại tải khung hình từ S3 về để kiểm tra, nên mỗi khung hình tốn một lần ghi và vài lần đọc.',
      },
    ],
  },
  {
    id: 'monolith',
    titleEn: '2. One process, after the move',
    titleVi: '2. Một process, sau khi gộp',
    summaryEn: 'All components run in one process on Amazon ECS and EC2, and frames pass between them in memory. Infrastructure cost fell by over 90%.',
    summaryVi: 'Mọi thành phần chạy trong một process trên Amazon ECS và EC2, khung hình chuyền giữa chúng ngay trong bộ nhớ. Chi phí hạ tầng giảm hơn 90%.',
    nodes: [
      { id: 'video-source', labelEn: 'Live stream', labelVi: 'Luồng trực tiếp', subEn: 'video input', subVi: 'nguồn video', x: 20, y: 125, width: 115, height: 80, icon: 'video', type: 'source' },
      { id: 'monolith-container', labelEn: 'One process on Amazon ECS / EC2', labelVi: 'Một process trên Amazon ECS / EC2', subEn: 'scaled by running more copies', subVi: 'scale bằng cách chạy thêm bản sao', x: 195, y: 12, width: 705, height: 268, icon: 'ec2', type: 'default' },
      { id: 'mem-ingest', labelEn: 'Media converter', labelVi: 'Bộ chuyển đổi', subEn: 'same code as before', subVi: 'vẫn là code cũ', x: 225, y: 125, width: 125, height: 80, icon: 'split', type: 'worker' },
      { id: 'shared-mem', labelEn: 'Memory', labelVi: 'Bộ nhớ', subEn: 'frames stay here', subVi: 'khung hình ở lại đây', x: 470, y: 125, width: 155, height: 80, icon: 'memory', type: 'success' },
      { id: 'detector-video', labelEn: 'Video detector', labelVi: 'Bắt lỗi hình', subEn: 'same process', subVi: 'cùng process', x: 735, y: 48, width: 145, height: 80, icon: 'film', type: 'worker' },
      { id: 'detector-audio', labelEn: 'Audio detector', labelVi: 'Bắt lỗi tiếng', subEn: 'same process', subVi: 'cùng process', x: 735, y: 190, width: 145, height: 80, icon: 'audio', type: 'worker' },
    ],
    edges: [
      { id: 'm1', from: 'video-source', to: 'mem-ingest', labelEn: 'stream', labelVi: 'luồng video', curve: 'straight' },
      { id: 'm2', from: 'mem-ingest', to: 'shared-mem', labelEn: 'in memory', labelVi: 'trong bộ nhớ', weight: 'light', curve: 'straight' },
      { id: 'm3', from: 'shared-mem', to: 'detector-video', labelEn: 'in memory', labelVi: 'trong bộ nhớ', weight: 'light', curve: 'curved-up' },
      { id: 'm4', from: 'shared-mem', to: 'detector-audio', labelEn: 'in memory', labelVi: 'trong bộ nhớ', weight: 'light', curve: 'curved-down' },
    ],
    steps: [
      {
        stepIndex: 1,
        activeNodeIds: ['video-source', 'mem-ingest'],
        activeEdgeIds: ['m1'],
        packet: { edgeId: 'm1', labelEn: 'stream', labelVi: 'luồng video' },
        badge: { textEn: 'Take in the stream', textVi: 'Nhận luồng', type: 'info' },
        narrativeEn: 'The stream goes into one process that holds the converter and every detector.',
        narrativeVi: 'Luồng video đi vào một process chứa cả bộ chuyển đổi lẫn mọi bộ bắt lỗi.',
      },
      {
        stepIndex: 2,
        activeNodeIds: ['mem-ingest', 'shared-mem'],
        activeEdgeIds: ['m2'],
        successNodeId: 'shared-mem',
        successLabelEn: 'No S3 in between',
        successLabelVi: 'Không qua S3 nữa',
        packet: { edgeId: 'm2', labelEn: 'frames', labelVi: 'khung hình' },
        badge: { textEn: 'Hand over in memory', textVi: 'Chuyền trong bộ nhớ', type: 'success' },
        narrativeEn: 'Frames stay in memory. There is no S3 bucket between steps and no Step Functions state to pay for.',
        narrativeVi: 'Khung hình nằm yên trong bộ nhớ. Giữa các bước không còn bucket S3, cũng không còn trạng thái Step Functions nào phải trả tiền.',
      },
      {
        stepIndex: 3,
        activeNodeIds: ['shared-mem', 'detector-video', 'detector-audio'],
        activeEdgeIds: ['m3', 'm4'],
        successNodeId: 'shared-mem',
        successLabelEn: 'Over 90% cheaper',
        successLabelVi: 'Rẻ hơn trên 90%',
        packet: { edgeId: 'm3', labelEn: 'frames', labelVi: 'khung hình' },
        badge: { textEn: 'Check for defects', textVi: 'Kiểm tra lỗi', type: 'success' },
        narrativeEn: 'The detectors read the frames from the same memory. To handle more streams, Prime Video runs more copies of the process, each with a subset of the detectors.',
        narrativeVi: 'Các bộ bắt lỗi đọc khung hình từ chính vùng nhớ đó. Cần xử lý nhiều luồng hơn thì Prime Video chạy thêm bản sao của process, mỗi bản giữ một phần các bộ bắt lỗi.',
      },
    ],
  },
];

// Preset 2: Twitter Social Timelines: Fan-out on Read vs Fan-out on Write vs Hybrid Architecture
const TWITTER_FANOUT_SCENARIOS: FlowScenario[] = [
  {
    id: 'fanout-read',
    titleEn: '1. Fan-Out on Read (Multi-way SQL Join)',
    titleVi: '1. Fan-Out on Read (Nối bảng SQL khi truy vấn)',
    summaryEn: 'Simple O(1) post insert, but reading the timeline triggers a massive multi-table SQL join. Fails under 300k read req/sec.',
    summaryVi: 'Đăng bài cực nhanh O(1), nhưng mỗi lần đọc trang chủ lại phải JOIN 3 bảng lớn. Đổ vỡ khi chạm ngưỡng 300,000 lượt đọc/giây.',
    overallMetricEn: 'Write Latency: 2ms · Read Latency: 850ms+ · DB CPU: 98% (High Thrashing)',
    overallMetricVi: 'Độ trễ Ghi: 2ms · Độ trễ Đọc: >850ms · CPU Database: 98% (Quá tải)',
    nodes: [
      { id: 'client-read', labelEn: 'Mobile App', labelVi: 'Ứng dụng User', subEn: 'Feed Request', subVi: 'Yêu cầu mở Feed', x: 20, y: 105, width: 120, height: 80, icon: 'mobile', type: 'source' },
      { id: 'api-gateway', labelEn: 'API Gateway', labelVi: 'API Gateway', subEn: 'Load Balancer', subVi: 'Bộ cân bằng tải', x: 235, y: 105, width: 130, height: 80, icon: 'gateway', type: 'default' },
      { id: 'sql-db', labelEn: 'Relational DB', labelVi: 'Cơ sở dữ liệu SQL', subEn: 'MySQL / Postgres', subVi: 'Nút nghẽn tài nguyên', x: 470, y: 105, width: 150, height: 80, icon: 'database', type: 'bottleneck' },
      { id: 'query-engine', labelEn: 'Join & Sort Engine', labelVi: 'Bộ Nối & Sắp xếp', subEn: 'JOIN users & follows', subVi: 'Quét hàng triệu dòng', x: 765, y: 105, width: 150, height: 80, icon: 'engine', type: 'worker' },
    ],
    edges: [
      { id: 'e1', from: 'client-read', to: 'api-gateway', labelEn: 'GET /timeline', labelVi: 'GET /timeline', weight: 'light', curve: 'straight' },
      { id: 'e2', from: 'api-gateway', to: 'sql-db', labelEn: 'Heavy Query', labelVi: 'Truy vấn nặng', style: 'bottleneck', weight: 'heavy', curve: 'straight' },
      { id: 'e3', from: 'sql-db', to: 'query-engine', labelEn: 'Disk Buffer Scan', labelVi: 'Quét Buffer Disk', style: 'bottleneck', weight: 'heavy', curve: 'straight' },
    ],
    steps: [
      {
        stepIndex: 1,
        activeNodeIds: ['client-read', 'api-gateway'],
        activeEdgeIds: ['e1'],
        packet: { edgeId: 'e1', labelEn: 'GET /feed', labelVi: 'Yêu cầu tải Feed' },
        metrics: { latency: '12ms', throughput: '300,000 req/sec', costImpact: 'Baseline' },
        badge: { textEn: 'Read request', textVi: 'Yêu cầu đọc', type: 'info' },
        narrativeEn: 'Follower opens their mobile app, triggering a GET /timeline request to the API Gateway.',
        narrativeVi: 'Người dùng mở ứng dụng, kích hoạt yêu cầu GET /timeline tới hệ thống API Gateway.',
      },
      {
        stepIndex: 2,
        activeNodeIds: ['api-gateway', 'sql-db'],
        activeEdgeIds: ['e2'],
        alertNodeId: 'sql-db',
        alertLabelEn: 'Disk thrashing',
        alertLabelVi: 'Nghẽn bộ nhớ đệm',
        packet: { edgeId: 'e2', labelEn: 'SQL JOIN', labelVi: 'Nối 3 Bảng SQL' },
        metrics: { latency: '350ms', throughput: 'Queueing lock', costImpact: 'High CPU' },
        badge: { textEn: 'The big JOIN', textVi: 'Câu JOIN nặng', type: 'warning' },
        narrativeEn: 'Gateway executes a multi-table JOIN across follows, users, and tweets with ORDER BY timestamp DESC LIMIT 800.',
        narrativeVi: 'Gateway thực thi câu lệnh SQL JOIN đa bảng giữa follows, users và tweets kèm lệnh sắp xếp thời gian trên 800 dòng.',
      },
      {
        stepIndex: 3,
        activeNodeIds: ['sql-db', 'query-engine'],
        activeEdgeIds: ['e3'],
        alertNodeId: 'sql-db',
        alertLabelEn: 'CPU at 100%',
        alertLabelVi: 'CPU 100%, DB sắp sập',
        packet: { edgeId: 'e3', labelEn: 'Disk Scan', labelVi: 'Quét đĩa Disk' },
        metrics: { latency: '850ms', throughput: 'IOPS Saturation', costImpact: 'Fail Whale Risk' },
        badge: { textEn: 'Database gives out', textVi: 'Database đuối sức', type: 'danger' },
        narrativeEn: 'Database buffer pool thrashes as 300k concurrent read queries compete for memory. Responses slow down to seconds.',
        narrativeVi: 'Bộ nhớ đệm buffer pool bị quá tải vì 300,000 truy vấn đọc đồng thời tranh chấp tài nguyên. Thời gian phản hồi tăng lên hàng giây.',
      },
    ],
  },
  {
    id: 'fanout-write',
    titleEn: '2. Fan-Out on Write (Celebrity Trap)',
    titleVi: '2. Fan-Out on Write (Cạm bẫy người nổi tiếng)',
    summaryEn: 'Pushing tweets to every follower mailbox makes reads fast O(1), but a single celebrity post triggers 30M writes and chokes the queue.',
    summaryVi: 'Đẩy trước tweet vào hộp thư Redis giúp đọc cực nhanh O(1), nhưng 1 post của người nổi tiếng sẽ kích hoạt 30 triệu lần ghi làm tê liệt hàng đợi.',
    overallMetricEn: 'Normal Read: 1.5ms · Normal Write: 40ms · Celebrity Post: 5+ minutes worker backlog',
    overallMetricVi: 'Đọc thường: 1.5ms · Ghi thường: 40ms · Post Celebrity: Trễ hàng đợi > 5 phút',
    nodes: [
      { id: 'celebrity-node', labelEn: 'Lady Gaga / Musk', labelVi: 'Tài khoản Triệu Sub', subEn: '30M+ Followers', subVi: '30+ triệu follower', x: 10, y: 105, width: 130, height: 80, icon: 'celebrity', type: 'bottleneck' },
      { id: 'broker-queue', labelEn: 'Message Queue', labelVi: 'Hàng đợi Thông điệp', subEn: 'Kafka / RabbitMQ', subVi: 'Hàng triệu Job ghi', x: 245, y: 105, width: 130, height: 80, icon: 'queue', type: 'default' },
      { id: 'fanout-workers', labelEn: 'Fan-Out Workers', labelVi: 'Cụm Worker Fan-out', subEn: 'Distributed Pool', subVi: 'Chạy vòng lặp 30M lần', x: 495, y: 105, width: 140, height: 80, icon: 'server', type: 'worker' },
      { id: 'redis-mailboxes', labelEn: 'Redis Timeline Lists', labelVi: 'Hộp thư Redis', subEn: 'In-Memory Lists', subVi: 'LPUSH 30M key', x: 765, y: 105, width: 150, height: 80, icon: 'mailbox', type: 'storage' },
    ],
    edges: [
      { id: 'e1', from: 'celebrity-node', to: 'broker-queue', labelEn: '1 Tweet Posted', labelVi: 'Đăng 1 Tweet', weight: 'light', curve: 'straight' },
      { id: 'e2', from: 'broker-queue', to: 'fanout-workers', labelEn: 'Queue Backlog', labelVi: 'Tích tụ Job', style: 'bottleneck', weight: 'heavy', curve: 'straight' },
      { id: 'e3', from: 'fanout-workers', to: 'redis-mailboxes', labelEn: '30M LPUSH Storm', labelVi: 'Bão 30M LPUSH', style: 'bottleneck', weight: 'heavy', curve: 'straight' },
    ],
    steps: [
      {
        stepIndex: 1,
        activeNodeIds: ['celebrity-node', 'broker-queue'],
        activeEdgeIds: ['e1'],
        packet: { edgeId: 'e1', labelEn: '1 Tweet', labelVi: '1 Bài Tweet' },
        metrics: { latency: '3ms', throughput: '1 Event', costImpact: 'Nominal' },
        badge: { textEn: 'One tweet', textVi: 'Một tweet', type: 'info' },
        narrativeEn: 'A celebrity with 30,000,000 followers publishes a single tweet into the message queue.',
        narrativeVi: 'Một tài khoản có hơn 30 triệu người theo dõi đăng một bài viết vào hàng đợi thông điệp.',
      },
      {
        stepIndex: 2,
        activeNodeIds: ['broker-queue', 'fanout-workers'],
        activeEdgeIds: ['e2'],
        alertNodeId: 'broker-queue',
        alertLabelEn: '30M jobs queued',
        alertLabelVi: '30 triệu job xếp hàng',
        packet: { edgeId: 'e2', labelEn: 'Batch Jobs', labelVi: 'Phân rã Job' },
        metrics: { latency: '1,200ms', throughput: 'Queue Lagging', costImpact: 'Worker saturation' },
        badge: { textEn: '30M jobs', textVi: '30 triệu job', type: 'warning' },
        narrativeEn: 'Fan-out workers pull the event, query the social graph, and generate 30,000,000 individual timeline insertion tasks.',
        narrativeVi: 'Cụm worker lấy sự kiện, tra cứu đồ thị quan hệ và sinh ra 30,000,000 tác vụ chèn bài viết vào từng timeline riêng lẻ.',
      },
      {
        stepIndex: 3,
        activeNodeIds: ['fanout-workers', 'redis-mailboxes'],
        activeEdgeIds: ['e3'],
        alertNodeId: 'fanout-workers',
        alertLabelEn: 'Minutes behind',
        alertLabelVi: 'Trễ vài phút',
        packet: { edgeId: 'e3', labelEn: '30M LPUSH', labelVi: 'Bão ghi 30 triệu lần' },
        metrics: { latency: '5+ Minutes', throughput: 'Redis IOPS Maxed', costImpact: 'Severe Lag' },
        badge: { textEn: 'Writes pile up', textVi: 'Lệnh ghi dồn ứ', type: 'danger' },
        narrativeEn: 'Workers send millions of writes to Redis. Delivery lag spikes to several minutes before followers see the update.',
        narrativeVi: 'Cụm worker gửi hàng triệu lệnh ghi vào Redis. Độ trễ hiển thị bài viết tăng lên tới vài phút khiến người theo dõi chờ đợi.',
      },
    ],
  },
  {
    id: 'hybrid',
    titleEn: '3. Hybrid Fan-Out (Twitter Production)',
    titleVi: '3. Kiến trúc Hybrid (Thực tế Twitter)',
    summaryEn: 'Regular friends fan-out on write to cache; celebrities are excluded and merged in-memory at query time. Sub-10ms latency for everyone.',
    summaryVi: 'Bạn bè thông thường ghi trước vào Redis; người nổi tiếng bỏ qua ghi và được gộp thẳng trong RAM khi mở app. Độ trễ <10ms cho mọi người.',
    overallMetricEn: 'Regular Read: 3ms · Celebrity Post: 5ms · Memory Merge: 2ms · Zero Worker Lag',
    overallMetricVi: 'Đọc thường: 3ms · Đăng Celebrity: 5ms · Nối RAM: 2ms · Không còn nghẽn hàng đợi',
    nodes: [
      { id: 'user-hybrid', labelEn: 'Regular User', labelVi: 'Bạn bè thường', subEn: '< 20k Followers', subVi: '< 20k Người theo dõi', x: 20, y: 30, width: 135, height: 80, icon: 'friends', type: 'source' },
      { id: 'celeb-hybrid', labelEn: 'Celebrity Account', labelVi: 'Người nổi tiếng', subEn: '> 1M Followers', subVi: '> 1M Người theo dõi', x: 20, y: 180, width: 135, height: 80, icon: 'celebrity', type: 'bottleneck' },
      { id: 'redis-box', labelEn: 'Friends Redis Cache', labelVi: 'Redis Bạn bè', subEn: 'Precomputed Mailbox', subVi: 'Hộp thư bạn bè thường', x: 380, y: 30, width: 160, height: 80, icon: 'mailbox', type: 'storage' },
      { id: 'celeb-store', labelEn: 'Celebrity Posts Log', labelVi: 'Kho Post Celebrity', subEn: 'Indexed by User ID', subVi: 'Lưu trữ riêng biệt', x: 380, y: 180, width: 160, height: 80, icon: 'log', type: 'storage' },
      { id: 'in-memory-merger', labelEn: 'Timeline Merger', labelVi: 'Bộ Hợp nhất RAM', subEn: 'Sub-millisecond Merge', subVi: 'Nối mảng cực nhanh', x: 720, y: 105, width: 170, height: 80, icon: 'merge', type: 'success' },
    ],
    edges: [
      { id: 'e1', from: 'user-hybrid', to: 'redis-box', labelEn: 'Instant Push', labelVi: 'Ghi trước O(N nhỏ)', curve: 'straight' },
      { id: 'e2', from: 'celeb-hybrid', to: 'celeb-store', labelEn: 'Single Log Append', labelVi: 'Ghi 1 dòng O(1)', weight: 'light', curve: 'straight' },
      { id: 'e3', from: 'redis-box', to: 'in-memory-merger', labelEn: 'Precomputed List', labelVi: 'Lấy list bạn bè', weight: 'light', curve: 'curved-down' },
      { id: 'e4', from: 'celeb-store', to: 'in-memory-merger', labelEn: 'Fetch Top Tweets', labelVi: 'Lấy tweet Idol', weight: 'light', curve: 'curved-up' },
    ],
    steps: [
      {
        stepIndex: 1,
        activeNodeIds: ['user-hybrid', 'redis-box', 'celeb-hybrid', 'celeb-store'],
        activeEdgeIds: ['e1', 'e2'],
        successNodeId: 'celeb-store',
        successLabelEn: 'Written once',
        successLabelVi: 'Chỉ ghi một lần',
        packet: { edgeId: 'e1', labelEn: 'Smart Ingest', labelVi: 'Tiếp nhận thông minh' },
        metrics: { latency: '3ms', throughput: '12,000 tweets/s', costImpact: 'Optimized' },
        badge: { textEn: 'Two write paths', textVi: 'Hai đường ghi', type: 'info' },
        narrativeEn: 'Regular tweets are quickly pushed to followers. Celebrity tweets are appended to an indexed log without running a 30M-write fan-out.',
        narrativeVi: 'Bài viết của bạn bè được đẩy vào Redis. Bài viết của người nổi tiếng chỉ ghi một lần vào bảng log riêng, không fan-out 30 triệu lần.',
      },
      {
        stepIndex: 2,
        activeNodeIds: ['redis-box', 'celeb-store', 'in-memory-merger'],
        activeEdgeIds: ['e3', 'e4'],
        packet: { edgeId: 'e3', labelEn: 'Parallel Fetch', labelVi: 'Đọc song song' },
        metrics: { latency: '4ms', throughput: 'High concurrency', costImpact: 'Zero DB strain' },
        badge: { textEn: 'Parallel Read', textVi: 'Đọc song song', type: 'success' },
        narrativeEn: 'When a user opens Twitter, the merger reads their precomputed friend cache and queries recent posts of followed celebrities in parallel.',
        narrativeVi: 'Khi người dùng mở ứng dụng, bộ hợp nhất đọc song song hộp thư bạn bè và lấy bài mới nhất của các tài khoản người nổi tiếng họ theo dõi.',
      },
      {
        stepIndex: 3,
        activeNodeIds: ['in-memory-merger'],
        activeEdgeIds: [],
        successNodeId: 'in-memory-merger',
        successLabelEn: 'Merged in 2 ms',
        successLabelVi: 'Ghép xong trong 2 ms',
        metrics: { latency: '6ms Total', throughput: '300,000 req/sec', costImpact: 'Minimal RAM' },
        badge: { textEn: 'Merge and reply', textVi: 'Ghép và trả về', type: 'success' },
        narrativeEn: 'The Timeline Merger merges two sorted lists in memory. The user gets the feed in under 10 ms.',
        narrativeVi: 'Bộ hợp nhất ghép hai danh sách đã sắp xếp ngay trong RAM. Người dùng nhận feed trong chưa tới 10 ms.',
      },
    ],
  },
];

interface AnimatedFlowProps {
  preset?: 'prime-video' | 'twitter-fanout';
  scenarioId?: string;
  title?: string;
  titleVi?: string;
}

export default function AnimatedFlow({
  preset = 'prime-video',
  scenarioId,
  title = 'Interactive Architecture Flow Simulator',
  titleVi = 'Mô phỏng Luồng Kiến trúc Động',
}: AnimatedFlowProps) {
  // Several flows share one page and the EN/VI copies are hidden with display:none,
  // so SVG <marker>/<filter> ids must be unique per instance or arrows can vanish.
  const uid = `flow${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const arrowId = (state: ArrowState, weight: EdgeWeight) => `${uid}-arrow-${state}-${weight}`;

  const scenarios = preset === 'twitter-fanout' ? TWITTER_FANOUT_SCENARIOS : PRIME_VIDEO_SCENARIOS;
  const initialScenario = scenarios.find((s) => s.id === scenarioId) || scenarios[0];
  const [activeScenarioId, setActiveScenarioId] = useState<string>(initialScenario.id);
  const scenario = scenarios.find((s) => s.id === activeScenarioId) || initialScenario;

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = scenario.steps.find((s) => s.stepIndex === currentStepIndex) || scenario.steps[0];

  // Helper to switch scenarios
  const handleScenarioChange = (id: string) => {
    setActiveScenarioId(id);
    setCurrentStepIndex(1);
    setIsPlaying(true);
  };

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalDuration = 2400 / playbackSpeed;
    timerRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= scenario.steps.length) {
          return 1;
        }
        return prev + 1;
      });
    }, intervalDuration);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, scenario.steps.length, activeScenarioId]);

  // Node position lookups for edges
  const getNodeBounds = (nodeId: string) => {
    const node = scenario.nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0, w: 130, h: 60, left: 0, right: 0, top: 0, bottom: 0, midX: 0, midY: 0 };
    const w = node.width || 135;
    const h = node.height || 80;
    return {
      x: node.x,
      y: node.y,
      w,
      h,
      left: node.x,
      right: node.x + w,
      top: node.y,
      bottom: node.y + h,
      midX: node.x + w / 2,
      midY: node.y + h / 2,
    };
  };

  return (
    <div className="animated-flow-wrapper" aria-label="Interactive architecture flow visualizer">
      {/* Top Header & Scenario Switcher */}
      <div className="flow-header">
        <div className="flow-title-area">
          <h3 className="flow-title">
            <span data-lang-en>{title}</span>
            <span data-lang-vi>{titleVi}</span>
          </h3>
        </div>

        {/* Scenarios (Trade-off Comparison) */}
        {!scenarioId && scenarios.length > 1 && (
          <div className="flow-scenarios" role="tablist" aria-label="Architecture Comparison">
            {scenarios.map((s) => {
              const isSelected = s.id === activeScenarioId;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`flow-scenario-btn ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleScenarioChange(s.id)}
                >
                  <span data-lang-en>{s.titleEn}</span>
                  <span data-lang-vi>{s.titleVi}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Scenario Brief Description */}
      <div className="flow-summary-banner">
        <p className="flow-summary-text">
          <span data-lang-en>{scenario.summaryEn}</span>
          <span data-lang-vi>{scenario.summaryVi}</span>
        </p>
        {scenario.overallMetricEn && (
          <div className="flow-metric-badge">
            <span data-lang-en>{scenario.overallMetricEn}</span>
            <span data-lang-vi>{scenario.overallMetricVi}</span>
          </div>
        )}
      </div>

      {/* Interactive Flow Canvas (SVG based) */}
      <div className="flow-canvas-container">
        <svg
          viewBox="0 0 920 290"
          className="flow-svg-canvas"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Animated system design data flow"
        >
          <defs>
            {/* Soft glow around the packet travelling along an active edge */}
            <filter id={`${uid}-packet-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id={`${uid}-danger-glow`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* One arrowhead per (state, weight): the head grows with the line it ends */}
            {ARROW_STATES.map((state) =>
              EDGE_WEIGHTS.map((weight) => (
                <marker
                  key={`${state}-${weight}`}
                  id={arrowId(state, weight)}
                  viewBox="0 0 10 10"
                  refX="0"
                  refY="5"
                  markerUnits="userSpaceOnUse"
                  markerWidth={ARROW_LEN[weight]}
                  markerHeight={ARROW_LEN[weight]}
                  orient="auto"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" className={`flow-arrow-head is-${state} w-${weight}`} />
                </marker>
              )),
            )}
          </defs>

          {/* Render Background Outer Containers (e.g. EC2 Host) */}
          {scenario.nodes
            .filter((n) => n.width && n.height && n.width > 200)
            .map((containerNode) => {
              const containerIcon = containerNode.icon;
              return (
                <g key={containerNode.id} className="flow-outer-container">
                  <rect
                    x={containerNode.x}
                    y={containerNode.y}
                    width={containerNode.width}
                    height={containerNode.height}
                    rx="14"
                    className="flow-container-rect"
                  />
                  {containerIcon && (
                    <image
                      href={iconHref(containerIcon)}
                      x={containerNode.x + 14}
                      y={containerNode.y + 9}
                      width={20}
                      height={20}
                      aria-hidden="true"
                    />
                  )}
                  <text x={containerNode.x + (containerIcon ? 40 : 18)} y={containerNode.y + 24} className="flow-container-label">
                    <tspan data-lang-en>{containerNode.labelEn}</tspan>
                    <tspan data-lang-vi>{containerNode.labelVi || containerNode.labelEn}</tspan>
                  </text>
                </g>
              );
            })}

          {/* Render Edges (Connecting Pipes) */}
          {scenario.edges.map((edge) => {
            const from = getNodeBounds(edge.from);
            const to = getNodeBounds(edge.to);
            const isEdgeActive = currentStep.activeEdgeIds.includes(edge.id);
            const isBottleneck = edge.style === 'bottleneck';
            const weight = edge.weight ?? 'normal';
            const arrowState: ArrowState = !isEdgeActive ? 'idle' : isBottleneck ? 'danger' : 'active';
            // The line stops one arrowhead short of the target, so the tip lands on the node border.
            const gap = ARROW_LEN[weight];

            let startX = from.right;
            let startY = from.midY;
            let endX = to.left - gap;
            let endY = to.midY;

            let pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
            let labelX = (startX + endX) / 2;
            let labelY = startY - (weight === 'heavy' ? 13 : 9);

            if (edge.curve === 'vertical') {
              startX = from.midX;
              startY = from.bottom;
              endX = to.midX;
              endY = to.top - gap;
              pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
              labelX = startX + 70;
              labelY = (startY + endY) / 2 + 4;
            } else if (edge.curve === 'curved-up') {
              pathD = `M ${startX} ${startY} C ${startX + 40} ${startY - 18}, ${endX - 40} ${endY + 10}, ${endX} ${endY}`;
              labelX = (startX + endX) / 2;
              labelY = (startY + endY) / 2 - 12;
            } else if (edge.curve === 'curved-down') {
              pathD = `M ${startX} ${startY} C ${startX + 40} ${startY + 18}, ${endX - 40} ${endY - 10}, ${endX} ${endY}`;
              labelX = (startX + endX) / 2;
              labelY = (startY + endY) / 2 + 18;
            }

            const labelEn = edge.labelEn || '';
            const labelVi = edge.labelVi || labelEn;
            const maxLen = Math.max(labelEn.length, labelVi.length);
            // 10px label in the site font: ~6px per character plus padding.
            const pillWidth = Math.max(maxLen * 6.2 + 14, 50);

            return (
              <g
                key={edge.id}
                className={`flow-edge-group w-${weight} ${isEdgeActive ? 'is-active' : ''} ${edge.style === 'dashed' ? 'is-dashed' : ''}`}
              >
                {/* Background pipe: thickness shows how heavy the traffic is */}
                <path
                  d={pathD}
                  fill="none"
                  className="flow-edge-bg"
                  markerEnd={`url(#${arrowId(arrowState, weight)})`}
                />

                {/* Animated active packet stream */}
                {isEdgeActive && (
                  <>
                    <path
                      d={pathD}
                      fill="none"
                      className={`flow-edge-active ${isBottleneck ? 'is-bottleneck' : ''}`}
                    />
                    {isBottleneck ? (
                      /* Congested stream: 3 staggered red particles simulate queue pileup */
                      [0, 0.32, 0.65].map((delay, i) => (
                        <circle
                          key={delay}
                          r={6 - i}
                          className="flow-packet-particle is-bottleneck"
                          filter={`url(#${uid}-danger-glow)`}
                        >
                          <animateMotion
                            path={pathD}
                            dur={playbackSpeed === 2 ? '1.1s' : playbackSpeed === 1.5 ? '1.4s' : '1.9s'}
                            begin={`${delay}s`}
                            repeatCount="indefinite"
                          />
                        </circle>
                      ))
                    ) : (
                      /* Normal stream: smooth golden packet */
                      <circle r="5" className="flow-packet-particle" filter={`url(#${uid}-packet-glow)`}>
                        <animateMotion
                          path={pathD}
                          dur={playbackSpeed === 2 ? '0.7s' : playbackSpeed === 1.5 ? '0.9s' : '1.3s'}
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </>
                )}

                {/* Masked Edge Label Badge (Prevents colliding onto lines or adjacent boxes) */}
                {(labelEn || labelVi) && (
                  <g className="flow-edge-label-pill">
                    <rect
                      x={labelX - pillWidth / 2}
                      y={labelY - 10}
                      width={pillWidth}
                      height="16"
                      rx="4"
                      className="flow-edge-pill-bg"
                    />
                    <text
                      x={labelX}
                      y={labelY + 2}
                      className={`flow-edge-label ${isEdgeActive ? 'is-active' : ''}`}
                      textAnchor="middle"
                    >
                      <tspan data-lang-en>{labelEn}</tspan>
                      <tspan data-lang-vi>{labelVi}</tspan>
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Render Standalone Nodes */}
          {scenario.nodes
            .filter((n) => !n.width || n.width < 200)
            .map((node) => {
              const isActive = currentStep.activeNodeIds.includes(node.id);
              const isAlertNode = currentStep.alertNodeId === node.id;
              const isSuccessNode = currentStep.successNodeId === node.id;
              const isDistress = isAlertNode || (isActive && node.type === 'bottleneck' && (currentStep.badge?.type === 'danger' || currentStep.badge?.type === 'warning'));
              const nodeIcon = node.icon;
              const w = node.width || 135;
              const h = node.height || 80;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className={`flow-node-group ${isActive ? 'is-active' : ''} ${isSuccessNode ? 'is-success-active' : ''} type-${node.type || 'default'}`}
                >
                  {/* Distress turns the node red (static, no motion) */}
                  <g className={`flow-node-inner ${isDistress ? 'is-distress' : ''}`}>
                    {/* Glowing Pulse Ring for Normal Active Node */}
                    {isActive && !isDistress && (
                      <rect
                        x="-4"
                        y="-4"
                        width={w + 8}
                        height={h + 8}
                        rx="12"
                        className="flow-node-glow-ring"
                      />
                    )}

                    {/* Red outline around a distressed / bottleneck node */}
                    {isDistress && (
                      <rect
                        x="-6"
                        y="-6"
                        width={w + 12}
                        height={h + 12}
                        rx="14"
                        className="flow-node-danger-aura"
                      />
                    )}

                    {/* Green outline around a node that shows the fix */}
                    {isSuccessNode && (
                      <rect
                        x="-5"
                        y="-5"
                        width={w + 10}
                        height={h + 10}
                        rx="13"
                        className="flow-node-success-aura"
                      />
                    )}

                    {/* Node Box */}
                    <rect
                      x="0"
                      y="0"
                      width={w}
                      height={h}
                      rx="9"
                      className="flow-node-rect"
                    />

                    {/* Status Indicator Dot */}
                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                      className={`flow-node-status-dot ${isActive ? 'is-active' : ''} ${isDistress ? 'is-danger' : ''} ${isSuccessNode ? 'is-success' : ''}`}
                    />

                    {/* Colour icon of what this component is (logo or pictogram) */}
                    {nodeIcon && (
                      <>
                        {/* light disc behind the icon: only filled in dark mode so dark logos (Kafka) stay visible */}
                        <circle cx={w / 2} cy={23} r={18} className="flow-node-icon-bg" />
                        <image
                          href={iconHref(nodeIcon)}
                          x={w / 2 - 15}
                          y={8}
                          width={30}
                          height={30}
                          className="flow-node-icon"
                          aria-hidden="true"
                        />
                      </>
                    )}

                    {/* Node Main Title */}
                    <text x={w / 2} y={nodeIcon ? 52 : 30} textAnchor="middle" className="flow-node-title">
                      <tspan data-lang-en>{node.labelEn}</tspan>
                      <tspan data-lang-vi>{node.labelVi || node.labelEn}</tspan>
                    </text>

                    {/* Subtitle / Tech stack */}
                    <text x={w / 2} y={nodeIcon ? 68 : 48} textAnchor="middle" className="flow-node-sub">
                      <tspan data-lang-en>{node.subEn}</tspan>
                      <tspan data-lang-vi>{node.subVi || node.subEn}</tspan>
                    </text>
                  </g>

                  {/* Label above the node; its background ends above the red outline (outline sits at y = -7) */}
                  {(isAlertNode || (!currentStep.alertNodeId && isDistress)) && (
                    <g transform={`translate(${w / 2}, -18)`}>
                      <g className="flow-floating-badge danger">
                        <rect x="-80" y="-9" width="160" height="18" className="flow-floating-badge-bg" />
                        <text x="0" y="4" textAnchor="middle" className="flow-floating-badge-text">
                          <tspan data-lang-en>{currentStep.alertLabelEn || 'Bottleneck'}</tspan>
                          <tspan data-lang-vi>{currentStep.alertLabelVi || 'Điểm nghẽn'}</tspan>
                        </text>
                      </g>
                    </g>
                  )}

                  {/* Green label above the node, same placement as the red one */}
                  {isSuccessNode && (
                    <g transform={`translate(${w / 2}, -18)`}>
                      <g className="flow-floating-badge success">
                        <rect x="-80" y="-9" width="160" height="18" className="flow-floating-badge-bg" />
                        <text x="0" y="4" textAnchor="middle" className="flow-floating-badge-text">
                          <tspan data-lang-en>{currentStep.successLabelEn || 'Fixed'}</tspan>
                          <tspan data-lang-vi>{currentStep.successLabelVi || 'Đã ổn'}</tspan>
                        </text>
                      </g>
                    </g>
                  )}
                </g>
              );
            })}
        </svg>

        {/* Legend: how to read arrow thickness and colour */}
        <div className="flow-legend">
          {LEGEND_ITEMS.map((item) => (
            <span key={item.weight} className="flow-legend-item">
              <svg width="40" height="16" viewBox="0 0 40 16" aria-hidden="true">
                <g className={`flow-edge-group w-${item.weight}`}>
                  <path
                    d={`M 2 8 L ${38 - ARROW_LEN[item.weight]} 8`}
                    fill="none"
                    className="flow-edge-bg"
                    markerEnd={`url(#${arrowId('idle', item.weight)})`}
                  />
                </g>
              </svg>
              <span data-lang-en>{item.en}</span>
              <span data-lang-vi>{item.vi}</span>
            </span>
          ))}
          <span className="flow-legend-item">
            <span className="flow-legend-swatch is-danger" aria-hidden="true" />
            <span data-lang-en>Red = bottleneck</span>
            <span data-lang-vi>Đỏ = điểm nghẽn</span>
          </span>
        </div>
      </div>

      {/* Interactive Control Deck */}
      <div className="flow-controls-deck">
        <div className="flow-timeline-steps">
          {scenario.steps.map((st) => {
            const isCurrent = st.stepIndex === currentStepIndex;
            return (
              <button
                key={st.stepIndex}
                type="button"
                className={`flow-step-pill ${isCurrent ? 'is-active' : ''}`}
                onClick={() => {
                  setCurrentStepIndex(st.stepIndex);
                  setIsPlaying(false);
                }}
              >
                <span className="step-num">#{st.stepIndex}</span>
                <span className="step-name">
                  <span data-lang-en>{st.badge?.textEn || `Step ${st.stepIndex}`}</span>
                  <span data-lang-vi>{st.badge?.textVi || `Bước ${st.stepIndex}`}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="flow-playback-actions">
          {/* Step Back */}
          <button
            type="button"
            className="flow-action-btn"
            title="Previous step"
            onClick={() => {
              setCurrentStepIndex((prev) => (prev > 1 ? prev - 1 : scenario.steps.length));
              setIsPlaying(false);
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
          </button>

          {/* Play / Pause Toggle */}
          <button
            type="button"
            className="flow-action-btn flow-play-btn"
            title={isPlaying ? 'Pause simulation' : 'Play simulation'}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            )}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          {/* Step Forward */}
          <button
            type="button"
            className="flow-action-btn"
            title="Next step"
            onClick={() => {
              setCurrentStepIndex((prev) => (prev < scenario.steps.length ? prev + 1 : 1));
              setIsPlaying(false);
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </button>

          {/* Speed Selector */}
          <div className="flow-speed-group" title="Playback speed">
            {[1, 1.5, 2].map((spd) => (
              <button
                key={spd}
                type="button"
                className={`flow-speed-chip ${playbackSpeed === spd ? 'is-active' : ''}`}
                onClick={() => setPlaybackSpeed(spd)}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Synchronized Step Narration & Telemetry Log */}
      <div className={`flow-telemetry-box ${currentStep.badge?.type ? `alert-type-${currentStep.badge.type}` : ''}`}>
        <div className="telemetry-header">
          <div className="telemetry-badge-container">
            {currentStep.badge && (
              <span className={`telemetry-badge type-${currentStep.badge.type}`}>
                <span data-lang-en>{currentStep.badge.textEn}</span>
                <span data-lang-vi>{currentStep.badge.textVi}</span>
              </span>
            )}
            <span className="telemetry-step-id">
              <span data-lang-en>Step {currentStep.stepIndex} of {scenario.steps.length}</span>
              <span data-lang-vi>Bước {currentStep.stepIndex}/{scenario.steps.length}</span>
            </span>
          </div>

          {currentStep.metrics && (
            <div className="telemetry-metrics-row">
              <div className="telemetry-stat">
                <span className="stat-label">Latency:</span>
                <span className="stat-val">{currentStep.metrics.latency}</span>
              </div>
              <div className="telemetry-stat">
                <span className="stat-label">Throughput:</span>
                <span className="stat-val">{currentStep.metrics.throughput}</span>
              </div>
              <div className="telemetry-stat">
                <span className="stat-label">Cost Impact:</span>
                <span className="stat-val highlight">{currentStep.metrics.costImpact}</span>
              </div>
            </div>
          )}
        </div>

        {/* Narrative Explanation */}
        <p className="telemetry-narrative">
          <span data-lang-en>{currentStep.narrativeEn}</span>
          <span data-lang-vi>{currentStep.narrativeVi}</span>
        </p>
      </div>
    </div>
  );
}
