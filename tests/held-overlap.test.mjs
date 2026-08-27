#!/usr/bin/env node
/**
 * Regression test for the p7-detection defect, and for the WRONG DIAGNOSIS of it.
 *
 * WHAT SHIPPED. `cv gate F01-object-level-authz p7-detection` returned clean while the
 * contact sheet at 12.2s of a 13s shot showed `#limLbl2` wrapping to two lines and
 * running into `#notProve` underneath it.
 *
 * WHAT I CLAIMED IN STEP 4. That `--at-transitions` does not sample the final held
 * state. Recorded as a validation gap and carried into Step 5 as a thing to fix.
 *
 * WHAT MEASUREMENT SHOWED. That claim is false, and this test exists so nobody rebuilds
 * a fix on top of it:
 *
 *   - the sample list for the fixture is
 *     [0.722 … 12.278, 13] — the final held state IS sampled, at t = duration
 *   - raising --samples to 60 and then 200 changes nothing: still zero findings
 *   - `layout.tolerance` is 2, and the two boxes intersect by about 2px
 *
 * So the gate behaved correctly. Two text blocks intersecting by 2px are not an
 * unreadable collision; what the eye caught was INSUFFICIENT VERTICAL SEPARATION, a
 * different defect that no overlap checker should be expected to report.
 *
 * WHAT THE ACTUAL FIX IS. Not more sampling and not a lower tolerance — a lower
 * tolerance would fire on every legitimate 1px optical adjustment in the library. The
 * fix is to guarantee that somebody LOOKS at the state where held-layout defects live:
 * `cv gate` now warns when a shot's `review.hero_frames` contains no frame within 0.6s
 * of its end. That is the review step that actually caught this one.
 *
 *   node tests/held-overlap.test.mjs
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HF = path.join(ROOT, 'node_modules', 'hyperframes', 'bin', 'hyperframes.mjs');
const NO_WINDOW = path.join(ROOT, 'tools', 'no-console-window.cjs');
const FIXTURE = path.join(ROOT, 'tests', 'fixtures', 'held-overlap');

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? '  ok  ' : '  FAIL'} ${name}${detail ? `  ${detail}` : ''}`);
  if (!ok) failed++;
};

function hfCheck(extra = []) {
  const r = spawnSync(process.execPath,
    ['--require', NO_WINDOW, HF, 'check', FIXTURE, '--json', '--no-browser-gpu', '--at-transitions', ...extra],
    { encoding: 'utf8', maxBuffer: 1 << 28, windowsHide: true });
  const clean = (r.stdout || '').replace(/\x1b\[[0-9;]*m/g, '');
  const i = clean.indexOf('{'), j = clean.lastIndexOf('}');
  if (i < 0) throw new Error(`no JSON from hyperframes:\n${(r.stderr || clean).slice(-600)}`);
  return JSON.parse(clean.slice(i, j + 1));
}

console.log('\nheld-state layout defect — what the gate does and does not catch\n');

const base = hfCheck();
const L = base.layout;
const DURATION = 13;

check('fixture renders', base.runtime?.ok !== false);

// The load-bearing measurements. If any of these change, the diagnosis above is stale
// and must be redone before anyone "fixes" the sampling again.
check('final held state IS sampled',
  L.samples.some((t) => Math.abs(t - DURATION) < 1e-6),
  `samples end at ${L.samples[L.samples.length - 1]}`);
check('a sample sits at the moment the defect was seen by eye',
  L.samples.some((t) => Math.abs(t - 12.278) < 0.05));
check('layout tolerance is 2px', L.tolerance === 2, `tolerance=${L.tolerance}`);
check('gate reports the fixture clean — a ~2px intersection is within tolerance',
  L.findings.length === 0 && base.ok === true);

// The disproof of the Step-4 claim, kept executable.
const dense = hfCheck(['--samples=200']);
check('200 samples change nothing — this is NOT a sampling gap',
  dense.layout.findings.length === 0,
  `findings=${dense.layout.findings.length}`);

// And the fix that replaced it: the gate must insist somebody looks at the end.
const planPath = path.join(ROOT, 'videos', 'F01-object-level-authz', 'shot_plan.yaml');
const plan = fs.readFileSync(planPath, 'utf8');
check('cv gate carries the final-held-frame check',
  fs.readFileSync(path.join(ROOT, 'tools', 'cv.mjs'), 'utf8').includes('final held state'));
check('p7-detection now declares a hero frame near its end',
  /p7-detection[\s\S]{0,1400}?hero_frames: \[[^\]]*12\.[6-9]|p7-detection[\s\S]{0,1400}?hero_frames: \[[^\]]*1[23]\./.test(plan));

console.log(failed ? `\n${failed} check(s) failed\n` : '\nall checks passed\n');
process.exit(failed ? 1 : 0);
