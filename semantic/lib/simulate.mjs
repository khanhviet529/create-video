/**
 * Semantic simulator.
 *
 * Replays an event log against declared state and reports which invariants hold
 * and which are violated. Correctness lives HERE, not in pixel coordinates.
 *
 * The point: a story author cannot merely *assert* "this causes a lost update".
 * The event log must actually reproduce it under replay, or the gate fails.
 */

const EXPR_OK = /^[A-Za-z0-9_+\-*/%(). ]+$/;

function evalExpr(expr, scope) {
  if (typeof expr === 'number') return expr;
  if (typeof expr !== 'string') throw new Error(`bad expression: ${JSON.stringify(expr)}`);
  if (!EXPR_OK.test(expr)) throw new Error(`unsafe expression: ${expr}`);
  const keys = Object.keys(scope);
  const fn = new Function(...keys, `"use strict"; return (${expr});`);
  const out = fn(...keys.map((k) => scope[k]));
  if (typeof out !== 'number' || !Number.isFinite(out)) {
    throw new Error(`expression "${expr}" did not yield a finite number (got ${out})`);
  }
  return out;
}

/** Resolve `value:` which may be a literal number or {expr: "..."}. */
function resolveValue(spec, scope) {
  if (spec == null) return undefined;
  if (typeof spec === 'number') return spec;
  if (typeof spec === 'object' && typeof spec.expr === 'string') return evalExpr(spec.expr, scope);
  throw new Error(`bad value spec: ${JSON.stringify(spec)}`);
}

/**
 * @param {object} scenario  { events, state?, resources?, queues? }
 * @param {object} model     the whole semantics doc (for actors/state defaults)
 */
export function simulate(model, scenario) {
  const trace = [];
  const problems = [];

  // --- world -------------------------------------------------------------
  // Every field carries a version so we can detect writes based on stale reads
  // without the author having to notice or declare it.
  const fields = new Map(); // "store.field" -> {value, version, lastWriter}
  const seedState = { ...(model.state || {}), ...(scenario.state || {}) };
  for (const [k, v] of Object.entries(seedState)) {
    fields.set(k, { value: v, version: 0, lastWriter: null, peak: v, drops: [] });
  }

  const locals = new Map();     // actor -> {name: value}
  const readBasis = new Map();  // actor -> {field: versionReadAt}
  const resources = new Map();  // name -> {holder|null, waiters:[]}
  const queues = new Map();     // name -> depth
  const opCounts = new Map();   // "op" and "op:target" -> n
  const checks = [];            // recorded guard decisions
  const accesses = [];          // recorded resource accesses
  const spawns = [];
  const lostWrites = [];
  const staleWrites = [];
  const exclusionBreaches = [];

  for (const r of scenario.resources || model.resources || []) {
    resources.set(typeof r === 'string' ? r : r.id, { holder: null, waiters: [] });
  }
  for (const [k, v] of Object.entries(scenario.queues || model.queues || {})) {
    queues.set(k, v);
  }

  const localsOf = (a) => {
    if (!locals.has(a)) locals.set(a, {});
    return locals.get(a);
  };
  const basisOf = (a) => {
    if (!readBasis.has(a)) readBasis.set(a, {});
    return readBasis.get(a);
  };
  const bump = (key) => opCounts.set(key, (opCounts.get(key) || 0) + 1);
  const fieldKey = (e) => (e.field ? `${e.target}.${e.field}` : e.target);

  const events = [...(scenario.events || [])];
  // Stable sort by declared time; ties keep authored order (authored order IS the
  // tiebreak for simultaneous-looking events).
  events.forEach((e, i) => (e.__i = i));
  events.sort((a, b) => (a.t ?? 0) - (b.t ?? 0) || a.__i - b.__i);

  for (const e of events) {
    const id = eventId(e);
    const scope = { ...localsOf(e.actor) };
    const rec = { id, t: e.t ?? 0, actor: e.actor, op: e.op, note: e.note };
    bump(e.op);
    if (e.target) bump(`${e.op}:${e.target}`);

    switch (e.op) {
      case 'read': {
        const key = fieldKey(e);
        const f = fields.get(key);
        if (!f) { problems.push(`event ${id}: read of unknown field "${key}"`); break; }
        if (e.into) localsOf(e.actor)[e.into] = f.value;
        basisOf(e.actor)[key] = f.version;
        rec.field = key; rec.value = f.value; rec.version = f.version;
        if (e.expect !== undefined && e.expect !== f.value) {
          problems.push(`event ${id}: declared expect=${e.expect} but replay read ${f.value}`);
        }
        break;
      }

      case 'write': {
        const key = fieldKey(e);
        const f = fields.get(key);
        if (!f) { problems.push(`event ${id}: write to unknown field "${key}"`); break; }
        let next;
        try { next = resolveValue(e.value, scope); }
        catch (err) { problems.push(`event ${id}: ${err.message}`); break; }

        const basis = basisOf(e.actor)[key];
        if (basis !== undefined && basis !== f.version) {
          // This actor decided `next` from a value that has since changed.
          staleWrites.push({ event: id, actor: e.actor, field: key, readVersion: basis, currentVersion: f.version });
          if (f.lastWriter && f.lastWriter.event !== id) {
            lostWrites.push({
              lostEvent: f.lastWriter.event, lostActor: f.lastWriter.actor,
              lostValue: f.value, overwrittenBy: id, overwriterActor: e.actor, field: key,
            });
          }
          rec.stale = true;
        }
        // A drop is recorded, not just a lower peak: "ended at its high point" cannot tell a
        // value that rose and stayed from one that rose, fell, and came back. The probe that
        // motivated this — 1200 -> 900 -> 1200 — has identical first and last values and an
        // identical peak, and every other invariant passes it.
        if (typeof f.value === 'number' && typeof next === 'number') {
          if (next < f.value) f.drops.push({ event: id, actor: e.actor, from: f.value, to: next });
          if (next > f.value) (f.rises ||= []).push({ event: id, actor: e.actor, from: f.value, to: next });
        }
        f.value = next; f.version += 1; f.lastWriter = { event: id, actor: e.actor };
        f.peak = Math.max(f.peak ?? f.value, next);
        rec.field = key; rec.value = next; rec.version = f.version;
        break;
      }

      case 'acquire': {
        const r = resources.get(e.resource);
        if (!r) { problems.push(`event ${id}: acquire of undeclared resource "${e.resource}"`); break; }
        if (r.holder && r.holder !== e.actor) {
          r.waiters.push(e.actor);
          rec.blocked = true; rec.blockedBy = r.holder;
        } else {
          r.holder = e.actor;
        }
        rec.resource = e.resource; rec.holder = r.holder;
        break;
      }

      case 'release': {
        const r = resources.get(e.resource);
        if (!r) { problems.push(`event ${id}: release of undeclared resource "${e.resource}"`); break; }
        if (r.holder !== e.actor) {
          problems.push(`event ${id}: ${e.actor} released "${e.resource}" it did not hold`);
        }
        r.holder = r.waiters.shift() || null;
        rec.resource = e.resource; rec.holder = r.holder;
        break;
      }

      case 'check': {
        // An authorization / guard decision. `pass` is authored; `subject`+`resource`
        // let authorized_access verify that a real decision covered a real access.
        const c = { event: id, order: trace.length, actor: e.actor, subject: e.subject ?? e.actor, resource: e.resource, pass: !!e.pass, reason: e.reason };
        checks.push(c);
        rec.resource = e.resource; rec.pass = c.pass; rec.subject = c.subject;
        break;
      }

      case 'access': {
        const a = { event: id, order: trace.length, actor: e.actor, subject: e.subject ?? e.actor, resource: e.resource, t: e.t ?? 0 };
        accesses.push(a);
        rec.resource = e.resource; rec.subject = a.subject;
        break;
      }

      case 'spawn': {
        const n = resolveValue(e.count ?? 1, scope);
        spawns.push({ event: id, actor: e.actor, count: n, of: e.of });
        // A spawn multiplies a named op. This is what makes N+1 measurable
        // without authoring 101 identical events.
        if (e.of) opCounts.set(e.of, (opCounts.get(e.of) || 0) + n);
        if (e.into) localsOf(e.actor)[e.into] = n;
        rec.count = n; rec.of = e.of;
        break;
      }

      case 'enqueue':
      case 'dequeue': {
        const q = e.queue;
        if (!queues.has(q)) queues.set(q, 0);
        const n = resolveValue(e.count ?? 1, scope);
        const delta = e.op === 'enqueue' ? n : -n;
        const depth = Math.max(0, queues.get(q) + delta);
        queues.set(q, depth);
        rec.queue = q; rec.delta = delta; rec.depth = depth;
        break;
      }

      default:
        problems.push(`event ${id}: unknown op "${e.op}"`);
    }

    // Mutual-exclusion witness: who is inside a guarded section right now.
    for (const [name, r] of resources) {
      if (r.waiters.length && r.holder) {
        // benign: waiting is the point of a lock
      }
      void name;
    }
    trace.push(rec);
  }

  // Critical-section overlap: two actors holding different guarded reads of the
  // same field between their own read and write, with no lock, is the concurrency
  // signature we care about.
  const overlaps = findReadOverlaps(trace);

  const derived = {
    finalState: Object.fromEntries([...fields].map(([k, v]) => [k, v.value])),
    finalVersions: Object.fromEntries([...fields].map(([k, v]) => [k, v.version])),
    queues: Object.fromEntries(queues),
    opCounts: Object.fromEntries(opCounts),
    lostWrites, staleWrites, exclusionBreaches, overlaps, checks, accesses, spawns,
  };

  const invariants = (scenario.invariants || model.invariants || []).map((inv) =>
    evaluateInvariant(inv, { fields, queues, opCounts, derived, model, scenario }));

  return { trace, derived, invariants, problems };
}

/** Pairs of actors whose read→write windows on the same field interleave. */
function findReadOverlaps(trace) {
  const windows = [];
  const open = new Map(); // `${actor}|${field}` -> read record
  for (const r of trace) {
    if (r.op === 'read' && r.field) open.set(`${r.actor}|${r.field}`, r);
    if (r.op === 'write' && r.field) {
      const k = `${r.actor}|${r.field}`;
      const rd = open.get(k);
      if (rd) { windows.push({ actor: r.actor, field: r.field, from: rd.t, to: r.t, read: rd.id, write: r.id }); open.delete(k); }
    }
  }
  const out = [];
  for (let i = 0; i < windows.length; i++) {
    for (let j = i + 1; j < windows.length; j++) {
      const a = windows[i], b = windows[j];
      if (a.field !== b.field || a.actor === b.actor) continue;
      if (a.from < b.to && b.from < a.to) {
        out.push({ field: a.field, a: a.actor, b: b.actor, aWindow: [a.from, a.to], bWindow: [b.from, b.to] });
      }
    }
  }
  return out;
}

function evaluateInvariant(inv, ctx) {
  const { fields, queues, opCounts, derived } = ctx;
  const base = { id: inv.id, kind: inv.kind, note: inv.note };

  switch (inv.kind) {
    case 'final_state': {
      const key = inv.field;
      const f = fields.get(key);
      if (!f) return { ...base, holds: false, detail: `unknown field "${key}"` };
      const holds = f.value === inv.expected;
      return { ...base, holds, actual: f.value, expected: inv.expected,
        detail: holds ? `${key} = ${inv.expected}` : `${key} = ${f.value}, expected ${inv.expected}` };
    }

    case 'no_lost_write': {
      const hits = inv.field ? derived.lostWrites.filter((w) => w.field === inv.field) : derived.lostWrites;
      return { ...base, holds: hits.length === 0, witnesses: hits,
        detail: hits.length === 0 ? 'every write saw the value it overwrote'
          : hits.map((w) => `${w.lostActor}'s write (${w.lostValue}) on ${w.field} was overwritten by ${w.overwriterActor} without being read`).join('; ') };
    }

    case 'mutual_exclusion': {
      const hits = inv.field ? derived.overlaps.filter((o) => o.field === inv.field) : derived.overlaps;
      return { ...base, holds: hits.length === 0, witnesses: hits,
        detail: hits.length === 0 ? 'no interleaved read-modify-write windows'
          : hits.map((o) => `${o.a} and ${o.b} both hold an open read of ${o.field}`).join('; ') };
    }

    case 'authorized_access': {
      // Every access must be preceded by a passing check for the same subject+resource.
      const bad = [];
      for (const a of derived.accesses) {
        if (inv.resource && a.resource !== inv.resource) continue;
        const ok = derived.checks.some((c) => c.pass && c.resource === a.resource &&
          c.subject === a.subject && c.order < a.order);
        if (!ok) bad.push(a);
      }
      return { ...base, holds: bad.length === 0, witnesses: bad,
        detail: bad.length === 0 ? 'every access was preceded by a passing authorization check'
          : bad.map((a) => `${a.subject} accessed ${a.resource} with no passing check`).join('; ') };
    }

    case 'bounded': {
      // "bounded" means NEVER exceeded, not "ends below". Checking only the final
      // value would pass a run that spiked over the ceiling and came back down —
      // which is exactly the shape of an outage.
      const f = inv.queue ? null : fields.get(inv.field);
      const val = inv.queue ? queues.get(inv.queue) : f?.value;
      const peak = inv.queue ? queues.get(inv.queue) : (f?.peak ?? f?.value);
      const holds = peak !== undefined && peak <= inv.max;
      const name = inv.queue || inv.field;
      return { ...base, holds, actual: val, peak, max: inv.max,
        detail: holds ? `${name} peaked at ${peak} ≤ ${inv.max}`
          : `${name} peaked at ${peak}, exceeds ${inv.max}${val !== peak ? ` (ended at ${val})` : ''}` };
    }

    case 'work_ratio': {
      // e.g. "db reads must stay ≤ 2 no matter how many rows" — the N+1 detector.
      // opCounts is a Map; derived.opCounts is the plain-object view.
      const actual = derived.opCounts[inv.count_op] || 0;
      const holds = actual <= inv.max;
      return { ...base, holds, actual, max: inv.max,
        detail: holds ? `${inv.count_op} ×${actual} ≤ ${inv.max}` : `${inv.count_op} ×${actual}, budget was ${inv.max}` };
    }

    case 'monotonic': {
      // Asserts a property of THIS TRACE, not a law of the system being modelled. Postgres
      // relation files CAN shrink — VACUUM FULL rewrites the table, and the package says so
      // explicitly. That belongs in its own scenario, where this invariant is simply not
      // declared (or is declared and expected to break). Scope lives in the scenario, which
      // is the only place that knows which run it is describing.
      const f = fields.get(inv.field);
      if (!f) return { ...base, holds: false, detail: `unknown field "${inv.field}"` };
      const dir = inv.direction || 'never_decreases';
      if (dir !== 'never_decreases' && dir !== 'never_increases') {
        return { ...base, holds: false, detail: `unknown direction "${dir}"` };
      }
      // never_increases is the mirror: a rise is the violation, and rises are exactly the
      // writes that moved the peak.
      const bad = dir === 'never_decreases'
        ? f.drops
        : (f.rises || []);
      const holds = bad.length === 0;
      const word = dir === 'never_decreases' ? 'fell' : 'rose';
      return { ...base, holds, witnesses: bad, direction: dir, peak: f.peak, actual: f.value,
        detail: holds
          ? `${inv.field} never ${dir === 'never_decreases' ? 'fell' : 'rose'} — `
            + `${f.value} at the end, peak ${f.peak}`
          : bad.map((d) => `${inv.field} ${word} ${d.from} -> ${d.to} at ${d.event}`).join('; ') };
    }

    default:
      return { ...base, holds: false, detail: `unknown invariant kind "${inv.kind}"` };
  }
}

export function eventId(e) {
  if (e.id) return e.id;
  const bits = [e.actor, e.op, e.field || e.resource || e.queue || e.target || e.of].filter(Boolean);
  return bits.join('_').replace(/[^A-Za-z0-9_]/g, '_');
}

/**
 * Gate: does the replay match what the story claims?
 * `expect.violations` names invariants the story is ABOUT breaking.
 */
export function checkExpectations(result, scenario) {
  const expected = new Set(scenario.expect?.violations || []);
  const violated = new Set(result.invariants.filter((i) => !i.holds).map((i) => i.id));
  const errors = [];

  for (const id of expected) {
    if (!violated.has(id)) {
      errors.push(`FABRICATION: story claims invariant "${id}" is violated, but replay satisfies it. ` +
        `The event log does not reproduce the bug it describes.`);
    }
  }
  for (const id of violated) {
    if (!expected.has(id)) {
      const inv = result.invariants.find((i) => i.id === id);
      errors.push(`UNDECLARED VIOLATION: "${id}" fails under replay (${inv.detail}) but is not listed in expect.violations. ` +
        `Either the mechanism is wrong or the story is understating it.`);
    }
  }
  for (const p of result.problems) errors.push(`MODEL ERROR: ${p}`);
  return errors;
}
