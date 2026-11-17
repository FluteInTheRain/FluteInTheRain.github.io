import os
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT_DIR = Path("src/assets/blog/trade-offs-in-data-systems-architecture")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# 1. Row-Oriented vs Column-Oriented Storage Layout
HTML_ROW_VS_COL = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: #ffffff;
    color: #0f172a;
    padding: 32px;
    display: inline-block;
  }
  .container {
    width: 1140px;
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    padding: 28px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  }
  .header {
    border-bottom: 2px solid #f1f5f9;
    padding-bottom: 16px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .title {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
  }
  .subtitle {
    font-size: 13px;
    color: #64748b;
    margin-top: 4px;
  }
  .badge {
    background: #eff6ff;
    color: #2563eb;
    border: 1px solid #bfdbfe;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .grid-comparison {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  .panel {
    border-radius: 8px;
    padding: 20px;
    border: 1.5px solid;
  }
  .panel-row {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
  .panel-col {
    background: #f0fdf4;
    border-color: #86efac;
  }
  .panel-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }
  .icon-box {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 14px;
  }
  .icon-row { background: #3b82f6; color: #fff; }
  .icon-col { background: #16a34a; color: #fff; }
  .panel-title { font-size: 16px; font-weight: 700; color: #0f172a; }
  .panel-sub { font-size: 12px; color: #64748b; }
  
  .query-box {
    background: #1e293b;
    color: #f8fafc;
    padding: 10px 14px;
    border-radius: 6px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
  }
  .query-keyword { color: #38bdf8; font-weight: 700; }
  .query-func { color: #f472b6; font-weight: 700; }

  .disk-layout {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 14px;
    margin-bottom: 14px;
  }
  .layout-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 8px;
    letter-spacing: 0.05em;
  }
  .row-record {
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    margin-bottom: 8px;
    padding: 6px 10px;
    font-size: 11px;
    display: grid;
    grid-template-columns: 50px 70px 110px 1fr 75px;
    gap: 6px;
    align-items: center;
    background: #f1f5f9;
  }
  .cell-unused {
    color: #94a3b8;
    background: #e2e8f0;
    padding: 2px 6px;
    border-radius: 3px;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cell-target {
    background: #fee2e2;
    color: #b91c1c;
    border: 1px solid #f87171;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 3px;
    text-align: center;
  }
  .cell-target-good {
    background: #dcfce7;
    color: #15803d;
    border: 1px solid #4ade80;
    font-weight: 800;
    padding: 4px 8px;
    border-radius: 4px;
    text-align: center;
  }
  .col-tape {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    padding: 6px 10px;
    border-radius: 4px;
    border: 1px dashed #cbd5e1;
    background: #f8fafc;
    font-size: 11px;
  }
  .col-tape-active {
    border: 1.5px solid #22c55e;
    background: #f0fdf4;
  }
  .col-tape-label {
    width: 130px;
    font-weight: 700;
    color: #334155;
  }
  .col-tape-cells {
    display: flex;
    gap: 4px;
    flex: 1;
  }
  .tape-cell {
    padding: 3px 8px;
    border-radius: 3px;
    font-size: 11px;
    background: #e2e8f0;
    color: #64748b;
  }
  .stat-card {
    padding: 12px 14px;
    border-radius: 6px;
    font-size: 12px;
    line-height: 1.5;
  }
  .stat-bad {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
  }
  .stat-good {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
  }
  .stat-highlight {
    font-weight: 800;
    font-size: 14px;
  }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div>
      <div class="title">Row-Oriented vs. Column-Oriented Storage Layout</div>
      <div class="subtitle">Why running analytical aggregate queries on OLTP engines crushes memory and I/O</div>
    </div>
    <div class="badge">DDIA Chapter 1 Concept</div>
  </div>

  <div class="grid-comparison">
    <!-- Row-Oriented -->
    <div class="panel panel-row">
      <div class="panel-header">
        <div class="icon-box icon-row">R</div>
        <div>
          <div class="panel-title">Row-Oriented (PostgreSQL / MySQL)</div>
          <div class="panel-sub">Optimized for OLTP single-record reads & writes</div>
        </div>
      </div>

      <div class="query-box">
        <div><span class="query-keyword">SELECT</span> <span class="query-func">SUM</span>(amount) <span class="query-keyword">FROM</span> orders;</div>
        <div style="color: #ef4444; font-weight: 700;">Needs 8 bytes/row</div>
      </div>

      <div class="disk-layout">
        <div class="layout-title">Physical Page Layout on Disk (Slotted 8KB Page)</div>
        
        <div class="row-record">
          <span style="font-weight:700">Row 1:</span>
          <span class="cell-unused">Alice</span>
          <span class="cell-unused">123 Market St...</span>
          <span class="cell-unused">Visa 4242 · Notes...</span>
          <span class="cell-target">$35.00</span>
        </div>
        <div class="row-record">
          <span style="font-weight:700">Row 2:</span>
          <span class="cell-unused">Bob</span>
          <span class="cell-unused">456 Elm Ave...</span>
          <span class="cell-unused">Mastercard · Notes...</span>
          <span class="cell-target">$12.00</span>
        </div>
        <div class="row-record">
          <span style="font-weight:700">Row 3:</span>
          <span class="cell-unused">Carol</span>
          <span class="cell-unused">789 Pine Rd...</span>
          <span class="cell-unused">PayPal · Notes...</span>
          <span class="cell-target">$50.00</span>
        </div>
      </div>

      <div class="stat-card stat-bad">
        <div class="stat-highlight">⚠️ 99.2% I/O & Memory Bandwidth Wasted</div>
        <div>To sum 10M rows, the engine must fetch <strong>10 GB</strong> of entire row tuples from SSD/RAM just to read <strong>80 MB</strong> of amount data! Evicts hot buffer cache pages.</div>
      </div>
    </div>

    <!-- Column-Oriented -->
    <div class="panel panel-col">
      <div class="panel-header">
        <div class="icon-box icon-col">C</div>
        <div>
          <div class="panel-title">Column-Oriented (ClickHouse / BigQuery)</div>
          <div class="panel-sub">Optimized for OLAP analytical scans & aggregations</div>
        </div>
      </div>

      <div class="query-box">
        <div><span class="query-keyword">SELECT</span> <span class="query-func">SUM</span>(amount) <span class="query-keyword">FROM</span> orders;</div>
        <div style="color: #22c55e; font-weight: 700;">Zero Wasted Bytes</div>
      </div>

      <div class="disk-layout">
        <div class="layout-title">Physical Column Chunks on Disk</div>
        
        <div class="col-tape col-tape-active">
          <div class="col-tape-label" style="color:#15803d">orders.amount [Active]</div>
          <div class="col-tape-cells">
            <span class="cell-target-good">$35</span>
            <span class="cell-target-good">$12</span>
            <span class="cell-target-good">$50</span>
            <span class="cell-target-good">$15</span>
            <span class="cell-target-good">$22</span>
            <span class="cell-target-good">$45</span>
            <span class="cell-target-good">$31</span>
            <span class="cell-target-good">...</span>
          </div>
        </div>

        <div class="col-tape">
          <div class="col-tape-label">orders.customer [Ignored]</div>
          <div class="col-tape-cells">
            <span class="tape-cell">Alice</span><span class="tape-cell">Bob</span><span class="tape-cell">Carol</span><span class="tape-cell">Dave</span><span class="tape-cell">Eve</span>
          </div>
        </div>

        <div class="col-tape">
          <div class="col-tape-label">orders.address [Ignored]</div>
          <div class="col-tape-cells">
            <span class="tape-cell">123 Market</span><span class="tape-cell">456 Elm</span><span class="tape-cell">789 Pine</span><span class="tape-cell">...</span>
          </div>
        </div>
      </div>

      <div class="stat-card stat-good">
        <div class="stat-highlight">⚡ 100% I/O Efficiency + SIMD Vectorization</div>
        <div>Engine loads <strong>only the amount chunk</strong> (compressed down to ~20 MB). CPU uses <strong>AVX-512</strong> to sum 8 numbers per cycle. 1 billion rows scanned in <strong>50 ms</strong>!</div>
      </div>
    </div>
  </div>
</div>
</body>
</html>
"""

# 2. Modern CDC Pipeline (Decoupling OLTP from OLAP)
HTML_CDC_PIPELINE = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: #ffffff;
    color: #0f172a;
    padding: 32px;
    display: inline-block;
  }
  .container {
    width: 1160px;
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    padding: 28px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  }
  .header {
    border-bottom: 2px solid #f1f5f9;
    padding-bottom: 16px;
    margin-bottom: 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .title { font-size: 20px; font-weight: 800; color: #0f172a; }
  .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
  .badge { background: #fdf2f8; color: #db2777; border: 1px solid #fbcfe8; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }

  .pipeline-grid {
    display: grid;
    grid-template-columns: 200px 40px 220px 40px 210px 40px 240px;
    align-items: center;
  }
  .node-box {
    border-radius: 8px;
    padding: 16px;
    border: 1.5px solid;
    position: relative;
    background: #ffffff;
  }
  .node-oltp { border-color: #3b82f6; background: #f8fafc; }
  .node-cdc  { border-color: #eab308; background: #fefce8; }
  .node-queue { border-color: #ef4444; background: #fef2f2; }
  .node-olap { border-color: #10b981; background: #f0fdf4; }

  .step-badge {
    position: absolute;
    top: -10px;
    left: 14px;
    background: #0f172a;
    color: #ffffff;
    font-size: 10px;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 10px;
  }
  .node-title {
    font-size: 14px;
    font-weight: 700;
    margin-top: 4px;
    margin-bottom: 6px;
  }
  .node-desc {
    font-size: 11px;
    color: #64748b;
    line-height: 1.4;
  }
  .node-tag {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    margin-top: 8px;
  }
  .tag-oltp { background: #dbeafe; color: #1e40af; }
  .tag-cdc { background: #fef08a; color: #854d0e; }
  .tag-queue { background: #fee2e2; color: #991b1b; }
  .tag-olap { background: #d1fae5; color: #065f46; }

  .arrow-box {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #94a3b8;
    font-size: 20px;
    font-weight: 900;
  }

  .dual-write-warning {
    margin-top: 24px;
    padding: 14px 18px;
    border-radius: 8px;
    background: #fffbeb;
    border: 1.5px solid #fde68a;
    display: flex;
    gap: 14px;
    align-items: center;
  }
  .warning-icon { font-size: 24px; }
  .warning-text { font-size: 12px; color: #92400e; line-height: 1.5; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div>
      <div class="title">Decoupling OLTP from OLAP via Change Data Capture (CDC)</div>
      <div class="subtitle">How production architectures isolate analytical report loads from user checkout paths</div>
    </div>
    <div class="badge">Architecture Pattern</div>
  </div>

  <div class="pipeline-grid">
    <!-- Step 1: Client & OLTP -->
    <div class="node-box node-oltp">
      <div class="step-badge">Step 1</div>
      <div class="node-title">Primary Database (PostgreSQL)</div>
      <div class="node-desc">Receives checkout writes. Appends transaction to immutable Write-Ahead Log (WAL).</div>
      <div class="node-tag tag-oltp">System of Record</div>
    </div>

    <div class="arrow-box">➔</div>

    <!-- Step 2: CDC -->
    <div class="node-box node-cdc">
      <div class="step-badge">Step 2</div>
      <div class="node-title">Debezium CDC Connector</div>
      <div class="node-desc">Tails physical WAL stream. Zero query overhead; zero table locks on PostgreSQL.</div>
      <div class="node-tag tag-cdc">Log Tailer</div>
    </div>

    <div class="arrow-box">➔</div>

    <!-- Step 3: Kafka -->
    <div class="node-box node-queue">
      <div class="step-badge">Step 3</div>
      <div class="node-title">Apache Kafka Event Bus</div>
      <div class="node-desc">Buffers ordered change events (<code>order.created</code>) with persistent replayable logs.</div>
      <div class="node-tag tag-queue">Decoupling Buffer</div>
    </div>

    <div class="arrow-box">➔</div>

    <!-- Step 4: OLAP Warehouse -->
    <div class="node-box node-olap">
      <div class="step-badge">Step 4</div>
      <div class="node-title">ClickHouse / Snowflake</div>
      <div class="node-desc">Ingests streaming batches. Serves 3-year BI dashboards in &lt;100ms with zero checkout impact!</div>
      <div class="node-tag tag-olap">Derived Data (OLAP)</div>
    </div>
  </div>

  <div class="dual-write-warning">
    <div class="warning-icon">💡</div>
    <div class="warning-text">
      <strong>Why not write directly to both databases in app code (Dual-Write)?</strong> If the network call to the warehouse fails after committing to PostgreSQL, the systems silently diverge forever. CDC eliminates this risk by treating the transaction log as the single source of truth.
    </div>
  </div>
</div>
</body>
</html>
"""

# 3. Prime Video Monolith Refactoring
HTML_PRIME_VIDEO = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: #ffffff;
    color: #0f172a;
    padding: 32px;
    display: inline-block;
  }
  .container {
    width: 1140px;
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    padding: 28px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  }
  .header {
    border-bottom: 2px solid #f1f5f9;
    padding-bottom: 16px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .title { font-size: 20px; font-weight: 800; color: #0f172a; }
  .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
  .badge { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }

  .arch-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  .arch-card {
    border-radius: 8px;
    padding: 20px;
    border: 1.5px solid;
  }
  .card-before { background: #fff5f5; border-color: #fca5a5; }
  .card-after  { background: #f0fdf4; border-color: #86efac; }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    border-bottom: 1px dashed;
    padding-bottom: 10px;
  }
  .card-header-before { border-color: #fca5a5; }
  .card-header-after  { border-color: #86efac; }
  .card-title { font-size: 15px; font-weight: 700; color: #0f172a; }
  .card-tag-bad { background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
  .card-tag-good { background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }

  .flow-box {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
  }
  .flow-step {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 10px 12px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .step-icon {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 11px;
    flex-shrink: 0;
  }
  .icon-bad { background: #fee2e2; color: #991b1b; }
  .icon-good { background: #dcfce7; color: #166534; }

  .summary-box {
    padding: 12px 14px;
    border-radius: 6px;
    font-size: 12px;
    line-height: 1.5;
  }
  .summary-bad { background: #fee2e2; color: #7f1d1d; }
  .summary-good { background: #dcfce7; color: #14532d; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div>
      <div class="title">Amazon Prime Video Architecture: Serverless vs. Monolith</div>
      <div class="subtitle">Why de-distributing microservices cut cloud infrastructure bills by 90%</div>
    </div>
    <div class="badge">Production Case Study</div>
  </div>

  <div class="arch-grid">
    <!-- Before: Serverless -->
    <div class="arch-card card-before">
      <div class="card-header card-header-before">
        <div class="card-title">Before: Distributed Serverless</div>
        <div class="card-tag-bad">Expensive &amp; Throttled</div>
      </div>

      <div class="flow-box">
        <div class="flow-step">
          <div class="step-icon icon-bad">1</div>
          <div><strong>Step Functions</strong>: Orchestrates frame-by-frame state transitions over network</div>
        </div>
        <div class="flow-step">
          <div class="step-icon icon-bad">2</div>
          <div><strong>Amazon S3</strong>: Millions of intermediate frame PUT/GET calls every minute ($$$)</div>
        </div>
        <div class="flow-step">
          <div class="step-icon icon-bad">3</div>
          <div><strong>AWS Lambda</strong>: Microservices serialize/deserialize uncompressed video frames</div>
        </div>
      </div>

      <div class="summary-box summary-bad">
        <strong>Root Cause of Failure:</strong> Passing uncompressed video frames over datacenter networks and object store APIs hit AWS account limits, caused high latency, and generated astronomical cloud bills.
      </div>
    </div>

    <!-- After: Monolith -->
    <div class="arch-card card-after">
      <div class="card-header card-header-after">
        <div class="card-title">After: In-Memory ECS Monolith</div>
        <div class="card-tag-good">90% Cost Cut</div>
      </div>

      <div class="flow-box">
        <div class="flow-step">
          <div class="step-icon icon-good">1</div>
          <div><strong>Single Container (ECS/EC2)</strong>: Media converter &amp; detectors in same process memory</div>
        </div>
        <div class="flow-step">
          <div class="step-icon icon-good">2</div>
          <div><strong>Zero S3 API Hops</strong>: Frames held in POSIX shared memory (RAM buffers)</div>
        </div>
        <div class="flow-step">
          <div class="step-icon icon-good">3</div>
          <div><strong>Instant Pointer Passing</strong>: 5 nanoseconds latency instead of 50ms HTTP network hop</div>
        </div>
      </div>

      <div class="summary-box summary-good">
        <strong>The Victory:</strong> Eliminated Step Functions transition limits and S3 API fees completely. Scaled to thousands of concurrent video streams while saving <strong>90% of infrastructure cost</strong>.
      </div>
    </div>
  </div>
</div>
</body>
</html>
"""

def render_html_to_png(html_str, out_path):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(device_scale_factor=2)
        page.set_content(html_str)
        # Wait for fonts to load
        page.wait_for_timeout(300)
        element = page.query_selector(".container")
        element.screenshot(path=str(out_path))
        browser.close()
    print(f"Rendered: {out_path}")

if __name__ == "__main__":
    render_html_to_png(HTML_ROW_VS_COL, OUT_DIR / "row-vs-column-storage-engine.png")
    render_html_to_png(HTML_CDC_PIPELINE, OUT_DIR / "cdc-pipeline-oltp-to-olap.png")
    render_html_to_png(HTML_PRIME_VIDEO, OUT_DIR / "prime-video-monolith-refactor.png")
    print("All Playwright diagrams rendered successfully!")
