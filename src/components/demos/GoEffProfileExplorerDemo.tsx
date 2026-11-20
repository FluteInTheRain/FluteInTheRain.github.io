import React, { useState } from 'react';

type ProfileType = 'cpu' | 'fgprof' | 'alloc_space' | 'inuse_space';

interface StackFrame {
  fn: string;
  depth: number;
  widthPct: number;
  flat: string;
  cum: string;
  hot?: boolean;
  hintEn: string;
  hintVi: string;
  fixEn: string;
  fixVi: string;
}

const PROFILES: Record<
  ProfileType,
  {
    tabEn: string;
    tabVi: string;
    cmd: string;
    frames: StackFrame[];
  }
> = {
  cpu: {
    tabEn: 'CPU Profile (On-CPU)',
    tabVi: 'CPU Profile (Chỉ khi chạy trên nhân)',
    cmd: 'go tool pprof -http=:8081 cpu.pprof',
    frames: [
      {
        fn: 'effgobench.Sum1_BytesSplit',
        depth: 0,
        widthPct: 100,
        flat: '3.15%',
        cum: '94.06%',
        hintEn: 'Parent wrapper orchestrating I/O + line splitting + parsing.',
        hintVi: 'Hàm cha điều phối đọc file, tách dòng và parse số.',
        fixEn: 'Click child frames below to see the exposed bottleneck rooftops.',
        fixVi: 'Bấm vào các thanh tầng dưới để tìm đúng hàm đang đốt CPU trực tiếp.',
      },
      {
        fn: 'internal/strconv.ParseInt -> ParseUint',
        depth: 1,
        widthPct: 50,
        flat: '39.51%',
        cum: '50.35%',
        hot: true,
        hintEn: 'Generic base-N checks & []byte->string copies dominate CPU when lines are small ints.',
        hintVi: 'Kiểm tra hệ cơ số tổng quát & ép chuỗi copy byte ngốn tới nửa CPU.',
        fixEn: 'Write custom ParseInt([]byte) for base-10 integers → cuts CPU cost sharply.',
        fixVi: 'Viết hàm ParseInt([]byte) đọc trực tiếp mảng byte cho số thập phân.',
      },
      {
        fn: 'bytes.Split -> bytes.genSplit',
        depth: 2,
        widthPct: 17,
        flat: '2.45%',
        cum: '16.43%',
        hot: true,
        hintEn: 'Scans twice to pre-allocate [][]byte across 200,000 lines.',
        hintVi: 'Duyệt 2 lần và cấp phát slice hai chiều [][]byte cho mọi dòng.',
        fixEn: 'Replace bytes.Split with an in-place for loop scanning \\n offsets.',
        fixVi: 'Thay bytes.Split bằng vòng for tự tìm dấu \\n trực tiếp.',
      },
      {
        fn: 'os.OpenFile / syscall (only 15% of On-CPU)',
        depth: 3,
        widthPct: 16,
        flat: '0.00%',
        cum: '15.73%',
        hintEn: 'Standard CPU profile only counts time while CPU threads execute syscall wrappers — blind to disk wait!',
        hintVi: 'CPU profile chuẩn chỉ thấy phần mở file nhỏ xíu, không thấy lúc goroutine ngủ chờ đĩa.',
        fixEn: 'Switch to fgprof tab to inspect Off-CPU disk/lock waiting time.',
        fixVi: 'Chuyển sang tab fgprof để xem toàn bộ thời gian chờ thực tế.',
      },
    ],
  },
  fgprof: {
    tabEn: 'fgprof (On-CPU + Off-CPU)',
    tabVi: 'fgprof (Cả chạy CPU lẫn lúc đứng chờ)',
    cmd: 'curl :6060/debug/fgprof?seconds=30 > fgprof.pprof',
    frames: [
      {
        fn: 'effgobench.ConcurrentSum3 (goroutine wall clock)',
        depth: 0,
        widthPct: 100,
        flat: '1.20%',
        cum: '100%',
        hintEn: 'Measures full wall-clock goroutine states (both Running on CPU and Waiting on I/O or Mutex).',
        hintVi: 'Đo toàn bộ trạng thái goroutine theo đồng hồ thật (Running + Blocked I/O/Mutex).',
        fixEn: 'Click frames below to see hidden waiting bottlenecks.',
        fixVi: 'Bấm các tầng dưới để thấy phần thời gian chết bị CPU profiler giấu mất.',
      },
      {
        fn: 'os.ReadFile / syscall.read (Off-CPU Disk Wait)',
        depth: 1,
        widthPct: 50,
        flat: '49.80%',
        cum: '50.40%',
        hot: true,
        hintEn: 'Half of total wall latency spent sleeping in single-threaded os.ReadFile disk I/O before workers start!',
        hintVi: 'Ngủ chờ đọc file một luồng trong os.ReadFile ngốn tới 50% tổng độ trễ thực tế!',
        fixEn: 'Shard file offsets with io.NewSectionReader so all 4 workers read concurrently.',
        fixVi: 'Chia khúc file bằng io.NewSectionReader để 4 worker đọc song song.',
      },
      {
        fn: 'parseWorkers (On-CPU Parse Loop)',
        depth: 2,
        widthPct: 48,
        flat: '44.00%',
        cum: '48.00%',
        hintEn: 'Genuine CPU compute executed after chunks arrive from disk.',
        hintVi: 'Thời gian CPU tính toán thật sự sau khi đã có dữ liệu.',
        fixEn: 'Keep worker loop lock-free so compute stays crisp.',
        fixVi: 'Giữ vòng lặp tính toán không đụng lock.',
      },
    ],
  },
  alloc_space: {
    tabEn: 'Heap: alloc_space (GC Churn)',
    tabVi: 'Heap: alloc_space (Rác làm GC mệt)',
    cmd: 'go tool pprof -alloc_space -top mem.pprof',
    frames: [
      {
        fn: 'Sum1 (60.8 MB total allocated / op)',
        depth: 0,
        widthPct: 100,
        flat: '0.4%',
        cum: '100%',
        hintEn: 'alloc_space tracks every allocation ever made since startup, highlighting heavy garbage creation.',
        hintVi: 'alloc_space đếm mọi byte từng xin cấp phát (dù đã được GC dọn) — rất hợp săn chỗ đẻ rác.',
        fixEn: 'Pair temporary buffer leaks with Go benchmark -benchmem flags.',
        fixVi: 'Kết hợp kiểm tra trực tiếp với go test -benchmem.',
      },
      {
        fn: 'bytes.genSplit (2M [][]byte slice headers)',
        depth: 1,
        widthPct: 79,
        flat: '78.60%',
        cum: '78.60%',
        hot: true,
        hintEn: 'Allocating 2 million 24-byte slice descriptors triggers massive STW mark/sweep cycles.',
        hintVi: 'Xin cấp 2 triệu slice header (48+ MB) làm GC phải chạy liên tục để quét.',
        fixEn: 'Swap to an in-place scanner loop or fixed 8 KB reusable slice.',
        fixVi: 'Chuyển sang đọc trượt trên một slice buf 8 KB dùng lại nhiều lần.',
      },
      {
        fn: 'runtime.slicebytetostring (line -> string)',
        depth: 2,
        widthPct: 20,
        flat: '20.10%',
        cum: '20.10%',
        hintEn: 'Copying line bytes on every strconv.ParseInt(string(b)) creates millions of short heap strings.',
        hintVi: 'Ép string(b) 2 triệu lần tạo ra 2 triệu chuỗi ngắn trên heap.',
        fixEn: 'Parse []byte directly so zero string copies occur.',
        fixVi: 'Parse trực tiếp trên []byte để bỏ hẳn bước copy sang string.',
      },
    ],
  },
  inuse_space: {
    tabEn: 'Heap: inuse_space (Memory Leak)',
    tabVi: 'Heap: inuse_space (Rò RAM sống)',
    cmd: 'go tool pprof -inuse_space -diff_base=base.pprof spike.pprof',
    frames: [
      {
        fn: 'Live Heap Snapshot before OOM (485 MB retained)',
        depth: 0,
        widthPct: 100,
        flat: '0%',
        cum: '100%',
        hintEn: 'inuse_space shows ONLY objects reachable from live pointers right now — ignoring freed garbage.',
        hintVi: 'inuse_space chỉ giữ những object CHƯA THỂ DỌN ở hiện tại — công cụ số 1 để săn rò rỉ bộ nhớ.',
        fixEn: 'Capture continuously (Parca) so the 60s pre-crash snapshot survives pod restarts!',
        fixVi: 'Nên chụp định kỳ (Parca) để giữ lại bằng chứng ngay trước khi pod sập OOM!',
      },
      {
        fn: 'sessionCache.Put (substrings pinning 64 MB bodies)',
        depth: 1,
        widthPct: 86,
        flat: '86.20%',
        cum: '86.20%',
        hot: true,
        hintEn: 'Storing rawBody[:36] or map entries without deleting/copying keeps 420 MB of dead buffers pinned forever.',
        hintVi: 'Giữ slice con/chuỗi con trỏ vào buffer 64 MB làm GC không bao giờ được phép giải phóng.',
        fixEn: 'Detach with strings.Clone / copy() and inspect diff with -diff_base.',
        fixVi: 'Tách bằng strings.Clone / copy() rồi kiểm chứng lại độ chênh bằng -diff_base.',
      },
      {
        fn: 'Orphaned reader goroutines (blocked channel refs)',
        depth: 2,
        widthPct: 14,
        flat: '13.80%',
        cum: '13.80%',
        hintEn: 'Leaked goroutines keep local slices and network read buffers reachable indefinitely.',
        hintVi: 'Goroutine bị kẹt không thoát giữ luôn biến cục bộ và socket buffer nằm lì trên heap.',
        fixEn: 'Compare /debug/pprof/goroutine count and pass ctx.Done() exit guards.',
        fixVi: 'Soi thêm goroutine profile và gắn điều kiện thoát qua <-ctx.Done().',
      },
    ],
  },
};

export default function GoEffProfileExplorerDemo() {
  const [ptype, setPtype] = useState<ProfileType>('cpu');
  const [selectedIdx, setSelectedIdx] = useState<number>(1);

  const cur = PROFILES[ptype];
  const frame = cur.frames[Math.min(selectedIdx, cur.frames.length - 1)];

  return (
    <div className="sd geff">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Profile Type</span>
            <span data-lang-vi>Loại Profile</span>
          </span>
          {(Object.keys(PROFILES) as ProfileType[]).map((id) => (
            <button
              key={id}
              type="button"
              className={ptype === id ? 'sd-btn is-on' : 'sd-btn'}
              onClick={() => {
                setPtype(id);
                setSelectedIdx(1);
              }}
            >
              <span data-lang-en>{PROFILES[id].tabEn}</span>
              <span data-lang-vi>{PROFILES[id].tabVi}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="geff-cmd">{cur.cmd}</div>

      <div className="geff-grid">
        <div className="geff-pane">
          <div className="geff-hdr">
            <span data-lang-en>Interactive Flame Graph (click any bar)</span>
            <span data-lang-vi>Flame Graph tương tác (bấm vào từng thanh để soi)</span>
          </div>
          <div className="geff-flame">
            {cur.frames.map((f, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedIdx(i)}
                className={`geff-fbar ${i === selectedIdx ? 'is-selected' : ''} ${f.hot ? 'is-hot' : ''}`}
                style={{ width: `${f.widthPct}%` }}
              >
                <span className="geff-fname">{f.fn}</span>
                <span className="geff-fpct">{f.cum}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="geff-pane">
          <div className="geff-hdr">
            <span data-lang-en>Selected Frame Diagnosis</span>
            <span data-lang-vi>Chẩn đoán chi tiết hàm đang chọn</span>
          </div>
          <div className="geff-diag">
            <div className="geff-diag-title">{frame.fn}</div>
            <p className="geff-diag-line">
              <span data-lang-en>{frame.hintEn}</span>
              <span data-lang-vi>{frame.hintVi}</span>
            </p>
            <div className="geff-diag-fix">
              <strong>
                <span data-lang-en>Fix action: </span>
                <span data-lang-vi>Hướng xử lý: </span>
              </strong>
              <span data-lang-en>{frame.fixEn}</span>
              <span data-lang-vi>{frame.fixVi}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="sd-stats">
        <div className={`sd-stat ${frame.hot ? 'is-bad' : ''}`}>
          <b>{frame.flat}</b>
          <span>
            <span data-lang-en>Flat (direct self work)</span>
            <span data-lang-vi>Flat (tự thân hàm tốn)</span>
          </span>
        </div>
        <div className="sd-stat is-good">
          <b>{frame.cum}</b>
          <span>
            <span data-lang-en>Cum (including children)</span>
            <span data-lang-vi>Cum (cộng cả hàm con)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
