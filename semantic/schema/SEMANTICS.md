# `semantics.yaml` — schema

The minimal representation needed to *prove* a mechanism. Deliberately not universal:
every op and invariant kind here exists because one of the three benchmarks needed it.
When a fourth benchmark needs something new, add it then — a general-purpose modelling
language would be a template library wearing a different hat.

Replay it with `node tools/cv.mjs sem <video_id>`.

---

## Top level

```yaml
id:      A01-lost-update            # matches videos/<id>/
title:   "Lost update: two writers, one stale read"
domain:  concurrency                # concurrency | security | performance | ...
audience: "backend engineers, 2-5 years"

assumptions:                        # REQUIRED in practice. The mechanism is only
  - "..."                           # true under these; say them rather than imply them.

facts:                              # optional. Declarative reference data for the
  ownership:                        # VISUAL layer. The simulator never reasons about
    invoice_8842: globex            # it. Keeps prose from masquerading as proof.

actors:
  - { id: req_a, label: "Request A", kind: request }   # kind: request|service|store

state:                              # "<store>.<field>: <number>"
  row.stock: 100                    # every field silently carries a version

resources: [row_lock]               # named mutexes (may also be per-scenario)
queues:    { retry: 0 }             # named queues with a starting depth

scenarios:                          # one per variant of the mechanism
  broken:   { ... }
  fixed:    { ... }
```

Multiple scenarios are how before/after gets modelled. A01 carries `broken`,
`optimistic` and `pessimistic`; each shot names the one it dramatises.

## A scenario

```yaml
broken:
  note: "no coordination — both writes are computed from the same read"
  resources: [row_lock]             # optional per-scenario override
  state: { }                        # optional per-scenario seed override
  events: [ ... ]
  invariants: [ ... ]
  expect:
    violations: [serial_outcome, no_lost_write, exclusive_rmw]
```

`expect.violations` names the invariants **the story is about breaking**. It is checked
in both directions and this is the whole anti-fabrication mechanism:

- claimed but not reproduced → `FABRICATION`
- reproduced but not claimed → `UNDECLARED VIOLATION`

## Events

```yaml
- id:     a_read          # REQUIRED if the same actor+op+field repeats in a scenario;
                          # ids are the marker contract's stable handles
  t:      0.05            # normalised 0..1. ORDER and rough spacing, never seconds.
  actor:  req_a
  op:     read
  target: row
  field:  stock
  into:   seen            # bind the value into this actor's locals
  expect: 100             # assert what the replay reads here. Cheap, catches a lot.
  note:   "A sees 100"    # surfaces in MARKERS.txt for whoever authors the shot
```

`t` is normalised on purpose. The mechanism's order is the truth; how many seconds it
gets on screen is a directorial decision made in `shot_plan.yaml` (`duration` +
`t_window`). Change a shot's length and the assertions recompile.

### Ops

| op | fields | effect |
|---|---|---|
| `read` | `target`, `field`, `into?`, `expect?` | binds the value into locals and **records the version read**, which is what makes stale-write detection automatic |
| `write` | `target`, `field`, `value` | `value` is a number or `{ expr: "seen - 10" }` over this actor's locals; bumps the field's version |
| `acquire` | `resource` | takes it, or queues as a waiter if another actor holds it |
| `release` | `resource` | hands off to the first waiter |
| `check` | `subject?`, `resource`, `pass`, `reason?` | a guard decision, recorded with its order |
| `access` | `subject?`, `resource` | touching a resource; must be covered by a prior passing `check` |
| `spawn` | `count`, `of?`, `into?` | `count` may be `{expr}`. `of` names an op this multiplies — how N+1 becomes measurable without authoring 101 events |
| `enqueue` / `dequeue` | `queue`, `count?` | queue depth arithmetic, floored at 0 |

`expr` is restricted to `[A-Za-z0-9_+-*/%(). ]` and must evaluate to a finite number.

### What the simulator derives (nobody declares these)

`lostWrites` · `staleWrites` · `overlaps` (interleaved read→write windows on one field)
· `finalState` · `finalVersions` · `queues` · `opCounts` · `checks` · `accesses` ·
`spawns`. This is where the value is: the author writes what happened, not what it means.

## Invariants

```yaml
- id: no_lost_write
  kind: no_lost_write
  field: row.stock        # optional narrowing
  note: "..."
```

| kind | parameters | holds when |
|---|---|---|
| `final_state` | `field`, `expected` | the field ends at `expected` |
| `no_lost_write` | `field?` | no write was computed from a version that had already moved on |
| `mutual_exclusion` | `field?` | no two actors held overlapping open read→write windows |
| `authorized_access` | `resource?` | every `access` had an earlier passing `check` for that **same subject and same resource** |
| `bounded` | `queue` or `field`, `max` | never exceeded `max` |
| `work_ratio` | `count_op`, `max` | that op's count (including `spawn ... of:`) stayed within budget |

`authorized_access` is the IDOR detector, and its shape matters: matching on subject
*and* resource is what makes "the token was valid" fail to count as authorisation for a
record. B01's broken scenario checks `session` and accesses `invoice_8842`; the mismatch
is the bug.

## Worked example — the whole of A01's broken scenario

```yaml
events:
  - { id: a_read,  t: 0.05, actor: req_a, op: read,  target: row, field: stock, into: seen, expect: 100 }
  - { id: b_read,  t: 0.22, actor: req_b, op: read,  target: row, field: stock, into: seen, expect: 100 }
  - { id: a_write, t: 0.55, actor: req_a, op: write, target: row, field: stock, value: { expr: "seen - 10" } }
  - { id: b_write, t: 0.82, actor: req_b, op: write, target: row, field: stock, value: { expr: "seen - 20" } }
invariants:
  - { id: serial_outcome, kind: final_state,      field: row.stock, expected: 70 }
  - { id: no_lost_write,  kind: no_lost_write,    field: row.stock }
  - { id: exclusive_rmw,  kind: mutual_exclusion, field: row.stock }
expect:
  violations: [serial_outcome, no_lost_write, exclusive_rmw]
```

replays to:

```
0.05  req_a  read   row.stock=100 v0
0.22  req_b  read   row.stock=100 v0
0.55  req_a  write  row.stock=90  v1
0.82  req_b  write  row.stock=80  v2   <- based on a stale read
final {"row.stock":80}
lost write   req_a's row.stock=90 overwritten by req_b
overlap      req_a & req_b hold concurrent open reads of row.stock
✓ replay matches the story's claims
```

---

## Deliberately excluded

- **Coordinates, sizes, colours, layout.** Nothing here can constrain a composition.
- **Wall-clock time.** No milliseconds, no durations, no throughput. A model that could
  express "this took 40ms" would invite inventing it.
- **Control flow.** No branches, no loops except `spawn`'s multiplier. The event log is
  one concrete trace — the trace the video shows. Generalising to all traces is a
  verification problem, not a storytelling one.
- **Strings as state.** State is numeric so `expr` stays trivially checkable. Anything
  categorical (tenant names) lives in `facts:` where it is honestly non-simulated.
