import { useState } from 'react';

// Interactive Chapter 8 stepper: pick a concurrency anomaly and an isolation level,
// then step through T1 and T2 to inspect row versions (MVCC), locks/tripwires, and outcomes.
// All data is deterministic so server and client HTML stay identical.

type ScenarioId = 'dirty-read' | 'read-skew' | 'lost-update' | 'write-skew';
type LevelId = 'rc' | 'si' | '2pl' | 'ssi';
type TxStatus = 'idle' | 'active' | 'waiting' | 'committed' | 'aborted';
type LockKind = 'X' | 'S' | 'RANGE-S' | 'SIREAD' | 'RW';

interface RowVersion {
  ver: string;
  valEn: string;
  valVi: string;
  status: 'committed' | 'uncommitted' | 'aborted';
}

interface RowState {
  key: string;
  versions: RowVersion[];
}

interface LockEntry {
  kind: LockKind;
  holder: string;
  targetEn: string;
  targetVi: string;
  noteEn?: string;
  noteVi?: string;
}

interface StepFrame {
  actor: 'T1' | 'T2' | 'Both' | 'Engine';
  actionEn: string;
  actionVi: string;
  detailEn: string;
  detailVi: string;
  t1: TxStatus;
  t2: TxStatus;
  rows: RowState[];
  locks: LockEntry[];
  seenEn: string;
  seenVi: string;
  concurrencyEn: string;
  concurrencyVi: string;
  outcome: 'running' | 'good' | 'bad';
  outcomeEn: string;
  outcomeVi: string;
}

const SCENARIOS: { id: ScenarioId; en: string; vi: string }[] = [
  { id: 'dirty-read', en: 'Dirty Read', vi: 'Dirty Read' },
  { id: 'read-skew', en: 'Read Skew', vi: 'Read Skew' },
  { id: 'lost-update', en: 'Lost Update', vi: 'Lost Update' },
  { id: 'write-skew', en: 'Write Skew / Phantom', vi: 'Write Skew / Phantom' },
];

const LEVELS: { id: LevelId; en: string; vi: string }[] = [
  { id: 'rc', en: 'Read Committed', vi: 'Read Committed' },
  { id: 'si', en: 'Snapshot Isolation', vi: 'Snapshot Isolation' },
  { id: '2pl', en: '2PL', vi: '2PL' },
  { id: 'ssi', en: 'SSI', vi: 'SSI' },
];

const V = (ver: string, valEn: string, valVi: string, status: RowVersion['status']): RowVersion => ({
  ver, valEn, valVi, status,
});

const TRACES: Record<ScenarioId, Record<LevelId, StepFrame[]>> = {
  'dirty-read': {
    rc: [
      {
        actor: 'T1',
        actionEn: 'T1 writes A = $400 (uncommitted)',
        actionVi: 'T1 ghi A = $400 (chưa commit)',
        detailEn: 'T1 holds an exclusive write lock on row A and creates uncommitted version v2 while keeping committed v1 ($500).',
        detailVi: 'T1 giữ lock ghi độc quyền trên dòng A và tạo bản v2 chưa commit, vẫn giữ nguyên bản v1 ($500) đã commit.',
        t1: 'active', t2: 'idle',
        rows: [{ key: 'acct A', versions: [V('v1', '$500 (committed)', '$500 (đã commit)', 'committed'), V('v2', '$400 (tx T1, open)', '$400 (tx T1, chưa chốt)', 'uncommitted')] }],
        locks: [{ kind: 'X', holder: 'T1', targetEn: 'row A', targetVi: 'dòng A' }],
        seenEn: 'T1 sees $400; T2 has not read yet.',
        seenVi: 'T1 thấy $400; T2 chưa đọc.',
        concurrencyEn: 'T1 holds X-lock', concurrencyVi: 'T1 giữ X-lock',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'T2 reads A without waiting',
        actionVi: 'T2 đọc A mà không cần chờ',
        detailEn: 'To avoid blocking readers, Read Committed skips uncommitted v2 and returns the old committed version v1 ($500).',
        detailVi: 'Để tránh chặn lệnh đọc, Read Committed bỏ qua v2 chưa commit và trả về bản v1 đã commit ($500).',
        t1: 'active', t2: 'active',
        rows: [{ key: 'acct A', versions: [V('v1', '$500 (committed)', '$500 (đã commit)', 'committed'), V('v2', '$400 (tx T1, open)', '$400 (tx T1, chưa chốt)', 'uncommitted')] }],
        locks: [{ kind: 'X', holder: 'T1', targetEn: 'row A', targetVi: 'dòng A' }],
        seenEn: 'T2 reads $500 (dirty $400 hidden).',
        seenVi: 'T2 đọc $500 (ẩn $400 chưa commit).',
        concurrencyEn: 'Reader reads v1', concurrencyVi: 'Người đọc lấy v1',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T1',
        actionEn: 'T1 encounters an error and aborts',
        actionVi: 'T1 gặp lỗi và abort (rollback)',
        detailEn: 'T1 rolls back v2 and releases X-lock(A). Because T2 never read $400, T2 does not suffer a cascading abort.',
        detailVi: 'T1 huỷ v2 và nhả X-lock(A). Vì T2 chưa từng đọc $400, T2 không bị huỷ dây chuyền.',
        t1: 'aborted', t2: 'active',
        rows: [{ key: 'acct A', versions: [V('v1', '$500 (committed)', '$500 (đã commit)', 'committed'), V('v2', '$400 (aborted)', '$400 (đã abort)', 'aborted')] }],
        locks: [],
        seenEn: 'T2 still has clean $500.',
        seenVi: 'T2 vẫn giữ giá trị sạch $500.',
        concurrencyEn: 'T1 rolled back', concurrencyVi: 'T1 đã rollback',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'T2 commits cleanly',
        actionVi: 'T2 commit an toàn',
        detailEn: 'T2 finishes with the only value that was ever committed ($500). Dirty reads are prevented.',
        detailVi: 'T2 kết thúc với đúng giá trị đã từng được commit ($500). Dirty read bị chặn hoàn toàn.',
        t1: 'aborted', t2: 'committed',
        rows: [{ key: 'acct A', versions: [V('v1', '$500 (committed)', '$500 (đã commit)', 'committed')] }],
        locks: [],
        seenEn: 'T2 committed with A = $500.',
        seenVi: 'T2 commit với A = $500.',
        concurrencyEn: 'Clean finish', concurrencyVi: 'Hoàn tất sạch',
        outcome: 'good', outcomeEn: 'Prevented ($500)', outcomeVi: 'Đã chặn ($500)',
      },
    ],
    si: [
      {
        actor: 'T1',
        actionEn: 'T1 writes A = $400 (uncommitted)',
        actionVi: 'T1 ghi A = $400 (chưa commit)',
        detailEn: 'T1 takes X-lock(A) and appends version v2 tagged inserted_by = T1.',
        detailVi: 'T1 lấy X-lock(A) và ghi thêm bản v2 gắn nhãn inserted_by = T1.',
        t1: 'active', t2: 'idle',
        rows: [{ key: 'acct A', versions: [V('v1', '$500 (tx 10)', '$500 (tx 10)', 'committed'), V('v2', '$400 (tx T1, open)', '$400 (tx T1, chưa chốt)', 'uncommitted')] }],
        locks: [{ kind: 'X', holder: 'T1', targetEn: 'row A', targetVi: 'dòng A' }],
        seenEn: 'T1 sees $400; T2 not started.',
        seenVi: 'T1 thấy $400; T2 chưa mở.',
        concurrencyEn: 'T1 holds X-lock', concurrencyVi: 'T1 giữ X-lock',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'T2 starts snapshot and reads A',
        actionVi: 'T2 mở snapshot và đọc A',
        detailEn: 'T2 records T1 in its active-at-start list. MVCC visibility rules ignore v2 and return v1 ($500).',
        detailVi: 'T2 ghi T1 vào danh sách đang chạy lúc bắt đầu. Luật MVCC bỏ qua v2 và trả về v1 ($500).',
        t1: 'active', t2: 'active',
        rows: [{ key: 'acct A', versions: [V('v1', '$500 (tx 10)', '$500 (tx 10)', 'committed'), V('v2', '$400 (tx T1, active)', '$400 (tx T1, đang chạy)', 'uncommitted')] }],
        locks: [{ kind: 'X', holder: 'T1', targetEn: 'row A', targetVi: 'dòng A' }],
        seenEn: 'T2 snapshot sees $500.',
        seenVi: 'Snapshot của T2 thấy $500.',
        concurrencyEn: 'Non-blocking read', concurrencyVi: 'Đọc không bị chặn',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T1',
        actionEn: 'T1 aborts; v2 stays invisible',
        actionVi: 'T1 abort; v2 mãi vô hình',
        detailEn: 'T1 rolls back without waking or blocking T2. Vacuum/GC will clean dead tuple v2 later.',
        detailVi: 'T1 rollback mà không làm phiền T2. Vacuum/GC sẽ dọn bản ghi chết v2 sau.',
        t1: 'aborted', t2: 'active',
        rows: [{ key: 'acct A', versions: [V('v1', '$500 (tx 10)', '$500 (tx 10)', 'committed'), V('v2', '$400 (aborted)', '$400 (đã abort)', 'aborted')] }],
        locks: [],
        seenEn: 'T2 keeps $500.',
        seenVi: 'T2 vẫn giữ $500.',
        concurrencyEn: 'T1 rolled back', concurrencyVi: 'T1 đã rollback',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'T2 commits cleanly',
        actionVi: 'T2 commit an toàn',
        detailEn: 'Snapshot Isolation always prevents dirty reads because uncommitted and aborted txids are filtered out.',
        detailVi: 'Snapshot Isolation luôn chặn được dirty read vì mọi txid chưa commit hoặc đã abort đều bị lọc bỏ.',
        t1: 'aborted', t2: 'committed',
        rows: [{ key: 'acct A', versions: [V('v1', '$500 (tx 10)', '$500 (tx 10)', 'committed')] }],
        locks: [],
        seenEn: 'T2 committed with A = $500.',
        seenVi: 'T2 commit với A = $500.',
        concurrencyEn: 'Clean finish', concurrencyVi: 'Hoàn tất sạch',
        outcome: 'good', outcomeEn: 'Prevented ($500)', outcomeVi: 'Đã chặn ($500)',
      },
    ],
    '2pl': [
      {
        actor: 'T1',
        actionEn: 'T1 takes X-lock(A) and writes $400',
        actionVi: 'T1 lấy X-lock(A) và ghi $400',
        detailEn: 'Under 2PL, writing requires an exclusive lock on row A held until commit or abort.',
        detailVi: 'Với 2PL, thao tác ghi phải lấy lock độc quyền trên dòng A và giữ tới khi commit hoặc abort.',
        t1: 'active', t2: 'idle',
        rows: [{ key: 'acct A', versions: [V('v1', '$500 (base)', '$500 (gốc)', 'committed'), V('v2', '$400 (uncommitted)', '$400 (chưa commit)', 'uncommitted')] }],
        locks: [{ kind: 'X', holder: 'T1', targetEn: 'row A', targetVi: 'dòng A' }],
        seenEn: 'T1 holds X-lock(A).',
        seenVi: 'T1 đang giữ X-lock(A).',
        concurrencyEn: 'T1 holds X-lock', concurrencyVi: 'T1 giữ X-lock',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'T2 requests S-lock(A) and blocks',
        actionVi: 'T2 xin S-lock(A) và bị chặn',
        detailEn: 'In 2PL, readers cannot read old versions; T2 must wait until T1 releases X-lock(A).',
        detailVi: 'Trong 2PL, lệnh đọc không đọc bản cũ; T2 buộc phải chờ tới khi T1 nhả X-lock(A).',
        t1: 'active', t2: 'waiting',
        rows: [{ key: 'acct A', versions: [V('v1', '$500 (base)', '$500 (gốc)', 'committed'), V('v2', '$400 (uncommitted)', '$400 (chưa commit)', 'uncommitted')] }],
        locks: [{ kind: 'X', holder: 'T1', targetEn: 'row A (T2 blocked)', targetVi: 'dòng A (T2 bị chặn)' }],
        seenEn: 'T2 is stalled waiting on T1.',
        seenVi: 'T2 đứng chờ T1 mở khoá.',
        concurrencyEn: 'T2 blocked', concurrencyVi: 'T2 bị chặn',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T1',
        actionEn: 'T1 aborts and releases X-lock(A)',
        actionVi: 'T1 abort và nhả X-lock(A)',
        detailEn: 'T1 undoes $400 and drops its lock, waking T2 up to acquire S-lock(A).',
        detailVi: 'T1 hoàn tác $400 và thả lock, đánh thức T2 vào lấy S-lock(A).',
        t1: 'aborted', t2: 'active',
        rows: [{ key: 'acct A', versions: [V('v1', '$500 (committed)', '$500 (đã commit)', 'committed')] }],
        locks: [{ kind: 'S', holder: 'T2', targetEn: 'row A', targetVi: 'dòng A' }],
        seenEn: 'T2 wakes up and reads $500.',
        seenVi: 'T2 thức dậy và đọc được $500.',
        concurrencyEn: 'T2 unblocked', concurrencyVi: 'T2 đã mở khoá',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'T2 commits with $500',
        actionVi: 'T2 commit với $500',
        detailEn: '2PL prevents dirty reads by blocking readers behind writers, trading read latency for strict locking.',
        detailVi: '2PL chặn dirty read bằng cách bắt người đọc đợi người ghi, đánh đổi độ trễ đọc lấy sự chặt chẽ.',
        t1: 'aborted', t2: 'committed',
        rows: [{ key: 'acct A', versions: [V('v1', '$500 (committed)', '$500 (đã commit)', 'committed')] }],
        locks: [],
        seenEn: 'T2 committed with A = $500.',
        seenVi: 'T2 commit với A = $500.',
        concurrencyEn: 'Clean finish', concurrencyVi: 'Hoàn tất sạch',
        outcome: 'good', outcomeEn: 'Prevented (blocked)', outcomeVi: 'Đã chặn (nhờ đợi)',
      },
    ],
    ssi: [
      {
        actor: 'T1',
        actionEn: 'T1 writes A = $400 (uncommitted)',
        actionVi: 'T1 ghi A = $400 (chưa commit)',
        detailEn: 'SSI builds on MVCC: T1 holds X-lock(A) and creates uncommitted v2.',
        detailVi: 'SSI chạy trên nền MVCC: T1 giữ X-lock(A) và tạo bản v2 chưa commit.',
        t1: 'active', t2: 'idle',
        rows: [{ key: 'acct A', versions: [V('v1', '$500 (tx 10)', '$500 (tx 10)', 'committed'), V('v2', '$400 (tx T1, open)', '$400 (tx T1, chưa chốt)', 'uncommitted')] }],
        locks: [{ kind: 'X', holder: 'T1', targetEn: 'row A', targetVi: 'dòng A' }],
        seenEn: 'T1 sees $400; T2 not started.',
        seenVi: 'T1 thấy $400; T2 chưa mở.',
        concurrencyEn: 'T1 holds X-lock', concurrencyVi: 'T1 giữ X-lock',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'T2 reads $500 and places SIREAD(A)',
        actionVi: 'T2 đọc $500 và đặt cờ SIREAD(A)',
        detailEn: 'T2 never blocks: MVCC returns committed v1 ($500), and SSI attaches a non-blocking SIREAD flag on A.',
        detailVi: 'T2 không bị chặn: MVCC trả về v1 ($500), còn SSI gắn thêm cờ SIREAD không chặn lên A.',
        t1: 'active', t2: 'active',
        rows: [{ key: 'acct A', versions: [V('v1', '$500 (tx 10)', '$500 (tx 10)', 'committed'), V('v2', '$400 (tx T1, active)', '$400 (tx T1, đang chạy)', 'uncommitted')] }],
        locks: [
          { kind: 'X', holder: 'T1', targetEn: 'row A', targetVi: 'dòng A' },
          { kind: 'SIREAD', holder: 'T2', targetEn: 'row A (tripwire)', targetVi: 'dòng A (bẫy báo)' },
        ],
        seenEn: 'T2 reads $500 without waiting.',
        seenVi: 'T2 đọc $500 không phải chờ.',
        concurrencyEn: 'Non-blocking + SIREAD', concurrencyVi: 'Không chặn + SIREAD',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T1',
        actionEn: 'T1 aborts',
        actionVi: 'T1 abort',
        detailEn: 'T1 rolls back v2. An aborted transaction can never create a serialization cycle.',
        detailVi: 'T1 huỷ v2. Một giao dịch đã abort không thể tạo chu trình xung đột.',
        t1: 'aborted', t2: 'active',
        rows: [{ key: 'acct A', versions: [V('v1', '$500 (tx 10)', '$500 (tx 10)', 'committed'), V('v2', '$400 (aborted)', '$400 (đã abort)', 'aborted')] }],
        locks: [{ kind: 'SIREAD', holder: 'T2', targetEn: 'row A', targetVi: 'dòng A' }],
        seenEn: 'T2 keeps $500.',
        seenVi: 'T2 giữ $500.',
        concurrencyEn: 'T1 rolled back', concurrencyVi: 'T1 đã rollback',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'T2 commits cleanly',
        actionVi: 'T2 commit an toàn',
        detailEn: 'No dirty read occurred, and no reader was blocked while T1 was running.',
        detailVi: 'Không có dirty read, và không lệnh đọc nào bị chặn khi T1 đang chạy.',
        t1: 'aborted', t2: 'committed',
        rows: [{ key: 'acct A', versions: [V('v1', '$500 (tx 10)', '$500 (tx 10)', 'committed')] }],
        locks: [],
        seenEn: 'T2 committed with A = $500.',
        seenVi: 'T2 commit với A = $500.',
        concurrencyEn: 'Clean finish', concurrencyVi: 'Hoàn tất sạch',
        outcome: 'good', outcomeEn: 'Prevented ($500)', outcomeVi: 'Đã chặn ($500)',
      },
    ],
  },

  'read-skew': {
    rc: [
      {
        actor: 'T2',
        actionEn: 'T2 reads acct A ($500)',
        actionVi: 'T2 đọc tài khoản A ($500)',
        detailEn: 'Under Read Committed, each query takes its own snapshot. Query 1 sees A = $500.',
        detailVi: 'Ở mức Read Committed, mỗi câu truy vấn chụp một snapshot riêng. Lệnh 1 thấy A = $500.',
        t1: 'idle', t2: 'active',
        rows: [
          { key: 'acct A', versions: [V('v1', '$500', '$500', 'committed')] },
          { key: 'acct B', versions: [V('v1', '$500', '$500', 'committed')] },
        ],
        locks: [],
        seenEn: 'T2 saw A = $500 (total should be $1,000).',
        seenVi: 'T2 vừa thấy A = $500 (tổng đúng phải là $1.000).',
        concurrencyEn: 'Per-statement view', concurrencyVi: 'Snapshot theo từng câu',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T1',
        actionEn: 'T1 transfers $100 (A→B) and commits',
        actionVi: 'T1 chuyển $100 (A→B) rồi commit',
        detailEn: 'T1 writes A = $400 (v2) and B = $600 (v2), then commits before T2 runs its second query.',
        detailVi: 'T1 ghi A = $400 (v2) và B = $600 (v2), rồi commit trước khi T2 chạy câu truy vấn thứ hai.',
        t1: 'committed', t2: 'active',
        rows: [
          { key: 'acct A', versions: [V('v1', '$500', '$500', 'committed'), V('v2', '$400 (committed)', '$400 (đã commit)', 'committed')] },
          { key: 'acct B', versions: [V('v1', '$500', '$500', 'committed'), V('v2', '$600 (committed)', '$600 (đã commit)', 'committed')] },
        ],
        locks: [],
        seenEn: 'T1 committed; T2 still holds old A = $500.',
        seenVi: 'T1 đã commit; T2 vẫn đang giữ A cũ = $500.',
        concurrencyEn: 'T1 committed v2', concurrencyVi: 'T1 đã chốt v2',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'T2 reads acct B ($600)',
        actionVi: 'T2 đọc tài khoản B ($600)',
        detailEn: 'Query 2 takes a fresh snapshot and sees T1’s newly committed B = $600.',
        detailVi: 'Câu lệnh 2 chụp snapshot mới nên thấy ngay giá trị B = $600 vừa commit của T1.',
        t1: 'committed', t2: 'active',
        rows: [
          { key: 'acct A', versions: [V('v2', '$400 (committed)', '$400 (đã commit)', 'committed')] },
          { key: 'acct B', versions: [V('v2', '$600 (committed)', '$600 (đã commit)', 'committed')] },
        ],
        locks: [],
        seenEn: 'T2 holds A = $500 (old) and B = $600 (new)!',
        seenVi: 'T2 cầm A = $500 (cũ) và B = $600 (mới)!',
        concurrencyEn: 'Mixed snapshots', concurrencyVi: 'Lẫn hai thời điểm',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'T2 sums A + B = $1,100',
        actionVi: 'T2 cộng A + B = $1.100',
        detailEn: 'Read skew! Even though every read was committed, T2 mixed pre-transfer A and post-transfer B ($100 extra).',
        detailVi: 'Read skew! Dù mọi lệnh đọc đều thấy dữ liệu đã commit, T2 trộn A trước và B sau khi chuyển (dư $100).',
        t1: 'committed', t2: 'committed',
        rows: [
          { key: 'acct A', versions: [V('v2', '$400', '$400', 'committed')] },
          { key: 'acct B', versions: [V('v2', '$600', '$600', 'committed')] },
        ],
        locks: [],
        seenEn: 'T2 reported total = $1,100 (wrong!).',
        seenVi: 'T2 báo tổng = $1.100 (sai!).',
        concurrencyEn: 'Anomaly committed', concurrencyVi: 'Đã lọt lỗi',
        outcome: 'bad', outcomeEn: 'Read Skew ($1,100)', outcomeVi: 'Read Skew ($1.100)',
      },
    ],
    si: [
      {
        actor: 'T2',
        actionEn: 'T2 pins snapshot t0 and reads A ($500)',
        actionVi: 'T2 ghim snapshot t0 và đọc A ($500)',
        detailEn: 'Snapshot Isolation freezes T2’s view at the start of the whole transaction, not per statement.',
        detailVi: 'Snapshot Isolation đóng băng khung nhìn của T2 từ lúc bắt đầu cả giao dịch, không đổi giữa từng câu.',
        t1: 'idle', t2: 'active',
        rows: [
          { key: 'acct A', versions: [V('v1', '$500 (t0)', '$500 (t0)', 'committed')] },
          { key: 'acct B', versions: [V('v1', '$500 (t0)', '$500 (t0)', 'committed')] },
        ],
        locks: [],
        seenEn: 'T2 snapshot pinned at t0; A = $500.',
        seenVi: 'Snapshot của T2 ghim tại t0; A = $500.',
        concurrencyEn: 'Pinned snapshot t0', concurrencyVi: 'Ghim snapshot t0',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T1',
        actionEn: 'T1 transfers $100 (A→B) and commits',
        actionVi: 'T1 chuyển $100 (A→B) rồi commit',
        detailEn: 'T1 writes A = $400 and B = $600 with txid > T2, without blocking T2.',
        detailVi: 'T1 ghi A = $400 và B = $600 với txid > T2, hoàn toàn không chặn T2.',
        t1: 'committed', t2: 'active',
        rows: [
          { key: 'acct A', versions: [V('v1', '$500 (t0)', '$500 (t0)', 'committed'), V('v2', '$400 (tx > T2)', '$400 (tx > T2)', 'committed')] },
          { key: 'acct B', versions: [V('v1', '$500 (t0)', '$500 (t0)', 'committed'), V('v2', '$600 (tx > T2)', '$600 (tx > T2)', 'committed')] },
        ],
        locks: [],
        seenEn: 'T2 ignores v2 because T1 started after t0.',
        seenVi: 'T2 bỏ qua v2 vì T1 chạy sau mốc t0.',
        concurrencyEn: 'Writers non-blocking', concurrencyVi: 'Ghi không chặn đọc',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'T2 reads B from t0 ($500)',
        actionVi: 'T2 đọc B từ mốc t0 ($500)',
        detailEn: 'MVCC filters out v2 and gives T2 the t0 version of B ($500), matching A ($500).',
        detailVi: 'MVCC lọc bỏ v2 và trả lại bản B ở mốc t0 ($500), khớp thời điểm với A ($500).',
        t1: 'committed', t2: 'active',
        rows: [
          { key: 'acct A', versions: [V('v1', '$500 (visible)', '$500 (thấy)', 'committed'), V('v2', '$400 (hidden)', '$400 (ẩn)', 'committed')] },
          { key: 'acct B', versions: [V('v1', '$500 (visible)', '$500 (thấy)', 'committed'), V('v2', '$600 (hidden)', '$600 (ẩn)', 'committed')] },
        ],
        locks: [],
        seenEn: 'T2 holds A = $500 and B = $500.',
        seenVi: 'T2 cầm A = $500 và B = $500.',
        concurrencyEn: 'Consistent t0 view', concurrencyVi: 'Nhất quán tại t0',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'T2 sums A + B = $1,000',
        actionVi: 'T2 cộng A + B = $1.000',
        detailEn: 'Read skew prevented with zero read locks — why backups and analytics rely on Snapshot Isolation.',
        detailVi: 'Chặn được read skew mà không cần bất kỳ lock đọc nào — lý do backup và phân tích thích Snapshot Isolation.',
        t1: 'committed', t2: 'committed',
        rows: [
          { key: 'acct A', versions: [V('v2', '$400', '$400', 'committed')] },
          { key: 'acct B', versions: [V('v2', '$600', '$600', 'committed')] },
        ],
        locks: [],
        seenEn: 'T2 reported total = $1,000.',
        seenVi: 'T2 báo tổng = $1.000.',
        concurrencyEn: 'Clean finish', concurrencyVi: 'Hoàn tất sạch',
        outcome: 'good', outcomeEn: 'Prevented ($1,000)', outcomeVi: 'Đã chặn ($1.000)',
      },
    ],
    '2pl': [
      {
        actor: 'T2',
        actionEn: 'T2 acquires S-lock(A) and reads $500',
        actionVi: 'T2 lấy S-lock(A) và đọc $500',
        detailEn: '2PL takes a shared lock on A and holds it until T2 commits.',
        detailVi: '2PL gắn shared lock lên A và giữ chặt tới lúc T2 commit.',
        t1: 'idle', t2: 'active',
        rows: [
          { key: 'acct A', versions: [V('v1', '$500', '$500', 'committed')] },
          { key: 'acct B', versions: [V('v1', '$500', '$500', 'committed')] },
        ],
        locks: [{ kind: 'S', holder: 'T2', targetEn: 'row A', targetVi: 'dòng A' }],
        seenEn: 'T2 holds S-lock(A), sees $500.',
        seenVi: 'T2 giữ S-lock(A), thấy $500.',
        concurrencyEn: 'T2 holds S-lock(A)', concurrencyVi: 'T2 giữ S-lock(A)',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T1',
        actionEn: 'T1 requests X-lock(A) and blocks',
        actionVi: 'T1 xin X-lock(A) và bị chặn',
        detailEn: 'T1 cannot modify A while T2 holds S-lock(A). The transfer pauses.',
        detailVi: 'T1 không thể sửa A khi T2 đang giữ S-lock(A). Lệnh chuyển tiền phải đứng đợi.',
        t1: 'waiting', t2: 'active',
        rows: [
          { key: 'acct A', versions: [V('v1', '$500', '$500', 'committed')] },
          { key: 'acct B', versions: [V('v1', '$500', '$500', 'committed')] },
        ],
        locks: [{ kind: 'S', holder: 'T2', targetEn: 'row A (T1 waiting)', targetVi: 'dòng A (T1 chờ)' }],
        seenEn: 'T1 blocked behind T2.',
        seenVi: 'T1 bị kẹt sau T2.',
        concurrencyEn: 'T1 blocked', concurrencyVi: 'T1 bị chặn',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'T2 reads B ($500) and commits',
        actionVi: 'T2 đọc B ($500) rồi commit',
        detailEn: 'T2 takes S-lock(B), sums $1,000, commits, and drops all locks so T1 can proceed.',
        detailVi: 'T2 lấy S-lock(B), cộng đủ $1.000, commit rồi thả hết lock cho T1 chạy tiếp.',
        t1: 'active', t2: 'committed',
        rows: [
          { key: 'acct A', versions: [V('v1', '$500', '$500', 'committed')] },
          { key: 'acct B', versions: [V('v1', '$500', '$500', 'committed')] },
        ],
        locks: [
          { kind: 'X', holder: 'T1', targetEn: 'row A', targetVi: 'dòng A' },
          { kind: 'X', holder: 'T1', targetEn: 'row B', targetVi: 'dòng B' },
        ],
        seenEn: 'T2 got $1,000; T1 unblocked.',
        seenVi: 'T2 có $1.000; T1 được mở khoá.',
        concurrencyEn: 'T1 unblocked', concurrencyVi: 'T1 chạy tiếp',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T1',
        actionEn: 'T1 finishes transfer ($400 / $600)',
        actionVi: 'T1 hoàn tất chuyển ($400 / $600)',
        detailEn: 'Read skew is prevented, though a long read under 2PL stalls every concurrent writer touching the same rows.',
        detailVi: 'Read skew bị chặn, nhưng một lệnh đọc chạy lâu dưới 2PL sẽ chặn đứng mọi lệnh ghi vào cùng dữ liệu.',
        t1: 'committed', t2: 'committed',
        rows: [
          { key: 'acct A', versions: [V('v2', '$400', '$400', 'committed')] },
          { key: 'acct B', versions: [V('v2', '$600', '$600', 'committed')] },
        ],
        locks: [],
        seenEn: 'T2 saw $1,000; transfer finished after.',
        seenVi: 'T2 thấy $1.000; giao dịch chuyển tiền chạy sau.',
        concurrencyEn: 'Serialized via locks', concurrencyVi: 'Tuần tự qua lock',
        outcome: 'good', outcomeEn: 'Prevented ($1,000)', outcomeVi: 'Đã chặn ($1.000)',
      },
    ],
    ssi: [
      {
        actor: 'T2',
        actionEn: 'T2 pins t0, reads A ($500), marks SIREAD(A)',
        actionVi: 'T2 ghim t0, đọc A ($500), đặt SIREAD(A)',
        detailEn: 'T2 reads A from snapshot t0 and leaves a non-blocking SIREAD tripwire on row A.',
        detailVi: 'T2 đọc A từ snapshot t0 và đặt một bẫy SIREAD không chặn lên dòng A.',
        t1: 'idle', t2: 'active',
        rows: [
          { key: 'acct A', versions: [V('v1', '$500', '$500', 'committed')] },
          { key: 'acct B', versions: [V('v1', '$500', '$500', 'committed')] },
        ],
        locks: [{ kind: 'SIREAD', holder: 'T2', targetEn: 'row A', targetVi: 'dòng A' }],
        seenEn: 'T2 sees A = $500.',
        seenVi: 'T2 thấy A = $500.',
        concurrencyEn: 'SIREAD placed', concurrencyVi: 'Đã đặt SIREAD',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T1',
        actionEn: 'T1 updates A & B and commits',
        actionVi: 'T1 cập nhật A & B rồi commit',
        detailEn: 'T1’s write to A trips T2’s SIREAD(A), recording one rw-antidependency edge (T2 --rw--> T1). T1 still commits.',
        detailVi: 'Lệnh ghi A của T1 chạm bẫy SIREAD(A), ghi lại một cạnh T2 --rw--> T1. T1 vẫn commit bình thường.',
        t1: 'committed', t2: 'active',
        rows: [
          { key: 'acct A', versions: [V('v1', '$500 (t0)', '$500 (t0)', 'committed'), V('v2', '$400 (committed)', '$400 (đã commit)', 'committed')] },
          { key: 'acct B', versions: [V('v1', '$500 (t0)', '$500 (t0)', 'committed'), V('v2', '$600 (committed)', '$600 (đã commit)', 'committed')] },
        ],
        locks: [
          { kind: 'SIREAD', holder: 'T2', targetEn: 'row A', targetVi: 'dòng A' },
          { kind: 'RW', holder: 'SSI', targetEn: 'T2 --rw--> T1', targetVi: 'T2 --rw--> T1' },
        ],
        seenEn: 'One rw-edge logged; T2 not blocked.',
        seenVi: 'Ghi nhận 1 cạnh rw; T2 không bị chặn.',
        concurrencyEn: '1 rw-edge (no cycle)', concurrencyVi: '1 cạnh rw (chưa có vòng)',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'T2 reads B ($500) from t0',
        actionVi: 'T2 đọc B ($500) từ mốc t0',
        detailEn: 'T2 reads B = $500 from its consistent snapshot. Notice T2 performs no writes of its own.',
        detailVi: 'T2 đọc B = $500 từ snapshot nhất quán. Lưu ý T2 không hề ghi gì cả.',
        t1: 'committed', t2: 'active',
        rows: [
          { key: 'acct A', versions: [V('v1', '$500 (visible)', '$500 (thấy)', 'committed')] },
          { key: 'acct B', versions: [V('v1', '$500 (visible)', '$500 (thấy)', 'committed')] },
        ],
        locks: [
          { kind: 'SIREAD', holder: 'T2', targetEn: 'rows A, B', targetVi: 'dòng A, B' },
          { kind: 'RW', holder: 'SSI', targetEn: 'T2 --rw--> T1', targetVi: 'T2 --rw--> T1' },
        ],
        seenEn: 'T2 holds $500 + $500 = $1,000.',
        seenVi: 'T2 giữ $500 + $500 = $1.000.',
        concurrencyEn: 'Read-only safe', concurrencyVi: 'Đọc thuần luôn an toàn',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'T2 commits with zero aborts ($1,000)',
        actionVi: 'T2 commit không cần abort ($1.000)',
        detailEn: 'A single rw-edge with no second consecutive rw-edge is equivalent to T2 running before T1 — serializable with no waiting!',
        detailVi: 'Chỉ một cạnh rw (không nối thêm cạnh thứ hai) tương đương T2 chạy trước T1 — đạt serializable mà không ai phải chờ!',
        t1: 'committed', t2: 'committed',
        rows: [
          { key: 'acct A', versions: [V('v2', '$400', '$400', 'committed')] },
          { key: 'acct B', versions: [V('v2', '$600', '$600', 'committed')] },
        ],
        locks: [],
        seenEn: 'T2 saw $1,000; serializable order T2 → T1.',
        seenVi: 'T2 thấy $1.000; tương đương thứ tự T2 → T1.',
        concurrencyEn: 'Serializable, 0 waits', concurrencyVi: 'Serializable, 0 lần chờ',
        outcome: 'good', outcomeEn: 'Prevented ($1,000)', outcomeVi: 'Đã chặn ($1.000)',
      },
    ],
  },

  'lost-update': {
    rc: [
      {
        actor: 'Both',
        actionEn: 'T1 and T2 both read counter = 42',
        actionVi: 'T1 và T2 cùng đọc counter = 42',
        detailEn: 'Both read-modify-write transactions read 42 without locking the row and compute 42 + 1 = 43 in app memory.',
        detailVi: 'Cả hai giao dịch đều đọc 42 mà chưa khoá dòng và tự tính 42 + 1 = 43 trong bộ nhớ ứng dụng.',
        t1: 'active', t2: 'active',
        rows: [{ key: 'counter', versions: [V('v1', '42', '42', 'committed')] }],
        locks: [],
        seenEn: 'T1 computes 43; T2 computes 43.',
        seenVi: 'T1 tính ra 43; T2 cũng tính ra 43.',
        concurrencyEn: 'No read locks', concurrencyVi: 'Không lock khi đọc',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T1',
        actionEn: 'T1 writes 43 and commits',
        actionVi: 'T1 ghi 43 rồi commit',
        detailEn: 'T1 takes X-lock(counter), writes 43 (v2), commits, and releases its write lock.',
        detailVi: 'T1 lấy X-lock(counter), ghi 43 (v2), commit, và nhả lock ghi ra.',
        t1: 'committed', t2: 'active',
        rows: [{ key: 'counter', versions: [V('v2', '43 (committed by T1)', '43 (T1 đã commit)', 'committed')] }],
        locks: [],
        seenEn: 'T2 still holds stale value 43 in memory.',
        seenVi: 'T2 vẫn ôm số 43 cũ trong RAM.',
        concurrencyEn: 'X-lock released', concurrencyVi: 'Đã nhả X-lock',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'T2 acquires X-lock and writes 43',
        actionVi: 'T2 lấy X-lock và ghi đè 43',
        detailEn: 'Under Read Committed, the write lock is free now. T2 overwrites v2 with 43 — clobbering T1’s increment!',
        detailVi: 'Ở mức Read Committed, lock ghi giờ đã trống. T2 ghi đè 43 lên v2 — nuốt mất phần tăng của T1!',
        t1: 'committed', t2: 'active',
        rows: [{ key: 'counter', versions: [V('v3', '43 (clobbered!)', '43 (ghi đè mất!)', 'uncommitted')] }],
        locks: [{ kind: 'X', holder: 'T2', targetEn: 'counter', targetVi: 'counter' }],
        seenEn: 'T2 is about to commit 43.',
        seenVi: 'T2 sắp commit số 43.',
        concurrencyEn: 'Clobbering T1', concurrencyVi: 'Ghi đè lên T1',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'T2 commits — counter ends at 43',
        actionVi: 'T2 commit — counter dừng ở 43',
        detailEn: 'Two increments produced 43 instead of 44. This is the exact race pattern behind the Flexcoin and Poloniex hacks.',
        detailVi: 'Hai lần tăng mà kết quả chỉ là 43 thay vì 44. Đây chính là lỗ hổng race condition đánh sập Flexcoin và Poloniex.',
        t1: 'committed', t2: 'committed',
        rows: [{ key: 'counter', versions: [V('v3', '43 (lost 1 update)', '43 (mất 1 lần tăng)', 'committed')] }],
        locks: [],
        seenEn: 'Final counter = 43 (expected 44).',
        seenVi: 'Giá trị cuối = 43 (đáng lẽ 44).',
        concurrencyEn: 'Lost update', concurrencyVi: 'Mất bản cập nhật',
        outcome: 'bad', outcomeEn: 'Lost Update (43)', outcomeVi: 'Lost Update (43)',
      },
    ],
    si: [
      {
        actor: 'Both',
        actionEn: 'T1 and T2 read counter = 42 from t0',
        actionVi: 'T1 và T2 cùng đọc counter = 42 ở t0',
        detailEn: 'Both start at snapshot t0 and compute 43 in application memory.',
        detailVi: 'Cả hai mở snapshot t0, đọc 42 và tự tính 43 ở tầng ứng dụng.',
        t1: 'active', t2: 'active',
        rows: [{ key: 'counter', versions: [V('v1', '42 (t0)', '42 (t0)', 'committed')] }],
        locks: [],
        seenEn: 'T1 = 43, T2 = 43 (computed).',
        seenVi: 'T1 tính 43, T2 tính 43.',
        concurrencyEn: 'Snapshot t0', concurrencyVi: 'Snapshot t0',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T1',
        actionEn: 'T1 updates counter to 43 and commits',
        actionVi: 'T1 sửa counter thành 43 và commit',
        detailEn: 'T1 marks v1 deleted_by = T1, inserts v2 (43), and commits.',
        detailVi: 'T1 đánh dấu v1 deleted_by = T1, chèn v2 (43), rồi commit.',
        t1: 'committed', t2: 'active',
        rows: [{ key: 'counter', versions: [V('v1', '42 (del by T1)', '42 (T1 đã xoá)', 'committed'), V('v2', '43 (committed)', '43 (đã commit)', 'committed')] }],
        locks: [],
        seenEn: 'T2 tries to update v1 which T1 just deleted.',
        seenVi: 'T2 sắp sửa dòng v1 mà T1 vừa xoá.',
        concurrencyEn: 'T1 won first-committer', concurrencyVi: 'T1 thắng first-committer',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'Engine',
        actionEn: 'First-committer-wins aborts T2',
        actionVi: 'Luật first-committer-wins huỷ T2',
        detailEn: 'Postgres/Oracle Snapshot Isolation spots that v1 changed after t0 and aborts T2 (40001). Warning: MySQL Repeatable Read allows the overwrite!',
        detailVi: 'Snapshot Isolation của Postgres/Oracle phát hiện v1 đã đổi sau t0 nên abort T2 (40001). Lưu ý: Repeatable Read của MySQL lại cho ghi đè!',
        t1: 'committed', t2: 'aborted',
        rows: [{ key: 'counter', versions: [V('v2', '43 (committed)', '43 (đã commit)', 'committed')] }],
        locks: [],
        seenEn: 'T2 aborted — app must retry.',
        seenVi: 'T2 bị abort — ứng dụng phải thử lại.',
        concurrencyEn: 'Write-write abort (40001)', concurrencyVi: 'Abort đụng ghi (40001)',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'App retries T2 on 43 → writes 44',
        actionVi: 'App thử lại T2 trên số 43 → ghi 44',
        detailEn: 'Retrying T2 opens a fresh snapshot (43) and increments cleanly to 44.',
        detailVi: 'Lần chạy lại của T2 lấy snapshot mới (43) và tăng chuẩn xác lên 44.',
        t1: 'committed', t2: 'committed',
        rows: [{ key: 'counter', versions: [V('v3', '44 (committed)', '44 (đã commit)', 'committed')] }],
        locks: [],
        seenEn: 'Final counter = 44 (Postgres/Oracle).',
        seenVi: 'Giá trị cuối = 44 (Postgres/Oracle).',
        concurrencyEn: 'Prevented via retry', concurrencyVi: 'Đã chặn nhờ retry',
        outcome: 'good', outcomeEn: 'Prevented (MySQL RR differs)', outcomeVi: 'Đã chặn (MySQL RR khác)',
      },
    ],
    '2pl': [
      {
        actor: 'Both',
        actionEn: 'T1 & T2 both acquire S-lock and read 42',
        actionVi: 'T1 & T2 cùng lấy S-lock và đọc 42',
        detailEn: 'Multiple transactions can share S-locks on the same row simultaneously.',
        detailVi: 'Nhiều giao dịch được giữ shared lock (S-lock) trên cùng một dòng cùng lúc.',
        t1: 'active', t2: 'active',
        rows: [{ key: 'counter', versions: [V('v1', '42', '42', 'committed')] }],
        locks: [
          { kind: 'S', holder: 'T1', targetEn: 'counter', targetVi: 'counter' },
          { kind: 'S', holder: 'T2', targetEn: 'counter', targetVi: 'counter' },
        ],
        seenEn: 'Both hold S-lock and see 42.',
        seenVi: 'Cả hai đều giữ S-lock và thấy 42.',
        concurrencyEn: '2 S-locks held', concurrencyVi: 'Đang giữ 2 S-lock',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'Both',
        actionEn: 'Both try upgrading S → X: Deadlock!',
        actionVi: 'Cả hai xin nâng S → X: Deadlock!',
        detailEn: 'T1 needs T2 to drop its S-lock, while T2 needs T1 to drop its S-lock. Neither can move.',
        detailVi: 'T1 chờ T2 nhả S-lock, còn T2 chờ T1 nhả S-lock. Cả hai kẹt cứng.',
        t1: 'waiting', t2: 'waiting',
        rows: [{ key: 'counter', versions: [V('v1', '42', '42', 'committed')] }],
        locks: [
          { kind: 'S', holder: 'T1', targetEn: 'wants X (waits T2)', targetVi: 'xin X (chờ T2)' },
          { kind: 'S', holder: 'T2', targetEn: 'wants X (waits T1)', targetVi: 'xin X (chờ T1)' },
        ],
        seenEn: 'Deadlock cycle T1 ↔ T2 detected.',
        seenVi: 'Phát hiện vòng khoá chết T1 ↔ T2.',
        concurrencyEn: 'Deadlock!', concurrencyVi: 'Khoá chết (Deadlock)!',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'Engine',
        actionEn: 'Deadlock detector aborts T2; T1 writes 43',
        actionVi: 'Bộ phát hiện deadlock huỷ T2; T1 ghi 43',
        detailEn: 'Aborting T2 frees its S-lock, letting T1 upgrade to X-lock, write 43, and commit.',
        detailVi: 'Huỷ T2 giúp giải phóng S-lock, T1 nâng cấp thành X-lock, ghi 43 và commit.',
        t1: 'committed', t2: 'aborted',
        rows: [{ key: 'counter', versions: [V('v2', '43 (committed)', '43 (đã commit)', 'committed')] }],
        locks: [],
        seenEn: 'T1 committed 43; T2 aborted.',
        seenVi: 'T1 commit 43; T2 bị huỷ.',
        concurrencyEn: 'T2 aborted for retry', concurrencyVi: 'Huỷ T2 để chạy lại',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'App retries T2 on 43 → writes 44',
        actionVi: 'App thử lại T2 trên 43 → ghi 44',
        detailEn: 'Retry reads 43 cleanly under fresh locks and commits 44.',
        detailVi: 'Lần thử lại đọc 43 dưới lock mới và commit ra 44.',
        t1: 'committed', t2: 'committed',
        rows: [{ key: 'counter', versions: [V('v3', '44 (committed)', '44 (đã commit)', 'committed')] }],
        locks: [],
        seenEn: 'Final counter = 44.',
        seenVi: 'Giá trị cuối = 44.',
        concurrencyEn: 'Deadlock resolved', concurrencyVi: 'Gỡ deadlock xong',
        outcome: 'good', outcomeEn: 'Prevented (44)', outcomeVi: 'Đã chặn (44)',
      },
    ],
    ssi: [
      {
        actor: 'Both',
        actionEn: 'T1 & T2 read 42 and attach SIREAD(counter)',
        actionVi: 'T1 & T2 đọc 42 và đặt SIREAD(counter)',
        detailEn: 'Both read from snapshot t0 without blocking and register SIREAD tripwires on counter.',
        detailVi: 'Cả hai đọc từ snapshot t0 không hề chặn nhau và gắn bẫy SIREAD lên counter.',
        t1: 'active', t2: 'active',
        rows: [{ key: 'counter', versions: [V('v1', '42 (t0)', '42 (t0)', 'committed')] }],
        locks: [
          { kind: 'SIREAD', holder: 'T1', targetEn: 'counter', targetVi: 'counter' },
          { kind: 'SIREAD', holder: 'T2', targetEn: 'counter', targetVi: 'counter' },
        ],
        seenEn: 'Both hold snapshot 42.',
        seenVi: 'Cả hai cùng giữ snapshot 42.',
        concurrencyEn: '2 SIREAD tripwires', concurrencyVi: '2 bẫy SIREAD',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T1',
        actionEn: 'T1 updates counter to 43 and commits',
        actionVi: 'T1 cập nhật counter thành 43 và commit',
        detailEn: 'T1 trips T2’s SIREAD (recording T2 --rw--> T1) and commits cleanly.',
        detailVi: 'T1 chạm bẫy SIREAD của T2 (ghi T2 --rw--> T1) và commit trước.',
        t1: 'committed', t2: 'active',
        rows: [{ key: 'counter', versions: [V('v2', '43 (committed)', '43 (đã commit)', 'committed')] }],
        locks: [
          { kind: 'SIREAD', holder: 'T2', targetEn: 'counter', targetVi: 'counter' },
          { kind: 'RW', holder: 'SSI', targetEn: 'T2 --rw--> T1', targetVi: 'T2 --rw--> T1' },
        ],
        seenEn: 'T2’s premise (42) is now stale.',
        seenVi: 'Tiền đề (42) của T2 đã cũ.',
        concurrencyEn: 'Tripwire triggered', concurrencyVi: 'Bẫy đã bật',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'Engine',
        actionEn: 'SSI aborts T2 (40001) on conflicting update',
        actionVi: 'SSI huỷ T2 (40001) vì xung đột ghi',
        detailEn: 'T2 read stale 42 before T1 modified and committed counter — aborting T2 prevents the lost update.',
        detailVi: 'T2 đã đọc số 42 cũ trước khi T1 sửa và commit — huỷ T2 chặn đứng lỗi lost update.',
        t1: 'committed', t2: 'aborted',
        rows: [{ key: 'counter', versions: [V('v2', '43 (committed)', '43 (đã commit)', 'committed')] }],
        locks: [],
        seenEn: 'T2 aborted with serialization failure.',
        seenVi: 'T2 bị abort do lỗi serialization.',
        concurrencyEn: 'Aborted T2 (40001)', concurrencyVi: 'Huỷ T2 (40001)',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'App retries T2 on 43 → writes 44',
        actionVi: 'App thử lại T2 trên 43 → ghi 44',
        detailEn: 'Retrying T2 reads 43 and writes 44 with no lost increment.',
        detailVi: 'Lần thử lại đọc 43 và ghi 44, không mất lần tăng nào.',
        t1: 'committed', t2: 'committed',
        rows: [{ key: 'counter', versions: [V('v3', '44 (committed)', '44 (đã commit)', 'committed')] }],
        locks: [],
        seenEn: 'Final counter = 44.',
        seenVi: 'Giá trị cuối = 44.',
        concurrencyEn: 'Prevented via retry', concurrencyVi: 'Đã chặn nhờ retry',
        outcome: 'good', outcomeEn: 'Prevented (44)', outcomeVi: 'Đã chặn (44)',
      },
    ],
  },

  'write-skew': {
    rc: [
      {
        actor: 'Both',
        actionEn: 'T1 & T2 both query COUNT(on_call) → 2',
        actionVi: 'T1 & T2 cùng chạy COUNT(on_call) → 2',
        detailEn: 'Shift #42 has Lan=on and Minh=on. Both transactions verify count >= 2.',
        detailVi: 'Ca trực #42 có Lan=trực và Minh=trực. Cả hai giao dịch đều thấy count >= 2.',
        t1: 'active', t2: 'active',
        rows: [
          { key: 'Dr. Lan', versions: [V('v1', 'on_call = true', 'trực = true', 'committed')] },
          { key: 'Dr. Minh', versions: [V('v1', 'on_call = true', 'trực = true', 'committed')] },
        ],
        locks: [],
        seenEn: 'Both see 2 doctors on call.',
        seenVi: 'Cả hai đều thấy còn 2 bác sĩ trực.',
        concurrencyEn: 'No locks held', concurrencyVi: 'Chưa giữ lock',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T1',
        actionEn: 'T1 sets Lan = false and commits',
        actionVi: 'T1 đặt Lan = nghỉ và commit',
        detailEn: 'T1 takes X-lock only on Dr. Lan’s row, sets on_call = false, and commits.',
        detailVi: 'T1 chỉ lấy X-lock trên dòng của BS Lan, đổi thành nghỉ, rồi commit.',
        t1: 'committed', t2: 'active',
        rows: [
          { key: 'Dr. Lan', versions: [V('v2', 'on_call = false', 'nghỉ = false', 'committed')] },
          { key: 'Dr. Minh', versions: [V('v1', 'on_call = true', 'trực = true', 'committed')] },
        ],
        locks: [],
        seenEn: 'T2 already checked count = 2 earlier.',
        seenVi: 'T2 đã kiểm tra count = 2 từ trước đó.',
        concurrencyEn: 'Row Lan updated', concurrencyVi: 'Đã sửa dòng Lan',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'T2 sets Minh = false (disjoint row)',
        actionVi: 'T2 đặt Minh = nghỉ (dòng khác)',
        detailEn: 'T2 locks Dr. Minh’s row — zero overlap with T1’s lock on Lan.',
        detailVi: 'T2 khoá dòng BS Minh — không hề đụng chạm với dòng của Lan.',
        t1: 'committed', t2: 'active',
        rows: [
          { key: 'Dr. Lan', versions: [V('v2', 'on_call = false', 'nghỉ = false', 'committed')] },
          { key: 'Dr. Minh', versions: [V('v2', 'on_call = false (open)', 'nghỉ = false (chưa chốt)', 'uncommitted')] },
        ],
        locks: [{ kind: 'X', holder: 'T2', targetEn: 'Dr. Minh', targetVi: 'BS Minh' }],
        seenEn: 'Disjoint write sets → no lock conflict.',
        seenVi: 'Ghi hai dòng khác nhau → không đụng lock.',
        concurrencyEn: 'Disjoint X-lock', concurrencyVi: 'X-lock khác dòng',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'T2 commits — 0 doctors on call!',
        actionVi: 'T2 commit — còn 0 bác sĩ trực!',
        detailEn: 'Read Committed allows write skew immediately because no locks connect T1’s read set to T2’s write set.',
        detailVi: 'Read Committed cho write skew lọt thẳng vì không có cơ chế nối tập đọc với tập ghi của hai giao dịch.',
        t1: 'committed', t2: 'committed',
        rows: [
          { key: 'Dr. Lan', versions: [V('v2', 'on_call = false', 'nghỉ = false', 'committed')] },
          { key: 'Dr. Minh', versions: [V('v2', 'on_call = false', 'nghỉ = false', 'committed')] },
        ],
        locks: [],
        seenEn: '0 doctors left (hospital rule broken).',
        seenVi: 'Còn 0 bác sĩ (vỡ quy tắc bệnh viện).',
        concurrencyEn: 'Invariant broken', concurrencyVi: 'Vỡ quy tắc',
        outcome: 'bad', outcomeEn: 'Write Skew (0 left)', outcomeVi: 'Write Skew (còn 0)',
      },
    ],
    si: [
      {
        actor: 'Both',
        actionEn: 'T1 & T2 read COUNT = 2 from snapshot t0',
        actionVi: 'T1 & T2 đọc COUNT = 2 từ snapshot t0',
        detailEn: 'Both transactions see the same consistent snapshot where Lan=on and Minh=on.',
        detailVi: 'Cả hai cùng đọc từ một snapshot nhất quán thấy Lan=trực và Minh=trực.',
        t1: 'active', t2: 'active',
        rows: [
          { key: 'Dr. Lan', versions: [V('v1', 'on_call = true (t0)', 'trực = true (t0)', 'committed')] },
          { key: 'Dr. Minh', versions: [V('v1', 'on_call = true (t0)', 'trực = true (t0)', 'committed')] },
        ],
        locks: [],
        seenEn: 'Both premises hold: count = 2.',
        seenVi: 'Cả hai thấy điều kiện đúng: count = 2.',
        concurrencyEn: 'Shared snapshot t0', concurrencyVi: 'Chung snapshot t0',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T1',
        actionEn: 'T1 updates Lan = false and commits',
        actionVi: 'T1 sửa Lan = nghỉ và commit',
        detailEn: 'T1 writes a new version of Dr. Lan’s row and commits. T2’s snapshot t0 still shows Lan=on.',
        detailVi: 'T1 ghi bản mới cho dòng BS Lan và commit. Snapshot t0 của T2 vẫn thấy Lan đang trực.',
        t1: 'committed', t2: 'active',
        rows: [
          { key: 'Dr. Lan', versions: [V('v1', 'true (seen by T2)', 'trực (T2 vẫn thấy)', 'committed'), V('v2', 'false (committed)', 'nghỉ (đã commit)', 'committed')] },
          { key: 'Dr. Minh', versions: [V('v1', 'on_call = true', 'trực = true', 'committed')] },
        ],
        locks: [],
        seenEn: 'T1 touched Lan; T2 will touch Minh.',
        seenVi: 'T1 đụng Lan; T2 sắp đụng Minh.',
        concurrencyEn: 'T1 committed v2', concurrencyVi: 'T1 chốt v2',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'T2 updates Minh = false — no write conflict',
        actionVi: 'T2 sửa Minh = nghỉ — không đụng ghi',
        detailEn: 'First-committer-wins only checks overlapping writes. Because Lan != Minh, Snapshot Isolation lets T2 proceed.',
        detailVi: 'First-committer-wins chỉ bắt khi hai bên ghi cùng một dòng. Vì Lan != Minh, Snapshot Isolation cho T2 đi tiếp.',
        t1: 'committed', t2: 'active',
        rows: [
          { key: 'Dr. Lan', versions: [V('v2', 'on_call = false', 'nghỉ = false', 'committed')] },
          { key: 'Dr. Minh', versions: [V('v2', 'false (tx T2, open)', 'nghỉ (tx T2, chưa chốt)', 'uncommitted')] },
        ],
        locks: [{ kind: 'X', holder: 'T2', targetEn: 'Dr. Minh', targetVi: 'BS Minh' }],
        seenEn: 'Zero write-write overlap.',
        seenVi: 'Tập ghi hoàn toàn tách rời.',
        concurrencyEn: 'No conflict check fired', concurrencyVi: 'Không kích hoạt bẫy',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'T2 commits — 0 doctors on call!',
        actionVi: 'T2 commit — còn 0 bác sĩ trực!',
        detailEn: 'Write skew! This happens under Postgres REPEATABLE READ and Oracle "SERIALIZABLE" too. (Same trap for phantoms with 0 initial rows.)',
        detailVi: 'Write skew! Lỗi này xảy ra ở cả REPEATABLE READ của Postgres lẫn "SERIALIZABLE" của Oracle. (Với phantom khi chưa có dòng cũng y hệt.)',
        t1: 'committed', t2: 'committed',
        rows: [
          { key: 'Dr. Lan', versions: [V('v2', 'on_call = false', 'nghỉ = false', 'committed')] },
          { key: 'Dr. Minh', versions: [V('v2', 'on_call = false', 'nghỉ = false', 'committed')] },
        ],
        locks: [],
        seenEn: '0 doctors left (hospital rule broken).',
        seenVi: 'Còn 0 bác sĩ (vỡ quy tắc bệnh viện).',
        concurrencyEn: 'Write skew escaped', concurrencyVi: 'Lọt lỗi write skew',
        outcome: 'bad', outcomeEn: 'Write Skew (0 left)', outcomeVi: 'Write Skew (còn 0)',
      },
    ],
    '2pl': [
      {
        actor: 'Both',
        actionEn: 'T1 & T2 acquire index-range S-lock(shift=42)',
        actionVi: 'T1 & T2 lấy index-range S-lock(shift=42)',
        detailEn: '2PL attaches shared locks across the entire shift_id=42 index range (covering both doctors and any phantom rows).',
        detailVi: '2PL gắn shared lock lên cả dải index shift_id=42 (bọc cả hai bác sĩ lẫn mọi dòng phantom có thể chèn thêm).',
        t1: 'active', t2: 'active',
        rows: [
          { key: 'Dr. Lan', versions: [V('v1', 'on_call = true', 'trực = true', 'committed')] },
          { key: 'Dr. Minh', versions: [V('v1', 'on_call = true', 'trực = true', 'committed')] },
        ],
        locks: [
          { kind: 'RANGE-S', holder: 'T1', targetEn: 'shift=42', targetVi: 'shift=42' },
          { kind: 'RANGE-S', holder: 'T2', targetEn: 'shift=42', targetVi: 'shift=42' },
        ],
        seenEn: 'Both hold range S-locks and see count = 2.',
        seenVi: 'Cả hai giữ range S-lock và thấy count = 2.',
        concurrencyEn: '2 range S-locks', concurrencyVi: '2 range S-lock',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'Both',
        actionEn: 'Both request X-locks inside shift=42 → Deadlock',
        actionVi: 'Cả hai xin X-lock trong shift=42 → Deadlock',
        detailEn: 'T1 needs T2’s range S-lock cleared to write Lan; T2 needs T1’s range S-lock cleared to write Minh.',
        detailVi: 'T1 chờ T2 nhả range S-lock để sửa Lan; T2 chờ T1 nhả range S-lock để sửa Minh.',
        t1: 'waiting', t2: 'waiting',
        rows: [
          { key: 'Dr. Lan', versions: [V('v1', 'on_call = true', 'trực = true', 'committed')] },
          { key: 'Dr. Minh', versions: [V('v1', 'on_call = true', 'trực = true', 'committed')] },
        ],
        locks: [
          { kind: 'RANGE-S', holder: 'T1', targetEn: 'wants X(Lan)', targetVi: 'xin X(Lan)' },
          { kind: 'RANGE-S', holder: 'T2', targetEn: 'wants X(Minh)', targetVi: 'xin X(Minh)' },
        ],
        seenEn: 'Deadlock stops both from writing concurrently.',
        seenVi: 'Deadlock chặn hai bên ghi song song.',
        concurrencyEn: 'Deadlock!', concurrencyVi: 'Khoá chết (Deadlock)!',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'Engine',
        actionEn: 'Deadlock detector aborts T2; T1 commits Lan=off',
        actionVi: 'Hệ thống huỷ T2; T1 commit Lan=nghỉ',
        detailEn: 'Once T2 aborts, T1 upgrades to X-lock(Lan), updates Lan = false, and commits.',
        detailVi: 'Khi T2 bị huỷ, T1 lấy được X-lock(Lan), đổi Lan = nghỉ và commit.',
        t1: 'committed', t2: 'aborted',
        rows: [
          { key: 'Dr. Lan', versions: [V('v2', 'on_call = false', 'nghỉ = false', 'committed')] },
          { key: 'Dr. Minh', versions: [V('v1', 'on_call = true', 'trực = true', 'committed')] },
        ],
        locks: [],
        seenEn: 'Only Dr. Minh remains on call (count = 1).',
        seenVi: 'Chỉ còn BS Minh trực (count = 1).',
        concurrencyEn: 'T2 aborted for retry', concurrencyVi: 'Huỷ T2 để chạy lại',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'App retries T2 → sees count = 1 and stops',
        actionVi: 'App thử lại T2 → thấy count = 1 nên dừng',
        detailEn: 'On retry, T2 sees only 1 doctor left and refuses to take Minh off call. Invariant preserved!',
        detailVi: 'Lần chạy lại thấy chỉ còn 1 bác sĩ nên T2 từ chối cho Minh nghỉ. Quy tắc được giữ nguyên!',
        t1: 'committed', t2: 'committed',
        rows: [
          { key: 'Dr. Lan', versions: [V('v2', 'on_call = false', 'nghỉ = false', 'committed')] },
          { key: 'Dr. Minh', versions: [V('v1', 'on_call = true', 'trực = true', 'committed')] },
        ],
        locks: [],
        seenEn: '1 doctor stays on call.',
        seenVi: 'Còn 1 bác sĩ đang trực.',
        concurrencyEn: 'Invariant safe', concurrencyVi: 'Giữ nguyên quy tắc',
        outcome: 'good', outcomeEn: 'Prevented (1 left)', outcomeVi: 'Đã chặn (còn 1)',
      },
    ],
    ssi: [
      {
        actor: 'Both',
        actionEn: 'T1 & T2 read t0 (count=2) and set SIREAD(shift=42)',
        actionVi: 'T1 & T2 đọc t0 (count=2) và đặt SIREAD(shift=42)',
        detailEn: 'Instead of blocking locks, SSI attaches non-blocking SIREAD tripwires on the shift=42 index entry (catching phantoms too).',
        detailVi: 'Thay vì lock chặn, SSI đặt các bẫy SIREAD không chặn trên entry index shift=42 (bắt được cả dòng phantom chưa tồn tại).',
        t1: 'active', t2: 'active',
        rows: [
          { key: 'Dr. Lan', versions: [V('v1', 'on_call = true (t0)', 'trực = true (t0)', 'committed')] },
          { key: 'Dr. Minh', versions: [V('v1', 'on_call = true (t0)', 'trực = true (t0)', 'committed')] },
        ],
        locks: [
          { kind: 'SIREAD', holder: 'T1', targetEn: 'shift=42 (tripwire)', targetVi: 'shift=42 (bẫy)' },
          { kind: 'SIREAD', holder: 'T2', targetEn: 'shift=42 (tripwire)', targetVi: 'shift=42 (bẫy)' },
        ],
        seenEn: 'Both read count = 2 with zero blocking.',
        seenVi: 'Cả hai đọc count = 2 mà không phải chờ.',
        concurrencyEn: '2 SIREAD tripwires', concurrencyVi: '2 bẫy SIREAD',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'Both',
        actionEn: 'Both write disjoint rows → mutual rw-cycle',
        actionVi: 'Cả hai ghi hai dòng riêng → tạo vòng rw hai chiều',
        detailEn: 'T1’s write to Lan trips T2’s SIREAD (T2 --rw--> T1); T2’s write to Minh trips T1’s SIREAD (T1 --rw--> T2). Neither blocks yet!',
        detailVi: 'T1 sửa Lan làm bật bẫy T2 (T2 --rw--> T1); T2 sửa Minh làm bật bẫy T1 (T1 --rw--> T2). Cả hai vẫn chưa ai bị chặn!',
        t1: 'active', t2: 'active',
        rows: [
          { key: 'Dr. Lan', versions: [V('v2', 'false (T1 open)', 'nghỉ (T1 mở)', 'uncommitted')] },
          { key: 'Dr. Minh', versions: [V('v2', 'false (T2 open)', 'nghỉ (T2 mở)', 'uncommitted')] },
        ],
        locks: [
          { kind: 'RW', holder: 'SSI', targetEn: 'T2 --rw--> T1', targetVi: 'T2 --rw--> T1' },
          { kind: 'RW', holder: 'SSI', targetEn: 'T1 --rw--> T2', targetVi: 'T1 --rw--> T2' },
        ],
        seenEn: 'Both marked with outdated-premise warnings.',
        seenVi: 'Cả hai bị gắn cờ cảnh báo tiền đề cũ.',
        concurrencyEn: 'Dangerous rw-cycle', concurrencyVi: 'Vòng rw nguy hiểm',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T1',
        actionEn: 'T1 commits first (succeeds)',
        actionVi: 'T1 commit trước (thành công)',
        detailEn: 'When T1 commits, T2 has not committed yet, so T1 is allowed to commit. Its rw-warning stays recorded for T2.',
        detailVi: 'Lúc T1 commit thì T2 vẫn chưa commit, nên T1 được phép hoàn tất. Cảnh báo rw vẫn được giữ lại để xét T2.',
        t1: 'committed', t2: 'active',
        rows: [
          { key: 'Dr. Lan', versions: [V('v2', 'on_call = false', 'nghỉ = false', 'committed')] },
          { key: 'Dr. Minh', versions: [V('v1', 'true (T1 committed)', 'trực (T1 đã chốt)', 'committed'), V('v2', 'false (T2 open)', 'nghỉ (T2 mở)', 'uncommitted')] },
        ],
        locks: [{ kind: 'RW', holder: 'SSI', targetEn: 'T2 --rw--> T1 (committed)', targetVi: 'T2 --rw--> T1 (đã chốt)' }],
        seenEn: 'T1 committed; T2 now depends on stale read.',
        seenVi: 'T1 đã chốt; T2 giờ dựa trên bản đọc cũ.',
        concurrencyEn: 'T1 wins race', concurrencyVi: 'T1 chốt trước',
        outcome: 'running', outcomeEn: 'In progress', outcomeVi: 'Đang chạy',
      },
      {
        actor: 'T2',
        actionEn: 'SSI tripwire aborts T2 (40001); retry sees 1',
        actionVi: 'Bẫy SSI huỷ T2 (40001); chạy lại thấy còn 1',
        detailEn: 'At T2’s commit, SSI sees a committed rw-conflict cycle (T1 ←→ T2) and aborts T2. Retrying sees count = 1 and keeps Minh on call!',
        detailVi: 'Lúc T2 đòi commit, SSI thấy vòng xung đột rw đã có bên commit (T1 ←→ T2) nên huỷ T2. Lần chạy lại thấy count = 1 và giữ Minh ở lại trực!',
        t1: 'committed', t2: 'aborted',
        rows: [
          { key: 'Dr. Lan', versions: [V('v2', 'on_call = false', 'nghỉ = false', 'committed')] },
          { key: 'Dr. Minh', versions: [V('v1', 'on_call = true', 'trực = true', 'committed')] },
        ],
        locks: [],
        seenEn: '1 doctor stays on call (T2 aborted cleanly).',
        seenVi: 'Còn 1 bác sĩ trực (T2 abort an toàn).',
        concurrencyEn: 'Tripwire aborted T2', concurrencyVi: 'Bẫy đã huỷ T2',
        outcome: 'good', outcomeEn: 'Prevented (1 left)', outcomeVi: 'Đã chặn (còn 1)',
      },
    ],
  },
};

function statusLabel(s: TxStatus): { en: string; vi: string } {
  switch (s) {
    case 'idle': return { en: 'idle', vi: 'chưa mở' };
    case 'active': return { en: 'running', vi: 'đang chạy' };
    case 'waiting': return { en: 'blocked', vi: 'bị chặn' };
    case 'committed': return { en: 'committed', vi: 'đã commit' };
    case 'aborted': return { en: 'aborted (40001)', vi: 'đã abort' };
  }
}

export default function TxIsolationDemo() {
  const [scenario, setScenario] = useState<ScenarioId>('write-skew');
  const [level, setLevel] = useState<LevelId>('si');
  const [stepIdx, setStepIdx] = useState<number>(0);

  const trace = TRACES[scenario][level];
  const frame = trace[stepIdx];

  const selectScenario = (id: ScenarioId) => {
    setScenario(id);
    setStepIdx(0);
  };
  const selectLevel = (id: LevelId) => {
    setLevel(id);
    setStepIdx(0);
  };

  const t1Lbl = statusLabel(frame.t1);
  const t2Lbl = statusLabel(frame.t2);

  return (
    <div className="sd txi">
      <div className="sd-controls">
        <div className="sd-group" role="group" aria-label="Scenario">
          <span>
            <span data-lang-en>Scenario</span>
            <span data-lang-vi>Tình huống</span>
          </span>
          {SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              type="button"
              className={`sd-btn${scenario === sc.id ? ' is-on' : ''}`}
              aria-pressed={scenario === sc.id}
              onClick={() => selectScenario(sc.id)}
            >
              <span data-lang-en>{sc.en}</span>
              <span data-lang-vi>{sc.vi}</span>
            </button>
          ))}
        </div>

        <div className="sd-group" role="group" aria-label="Isolation level">
          <span>
            <span data-lang-en>Isolation</span>
            <span data-lang-vi>Mức cô lập</span>
          </span>
          {LEVELS.map((lv) => (
            <button
              key={lv.id}
              type="button"
              className={`sd-btn${level === lv.id ? ' is-on' : ''}`}
              aria-pressed={level === lv.id}
              onClick={() => selectLevel(lv.id)}
            >
              <span data-lang-en>{lv.en}</span>
              <span data-lang-vi>{lv.vi}</span>
            </button>
          ))}
        </div>

        <div className="sd-group txi-step-nav">
          <button
            type="button"
            className="sd-btn"
            disabled={stepIdx === 0}
            onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
          >
            <span data-lang-en>Prev</span>
            <span data-lang-vi>Lùi</span>
          </button>
          <button
            type="button"
            className="sd-btn is-on"
            disabled={stepIdx === trace.length - 1}
            onClick={() => setStepIdx((i) => Math.min(trace.length - 1, i + 1))}
          >
            <span data-lang-en>Next step</span>
            <span data-lang-vi>Bước tiếp</span>
          </button>
          <button
            type="button"
            className="sd-btn"
            disabled={stepIdx === 0}
            onClick={() => setStepIdx(0)}
          >
            <span data-lang-en>Reset</span>
            <span data-lang-vi>Đặt lại</span>
          </button>
        </div>
      </div>

      <div className="sd-stats">
        <div className="sd-stat">
          <b>{stepIdx + 1} / {trace.length}</b>
          <span>
            <span data-lang-en>step</span>
            <span data-lang-vi>bước</span>
          </span>
        </div>
        <div className="sd-stat">
          <b>{frame.locks.length}</b>
          <span>
            <span data-lang-en>locks / tripwires</span>
            <span data-lang-vi>lock / bẫy SSI</span>
          </span>
        </div>
        <div className="sd-stat">
          <b className="txi-stat-text">
            <span data-lang-en>{frame.concurrencyEn}</span>
            <span data-lang-vi>{frame.concurrencyVi}</span>
          </b>
          <span>
            <span data-lang-en>engine action</span>
            <span data-lang-vi>trạng thái engine</span>
          </span>
        </div>
        <div className={`sd-stat${frame.outcome === 'bad' ? ' is-bad' : frame.outcome === 'good' ? ' is-good' : ''}`}>
          <b className="txi-stat-text">
            <span data-lang-en>{frame.outcomeEn}</span>
            <span data-lang-vi>{frame.outcomeVi}</span>
          </b>
          <span>
            <span data-lang-en>outcome</span>
            <span data-lang-vi>kết quả</span>
          </span>
        </div>
      </div>

      <div className="txi-msg" aria-live="polite">
        <span data-lang-en>{frame.detailEn}</span>
        <span data-lang-vi>{frame.detailVi}</span>
      </div>

      <div className="txi-cols">
        <div className="txi-col">
          <p className="txi-h">
            <span data-lang-en>Execution timeline</span>
            <span data-lang-vi>Trình tự thực thi</span>
          </p>
          <div className="txi-tx-badges">
            <span className={`txi-tx is-${frame.t1}`}>
              T1: <span data-lang-en>{t1Lbl.en}</span><span data-lang-vi>{t1Lbl.vi}</span>
            </span>
            <span className={`txi-tx is-${frame.t2}`}>
              T2: <span data-lang-en>{t2Lbl.en}</span><span data-lang-vi>{t2Lbl.vi}</span>
            </span>
          </div>
          <ol className="txi-steps">
            {trace.map((st, idx) => {
              const cls = idx === stepIdx ? 'is-current' : idx < stepIdx ? 'is-done' : 'is-pending';
              const badEnd = idx === stepIdx && st.outcome === 'bad';
              return (
                <li key={idx}>
                  <button
                    type="button"
                    className={`txi-step ${cls}${badEnd ? ' is-bad' : ''}`}
                    onClick={() => setStepIdx(idx)}
                  >
                    <span className="txi-step-num">{idx + 1}</span>
                    <span className="txi-step-actor">{st.actor}</span>
                    <span className="txi-step-text">
                      <span data-lang-en>{st.actionEn}</span>
                      <span data-lang-vi>{st.actionVi}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="txi-col">
          <p className="txi-h">
            <span data-lang-en>Engine internals (MVCC, locks &amp; tripwires)</span>
            <span data-lang-vi>Bên trong engine (MVCC, lock &amp; bẫy SSI)</span>
          </p>

          <div className="txi-box">
            <p className="txi-box-title">
              <span data-lang-en>Row versions in storage</span>
              <span data-lang-vi>Các phiên bản dòng trên bộ nhớ</span>
            </p>
            <div className="txi-rows">
              {frame.rows.map((r) => (
                <div key={r.key} className="txi-row">
                  <b className="txi-row-key">{r.key}</b>
                  <div className="txi-vers">
                    {r.versions.map((ver, i) => (
                      <span key={i} className={`txi-ver is-${ver.status}`}>
                        <small>{ver.ver}</small>{' '}
                        <span data-lang-en>{ver.valEn}</span>
                        <span data-lang-vi>{ver.valVi}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="txi-seen">
              <span data-lang-en>{frame.seenEn}</span>
              <span data-lang-vi>{frame.seenVi}</span>
            </p>
          </div>

          <div className="txi-box">
            <p className="txi-box-title">
              <span data-lang-en>Active locks &amp; SSI conflict edges</span>
              <span data-lang-vi>Lock đang giữ &amp; cạnh xung đột SSI</span>
            </p>
            {frame.locks.length === 0 ? (
              <p className="txi-none">
                <span data-lang-en>No locks or tripwires currently held.</span>
                <span data-lang-vi>Hiện không có lock hay bẫy nào đang giữ.</span>
              </p>
            ) : (
              <div className="txi-locks">
                {frame.locks.map((lk, i) => (
                  <div key={i} className={`txi-lock is-${lk.kind.toLowerCase()}`}>
                    <span className="txi-lock-kind">{lk.kind}</span>
                    <span className="txi-lock-holder">{lk.holder}</span>
                    <span className="txi-lock-target">
                      <span data-lang-en>{lk.targetEn}</span>
                      <span data-lang-vi>{lk.targetVi}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
