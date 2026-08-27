#!/usr/bin/env node
/**
 * Checks the factual claims the hero rests on, recomputed from facts.rows under C
 * collation. Three of them, and each one guards a specific sentence of narration:
 *
 *   1. the searched value is NOT a stored value        — "trong danh sách đó không có
 *                                                        giá trị nào như vậy"
 *   2. lowercasing really does change the order        — "hạ hết xuống chữ thường thì
 *                                                        thứ tự đảo lại"
 *   3. a descent on `email` lands away from the hits   — the demo-specific intuition
 *
 * (1) exists because the first version of this dataset contradicted the narration: the
 * script said the value was not there while the frame showed it sitting at row 6.
 *
 *   node tools/verify-index-facts.mjs E01-not-sargable
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const id = process.argv[2] || 'E01-not-sargable';
const doc = YAML.parse(fs.readFileSync(path.join(ROOT, 'videos', id, 'semantics.yaml'), 'utf8'));
const f = doc.facts || {};
const rows = f.rows || [];
const want = f.looking_for;
if (!rows.length || !want) { console.error('facts.rows / facts.looking_for missing'); process.exit(1); }

const byteCmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);   // C collation, not localeCompare
const contiguous = (a) => a.every((v, i) => i === 0 || v === a[i - 1] + 1);
const eq = (a, b) => Array.isArray(b) && a.length === b.length && a.every((x, i) => x === b[i]);

const indexOrder = [...rows].sort(byteCmp);
const exprOrder = rows.map((r) => r.toLowerCase()).sort(byteCmp);
const hitsIndex = indexOrder.map((r, i) => (r.toLowerCase() === want ? i : -1)).filter((i) => i >= 0);
const hitsExpr = exprOrder.map((r, i) => (r === want ? i : -1)).filter((i) => i >= 0);
const descent = indexOrder.filter((r) => byteCmp(r, want) < 0).length;
const stored = indexOrder.includes(want);
// does lowercasing reorder anything?
const reordered = indexOrder.map((r) => r.toLowerCase()).some((r, i) => r !== exprOrder[i]);

console.log(`collation C · predicate  lower(email) = '${want}'\n`);
console.log('  ordered by  email        (what the plain index is built on)');
indexOrder.forEach((r, i) => console.log(`    ${i}  ${r.padEnd(18)}${hitsIndex.includes(i) ? '  <- thoả predicate' : ''}`));
console.log(`    ${descent}  ${'<' + want + ' would sort here>'}   <- descent lands here`);
console.log('\n  ordered by  lower(email)  (what an expression index is built on)');
exprOrder.forEach((r, i) => console.log(`    ${i}  ${r.padEnd(18)}${hitsExpr.includes(i) ? '  <- thoả predicate' : ''}`));

let bad = 0;
const check = (label, got, declared) => {
  if (declared === undefined) { console.log(`  ${label}: (not declared)`); return; }
  if (eq(got, declared) || got === declared) { console.log(`  ${label}: ok`); return; }
  bad++;
  console.log(`  ${label}: MISMATCH computed ${JSON.stringify(got)} declared ${JSON.stringify(declared)}`);
};
console.log('\ndeclared-vs-computed');
check('index_order', indexOrder, f.index_order);
check('expression_index_order', exprOrder, f.expression_index_order);
check('matches_in_index_order', hitsIndex, f.matches_in_index_order);
check('matches_in_expression_order', hitsExpr, f.matches_in_expression_order);
check('descent_lands_at', descent, f.descent_lands_at);
check('value_present_in_index', stored, f.value_present_in_index);

console.log('\nthe three claims narration makes');
console.log(`  1. value is not a stored value : ${stored ? 'FALSE' : 'true'}`);
console.log(`  2. lowercasing reorders        : ${reordered ? 'true' : 'FALSE'}`);
console.log(`  3. descent lands away from hits: ${!hitsIndex.includes(descent) ? 'true' : 'FALSE'}  (descent ${descent}, hits ${JSON.stringify(hitsIndex)})`);
console.log(`  and the fix groups them        : ${contiguous(hitsExpr) ? 'true' : 'FALSE'}  ${JSON.stringify(hitsExpr)}`);

// ---------------------------------------------------------------------------
// And now the gap that let all of the above be true while the video was wrong.
//
// Everything above verifies semantics.yaml against itself. Nothing verified that the
// SHOT actually draws those values — so shot_04 shipped a seven-row list containing the
// searched value, with HITS = [0,1,6], while facts.rows held six rows and
// value_present_in_index: false. Every check passed. The frame contradicted the
// narration anyway.
//
// The hero states its data as four top-level constants precisely so they can be read
// back out and compared. A grep is crude, but a shot that renames these constants is a
// shot that has stopped declaring its data, and that should fail too.
const heroPath = path.join(ROOT, 'videos', id, 'shots', 'shot_04', 'index.html');
if (fs.existsSync(heroPath)) {
  const src = fs.readFileSync(heroPath, 'utf8');
  const grab = (re, what) => {
    const m = src.match(re);
    if (!m) { bad++; console.log(`  shot_04.${what}: NOT DECLARED — cannot verify what the frame draws`); return null; }
    return m[1];
  };
  const list = (s) => s === null ? null
    : s.split(',').map((x) => x.trim().replace(/^['"]|['"]$/g, '')).filter((x) => x.length);

  console.log('\nwhat the hero frame actually draws');
  const rows = list(grab(/const ROWS = \[([^\]]*)\]/s, 'ROWS'));
  const want = grab(/const WANT = '([^']*)'/, 'WANT');
  const hits = list(grab(/const HITS = \[([^\]]*)\]/, 'HITS'));
  // DESCENT is optional, and its absence is the correct state. The shot used to animate
  // a reading head stepping to descent_lands_at; that drew an execution path Postgres
  // never takes (descend, miss, fall back to a scan) and was removed. facts still
  // computes descent_lands_at because narration claim 3 rests on it, but no frame draws
  // it, so requiring the constant would force dead code back into the composition.
  const descMatch = src.match(/const DESCENT = (\d+)/);

  if (rows) check('shot_04 ROWS == facts.rows', rows, f.rows);
  if (want !== null) check('shot_04 WANT == facts.looking_for', want, f.looking_for);
  if (hits) check('shot_04 HITS == matches_in_index_order', hits.map(Number), f.matches_in_index_order);
  if (descMatch) check('shot_04 DESCENT == descent_lands_at', Number(descMatch[1]), f.descent_lands_at);
  else console.log('  shot_04 DESCENT: not drawn (no descent animation — see shot header)');

  // The specific contradiction that shipped, stated as its own failure so the message
  // names the problem rather than a diff.
  if (rows && want !== null && rows.some((r) => r.toLowerCase() === want && r === want)) {
    console.error('\nFAIL: the hero list contains the searched value verbatim — the frame' +
                  '\n      cannot survive "trong danh sách đó không có giá trị nào như vậy".');
    process.exit(1);
  }
}

if (stored) { console.error('\nFAIL: the searched value IS a stored value — the frame would contradict the narration.'); process.exit(1); }
if (!reordered) { console.error('\nFAIL: lowercasing does not reorder this set — narration claim 2 would be false.'); process.exit(1); }
if (hitsIndex.includes(descent)) { console.error('\nFAIL: the descent lands on a matching row — there would be nothing to show.'); process.exit(1); }
if (!contiguous(hitsExpr)) { console.error('\nFAIL: the expression index does not group the matches — the fix would not work.'); process.exit(1); }
if (bad) { console.error(`\nFAIL: ${bad} declared fact(s) wrong.`); process.exit(1); }
console.log('\nfacts verified.');
