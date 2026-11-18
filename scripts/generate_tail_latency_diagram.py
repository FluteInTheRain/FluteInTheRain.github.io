import asyncio
from playwright.async_api import async_playwright
import os

HTML_CONTENT = """
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1400px;
    height: 840px;
    background: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    padding: 32px 40px;
  }
  
  .header {
    margin-bottom: 24px;
    border-bottom: 2px solid #f1f5f9;
    padding-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .title-area h1 {
    font-size: 26px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .title-area h1 .badge {
    font-size: 13px;
    font-weight: 600;
    padding: 3px 10px;
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
    border-radius: 9999px;
    text-transform: uppercase;
  }
  .title-area p {
    font-size: 14px;
    color: #64748b;
    margin-top: 4px;
  }

  .grid-container {
    display: grid;
    grid-template-columns: 1.15fr 1.35fr;
    gap: 28px;
    height: 690px;
  }

  .panel-card {
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    padding: 22px;
    display: flex;
    flex-direction: column;
  }
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
    padding-bottom: 12px;
    border-bottom: 1.5px solid #e2e8f0;
  }
  .panel-title {
    font-size: 17px;
    font-weight: 700;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .badge-tag {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
    text-transform: uppercase;
  }
  .tag-blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
  .tag-purple { background: #faf5ff; color: #7e22ce; border: 1px solid #e9d5ff; }

  /* Left: Distribution Bars */
  .percentile-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 10px;
  }
  .percentile-row {
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .p-tag {
    font-size: 13px;
    font-weight: 800;
    width: 60px;
    font-family: ui-monospace, Menlo, monospace;
  }
  .p50 { color: #16a34a; }
  .p95 { color: #d97706; }
  .p99 { color: #ea580c; }
  .p999 { color: #dc2626; }

  .p-bar-container {
    flex: 1;
    height: 14px;
    background: #f1f5f9;
    border-radius: 9999px;
    overflow: hidden;
    position: relative;
  }
  .p-bar-fill {
    height: 100%;
    border-radius: 9999px;
  }
  .fill-p50 { width: 15%; background: #22c55e; }
  .fill-p95 { width: 35%; background: #f59e0b; }
  .fill-p99 { width: 65%; background: #f97316; }
  .fill-p999 { width: 100%; background: #ef4444; }

  .p-timing {
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
    width: 75px;
    text-align: right;
    font-family: ui-monospace, Menlo, monospace;
  }
  .p-desc {
    font-size: 11px;
    color: #64748b;
    margin-top: 2px;
  }

  .callout-box {
    margin-top: 20px;
    padding: 14px;
    border-radius: 10px;
    font-size: 12px;
    line-height: 1.55;
    background: #ffffff;
    border-left: 4px solid #3b82f6;
    border-top: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
  }
  .callout-box strong { color: #0f172a; }

  /* Right: Dean & Barroso Fan-Out Amplification Visual */
  .formula-card {
    background: #1e293b;
    color: #f8fafc;
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .math-expr {
    font-family: "KaTeX_Main", "Times New Roman", serif;
    font-size: 20px;
    letter-spacing: 0.5px;
  }
  .math-kw { color: #f87171; font-weight: 700; }
  .math-result {
    font-size: 22px;
    font-weight: 800;
    color: #ef4444;
    background: #450a0a;
    padding: 4px 12px;
    border-radius: 8px;
    border: 1px solid #991b1b;
  }

  .fanout-diagram {
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    padding: 18px;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }

  .user-client-node {
    background: #f0fdf4;
    border: 2px solid #22c55e;
    border-radius: 8px;
    padding: 10px 24px;
    font-size: 13px;
    font-weight: 700;
    color: #15803d;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .aggregator-node {
    background: #eff6ff;
    border: 2px solid #3b82f6;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 700;
    color: #1d4ed8;
    margin-top: 20px;
    text-align: center;
  }

  .fanout-tree {
    width: 100%;
    margin-top: 22px;
    position: relative;
    padding-top: 10px;
  }

  .leaf-servers-grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 8px;
    margin-top: 14px;
  }

  .leaf-node {
    height: 38px;
    border-radius: 6px;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: #64748b;
  }
  .leaf-node.fast {
    background: #f0fdf4;
    border-color: #86efac;
    color: #16a34a;
  }
  .leaf-node.slow {
    background: #fef2f2;
    border: 2px solid #ef4444;
    color: #dc2626;
    animation: pulse 2s infinite;
  }

  .impact-summary {
    margin-top: 16px;
    padding: 12px;
    background: #fff1f2;
    border: 1px solid #fecdd3;
    border-radius: 8px;
    font-size: 12px;
    color: #9f1239;
    line-height: 1.5;
    width: 100%;
  }
</style>
</head>
<body>

  <div class="header">
    <div class="title-area">
      <h1>
        The Tyranny of the Mean & Tail Latency Amplification
        <span class="badge">Dean & Barroso (CACM 2013)</span>
      </h1>
      <p>Why the Mean (Average) is a dangerous metric, and how 100 microservices make 63% of user requests crawl</p>
    </div>
  </div>

  <div class="grid-container">

    <!-- Left: Percentiles vs Mean -->
    <div class="panel-card">
      <div class="panel-header">
        <div class="panel-title">
          <span>1. The Percentile Spectrum</span>
        </div>
        <span class="badge-tag tag-blue">Distribution vs Mean</span>
      </div>

      <p style="font-size: 13px; color: #475569; margin-bottom: 14px;">
        Average latency is heavily distorted by rare outliers. Percentiles (<span style="font-family: monospace; font-weight:700;">p50, p95, p99, p99.9</span>) reveal how real users actually experience the system.
      </p>

      <div class="percentile-list">
        <div class="percentile-row">
          <div>
            <div class="p-tag p50">p50 (Median)</div>
            <div class="p-desc">Typical user experience (50% faster)</div>
          </div>
          <div class="p-bar-container">
            <div class="p-bar-fill fill-p50"></div>
          </div>
          <div class="p-timing">10 ms</div>
        </div>

        <div class="percentile-row">
          <div>
            <div class="p-tag p95">p95</div>
            <div class="p-desc">Minor queueing or GC delays</div>
          </div>
          <div class="p-bar-container">
            <div class="p-bar-fill fill-p95"></div>
          </div>
          <div class="p-timing">35 ms</div>
        </div>

        <div class="percentile-row">
          <div>
            <div class="p-tag p99">p99</div>
            <div class="p-desc">High contention or network retry</div>
          </div>
          <div class="p-bar-container">
            <div class="p-bar-fill fill-p99"></div>
          </div>
          <div class="p-timing">120 ms</div>
        </div>

        <div class="percentile-row" style="background: #fff5f5; border-color: #fca5a5;">
          <div>
            <div class="p-tag p999">p99.9</div>
            <div class="p-desc">The Tail (Disk stall, JVM full GC, cold cache)</div>
          </div>
          <div class="p-bar-container">
            <div class="p-bar-fill fill-p999"></div>
          </div>
          <div class="p-timing">1,000 ms</div>
        </div>
      </div>

      <div class="callout-box">
        <strong>The Amazon Discovery:</strong> Amazon found that every 100ms increase in latency decreased sales by 1%. Furthermore, the customers experiencing the worst tail latency (p99.9) were their <em>most valuable VIP customers</em>, because big spenders have the largest carts requiring hundreds of items to be looked up!
      </div>
    </div>

    <!-- Right: Fan-Out Latency Amplification -->
    <div class="panel-card">
      <div class="panel-header">
        <div class="panel-title">
          <span>2. Tail Latency Amplification</span>
        </div>
        <span class="badge-tag tag-purple">Microservice Illusion</span>
      </div>

      <div class="formula-card">
        <div class="math-expr">
          P(slow) = 1 &minus; (1 &minus; 0.01)<sup>100</sup> = 1 &minus; 0.99<sup>100</sup>
        </div>
        <div class="math-result">63.4% Latency Penalty</div>
      </div>

      <div class="fanout-diagram">
        <div class="user-client-node">
          <span>🌐 End-User Request (Browser / App)</span>
        </div>

        <div style="font-size: 11px; color: #94a3b8; margin: 4px 0;">&darr; HTTP / gRPC</div>

        <div class="aggregator-node">
          Root API Gateway / Fan-Out Aggregator
          <div style="font-size: 11px; font-weight: 500; color: #64748b; margin-top: 2px;">
            Must wait for ALL 100 backend services to assemble page
          </div>
        </div>

        <div class="fanout-tree">
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 6px;">
            <span>99 Fast Leaf Nodes (10ms)</span>
            <span style="color: #dc2626;">1 Stalled Node (1,000ms tail)</span>
          </div>

          <div class="leaf-servers-grid">
            <!-- 99 fast nodes, 1 slow node -->
            <div class="leaf-node fast">S01</div>
            <div class="leaf-node fast">S02</div>
            <div class="leaf-node fast">S03</div>
            <div class="leaf-node fast">S04</div>
            <div class="leaf-node fast">S05</div>
            <div class="leaf-node fast">S06</div>
            <div class="leaf-node fast">S07</div>
            <div class="leaf-node fast">S08</div>
            <div class="leaf-node fast">S09</div>
            <div class="leaf-node fast">S10</div>

            <div class="leaf-node fast">S11</div>
            <div class="leaf-node fast">S12</div>
            <div class="leaf-node fast">S13</div>
            <div class="leaf-node fast">S14</div>
            <div class="leaf-node fast">S15</div>
            <div class="leaf-node fast">S16</div>
            <div class="leaf-node fast">S17</div>
            <div class="leaf-node fast">S18</div>
            <div class="leaf-node fast">S19</div>
            <div class="leaf-node fast">S20</div>

            <div class="leaf-node fast">S21</div>
            <div class="leaf-node fast">S22</div>
            <div class="leaf-node fast">S23</div>
            <div class="leaf-node fast">S24</div>
            <div class="leaf-node fast">S25</div>
            <div class="leaf-node fast">S26</div>
            <div class="leaf-node fast">S27</div>
            <div class="leaf-node fast">S28</div>
            <div class="leaf-node fast">S29</div>
            <div class="leaf-node slow">S30 (1s)</div>
          </div>
        </div>

        <div class="impact-summary">
          <strong>The Paradox:</strong> Even though 99% of all microservice operations are blisteringly fast, a whopping <strong>63.4% of total end-user requests</strong> will take over 1 second! The user only experiences the <em>slowest</em> leaf node.
        </div>
      </div>
    </div>

  </div>

</body>
</html>
"""

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1400, "height": 840}, device_scale_factor=2)
        await page.set_content(HTML_CONTENT)
        await page.wait_for_timeout(300)
        output_path = "src/assets/blog/reliable-scalable-maintainable-data-systems/tail-latency-amplification-dean-barroso.png"
        await page.screenshot(path=output_path)
        await browser.close()
        print(f"Generated {output_path}")

if __name__ == "__main__":
    asyncio.run(main())
