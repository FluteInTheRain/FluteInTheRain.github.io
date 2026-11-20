import React, { useState } from 'react';

interface Milestone {
  id: string;
  label: string;
  nsPerLine: number;
  ramBytesLabel: string;
  ramPct: number;
  passLatency: boolean;
  passMem: boolean;
  code: string[];
  lessonEn: string;
  lessonVi: string;
}

const MILESTONES: Milestone[] = [
  {
    id: 'sum1',
    label: 'Sum1 (bytes.Split)',
    nsPerLine: 30.0,
    ramBytesLabel: '6.20 MB',
    ramPct: 100,
    passLatency: false,
    passMem: false,
    code: [
      'b, _ := os.ReadFile(fileName) // loads whole file',
      'for _, line := range bytes.Split(b, []byte("\\n")) {',
      '  num, _ := strconv.ParseInt(string(line), 10, 64)',
      '  ret += num',
      '}',
    ],
    lessonEn: 'Baseline: bytes.Split allocates huge [][]byte slices, plus string(line) copies every integer line.',
    lessonVi: 'Mốc ban đầu: bytes.Split đẻ ra mảng 2 chiều [][]byte khổng lồ, còn string(line) copy từng dòng lên Heap.',
  },
  {
    id: 'sum2',
    label: 'Sum2 (In-place \\n)',
    nsPerLine: 29.6,
    ramBytesLabel: '1.40 MB',
    ramPct: 24,
    passLatency: false,
    passMem: false,
    code: [
      'var last int',
      'for i := 0; i < len(b); i++ {',
      '  if b[i] != \'\\n\' { continue }',
      '  num, _ := strconv.ParseInt(string(b[last:i]), 10, 64)',
      '  ret += num; last = i + 1',
      '}',
    ],
    lessonEn: 'Cutting bytes.Split removes 77% of heap allocations immediately (-4.8 MB on 200k lines); next bottleneck is string().',
    lessonVi: 'Bỏ bytes.Split giảm ngay 77% cấp phát Heap (-4,8 MB trên 200k dòng). Nút thắt kế tiếp lộ ra: string(b[last:i]).',
  },
  {
    id: 'sum3',
    label: 'Sum3 (unsafe zero-copy)',
    nsPerLine: 23.8,
    ramBytesLabel: '1.40 MB',
    ramPct: 23,
    passLatency: false,
    passMem: false,
    code: [
      '// Go 1.20+ safe idiomatic zero-copy slice -> string:',
      'func zeroCopyStr(b []byte) string {',
      '  return unsafe.String(unsafe.SliceData(b), len(b))',
      '}',
      'num, _ := strconv.ParseInt(zeroCopyStr(b[last:i]), 10, 64)',
    ],
    lessonEn: 'Stops per-line string copies cleanly (19% faster on M2), but runtime.ReadFile still eats O(N) RAM and generic ParseInt dominates CPU.',
    lessonVi: 'Hết hẳn copy chuỗi từng dòng, nhanh hơn ~20%, nhưng os.ReadFile vẫn ôm nguyên file trên RAM và strconv.ParseInt chiếm CPU.',
  },
  {
    id: 'sum4',
    label: 'Sum4 (Custom ParseInt)',
    nsPerLine: 15.2,
    ramBytesLabel: '1.40 MB',
    ramPct: 23,
    passLatency: true,
    passMem: false,
    code: [
      'func parseIntBytes(in []byte) (int64, error) { // no unsafe!',
      '  // Parses ASCII digits directly in base 10 without string conversion',
      '}',
      'num, _ := parseIntBytes(b[last:i]) // 2x faster than bytes.Split',
    ],
    lessonEn: 'Deliberate tailored base-10 byte parser is faster AND eliminates unsafe completely! Only O(N) ReadFile memory left to fix.',
    lessonVi: 'Tự viết ParseInt trên []byte vừa nhanh gấp đôi lúc đầu vừa bỏ luôn được unsafe! Giờ chỉ còn xử lý nốt phần RAM của os.ReadFile.',
  },
  {
    id: 'sum6',
    label: 'Sum6 (8 KB Stream)',
    nsPerLine: 14.3,
    ramBytesLabel: '216 B heap',
    ramPct: 2,
    passLatency: true,
    passMem: true,
    code: [
      'buf := make([]byte, 8*1024) // stays bounded regardless of file GB!',
      'n, err = f.Read(buf[offset:])',
      '// parse complete lines in buf[:n] ...',
      'offset = n - last; copy(buf, buf[last:n]) // carry split digits',
    ],
    lessonEn: 'Measured with benchstat on M2: -99.98% Heap allocations vs Sum4 while beating bufio.Scanner speed cleanly!',
    lessonVi: 'Đo trên Apple M2: giảm 99,98% cấp phát Heap so với Sum4 và nhanh hơn hẳn bufio.Scanner, file 1 GB cũng chỉ tốn vài KB!',
  },
  {
    id: 'conc_chan',
    label: 'Workers + Chan (Trap!)',
    nsPerLine: 206.7,
    ramBytesLabel: '1.61 MB (200k allocs)',
    ramPct: 50,
    passLatency: false,
    passMem: false,
    code: [
      'for sc.Scan() {',
      '  cp := append([]byte(nil), sc.Bytes()...) // 200k allocs!',
      '  ch <- cp // goroutines stall locking runtime.chansend!',
      '}',
    ],
    lessonEn: '14x SLOWER than sequential Sum6! Tiny ~10 ns work sent one line per channel item spends 95% CPU on channel mutex locks.',
    lessonVi: 'CHẬM HƠN 14 LẦN bản 1 luồng! Việc tính tổng quá nhỏ mà đẩy từng dòng qua channel khiến mọi nhân CPU kẹt cứng ở khóa channel.',
  },
  {
    id: 'conc_shard',
    label: 'Sharded SectionReader',
    nsPerLine: 3.6,
    ramBytesLabel: '33.7 KB (21 allocs)',
    ramPct: 6,
    passLatency: true,
    passMem: true,
    code: [
      'begin, end := shardedRangeAt(workerID, 4, size, f)',
      'sr := io.NewSectionReader(f, begin, end-begin)',
      '// Each worker streams its own byte shard with zero sharing -> 1 send!',
    ],
    lessonEn: '4x faster than sequential Sum6 on Apple M2! Each worker reads & sums its file chunk independently using its own 8 KB buffer.',
    lessonVi: 'Nhanh gấp 4 lần bản tuần tự Sum6 trên Apple M2! Mỗi worker tự đọc và cộng phần file của mình bằng buf 8 KB riêng, không tranh chấp khóa.',
  },
];

export default function GoEffSumEvolutionDemo() {
  const [idx, setIdx] = useState<number>(0);
  const m = MILESTONES[idx];
  const barPct = Math.min(100, Math.round((m.nsPerLine / 40) * 100));

  return (
    <div className="sd geff">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Iteration</span>
            <span data-lang-vi>Phiên bản tối ưu</span>
          </span>
          {MILESTONES.map((item, i) => (
            <button key={item.id} type="button" className={idx === i ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setIdx(i)}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="sd-group sd-run">
          <button type="button" className="sd-btn" disabled={idx === 0} onClick={() => setIdx((s) => Math.max(0, s - 1))}>
            <span data-lang-en>Prev</span>
            <span data-lang-vi>Trước</span>
          </button>
          <button type="button" className="sd-btn is-on" disabled={idx >= MILESTONES.length - 1} onClick={() => setIdx((s) => Math.min(MILESTONES.length - 1, s + 1))}>
            <span data-lang-en>Next ({idx + 1}/{MILESTONES.length})</span>
            <span data-lang-vi>Bước sau ({idx + 1}/{MILESTONES.length})</span>
          </button>
        </div>
      </div>

      <div className="geff-grid">
        <div className="geff-pane">
          <div className="geff-hdr">
            <span data-lang-en>{m.label} — Key Change</span>
            <span data-lang-vi>{m.label} — Điểm thay đổi chính</span>
          </div>
          <div className="geff-code">
            {m.code.map((line, i) => (
              <div key={i} className="geff-line">
                <span className="geff-ln">{`L${i + 1}`}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="geff-pane">
          <div className="geff-hdr">
            <span data-lang-en>Apple M2 Go 1.27 Measurement (200k lines)</span>
            <span data-lang-vi>Số đo thật trên Apple M2 Go 1.27 (200k dòng)</span>
          </div>
          <div className="geff-bars">
            <div className="geff-bar-row">
              <div className="geff-bar-top">
                <span>
                  <span data-lang-en>Latency / line</span>
                  <span data-lang-vi>Độ trễ / dòng</span>
                </span>
                <b>{m.nsPerLine.toFixed(1)} ns/line</b>
              </div>
              <div className="geff-track">
                <div className={`geff-fill ${m.passLatency ? 'is-ok' : 'is-bad'}`} style={{ width: `${barPct}%` }} />
              </div>
            </div>

            <div className="geff-bar-row">
              <div className="geff-bar-top">
                <span>
                  <span data-lang-en>Heap per op</span>
                  <span data-lang-vi>Heap mỗi lượt</span>
                </span>
                <b>{m.ramBytesLabel}</b>
              </div>
              <div className="geff-track">
                <div className={`geff-fill ${m.passMem ? 'is-ok' : 'is-bad'}`} style={{ width: `${m.ramPct}%` }} />
              </div>
            </div>

            <p className="geff-verdict">
              <span data-lang-en>{m.lessonEn}</span>
              <span data-lang-vi>{m.lessonVi}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="sd-stats">
        <div className={`sd-stat ${m.passLatency ? 'is-good' : 'is-bad'}`}>
          <b>{m.nsPerLine.toFixed(1)} ns/line</b>
          <span>
            <span data-lang-en>Throughput pace</span>
            <span data-lang-vi>Tốc độ xử lý</span>
          </span>
        </div>
        <div className={`sd-stat ${m.passMem ? 'is-good' : 'is-bad'}`}>
          <b>{m.ramBytesLabel}</b>
          <span>
            <span data-lang-en>Heap footprint</span>
            <span data-lang-vi>Dung lượng Heap</span>
          </span>
        </div>
      </div>
    </div>
  );
}
