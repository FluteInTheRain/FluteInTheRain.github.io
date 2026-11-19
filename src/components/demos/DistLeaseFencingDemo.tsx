import React, { useState } from 'react';

type FaultType = 'gc' | 'net' | 'ntp';
type ClockMode = 'monotonic' | 'wall';

type LogEntry = {
  step: number;
  timeEn: string;
  timeVi: string;
  en: string;
  vi: string;
  tone: 'neutral' | 'warn' | 'ok' | 'bad';
};

function computeScenario(
  fault: FaultType,
  fencingOn: boolean,
  clockMode: ClockMode,
  step: number,
) {
  const tok1 = fencingOn ? ' (token 33)' : '';
  const tok2 = fencingOn ? ' (token 34)' : '';

  const abortedLocally = fault === 'ntp' && clockMode === 'monotonic';
  const rejectedAtStorage = !abortedLocally && fencingOn;
  const corrupted = !abortedLocally && !fencingOn;

  const logs: LogEntry[] = [
    {
      step: 1,
      timeEn: 't = 0–2 s',
      timeVi: 't = 0–2 s',
      en: `Client 1 acquires a 10 s lease${tok1} from the lock service and checks lease.isValid() → true (8 s left).`,
      vi: `Client 1 lấy lease 10 s${tok1} từ lock service và kiểm tra lease.isValid() → hợp lệ (còn 8 s).`,
      tone: 'neutral',
    },
  ];

  if (fault === 'gc') {
    logs.push({
      step: 2,
      timeEn: 't = 2–10 s',
      timeVi: 't = 2–10 s',
      en: 'JVM stop-the-world GC pauses Client 1 for 15 s right after the check. At t = 10 s, the lock service expires the lease.',
      vi: 'JVM GC stop-the-world làm Client 1 khựng 15 s ngay sau dòng kiểm tra. Tới t = 10 s, lock service cho lease hết hạn.',
      tone: 'warn',
    });
  } else if (fault === 'net') {
    logs.push({
      step: 2,
      timeEn: 't = 2–10 s',
      timeVi: 't = 2–10 s',
      en: `Client 1 sends write(v1${fencingOn ? ', token 33' : ''}) and crashes, but the packet stalls in a switch queue for 60 s. At t = 10 s, the lease expires.`,
      vi: `Client 1 gửi write(v1${fencingOn ? ', token 33' : ''}) rồi sập, nhưng gói tin kẹt ở switch 60 s. Tới t = 10 s, lease hết hạn.`,
      tone: 'warn',
    });
  } else {
    logs.push({
      step: 2,
      timeEn: 't = 4–10 s',
      timeVi: 't = 4–10 s',
      en: 'NTP steps Client 1’s wall clock backward by −12 s (04 s → −08 s). Real time passes t = 10 s and the lease expires.',
      vi: 'NTP kéo đồng hồ wall-clock của Client 1 lùi 12 s (04 s → −08 s). Thời gian thực qua t = 10 s và lease hết hạn.',
      tone: 'warn',
    });
  }

  logs.push({
    step: 3,
    timeEn: 't = 11 s',
    timeVi: 't = 11 s',
    en: `Client 2 acquires the new lease${tok2} and writes v2 to storage.${fencingOn ? ' Storage records highest_token = 34.' : ''}`,
    vi: `Client 2 lấy lease mới${tok2} và ghi v2 xuống storage.${fencingOn ? ' Storage lưu highest_token = 34.' : ''}`,
    tone: 'ok',
  });

  if (fault === 'gc') {
    if (fencingOn) {
      logs.push({
        step: 4,
        timeEn: 't = 17 s',
        timeVi: 't = 17 s',
        en: 'Client 1 wakes up past its local check (even monotonic clock cannot stop it now) and sends write(v1, token 33). Storage sees 33 < 34 and rejects it.',
        vi: 'Client 1 tỉnh dậy ngay sau dòng kiểm tra (monotonic clock cũng bó tay lúc này) và gửi write(v1, token 33). Storage thấy 33 < 34 nên từ chối.',
        tone: 'ok',
      });
    } else {
      logs.push({
        step: 4,
        timeEn: 't = 17 s',
        timeVi: 't = 17 s',
        en: 'Client 1 wakes up past its local check and sends write(v1). With no fencing token check, storage overwrites v2 with stale v1 — split-brain corruption!',
        vi: 'Client 1 tỉnh dậy ngay sau dòng kiểm tra và gửi write(v1). Không có fencing token, storage cho v1 cũ ghi đè lên v2 — dữ liệu bị hỏng!',
        tone: 'bad',
      });
    }
  } else if (fault === 'net') {
    if (fencingOn) {
      logs.push({
        step: 4,
        timeEn: 't = 62 s',
        timeVi: 't = 62 s',
        en: 'The delayed packet arrives carrying token 33. Storage sees 33 < 34 and rejects it — v2 stays intact.',
        vi: 'Gói tin đến muộn mang theo token 33 tới nơi. Storage thấy 33 < 34 nên từ chối — v2 vẫn nguyên vẹn.',
        tone: 'ok',
      });
    } else {
      logs.push({
        step: 4,
        timeEn: 't = 62 s',
        timeVi: 't = 62 s',
        en: 'The delayed packet arrives from a dead client. Without fencing tokens, storage accepts it and overwrites v2 with stale v1!',
        vi: 'Gói tin đi lạc từ client đã sập cuối cùng cũng tới. Không có fencing token, storage nhận ghi và cho v1 đè lên v2!',
        tone: 'bad',
      });
    }
  } else {
    if (clockMode === 'monotonic') {
      logs.push({
        step: 4,
        timeEn: 't = 13 s',
        timeVi: 't = 13 s',
        en: 'Before writing, Client 1 checks CLOCK_MONOTONIC: 13 s elapsed ≥ 10 s lease. It detects expiry locally and aborts without touching storage.',
        vi: 'Trước khi ghi, Client 1 xem CLOCK_MONOTONIC: đã trôi 13 s ≥ 10 s. Nó tự biết lease hết hạn và hủy ngay, không gửi xuống storage.',
        tone: 'ok',
      });
    } else if (fencingOn) {
      logs.push({
        step: 4,
        timeEn: 't = 13 s',
        timeVi: 't = 13 s',
        en: 'Client 1 checks wall clock (01 s < 10 s!), wrongly thinks the lease is valid, and sends write(v1, token 33). Storage still saves the day: 33 < 34, rejected.',
        vi: 'Client 1 xem wall-clock (01 s < 10 s!), tưởng vẫn còn hạn nên gửi write(v1, token 33). May là storage vẫn cứu được: 33 < 34, từ chối.',
        tone: 'ok',
      });
    } else {
      logs.push({
        step: 4,
        timeEn: 't = 13 s',
        timeVi: 't = 13 s',
        en: 'Client 1 checks wall clock (01 s < 10 s!), sends write(v1) without a token, and overwrites v2 — split-brain corruption!',
        vi: 'Client 1 xem wall-clock (01 s < 10 s!), gửi write(v1) không kèm token và ghi đè lên v2 — dữ liệu bị hỏng!',
        tone: 'bad',
      });
    }
  }

  // Compute actor & summary states at current step
  const holderEn = step < 3 ? 'Client 1' : 'Client 2';
  const holderVi = step < 3 ? 'Client 1' : 'Client 2';
  const maxTok = !fencingOn
    ? { en: 'none (off)', vi: 'không (tắt)' }
    : step < 3
      ? { en: 'none yet', vi: 'chưa có' }
      : { en: '34', vi: '34' };

  let storageVal = { en: 'v0 (initial)', vi: 'v0 (ban đầu)' };
  if (step === 3) storageVal = { en: 'v2 (Client 2)', vi: 'v2 (Client 2)' };
  if (step === 4) {
    storageVal = corrupted
      ? { en: 'v1 (stale overwrite!)', vi: 'v1 (bị ghi đè cũ!)' }
      : { en: 'v2 (Client 2, intact)', vi: 'v2 (Client 2, nguyên vẹn)' };
  }

  let verdict = { en: 'In progress', vi: 'Đang chạy', cls: '' };
  if (step === 4) {
    if (abortedLocally) {
      verdict = { en: 'Safe · aborted locally', vi: 'An toàn · tự hủy tại client', cls: 'is-good' };
    } else if (rejectedAtStorage) {
      verdict = { en: 'Safe · token 33 rejected', vi: 'An toàn · từ chối token 33', cls: 'is-good' };
    } else {
      verdict = { en: 'Corrupted · split brain', vi: 'Hỏng dữ liệu · split brain', cls: 'is-bad' };
    }
  }

  return {
    visibleLogs: logs.slice(0, step),
    holder: { en: holderEn, vi: holderVi },
    maxTok,
    storageVal,
    verdict,
    abortedLocally,
    rejectedAtStorage,
    corrupted,
  };
}

export default function DistLeaseFencingDemo() {
  const [fault, setFault] = useState<FaultType>('gc');
  const [fencingOn, setFencingOn] = useState(true);
  const [clockMode, setClockMode] = useState<ClockMode>('monotonic');
  const [step, setStep] = useState(1);

  const s = computeScenario(fault, fencingOn, clockMode, step);

  const selectFault = (f: FaultType) => {
    setFault(f);
    setStep(1);
  };

  const c1State = (() => {
    if (step === 1) return { en: fencingOn ? 'holds token 33' : 'holds lease', vi: fencingOn ? 'giữ token 33' : 'giữ lease', cls: 'is-active' };
    if (step === 2) {
      if (fault === 'gc') return { en: 'paused (GC 15 s)', vi: 'đang khựng (GC 15 s)', cls: 'is-warn' };
      if (fault === 'net') return { en: 'crashed (packet in flight)', vi: 'đã sập (gói tin kẹt)', cls: 'is-warn' };
      return {
        en: clockMode === 'wall' ? 'wall clock −12 s' : 'monotonic clock ok',
        vi: clockMode === 'wall' ? 'wall-clock lùi 12 s' : 'monotonic đúng giờ',
        cls: 'is-warn',
      };
    }
    if (step === 3) {
      if (fault === 'gc') return { en: 'still paused in GC', vi: 'vẫn đang khựng GC', cls: 'is-warn' };
      if (fault === 'net') return { en: 'packet queued in switch', vi: 'gói tin đang kẹt switch', cls: 'is-warn' };
      return { en: 'unaware lease expired', vi: 'chưa biết lease hết hạn', cls: 'is-warn' };
    }
    if (s.abortedLocally) return { en: 'aborted write locally', vi: 'tự hủy lệnh ghi', cls: 'is-good' };
    if (s.rejectedAtStorage) return { en: 'write(tok 33) rejected', vi: 'lệnh ghi(tok 33) bị từ chối', cls: 'is-good' };
    return { en: 'zombie write succeeded!', vi: 'ghi chui thành công!', cls: 'is-bad' };
  })();

  const lockState = (() => {
    if (step === 1) return { en: fencingOn ? 'issued token 33 → C1' : 'granted lease → C1', vi: fencingOn ? 'cấp token 33 → C1' : 'cấp lease → C1', cls: 'is-active' };
    if (step === 2) return { en: 't = 10 s: C1 lease expired', vi: 't = 10 s: lease C1 hết hạn', cls: 'is-warn' };
    return { en: fencingOn ? 'issued token 34 → C2' : 'granted lease → C2', vi: fencingOn ? 'cấp token 34 → C2' : 'cấp lease → C2', cls: 'is-good' };
  })();

  const storeState = (() => {
    if (step < 3) return { en: 'idle · value = v0', vi: 'rảnh · giá trị = v0', cls: '' };
    if (step === 3) return { en: fencingOn ? 'v2 saved (maxTok = 34)' : 'v2 saved (no token)', vi: fencingOn ? 'đã lưu v2 (maxTok = 34)' : 'đã lưu v2 (không token)', cls: 'is-good' };
    if (s.abortedLocally) return { en: 'v2 safe (no stale request)', vi: 'v2 an toàn (không có ghi cũ)', cls: 'is-good' };
    if (s.rejectedAtStorage) return { en: 'rejected 33 < 34 · v2 safe', vi: 'từ chối 33 < 34 · v2 an toàn', cls: 'is-good' };
    return { en: 'v2 overwritten by v1!', vi: 'v2 bị v1 ghi đè mất!', cls: 'is-bad' };
  })();

  const c2State = (() => {
    if (step < 3) return { en: 'waiting for lease', vi: 'đang chờ tới lượt', cls: '' };
    if (step === 3) return { en: fencingOn ? 'writes v2 with token 34' : 'writes v2', vi: fencingOn ? 'ghi v2 với token 34' : 'ghi v2', cls: 'is-good' };
    if (s.corrupted) return { en: 'data silently lost!', vi: 'dữ liệu bị đè mất!', cls: 'is-bad' };
    return { en: 'write v2 preserved', vi: 'dữ liệu v2 còn nguyên', cls: 'is-good' };
  })();

  return (
    <div className="sd dlf">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Fault</span>
            <span data-lang-vi>Sự cố</span>
          </span>
          <button type="button" className={fault === 'gc' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => selectFault('gc')}>
            <span data-lang-en>JVM GC pause (15 s)</span>
            <span data-lang-vi>Khựng GC JVM (15 s)</span>
          </button>
          <button type="button" className={fault === 'net' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => selectFault('net')}>
            <span data-lang-en>Network delay (60 s)</span>
            <span data-lang-vi>Trễ mạng (60 s)</span>
          </button>
          <button type="button" className={fault === 'ntp' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => selectFault('ntp')}>
            <span data-lang-en>NTP clock jump (−12 s)</span>
            <span data-lang-vi>Nhảy đồng hồ NTP (−12 s)</span>
          </button>
        </div>

        <div className="sd-group">
          <span>
            <span data-lang-en>Guard</span>
            <span data-lang-vi>Bảo vệ</span>
          </span>
          <button
            type="button"
            className={fencingOn ? 'sd-btn is-on' : 'sd-btn'}
            aria-pressed={fencingOn}
            onClick={() => setFencingOn(!fencingOn)}
          >
            <span data-lang-en>Fencing tokens: {fencingOn ? 'ON' : 'OFF'}</span>
            <span data-lang-vi>Fencing token: {fencingOn ? 'BẬT' : 'TẮT'}</span>
          </button>
          <button
            type="button"
            className={clockMode === 'monotonic' ? 'sd-btn is-on' : 'sd-btn'}
            aria-pressed={clockMode === 'monotonic'}
            onClick={() => setClockMode(clockMode === 'monotonic' ? 'wall' : 'monotonic')}
          >
            <span data-lang-en>Expiry check: {clockMode === 'monotonic' ? 'Monotonic' : 'Wall clock'}</span>
            <span data-lang-vi>Kiểm tra hạn: {clockMode === 'monotonic' ? 'Monotonic' : 'Wall clock'}</span>
          </button>
        </div>

        <div className="sd-group sd-run">
          <button
            type="button"
            className="sd-btn"
            disabled={step >= 4}
            onClick={() => setStep((p) => Math.min(4, p + 1))}
          >
            <span data-lang-en>Next step ({step}/4)</span>
            <span data-lang-vi>Bước tiếp ({step}/4)</span>
          </button>
          <button type="button" className="sd-btn is-on" onClick={() => setStep(4)}>
            <span data-lang-en>Run to end</span>
            <span data-lang-vi>Chạy hết</span>
          </button>
          <button type="button" className="sd-btn" onClick={() => setStep(1)}>
            <span data-lang-en>Reset</span>
            <span data-lang-vi>Làm lại</span>
          </button>
        </div>
      </div>

      <div className="sd-stats">
        <div className="sd-stat">
          <b><span data-lang-en>{s.holder.en}</span><span data-lang-vi>{s.holder.vi}</span></b>
          <span><span data-lang-en>lease owner</span><span data-lang-vi>chủ lease hiện tại</span></span>
        </div>
        <div className="sd-stat">
          <b><span data-lang-en>{s.maxTok.en}</span><span data-lang-vi>{s.maxTok.vi}</span></b>
          <span><span data-lang-en>storage max token</span><span data-lang-vi>token lớn nhất ở storage</span></span>
        </div>
        <div className={`sd-stat${s.corrupted ? ' is-bad' : ''}`}>
          <b><span data-lang-en>{s.storageVal.en}</span><span data-lang-vi>{s.storageVal.vi}</span></b>
          <span><span data-lang-en>stored value</span><span data-lang-vi>giá trị đang lưu</span></span>
        </div>
        <div className={`sd-stat ${s.verdict.cls}`}>
          <b><span data-lang-en>{s.verdict.en}</span><span data-lang-vi>{s.verdict.vi}</span></b>
          <span><span data-lang-en>outcome</span><span data-lang-vi>kết quả</span></span>
        </div>
      </div>

      <div className="dlf-nodes">
        <div className={`dlf-node ${c1State.cls}`}>
          <span className="dlf-node-name">Client 1</span>
          <span className="dlf-node-state">
            <span data-lang-en>{c1State.en}</span>
            <span data-lang-vi>{c1State.vi}</span>
          </span>
        </div>
        <div className={`dlf-node ${lockState.cls}`}>
          <span className="dlf-node-name">
            <span data-lang-en>Lock service</span>
            <span data-lang-vi>Lock service</span>
          </span>
          <span className="dlf-node-state">
            <span data-lang-en>{lockState.en}</span>
            <span data-lang-vi>{lockState.vi}</span>
          </span>
        </div>
        <div className={`dlf-node ${storeState.cls}`}>
          <span className="dlf-node-name">Storage</span>
          <span className="dlf-node-state">
            <span data-lang-en>{storeState.en}</span>
            <span data-lang-vi>{storeState.vi}</span>
          </span>
        </div>
        <div className={`dlf-node ${c2State.cls}`}>
          <span className="dlf-node-name">Client 2</span>
          <span className="dlf-node-state">
            <span data-lang-en>{c2State.en}</span>
            <span data-lang-vi>{c2State.vi}</span>
          </span>
        </div>
      </div>

      <ol className="dlf-log" aria-live="polite">
        {s.visibleLogs.map((entry) => (
          <li key={entry.step} className={`dlf-log-item is-${entry.tone}`}>
            <span className="dlf-log-time">
              <span data-lang-en>{entry.timeEn}</span>
              <span data-lang-vi>{entry.timeVi}</span>
            </span>
            <span className="dlf-log-msg">
              <span data-lang-en>{entry.en}</span>
              <span data-lang-vi>{entry.vi}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
