import { useState, useMemo } from 'react';

interface FixMessage {
  id: string;
  direction: 'in' | 'out'; // 'in' = Client -> Gateway, 'out' = Gateway -> Client
  seq: number;
  msgType: string;
  typeName: string;
  raw: string;
  tags: { tag: string; name: string; val: string }[];
  desc: string;
}

const INITIAL_MESSAGES: FixMessage[] = [
  {
    id: 'm1',
    direction: 'in',
    seq: 1,
    msgType: 'A',
    typeName: 'Logon',
    raw: '8=FIX.4.4|9=72|35=A|49=ALGO_FUND|56=BROKER_GW|34=1|52=10:30:00|98=0|108=30|10=142|',
    tags: [
      { tag: '8', name: 'BeginString', val: 'FIX.4.4' },
      { tag: '35', name: 'MsgType', val: 'A (Logon)' },
      { tag: '49', name: 'SenderCompID', val: 'ALGO_FUND' },
      { tag: '56', name: 'TargetCompID', val: 'BROKER_GW' },
      { tag: '34', name: 'MsgSeqNum', val: '1' },
      { tag: '98', name: 'EncryptMethod', val: '0 (None)' },
      { tag: '108', name: 'HeartBtInt', val: '30s' },
      { tag: '10', name: 'CheckSum', val: '142' },
    ],
    desc: 'Client initiates session handshake with credentials and 30s heartbeat interval.',
  },
  {
    id: 'm2',
    direction: 'out',
    seq: 1,
    msgType: 'A',
    typeName: 'Logon Ack',
    raw: '8=FIX.4.4|9=72|35=A|49=BROKER_GW|56=ALGO_FUND|34=1|52=10:30:01|98=0|108=30|10=188|',
    tags: [
      { tag: '8', name: 'BeginString', val: 'FIX.4.4' },
      { tag: '35', name: 'MsgType', val: 'A (Logon)' },
      { tag: '49', name: 'SenderCompID', val: 'BROKER_GW' },
      { tag: '56', name: 'TargetCompID', val: 'ALGO_FUND' },
      { tag: '34', name: 'MsgSeqNum', val: '1' },
      { tag: '10', name: 'CheckSum', val: '188' },
    ],
    desc: 'Gateway authenticates CompIDs, accepts connection, and establishes session.',
  },
];

export default function FixSessionDemo() {
  const [messages, setMessages] = useState<FixMessage[]>(INITIAL_MESSAGES);
  const [inSeq, setInSeq] = useState(2);
  const [outSeq, setOutSeq] = useState(2);
  const [selectedMsgId, setSelectedMsgId] = useState<string>('m1');
  const [hasGap, setHasGap] = useState(false);
  const [quarantinedMsg, setQuarantinedMsg] = useState<FixMessage | null>(null);

  const selectedMsg = useMemo(() => {
    return messages.find((m) => m.id === selectedMsgId) || messages[0];
  }, [messages, selectedMsgId]);

  // Send NewOrderSingle (35=D)
  const handleSendOrder = () => {
    const curIn = inSeq;
    const curOut = outSeq;

    const newOrder: FixMessage = {
      id: `m_${Date.now()}_in`,
      direction: 'in',
      seq: curIn,
      msgType: 'D',
      typeName: 'NewOrderSingle',
      raw: `8=FIX.4.4|9=122|35=D|49=ALGO_FUND|56=BROKER_GW|34=${curIn}|52=10:30:${10 + curIn}|11=ORD_${curIn}01|55=HPG|54=1|38=1000|40=2|44=28.50|59=0|10=205|`,
      tags: [
        { tag: '8', name: 'BeginString', val: 'FIX.4.4' },
        { tag: '35', name: 'MsgType', val: 'D (NewOrderSingle)' },
        { tag: '34', name: 'MsgSeqNum', val: String(curIn) },
        { tag: '11', name: 'ClOrdID', val: `ORD_${curIn}01` },
        { tag: '55', name: 'Symbol', val: 'HPG' },
        { tag: '54', name: 'Side', val: '1 (Buy)' },
        { tag: '38', name: 'OrderQty', val: '1000' },
        { tag: '44', name: 'Price', val: '28.50' },
        { tag: '10', name: 'CheckSum', val: '205' },
      ],
      desc: `Client places Limit Buy 1,000 HPG @ 28.50 (ClOrdID=ORD_${curIn}01).`,
    };

    const ackExec: FixMessage = {
      id: `m_${Date.now()}_out`,
      direction: 'out',
      seq: curOut,
      msgType: '8',
      typeName: 'ExecutionReport (New)',
      raw: `8=FIX.4.4|9=148|35=8|49=BROKER_GW|56=ALGO_FUND|34=${curOut}|52=10:30:${11 + curIn}|11=ORD_${curIn}01|37=EXCH_${curOut}99|17=EXEC_01|150=0|39=0|55=HPG|54=1|38=1000|44=28.50|151=1000|14=0|10=194|`,
      tags: [
        { tag: '8', name: 'BeginString', val: 'FIX.4.4' },
        { tag: '35', name: 'MsgType', val: '8 (ExecutionReport)' },
        { tag: '34', name: 'MsgSeqNum', val: String(curOut) },
        { tag: '11', name: 'ClOrdID', val: `ORD_${curIn}01` },
        { tag: '37', name: 'OrderID', val: `EXCH_${curOut}99` },
        { tag: '150', name: 'ExecType', val: '0 (New Order Ack)' },
        { tag: '39', name: 'OrdStatus', val: '0 (New)' },
        { tag: '151', name: 'LeavesQty', val: '1000' },
        { tag: '14', name: 'CumQty', val: '0' },
        { tag: '10', name: 'CheckSum', val: '194' },
      ],
      desc: `Venue matches order & confirms working on book (LeavesQty=1000, CumQty=0).`,
    };

    setMessages((prev) => [...prev, newOrder, ackExec]);
    setSelectedMsgId(newOrder.id);
    setInSeq(curIn + 1);
    setOutSeq(curOut + 1);
  };

  // Simulate Network Gap
  const handleSimulateGap = () => {
    if (hasGap) return;
    const curIn = inSeq;
    const skippedSeq = curIn + 3; // Skips 3 numbers!

    const futureOrder: FixMessage = {
      id: `m_gap_${Date.now()}`,
      direction: 'in',
      seq: skippedSeq,
      msgType: 'D',
      typeName: 'NewOrderSingle (Gapped)',
      raw: `8=FIX.4.4|9=118|35=D|49=ALGO_FUND|56=BROKER_GW|34=${skippedSeq}|52=10:31:05|11=ORD_GAP|55=FPT|54=1|38=500|40=2|44=132.50|10=088|`,
      tags: [
        { tag: '8', name: 'BeginString', val: 'FIX.4.4' },
        { tag: '35', name: 'MsgType', val: 'D (NewOrderSingle)' },
        { tag: '34', name: 'MsgSeqNum', val: String(skippedSeq) },
        { tag: '11', name: 'ClOrdID', val: 'ORD_GAP' },
        { tag: '55', name: 'Symbol', val: 'FPT' },
        { tag: '10', name: 'CheckSum', val: '088' },
      ],
      desc: `Client reconnected after WiFi drop and sent SeqNum=${skippedSeq}. But Gateway expects ${curIn}!`,
    };

    const resendReq: FixMessage = {
      id: `m_resend_${Date.now()}`,
      direction: 'out',
      seq: outSeq,
      msgType: '2',
      typeName: 'ResendRequest',
      raw: `8=FIX.4.4|9=64|35=2|49=BROKER_GW|56=ALGO_FUND|34=${outSeq}|52=10:31:06|7=${curIn}|16=0|10=112|`,
      tags: [
        { tag: '35', name: 'MsgType', val: '2 (ResendRequest)' },
        { tag: '34', name: 'MsgSeqNum', val: String(outSeq) },
        { tag: '7', name: 'BeginSeqNo', val: String(curIn) },
        { tag: '16', name: 'EndSeqNo', val: '0 (All messages up to current)' },
      ],
      desc: `Gateway detected gap: expected ${curIn}, got ${skippedSeq}. Quarantines message and demands replay from ${curIn}.`,
    };

    setMessages((prev) => [...prev, futureOrder, resendReq]);
    setSelectedMsgId(resendReq.id);
    setOutSeq((s) => s + 1);
    setHasGap(true);
    setQuarantinedMsg(futureOrder);
  };

  // Resolve Gap / GapFill
  const handleResolveGap = () => {
    if (!hasGap || !quarantinedMsg) return;
    const curIn = inSeq;
    const targetSeq = quarantinedMsg.seq;

    const gapFillMsg: FixMessage = {
      id: `m_gapfill_${Date.now()}`,
      direction: 'in',
      seq: curIn,
      msgType: '4',
      typeName: 'SequenceReset (GapFill)',
      raw: `8=FIX.4.4|9=70|35=4|49=ALGO_FUND|56=BROKER_GW|34=${curIn}|52=10:31:08|123=Y|36=${targetSeq}|10=154|`,
      tags: [
        { tag: '35', name: 'MsgType', val: '4 (SequenceReset)' },
        { tag: '34', name: 'MsgSeqNum', val: String(curIn) },
        { tag: '123', name: 'GapFillFlag', val: 'Y (Yes)' },
        { tag: '36', name: 'NewSeqNo', val: String(targetSeq) },
      ],
      desc: `Client fills gap: lost messages ${curIn}..${targetSeq - 1} were heartbeats/admin. Jumps sequence to ${targetSeq}.`,
    };

    const releasedAck: FixMessage = {
      id: `m_rel_${Date.now()}`,
      direction: 'out',
      seq: outSeq,
      msgType: '8',
      typeName: 'ExecutionReport (Released)',
      raw: `8=FIX.4.4|9=130|35=8|49=BROKER_GW|56=ALGO_FUND|34=${outSeq}|52=10:31:09|11=ORD_GAP|37=EXCH_GAP|150=0|39=0|55=FPT|38=500|151=500|10=220|`,
      tags: [
        { tag: '35', name: 'MsgType', val: '8 (ExecutionReport)' },
        { tag: '11', name: 'ClOrdID', val: 'ORD_GAP' },
        { tag: '39', name: 'OrdStatus', val: '0 (New)' },
      ],
      desc: `Gap resolved! Quarantined order ${targetSeq} is safely dequeued and processed.`,
    };

    setMessages((prev) => [...prev, gapFillMsg, releasedAck]);
    setSelectedMsgId(gapFillMsg.id);
    setInSeq(targetSeq + 1);
    setOutSeq((s) => s + 1);
    setHasGap(false);
    setQuarantinedMsg(null);
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setInSeq(2);
    setOutSeq(2);
    setSelectedMsgId('m1');
    setHasGap(false);
    setQuarantinedMsg(null);
  };

  return (
    <div className="sd ob-demo">
      {/* Session Header Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '14px' }}>
        <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 12px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Session State</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: hasGap ? '#dc2626' : '#16a34a', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: hasGap ? '#dc2626' : '#16a34a' }}></span>
            {hasGap ? 'RESEND_IN_PROGRESS' : 'CONNECTED / ACTIVE'}
          </div>
        </div>
        <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 12px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Target / Sender</div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', marginTop: '3px', fontFamily: 'monospace' }}>
            GW ⇋ ALGO_FUND
          </div>
        </div>
        <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 12px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Expected InSeqNum</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0284c7', marginTop: '2px', fontFamily: 'monospace' }}>
            {inSeq}
          </div>
        </div>
        <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 12px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Next OutSeqNum</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0284c7', marginTop: '2px', fontFamily: 'monospace' }}>
            {outSeq}
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="sd-controls" style={{ marginBottom: '16px' }}>
        <div className="sd-group">
          <span>Trading Actions:</span>
          <button
            type="button"
            className="sd-btn is-on"
            onClick={handleSendOrder}
            disabled={hasGap}
          >
            Send NewOrderSingle (35=D)
          </button>
        </div>
        <div className="sd-group">
          <span>Network Chaos:</span>
          {!hasGap ? (
            <button
              type="button"
              className="sd-btn"
              style={{ background: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' }}
              onClick={handleSimulateGap}
            >
              Simulate Network Gap (Drop 3 msgs)
            </button>
          ) : (
            <button
              type="button"
              className="sd-btn is-on"
              style={{ background: '#dcfce7', color: '#166534', borderColor: '#86efac' }}
              onClick={handleResolveGap}
            >
              Client Emits GapFill (35=4)
            </button>
          )}
          <button type="button" className="sd-btn" onClick={handleReset}>
            Reset Session
          </button>
        </div>
      </div>

      {/* Main Split: Message Stream & Tag Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {/* Left: Message Log Stream */}
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff', overflow: 'hidden' }}>
          <div style={{ background: '#f1f5f9', padding: '8px 12px', fontSize: '12px', fontWeight: 700, color: '#334155', borderBottom: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
            <span>LIVE SESSION PACKET STREAM ({messages.length})</span>
            <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#64748b' }}>Click to inspect tags</span>
          </div>
          <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '8px' }}>
            {messages.map((m) => {
              const isSelected = m.id === selectedMsgId;
              const isClient = m.direction === 'in';
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMsgId(m.id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '5px',
                    marginBottom: '6px',
                    cursor: 'pointer',
                    border: isSelected ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                    background: isSelected ? '#f0f9ff' : isClient ? '#fafafa' : '#f8fafc',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '3px',
                          background: isClient ? '#e0e7ff' : '#fef3c7',
                          color: isClient ? '#3730a3' : '#b45309',
                        }}
                      >
                        {isClient ? 'CLIENT → GW' : 'GW → CLIENT'}
                      </span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                        35={m.msgType} ({m.typeName})
                      </span>
                    </div>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>
                      Seq #{m.seq}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.3 }}>{m.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Tag-Value Inspector */}
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff', overflow: 'hidden' }}>
          <div style={{ background: '#f1f5f9', padding: '8px 12px', fontSize: '12px', fontWeight: 700, color: '#334155', borderBottom: '1px solid #cbd5e1' }}>
            PACKET INSPECTOR: Msg #{selectedMsg.seq} (35={selectedMsg.msgType})
          </div>

          <div style={{ padding: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Raw Wire String (Delimited with |):</div>
            <div
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: '11px',
                background: '#0f172a',
                color: '#38bdf8',
                padding: '8px 10px',
                borderRadius: '4px',
                wordBreak: 'break-all',
                marginBottom: '12px',
                lineHeight: 1.5,
              }}
            >
              {selectedMsg.raw}
            </div>

            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>Parsed Tag Dictionary:</div>
            <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '4px 6px', color: '#64748b' }}>Tag</th>
                    <th style={{ textAlign: 'left', padding: '4px 6px', color: '#64748b' }}>Field Name</th>
                    <th style={{ textAlign: 'left', padding: '4px 6px', color: '#64748b' }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMsg.tags.map((t, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7', padding: '4px 6px' }}>{t.tag}</td>
                      <td style={{ color: '#334155', padding: '4px 6px' }}>{t.name}</td>
                      <td style={{ fontFamily: 'monospace', color: '#166534', padding: '4px 6px', fontWeight: 600 }}>{t.val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
