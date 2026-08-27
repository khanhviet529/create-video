/**
 * Semantics -> HyperFrames `*.motion.json` assertions.
 *
 * THE CONTRACT (this is the whole trick):
 *
 *   For every semantic event the shot dramatises, the authored composition must
 *   contain an element with id `ev-<eventId>` that becomes visible at the moment
 *   that event happens.
 *
 * What that element *is* is entirely free: the travelling token itself, a tick on
 * a lane, a value label, a highlight ring, a glyph, a shard of a bar chart. The
 * contract constrains INSTRUMENTATION, never composition. Two completely
 * different visual projections of the same mechanism satisfy the same assertions.
 *
 * Consequence: technical correctness never depends on visual coordinates, and a
 * shot that reveals the mechanism in the wrong ORDER fails the gate even when it
 * renders beautifully.
 */

import { eventId } from './simulate.mjs';

const DEFAULT_TOL = 0.3; // seconds of grace on `appearsBy`

export function compileAssertions({ model, scenario, shot, tolerance = DEFAULT_TOL }) {
  const duration = shot.duration;
  if (!(duration > 0)) throw new Error(`shot ${shot.id}: duration must be > 0`);

  // Which events does this shot dramatise? Default: all of them.
  const wanted = shot.semantic?.events;
  const all = scenario.events || [];
  const picked = wanted
    ? wanted.map((want) => {
        const hit = all.find((e) => eventId(e) === want || e.id === want);
        if (!hit) throw new Error(`shot ${shot.id}: semantic.events references unknown event "${want}"`);
        return hit;
      })
    : all;

  // Normalised t (0..1) -> seconds inside this shot. Authors think in mechanism
  // order; the shot decides how long the mechanism gets on screen.
  const span = shot.semantic?.t_window || [0, 1];
  const toSec = (t) => {
    const rel = (t - span[0]) / (span[1] - span[0] || 1);
    return round(rel * duration);
  };

  const marks = picked
    .map((e) => ({ e, id: eventId(e), sec: toSec(e.t ?? 0) }))
    .sort((a, b) => a.sec - b.sec || 0);

  const assertions = [];
  const notes = [];

  // 1. Every event must be on screen by its moment (plus grace).
  for (const m of marks) {
    assertions.push({
      kind: 'appearsBy',
      selector: `#ev-${m.id}`,
      bySec: round(Math.min(duration - 0.01, m.sec + tolerance)),
    });
  }

  // 2. THE LOAD-BEARING CHAIN. Consecutive events at distinct times must appear
  //    in the mechanism's order. This is what forbids "reveal everything at once"
  //    and what makes a wrong-order visual fail even if it looks correct.
  for (let i = 0; i < marks.length - 1; i++) {
    const a = marks[i], b = marks[i + 1];
    if (b.sec - a.sec < 0.12) {
      notes.push(`skipped ordering ${a.id} -> ${b.id}: ${(b.sec - a.sec).toFixed(2)}s apart, below the perceptible-order floor`);
      continue;
    }
    assertions.push({ kind: 'before', a: `#ev-${a.id}`, b: `#ev-${b.id}` });
  }

  // 3. Whatever the shot plan declares as its persistent subject must not drift
  //    off the canvas.
  const framed = new Set();
  for (const sel of shot.validation?.focus_in_frame || []) {
    assertions.push({ kind: 'staysInFrame', selector: sel });
    framed.add(sel);
  }

  // 3b. CAMERA CHANGES WHAT "ON SCREEN" MEANS.
  //
  // `appearsBy` only tests opacity. Under a world transform an element can be
  // fully opaque and still sit outside the canvas — so a camera could satisfy
  // every ordering assertion while hiding the event from the viewer entirely.
  // For a camera-driven shot we therefore also require that each event already
  // revealed is still inside the frame.
  //
  // `may_leave_view` is the deliberate exception, and it must be declared per
  // selector: a camera that moves from consequence to root cause SHOULD lose the
  // consequence. Forcing the author to name it keeps that a decision.
  // Only a MOVING camera needs this. Under a static camera an out-of-frame element is
  // already caught by the ordinary layout pass, and forcing staysInFrame on every
  // marker would outlaw a legitimate design: matter that leaves the frame on purpose
  // (a served request flung out of an orbit) is not a defect.
  if (shot.camera && (shot.camera.motion || 'static') !== 'static') {
    const mayLeave = new Set(
      (shot.camera.may_leave_view || []).map((s) => (s.startsWith('#') ? s : `#ev-${s}`)));
    for (const m of marks) {
      const sel = `#ev-${m.id}`;
      if (framed.has(sel) || mayLeave.has(sel)) continue;
      assertions.push({ kind: 'staysInFrame', selector: sel });
    }
    notes.push(`camera "${shot.camera.semantic_function || 'unnamed'}": every event marker must stay ` +
      `inside the frame${mayLeave.size ? `, except ${[...mayLeave].join(', ')}` : ''}`);
  }

  // 4. Optional liveness: catches a frozen shot / a seek that lands past the motion.
  if (shot.validation?.keeps_moving) {
    assertions.push({
      kind: 'keepsMoving',
      withinSelector: shot.validation.keeps_moving,
      ...(shot.validation.max_static_sec ? { maxStaticSec: shot.validation.max_static_sec } : {}),
    });
  }

  return {
    spec: { duration, assertions },
    meta: {
      shot: shot.id,
      scenario: shot.semantic?.scenario || 'default',
      eventCount: marks.length,
      markers: marks.map((m) => ({ id: `ev-${m.id}`, atSec: m.sec, op: m.e.op, actor: m.e.actor, note: m.e.note })),
      notes,
    },
  };
}

/**
 * The instrumentation brief handed to whoever authors the shot. Deliberately
 * says nothing about layout.
 */
export function markerBrief(meta) {
  const lines = [
    `Shot ${meta.shot} — required event markers (${meta.eventCount})`,
    ``,
    `Each row needs ONE element in the composition carrying that id, which becomes`,
    `visible (opacity >= 0.5) at the given time. The element can be any visual you`,
    `like — the moving object, a tick, a label, a ring. Layout is your call.`,
    ``,
  ];
  const w = Math.max(...meta.markers.map((m) => m.id.length), 8);
  for (const m of meta.markers) {
    lines.push(`  #${m.id.padEnd(w)}  @ ${String(m.atSec).padStart(5)}s   ${m.actor} ${m.op}${m.note ? `  — ${m.note}` : ''}`);
  }
  if (meta.notes.length) {
    lines.push(``, `Notes:`);
    for (const n of meta.notes) lines.push(`  - ${n}`);
  }
  return lines.join('\n');
}

function round(n) { return Math.round(n * 1000) / 1000; }
