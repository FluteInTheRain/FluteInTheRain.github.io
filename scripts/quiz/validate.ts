// Validate quiz set files on their own, so one author is not blocked by another author's unfinished file.
//
//   node scripts/quiz/validate.ts <set-file.json> [...]
//
// Prints each problem and exits 1 if there is any. The post is taken from the folder name of the file:
// src/data/quiz/<post-slug>/set-NN.json checks anchors against src/content/blog/<post-slug>.mdx.
import fs from 'node:fs';
import path from 'node:path';
import { englishAnchors, validateSet } from '../../src/utils/quiz.ts';

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('usage: node scripts/quiz/validate.ts <set-file.json> [...]');
  process.exit(2);
}
let bad = 0;
for (const f of files) {
  const slug = path.basename(path.dirname(path.resolve(f)));
  const post = path.resolve('src/content/blog', `${slug}.mdx`);
  if (!fs.existsSync(post)) { console.error(`${f}: no post at ${post}`); bad++; continue; }
  const set = JSON.parse(fs.readFileSync(f, 'utf8'));
  const problems = validateSet(set, englishAnchors(fs.readFileSync(post, 'utf8')));
  if (path.basename(f) !== `${set.id}.json`) problems.push(`file name should be ${set.id}.json`);
  if (problems.length) { bad++; console.error(`${f}:\n  - ${problems.join('\n  - ')}`); }
  else console.log(`${f}: ok`);
}
process.exit(bad ? 1 : 0);
