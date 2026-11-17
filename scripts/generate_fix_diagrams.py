import os
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT_DIR = Path("src/assets/blog/fix-gateway-trading-system-architecture")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# 1. FIX Ecosystem Topology
HTML_ECOSYSTEM = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: #ffffff;
    color: #1e293b;
    padding: 32px;
    display: inline-block;
  }
  .container {
    width: 1160px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }
  .header {
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 12px;
    margin-bottom: 24px;
  }
  .header h1 {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.02em;
  }
  .header p {
    font-size: 13px;
    color: #64748b;
    margin-top: 4px;
  }
  .zones-grid {
    display: grid;
    grid-template-columns: 280px 48px 460px 48px 260px;
    align-items: stretch;
  }
  .zone-card {
    border: 1.5px solid #cbd5e1;
    border-radius: 6px;
    background: #f8fafc;
    padding: 16px;
    display: flex;
    flex-direction: column;
  }
  .zone-title {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #475569;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .zone-title .badge {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
  }
  .badge-external { background: #e0e7ff; color: #3730a3; }
  .badge-dmz { background: #fee2e2; color: #991b1b; }
  .badge-core { background: #dcfce7; color: #166534; }
  .component-box {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 5px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  }
  .component-box:last-child { margin-bottom: 0; }
  .comp-title {
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 4px;
  }
  .comp-desc {
    font-size: 11px;
    color: #64748b;
    line-height: 1.4;
  }
  .tag {
    display: inline-block;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 10px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    padding: 1px 5px;
    border-radius: 3px;
    margin-top: 6px;
    color: #334155;
  }
  .connector {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  .connector-line {
    width: 100%;
    height: 2px;
    background: #94a3b8;
    position: relative;
  }
  .connector-label {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 9px;
    color: #475569;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    padding: 2px 4px;
    border-radius: 3px;
    margin-bottom: 6px;
    text-align: center;
    white-space: nowrap;
  }
  .arrow-both::before, .arrow-both::after {
    content: '';
    position: absolute;
    top: -4px;
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
  }
  .arrow-both::before {
    left: 0;
    border-right: 6px solid #64748b;
  }
  .arrow-both::after {
    right: 0;
    border-left: 6px solid #64748b;
  }
  .gw-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .gw-inner .component-box {
    margin-bottom: 0;
  }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>Institutional Securities FIX Topology: External Clients to Trading Core</h1>
    <p>How external buy-side institutions and algo traders communicate with a broker or exchange trading cluster via a stateful FIX Gateway.</p>
  </div>

  <div class="zones-grid">
    <!-- Zone 1: External Clients -->
    <div class="zone-card">
      <div class="zone-title">
        <span>External Realm</span>
        <span class="badge badge-external">UNTRUSTED / INTERNET</span>
      </div>
      <div class="component-box">
        <div class="comp-title">Buy-Side Client OMS</div>
        <div class="comp-desc">Asset managers & hedge funds executing block trades & portfolio rebalances.</div>
        <div class="tag">SenderCompID: CLIENT_ASSET_MGR</div>
      </div>
      <div class="component-box">
        <div class="comp-title">Low-Latency Algo Trader</div>
        <div class="comp-desc">Statistical arbitrage / Market maker running collocated algo strategies.</div>
        <div class="tag">SenderCompID: PROP_ALGO_01</div>
      </div>
      <div class="component-box">
        <div class="comp-title">Retail Broker DMA Client</div>
        <div class="comp-desc">Direct Market Access orders forwarded through client application hubs.</div>
        <div class="tag">SenderCompID: DMA_RETAIL_FEED</div>
      </div>
    </div>

    <!-- Connector 1 -->
    <div class="connector">
      <div class="connector-label">FIX 4.2 / 4.4<br/>TLS / VPN</div>
      <div class="connector-line arrow-both"></div>
    </div>

    <!-- Zone 2: Gateway DMZ -->
    <div class="zone-card" style="border-color: #f87171; background: #fff5f5;">
      <div class="zone-title">
        <span>FIX Gateway Cluster</span>
        <span class="badge badge-dmz">PERIMETER GATEWAY (DMZ)</span>
      </div>

      <div style="background: #ffffff; border: 1.5px solid #fca5a5; border-radius: 6px; padding: 12px; margin-bottom: 10px;">
        <div class="comp-title" style="color: #991b1b;">Stateful FIX Gateway Engine</div>
        <div class="comp-desc">Terminates client TCP connections, tracks sequence numbers, and journals all packets.</div>
      </div>

      <div class="gw-inner">
        <div class="component-box">
          <div class="comp-title">Session State Machine</div>
          <div class="comp-desc">Logon, Heartbeat, TestRequest, ResendRequest & GapFill.</div>
          <div class="tag">In/Out SeqNum Tracking</div>
        </div>
        <div class="component-box">
          <div class="comp-title">Fast Tag-Value Parser</div>
          <div class="comp-desc">Zero-allocation tokenizer with Data Dictionary validation.</div>
          <div class="tag">FIX Spec 4.2 / 4.4 / 5.0</div>
        </div>
        <div class="component-box">
          <div class="comp-title">Message WAL Journal</div>
          <div class="comp-desc">Memory-mapped file store / LMDB for deterministic replay.</div>
          <div class="tag">Audit & Resend Store</div>
        </div>
        <div class="component-box">
          <div class="comp-title">Pre-Trade Throttle</div>
          <div class="comp-desc">Token bucket rate limiter (e.g. 500 msgs/s) & fat-finger gate.</div>
          <div class="tag">DDoS & Venue Protection</div>
        </div>
      </div>

      <div class="component-box" style="margin-top: 10px; background: #fef2f2; border-color: #fecaca;">
        <div class="comp-title" style="color: #b91c1c;">Protocol Bridge & Serializer</div>
        <div class="comp-desc">Converts human-readable FIX tag-value into ultra-fast binary format (Protobuf / SBE / Aeron IPC).</div>
      </div>
    </div>

    <!-- Connector 2 -->
    <div class="connector">
      <div class="connector-label">IPC / RingBuffer<br/>Protobuf / SBE</div>
      <div class="connector-line arrow-both"></div>
    </div>

    <!-- Zone 3: Core Trading Systems -->
    <div class="zone-card" style="border-color: #86efac; background: #f0fdf4;">
      <div class="zone-title">
        <span>Core Trading Engine</span>
        <span class="badge badge-core">INTERNAL SECURE LAN</span>
      </div>
      <div class="component-box">
        <div class="comp-title">Central Order Management (OMS)</div>
        <div class="comp-desc">Maintains master order states, parent/child orders, and client accounts.</div>
        <div class="tag">Internal Order ID: ORD_#</div>
      </div>
      <div class="component-box">
        <div class="comp-title">In-Memory Risk Engine</div>
        <div class="comp-desc">Sub-microsecond margin check, position limits, and credit lines.</div>
        <div class="tag">Pre-Trade Risk Checks</div>
      </div>
      <div class="component-box">
        <div class="comp-title">Exchange Matching / Gateway</div>
        <div class="comp-desc">Direct uplink to exchange matching engines (CME, NYSE, HOSE, HNX).</div>
        <div class="tag">Exchange Native Protocols</div>
      </div>
    </div>
  </div>
</div>
</body>
</html>
"""

# 2. FIX Tag-Value Packet Structure
HTML_PACKET = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: #ffffff;
    color: #1e293b;
    padding: 32px;
    display: inline-block;
  }
  .container {
    width: 1140px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 24px;
    background: #ffffff;
  }
  .title {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 6px;
  }
  .subtitle {
    font-size: 13px;
    color: #64748b;
    margin-bottom: 20px;
  }
  .raw-box {
    background: #0f172a;
    border-radius: 6px;
    padding: 16px 20px;
    color: #f8fafc;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
    line-height: 1.8;
    overflow-x: auto;
    border: 1px solid #334155;
    margin-bottom: 24px;
  }
  .soh {
    color: #f43f5e;
    font-weight: bold;
    background: #3f121d;
    padding: 0 3px;
    border-radius: 2px;
    margin: 0 1px;
  }
  .tag-num { color: #38bdf8; font-weight: 600; }
  .eq { color: #94a3b8; }
  .val { color: #fde047; }
  .val-str { color: #4ade80; }
  
  .sections-grid {
    display: grid;
    grid-template-columns: 340px 1fr 200px;
    gap: 16px;
  }
  .sec-col {
    border-radius: 6px;
    border: 1.5px solid #cbd5e1;
    padding: 16px;
    background: #f8fafc;
  }
  .sec-header {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding-bottom: 8px;
    border-bottom: 1.5px solid #e2e8f0;
    margin-bottom: 12px;
  }
  .header-color { color: #0284c7; border-color: #bae6fd; }
  .body-color { color: #16a34a; border-color: #bbf7d0; }
  .trailer-color { color: #d97706; border-color: #fde68a; }
  
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  th {
    text-align: left;
    color: #64748b;
    font-weight: 600;
    font-size: 11px;
    padding: 4px 6px;
    border-bottom: 1px solid #e2e8f0;
  }
  td {
    padding: 6px;
    border-bottom: 1px solid #f1f5f9;
  }
  td.tag-cell {
    font-family: ui-monospace, monospace;
    font-weight: 600;
    color: #0284c7;
    white-space: nowrap;
  }
  td.val-cell {
    font-family: ui-monospace, monospace;
    color: #166534;
    font-weight: 500;
  }
  td.desc-cell {
    color: #475569;
    font-size: 11px;
    line-height: 1.3;
  }
  .note {
    margin-top: 18px;
    background: #eff6ff;
    border-left: 4px solid #3b82f6;
    padding: 10px 14px;
    border-radius: 0 4px 4px 0;
    font-size: 12px;
    color: #1e40af;
  }
</style>
</head>
<body>
<div class="container">
  <div class="title">Anatomy of a FIX Tag-Value Message (NewOrderSingle MsgType=D)</div>
  <div class="subtitle">ASCII stream separated by delimiter SOH (0x01). Structured into Standard Header, Application Body, and Standard Trailer.</div>

  <div class="raw-box">
    <span class="tag-num">8</span><span class="eq">=</span><span class="val-str">FIX.4.4</span><span class="soh">&lt;SOH&gt;</span><span class="tag-num">9</span><span class="eq">=</span><span class="val">142</span><span class="soh">&lt;SOH&gt;</span><span class="tag-num">35</span><span class="eq">=</span><span class="val-str">D</span><span class="soh">&lt;SOH&gt;</span><span class="tag-num">49</span><span class="eq">=</span><span class="val-str">PROP_ALGO_01</span><span class="soh">&lt;SOH&gt;</span><span class="tag-num">56</span><span class="eq">=</span><span class="val-str">BROKER_GW</span><span class="soh">&lt;SOH&gt;</span><span class="tag-num">34</span><span class="eq">=</span><span class="val">105</span><span class="soh">&lt;SOH&gt;</span><span class="tag-num">52</span><span class="eq">=</span><span class="val-str">20261117-03:52:10.124</span><span class="soh">&lt;SOH&gt;</span><span class="tag-num">11</span><span class="eq">=</span><span class="val-str">CL_99214</span><span class="soh">&lt;SOH&gt;</span><span class="tag-num">55</span><span class="eq">=</span><span class="val-str">HPG</span><span class="soh">&lt;SOH&gt;</span><span class="tag-num">54</span><span class="eq">=</span><span class="val">1</span><span class="soh">&lt;SOH&gt;</span><span class="tag-num">38</span><span class="eq">=</span><span class="val">5000</span><span class="soh">&lt;SOH&gt;</span><span class="tag-num">40</span><span class="eq">=</span><span class="val">2</span><span class="soh">&lt;SOH&gt;</span><span class="tag-num">44</span><span class="eq">=</span><span class="val">28.50</span><span class="soh">&lt;SOH&gt;</span><span class="tag-num">59</span><span class="eq">=</span><span class="val">0</span><span class="soh">&lt;SOH&gt;</span><span class="tag-num">10</span><span class="eq">=</span><span class="val">182</span><span class="soh">&lt;SOH&gt;</span>
  </div>

  <div class="sections-grid">
    <!-- Header -->
    <div class="sec-col" style="background: #f0f9ff; border-color: #bae6fd;">
      <div class="sec-header header-color">1. Standard Header (Envelope)</div>
      <table>
        <tr><th>Tag</th><th>Value</th><th>Field & Purpose</th></tr>
        <tr><td class="tag-cell">8</td><td class="val-cell">FIX.4.4</td><td class="desc-cell"><b>BeginString:</b> Protocol version identifier. Always first tag.</td></tr>
        <tr><td class="tag-cell">9</td><td class="val-cell">142</td><td class="desc-cell"><b>BodyLength:</b> Byte count from tag 35 to tag 10 delimiter.</td></tr>
        <tr><td class="tag-cell">35</td><td class="val-cell">D</td><td class="desc-cell"><b>MsgType:</b> 'D' = NewOrderSingle (Order submission).</td></tr>
        <tr><td class="tag-cell">49</td><td class="val-cell">PROP_ALGO_01</td><td class="desc-cell"><b>SenderCompID:</b> Sending firm identity.</td></tr>
        <tr><td class="tag-cell">56</td><td class="val-cell">BROKER_GW</td><td class="desc-cell"><b>TargetCompID:</b> Receiving gateway identity.</td></tr>
        <tr><td class="tag-cell">34</td><td class="val-cell">105</td><td class="desc-cell"><b>MsgSeqNum:</b> Monotonically increasing sequence number.</td></tr>
        <tr><td class="tag-cell">52</td><td class="val-cell">202611...</td><td class="desc-cell"><b>SendingTime:</b> UTC timestamp of transmission.</td></tr>
      </table>
    </div>

    <!-- Body -->
    <div class="sec-col" style="background: #f0fdf4; border-color: #bbf7d0;">
      <div class="sec-header body-color">2. Application Body (Trading Payload)</div>
      <table>
        <tr><th>Tag</th><th>Value</th><th>Field & Business Meaning</th></tr>
        <tr><td class="tag-cell">11</td><td class="val-cell">CL_99214</td><td class="desc-cell"><b>ClOrdID:</b> Unique client order ID generated by the trading strategy.</td></tr>
        <tr><td class="tag-cell">55</td><td class="val-cell">HPG</td><td class="desc-cell"><b>Symbol:</b> Ticker symbol / instrument traded.</td></tr>
        <tr><td class="tag-cell">54</td><td class="val-cell">1</td><td class="desc-cell"><b>Side:</b> '1' = Buy, '2' = Sell, '5' = Sell Short.</td></tr>
        <tr><td class="tag-cell">38</td><td class="val-cell">5000</td><td class="desc-cell"><b>OrderQty:</b> Number of shares / contracts requested.</td></tr>
        <tr><td class="tag-cell">40</td><td class="val-cell">2</td><td class="desc-cell"><b>OrdType:</b> '1' = Market, '2' = Limit, '3' = Stop.</td></tr>
        <tr><td class="tag-cell">44</td><td class="val-cell">28.50</td><td class="desc-cell"><b>Price:</b> Limit price per share (required if OrdType=2).</td></tr>
        <tr><td class="tag-cell">59</td><td class="val-cell">0</td><td class="desc-cell"><b>TimeInForce:</b> '0' = Day, '1' = Good Till Cancel (GTC), '3' = IOC.</td></tr>
      </table>
    </div>

    <!-- Trailer -->
    <div class="sec-col" style="background: #fffbeb; border-color: #fde68a;">
      <div class="sec-header trailer-color">3. Standard Trailer</div>
      <table>
        <tr><th>Tag</th><th>Value</th><th>Field & Purpose</th></tr>
        <tr><td class="tag-cell">10</td><td class="val-cell">182</td><td class="desc-cell"><b>CheckSum:</b> Modulo 256 sum of all ASCII bytes up to tag 10. Always 3 digits. Terminates message.</td></tr>
      </table>
      <div style="margin-top: 16px; font-size: 11px; color: #78350f; line-height: 1.4;">
        <b>Rule:</b> Tag 10 is always the final tag in every valid FIX frame. If checksum fails or is missing, the message is immediately dropped or rejected.
      </div>
    </div>
  </div>

  <div class="note">
    <strong>Key Architectural Fact:</strong> Unlike JSON, where keys can be in arbitrary order and field names consume large byte footprints ("symbol": "HPG"), FIX Tag-Value uses integer tags separated by ASCII 0x01 (Start of Header). Fast parsers use lookup tables indexed directly by integer tag ID without memory allocations.
  </div>
</div>
</body>
</html>
"""

# 3. FIX Gateway Internal Architecture
HTML_GATEWAY = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: #ffffff;
    color: #1e293b;
    padding: 32px;
    display: inline-block;
  }
  .container {
    width: 1140px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 24px;
    background: #ffffff;
  }
  .title {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }
  .subtitle {
    font-size: 13px;
    color: #64748b;
    margin-bottom: 24px;
  }
  .layers-container {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .layer-row {
    border: 1.5px solid #cbd5e1;
    border-radius: 6px;
    padding: 14px 18px;
    background: #f8fafc;
    position: relative;
  }
  .layer-title-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .layer-name {
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .layer-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 4px;
    text-transform: uppercase;
  }
  .layer-desc {
    font-size: 12px;
    color: #64748b;
  }
  .layer-boxes {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-top: 8px;
  }
  .sub-box {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 5px;
    padding: 10px 12px;
  }
  .sub-box h4 {
    font-size: 12px;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 3px;
  }
  .sub-box p {
    font-size: 11px;
    color: #64748b;
    line-height: 1.35;
  }
  .pipe-arrow {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 16px;
    color: #94a3b8;
    font-size: 14px;
    font-weight: bold;
  }
</style>
</head>
<body>
<div class="container">
  <div class="title">Internal Architecture of a High-Performance FIX Gateway</div>
  <div class="subtitle">Detailed breakdown of the 5 internal processing layers separating TCP sockets from the Core Matching Engine.</div>

  <div class="layers-container">
    <!-- Layer 1 -->
    <div class="layer-row" style="background: #f0fdf4; border-color: #86efac;">
      <div class="layer-title-bar">
        <div class="layer-name">
          <span>Layer 1: Network & Socket I/O Acceptor</span>
          <span class="layer-badge" style="background: #dcfce7; color: #15803d;">Network Edge</span>
        </div>
        <div class="layer-desc">Non-blocking TCP socket management, TLS offloading, and raw byte buffering.</div>
      </div>
      <div class="layer-boxes">
        <div class="sub-box">
          <h4>Epoll / Kqueue Reactor</h4>
          <p>Event-driven multiplexer handling thousands of concurrent client TCP sessions.</p>
        </div>
        <div class="sub-box">
          <h4>TLS / Stunnel Termination</h4>
          <p>Hardware-accelerated AES decryption for secure leased lines & internet connections.</p>
        </div>
        <div class="sub-box">
          <h4>Ring Byte Buffer</h4>
          <p>Circular direct byte buffers accumulating incoming stream until valid SOH frames.</p>
        </div>
        <div class="sub-box">
          <h4>Connection Governor</h4>
          <p>IP whitelist, max connections per IP, and anti-SYN-flood connection firewall.</p>
        </div>
      </div>
    </div>

    <div class="pipe-arrow">▼ Raw TCP Byte Stream</div>

    <!-- Layer 2 -->
    <div class="layer-row" style="background: #f0f9ff; border-color: #7dd3fc;">
      <div class="layer-title-bar">
        <div class="layer-name">
          <span>Layer 2: FIX Session State Engine & Sequence Journal</span>
          <span class="layer-badge" style="background: #e0f2fe; color: #0369a1;">State & Audit</span>
        </div>
        <div class="layer-desc">Governs session protocol state, sequence gap detection, and persistent disk journaling.</div>
      </div>
      <div class="layer-boxes">
        <div class="sub-box">
          <h4>Sequence Number Tracker</h4>
          <p>Strict monotonically increasing InSeqNum & OutSeqNum with immediate gap detection.</p>
        </div>
        <div class="sub-box">
          <h4>Session State Machine</h4>
          <p>Manages Logon (35=A), Heartbeat (35=0), TestRequest (35=1), and Logout (35=5).</p>
        </div>
        <div class="sub-box">
          <h4>Message Store (WAL)</h4>
          <p>Memory-mapped file / LMDB journal storing every message for ResendRequest replay.</p>
        </div>
        <div class="sub-box">
          <h4>Gap Recovery Controller</h4>
          <p>Fires ResendRequest (35=2) or SequenceReset (35=4 GapFill) upon detecting lost packets.</p>
        </div>
      </div>
    </div>

    <div class="pipe-arrow">▼ Valid In-Order FIX Messages</div>

    <!-- Layer 3 -->
    <div class="layer-row" style="background: #fdf4ff; border-color: #f0abfc;">
      <div class="layer-title-bar">
        <div class="layer-name">
          <span>Layer 3: Zero-Allocation Parser & Data Dictionary Validator</span>
          <span class="layer-badge" style="background: #fae8ff; color: #a21caf;">Parser</span>
        </div>
        <div class="layer-desc">Tokenizes tag-value pairs, verifies data dictionaries, and validates mandatory fields.</div>
      </div>
      <div class="layer-boxes">
        <div class="sub-box">
          <h4>SOH Tag Tokenizer</h4>
          <p>Zero-copy string view / pointer arithmetic splitting tags without heap allocations.</p>
        </div>
        <div class="sub-box">
          <h4>Data Dictionary Validator</h4>
          <p>Validates tag types (Int, Float, UTCTimestamp) and enum constants against XML specs.</p>
        </div>
        <div class="sub-box">
          <h4>Tag 10 Checksum Validator</h4>
          <p>Calculates modulo 256 sum to catch bit-rot or framing corruption before processing.</p>
        </div>
        <div class="sub-box">
          <h4>Reject Handler (35=3)</h4>
          <p>Generates Session Reject (35=3) with RefTagID & RefSeqNum for malformed frames.</p>
        </div>
      </div>
    </div>

    <div class="pipe-arrow">▼ Valid Application Orders (35=D, 35=F, 35=G)</div>

    <!-- Layer 4 -->
    <div class="layer-row" style="background: #fffbeb; border-color: #fde047;">
      <div class="layer-title-bar">
        <div class="layer-name">
          <span>Layer 4: Inbound Throttle & Pre-Trade Gate</span>
          <span class="layer-badge" style="background: #fef3c7; color: #b45309;">Protection</span>
        </div>
        <div class="layer-desc">Shields downstream OMS and Exchange from rogue algorithmic order floods and invalid accounts.</div>
      </div>
      <div class="layer-boxes">
        <div class="sub-box">
          <h4>Token Bucket Throttler</h4>
          <p>Caps client message rate (e.g. max 500 msgs/s) to comply with exchange venue rules.</p>
        </div>
        <div class="sub-box">
          <h4>Account Whitelist Check</h4>
          <p>Verifies SenderCompID is authorized to trade the target Account & Symbol.</p>
        </div>
        <div class="sub-box">
          <h4>Fat-Finger Sanity Check</h4>
          <p>Rejects orders with absurd price or quantity (e.g. qty > 1,000,000) instantly at gate.</p>
        </div>
        <div class="sub-box">
          <h4>Business Reject (35=j)</h4>
          <p>Returns BusinessMessageReject if application conditions fail before touching OMS.</p>
        </div>
      </div>
    </div>

    <div class="pipe-arrow">▼ Cleared Canonical Orders</div>

    <!-- Layer 5 -->
    <div class="layer-row" style="background: #f8fafc; border-color: #94a3b8;">
      <div class="layer-title-bar">
        <div class="layer-name">
          <span>Layer 5: High-Speed IPC Bridge & Binary Transcoder</span>
          <span class="layer-badge" style="background: #e2e8f0; color: #334155;">Core Bridge</span>
        </div>
        <div class="layer-desc">Transcodes ASCII FIX to ultra-fast binary format (SBE / Protobuf) and publishes to OMS.</div>
      </div>
      <div class="layer-boxes">
        <div class="sub-box">
          <h4>Binary Transcoder</h4>
          <p>Encodes NewOrderSingle into Simple Binary Encoding (SBE) or compact Protobuf.</p>
        </div>
        <div class="sub-box">
          <h4>LMAX Disruptor / RingBuffer</h4>
          <p>Lock-free shared memory ring buffer decoupling network thread from matching engine.</p>
        </div>
        <div class="sub-box">
          <h4>Aeron IPC / Shared Mem</h4>
          <p>Sub-microsecond inter-process communication directly to matching core.</p>
        </div>
        <div class="sub-box">
          <h4>Outbound Execution Stream</h4>
          <p>Receives ExecutionReports from OMS, serializes back to FIX (35=8), and writes to TCP.</p>
        </div>
      </div>
    </div>
  </div>
</div>
</body>
</html>
"""

# 4. FIX Sequence Gap Recovery Flow
HTML_GAP = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: #ffffff;
    color: #1e293b;
    padding: 32px;
    display: inline-block;
  }
  .container {
    width: 1140px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 24px;
    background: #ffffff;
  }
  .title {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }
  .subtitle {
    font-size: 13px;
    color: #64748b;
    margin-bottom: 24px;
  }
  .seq-diagram {
    display: grid;
    grid-template-columns: 260px 1fr 260px;
    position: relative;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 20px 24px;
    background: #f8fafc;
  }
  .actor-col {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .actor-box {
    width: 100%;
    padding: 12px;
    border: 2px solid #0284c7;
    background: #e0f2fe;
    border-radius: 6px;
    text-align: center;
    font-weight: 700;
    font-size: 13px;
    color: #0369a1;
  }
  .lifeline {
    width: 2px;
    background: #cbd5e1;
    flex-grow: 1;
    margin-top: 10px;
    position: relative;
  }
  .msg-track {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px 0;
  }
  .msg-item {
    display: flex;
    align-items: center;
    position: relative;
    height: 48px;
  }
  .arrow-line {
    flex-grow: 1;
    height: 2px;
    position: relative;
  }
  .arrow-right {
    background: #0284c7;
  }
  .arrow-right::after {
    content: '';
    position: absolute;
    right: 0;
    top: -4px;
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 8px solid #0284c7;
  }
  .arrow-left {
    background: #d97706;
  }
  .arrow-left::before {
    content: '';
    position: absolute;
    left: 0;
    top: -4px;
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-right: 8px solid #d97706;
  }
  .arrow-label {
    position: absolute;
    top: -18px;
    left: 50%;
    transform: translateX(-50%);
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 2px 8px;
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  .label-right { color: #0369a1; border-color: #bae6fd; }
  .label-left { color: #b45309; border-color: #fde68a; }
  .event-desc {
    position: absolute;
    bottom: -16px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 10.5px;
    color: #64748b;
    white-space: nowrap;
  }
  .drop-box {
    border: 2px dashed #ef4444;
    background: #fef2f2;
    color: #991b1b;
    border-radius: 4px;
    padding: 6px 14px;
    font-size: 11px;
    font-weight: 600;
    text-align: center;
    margin: 4px 0;
  }
  .gap-alert {
    background: #fee2e2;
    border: 1px solid #f87171;
    color: #991b1b;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 4px;
    position: absolute;
    right: -10px;
    top: 50%;
    transform: translateY(-50%);
    white-space: nowrap;
  }
</style>
</head>
<body>
<div class="container">
  <div class="title">The Superpower of FIX: Deterministic Sequence Gap Recovery Flow</div>
  <div class="subtitle">How a FIX Gateway detects dropped packets, issues a ResendRequest (35=2), and uses SequenceReset (35=4 GapFill) to guarantee zero message loss without duplicates.</div>

  <div class="seq-diagram">
    <!-- Client Actor -->
    <div class="actor-col">
      <div class="actor-box">
        Client Trading Strategy<br/>
        <span style="font-size: 10px; font-weight: normal; color: #475569;">SenderCompID: CLIENT_ALGO</span>
      </div>
      <div class="lifeline"></div>
    </div>

    <!-- Message Track -->
    <div class="msg-track">
      <!-- Step 1 -->
      <div class="msg-item">
        <div class="arrow-line arrow-right">
          <div class="arrow-label label-right">MsgSeqNum=10 | 35=D (NewOrderSingle: HPG Buy 1000)</div>
          <div class="event-desc">Gateway expects 10. Processed normally. Gateway expected InSeqNum increments to 11.</div>
        </div>
      </div>

      <!-- Network blip -->
      <div class="drop-box">
        ⚡ NETWORK INTERRUPT / TCP BLIP: Messages 11 & 12 (Heartbeats) and 13 (Cancel Request) are lost in transit!
      </div>

      <!-- Step 2 -->
      <div class="msg-item">
        <div class="arrow-line arrow-right" style="border-style: solid;">
          <div class="arrow-label label-right" style="border-color: #f87171; color: #dc2626;">MsgSeqNum=14 | 35=D (NewOrderSingle: FPT Buy 500)</div>
          <div class="event-desc">Client reconnects and sends order 14. Message 14 held in quarantine buffer!</div>
          <div class="gap-alert">GAP DETECTED! Expected 11, Got 14</div>
        </div>
      </div>

      <!-- Step 3 -->
      <div class="msg-item">
        <div class="arrow-line arrow-left">
          <div class="arrow-label label-left">MsgSeqNum=201 | 35=2 (ResendRequest: 7=11, 16=0)</div>
          <div class="event-desc">Gateway demands replay of all messages from SeqNum 11 to infinity (16=0).</div>
        </div>
      </div>

      <!-- Step 4 -->
      <div class="msg-item">
        <div class="arrow-line arrow-right">
          <div class="arrow-label label-right">MsgSeqNum=11 | 35=4 (SequenceReset: 123=Y GapFill, 36=13)</div>
          <div class="event-desc">Client skips obsolete administrative messages (11 & 12 Heartbeats) directly to 13.</div>
        </div>
      </div>

      <!-- Step 5 -->
      <div class="msg-item">
        <div class="arrow-line arrow-right">
          <div class="arrow-label label-right">MsgSeqNum=13 | 35=F (OrderCancelRequest | 43=Y PossDupFlag)</div>
          <div class="event-desc">Client replays business message 13 tagged with 43=Y (Possible Duplicate). Processed!</div>
        </div>
      </div>

      <!-- Step 6 -->
      <div class="msg-item">
        <div class="arrow-line arrow-right">
          <div class="arrow-label label-right" style="background: #ecfdf5; border-color: #6ee7b7; color: #047857;">MsgSeqNum=14 | Released from Quarantine & Processed!</div>
          <div class="event-desc">Sequence gap healed! Gateway now seamlessly processes queued Message 14. InSeqNum=15.</div>
        </div>
      </div>
    </div>

    <!-- Gateway Actor -->
    <div class="actor-col">
      <div class="actor-box" style="border-color: #d97706; background: #fef3c7; color: #b45309;">
        Broker FIX Gateway<br/>
        <span style="font-size: 10px; font-weight: normal; color: #78350f;">TargetCompID: BROKER_GW</span>
      </div>
      <div class="lifeline"></div>
    </div>
  </div>
</div>
</body>
</html>
"""

def render_html_to_png(html_content: str, out_path: Path):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(device_scale_factor=2)
        page.set_content(html_content)
        # Find container
        container = page.locator(".container")
        container.screenshot(path=str(out_path))
        browser.close()
    print(f"Rendered: {out_path} ({out_path.stat().st_size} bytes)")

def main():
    render_html_to_png(HTML_ECOSYSTEM, OUT_DIR / "fix-ecosystem-topology.png")
    render_html_to_png(HTML_PACKET, OUT_DIR / "fix-tag-value-packet-structure.png")
    render_html_to_png(HTML_GATEWAY, OUT_DIR / "fix-gateway-internal-architecture.png")
    render_html_to_png(HTML_GAP, OUT_DIR / "fix-gap-recovery-sequence.png")

if __name__ == "__main__":
    main()

HTML_ORDER_LIFECYCLE = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: #ffffff;
    color: #1e293b;
    padding: 32px;
    display: inline-block;
  }
  .container {
    width: 1140px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 24px;
    background: #ffffff;
  }
  .title {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }
  .subtitle {
    font-size: 13px;
    color: #64748b;
    margin-bottom: 24px;
  }
  .stages-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  .stage-card {
    border-radius: 6px;
    border: 1.5px solid #cbd5e1;
    padding: 14px;
    background: #f8fafc;
  }
  .stage-badge {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 3px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .stage-title {
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 8px;
  }
  .state-node {
    background: #ffffff;
    border: 1.5px solid #94a3b8;
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 10px;
  }
  .state-node:last-child { margin-bottom: 0; }
  .state-name {
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 12px;
    font-weight: 700;
    color: #0284c7;
    margin-bottom: 4px;
  }
  .state-desc {
    font-size: 11px;
    color: #475569;
    line-height: 1.35;
  }
  .state-tags {
    font-family: ui-monospace, monospace;
    font-size: 9.5px;
    color: #166534;
    background: #f0fdf4;
    padding: 2px 4px;
    border-radius: 3px;
    margin-top: 4px;
    display: inline-block;
  }
  .truth-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11.5px;
    border: 1px solid #e2e8f0;
    margin-top: 10px;
  }
  .truth-table th {
    background: #f1f5f9;
    color: #334155;
    text-align: left;
    padding: 8px 10px;
    font-weight: 600;
    border-bottom: 1px solid #cbd5e1;
  }
  .truth-table td {
    padding: 8px 10px;
    border-bottom: 1px solid #f1f5f9;
    color: #475569;
  }
  .code {
    font-family: ui-monospace, monospace;
    font-weight: 600;
    color: #0f172a;
  }
  .badge-term {
    display: inline-block;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 600;
  }
  .term-closed { background: #fee2e2; color: #991b1b; }
  .term-open { background: #dcfce7; color: #166534; }
  .term-flight { background: #fef3c7; color: #92400e; }
</style>
</head>
<body>
<div class="container">
  <div class="title">FIX Order Lifecycle & State Machine Mapping (FIX 4.2 / 4.4 / 5.0)</div>
  <div class="subtitle">Complete transition path from client submission (35=D) to final venue execution reports (35=8), cancellation, and rejects.</div>

  <div class="stages-row">
    <!-- Stage 1 -->
    <div class="stage-card" style="border-color: #fde047; background: #fefce8;">
      <span class="stage-badge" style="background: #fef08a; color: #854d0e;">Phase 1: In-Flight</span>
      <div class="stage-title">Client Submission</div>
      <div class="state-node" style="border-color: #ca8a04;">
        <div class="state-name">35=D (NewOrderSingle)</div>
        <div class="state-desc">Client generates ClOrdID (Tag 11) and fires order across TCP socket.</div>
        <div class="state-tags">OrdStatus=A (Pending New)</div>
      </div>
      <div class="state-node" style="border-color: #ca8a04; margin-top: 8px;">
        <div class="state-name">Gateway Pre-Check</div>
        <div class="state-desc">Throttler & Account whitelist verified. Transcoded to internal IPC.</div>
        <div class="state-tags">In-Memory Queue</div>
      </div>
    </div>

    <!-- Stage 2 -->
    <div class="stage-card" style="border-color: #86efac; background: #f0fdf4;">
      <span class="stage-badge" style="background: #bbf7d0; color: #166534;">Phase 2: Working</span>
      <div class="stage-title">Accepted On Venue</div>
      <div class="state-node" style="border-color: #16a34a;">
        <div class="state-name">35=8 (New Order Ack)</div>
        <div class="state-desc">Exchange matching engine acknowledges order. Assigned OrderID (Tag 37).</div>
        <div class="state-tags">ExecType=0 | OrdStatus=0 (New)</div>
      </div>
      <div class="state-node" style="border-color: #16a34a; margin-top: 8px;">
        <div class="state-name">Working on Book</div>
        <div class="state-desc">Order rests in matching book awaiting matching counterparties.</div>
        <div class="state-tags">CumQty=0 | LeavesQty=OrderQty</div>
      </div>
    </div>

    <!-- Stage 3 -->
    <div class="stage-card" style="border-color: #7dd3fc; background: #f0f9ff;">
      <span class="stage-badge" style="background: #bae6fd; color: #0369a1;">Phase 3: Execution</span>
      <div class="stage-title">Fills & Matches</div>
      <div class="state-node" style="border-color: #0284c7;">
        <div class="state-name">35=8 (Partial Fill)</div>
        <div class="state-desc">Match occurs! LeavesQty > 0. Unique ExecID (Tag 17) assigned.</div>
        <div class="state-tags">ExecType=1 | OrdStatus=1 (Partial)</div>
      </div>
      <div class="state-node" style="border-color: #0284c7; margin-top: 8px;">
        <div class="state-name">35=8 (Complete Fill)</div>
        <div class="state-desc">Entire quantity satisfied. LeavesQty = 0. Position settled.</div>
        <div class="state-tags">ExecType=2 | OrdStatus=2 (Filled)</div>
      </div>
    </div>

    <!-- Stage 4 -->
    <div class="stage-card" style="border-color: #fca5a5; background: #fff5f5;">
      <span class="stage-badge" style="background: #fecaca; color: #991b1b;">Phase 4: Terminal</span>
      <div class="stage-title">Cancellation & Reject</div>
      <div class="state-node" style="border-color: #ef4444;">
        <div class="state-name">35=8 (Canceled)</div>
        <div class="state-desc">Triggered by 35=F. Order removed from book without filling remainder.</div>
        <div class="state-tags">ExecType=4 | OrdStatus=4 (Canceled)</div>
      </div>
      <div class="state-node" style="border-color: #ef4444; margin-top: 8px;">
        <div class="state-name">35=8 / 35=9 (Rejection)</div>
        <div class="state-desc">Risk fail, price collar violation (103=OrdRejReason), or cancel reject.</div>
        <div class="state-tags">ExecType=8 | OrdStatus=8 (Rejected)</div>
      </div>
    </div>
  </div>

  <table class="truth-table">
    <thead>
      <tr>
        <th>Event / Action</th>
        <th>MsgType (35)</th>
        <th>ExecType (150)</th>
        <th>OrdStatus (39)</th>
        <th>LeavesQty (151)</th>
        <th>CumQty (14)</th>
        <th>Terminal?</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Order Submission</td>
        <td><span class="code">D (NewOrderSingle)</span></td>
        <td>-</td>
        <td><span class="code">A (Pending New)</span></td>
        <td>OrderQty</td>
        <td>0</td>
        <td><span class="badge-term term-flight">In-Flight</span></td>
      </tr>
      <tr>
        <td>Venue Acceptance</td>
        <td><span class="code">8 (ExecutionReport)</span></td>
        <td><span class="code">0 (New)</span></td>
        <td><span class="code">0 (New)</span></td>
        <td>OrderQty</td>
        <td>0</td>
        <td><span class="badge-term term-open">Active (Open)</span></td>
      </tr>
      <tr>
        <td>Partial Fill (Tranche 1)</td>
        <td><span class="code">8 (ExecutionReport)</span></td>
        <td><span class="code">1 (Partial Fill)</span></td>
        <td><span class="code">1 (Partially Filled)</span></td>
        <td>Remaining Qty</td>
        <td>Filled Qty</td>
        <td><span class="badge-term term-open">Active (Open)</span></td>
      </tr>
      <tr>
        <td>Full Execution</td>
        <td><span class="code">8 (ExecutionReport)</span></td>
        <td><span class="code">2 (Fill)</span></td>
        <td><span class="code">2 (Filled)</span></td>
        <td>0</td>
        <td>OrderQty</td>
        <td><span class="badge-term term-closed">Terminal (Done)</span></td>
      </tr>
      <tr>
        <td>Cancel Request</td>
        <td><span class="code">F (OrderCancelRequest)</span></td>
        <td>-</td>
        <td><span class="code">6 (Pending Cancel)</span></td>
        <td>Remaining Qty</td>
        <td>CumQty</td>
        <td><span class="badge-term term-flight">In-Flight</span></td>
      </tr>
      <tr>
        <td>Successful Cancel</td>
        <td><span class="code">8 (ExecutionReport)</span></td>
        <td><span class="code">4 (Canceled)</span></td>
        <td><span class="code">4 (Canceled)</span></td>
        <td>0</td>
        <td>CumQty</td>
        <td><span class="badge-term term-closed">Terminal (Done)</span></td>
      </tr>
      <tr>
        <td>Risk Gate Rejection</td>
        <td><span class="code">8 (ExecutionReport)</span></td>
        <td><span class="code">8 (Rejected)</span></td>
        <td><span class="code">8 (Rejected)</span></td>
        <td>0</td>
        <td>0</td>
        <td><span class="badge-term term-closed">Terminal (Done)</span></td>
      </tr>
    </tbody>
  </table>
</div>
</body>
</html>
"""

def render_lifecycle():
    render_html_to_png(HTML_ORDER_LIFECYCLE, OUT_DIR / "fix-order-lifecycle-state-machine.png")

if __name__ == "__main__":
    render_lifecycle()
