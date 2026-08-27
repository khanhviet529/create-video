#!/usr/bin/env node
/**
 * The claim "hạ hết xuống chữ thường thì thứ tự đảo lại" is a factual claim about
 * a specific set of strings under a specific collation. It is exactly the kind of
 * thing a video asserts and nobody checks.
 *
 * So check it. Reads facts.sample_emails / index_order / lower_order out of a
 * semantics file, recomputes both orderings under C collation (byte order), and
 * fails if the declared orderings are wrong or if the two orderings turn out to be
 * the SAME — in which case the shot would have nothing to show.
 *
 *   node tools/verify-collation.mjs E01-not-sargable
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const id = process.argv[2];
if (!id) { console.error('usage: verify-collation.mjs <video_id>'); process.exit(1); }

const doc = YAML.parse(fs.readFileSync(path.join(ROOT, 'videos', id, 'semantics.yaml'), 'utf8'));
const f = doc.facts || {};
const emails = f.sample_emails || [];
if (!emails.length) { console.error('no facts.sample_emails'); process.exit(1); }

// C collation = byte order. Not localeCompare, which is locale-aware and would
// quietly give a different (and for this story, wrong) answer.
const byteCmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

const indexOrder = [...emails].sort(byteCmp);
const lowerOrder = [...emails].map((e) => e.toLowerCase()).sort(byteCmp);

const eq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
let bad = 0;

console.log('collation: C (byte order)\n');
console.log('  index order (sorted email)        declared match');
for (let i = 0; i < indexOrder.length; i++) {
  const ok = (f.index_order || [])[i] === indexOrder[i];
  if (!ok) bad++;
  console.log(`    ${String(i).padStart(2)}  ${indexOrder[i].padEnd(20)} ${ok ? 'ok' : 'MISMATCH: declared ' + (f.index_order || [])[i]}`);
}
console.log('\n  lower order (sorted lower(email))');
for (let i = 0; i < lowerOrder.length; i++) {
  const ok = (f.lower_order || [])[i] === lowerOrder[i];
  if (!ok) bad++;
  console.log(`    ${String(i).padStart(2)}  ${lowerOrder[i].padEnd(20)} ${ok ? 'ok' : 'MISMATCH: declared ' + (f.lower_order || [])[i]}`);
}

// the permutation the visual will actually draw
console.log('\n  where each index row lands in lower order:');
let moved = 0;
const perm = indexOrder.map((e, i) => {
  const j = lowerOrder.indexOf(e.toLowerCase());
  if (i !== j) moved++;
  return { from: i, to: j, email: e };
});
for (const p of perm) {
  console.log(`    ${p.email.padEnd(20)} ${p.from} -> ${p.to}${p.from === p.to ? '   (unmoved)' : ''}`);
}

if (eq(indexOrder.map((s) => s.toLowerCase()), lowerOrder)) {
  console.error('\nFAIL: the two orderings are identical under this collation.');
  console.error('The shot would have nothing to show, and the story\'s claim would be false.');
  process.exit(1);
}
console.log(`\n${moved}/${emails.length} rows change position. The orderings genuinely differ.`);
if (bad) { console.error(`\nFAIL: ${bad} declared value(s) do not match the computed ordering.`); process.exit(1); }
console.log('facts verified.');
