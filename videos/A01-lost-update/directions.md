# A01 — visual directions

Explored before writing any composition code. Directions differ in **mental model**,
not styling. Scored 1–5. Rejected alternatives kept on purpose.

---

## SHOT 02 — the hero

> **Purpose.** Show that both requests compute their new value from the same
> observation, and that one of the two writes is therefore destroyed.
>
> **Viewer must understand.** The value each request holds is a *copy*, and a copy
> stops being true the moment the original changes.
>
> **Restriction.** Do not default to a two-lane timeline just because this is
> concurrency.

### Direction A — execution trace (two lanes, time as the x-axis)

```
REQUEST A   ●─read 100────────────────◆─write 90
REQUEST B        ●─read 100───────────────────◆─write 80
            └──────────── time ──────────────────────┘
STOCK       100 ───────────────────── 90 ── 80
```

Mental model: *time is a spatial axis; concurrency is overlap along it.*

| clarity | accuracy | novelty | animation potential | cognitive load | fits neighbours |
|---|---|---|---|---|---|
| 5 | 5 | 1 | 2 | 2 (low) | 4 |

Honest read: this is the clearest possible diagram of *ordering* and the worst
possible diagram of *causation*. It shows that the reads overlap. It does not show
**why** overlap destroys work — the loss is represented only by a number changing
in a third row. It is also the frame this topic always gets, in every article.

**Rejected as the hero.** Retained as a legitimate device for a shot whose subject
genuinely *is* ordering — which is not this shot.

### Direction B — shared-state simulation ("the value has one home") ← CHOSEN

The ledger holds one number. A read does not draw a line; it **peels a translucent
duplicate off the number** and carries it away. Each request mutates *its own copy*.
When a copy is written back it lands on the ledger and replaces what is there.

```
                    100          ← the value of record
                   ╱    ╲
              [100]      [100]   ← two copies, both true at the moment they were taken
                 ↓          ↓
              [ 90]      [ 80]   ← each computed from its own copy
                 ↓          ↓
                    80            ← only the last arrival survives
              (90 detaches, desaturates, falls out of frame)
```

Mental model: *a read is a duplication; a duplicate goes stale silently; a write is
a replacement, not a merge.*

| clarity | accuracy | novelty | animation potential | cognitive load | fits neighbours |
|---|---|---|---|---|---|
| 4 | 5 | 5 | 5 | 3 (medium) | 5 |

Why it wins: staleness becomes a **visible property of an object on screen**. At
t≈4.6s the frame holds B's copy reading `100` while the ledger reads `90` — the
contradiction is right there, two numbers disagreeing, no annotation needed. And
the lost write is not a number changing; it is an object that visibly *leaves*.
Motion answers: what duplicated, what became stale, what was overwritten, what
disappeared.

Why it is hard for a template library: it needs an object that is *born from*
another object, carries independent state, and later gets discarded — bespoke
choreography, not a card with an arrow.

### Direction C — arithmetic reconstruction (start at the consequence, rewind)

Open on `80`. Decompose: `80 = 100 − 20`. Ask where `− 10` went. Reveal A's
operation floating, detached, never applied.

Mental model: *the outcome is arithmetically impossible; find the missing operation.*

| clarity | accuracy | novelty | animation potential | cognitive load | fits neighbours |
|---|---|---|---|---|---|
| 3 | 5 | 5 | 4 | 4 (high) | 3 |

Rejected as the hero: it explains the *symptom* beautifully and the *mechanism*
not at all — you learn an operation is missing without learning why. Too much
cognitive load for the position in the video where the viewer still needs the
mechanism.

**Partially adopted.** Its closing image — the orphaned `−10` — is grafted onto the
end of Direction B as the final beat, and its "start from the consequence" framing
moves to SHOT 01, where a symptom-first hook is exactly right.

---

## SHOT 04 — the two fixes

### Direction A — two columns, side by side

Pessimistic left, optimistic right, simultaneously. Rejected: parallel-reveals two
independent ideas, which the eye cannot track (and the viewer has no basis to
compare against yet).

### Direction B — same frame, twice, with one thing changed ← CHOSEN

Replay the hero's exact geometry — same ledger position, same copy trajectories,
same timing — and change only the mechanism. Under pessimistic locking B's copy
never leaves: it is held at a barrier until A's write lands. Under optimistic
locking B's copy leaves, is **refused** at the ledger, and returns to re-read.

This is the one place in the video where repeated composition is the *point*:
identical geometry means the only thing the viewer can notice is the changed
mechanism. Logged deliberately in the fingerprint as `intentional_repetition`, so
the variety diagnostic does not read it as template habit.

### Direction C — decision-space diagram (conflict rate × cost axes)

A 2-D field with the two strategies plotted, showing where each wins. Genuinely
useful and genuinely a *different* video's shot — it answers "which should I pick"
rather than "what does it do". Rejected here, kept as a candidate for the close.

---

## Creative risk register

| shot | risk taken | could fail because |
|---|---|---|
| 02 | value-duplication metaphor instead of a timeline | viewer may read the copies as "two different rows" rather than "two copies of one row" — mitigated by peeling the copy visibly *off* the ledger glyph |
| 02 | no header, no footer, no stage frame | may not read as "same channel" as other videos — brand carried by type, colour semantics and motion timing only |
| 03 | code mutating into its own effect, no code card | may read as a gimmick if the mutation is not legible at phone size |
| 04 | deliberately reusing shot 02's geometry | the variety diagnostic will flag it; that flag is expected and answered |
