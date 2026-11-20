import React, { useState } from 'react';

type ScenarioId = 'raer' | 'mmap' | 'gc';

interface StepData {
  codeLine: number;
  titleEn: string;
  titleVi: string;
  metricA: { labelEn: string; labelVi: string; val: string; bad?: boolean; good?: boolean };
  metricB: { labelEn: string; labelVi: string; val: string; bad?: boolean; good?: boolean };
  metricC: { labelEn: string; labelVi: string; val: string; bad?: boolean; good?: boolean };
  noteEn: string;
  noteVi: string;
}

const SCENARIOS: Record<
  ScenarioId,
  {
    tabEn: string;
    tabVi: string;
    code: string[];
    steps: StepData[];
  }
> = {
  raer: {
    tabEn: '8K JPEG Napkin Math vs RAER',
    tabVi: 'Ước lượng 8K JPEG & RAER',
    code: [
      '// RAER Budget: Latency <= 5s/img, RAM <= 1 GB',
      'raw := disk.ReadSSD("8k.jpg")      // ~4 MB file',
      'pixels := jpeg.Decode(raw)         // ~33M pixels',
      'enhance(pixels)                    // custom filter',
      'out := jpeg.Encode(pixels)         // write RAM -> SSD',
    ],
    steps: [
      {
        codeLine: 0,
        titleEn: 'Define RAER before coding',
        titleVi: 'Chốt RAER trước khi code',
        metricA: { labelEn: 'Target Latency', labelVi: 'Trần Latency', val: '<= 5.0 s / img' },
        metricB: { labelEn: 'RAM Budget', labelVi: 'Trần RAM', val: '<= 1.0 GB' },
        metricC: { labelEn: 'RAER Status', labelVi: 'Trạng thái RAER', val: 'Contract set', good: true },
        noteEn: 'Formalize max acceptable latency and memory on 8K worst-case input so you know when to stop tuning.',
        noteVi: 'Ghi sẵn trần thời gian và RAM trên ảnh 8K xấu nhất để có mốc dừng rõ ràng, không tối ưu vô tận.',
      },
      {
        codeLine: 2,
        titleEn: 'Napkin math: YCbCr estimate vs reality',
        titleVi: 'Ước lượng nháp vs đo Go thật',
        metricA: { labelEn: 'Est. Time (RAM)', labelVi: 'Nhẩm tốc độ', val: '~1.5s (3x safety=5s)' },
        metricB: { labelEn: 'Est. vs Actual RAM', labelVi: 'RAM nhẩm vs thật', val: '755 MB vs 226 MB', good: true },
        metricC: { labelEn: 'Measured dec+enc', labelVi: 'Đo thực tế', val: '1.56 s / op', good: true },
        noteEn: 'Reference benchmark (DecEnc-12): 1.56s & 226 MB (chroma subsampling saves 3x RAM!). Within 5s RAER — no optimization needed!',
        noteVi: 'Số đo thật (DecEnc-12): 1,56s và 226 MB (nhẹ hơn 3 lần do nén sắc độ). Đạt chuẩn RAER <= 5s → khỏi tốn công tối ưu thêm!',
      },
      {
        codeLine: 4,
        titleEn: 'Multiply by N images? Re-check RAER',
        titleVi: 'Xử lý lô 10 ảnh song song?',
        metricA: { labelEn: '10 images serial', labelVi: 'Chạy tuần tự 10 ảnh', val: '15.6 s (ok if <50s)' },
        metricB: { labelEn: 'Concurrent 4 workers', labelVi: 'Mở 4 worker song song', val: '~4.1 s · 904 MB', good: true },
        metricC: { labelEn: 'At 6 concurrent workers', labelVi: 'Mở lố 6 worker', val: '1.35 GB (OVER 1GB!)', bad: true },
        noteEn: 'Because RAER caps RAM at 1 GB, capped 4 workers finishes 10 images faster without breaching memory limits.',
        noteVi: 'Vì RAER khóa RAM <= 1 GB, giới hạn 4 worker giữ RAM ở ~904 MB thay vì tràn qua 1,35 GB.',
      },
    ],
  },
  mmap: {
    tabEn: 'Virtual VSS vs Physical RSS',
    tabVi: 'Bộ nhớ ảo VSS vs RAM thật RSS',
    code: [
      'b, _ := syscall.Mmap(-1, 0, 256<<20, PROT_RW, MAP_ANON)',
      '// Page fault only triggers on first write/read to 4 KiB page',
      'for i := 0; i < 32<<20; i += 4096 {',
      '    b[i] = 1 // touches 8,192 pages (32 MiB)',
      '}',
    ],
    steps: [
      {
        codeLine: 0,
        titleEn: 'After 256 MiB mmap() syscall',
        titleVi: 'Ngay sau khi xin mmap(256 MiB)',
        metricA: { labelEn: 'Virtual Size (VSS)', labelVi: 'Bộ nhớ ảo (VSS)', val: '256.0 MiB' },
        metricB: { labelEn: 'Physical RAM (RSS)', labelVi: 'RAM thật (RSS)', val: '5.4 MiB (+0.1)', good: true },
        metricC: { labelEn: 'Page Faults', labelVi: 'Số lần Page Fault', val: '0' },
        noteEn: 'Measured via Go + Getrusage on Apple M2: OS promises 256 MiB virtual addresses without spending physical DRAM yet!',
        noteVi: 'Đo thực tế trên Apple M2: OS mới cấp địa chỉ ảo 256 MiB chứ chưa tốn chút RAM vật lý nào (+0,1 MiB RSS).',
      },
      {
        codeLine: 3,
        titleEn: 'After writing to first 32 MiB pages',
        titleVi: 'Sau khi ghi vào 32 MiB trang đầu',
        metricA: { labelEn: 'Virtual Size (VSS)', labelVi: 'Bộ nhớ ảo (VSS)', val: '256.0 MiB' },
        metricB: { labelEn: 'Physical RAM (RSS)', labelVi: 'RAM thật (RSS)', val: '37.4 MiB (+32.0)', good: true },
        metricC: { labelEn: 'Unused 224 MiB tail', labelVi: '224 MiB chưa chạm', val: '0 B DRAM used' },
        noteEn: 'Kernel maps physical 4 KiB frames lazily per page fault (~32 MiB increase). Never debug leaks using VSS!',
        noteVi: 'Kernel cấp RAM thật theo từng trang 4 KiB khi code đụng vào (RSS tăng đúng +32 MiB). Đừng nhìn VSS để tìm memory leak!',
      },
      {
        codeLine: 4,
        titleEn: 'Container RSS trap under low pressure',
        titleVi: 'Bẫy đọc nhầm RSS khi máy rảnh',
        metricA: { labelEn: 'After free() + GC', labelVi: 'Sau khi GC thu hồi', val: 'HeapAlloc = 0.2 MiB' },
        metricB: { labelEn: 'Linux MADV_FREE RSS', labelVi: 'RSS khi dùng MADV_FREE', val: 'Stays 37 MiB!', bad: true },
        metricC: { labelEn: 'Go default MADV_DONTNEED', labelVi: 'Mặc định MADV_DONTNEED', val: 'Drops immediately', good: true },
        noteEn: 'Go defaults to MADV_DONTNEED so Linux reclaims freed pages immediately, preventing false container RSS alerts.',
        noteVi: 'Go dùng mặc định MADV_DONTNEED để Linux hạ ngay chỉ số RSS sau GC, tránh báo OOM giả trong Kubernetes.',
      },
    ],
  },
  gc: {
    tabEn: 'GOGC vs GOMEMLIMIT Thrashing',
    tabVi: 'Nhịp GC: GOGC vs GOMEMLIMIT',
    code: [
      '// Default: GOGC=100, GOMEMLIMIT=unset',
      'debug.SetGCPercent(100)       // GC when heap doubles',
      'debug.SetMemoryLimit(512<<20) // Go 1.19+ soft cap',
      '// Trap: liveHeap stays at 490 MiB -> GC runs nonstop!',
    ],
    steps: [
      {
        codeLine: 1,
        titleEn: 'Steady load with GOGC=100 only',
        titleVi: 'Tải ổn định với GOGC=100 mặc định',
        metricA: { labelEn: 'Live Heap', labelVi: 'Heap đang sống', val: '200 MiB' },
        metricB: { labelEn: 'Next GC Target', labelVi: 'Ngưỡng kích GC', val: '400 MiB (2x)' },
        metricC: { labelEn: 'GC CPU Share', labelVi: '% CPU cho GC', val: '~3% (Healthy)', good: true },
        noteEn: 'Go triggers GC once heap grows 100% over live data after the previous cycle, keeping GC overhead low.',
        noteVi: 'Go đợi heap tăng gấp đôi lượng dữ liệu sống rồi mới quét GC, giữ chi phí CPU cho GC thấp (~3%).',
      },
      {
        codeLine: 2,
        titleEn: 'Memory spike nears container OOM',
        titleVi: 'Đỉnh tải tiệm cận trần 512 MiB',
        metricA: { labelEn: 'Container Limit', labelVi: 'Trần container', val: '512 MiB' },
        metricB: { labelEn: 'GOMEMLIMIT=460MiB', labelVi: 'Đặt trần mềm 460MiB', val: 'Runs extra GC early', good: true },
        metricC: { labelEn: 'Outcome on spike', labelVi: 'Kết quả khi quá tải', val: 'Avoids OOMKill!', good: true },
        noteEn: 'With headroom available, GOMEMLIMIT triggers earlier GC sweeps before Kubernetes kills the pod.',
        noteVi: 'Khi còn khoảng trống bộ nhớ, GOMEMLIMIT giúp GC dọn sớm hơn một nhịp để pod không bị Kubernetes giết OOMKill.',
      },
      {
        codeLine: 3,
        titleEn: 'Soft-limit thrashing trap!',
        titleVi: 'Bẫy GC quay điên cuồng khi thiếu RAM',
        metricA: { labelEn: 'Live Heap (unfreed)', labelVi: 'Dữ liệu sống thật', val: '490 MiB > 460 MiB', bad: true },
        metricB: { labelEn: 'GC Frequency', labelVi: 'Nhịp chạy GC', val: 'Back-to-back cycles', bad: true },
        metricC: { labelEn: 'CPU lost to GC', labelVi: 'CPU bị GC ăn mất', val: '~25%+ latency spike', bad: true },
        noteEn: 'GOMEMLIMIT is SOFT! If actual live objects exceed the limit, GC thrashes up to ~25% CPU constantly. Reduce allocations first!',
        noteVi: 'GOMEMLIMIT là trần MỀM! Nếu dữ liệu sống thật đã vượt trần, GC sẽ quay liên tục ngốn ~25% CPU. Cách cứu duy nhất là giảm allocation trong code!',
      },
    ],
  },
};

export default function GoEffNapkinRaerDemo() {
  const [scenario, setScenario] = useState<ScenarioId>('raer');
  const [stepIdx, setStepIdx] = useState<number>(0);

  const cur = SCENARIOS[scenario];
  const st = cur.steps[stepIdx];

  return (
    <div className="sd geff">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Scenario</span>
            <span data-lang-vi>Tình huống</span>
          </span>
          {(Object.keys(SCENARIOS) as ScenarioId[]).map((id) => (
            <button
              key={id}
              type="button"
              className={scenario === id ? 'sd-btn is-on' : 'sd-btn'}
              onClick={() => {
                setScenario(id);
                setStepIdx(0);
              }}
            >
              <span data-lang-en>{SCENARIOS[id].tabEn}</span>
              <span data-lang-vi>{SCENARIOS[id].tabVi}</span>
            </button>
          ))}
        </div>

        <div className="sd-group sd-run">
          <button type="button" className="sd-btn" disabled={stepIdx === 0} onClick={() => setStepIdx((s) => Math.max(0, s - 1))}>
            <span data-lang-en>Prev</span>
            <span data-lang-vi>Lùi</span>
          </button>
          <button
            type="button"
            className="sd-btn is-on"
            disabled={stepIdx >= cur.steps.length - 1}
            onClick={() => setStepIdx((s) => Math.min(cur.steps.length - 1, s + 1))}
          >
            <span data-lang-en>Next ({stepIdx + 1}/{cur.steps.length})</span>
            <span data-lang-vi>Bước tiếp ({stepIdx + 1}/{cur.steps.length})</span>
          </button>
        </div>
      </div>

      <div className="geff-grid">
        <div className="geff-pane">
          <div className="geff-hdr">
            <span data-lang-en>Go Workload Sketch</span>
            <span data-lang-vi>Code minh họa theo tình huống</span>
          </div>
          <div className="geff-code">
            {cur.code.map((line, i) => (
              <div key={i} className={`geff-line ${i === st.codeLine ? 'is-active' : ''}`}>
                <span className="geff-ln">{i === st.codeLine ? '▶' : `L${i + 1}`}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="geff-pane">
          <div className="geff-hdr">
            <span data-lang-en>Step {stepIdx + 1}: {st.titleEn}</span>
            <span data-lang-vi>Bước {stepIdx + 1}: {st.titleVi}</span>
          </div>
          <div className="geff-note">
            <span data-lang-en>{st.noteEn}</span>
            <span data-lang-vi>{st.noteVi}</span>
          </div>
        </div>
      </div>

      <div className="sd-stats">
        {[st.metricA, st.metricB, st.metricC].map((m, idx) => (
          <div key={idx} className={`sd-stat ${m.good ? 'is-good' : ''} ${m.bad ? 'is-bad' : ''}`}>
            <b>{m.val}</b>
            <span>
              <span data-lang-en>{m.labelEn}</span>
              <span data-lang-vi>{m.labelVi}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
