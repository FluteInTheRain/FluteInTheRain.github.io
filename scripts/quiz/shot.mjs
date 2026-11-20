// Screenshot one case set of a post quiz so its figure and layout can be read.
//
//   node scripts/quiz/shot.mjs <port> <post-slug> <set-id> <out-dir> [--questions]
//
// Needs `npx astro dev --port <port>` running in this folder. Opens /blog/<post-slug>/quiz/ in headless
// Chrome with fresh storage, goes to the set, and writes <out-dir>/<set-id>-light-en.png, -light-vi.png and
// -dark-vi.png (the scenario, its figure and the first question). With --questions it also answers every
// question of the set and writes <set-id>-q1.png ... q5.png (light EN, explanation open), so long options
// and explanations can be checked. Read the PNGs; do not guess widths from character counts.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [port, slug, setId, outDir, ...flags] = process.argv.slice(2);
if (!port || !slug || !setId || !outDir) {
  console.error('usage: node scripts/quiz/shot.mjs <port> <post-slug> <set-id> <out-dir> [--questions]');
  process.exit(2);
}
const withQuestions = flags.includes('--questions');
fs.mkdirSync(outDir, { recursive: true });

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DEBUG_PORT = 9400 + Math.floor(Math.random() * 400);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-shot-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${profile}`, '--window-size=1280,1000', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const done = async (code) => {
  try { chrome.kill(); } catch {}
  await sleep(500); // let Chrome release its profile folder
  try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch {}
  process.exit(code);
};

async function connect() {
  for (let i = 0; i < 40; i++) {
    try {
      const t = await (await fetch(`http://localhost:${DEBUG_PORT}/json/new?about:blank`, { method: 'PUT' })).json();
      const ws = new WebSocket(t.webSocketDebuggerUrl);
      await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
      return ws;
    } catch { await sleep(250); }
  }
  throw new Error('cannot connect to Chrome');
}

const ws = await connect();
let id = 0;
const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result?.result?.value;
const shot = async (name, selector) => {
  const rect = await ev(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height }; })()`);
  if (!rect) { console.error(`selector not found: ${selector}`); done(1); }
  const r = await send('Page.captureScreenshot', { format: 'png', clip: { ...rect, scale: 1 }, captureBeyondViewport: true });
  if (!r.result) { console.error(`screenshot failed for ${selector}: ${JSON.stringify(r.error)} rect=${JSON.stringify(rect)}`); done(1); }
  fs.writeFileSync(path.join(outDir, `${name}.png`), Buffer.from(r.result.data, 'base64'));
  console.log(`wrote ${path.join(outDir, name)}.png`);
};

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1000, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: `http://localhost:${port}/blog/${slug}/quiz/` });
await sleep(3000);

const hasSet = await ev(`Boolean(document.querySelector('[data-set="${setId}"]'))`);
if (!hasSet) { console.error(`no such set on the page: ${setId}`); done(1); }
await ev(`(() => { const s = document.createElement('style'); s.textContent = 'astro-dev-toolbar{display:none !important} header.nav, .nav{position:static !important}'; document.head.append(s); })()`);
await ev(`document.querySelector('[data-goto-set="${setId}"]').click()`);
await sleep(600);
const SET = `[data-set="${setId}"]`;

const variant = async (name, lang, theme) => {
  await ev(`document.documentElement.setAttribute('data-lang', '${lang}'); document.documentElement.setAttribute('data-theme', '${theme}')`);
  await sleep(250);
  await shot(`${setId}-${name}`, SET);
};
await variant('light-en', 'en', 'light');
await variant('light-vi', 'vi', 'light');
await variant('dark-vi', 'vi', 'dark');

if (withQuestions) {
  await ev(`document.documentElement.setAttribute('data-lang', 'en'); document.documentElement.setAttribute('data-theme', 'light')`);
  const qs = await ev(`[...document.querySelectorAll('${SET} .quiz-q')].map(q => q.dataset.q)`);
  for (let i = 0; i < qs.length; i++) {
    const q = qs[i];
    await ev(`(() => { const q = document.querySelector('[data-q="${q}"]'); const multi = q.dataset.type === 'multi'; const opts = [...q.querySelectorAll('.quiz-opt')]; const wrongOnes = opts.filter(o => !q.dataset.answer.split(',').includes(o.dataset.opt)); (multi ? [opts.find(o => q.dataset.answer.split(',').includes(o.dataset.opt)), wrongOnes[0]] : [wrongOnes[0]]).forEach(o => o.click()); const c = q.querySelector('.quiz-check'); if (c && !c.disabled) c.click(); })()`);
    await sleep(300);
    await shot(`${setId}-q${i + 1}`, `[data-q="${q}"]`);
    if (i + 1 < qs.length) { await ev(`document.querySelector('[data-q="${q}"] .quiz-next').click()`); await sleep(300); }
  }
}
done(0);
