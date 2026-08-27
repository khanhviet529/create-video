#!/usr/bin/env node
/**
 * The `monotonic` invariant exists because of one measured gap, and this test is that gap.
 *
 * G01's central claim is that a table's file size is the high-water mark it once needed. A
 * probe run with `file.bytes` going 1200 -> 900 -> 1200 passed EVERY invariant the engine had
 * and reported "replay matches the story's claims":
 *
 *   final_state  compares only the last value against a constant  -> 1200, unchanged
 *   bounded      compares only the peak against a ceiling         -> 1200, unchanged
 *
 * A dip in the middle touches neither. So the claim the whole video rests on could not be
 * falsified by the replay, which is the same as not being checked.
 *
 * Note what this invariant does NOT say. It is not "PostgreSQL relation files can never
 * shrink" — they can: VACUUM FULL rewrites the table, and package 006 says so in narration
 * beat 31. Scope lives in the scenario that declares it, and a VACUUM FULL scenario simply
 * would not.
 *
 *   node tests/monotonic-invariant.test.mjs
 */
import { simulate } from '../semantic/lib/simulate.mjs';

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? '  ok  ' : '  FAIL'} ${name}${detail ? `  ${detail}` : ''}`);
  if (!ok) failed++;
};
const inv = (r, id) => r.invariants.find((x) => x.id === id);

const STATE = { 'file.bytes': 1000 };
const INV = [{ id: 'never_gives_back', kind: 'monotonic', field: 'file.bytes',
               direction: 'never_decreases' }];
const w = (id, t, value) => ({ id, t, actor: 'file', op: 'write', target: 'file',
                               field: 'bytes', value });

console.log('\nmonotonic — the gap the probe exposed\n');

/* ---- the honest trace: grows, gets vacuumed, holds -------------------------- */
{
  const r = simulate({}, {
    state: STATE,
    events: [w('g1', 0.1, 1080), w('g2', 0.2, 1150), w('g3', 0.3, 1200),
             w('keep', 0.5, 1200), w('reuse', 0.6, 1200)],
    invariants: INV,
  });
  const m = inv(r, 'never_gives_back');
  check('a file that only ever grows holds the invariant', m.holds === true, m.detail);
  check('it reports where it ended and how high it went',
    /1200 at the end, peak 1200/.test(m.detail), m.detail);
}

/* ---- THE PROVEN INVALID TRACE: 1200 -> 900 -> 1200 -------------------------- */
{
  const r = simulate({}, {
    state: STATE,
    events: [w('g1', 0.1, 1080), w('g2', 0.2, 1150), w('g3', 0.3, 1200),
             w('dip', 0.35, 900),          // the write Postgres never makes here
             w('back', 0.37, 1200),
             w('keep', 0.5, 1200)],
    invariants: INV,
  });
  const m = inv(r, 'never_gives_back');
  check('the 1200 -> 900 -> 1200 trace FAILS', m.holds === false, m.detail);
  check('it names the offending write', /file\.bytes fell 1200 -> 900 at dip/.test(m.detail), m.detail);
  check('it carries a witness for the drop',
    Array.isArray(m.witnesses) && m.witnesses.length === 1 && m.witnesses[0].event === 'dip',
    JSON.stringify(m.witnesses));

  // and the reason the invariant was needed: everything else still passes this trace
  const other = simulate({}, {
    state: STATE,
    events: [w('g1', 0.1, 1080), w('g2', 0.2, 1150), w('g3', 0.3, 1200),
             w('dip', 0.35, 900), w('back', 0.37, 1200), w('keep', 0.5, 1200)],
    invariants: [
      { id: 'ends_high', kind: 'final_state', field: 'file.bytes', expected: 1200 },
      { id: 'under_ceiling', kind: 'bounded', field: 'file.bytes', max: 1200 },
    ],
  });
  check('final_state alone would have passed the dip', inv(other, 'ends_high').holds === true,
    inv(other, 'ends_high').detail);
  check('bounded alone would have passed the dip', inv(other, 'under_ceiling').holds === true,
    inv(other, 'under_ceiling').detail);
}

/* ---- the initial value is part of the run ---------------------------------- */
{
  // Before this change `peak` was only set on the first write, so a field that started high
  // and was written lower had a peak equal to that lower value.
  const r = simulate({}, {
    state: { 'file.bytes': 1000 },
    events: [w('shrink', 0.1, 800)],
    invariants: INV,
  });
  const m = inv(r, 'never_gives_back');
  check('a drop from the DECLARED initial value is caught', m.holds === false, m.detail);
  check('peak includes the initial value', m.peak === 1000, String(m.peak));
}

/* ---- scope: the mirror direction, and non-numeric fields ------------------- */
{
  const r = simulate({}, {
    state: { 'q.depth': 5 },
    events: [{ id: 'd1', t: 0.1, actor: 'w', op: 'write', target: 'q', field: 'depth', value: 3 },
             { id: 'd2', t: 0.2, actor: 'w', op: 'write', target: 'q', field: 'depth', value: 7 }],
    invariants: [{ id: 'drains', kind: 'monotonic', field: 'q.depth', direction: 'never_increases' }],
  });
  const m = inv(r, 'drains');
  check('never_increases catches a rise', m.holds === false, m.detail);

  const bad = simulate({}, {
    state: { 'x.y': 1 }, events: [],
    invariants: [{ id: 'oops', kind: 'monotonic', field: 'x.y', direction: 'sideways' }],
  });
  check('an unknown direction is refused, not silently accepted',
    inv(bad, 'oops').holds === false && /unknown direction/.test(inv(bad, 'oops').detail),
    inv(bad, 'oops').detail);
}

console.log(failed ? `\n${failed} check(s) failed\n` : '\nall checks passed\n');
process.exitCode = failed ? 1 : 0;
