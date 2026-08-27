# D01 — visual directions

**Hypothesis under test:** current visual reasoning treats the frame as a
left-aligned orthogonal document page rather than as a space in which a technical
mechanism occurs.

Retry storm was chosen to attack that, not to add missing shapes. It has
propagation, multiplication, feedback, density, scale and circular causality — and
almost none of that fits on a page.

---

## What the mechanism actually is

Before any geometry. From the replayed model:

1. A **fixed limit** — capacity 100 — that never changes. It is the only thing here
   that does not.
2. An arrival rate that exceeds it.
3. The excess does not disappear. It **comes back**, and it **multiplies by three**.
4. Each traversal of the loop arrives larger: 120 → 180 → 360 → 900.
5. **The reveal:** the baseline never moved. Users sent 120 every round. All 780 of
   the growth is the system's own retries. Nobody asked for more load.

What the viewer must *feel*, not read: the loop feeding itself.
What the viewer's eye must follow: one request first, so the individual mechanism is
legible — then density, so the aggregate is felt.

---

## Direction A — flow field with a throat

Space: the whole frame is a downward flow. A **throat** across the middle is exactly
as wide as capacity. Requests are matter falling through it. What passes the throat
leaves the bottom of the frame — served, gone. What does not pass is **turned back
upward**, and each turned-back unit becomes three.

```
   · ·· ·  · ·· ·  ·· ·        arrivals
    \  |  /   \ |  /
  ────┐   ┌────────┐   ┌────   the throat = capacity, fixed width
      │   │        │   │
   ↑  └───┘        └───┘  ↑    what fits, falls through
   │      · ·  · ·        │
   └──── ×3 ──────────────┘    what does not, turns back and triples
```

Mental model: *throughput is matter, capacity is a physical aperture, and what cannot
pass comes back multiplied.*

- **Eye follows:** one marked particle, then the field.
- **Geometry from mechanism:** the throat's width IS the capacity constant; vertical
  is flow; upward is feedback. Nothing is a box.
- **Camera:** possibly a pull-back as density grows.
- **Risk:** could collapse into a funnel infographic if the particles stop behaving
  like matter and start behaving like an illustration of matter.

## Direction B — closed feedback orbit

Space: a **closed circuit** occupying nearly the whole frame. Requests travel it. At
one arc, an **exit** the width of capacity lets 100 leave the orbit each pass — served,
flung out of frame. At another arc, whatever is still circulating **triples**. Each
traversal the orbit carries more, until the path stops reading as a line of dots and
becomes a solid band.

```
              ╭─── ·············· ───╮
         ·····                        ·····
      ···                                  ···
   ··                                        ··
  ·        EXIT ──→ (100 leave, every pass)    ·
  ··                                          ··
     ···                                   ···
        ·····                         ·····
             ╰──── ×3 ───────────────╯
```

Mental model: *causality here is circular. The output is the input. The loop feeds
itself, and you can watch it fill.*

- **Eye follows:** one marked request all the way round, until it is lost in the crowd
  — which is itself the point.
- **Geometry from mechanism:** the circle is not a style choice. The mechanism **is** a
  cycle, and a cycle drawn as a left-to-right sequence has to lie about where the
  arrows go. This is the direction where geometry is least arbitrary.
- **Camera:** possibly none. The orbit is fixed and density grows inside it.
- **Risk:** the failure mode is obvious and must be watched for — if it becomes a
  circle with labelled nodes and arrowheads, it is the old cycle diagram wearing a new
  coat. It has to be *particles actually travelling*, never arrows indicating travel.

## Direction C — the baseline that never moved

Space: two superimposed layers sharing one field. The **lower** layer is real user
traffic: 120 per round, steady, unchanging, calm. The **upper** layer is retries,
growing until it swallows the frame. The lower layer stays exactly as it was the whole
time, visible underneath.

```
  retries    ░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓████████████████████
             ░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓████████████████████
  ───────────────────────────────────────────────────
  users      ▪▪▪▪▪▪▪▪ ▪▪▪▪▪▪▪▪ ▪▪▪▪▪▪▪▪ ▪▪▪▪▪▪▪▪   ← never changes
```

Mental model: *nobody sent more. Everything above the line is the system talking to
itself.*

- **Eye follows:** the unchanging lower band, precisely because it does not move.
- **Geometry from mechanism:** this is the one direction that needs genuine
  foreground/background separation — and it needs it because the mechanism has two
  populations that must be compared *in the same place*, not side by side. Depth here
  is required by the argument, not added for variety.
- **Camera:** none. Both layers must stay comparable, so the frame is fixed.

### Rejected before prototyping

**"Scale reveal" — start on one client retrying, pull back to hundreds.** It is a
good idea and it is `one_to_many`, which C01 already shipped. Creative memory exists
precisely to catch this: reusing the visual *argument* is the repetition worth
avoiding, whatever the motion looks like. Dropped, and Direction C written in its
place to carry the same "individually reasonable, collectively fatal" idea through
layering rather than through scale.

**Two curves on a time/quantity field.** An arrivals curve bending away from a flat
capacity line, with the gap between them pumping back into the curve. Honest, clear,
and precisely the left-aligned orthogonal document the hypothesis says we default to.
Rejected as evidence-of-the-habit rather than a way out of it.

---

## No content stage

All three are authored with no header, no footer, no card, no stage rectangle, no
title. The full 1080×1920 is the mechanism's space. Brand is carried only by
typography, colour semantics, motion language and rendering quality.

Direction B is the strongest test of this, because a circuit has no natural
top-left origin to anchor to.

## Scoring — filled in after the prototypes, not before

| | comprehension | felt amplification | geometry earned | eye has something to follow | cognitive load | camera justified |
|---|---|---|---|---|---|---|
| A | | | | | | |
| B | | | | | | |
| C | | | | | | |

---

# Results

All three prototypes were authored to the same semantics, the same 15s duration and
the same six marker timestamps, then snapshotted at identical times so the comparison
is real rather than impressionistic. `cv gate` clean on all three.

Silhouette distance between them: **dirA↔dirB 0.82, dirA↔dirC 1.00, dirB↔dirC 1.00.**
For scale, the three previous benchmarks sit between 0.11 and 0.51 of each other. When
the spatial model is genuinely reconsidered rather than restyled, structural difference
follows on its own — no shape had to be added to a checklist to get it.

## Scoring

| | comprehension | felt amplification | geometry earned | eye has something to follow | cognitive load | verdict |
|---|---|---|---|---|---|---|
| **A** flow / throat | 2 | 3 | 2 | 2 | 3 | **reject** |
| **B** feedback orbit | 4 | 5 | **5** | 5 | 3 | **keep — hero** |
| **C** stacked bands | 4 | **5** | 3 | 3 | 2 | **partial — one idea salvaged** |

## Direction A — rejected

The aperture idea failed for a reason that generalises past this shot.

**A physical constraint only reads if there is solid mass to contrast against, and
this brand has no solid mass.** The jaws either side of the throat are
`--ground-lift` on `--ground` — a 5% luminance difference — so the "narrow gap"
that was supposed to carry the capacity constant is invisible. Drawn heavy enough
to read, they would be the first filled blocks in the channel's visual language and
would look like nothing else we make.

Second failure: Halton-scattered particles read as **noise, not space**. There is no
structure to navigate, so the eye has nothing to follow and density is the only
signal. That is close to the "random particles with no meaning" anti-pattern, and
close enough that it should be called one.

Third: the served field below the throat is nearly empty for the whole shot — a
third of the frame doing nothing.

## Direction B — hero

The only direction where **the geometry is not a choice**. The mechanism is a cycle,
and a cycle laid out left-to-right has to lie about where its arrows go. The circuit
is the honest drawing of it.

What works, in order of importance:

1. **Both ends are visibly constant while the middle explodes.** Users send 120 at
   the top, served 100 at the bottom, and neither stream changes density for the
   entire fifteen seconds. Between them the loop goes from a thin dotted ring to a
   solid orange band. Nobody has to be told the growth is self-inflicted — the two
   steady streams say it.
2. **Density is the quantity.** At 60 marks the ring is countable; at 450 it is
   solid. The transition happens in front of the viewer.
3. **The space is operating.** The loop turns and both streams flow from t=0. A
   circuit that is not moving is a diagram of a circuit.
4. **Marks are placed by golden angle**, so any prefix is already evenly spread.
   That is a semantic decision, not an aesthetic one: sequential placement would
   have implied retries enter from one door, and they do not.

Two things the review changed:

- **The retry arc was removed.** It was a lie. Golden-angle placement says retries
  arrive from everywhere; an arc labelled "retry" says they come from one place.
  Capacity keeps its arc because capacity really is one fixed place.
- **The exit arc was drawn under the dots**, so by round three the saturated loop
  had buried the one constant in the mechanism exactly when it mattered most. It now
  draws last, heavier, and labelled.

Remaining weakness, not fixed: the centre numeral lags the ring by design — at 6.6s
the loop is taking on 240 retries while the numeral still reads 180, because that
load only becomes the arrival rate next round. Semantically correct, momentarily
confusing.

## Direction C — partially salvaged

**The strongest single frame of the three** is dirC at 14.6s: a wall of 780 orange
marks standing on a 120-mark grey band that has not moved, with the capacity line
cutting *through* the user band — which is true and worth seeing, since even real
traffic is already over the line. Because both populations are drawn from the same
unit at the same scale, the proportion on screen IS the proportion in the model.

But it fails the hypothesis it was built to test. **It shows the consequence and not
the mechanism.** There is no loop in it. You see that retries dwarf users; you never
see failure *become* load. And structurally it is a vertical stacked bar — orthogonal,
bottom-anchored, quantity-as-height. It is a very good chart, which is precisely the
habit under investigation.

The gate said so before I did: `motion_frozen — nothing moves within #stage between
2.91s and 6.37s`. A stacked quantity has nothing to do while it waits. That finding is
the most useful single number in this round: **a space that is operating cannot be
still, and a chart has no reason not to be.** The fix (a continuous drain along the
capacity line) is honest — throughput really is continuous — but it is a repair, not
the shot's nature.

**Salvaged into the hero:** dirB already keeps the original 60 marks in `--ink-mid`
while retries are `--pressure`, so the user population stays visible and gets
visibly swamped. dirC's argument survives inside B's geometry.

**Kept for a later shot:** the exact-proportion wall is the right image for a
*consequence* beat, once the loop has been established. That is a different shot, not
a different hero.

## Hypothesis: supported, with a qualification

> Current visual reasoning treats the frame as a left-aligned orthogonal document page
> rather than as a space in which a technical mechanism occurs.

Supported. Left unattended, the default reached for a stacked column (C) — and C is
the one that scored worst on geometry-earned and failed the liveness check. The
direction that broke the habit (B) did so because the *mechanism* was circular, not
because circles were on a list.

The qualification matters: **A also broke the habit and was still bad.** Leaving the
document page is necessary and nowhere near sufficient. A is radial-free, orthogonal-
free, particle-based, non-anchored — and it is the worst of the three, because its
space had no structure to navigate. "Not a page" is not a design.


## Mute test and eye-path

Watched without narration, at the six shared timestamps.

| | what a technically literate viewer gets with no sound | eye follows |
|---|---|---|
| **A** | "lots of dots, more dots later." The aperture is invisible, so the constraint — the whole reason anything fails — is not in the picture. **Fails.** | nothing; there is no structure to track |
| **B** | Traffic enters at a steady rate. A loop carries it. A fixed teal arc lets a steady rate out. The loop fills until it is solid while both ends stay identical. **Passes** — the self-inflicted growth is legible without a word. What needs narration is only the ×3 factor. | the ring's density, and the two streams that refuse to change |
| **C** | "Retries are much bigger than user traffic, and capacity is below both." **Passes for the consequence, fails for the mechanism** — nothing shows failure becoming load. | the grey band at the floor, because it is the only thing that does not move |

## The gallery test

In `creative_memory/gallery.jpg`, eleven of twelve authored shots are left-anchored and
orthogonal. dirB is the only one that is neither. That is the habit measured, and the
single counter-example measured against it.
