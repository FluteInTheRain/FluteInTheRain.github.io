import React, { useState, useEffect, useRef, useId } from 'react';
import {
  Archive,
  AudioLines,
  Combine,
  Database,
  Film,
  GitMerge,
  ListOrdered,
  Mailbox,
  MemoryStick,
  Network,
  ScanSearch,
  Scissors,
  ScrollText,
  Server,
  Smartphone,
  Split,
  Star,
  UsersCollaboration,
  Video,
  Workflow,
} from 'lucide-react';

// Pictogram drawn at the top of each node, so readers recognise the component at a glance.
const NODE_ICONS = {
  video: Video,
  scissors: Scissors,
  storage: Archive,
  workflow: Workflow,
  scan: ScanSearch,
  split: Split,
  memory: MemoryStick,
  film: Film,
  audio: AudioLines,
  mobile: Smartphone,
  gateway: Network,
  database: Database,
  engine: Combine,
  celebrity: Star,
  queue: ListOrdered,
  server: Server,
  mailbox: Mailbox,
  friends: UsersCollaboration,
  log: ScrollText,
  merge: GitMerge,
} as const;

export type FlowIconName = keyof typeof NODE_ICONS;

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
  overallMetricEn: string;
  overallMetricVi: string;
}

// Preset: Amazon Prime Video Architecture Comparison with generous spacing
const PRIME_VIDEO_SCENARIOS: FlowScenario[] = [
  {
    id: 'serverless',
    titleEn: '1. Serverless Architecture (Before)',
    titleVi: '1. Kiến trúc Serverless (Trước đây)',
    summaryEn: 'Thousands of micro-lambdas exchanging video frames through S3 storage and Step Functions. High latency, tier-1 request cost explosion.',
    summaryVi: 'Hàng ngàn Lambda trao đổi frame video qua S3 và Step Functions. Chi phí đọc/ghi S3 bùng nổ, chạm trần giới hạn TPS.',
    overallMetricEn: 'S3 Costs: $30,000+/mo · Step-Fn Triggers: High · Bottleneck: S3 I/O',
    overallMetricVi: 'Chi phí S3: >$30,000/tháng · Trigger Step Functions liên tục · Nghẽn: S3 I/O',
    nodes: [
      { id: 'video-source', labelEn: 'Live Feed', labelVi: 'Luồng Live', subEn: 'Video Input', subVi: 'Nguồn Video', x: 20, y: 160, width: 115, height: 80, icon: 'video', type: 'source' },
      { id: 'converter', labelEn: 'Chunk Splitter', labelVi: 'Bộ chia Frame', subEn: 'Lambda Chunker', subVi: 'Lambda chia nhỏ', x: 235, y: 160, width: 130, height: 80, icon: 'scissors', type: 'worker' },
      { id: 's3-bucket', labelEn: 'Amazon S3', labelVi: 'Amazon S3', subEn: 'S3 Transit (Bottleneck)', subVi: 'Lưu tạm S3 (Nút nghẽn)', x: 475, y: 160, width: 165, height: 80, icon: 'storage', type: 'bottleneck' },
      { id: 'step-fn', labelEn: 'Step Functions', labelVi: 'Step Functions', subEn: 'State Machine & Poller', subVi: 'Máy trạng thái điều phối', x: 475, y: 24, width: 165, height: 80, icon: 'workflow', type: 'default' },
      { id: 'defect-detector', labelEn: 'Defect Detector', labelVi: 'Bắt lỗi Video/Audio', subEn: 'Micro-Lambdas', subVi: 'Cụm Lambda phân tích', x: 745, y: 160, width: 145, height: 80, icon: 'scan', type: 'worker' },
    ],
    edges: [
      { id: 'e1', from: 'video-source', to: 'converter', labelEn: 'Raw Stream', labelVi: 'Stream Gốc', curve: 'straight' },
      { id: 'e2', from: 'converter', to: 's3-bucket', labelEn: 'PUTs/sec', labelVi: 'Ghi PUT/s', style: 'bottleneck', weight: 'heavy', curve: 'straight' },
      { id: 'e3', from: 'step-fn', to: 's3-bucket', labelEn: 'Sync State', labelVi: 'Đồng bộ State', style: 'dashed', curve: 'vertical' },
      { id: 'e4', from: 's3-bucket', to: 'defect-detector', labelEn: 'GETs/sec', labelVi: 'Đọc GET/s', style: 'bottleneck', weight: 'heavy', curve: 'straight' },
    ],
    steps: [
      {
        stepIndex: 1,
        activeNodeIds: ['video-source', 'converter'],
        activeEdgeIds: ['e1'],
        packet: { edgeId: 'e1', labelEn: 'Video Stream', labelVi: 'Luồng Video' },
        metrics: { latency: '15ms', throughput: '1080p60 Stream', costImpact: '$0.001' },
        badge: { textEn: 'Ingestion', textVi: 'Tiếp nhận', type: 'info' },
        narrativeEn: 'Live video feed enters AWS infrastructure and is ingested by the chunking worker.',
        narrativeVi: 'Luồng video trực tiếp đi vào hạ tầng AWS và được dịch vụ phân tách frame tiếp nhận.',
      },
      {
        stepIndex: 2,
        activeNodeIds: ['converter', 's3-bucket'],
        activeEdgeIds: ['e2'],
        alertNodeId: 's3-bucket',
        alertLabelEn: '⚠️ S3 I/O LIMIT',
        alertLabelVi: '⚠️ CHẠM TRẦN S3',
        packet: { edgeId: 'e2', labelEn: 'Chunk PUTs', labelVi: 'Ghi Frame lên S3' },
        metrics: { latency: '120ms', throughput: '1,200 PUT/sec', costImpact: '$$ High API Cost' },
        badge: { textEn: 'Bottleneck #1', textVi: 'Điểm nghẽn #1', type: 'warning' },
        narrativeEn: 'Lambda splits video into individual image frames and writes each frame to S3. Writes rapidly overwhelm S3 Tier-1 API quotas.',
        narrativeVi: 'Lambda chia video thành các frame ảnh riêng lẻ và ghi từng frame lên S3. Số lượng request PUT tăng phi mã, gây tốn kém chi phí giao dịch.',
      },
      {
        stepIndex: 3,
        activeNodeIds: ['s3-bucket', 'step-fn'],
        activeEdgeIds: ['e3'],
        alertNodeId: 'step-fn',
        alertLabelEn: '⚡ $$ COST SPIKE',
        alertLabelVi: '⚡ $$ CHI PHÍ VỌT',
        packet: { edgeId: 'e3', labelEn: 'State Polling', labelVi: 'Thăm dò trạng thái' },
        metrics: { latency: '85ms', throughput: 'State transitions', costImpact: '$$ Step Fn pricing' },
        badge: { textEn: 'Orchestration Overhead', textVi: 'Độ trễ điều phối', type: 'warning' },
        narrativeEn: 'AWS Step Functions polls S3 to orchestrate downstream worker jobs. Thousands of state transitions per minute pile up costs.',
        narrativeVi: 'AWS Step Functions liên tục thăm dò S3 để điều phối chuỗi xử lý. Hàng ngàn bước chuyển trạng thái mỗi phút làm tăng vọt chi phí.',
      },
      {
        stepIndex: 4,
        activeNodeIds: ['s3-bucket', 'defect-detector'],
        activeEdgeIds: ['e4'],
        alertNodeId: 's3-bucket',
        alertLabelEn: '🚨 GET LIMIT OVERLOAD',
        alertLabelVi: '🚨 ĐỌC S3 QUÁ TẢI',
        packet: { edgeId: 'e4', labelEn: 'Download Frame', labelVi: 'Tải Frame về Lambda' },
        metrics: { latency: '240ms', throughput: 'Bandwidth saturation', costImpact: '$$$$ Critical S3 GET' },
        badge: { textEn: 'Bottleneck #2: GET Limit', textVi: 'Điểm nghẽn #2: Đọc S3', type: 'danger' },
        narrativeEn: 'Defect-detecting Lambdas download frames back from S3. Read concurrency hits AWS account limits, throttling analysis pipelines.',
        narrativeVi: 'Các Lambda phân tích phải đọc lại frame từ S3. Băng thông và số lượng GET request chạm trần tài khoản, gây nghẽn và chi phí đội lên gấp nhiều lần.',
      },
    ],
  },
  {
    id: 'monolith',
    titleEn: '2. Consolidated In-Memory Monolith (After)',
    titleVi: '2. Kiến trúc Monolith Trong Bộ Nhớ (Sau khi tái cấu trúc)',
    summaryEn: 'Consolidated into a single Amazon EC2 / ECS process. Video frames pass via fast in-memory shared buffers. 90% cost drop and zero S3 IOPS.',
    summaryVi: 'Hợp nhất thành một tiến trình chạy trên EC2 / ECS. Các frame truyền qua shared memory cực nhanh. Giảm 90% chi phí, xóa bỏ hoàn toàn I/O S3.',
    overallMetricEn: 'S3 Costs: $0 (Eliminated) · Total Cost Reduction: -90% · Latency: Sub-10ms',
    overallMetricVi: 'Chi phí S3: $0 (Triệt tiêu) · Tổng chi phí giảm: -90% · Độ trễ: <10ms',
    nodes: [
      { id: 'video-source', labelEn: 'Live Feed', labelVi: 'Luồng Live', subEn: 'Video Input', subVi: 'Nguồn Video', x: 20, y: 125, width: 115, height: 80, icon: 'video', type: 'source' },
      { id: 'monolith-container', labelEn: 'Amazon EC2 Instance (Single Monolithic Process)', labelVi: 'Máy chủ Amazon EC2 (Tiến trình Monolith duy nhất)', subEn: 'C6i Compute-Optimized', subVi: 'Instance tối ưu tính toán', x: 195, y: 12, width: 705, height: 268, icon: 'server', type: 'default' },
      { id: 'mem-ingest', labelEn: 'Frame Demux', labelVi: 'Bộ nhận Frame', subEn: 'In-Memory Pipe', subVi: 'Ống dẫn RAM', x: 225, y: 125, width: 125, height: 80, icon: 'split', type: 'worker' },
      { id: 'shared-mem', labelEn: 'Shared Memory', labelVi: 'Vùng nhớ chia sẻ', subEn: 'Zero-Copy Buffer', subVi: 'Ring Buffer RAM', x: 470, y: 125, width: 155, height: 80, icon: 'memory', type: 'success' },
      { id: 'detector-video', labelEn: 'Video Detector', labelVi: 'Phân tích Video', subEn: 'Native C++ Thread', subVi: 'Thread C++ đồng thời', x: 735, y: 48, width: 145, height: 80, icon: 'film', type: 'worker' },
      { id: 'detector-audio', labelEn: 'Audio Detector', labelVi: 'Phân tích Audio', subEn: 'Native C++ Thread', subVi: 'Thread C++ đồng thời', x: 735, y: 190, width: 145, height: 80, icon: 'audio', type: 'worker' },
    ],
    edges: [
      { id: 'm1', from: 'video-source', to: 'mem-ingest', labelEn: 'TCP Ingest', labelVi: 'Nhận gói tin TCP', curve: 'straight' },
      { id: 'm2', from: 'mem-ingest', to: 'shared-mem', labelEn: 'RAM Write', labelVi: 'Ghi vào RAM', weight: 'light', curve: 'straight' },
      { id: 'm3', from: 'shared-mem', to: 'detector-video', labelEn: 'Pointer Read', labelVi: 'Đọc con trỏ', weight: 'light', curve: 'curved-up' },
      { id: 'm4', from: 'shared-mem', to: 'detector-audio', labelEn: 'Pointer Read', labelVi: 'Đọc con trỏ', weight: 'light', curve: 'curved-down' },
    ],
    steps: [
      {
        stepIndex: 1,
        activeNodeIds: ['video-source', 'mem-ingest'],
        activeEdgeIds: ['m1'],
        packet: { edgeId: 'm1', labelEn: 'TCP Ingest', labelVi: 'Nhận gói tin TCP' },
        metrics: { latency: '8ms', throughput: '1080p60 Stream', costImpact: '$0 S3 API' },
        badge: { textEn: 'Fast Ingestion', textVi: 'Nhận luồng tốc độ cao', type: 'info' },
        narrativeEn: 'Stream enters the monolithic daemon process running directly on the EC2 host.',
        narrativeVi: 'Luồng video đi trực tiếp vào tiến trình daemon monolith chạy trên máy chủ EC2.',
      },
      {
        stepIndex: 2,
        activeNodeIds: ['mem-ingest', 'shared-mem'],
        activeEdgeIds: ['m2'],
        successNodeId: 'shared-mem',
        successLabelEn: '✓ 0.1ms ZERO-COPY',
        successLabelVi: '✓ 0.1ms DÙNG RAM',
        packet: { edgeId: 'm2', labelEn: 'In-Memory Write', labelVi: 'Ghi vào Ring Buffer' },
        metrics: { latency: '0.12ms', throughput: '12 GB/s RAM Bandwidth', costImpact: '$0 (Zero Disk I/O)' },
        badge: { textEn: 'Zero-Copy RAM', textVi: 'Không tốn I/O', type: 'success' },
        narrativeEn: 'Frames are written straight into a shared memory ring buffer. No HTTP requests, no S3 calls, zero disk roundtrips.',
        narrativeVi: 'Các frame được ghi thẳng vào vùng nhớ chia sẻ (Shared Memory Ring Buffer). Không cần HTTP, không gọi S3, không tốn I/O đĩa.',
      },
      {
        stepIndex: 3,
        activeNodeIds: ['shared-mem', 'detector-video', 'detector-audio'],
        activeEdgeIds: ['m3', 'm4'],
        successNodeId: 'shared-mem',
        successLabelEn: '✓ 90% COST SAVED',
        successLabelVi: '✓ GIẢM 90% CHI PHÍ',
        packet: { edgeId: 'm3', labelEn: 'Thread Read', labelVi: 'Đọc song song qua RAM' },
        metrics: { latency: '2ms', throughput: 'Real-time 60fps', costImpact: '90% Cost Cut' },
        badge: { textEn: 'Parallel Workers', textVi: 'Xử lý song song siêu tốc', type: 'success' },
        narrativeEn: 'Video and audio defect detectors run as concurrent threads in the same process, inspecting memory buffers simultaneously.',
        narrativeVi: 'Các thuật toán phân tích video và âm thanh chạy dưới dạng các luồng đồng thời trong cùng tiến trình, phân tích dữ liệu ngay trên RAM.',
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
        badge: { textEn: 'Read Storm', textVi: 'Cơn bão Đọc', type: 'info' },
        narrativeEn: 'Follower opens their mobile app, triggering a GET /timeline request to the API Gateway.',
        narrativeVi: 'Người dùng mở ứng dụng, kích hoạt yêu cầu GET /timeline tới hệ thống API Gateway.',
      },
      {
        stepIndex: 2,
        activeNodeIds: ['api-gateway', 'sql-db'],
        activeEdgeIds: ['e2'],
        alertNodeId: 'sql-db',
        alertLabelEn: '⚠️ DISK THRASHING',
        alertLabelVi: '⚠️ NGHẼN BỘ NHỚ',
        packet: { edgeId: 'e2', labelEn: 'SQL JOIN', labelVi: 'Nối 3 Bảng SQL' },
        metrics: { latency: '350ms', throughput: 'Queueing lock', costImpact: 'High CPU' },
        badge: { textEn: 'Database Contention', textVi: 'Xung đột Database', type: 'warning' },
        narrativeEn: 'Gateway executes a multi-table JOIN across follows, users, and tweets with ORDER BY timestamp DESC LIMIT 800.',
        narrativeVi: 'Gateway thực thi câu lệnh SQL JOIN đa bảng giữa follows, users và tweets kèm lệnh sắp xếp thời gian trên 800 dòng.',
      },
      {
        stepIndex: 3,
        activeNodeIds: ['sql-db', 'query-engine'],
        activeEdgeIds: ['e3'],
        alertNodeId: 'sql-db',
        alertLabelEn: '🔥 100% CPU CRASH',
        alertLabelVi: '🔥 100% CPU SẬP DB',
        packet: { edgeId: 'e3', labelEn: 'Disk Scan', labelVi: 'Quét đĩa Disk' },
        metrics: { latency: '850ms', throughput: 'IOPS Saturation', costImpact: 'Fail Whale Risk' },
        badge: { textEn: 'Critical Bottleneck', textVi: 'Nghẽn nghiêm trọng', type: 'danger' },
        narrativeEn: 'Database buffer pool thrashes as 300k concurrent read queries compete for memory. Response times degrade into seconds.',
        narrativeVi: 'Bộ nhớ đệm buffer pool bị quá tải vì 300,000 truy vấn đọc đồng thời tranh chấp tài nguyên. Thời gian phản hồi tụt dốc thảm hại.',
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
        badge: { textEn: 'Trigger', textVi: 'Kích hoạt', type: 'info' },
        narrativeEn: 'A celebrity with 30,000,000 followers publishes a single tweet into the message queue.',
        narrativeVi: 'Một tài khoản có hơn 30 triệu người theo dõi đăng một bài viết vào hàng đợi thông điệp.',
      },
      {
        stepIndex: 2,
        activeNodeIds: ['broker-queue', 'fanout-workers'],
        activeEdgeIds: ['e2'],
        alertNodeId: 'broker-queue',
        alertLabelEn: '⚠️ 30M JOBS SURGE',
        alertLabelVi: '⚠️ BÃO 30M JOB',
        packet: { edgeId: 'e2', labelEn: 'Batch Jobs', labelVi: 'Phân rã Job' },
        metrics: { latency: '1,200ms', throughput: 'Queue Lagging', costImpact: 'Worker saturation' },
        badge: { textEn: 'Amplification Storm', textVi: 'Cơn bão Khuếch đại', type: 'warning' },
        narrativeEn: 'Fan-out workers pull the event, query the social graph, and generate 30,000,000 individual timeline insertion tasks.',
        narrativeVi: 'Cụm worker lấy sự kiện, tra cứu đồ thị quan hệ và sinh ra 30,000,000 tác vụ chèn bài viết vào từng timeline riêng lẻ.',
      },
      {
        stepIndex: 3,
        activeNodeIds: ['fanout-workers', 'redis-mailboxes'],
        activeEdgeIds: ['e3'],
        alertNodeId: 'fanout-workers',
        alertLabelEn: '🚨 5+ MIN BACKLOG',
        alertLabelVi: '🚨 TRỄ HÀNG ĐỢI >5P',
        packet: { edgeId: 'e3', labelEn: '30M LPUSH', labelVi: 'Bão ghi 30 triệu lần' },
        metrics: { latency: '5+ Minutes', throughput: 'Redis IOPS Maxed', costImpact: 'Severe Lag' },
        badge: { textEn: 'Celebrity Fanout Penalty', textVi: 'Thảm họa Fan-out', type: 'danger' },
        narrativeEn: 'Workers hammer Redis clusters with millions of writes. Delivery lag spikes to several minutes before followers see the update.',
        narrativeVi: 'Cụm worker làm quá tải Redis với hàng triệu lệnh ghi. Độ trễ hiển thị bài viết tăng lên tới vài phút khiến người theo dõi chờ đợi.',
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
        successLabelEn: '✓ ZERO WRITE FANOUT',
        successLabelVi: '✓ KHÔNG CẦN FANOUT',
        packet: { edgeId: 'e1', labelEn: 'Smart Ingest', labelVi: 'Tiếp nhận thông minh' },
        metrics: { latency: '3ms', throughput: '12,000 tweets/s', costImpact: 'Optimized' },
        badge: { textEn: 'Decoupled Ingestion', textVi: 'Phân luồng độc lập', type: 'info' },
        narrativeEn: 'Regular tweets are quickly pushed to followers. Celebrity tweets are appended to an indexed log without running a 30M-write fan-out.',
        narrativeVi: 'Bài viết của bạn bè được đẩy vào Redis. Bài viết của người nổi tiếng chỉ ghi một lần vào bảng log riêng, tuyệt đối không fan-out 30 triệu lần.',
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
        successLabelEn: '✓ 2ms INSTANT MERGE',
        successLabelVi: '✓ 2ms NỐI RAM TỨC THÌ',
        metrics: { latency: '6ms Total', throughput: '300,000 req/sec', costImpact: 'Minimal RAM' },
        badge: { textEn: 'Blistering Performance', textVi: 'Tốc độ siêu việt', type: 'success' },
        narrativeEn: 'Timeline Merger executes an in-memory sorted array merge in microseconds. The end user enjoys immediate sub-10ms delivery!',
        narrativeVi: 'Bộ hợp nhất ghép và sắp xếp mảng trong RAM chỉ mất vài phần nghìn giây. Người dùng nhìn thấy dòng thời gian tức thì dưới 10 mili-giây!',
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
        <div className="flow-metric-badge">
          <span data-lang-en>{scenario.overallMetricEn}</span>
          <span data-lang-vi>{scenario.overallMetricVi}</span>
        </div>
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
              const ContainerIcon = containerNode.icon ? NODE_ICONS[containerNode.icon] : null;
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
                  {ContainerIcon && (
                    <ContainerIcon
                      x={containerNode.x + 14}
                      y={containerNode.y + 11}
                      size={17}
                      className="flow-container-icon"
                      aria-hidden="true"
                    />
                  )}
                  <text x={containerNode.x + (ContainerIcon ? 38 : 18)} y={containerNode.y + 24} className="flow-container-label">
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
            // 10px monospace label: ~6px per character plus padding.
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
              const NodeIcon = node.icon ? NODE_ICONS[node.icon] : null;
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

                    {/* Pictogram of what this component is (server, database, users...) */}
                    {NodeIcon && (
                      <NodeIcon
                        x={w / 2 - 13}
                        y={9}
                        size={26}
                        strokeWidth={1.75}
                        className="flow-node-icon"
                        aria-hidden="true"
                      />
                    )}

                    {/* Node Main Title */}
                    <text x={w / 2} y={NodeIcon ? 52 : 30} textAnchor="middle" className="flow-node-title">
                      <tspan data-lang-en>{node.labelEn}</tspan>
                      <tspan data-lang-vi>{node.labelVi || node.labelEn}</tspan>
                    </text>

                    {/* Subtitle / Tech stack */}
                    <text x={w / 2} y={NodeIcon ? 68 : 48} textAnchor="middle" className="flow-node-sub">
                      <tspan data-lang-en>{node.subEn}</tspan>
                      <tspan data-lang-vi>{node.subVi || node.subEn}</tspan>
                    </text>
                  </g>

                  {/* Floating Warning / Danger Pill on top-center of Node */}
                  {(isAlertNode || (!currentStep.alertNodeId && isDistress)) && (
                    <g transform={`translate(${w / 2}, -11)`}>
                      <g className="flow-floating-badge danger">
                        <rect x="-80" y="-11" width="160" height="22" rx="11" className="flow-floating-badge-bg danger" />
                        <text x="0" y="4" textAnchor="middle" className="flow-floating-badge-text">
                          <tspan data-lang-en>{currentStep.alertLabelEn || '⚠️ BOTTLENECK'}</tspan>
                          <tspan data-lang-vi>{currentStep.alertLabelVi || '⚠️ ĐIỂM NGHẼN'}</tspan>
                        </text>
                      </g>
                    </g>
                  )}

                  {/* Floating Success Pill on top-center of Node */}
                  {isSuccessNode && (
                    <g transform={`translate(${w / 2}, -11)`}>
                      <g className="flow-floating-badge success">
                        <rect x="-80" y="-11" width="160" height="22" rx="11" className="flow-floating-badge-bg success" />
                        <text x="0" y="4" textAnchor="middle" className="flow-floating-badge-text">
                          <tspan data-lang-en>{currentStep.successLabelEn || '✓ OPTIMIZED'}</tspan>
                          <tspan data-lang-vi>{currentStep.successLabelVi || '✓ TỐI ƯU'}</tspan>
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
                {currentStep.badge.type === 'danger' && <span className="telemetry-icon-siren">🚨</span>}
                {currentStep.badge.type === 'warning' && <span className="telemetry-icon-siren">⚠️</span>}
                {currentStep.badge.type === 'success' && <span className="telemetry-icon-siren">✓</span>}
                <span data-lang-en>{currentStep.badge.textEn}</span>
                <span data-lang-vi>{currentStep.badge.textVi}</span>
              </span>
            )}
            <span className="telemetry-step-id">Stage #{currentStep.stepIndex} of {scenario.steps.length}</span>
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
