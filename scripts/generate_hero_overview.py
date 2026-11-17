import os
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT_DIR = Path("src/assets/blog/trade-offs-in-data-systems-architecture")
OUT_DIR.mkdir(parents=True, exist_ok=True)

HTML_HERO_OVERVIEW = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: #f8fafc;
    color: #0f172a;
    padding: 32px;
    display: inline-block;
  }
  .bbg-canvas {
    width: 1240px;
    background: #ffffff;
    border: 1.5px solid #cbd5e1;
    border-radius: 14px;
    padding: 28px 32px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  }
  .bbg-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .bbg-title-block h1 {
    font-size: 23px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .bbg-title-block p {
    font-size: 13.5px;
    color: #64748b;
    margin-top: 4px;
  }
  .bbg-badge {
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* 4 Pillars Grid */
  .grid-2x2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 24px;
  }

  .pillar-card {
    border-radius: 10px;
    border: 1.5px solid #e2e8f0;
    background: #ffffff;
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    position: relative;
    overflow: hidden;
  }

  .pillar-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
  }
  .card-1::before { background: #2563eb; }
  .card-2::before { background: #ea580c; }
  .card-3::before { background: #16a34a; }
  .card-4::before { background: #7c3aed; }

  .pillar-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .pillar-tag {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .card-1 .pillar-tag { color: #2563eb; }
  .card-2 .pillar-tag { color: #ea580c; }
  .card-3 .pillar-tag { color: #16a34a; }
  .card-4 .pillar-tag { color: #7c3aed; }

  .pillar-title {
    font-size: 16px;
    font-weight: 800;
    color: #0f172a;
    margin-top: 2px;
  }

  .tradeoff-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px 12px;
  }
  .side-box {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .side-title {
    font-size: 12px;
    font-weight: 700;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .side-desc {
    font-size: 11px;
    color: #64748b;
    line-height: 1.4;
  }

  .verdict-banner {
    font-size: 11.5px;
    line-height: 1.45;
    padding: 8px 12px;
    border-radius: 6px;
    background: #f1f5f9;
    color: #334155;
    display: flex;
    align-items: flex-start;
    gap: 6px;
  }
  .verdict-banner strong { color: #0f172a; font-weight: 700; }

  /* Key Takeaway Footer */
  .overview-footer {
    border-top: 1.5px dashed #cbd5e1;
    padding-top: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12.5px;
    color: #475569;
  }
  .quote-pill {
    font-weight: 600;
    color: #b91c1c;
    font-style: italic;
  }
</style>
</head>
<body>
<div class="bbg-canvas">
  <div class="bbg-header">
    <div class="bbg-title-block">
      <h1>The 4 Core Architectural Trade-offs in Modern Data Systems</h1>
      <p>Visual decision framework mapping hardware economics, storage engines, and topology choices (DDIA 2nd Ed. Ch. 1)</p>
    </div>
    <div class="bbg-badge">EXECUTIVE SYSTEM DESIGN MAP</div>
  </div>

  <div class="grid-2x2">
    <!-- Card 1 -->
    <div class="pillar-card card-1">
      <div class="pillar-top">
        <span class="pillar-tag">Trade-off #1 · Storage Engine</span>
      </div>
      <div class="pillar-title">Row-Store (OLTP) vs. Column-Store (OLAP)</div>
      <div class="tradeoff-row">
        <div class="side-box">
          <div class="side-title">📄 Row-Oriented (PostgreSQL)</div>
          <div class="side-desc">Reads entire 8KB slotted page across NVMe bus. Fast point lookups; 99% I/O wasted on analytical aggregates.</div>
        </div>
        <div class="side-box">
          <div class="side-title">📊 Column-Oriented (ClickHouse)</div>
          <div class="side-desc">Scans only compressed column byte-arrays via SIMD registers. 100x faster scans; slow single-record updates.</div>
        </div>
      </div>
      <div class="verdict-banner">
        <span>⚡</span>
        <div><strong>The Engineering Rule:</strong> Never run heavy multi-year aggregation queries on transactional OLTP databases.</div>
      </div>
    </div>

    <!-- Card 2 -->
    <div class="pillar-card card-2">
      <div class="pillar-top">
        <span class="pillar-tag">Trade-off #2 · Data Decoupling</span>
      </div>
      <div class="pillar-title">Application Dual-Write vs. Change Data Capture (CDC)</div>
      <div class="tradeoff-row">
        <div class="side-box">
          <div class="side-title">❌ Dual-Write in Code</div>
          <div class="side-desc">App writes to both Postgres and ClickHouse. Network glitch causes silent divergence and permanent data drift.</div>
        </div>
        <div class="side-box">
          <div class="side-title">✅ Asynchronous CDC Stream</div>
          <div class="side-desc">Debezium tails Postgres WAL into Kafka log. Zero table locks, replayable offsets, 100% loss-tolerant replica.</div>
        </div>
      </div>
      <div class="verdict-banner">
        <span>🛡️</span>
        <div><strong>The Engineering Rule:</strong> Maintain one single authoritative System of Record and project derived stores asynchronously.</div>
      </div>
    </div>

    <!-- Card 3 -->
    <div class="pillar-card card-3">
      <div class="pillar-top">
        <span class="pillar-tag">Trade-off #3 · Physical Infrastructure</span>
      </div>
      <div class="pillar-title">Public Cloud (AWS) vs. Bare-Metal Colocation</div>
      <div class="tradeoff-row">
        <div class="side-box">
          <div class="side-title">☁️ Public Cloud Managed</div>
          <div class="side-desc">Zero hardware maintenance, elastic autoscaling, but $0.09/GB egress tax and metered EBS IOPS drive OpEx sky-high.</div>
        </div>
        <div class="side-box">
          <div class="side-title">🏢 Dedicated Colocation</div>
          <div class="side-desc">Fixed hardware CapEx ($3.2M saved by 37signals), unmetered 10G fiber, and 800k+ NVMe IOPS with zero monthly meter.</div>
        </div>
      </div>
      <div class="verdict-banner">
        <span>💰</span>
        <div><strong>The Engineering Rule:</strong> Rent cloud for unpredictable fast-growth MVPs; own bare metal for stable, high-throughput workloads.</div>
      </div>
    </div>

    <!-- Card 4 -->
    <div class="pillar-card card-4">
      <div class="pillar-top">
        <span class="pillar-tag">Trade-off #4 · Process Topology</span>
      </div>
      <div class="pillar-title">Serverless Microservices vs. In-Memory Monolith</div>
      <div class="tradeoff-row">
        <div class="side-box">
          <div class="side-title">🧩 Serverless Microservices</div>
          <div class="side-desc">Thousands of Lambdas passing data via S3 Tier-1 APIs and Step Functions. High latency, throttling, and bill explosion.</div>
        </div>
        <div class="side-box">
          <div class="side-title">🚀 Consolidated Monolith</div>
          <div class="side-desc">Single EC2 daemon passing uncompressed frames via in-memory ring buffers. 0ms network hops, 90% cost drop (Prime Video).</div>
        </div>
      </div>
      <div class="verdict-banner">
        <span>⚙️</span>
        <div><strong>The Engineering Rule:</strong> When components exchange gigabytes per second, network wires become the bottleneck. Consolidate into memory.</div>
      </div>
    </div>
  </div>

  <div class="overview-footer">
    <div class="quote-pill">"There are no solutions, only trade-offs." — Thomas Sowell</div>
    <div>System Design Roadmap · Martin Kleppmann & Chris Riccomini (DDIA 2nd Ed.)</div>
  </div>
</div>
</body>
</html>
"""

def generate():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(device_scale_factor=2)
        page.set_content(HTML_HERO_OVERVIEW)
        canvas = page.locator(".bbg-canvas")
        out_path = OUT_DIR / "architecture-tradeoffs-overview.png"
        canvas.screenshot(path=str(out_path))
        print(f"Generated hero diagram: {out_path}")
        browser.close()

if __name__ == "__main__":
    generate()
