import os
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT_DIR = Path("src/assets/blog/trade-offs-in-data-systems-architecture")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Common SVG Icons for ByteByteGo Architecture Style
SVG_USER = """<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>"""
SVG_CLIENTS = """<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>"""
SVG_DB = """<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>"""
SVG_DB_GREEN = """<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>"""
SVG_KAFKA = """<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="#ea580c"/><circle cx="14" cy="12" r="2" fill="#ea580c"/><circle cx="10" cy="18" r="2" fill="#ea580c"/></svg>"""
SVG_GEAR = """<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>"""
SVG_CHART = """<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>"""
SVG_LAMBDA = """<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l6-14h6"/><path d="M9 14l-4 6"/></svg>"""
SVG_S3 = """<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>"""
SVG_CONTAINER = """<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>"""


# -------------------------------------------------------------
# 1. ByteByteGo Style: Row-Oriented vs Column-Oriented Storage
# -------------------------------------------------------------
HTML_ROW_VS_COL = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: #f8fafc;
    color: #0f172a;
    padding: 36px;
    display: inline-block;
  }}
  .bbg-canvas {{
    width: 1220px;
    background: #ffffff;
    border: 1.5px solid #cbd5e1;
    border-radius: 14px;
    padding: 28px 32px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
  }}
  .bbg-header {{
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }}
  .bbg-title-block h1 {{
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 10px;
  }}
  .bbg-title-block p {{
    font-size: 13px;
    color: #64748b;
    margin-top: 4px;
  }}
  .bbg-badge {{
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }}

  /* Query Context Bar */
  .scenario-bar {{
    background: #0f172a;
    color: #f8fafc;
    border-radius: 8px;
    padding: 12px 18px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }}
  .query-text {{
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 13px;
  }}
  .query-highlight {{ color: #38bdf8; font-weight: 700; }}
  .query-target {{ color: #4ade80; font-weight: 700; text-decoration: underline; }}
  .scenario-goal {{
    font-size: 12px;
    background: #334155;
    padding: 4px 10px;
    border-radius: 6px;
    color: #cbd5e1;
  }}

  /* Main Comparison Grid */
  .comparison-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 28px;
  }}

  /* Engine Card */
  .engine-card {{
    border-radius: 10px;
    border: 2px solid;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }}
  .card-row {{
    background: #fdfefe;
    border-color: #93c5fd;
  }}
  .card-col {{
    background: #fdfefe;
    border-color: #86efac;
  }}

  .engine-header {{
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 12px;
  }}
  .engine-icon-wrap {{
    width: 42px;
    height: 42px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }}
  .icon-wrap-row {{ background: #eff6ff; border: 1px solid #bfdbfe; }}
  .icon-wrap-col {{ background: #f0fdf4; border: 1px solid #bbf7d0; }}
  .engine-name {{ font-size: 16px; font-weight: 800; color: #0f172a; }}
  .engine-sub {{ font-size: 12px; color: #64748b; }}

  /* Step Sections inside Engine */
  .layer-box {{
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px 14px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  }}
  .layer-title {{
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #475569;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }}
  .step-circle {{
    width: 18px;
    height: 18px;
    border-radius: 50%;
    color: #fff;
    font-size: 10px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }}
  .step-row {{ background: #2563eb; }}
  .step-col {{ background: #16a34a; }}

  /* Row Store Disk Layout */
  .disk-pages {{
    display: flex;
    flex-direction: column;
    gap: 6px;
  }}
  .page-box {{
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    background: #f8fafc;
    padding: 6px 8px;
  }}
  .page-tag {{
    font-size: 9px;
    font-weight: 700;
    color: #64748b;
    margin-bottom: 3px;
  }}
  .row-tuple {{
    display: flex;
    gap: 4px;
    font-family: ui-monospace, Menlo, monospace;
    font-size: 10px;
  }}
  .cell {{
    padding: 3px 6px;
    border-radius: 3px;
    border: 1px solid;
  }}
  .cell-useless {{
    background: #f1f5f9;
    border-color: #e2e8f0;
    color: #94a3b8;
  }}
  .cell-active-row {{
    background: #fee2e2;
    border-color: #fca5a5;
    color: #b91c1c;
    font-weight: 700;
  }}
  .cell-active-col {{
    background: #dcfce7;
    border-color: #86efac;
    color: #15803d;
    font-weight: 700;
  }}

  /* Column Store Disk Layout */
  .col-files {{
    display: flex;
    flex-direction: column;
    gap: 6px;
  }}
  .col-file-box {{
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 6px 8px;
  }}
  .file-active {{
    background: #f0fdf4;
    border-color: #86efac;
  }}
  .file-inactive {{
    background: #f8fafc;
    border-color: #e2e8f0;
    opacity: 0.6;
  }}
  .col-values {{
    display: flex;
    gap: 4px;
    font-family: ui-monospace, Menlo, monospace;
    font-size: 10px;
    margin-top: 3px;
    flex-wrap: wrap;
  }}

  /* Flow Connector Arrow */
  .flow-arrow {{
    display: flex;
    justify-content: center;
    align-items: center;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 700;
    padding: 2px 0;
  }}

  /* Outcome Card */
  .outcome-box {{
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 12px;
    line-height: 1.5;
  }}
  .outcome-row {{
    background: #fff1f2;
    border: 1.5px solid #fecdd3;
    color: #9f1239;
  }}
  .outcome-col {{
    background: #f0fdf4;
    border: 1.5px solid #bbf7d0;
    color: #14532d;
  }}
  .stat-row {{
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
    font-weight: 700;
    font-size: 11px;
  }}
</style>
</head>
<body>
<div class="bbg-canvas">
  <!-- Header -->
  <div class="bbg-header">
    <div class="bbg-title-block">
      <h1>Row-Oriented vs. Column-Oriented Storage Engine</h1>
      <p>How physical storage layout determines I/O throughput and CPU cache efficiency for analytical queries (DDIA Ch. 1 & 3)</p>
    </div>
    <div class="bbg-badge">BYTEBYTEGO STYLE · SYSTEM DESIGN 101</div>
  </div>

  <!-- Scenario Bar -->
  <div class="scenario-bar">
    <div class="query-text">
      <span class="query-highlight">SELECT</span> <span class="query-target">SUM(amount)</span> <span class="query-highlight">FROM</span> orders <span class="query-highlight">WHERE</span> status = 'COMPLETED';
    </div>
    <div class="scenario-goal">Analytical Aggregation over 10,000,000 Rows</div>
  </div>

  <!-- Main Comparison -->
  <div class="comparison-grid">

    <!-- Row-Oriented Column -->
    <div class="engine-card card-row">
      <div class="engine-header">
        <div class="engine-icon-wrap icon-wrap-row">{SVG_DB}</div>
        <div>
          <div class="engine-name">Row-Oriented (PostgreSQL / MySQL)</div>
          <div class="engine-sub">Optimized for OLTP: fast point lookups & transactional writes</div>
        </div>
      </div>

      <!-- Step 1: Disk Storage -->
      <div class="layer-box">
        <div class="layer-title">
          <span class="step-circle step-row">1</span>
          <span>Physical Slotted Pages on Disk (8KB Block)</span>
        </div>
        <div class="disk-pages">
          <div class="page-box">
            <div class="page-tag">Page 0x01 (8KB)</div>
            <div class="row-tuple">
              <span class="cell cell-useless">#101</span>
              <span class="cell cell-useless">User:44</span>
              <span class="cell cell-useless">2026-03-01</span>
              <span class="cell cell-active-row">$45.00</span>
              <span class="cell cell-useless">Visa 4242 · Notes...</span>
            </div>
          </div>
          <div class="page-box">
            <div class="page-tag">Page 0x02 (8KB)</div>
            <div class="row-tuple">
              <span class="cell cell-useless">#102</span>
              <span class="cell cell-useless">User:89</span>
              <span class="cell cell-useless">2026-03-01</span>
              <span class="cell cell-active-row">$12.50</span>
              <span class="cell cell-useless">PayPal · Notes...</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flow-arrow">▼ Reads 100% of entire 8KB pages across NVMe bus</div>

      <!-- Step 2: RAM Buffer Pool -->
      <div class="layer-box">
        <div class="layer-title">
          <span class="step-circle step-row">2</span>
          <span>Shared Buffer Pool (RAM Cache)</span>
        </div>
        <div style="font-size: 11px; color: #475569; line-height: 1.4;">
          Engine must load <strong>all 8KB pages</strong> into RAM. For 10M rows, it loads <strong>~2.0 GB</strong> of user IDs, dates, addresses, and payment notes just to inspect 80 MB of numbers!
        </div>
      </div>

      <div class="flow-arrow">▼ Sequential pointer traversal in single CPU thread</div>

      <!-- Step 3: CPU Processing -->
      <div class="layer-box">
        <div class="layer-title">
          <span class="step-circle step-row">3</span>
          <span>CPU Execution (Scalar / Row-by-Row)</span>
        </div>
        <div style="font-size: 11px; color: #475569; line-height: 1.4;">
          CPU core parses tuple headers, fetches row offset pointers, and adds one scalar value at a time. High L1/L2 cache misses.
        </div>
      </div>

      <!-- Outcome -->
      <div class="outcome-box outcome-row">
        <div style="font-weight: 800; margin-bottom: 4px;">⚠️ Bottleneck: 96% Memory & I/O Bandwidth Wasted</div>
        <div>Aggregations evict critical OLTP transactional cache pages from RAM, crippling simultaneous user checkout operations.</div>
        <div class="stat-row">
          <span>Scan Time: <strong>~12.4 seconds</strong></span>
          <span>Data Read: <strong>2.0 GB</strong></span>
        </div>
      </div>
    </div>

    <!-- Column-Oriented Column -->
    <div class="engine-card card-col">
      <div class="engine-header">
        <div class="engine-icon-wrap icon-wrap-col">{SVG_DB_GREEN}</div>
        <div>
          <div class="engine-name">Column-Oriented (ClickHouse / BigQuery)</div>
          <div class="engine-sub">Optimized for OLAP: massive aggregations & analytical scans</div>
        </div>
      </div>

      <!-- Step 1: Disk Storage -->
      <div class="layer-box">
        <div class="layer-title">
          <span class="step-circle step-col">1</span>
          <span>Contiguous Column Chunk Files on Disk</span>
        </div>
        <div class="col-files">
          <div class="col-file-box file-active">
            <div class="page-tag" style="color: #15803d; font-weight: 700;">orders.amount.bin [ACTIVE SCAN] (LZ4 Compressed)</div>
            <div class="col-values">
              <span class="cell cell-active-col">$45.00</span>
              <span class="cell cell-active-col">$12.50</span>
              <span class="cell cell-active-col">$89.00</span>
              <span class="cell cell-active-col">$34.20</span>
              <span class="cell cell-active-col">$15.00</span>
              <span class="cell cell-active-col">... 10M rows</span>
            </div>
          </div>
          <div class="col-file-box file-inactive">
            <div class="page-tag">orders.user_id.bin · orders.address.bin [NEVER OPENED]</div>
            <div style="font-size: 9px; color: #94a3b8;">Zero I/O requested from disk for unused columns</div>
          </div>
        </div>
      </div>

      <div class="flow-arrow">▼ Streams ONLY the 16 MB compressed amount file into RAM</div>

      <!-- Step 2: Direct RAM Stream -->
      <div class="layer-box">
        <div class="layer-title">
          <span class="step-circle step-col">2</span>
          <span>Zero-Copy Direct I/O & Decompression</span>
        </div>
        <div style="font-size: 11px; color: #475569; line-height: 1.4;">
          Because numbers are stored contiguously, LZ4/Gorilla compresses them 10x. Only <strong>16 MB</strong> is read from NVMe disk, with zero wasted bytes loaded.
        </div>
      </div>

      <div class="flow-arrow">▼ Vectorized SIMD (Single Instruction Multiple Data)</div>

      <!-- Step 3: CPU Processing -->
      <div class="layer-box">
        <div class="layer-title">
          <span class="step-circle step-col">3</span>
          <span>Vectorized SIMD Processing (AVX-512)</span>
        </div>
        <div style="font-size: 11px; color: #475569; line-height: 1.4;">
          CPU registers pack 8 to 16 numbers into a single 512-bit register, performing additions in <strong>1 single CPU clock cycle</strong>!
        </div>
      </div>

      <!-- Outcome -->
      <div class="outcome-box outcome-col">
        <div style="font-weight: 800; margin-bottom: 4px;">⚡ Result: 100% I/O Efficiency (400x Faster)</div>
        <div>Zero interference with operational OLTP databases. Scans 10 million rows in milliseconds using dense array parallelism.</div>
        <div class="stat-row">
          <span>Scan Time: <strong>~28 milliseconds</strong></span>
          <span>Data Read: <strong>16 MB (Compressed)</strong></span>
        </div>
      </div>
    </div>

  </div>
</div>
</body>
</html>
"""

# -------------------------------------------------------------
# 2. ByteByteGo Style: Modern CDC Architecture Pipeline
# -------------------------------------------------------------
HTML_CDC_PIPELINE = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: #f8fafc;
    color: #0f172a;
    padding: 36px;
    display: inline-block;
  }}
  .bbg-canvas {{
    width: 1360px;
    background: #ffffff;
    border: 1.5px solid #cbd5e1;
    border-radius: 14px;
    padding: 28px 32px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  }}
  .bbg-header {{
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 16px;
    margin-bottom: 28px;
  }}
  .bbg-title-block h1 {{
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
  }}
  .bbg-title-block p {{
    font-size: 13px;
    color: #64748b;
    margin-top: 4px;
  }}
  .bbg-badge {{
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }}

  /* Main Pipeline Grid */
  .topology-row {{
    display: grid;
    grid-template-columns: 155px 75px 220px 75px 235px 75px 220px 75px 155px;
    align-items: center;
    margin-bottom: 28px;
  }}

  /* Node Cards */
  .node-card {{
    border-radius: 10px;
    border: 1.5px solid;
    padding: 16px 14px;
    background: #ffffff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.03);
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 190px;
  }}
  .node-client {{
    border-color: #93c5fd;
    background: #f8fbff;
  }}
  .node-oltp {{
    border-color: #60a5fa;
    background: #f0f7ff;
  }}
  .node-kafka {{
    border-color: #fdba74;
    background: #fffaf5;
  }}
  .node-olap {{
    border-color: #86efac;
    background: #f0fdf4;
  }}
  .node-bi {{
    border-color: #d8b4fe;
    background: #faf5ff;
  }}

  .node-header {{
    display: flex;
    align-items: center;
    gap: 8px;
  }}
  .node-title {{
    font-size: 13px;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.2;
  }}
  .node-sub {{
    font-size: 10px;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
  }}
  .node-detail {{
    font-size: 11px;
    color: #475569;
    line-height: 1.4;
  }}

  /* Inner Component Chips */
  .inner-chip {{
    border-radius: 5px;
    padding: 5px 8px;
    font-size: 10px;
    font-family: ui-monospace, Menlo, monospace;
    border: 1px solid;
  }}
  .chip-wal {{
    background: #ffffff;
    border-color: #bfdbfe;
    color: #1e40af;
  }}
  .chip-kafka {{
    background: #ffffff;
    border-color: #fed7aa;
    color: #c2410c;
  }}
  .chip-ch {{
    background: #ffffff;
    border-color: #bbf7d0;
    color: #15803d;
  }}

  /* Connectors & Step Badges */
  .connector-cell {{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }}
  .step-badge {{
    width: 22px;
    height: 22px;
    border-radius: 50%;
    color: #ffffff;
    font-size: 11px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
    margin-bottom: 4px;
  }}
  .step-1 {{ background: #2563eb; }}
  .step-2 {{ background: #d97706; }}
  .step-3 {{ background: #ea580c; }}
  .step-4 {{ background: #16a34a; }}

  .arrow-line {{
    width: 100%;
    height: 2px;
    background: #94a3b8;
    position: relative;
  }}
  .arrow-line::after {{
    content: '';
    position: absolute;
    right: 0;
    top: -4px;
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 6px solid #64748b;
  }}
  .arrow-label {{
    font-size: 9.5px;
    font-weight: 700;
    color: #475569;
    margin-top: 5px;
    text-align: center;
    white-space: nowrap;
    background: #ffffff;
    padding: 2px 6px;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.06);
    border: 1px solid #e2e8f0;
  }}

  /* Payload Callout Box */
  .payload-callout {{
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 10px 14px;
    font-family: ui-monospace, Menlo, monospace;
    font-size: 10px;
    color: #334155;
    margin-top: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }}
  .payload-key {{ color: #2563eb; }}
  .payload-val {{ color: #059669; }}

  /* Architectural Comparison Footer */
  .footer-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    border-top: 2px solid #e2e8f0;
    padding-top: 20px;
  }}
  .footer-box {{
    border-radius: 8px;
    padding: 14px 18px;
    font-size: 12px;
    line-height: 1.5;
  }}
  .footer-bad {{
    background: #fff1f2;
    border: 1.5px solid #fecdd3;
    color: #9f1239;
  }}
  .footer-good {{
    background: #f0fdf4;
    border: 1.5px solid #bbf7d0;
    color: #14532d;
  }}
  .footer-title {{
    font-size: 13px;
    font-weight: 800;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }}
</style>
</head>
<body>
<div class="bbg-canvas">
  <!-- Header -->
  <div class="bbg-header">
    <div class="bbg-title-block">
      <h1>Enterprise Data Architecture: Decoupling OLTP from OLAP via CDC</h1>
      <p>How production systems isolate analytical queries from transactional checkout flows using Change Data Capture (DDIA Ch. 1 & 11)</p>
    </div>
    <div class="bbg-badge">BYTEBYTEGO STYLE · ARCHITECTURE PATTERN</div>
  </div>

  <!-- End-to-End Pipeline -->
  <div class="topology-row">

    <!-- Node 1: Clients -->
    <div class="node-card node-client">
      <div class="node-header">
        {SVG_CLIENTS}
        <div>
          <div class="node-title">Client Apps</div>
          <div class="node-sub">Web & Mobile</div>
        </div>
      </div>
      <div class="node-detail">Users purchasing items and completing order payments.</div>
      <div class="inner-chip" style="background:#ffffff; color:#2563eb; border-color:#bfdbfe;">
        POST /checkout
      </div>
    </div>

    <!-- Connector 1 -->
    <div class="connector-cell">
      <div class="step-badge step-1">①</div>
      <div class="arrow-line"></div>
      <div class="arrow-label">SQL Write</div>
    </div>

    <!-- Node 2: PostgreSQL OLTP -->
    <div class="node-card node-oltp">
      <div class="node-header">
        {SVG_DB}
        <div>
          <div class="node-title">PostgreSQL (Primary)</div>
          <div class="node-sub">System of Record</div>
        </div>
      </div>
      <div class="node-detail">Commits order to heap table & records to transaction log.</div>
      <div class="inner-chip chip-wal">
        WAL (Write-Ahead Log)
      </div>
      <div style="font-size:9px; color:#1e40af;">★ Authoritative Source of Truth</div>
    </div>

    <!-- Connector 2 -->
    <div class="connector-cell">
      <div class="step-badge step-2">②</div>
      <div class="arrow-line"></div>
      <div class="arrow-label">WAL Stream</div>
    </div>

    <!-- Node 3: Kafka & Debezium -->
    <div class="node-card node-kafka">
      <div class="node-header">
        {SVG_KAFKA}
        <div>
          <div class="node-title">Kafka + Debezium</div>
          <div class="node-sub">Streaming Buffer</div>
        </div>
      </div>
      <div class="node-detail">Tails WAL via replication protocol without table locks.</div>
      <div class="inner-chip chip-kafka">
        Topic: orders.events
      </div>
      <div class="payload-callout">
        <div><span class="payload-key">"op"</span>: <span class="payload-val">"c"</span>,</div>
        <div><span class="payload-key">"order_id"</span>: <span class="payload-val">10928</span>,</div>
        <div><span class="payload-key">"amount"</span>: <span class="payload-val">49.90</span></div>
      </div>
    </div>

    <!-- Connector 3 -->
    <div class="connector-cell">
      <div class="step-badge step-3">③</div>
      <div class="arrow-line"></div>
      <div class="arrow-label">Micro-batch</div>
    </div>

    <!-- Node 4: ClickHouse OLAP -->
    <div class="node-card node-olap">
      <div class="node-header">
        {SVG_DB_GREEN}
        <div>
          <div class="node-title">ClickHouse Cluster</div>
          <div class="node-sub">Derived Data Store</div>
        </div>
      </div>
      <div class="node-detail">Flushes batches of 50,000 rows into columnar compressed parts.</div>
      <div class="inner-chip chip-ch">
        ReplacingMergeTree
      </div>
      <div style="font-size:9px; color:#15803d;">★ 100% Loss-Tolerant Replica</div>
    </div>

    <!-- Connector 4 -->
    <div class="connector-cell">
      <div class="step-badge step-4">④</div>
      <div class="arrow-line"></div>
      <div class="arrow-label">SQL Scan</div>
    </div>

    <!-- Node 5: BI Analytics -->
    <div class="node-card node-bi">
      <div class="node-header">
        {SVG_CHART}
        <div>
          <div class="node-title">BI Dashboards</div>
          <div class="node-sub">Metabase / Tableau</div>
        </div>
      </div>
      <div class="node-detail">Finance & Marketing team queries 3 years of revenue metrics.</div>
      <div class="inner-chip" style="background:#ffffff; color:#7c3aed; border-color:#e9d5ff;">
        Latency: 35ms ⚡
      </div>
    </div>

  </div>

  <!-- Bottom Comparison Callouts -->
  <div class="footer-grid">
    <div class="footer-box footer-bad">
      <div class="footer-title">
        <span>❌ Anti-Pattern: Dual-Write in Application Code</span>
      </div>
      <div>
        Having the backend application write directly to both PostgreSQL and ClickHouse creates a distributed state nightmare: if the network drops between writes, the databases silently diverge forever without a distributed two-phase commit.
      </div>
    </div>

    <div class="footer-box footer-good">
      <div class="footer-title">
        <span>✅ Best Practice: Single Source of Truth + Async Replay</span>
      </div>
      <div>
        App writes <strong>only</strong> to PostgreSQL. If the analytics warehouse fails or corrupts, zero customer data is lost: simply spin up a fresh ClickHouse node and replay the Kafka offset log to restore 100% of the analytical state.
      </div>
    </div>
  </div>

</div>
</body>
</html>
"""

# -------------------------------------------------------------
# 3. ByteByteGo Style: Amazon Prime Video Refactoring Case Study
# -------------------------------------------------------------
HTML_PRIME_VIDEO = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: #f8fafc;
    color: #0f172a;
    padding: 36px;
    display: inline-block;
  }}
  .bbg-canvas {{
    width: 1220px;
    background: #ffffff;
    border: 1.5px solid #cbd5e1;
    border-radius: 14px;
    padding: 28px 32px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  }}
  .bbg-header {{
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }}
  .bbg-title-block h1 {{
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
  }}
  .bbg-title-block p {{
    font-size: 13px;
    color: #64748b;
    margin-top: 4px;
  }}
  .bbg-badge {{
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }}

  /* 2-Column Before/After Comparison */
  .arch-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 28px;
  }}

  .arch-column {{
    border-radius: 10px;
    border: 2px solid;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }}
  .col-before {{
    background: #fffcfc;
    border-color: #fca5a5;
  }}
  .col-after {{
    background: #fcfffd;
    border-color: #86efac;
  }}

  .arch-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1.5px dashed;
    padding-bottom: 12px;
  }}
  .arch-header-before {{ border-color: #fca5a5; }}
  .arch-header-after {{ border-color: #86efac; }}
  .arch-title {{
    font-size: 16px;
    font-weight: 800;
    color: #0f172a;
  }}
  .tag-bad {{
    background: #fee2e2;
    color: #991b1b;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
  }}
  .tag-good {{
    background: #dcfce7;
    color: #166534;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
  }}

  /* Diagram Interior Nodes */
  .diagram-interior {{
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }}

  .microservice-step {{
    display: flex;
    align-items: center;
    gap: 10px;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 10px 12px;
  }}
  .step-icon-wrap {{
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }}
  .step-info {{
    flex: 1;
  }}
  .step-name {{
    font-size: 12px;
    font-weight: 700;
    color: #0f172a;
  }}
  .step-desc {{
    font-size: 11px;
    color: #64748b;
  }}

  .s3-transit-box {{
    background: #fff7ed;
    border: 1.5px dashed #fdba74;
    border-radius: 6px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    color: #9a3412;
  }}

  .ipc-transit-box {{
    background: #f0fdf4;
    border: 1.5px solid #86efac;
    border-radius: 6px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    color: #166534;
    font-weight: 700;
  }}

  /* Pain Points & Gains */
  .callout-box {{
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 12px;
    line-height: 1.5;
  }}
  .callout-bad {{
    background: #fff1f2;
    border: 1.5px solid #fecdd3;
    color: #9f1239;
  }}
  .callout-good {{
    background: #f0fdf4;
    border: 1.5px solid #bbf7d0;
    color: #14532d;
  }}
  .callout-item {{
    margin-top: 4px;
    display: flex;
    align-items: flex-start;
    gap: 6px;
  }}
</style>
</head>
<body>
<div class="bbg-canvas">
  <!-- Header -->
  <div class="bbg-header">
    <div class="bbg-title-block">
      <h1>Amazon Prime Video Architecture: Serverless vs. Monolith Case Study</h1>
      <p>Why de-distributing microservices slashed cloud infrastructure bills by 90% (DDIA Ch. 1: Scalability & Maintainability)</p>
    </div>
    <div class="bbg-badge">BYTEBYTEGO STYLE · PRODUCTION CASE STUDY</div>
  </div>

  <div class="arch-grid">

    <!-- Before: Serverless Microservices -->
    <div class="arch-column col-before">
      <div class="arch-header arch-header-before">
        <div class="arch-title">Before: Distributed Serverless Microservices</div>
        <div class="tag-bad">Expensive &amp; Throttled</div>
      </div>

      <div class="diagram-interior">
        <div class="microservice-step">
          <div class="step-icon-wrap">{SVG_GEAR}</div>
          <div class="step-info">
            <div class="step-name">AWS Step Functions (State Machine)</div>
            <div class="step-desc">Orchestrates frame-by-frame pipeline over datacenter network</div>
          </div>
        </div>

        <div class="s3-transit-box">
          {SVG_S3}
          <div>
            <strong>Amazon S3 Bucket (Transit Storage)</strong><br/>
            Millions of intermediate uncompressed video frames written via Tier 1 API calls ($$$)
          </div>
        </div>

        <div class="microservice-step">
          <div class="step-icon-wrap">{SVG_LAMBDA}</div>
          <div class="step-info">
            <div class="step-name">AWS Lambda: Defect Detector</div>
            <div class="step-desc">Downloads frame from S3, deserializes image, scans for glitches</div>
          </div>
        </div>

        <div class="s3-transit-box">
          {SVG_S3}
          <div>
            <strong>Amazon S3 Bucket (Transit Storage)</strong><br/>
            Writes detection metadata and frames back to S3 for next microservice
          </div>
        </div>

        <div class="microservice-step">
          <div class="step-icon-wrap">{SVG_LAMBDA}</div>
          <div class="step-info">
            <div class="step-name">AWS Lambda: Audio-Video Sync</div>
            <div class="step-desc">Downloads frame again from S3 to align audio timestamps</div>
          </div>
        </div>
      </div>

      <div class="callout-box callout-bad">
        <div style="font-weight: 800; margin-bottom: 4px;">❌ Fatal Architecture Bottlenecks</div>
        <div class="callout-item">• <strong>S3 Tier-1 API Costs:</strong> Paying per PUT/GET on millions of video chunks per minute crushed the budget.</div>
        <div class="callout-item">• <strong>Step Functions Limits:</strong> Hit hard AWS account limits on state transitions per second.</div>
        <div class="callout-item">• <strong>Network Latency:</strong> Transferring gigabytes of uncompressed frames over network added seconds of delay.</div>
      </div>
    </div>

    <!-- After: Consolidated Container Monolith -->
    <div class="arch-column col-after">
      <div class="arch-header arch-header-after">
        <div class="arch-title">After: In-Memory Container Monolith (ECS)</div>
        <div class="tag-good">90% Cost Cut &amp; Sub-ms IPC</div>
      </div>

      <div class="diagram-interior">
        <div style="font-size: 11px; font-weight: 700; color: #15803d; text-transform: uppercase;">
          Single Amazon ECS Task (Shared Host Memory Boundary)
        </div>

        <div class="microservice-step" style="background: #f0fdf4; border-color: #bbf7d0;">
          <div class="step-icon-wrap">{SVG_CONTAINER}</div>
          <div class="step-info">
            <div class="step-name">Media Conversion Component</div>
            <div class="step-desc">Ingests video stream directly into host RAM buffer</div>
          </div>
        </div>

        <div class="ipc-transit-box">
          ⚡ Shared Memory Pointer: <code>void* frame_buffer</code> (0ms, 0 Network, 0 S3 Calls)
        </div>

        <div class="microservice-step" style="background: #f0fdf4; border-color: #bbf7d0;">
          <div class="step-icon-wrap">{SVG_CONTAINER}</div>
          <div class="step-info">
            <div class="step-name">Defect Detector Component</div>
            <div class="step-desc">Inspects video frame in place directly inside shared RAM</div>
          </div>
        </div>

        <div class="ipc-transit-box">
          ⚡ In-Memory Ring Buffer / POSIX Shared Memory (Sub-microsecond IPC)
        </div>

        <div class="microservice-step" style="background: #f0fdf4; border-color: #bbf7d0;">
          <div class="step-icon-wrap">{SVG_CONTAINER}</div>
          <div class="step-info">
            <div class="step-name">Audio-Video Sync Component</div>
            <div class="step-desc">Analyzes frame audio correlation without leaving host memory</div>
          </div>
        </div>
      </div>

      <div class="callout-box callout-good">
        <div style="font-weight: 800; margin-bottom: 4px;">✅ Architectural Triumphs</div>
        <div class="callout-item">• <strong>90% Cloud Cost Cut:</strong> Eradicated millions of S3 API calls and Step Function transitions.</div>
        <div class="callout-item">• <strong>RAM-Speed Transfers:</strong> Passing pointer addresses in memory takes nanoseconds vs network I/O.</div>
        <div class="callout-item">• <strong>Horizontal Scaling:</strong> Scale entire container fleet dynamically with Amazon ECS / EC2 autoscaling.</div>
      </div>
    </div>

  </div>
</div>
</body>
</html>
"""


def render_all():
    targets = [
        ("row-vs-column-storage-engine.png", HTML_ROW_VS_COL),
        ("cdc-pipeline-oltp-to-olap.png", HTML_CDC_PIPELINE),
        ("prime-video-monolith-refactor.png", HTML_PRIME_VIDEO),
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch()
        for filename, html in targets:
            page = browser.new_page(device_scale_factor=2)
            page.set_content(html)
            container = page.locator(".bbg-canvas")
            out_path = OUT_DIR / filename
            container.screenshot(path=str(out_path))
            print(f"Generated: {out_path} (High-DPI Retina)")
        browser.close()


if __name__ == "__main__":
    render_all()
