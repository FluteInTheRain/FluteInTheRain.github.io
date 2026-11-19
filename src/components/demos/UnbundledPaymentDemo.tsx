import React, { useState } from 'react';

// Deterministic simulator comparing a $11 transfer across 3 architectures:
// 1. Naive ACID transaction (no client request_id -> dropped HTTP response + retry charges $22)
// 2. End-to-end client request_id (UNIQUE requests table -> retry safely aborted)
// 3. Unbundled 3-stage partitioned stream (Shard A -> Shard B via logs, plus compensating apology when funds run short)

type Mode = 'naive' | 'e2e' | 'unbundled';
type Scenario = 'drop-ack' | 'short-funds';
type StepKind = 'ok' | 'warn' | 'bad' | 'good';

type TraceStep = {
  id: string;
  actorEn: string;
  actorVi: string;
  tagEn: string;
  tagVi: string;
  detailEn: string;
  detailVi: string;
  kind: StepKind;
  payerBalance: number;
  payeeBalance: number;
  debited: number;
  requestsRows: { id: string; statusEn: string; statusVi: string; kind: StepKind }[];
  shardBSeen: string[];
};

const PAY_AMOUNT = 11;

function buildTrace(mode: Mode, scenario: Scenario): {
  steps: TraceStep[];
  locksEn: string;
  locksVi: string;
  summaryEn: string;
  summaryVi: string;
  outcomeKind: 'bad' | 'good' | 'warn';
} {
  if (scenario === 'drop-ack') {
    const startA = 25;
    const startB = 100;

    if (mode === 'naive') {
      return {
        locksEn: 'DB row locks',
        locksVi: 'Khóa dòng DB',
        outcomeKind: 'bad',
        summaryEn: 'Double-charged $22.00! ACID guaranteed all-or-nothing inside SQL, but could not tell a retry from a new payment.',
        summaryVi: 'Trừ nhầm $22.00! ACID đảm bảo toàn vẹn trong SQL, nhưng không phân biệt được lần gửi lại với một thanh toán mới.',
        steps: [
          {
            id: 'S1',
            actorEn: 'Attempt #1 · Client -> DB',
            actorVi: 'Lần 1 · Client -> DB',
            tagEn: 'COMMITTED',
            tagVi: 'ĐÃ COMMIT',
            detailEn: 'BEGIN; A -= $11, B += $11; COMMIT succeeds on the database server.',
            detailVi: 'BEGIN; A -= $11, B += $11; COMMIT thành công trên server database.',
            kind: 'ok',
            payerBalance: startA - PAY_AMOUNT,
            payeeBalance: startB + PAY_AMOUNT,
            debited: 11,
            requestsRows: [],
            shardBSeen: [],
          },
          {
            id: 'S2',
            actorEn: 'Network · Server -> Browser',
            actorVi: 'Mạng · Server -> Trình duyệt',
            tagEn: 'ACK LOST',
            tagVi: 'MẤT PHẢN HỒI',
            detailEn: 'Cellular drop severs the TCP/HTTP response before the browser sees "200 OK".',
            detailVi: 'Rớt mạng làm đứt gói HTTP trả về trước khi trình duyệt kịp nhận "200 OK".',
            kind: 'warn',
            payerBalance: startA - PAY_AMOUNT,
            payeeBalance: startB + PAY_AMOUNT,
            debited: 11,
            requestsRows: [],
            shardBSeen: [],
          },
          {
            id: 'S3',
            actorEn: 'Attempt #2 · Auto retry',
            actorVi: 'Lần 2 · Tự gửi lại',
            tagEn: 'NO ID KEY',
            tagVi: 'THIẾU ID',
            detailEn: 'Client times out and retries POST /pay. Server starts a brand-new SQL transaction.',
            detailVi: 'Client quá thời gian chờ nên gửi lại POST /pay. Server mở một transaction mới tinh.',
            kind: 'warn',
            payerBalance: startA - PAY_AMOUNT,
            payeeBalance: startB + PAY_AMOUNT,
            debited: 11,
            requestsRows: [],
            shardBSeen: [],
          },
          {
            id: 'S4',
            actorEn: 'Database · Second COMMIT',
            actorVi: 'Database · COMMIT lần hai',
            tagEn: 'DOUBLE CHARGE',
            tagVi: 'TRỪ TIỀN 2 LẦN',
            detailEn: 'No uniqueness constraint stops it: A drops to $3.00 and B receives $22.00 total.',
            detailVi: 'Không có ràng buộc duy nhất nào chặn lại: A tụt xuống $3.00 còn B nhận tận $22.00.',
            kind: 'bad',
            payerBalance: startA - PAY_AMOUNT * 2,
            payeeBalance: startB + PAY_AMOUNT * 2,
            debited: 22,
            requestsRows: [],
            shardBSeen: [],
          },
        ],
      };
    }

    if (mode === 'e2e') {
      return {
        locksEn: '2PC if sharded',
        locksVi: 'Cần 2PC nếu chia shard',
        outcomeKind: 'good',
        summaryEn: 'Charged $11.00 once. Passing request_id req-7f9a from the browser lets UNIQUE(request_id) reject the duplicate.',
        summaryVi: 'Chỉ trừ đúng $11.00. Truyền request_id req-7f9a từ trình duyệt giúp UNIQUE(request_id) chặn đứng bản lặp.',
        steps: [
          {
            id: 'S1',
            actorEn: 'Attempt #1 · Client (req-7f9a)',
            actorVi: 'Lần 1 · Client (req-7f9a)',
            tagEn: 'INSERT + COMMIT',
            tagVi: 'GHI + COMMIT',
            detailEn: 'Inserts req-7f9a into UNIQUE requests table and moves $11 from A to B in one transaction.',
            detailVi: 'Chèn req-7f9a vào bảng requests (UNIQUE) và chuyển $11 từ A sang B trong cùng transaction.',
            kind: 'ok',
            payerBalance: startA - PAY_AMOUNT,
            payeeBalance: startB + PAY_AMOUNT,
            debited: 11,
            requestsRows: [{ id: 'req-7f9a', statusEn: 'committed ($11)', statusVi: 'đã commit ($11)', kind: 'good' }],
            shardBSeen: [],
          },
          {
            id: 'S2',
            actorEn: 'Network · Server -> Browser',
            actorVi: 'Mạng · Server -> Trình duyệt',
            tagEn: 'ACK LOST',
            tagVi: 'MẤT PHẢN HỒI',
            detailEn: 'HTTP response drops after COMMIT; the browser still holds the hidden req-7f9a token.',
            detailVi: 'Gói HTTP trả về bị rớt sau COMMIT; trình duyệt vẫn giữ nguyên mã req-7f9a của thao tác đó.',
            kind: 'warn',
            payerBalance: startA - PAY_AMOUNT,
            payeeBalance: startB + PAY_AMOUNT,
            debited: 11,
            requestsRows: [{ id: 'req-7f9a', statusEn: 'committed ($11)', statusVi: 'đã commit ($11)', kind: 'good' }],
            shardBSeen: [],
          },
          {
            id: 'S3',
            actorEn: 'Attempt #2 · Retry (req-7f9a)',
            actorVi: 'Lần 2 · Gửi lại (req-7f9a)',
            tagEn: 'SAME ID',
            tagVi: 'CÙNG ID',
            detailEn: 'Browser retries POST /pay with the exact same request_id = req-7f9a.',
            detailVi: 'Trình duyệt gửi lại POST /pay kèm đúng request_id = req-7f9a ban đầu.',
            kind: 'ok',
            payerBalance: startA - PAY_AMOUNT,
            payeeBalance: startB + PAY_AMOUNT,
            debited: 11,
            requestsRows: [{ id: 'req-7f9a', statusEn: 'committed ($11)', statusVi: 'đã commit ($11)', kind: 'good' }],
            shardBSeen: [],
          },
          {
            id: 'S4',
            actorEn: 'Database · UNIQUE check',
            actorVi: 'Database · Kiểm tra UNIQUE',
            tagEn: 'DEDUPED',
            tagVi: 'ĐÃ LỌC TRÙNG',
            detailEn: 'INSERT fails on UNIQUE(request_id) -> transaction aborts, returns prior receipt. Charged $11 once.',
            detailVi: 'Lệnh INSERT đụng UNIQUE(request_id) -> hủy transaction, trả biên lai cũ. Chỉ trừ đúng $11.',
            kind: 'good',
            payerBalance: startA - PAY_AMOUNT,
            payeeBalance: startB + PAY_AMOUNT,
            debited: 11,
            requestsRows: [{ id: 'req-7f9a', statusEn: 'duplicate blocked', statusVi: 'chặn bản lặp', kind: 'good' }],
            shardBSeen: [],
          },
        ],
      };
    }

    // unbundled mode + drop-ack
    return {
      locksEn: '0 (async logs)',
      locksVi: '0 (log bất đồng bộ)',
      outcomeKind: 'good',
      summaryEn: 'Charged $11.00 once across separate shards with zero distributed locks. Shard A and Shard B deduplicate independently.',
      summaryVi: 'Chỉ trừ $11.00 đúng một lần xuyên qua các shard riêng biệt mà không cần khóa phân tán. Shard A và B tự lọc trùng độc lập.',
      steps: [
        {
          id: 'S1',
          actorEn: 'Stage 0 · Client -> Shard A log',
          actorVi: 'Chặng 0 · Client -> Log Shard A',
          tagEn: 'LOGGED',
          tagVi: 'ĐÃ GHI LOG',
          detailEn: 'Request req-7f9a appended atomically to Shard A log; HTTP response drops before reaching browser.',
          detailVi: 'Yêu cầu req-7f9a được ghi nối vào log Shard A; gói HTTP trả về bị rớt trước khi tới trình duyệt.',
          kind: 'warn',
          payerBalance: startA,
          payeeBalance: startB,
          debited: 0,
          requestsRows: [{ id: 'req-7f9a', statusEn: 'in Shard A log (offset 41)', statusVi: 'trong log Shard A (offset 41)', kind: 'ok' }],
          shardBSeen: [],
        },
        {
          id: 'S2',
          actorEn: 'Stage 0 · Client retry -> Shard A',
          actorVi: 'Chặng 0 · Client thử lại',
          tagEn: 'REPLAY SAFE',
          tagVi: 'LẶP AN TOÀN',
          detailEn: 'Retry appends req-7f9a at offset 42. Shard A processor consumes sequentially and keeps seen_ids.',
          detailVi: 'Bản gửi lại nối tiếp req-7f9a ở offset 42. Processor Shard A đọc tuần tự và giữ bảng seen_ids.',
          kind: 'ok',
          payerBalance: startA,
          payeeBalance: startB,
          debited: 0,
          requestsRows: [
            { id: 'req-7f9a (41)', statusEn: 'queued', statusVi: 'chờ xử lý', kind: 'ok' },
            { id: 'req-7f9a (42)', statusEn: 'duplicate in log', statusVi: 'bản lặp trong log', kind: 'warn' },
          ],
          shardBSeen: [],
        },
        {
          id: 'S3',
          actorEn: 'Stage 1 · Shard A processor',
          actorVi: 'Chặng 1 · Processor Shard A',
          tagEn: 'RESERVED $11',
          tagVi: 'ĐÃ GIỮ $11',
          detailEn: 'Offset 41 reserves $11 (A: $14.00) and emits Outgoing(A) + Incoming(B, req-7f9a). Offset 42 is ignored.',
          detailVi: 'Offset 41 trừ giữ $11 (A còn $14.00) và phát event sang Shard B. Offset 42 thấy trùng nên bỏ qua.',
          kind: 'ok',
          payerBalance: startA - PAY_AMOUNT,
          payeeBalance: startB,
          debited: 11,
          requestsRows: [{ id: 'req-7f9a', statusEn: 'reserved & ignored dup', statusVi: 'đã trừ & bỏ bản lặp', kind: 'good' }],
          shardBSeen: [],
        },
        {
          id: 'S4',
          actorEn: 'Stage 2 · Shard B payee',
          actorVi: 'Chặng 2 · Shard B người nhận',
          tagEn: 'SETTLED ONCE',
          tagVi: 'TẤT TOÁN 1 LẦN',
          detailEn: 'Shard B records req-7f9a in its own seen_ids, credits +$11 (B: $111.00), and notifies client.',
          detailVi: 'Shard B lưu req-7f9a vào seen_ids riêng, cộng +$11 (B: $111.00), và báo hoàn tất cho client.',
          kind: 'good',
          payerBalance: startA - PAY_AMOUNT,
          payeeBalance: startB + PAY_AMOUNT,
          debited: 11,
          requestsRows: [{ id: 'req-7f9a', statusEn: 'settled (-$11)', statusVi: 'hoàn tất (-$11)', kind: 'good' }],
          shardBSeen: ['req-7f9a (+$11)'],
        },
      ],
    };
  }

  // Scenario 2: short-funds ($6.00 available for $11.00 payment)
  const startA = 6;
  const startB = 100;

  if (mode === 'naive' || mode === 'e2e') {
    return {
      locksEn: mode === 'naive' ? 'DB CHECK lock' : '2PC if sharded',
      locksVi: mode === 'naive' ? 'Khóa CHECK DB' : 'Cần 2PC nếu chia shard',
      outcomeKind: 'warn',
      summaryEn:
        mode === 'naive'
          ? 'Synchronous constraint blocks the overdraft immediately, but requires both accounts inside one lockable transaction.'
          : 'Synchronous UNIQUE + CHECK rejects the $11 debit cleanly—provided Payer and Payee share a single database or 2PC coordinator.',
      summaryVi:
        mode === 'naive'
          ? 'Ràng buộc đồng bộ chặn ngay giao dịch quá số dư, nhưng đòi hỏi cả hai tài khoản phải nằm chung một khóa transaction.'
          : 'UNIQUE + CHECK đồng bộ từ chối giao dịch $11 an toàn—nhưng chỉ khi hai tài khoản nằm chung DB hoặc dùng điều phối 2PC.',
      steps: [
        {
          id: 'S1',
          actorEn: 'Client -> Server',
          actorVi: 'Client -> Server',
          tagEn: 'SEND $11',
          tagVi: 'GỬI $11',
          detailEn: `Submits $11 transfer while Account A only has $${startA.toFixed(2)}.`,
          detailVi: `Gửi yêu cầu chuyển $11 trong khi Tài khoản A chỉ còn $${startA.toFixed(2)}.`,
          kind: 'ok',
          payerBalance: startA,
          payeeBalance: startB,
          debited: 0,
          requestsRows: mode === 'e2e' ? [{ id: 'req-9c4e', statusEn: 'pending', statusVi: 'đang kiểm tra', kind: 'ok' }] : [],
          shardBSeen: [],
        },
        {
          id: 'S2',
          actorEn: 'Database · Balance lock',
          actorVi: 'Database · Khóa kiểm tra số dư',
          tagEn: 'ABORTED',
          tagVi: 'HỦY BỎ',
          detailEn: 'Synchronous CHECK (balance >= 0) fails; database rolls back and returns 402/409 error.',
          detailVi: 'Ràng buộc đồng bộ CHECK (balance >= 0) báo lỗi; database rollback và trả lỗi cho client.',
          kind: 'warn',
          payerBalance: startA,
          payeeBalance: startB,
          debited: 0,
          requestsRows: mode === 'e2e' ? [{ id: 'req-9c4e', statusEn: 'aborted (short funds)', statusVi: 'hủy (thiếu tiền)', kind: 'warn' }] : [],
          shardBSeen: [],
        },
      ],
    };
  }

  // Unbundled 3-stage with optimistic checkout + compensating apology/refund
  return {
    locksEn: '0 (compensate)',
    locksVi: '0 (hoàn bù trừ)',
    outcomeKind: 'good',
    summaryEn: 'Integrity preserved without global locks: Shard A detects $6 < $11, declines settlement, and runs a compensating refund + apology.',
    summaryVi: 'Toàn vẹn giữ vững mà không cần khóa toàn cục: Shard A phát hiện $6 < $11, từ chối tất toán và chạy quy trình hoàn tiền + xin lỗi.',
    steps: [
      {
        id: 'S1',
        actorEn: 'Stage 0 · Optimistic order (req-9c4e)',
        actorVi: 'Chặng 0 · Đặt hàng lạc quan (req-9c4e)',
        tagEn: 'ACCEPTED',
        tagVi: 'TIẾP NHẬN',
        detailEn: 'Client appends req-9c4e ($11) to Shard A log without waiting for cross-shard locks; order provisionally shown.',
        detailVi: 'Client ghi req-9c4e ($11) vào log Shard A mà không khóa liên shard; đơn hàng ghi nhận tạm thời.',
        kind: 'ok',
        payerBalance: startA,
        payeeBalance: startB,
        debited: 0,
        requestsRows: [{ id: 'req-9c4e', statusEn: 'queued (optimistic)', statusVi: 'trong hàng đợi', kind: 'ok' }],
        shardBSeen: [],
      },
      {
        id: 'S2',
        actorEn: 'Stage 1 · Shard A processor',
        actorVi: 'Chặng 1 · Processor Shard A',
        tagEn: 'FUNDS SHORT',
        tagVi: 'THIẾU SỐ DƯ',
        detailEn: 'Reads local balance ($6.00 < $11.00). Never emits Incoming(+$11) to Shard B—no phantom money created.',
        detailVi: 'Đọc số dư cục bộ ($6.00 < $11.00). Tuyệt đối không phát event cộng tiền sang Shard B.',
        kind: 'warn',
        payerBalance: startA,
        payeeBalance: startB,
        debited: 0,
        requestsRows: [{ id: 'req-9c4e', statusEn: 'declined ($6 < $11)', statusVi: 'từ chối ($6 < $11)', kind: 'warn' }],
        shardBSeen: [],
      },
      {
        id: 'S3',
        actorEn: 'Stage 2 · Apology & compensation',
        actorVi: 'Chặng 2 · Bù trừ & xin lỗi',
        tagEn: 'COMPENSATED',
        tagVi: 'ĐÃ HOÀN BÙ',
        detailEn: 'Emits Declined(req-9c4e): cancels provisional order, releases any hold, and emails an apology to the customer.',
        detailVi: 'Phát event Declined(req-9c4e): hủy đơn tạm, giải phóng giữ tiền và gửi thông báo xin lỗi cho khách.',
        kind: 'good',
        payerBalance: startA,
        payeeBalance: startB,
        debited: 0,
        requestsRows: [{ id: 'req-9c4e', statusEn: 'apology + hold released', statusVi: 'xin lỗi + hủy giữ tiền', kind: 'good' }],
        shardBSeen: ['none (never credited)'],
      },
    ],
  };
}

const fmtMoney = (n: number) => `$${n.toFixed(2)}`;

export default function UnbundledPaymentDemo() {
  const [mode, setMode] = useState<Mode>('naive');
  const [scenario, setScenario] = useState<Scenario>('drop-ack');
  const [visibleCount, setVisibleCount] = useState<number>(4);

  const trace = buildTrace(mode, scenario);
  const clampedCount = Math.min(Math.max(1, visibleCount), trace.steps.length);
  const currentStep = trace.steps[clampedCount - 1];
  const isComplete = clampedCount === trace.steps.length;

  function selectMode(nextMode: Mode) {
    const nextTrace = buildTrace(nextMode, scenario);
    setMode(nextMode);
    setVisibleCount(nextTrace.steps.length);
  }

  function selectScenario(nextScenario: Scenario) {
    const nextTrace = buildTrace(mode, nextScenario);
    setScenario(nextScenario);
    setVisibleCount(nextTrace.steps.length);
  }

  function startStepByStep() {
    setVisibleCount(1);
  }

  function nextStep() {
    setVisibleCount((prev) => Math.min(prev + 1, trace.steps.length));
  }

  const debitedClass =
    isComplete && currentStep.debited > PAY_AMOUNT
      ? 'sd-stat is-bad'
      : isComplete && trace.outcomeKind === 'good'
        ? 'sd-stat is-good'
        : 'sd-stat';

  return (
    <div className="sd unb">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Mode</span>
            <span data-lang-vi>Kiến trúc</span>
          </span>
          <button
            type="button"
            className={mode === 'naive' ? 'sd-btn is-on' : 'sd-btn'}
            aria-pressed={mode === 'naive'}
            onClick={() => selectMode('naive')}
          >
            <span data-lang-en>1. Naive ACID</span>
            <span data-lang-vi>1. ACID thông thường</span>
          </button>
          <button
            type="button"
            className={mode === 'e2e' ? 'sd-btn is-on' : 'sd-btn'}
            aria-pressed={mode === 'e2e'}
            onClick={() => selectMode('e2e')}
          >
            <span data-lang-en>2. End-to-end ID</span>
            <span data-lang-vi>2. request_id đầu-cuối</span>
          </button>
          <button
            type="button"
            className={mode === 'unbundled' ? 'sd-btn is-on' : 'sd-btn'}
            aria-pressed={mode === 'unbundled'}
            onClick={() => selectMode('unbundled')}
          >
            <span data-lang-en>3. Unbundled stream</span>
            <span data-lang-vi>3. Stream 3 chặng</span>
          </button>
        </div>

        <div className="sd-group">
          <span>
            <span data-lang-en>Scenario</span>
            <span data-lang-vi>Kịch bản</span>
          </span>
          <button
            type="button"
            className={scenario === 'drop-ack' ? 'sd-btn is-on' : 'sd-btn'}
            aria-pressed={scenario === 'drop-ack'}
            onClick={() => selectScenario('drop-ack')}
          >
            <span data-lang-en>Drop ACK + retry ($25)</span>
            <span data-lang-vi>Rớt ACK + thử lại ($25)</span>
          </button>
          <button
            type="button"
            className={scenario === 'short-funds' ? 'sd-btn is-on' : 'sd-btn'}
            aria-pressed={scenario === 'short-funds'}
            onClick={() => selectScenario('short-funds')}
          >
            <span data-lang-en>Short funds ($6 left)</span>
            <span data-lang-vi>Thiếu tiền (còn $6)</span>
          </button>
        </div>

        <div className="sd-group sd-run">
          <button type="button" className="sd-btn" onClick={startStepByStep}>
            <span data-lang-en>Step from 1</span>
            <span data-lang-vi>Chạy từ bước 1</span>
          </button>
          <button type="button" className="sd-btn" disabled={isComplete} onClick={nextStep}>
            <span data-lang-en>Next step ({clampedCount}/{trace.steps.length})</span>
            <span data-lang-vi>Bước tiếp ({clampedCount}/{trace.steps.length})</span>
          </button>
        </div>
      </div>

      <div className="sd-stats">
        <div className="sd-stat">
          <b>{fmtMoney(currentStep.payerBalance)}</b>
          <span>
            <span data-lang-en>Account A (payer)</span>
            <span data-lang-vi>Tài khoản A (gửi)</span>
          </span>
        </div>
        <div className="sd-stat">
          <b>{fmtMoney(currentStep.payeeBalance)}</b>
          <span>
            <span data-lang-en>Account B (payee)</span>
            <span data-lang-vi>Tài khoản B (nhận)</span>
          </span>
        </div>
        <div className={debitedClass}>
          <b>{fmtMoney(currentStep.debited)}</b>
          <span>
            <span data-lang-en>Total debited</span>
            <span data-lang-vi>Tổng tiền bị trừ</span>
          </span>
        </div>
        <div className="sd-stat">
          <b className="unb-lock-val">
            <span data-lang-en>{trace.locksEn}</span>
            <span data-lang-vi>{trace.locksVi}</span>
          </b>
          <span>
            <span data-lang-en>Coordination</span>
            <span data-lang-vi>Điều phối</span>
          </span>
        </div>
      </div>

      <p className={`unb-summary is-${isComplete ? trace.outcomeKind : 'neutral'}`} aria-live="polite">
        {isComplete ? (
          <>
            <span data-lang-en>{trace.summaryEn}</span>
            <span data-lang-vi>{trace.summaryVi}</span>
          </>
        ) : (
          <>
            <span data-lang-en>Stepping through hop {clampedCount} of {trace.steps.length}. Click Next step to continue.</span>
            <span data-lang-vi>Đang xem bước {clampedCount}/{trace.steps.length}. Bấm Bước tiếp để chạy tiếp.</span>
          </>
        )}
      </p>

      <div className="unb-cols">
        <div className="unb-panel">
          <p className="unb-h">
            <span data-lang-en>Execution trace</span>
            <span data-lang-vi>Luồng thực thi từng chặng</span>
          </p>
          <div className="unb-list">
            {trace.steps.map((st, idx) => {
              const visible = idx < clampedCount;
              const active = idx === clampedCount - 1;
              return (
                <div
                  key={st.id}
                  className={`unb-step${visible ? '' : ' is-pending'}${active ? ` is-active is-${st.kind}` : ''}`}
                >
                  <div className="unb-step-head">
                    <span className="unb-seq">{st.id}</span>
                    <b className="unb-actor">
                      <span data-lang-en>{st.actorEn}</span>
                      <span data-lang-vi>{st.actorVi}</span>
                    </b>
                    <span className={`unb-tag is-${st.kind}`}>
                      <span data-lang-en>{st.tagEn}</span>
                      <span data-lang-vi>{st.tagVi}</span>
                    </span>
                  </div>
                  <p className="unb-step-detail">
                    <span data-lang-en>{st.detailEn}</span>
                    <span data-lang-vi>{st.detailVi}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="unb-panel">
          <p className="unb-h">
            <span data-lang-en>Persistent state &amp; deduplication</span>
            <span data-lang-vi>Trạng thái lưu trữ &amp; bảng lọc trùng</span>
          </p>

          <div className="unb-box">
            <p className="unb-box-title">
              <span data-lang-en>Requests / Shard A seen_ids</span>
              <span data-lang-vi>Bảng requests / seen_ids ở Shard A</span>
            </p>
            {currentStep.requestsRows.length === 0 ? (
              <p className="unb-empty">
                <span data-lang-en>None — server has no client request_id to check.</span>
                <span data-lang-vi>Trống — server không có request_id từ client để đối chiếu.</span>
              </p>
            ) : (
              <div className="unb-rows">
                {currentStep.requestsRows.map((row) => (
                  <div key={row.id} className={`unb-row is-${row.kind}`}>
                    <code>{row.id}</code>
                    <span>
                      <span data-lang-en>{row.statusEn}</span>
                      <span data-lang-vi>{row.statusVi}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="unb-box">
            <p className="unb-box-title">
              <span data-lang-en>Shard B payee ledger</span>
              <span data-lang-vi>Sổ người nhận (Shard B)</span>
            </p>
            {mode !== 'unbundled' ? (
              <p className="unb-empty">
                <span data-lang-en>Coupled directly inside the same SQL transaction as Account A.</span>
                <span data-lang-vi>Bị khóa chung trong cùng một SQL transaction với Tài khoản A.</span>
              </p>
            ) : currentStep.shardBSeen.length === 0 ? (
              <p className="unb-empty">
                <span data-lang-en>Waiting for incoming payment event from Shard A…</span>
                <span data-lang-vi>Đang chờ event chuyển tiền từ Shard A…</span>
              </p>
            ) : (
              <div className="unb-rows">
                {currentStep.shardBSeen.map((item) => (
                  <div key={item} className="unb-row is-good">
                    <code>{item}</code>
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
