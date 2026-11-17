import React, { useState, useEffect, useRef } from 'react';

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
  type?: 'default' | 'source' | 'storage' | 'bottleneck' | 'worker' | 'success';
}

export interface FlowEdge {
  id: string;
  from: string;
  to: string;
  labelEn?: string;
  labelVi?: string;
  style?: 'solid' | 'dashed' | 'bottleneck';
  curve?: 'straight' | 'curved-up' | 'curved-down' | 'vertical';
}

export interface FlowStep {
  stepIndex: number;
  activeNodeIds: string[];
  activeEdgeIds: string[];
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
      { id: 'video-source', labelEn: 'Live Feed', labelVi: 'Luồng Live', subEn: 'Video Input', subVi: 'Nguồn Video', x: 20, y: 110, width: 115, height: 62, type: 'source' },
      { id: 'converter', labelEn: 'Chunk Splitter', labelVi: 'Bộ chia Frame', subEn: 'Lambda Chunker', subVi: 'Lambda chia nhỏ', x: 235, y: 110, width: 130, height: 62, type: 'worker' },
      { id: 's3-bucket', labelEn: 'Amazon S3', labelVi: 'Amazon S3', subEn: 'S3 Transit (Bottleneck)', subVi: 'Lưu tạm S3 (Nút nghẽn)', x: 475, y: 110, width: 165, height: 62, type: 'bottleneck' },
      { id: 'step-fn', labelEn: 'Step Functions', labelVi: 'Step Functions', subEn: 'State Machine & Poller', subVi: 'Máy trạng thái điều phối', x: 475, y: 15, width: 165, height: 54, type: 'default' },
      { id: 'defect-detector', labelEn: 'Defect Detector', labelVi: 'Bắt lỗi Video/Audio', subEn: 'Micro-Lambdas', subVi: 'Cụm Lambda phân tích', x: 745, y: 110, width: 145, height: 62, type: 'worker' },
    ],
    edges: [
      { id: 'e1', from: 'video-source', to: 'converter', labelEn: 'Raw Stream', labelVi: 'Stream Gốc', curve: 'straight' },
      { id: 'e2', from: 'converter', to: 's3-bucket', labelEn: 'PUTs/sec', labelVi: 'Ghi PUT/s', style: 'bottleneck', curve: 'straight' },
      { id: 'e3', from: 'step-fn', to: 's3-bucket', labelEn: 'Sync State', labelVi: 'Đồng bộ State', style: 'dashed', curve: 'vertical' },
      { id: 'e4', from: 's3-bucket', to: 'defect-detector', labelEn: 'GETs/sec', labelVi: 'Đọc GET/s', style: 'bottleneck', curve: 'straight' },
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
      { id: 'video-source', labelEn: 'Live Feed', labelVi: 'Luồng Live', subEn: 'Video Input', subVi: 'Nguồn Video', x: 20, y: 110, width: 115, height: 62, type: 'source' },
      { id: 'monolith-container', labelEn: 'Amazon EC2 Instance (Single Monolithic Process)', labelVi: 'Máy chủ Amazon EC2 (Tiến trình Monolith duy nhất)', subEn: 'C6i Compute-Optimized', subVi: 'Instance tối ưu tính toán', x: 195, y: 15, width: 705, height: 230, type: 'default' },
      { id: 'mem-ingest', labelEn: 'Frame Demux', labelVi: 'Bộ nhận Frame', subEn: 'In-Memory Pipe', subVi: 'Ống dẫn RAM', x: 225, y: 105, width: 125, height: 62, type: 'worker' },
      { id: 'shared-mem', labelEn: 'Shared Memory', labelVi: 'Vùng nhớ chia sẻ', subEn: 'Zero-Copy Buffer', subVi: 'Ring Buffer RAM', x: 470, y: 105, width: 155, height: 62, type: 'success' },
      { id: 'detector-video', labelEn: 'Video Detector', labelVi: 'Phân tích Video', subEn: 'Native C++ Thread', subVi: 'Thread C++ đồng thời', x: 735, y: 55, width: 145, height: 56, type: 'worker' },
      { id: 'detector-audio', labelEn: 'Audio Detector', labelVi: 'Phân tích Audio', subEn: 'Native C++ Thread', subVi: 'Thread C++ đồng thời', x: 735, y: 155, width: 145, height: 56, type: 'worker' },
    ],
    edges: [
      { id: 'm1', from: 'video-source', to: 'mem-ingest', labelEn: 'TCP Ingest', labelVi: 'Nhận gói tin TCP', curve: 'straight' },
      { id: 'm2', from: 'mem-ingest', to: 'shared-mem', labelEn: 'RAM Write', labelVi: 'Ghi vào RAM', curve: 'straight' },
      { id: 'm3', from: 'shared-mem', to: 'detector-video', labelEn: 'Pointer Read', labelVi: 'Đọc con trỏ', curve: 'curved-up' },
      { id: 'm4', from: 'shared-mem', to: 'detector-audio', labelEn: 'Pointer Read', labelVi: 'Đọc con trỏ', curve: 'curved-down' },
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
        packet: { edgeId: 'm3', labelEn: 'Thread Read', labelVi: 'Đọc song song qua RAM' },
        metrics: { latency: '2ms', throughput: 'Real-time 60fps', costImpact: '90% Cost Cut' },
        badge: { textEn: 'Parallel Workers', textVi: 'Xử lý song song siêu tốc', type: 'success' },
        narrativeEn: 'Video and audio defect detectors run as concurrent threads in the same process, inspecting memory buffers simultaneously.',
        narrativeVi: 'Các thuật toán phân tích video và âm thanh chạy dưới dạng các luồng đồng thời trong cùng tiến trình, phân tích dữ liệu ngay trên RAM.',
      },
    ],
  },
];

interface AnimatedFlowProps {
  preset?: 'prime-video';
  title?: string;
  titleVi?: string;
}

export default function AnimatedFlow({
  preset = 'prime-video',
  title = 'Interactive Architecture Flow Simulator',
  titleVi = 'Mô phỏng Luồng Kiến trúc Động',
}: AnimatedFlowProps) {
  const scenarios = PRIME_VIDEO_SCENARIOS;
  const [activeScenarioId, setActiveScenarioId] = useState<string>(scenarios[0].id);
  const scenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];

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
    const h = node.height || 62;
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
          <div className="flow-status-pill">
            <span className={`flow-pulse-dot ${isPlaying ? 'is-active' : ''}`} />
            <span data-lang-en>{isPlaying ? 'LIVE SIMULATION' : 'PAUSED'}</span>
            <span data-lang-vi>{isPlaying ? 'MÔ PHỎNG ĐANG CHẠY' : 'TẠM DỪNG'}</span>
          </div>
          <h3 className="flow-title">
            <span data-lang-en>{title}</span>
            <span data-lang-vi>{titleVi}</span>
          </h3>
        </div>

        {/* Scenarios (Trade-off Comparison) */}
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
          viewBox="0 0 920 260"
          className="flow-svg-canvas"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Animated system design data flow"
        >
          <defs>
            {/* Filter for glowing packet */}
            <filter id="packet-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Arrowhead markers */}
            <marker id="flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--border-strong, #888)" />
            </marker>
            <marker id="flow-arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--red, #e05244)" />
            </marker>
          </defs>

          {/* Render Background Outer Containers (e.g. EC2 Host) */}
          {scenario.nodes
            .filter((n) => n.width && n.height && n.width > 200)
            .map((containerNode) => (
              <g key={containerNode.id} className="flow-outer-container">
                <rect
                  x={containerNode.x}
                  y={containerNode.y}
                  width={containerNode.width}
                  height={containerNode.height}
                  rx="14"
                  className="flow-container-rect"
                />
                <text x={containerNode.x + 18} y={containerNode.y + 24} className="flow-container-label">
                  {containerNode.labelEn}
                </text>
              </g>
            ))}

          {/* Render Edges (Connecting Pipes) */}
          {scenario.edges.map((edge) => {
            const from = getNodeBounds(edge.from);
            const to = getNodeBounds(edge.to);
            const isEdgeActive = currentStep.activeEdgeIds.includes(edge.id);

            let startX = from.right;
            let startY = from.midY;
            let endX = to.left;
            let endY = to.midY;

            let pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
            let labelX = (startX + endX) / 2;
            let labelY = startY - 9;

            if (edge.curve === 'vertical') {
              startX = from.midX;
              startY = from.bottom;
              endX = to.midX;
              endY = to.top;
              pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
              labelX = startX + 44;
              labelY = (startY + endY) / 2 + 3;
            } else if (edge.curve === 'curved-up') {
              pathD = `M ${startX} ${startY} C ${startX + 40} ${startY - 18}, ${endX - 40} ${endY + 10}, ${endX} ${endY}`;
              labelX = (startX + endX) / 2;
              labelY = (startY + endY) / 2 - 12;
            } else if (edge.curve === 'curved-down') {
              pathD = `M ${startX} ${startY} C ${startX + 40} ${startY + 18}, ${endX - 40} ${endY - 10}, ${endX} ${endY}`;
              labelX = (startX + endX) / 2;
              labelY = (startY + endY) / 2 + 18;
            }

            const labelText = edge.labelEn || '';
            const pillWidth = Math.max(labelText.length * 6.8 + 12, 54);

            return (
              <g key={edge.id} className={`flow-edge-group ${isEdgeActive ? 'is-active' : ''}`}>
                {/* Background pipe */}
                <path
                  d={pathD}
                  fill="none"
                  className="flow-edge-bg"
                  markerEnd={isEdgeActive ? 'url(#flow-arrow-active)' : 'url(#flow-arrow)'}
                />

                {/* Animated active packet stream */}
                {isEdgeActive && (
                  <>
                    <path
                      d={pathD}
                      fill="none"
                      className={`flow-edge-active ${edge.style === 'bottleneck' ? 'is-bottleneck' : ''}`}
                    />
                    {/* Animated Travelling Particle along path */}
                    <circle r="5" className="flow-packet-particle" filter="url(#packet-glow)">
                      <animateMotion
                        path={pathD}
                        dur={playbackSpeed === 2 ? '0.7s' : playbackSpeed === 1.5 ? '0.9s' : '1.3s'}
                        repeatCount="indefinite"
                      />
                    </circle>
                  </>
                )}

                {/* Masked Edge Label Badge (Prevents colliding onto lines or adjacent boxes) */}
                {labelText && (
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
                      {labelText}
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
              const w = node.width || 135;
              const h = node.height || 62;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className={`flow-node-group ${isActive ? 'is-active' : ''} type-${node.type || 'default'}`}
                >
                  {/* Glowing Pulse Ring for Active Node */}
                  {isActive && (
                    <rect
                      x="-4"
                      y="-4"
                      width={w + 8}
                      height={h + 8}
                      rx="12"
                      className="flow-node-glow-ring"
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

                  {/* Status Indicator Icon / Dot */}
                  <circle
                    cx="15"
                    cy="18"
                    r="4.5"
                    className={`flow-node-status-dot ${isActive ? 'is-active' : ''}`}
                  />

                  {/* Node Main Title */}
                  <text x="26" y="22" className="flow-node-title">
                    {node.labelEn}
                  </text>

                  {/* Subtitle / Tech stack */}
                  <text x="14" y="44" className="flow-node-sub">
                    {node.subEn}
                  </text>
                </g>
              );
            })}
        </svg>
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
      <div className="flow-telemetry-box">
        <div className="telemetry-header">
          <div className="telemetry-badge-container">
            {currentStep.badge && (
              <span className={`telemetry-badge type-${currentStep.badge.type}`}>
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
