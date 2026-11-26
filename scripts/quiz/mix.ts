// Reports the question mix of each quiz post against the v2 matrix (src/data/quiz/matrix.ts).
// Informational: exits 0 unless --strict. usage: node scripts/quiz/mix.ts [post-slug ...] [--strict]
import fs from 'node:fs';
import path from 'node:path';
import { MATRIX_V2 } from '../../src/data/quiz/matrix.ts';

const ROOT = path.resolve(import.meta.dirname, '../..');
const DIR = path.join(ROOT, 'src/data/quiz');
const args = process.argv.slice(2);
const strict = args.includes('--strict');
const slugs = args.filter((a) => !a.startsWith('--'));
const posts = slugs.length ? slugs : fs.readdirSync(DIR, { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('_')).map((d) => d.name);
let bad = 0;
for (const slug of posts) {
  const files = fs.readdirSync(path.join(DIR, slug)).filter((f) => /^set-\d\d\.json$/.test(f)).sort();
  const qs = files.flatMap((f) => JSON.parse(fs.readFileSync(path.join(DIR, slug, f), 'utf8')).questions as any[]);
  const tally = (key: string) => qs.reduce((m: Record<string, number>, q) => ((m[q[key] ?? '(none)'] = (m[q[key] ?? '(none)'] ?? 0) + 1), m), {});
  const lv = tally('level'), tr = tally('track'), kd = tally('kind');
  console.log(`${slug}: ${files.length} sets, ${qs.length} questions | level ${JSON.stringify(lv)} | track ${JSON.stringify(tr)} | kind ${JSON.stringify(kd)}`);
  const target = (MATRIX_V2 as any)[qs.length];
  if (!target) { console.log('  (not 20 or 40 questions: no v2 target)'); continue; }
  const off: string[] = [];
  const near = (got: Record<string, number>, want: Record<string, number>, label: string) => { for (const [k, w] of Object.entries(want)) if (Math.abs((got[k] ?? 0) - w) > 1) off.push(`${label} ${k} ${got[k] ?? 0}/${w}`); };
  near(lv, target.levels, 'level'); near(kd, target.kinds, 'kind');
  const second = (tr.ai ?? 0) + (tr.case ?? 0);
  if (Math.abs((tr.interview ?? 0) - target.perTrack) > 1 || Math.abs(second - target.perTrack) > 1) off.push(`track interview ${tr.interview ?? 0} / second ${second}, target ${target.perTrack} each`);
  const multi = qs.filter((q) => q.type === 'multi').length;
  if (Math.abs(multi - target.multi) > 1) off.push(`multi ${multi}/${target.multi}`);
  const noKind = qs.filter((q) => !q.kind).length;
  if (noKind) off.push(`${noKind} questions have no kind`);
  if (off.length) { bad++; console.log('  off target:', off.join(', ')); } else console.log('  on target');
}
process.exit(strict && bad ? 1 : 0);
