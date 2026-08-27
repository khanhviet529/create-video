# Visual critic report — R&D cycle 1

Written as a separate director, not as the person who wrote the shots. Every
redesign below happened *after* looking at rendered frames, not from reasoning about
the source.

Three benchmarks, five authored shots, two engines. `cv gate` clean on all of them.

---

## The headline

The architecture works, and the evidence is `creative_memory/gallery.jpg`: five shots
with five genuinely different spatial systems that are unmistakably one channel. No
shared layout, no shared composition, no scene types anywhere in the system — and the
brand still reads, carried entirely by typography, colour semantics, stroke language
and motion timing.

The single most valuable thing built is not a visual. It is the **semantic replay +
assertion compiler**: correctness that holds without ever mentioning a coordinate.

---

## Redesigns forced by looking at frames

### A01 hero — rebuilt once, revised three times

**Cut 1: rejected outright.**

- **45% of the canvas was dead.** Content occupied roughly y=200–1200 of 1920. On a
  phone, a third of the screen did nothing. It read as a 16:9 diagram dropped into a
  vertical frame.
- **The core metaphor did not read.** Copies were supposed to "peel off" the ledger
  numeral. To avoid an overlap finding I had them appear *below* the baseline rule —
  so they read as two unrelated second numbers, not as duplicates of the first. The
  shot's entire premise was invisible.
- **Copy B had no visual relationship to the value it came from** — it materialised at
  x=560 while the ledger sat at x=180.
- **The replacement crossfade was mush.** Two 200px numerals stacked. I had marked it
  `data-layout-allow-overlap` *from reasoning*, before looking. The snapshot showed
  the mark was a lie told to the gate.
- **22px type**, below my own stated 26px floor.

**Cut 2** introduced the fix that made the shot work: a **spatial system with meaning**
— two hairlines dividing *stored* / *in flight* / *the reckoning*, with **two rails
descending from beneath one figure**. The duplication reads instantly at 4.6s: three
figures showing 100, two rails, one source.

**Revision A — hierarchy inversion.** At 7.1s the departing `100` cleared sideways at
full 200px while the new `90` faded in. For ~0.4s the *superseded* value was the largest
thing in frame, so the eye read the stale number as the answer. Fixed by shrinking and
displacing in one fast tween and demoting the colour at the same instant.

**Revision B — dangling devices.** The read rails stayed on screen after their writes
landed, reading as leftover furniture. Each now fades when its write commits.

**Revision C — a two-frame flicker.** The old value cleared the slot at 6.98s and the
replacement arrived at 7.06s, so for two frames the row showed no value at all. Barely
visible in a still, immediately visible in motion.

**Accepted trade-off, not fixed.** Late frames have a generous empty middle once both
copies are consumed. The frame is anchored top and bottom, which is a legitimate
editorial composition, and the shot's *sequence* fills the middle. Filling it with
residue ghosts was tried on paper and rejected as density for its own sake.

**Idea cut for legibility.** The original ending had the lost `90` detach, desaturate
and fall out of frame, leaving an orphaned `−10`. Better device; it needed a long
transit crossing three other elements to work. Comprehension beat originality. Recorded
in `directions.md`, not deleted.

### B01 hero — the central device was nearly invisible

The channel *is* the shot's spatial premise, and I drew its rails in `--rule`
(`#23272A`). In the contact sheet they read as two faint scratches. Structure that
carries meaning now gets `--rule-bright`.

Second fix: `TENANT MISMATCH` was a **caption asserting a mismatch the frame never
performed**. `CALLER acme` sat in small grey type and `globex` in vermilion, and nothing
compared them. Now the payoff puts both on one line — `acme ≠ globex` — so the frame
does the comparing and the label only names it.

Also extended the channel so the store sits *inside* the route instead of spilling out
of its bottom, which incidentally lifted the dead band at the base.

### C01 hero — right idea, wrong scale

The cascade worked on the first attempt and is the strongest single sequence in the
cycle: a hundred query marks firing one per row over 5.5 seconds, each row tick turning
in lockstep so the 1:1 mapping is *shown* rather than captioned. Rows and queries get
deliberately unlike glyphs because conflating cost with result is precisely the
misconception.

But the whole composition sat in the top half with 55% dead below. Rescaled: fewer
columns, bigger marks, more rows, tally moved to y=1384. The grid now carries the frame
instead of floating in it.

One sequencing fix: both category labels (`ROWS RETURNED`, `ROUND TRIPS`) now appear
*before* either has content, so the viewer knows what comparison is coming.

---

## Defects the automated gate caught that I would have shipped

| Finding | Why no human would have caught it |
|---|---|
| `content_overlap` on the row label | A 200px numeral's metric box reaches ~21px above its layout box. Invisible at a glance, real at render. |
| `text_not_painted` on the "70" | `color: transparent` + `-webkit-text-stroke` — the glyphs would not have painted at all. |
| `contrast_aa_failure` ×2 videos | `--ink-ghost` at 1.8:1 used as body text. I made the same mistake twice. |
| `motion_appears_late` on both rails | Wrappers with only absolutely-positioned children collapsed to 0×0, so they "never reached visible opacity". A render-vs-preview bug no still frame reveals. |
| `motion_out_of_order` on A01 shot_04 | One element was shared between `b_lock` and `b_read` — two events six seconds apart — so the composition claimed B *read* at 3.3s. A genuine semantic error, found by an assertion compiled from the model. |
| duration mismatch | shot_04 was derived from a 12.5s shot but planned at 13.0s, truncating its closing reveal mid-fade. Every assertion passed. **This gap was in my own tooling** and is now a check. |

## Defects in my own tooling, found by using it

1. **`authorized_access` was structurally broken.** It compared event order through a
   regex that never matched any id, so every access looked unauthorised and the
   invariant reported violations even for correct code. It would have "proved" every
   security video's fix was still broken.
2. **`work_ratio` indexed a `Map` as an object**, so every count read as 0 — the N+1
   detector silently could not detect N+1.
3. **`cv variety` was measuring darkness, not structure.** Raw grey levels at 10×18
   reported *every* pair of shots as 0.00–0.01 apart, because a near-black frame with
   sparse light type averages to almost nothing. Mean-centring and normalising each
   signature fixed it; the corrected matrix now ranks the deliberately-identical pair
   (shot_02 ↔ shot_04, 0.22) closest and the different-engine shot furthest (0.51).

All three were the kind of bug that makes a validator worse than none — it reports
success. Worth stating plainly: a gate is only trustworthy once you have watched it
fail on something you know is broken.

---

## Mute test

| shot | passes? | notes |
|---|---|---|
| A01 shot_01 | yes | `30` shipped / ledger `80` / should be `70` / 10 unaccounted for. The arithmetic argues itself. |
| A01 shot_02 | yes | Two rails from one figure → both copies read 100 → row reads 90 while B still holds 100 at v0 → 90 marked NEVER READ. The version stamps do the work. |
| A01 shot_04 | partly | The barrier and `WAITING` read clearly. That B's *wait* is what buys correctness needs the narration. |
| B01 shot_02 | yes | One gate present, one gate a gap, request returns holding a foreign tag. |
| C01 shot_02 | yes | The strongest of the five. One statement one mark, one loop a hundred marks, ninety-nine of them grey. |

## Cognitive load

C01 is the densest and also the clearest, because its density accumulates over 5.5
seconds instead of arriving at once. A01 shot_02 is the closest to too much: at 8.9s the
frame carries the row value, its version, a superseded run, two labels and B's copy with
its own basis stamp. It survives because the vermilion is used exactly once and pulls
the eye straight to the contradiction.

## Failure conditions — honest self-assessment

| Condition | Status |
|---|---|
| "template library + LLM scene selector under a different name" | **Avoided.** No scene types, no composition presets. The only vocabulary is semantic and validational. |
| "every video converges on similar HTML layouts" | **Avoided.** Zones / route / emitter-and-field are three different claims about what the frame is. |
| "every animation uses the same visual grammar" | **Partly true and flagged.** `cv recall` reports `camera_devices: static` across all three. A real habit, correctly caught by the memory system, not yet attacked. |
| "engine selection nominal, one engine always used" | **Avoided.** ffmpeg renders shot_01 in ~1s versus ~70s, on-brand via pinned TTFs, with stream params matching so cross-engine concat stays lossless. |
| "custom slots technically custom but visually identical" | **Avoided** — see the gallery. |
| "quality cannot be inspected before final render" | **Avoided.** 18s snapshot pass; the render is the last step, not the review step. |
| "technical correctness depends on visual coordinates" | **Avoided**, and this is the strongest result. Correctness is replay plus assertions that mention no coordinates. |
| "reuse prioritised over communication" | **Avoided.** Nothing compositional is shared. Deliberately no layout helpers yet — three shots is not enough evidence to tell a primitive from a template in disguise. |

## What is weakest

1. **Static camera everywhere.** Flagged by the memory system as a habit. No shot uses
   scale, push-in, or reframing as an explanatory device. This is the clearest gap.
2. **Only two of six planned A01 shots plus one hero each for B01/C01.** The composed
   A01 cut is 36.5s of a planned 72s. Enough to prove the architecture, not a finished
   video.
3. **No narration or audio.** The omnivoice pipeline on this machine exists but its
   model weights are CC-BY-NC, so it cannot be used for anything commercial. That is a
   licensing decision to make before wiring TTS in, not a technical one.
4. **`before` has no `notBefore` counterpart.** The chain covers it today; a shot could
   in principle satisfy every assertion while showing an element earlier than it should.
5. **Only three semantic domains exercised.** `bounded` (queue depth) is implemented and
   unused — no benchmark needed it yet, which is the correct reason for it to be quiet.

## What to do next

1. **Attack the camera habit.** One benchmark shot where scale or reframing carries the
   explanation, not decoration.
2. **Finish A01 to all six shots** — specifically shot_03, the "code becomes execution"
   SQL treatment, which is the one distinctive device that was planned and not built.
3. **Add `notBefore`** to close the assertion gap.
4. **Resist extracting helpers** until roughly ten shots exist. Then look for what
   genuinely repeats across *different* topics, and only then generalise.

---

# Cycle 2 — camera

`static_camera` was the top habit at the end of cycle 1. Cycle 2 did not fix it by
adding camera moves; it asked what a camera can mean, ran four experiments, kept two
and a half and threw one away. Full write-up in [CAMERA_STUDY.md](CAMERA_STUDY.md),
including the ranked TOP 5 habits still in the work — camera is now #6.

Headlines:

- **Kept:** `one_to_many` (C01, pull_back) — the clearest win of either cycle. It
  teaches the one-row-costs-one-query mechanism that the static cut is physically
  unable to show at scale 1.
- **Kept with a caveat:** `single_actor_to_concurrency` (A01, widen) — works, but only
  governs 4 of 12.5 seconds. A reveal camera is worth the span it withholds.
- **Rejected:** `global_to_root_cause` (B01, push_in) — the layout forbids zoom.
  B01 spends the full canvas width on three columns and any real zoom loses one.
  Kept in the shot plan as `status: experiment_rejected` with its reasons.
- **Kept:** `camera_as_shared_reference_frame` (A01 shot_04) — a comparison pair must
  share its camera verbatim, or the match cut stops being a match cut.

Three more of my own bugs, all of the "validator reports success" kind:

1. **Several `staysInFrame` assertions were vacuous** and had been since cycle 1. A
   full-stage container's box equals the canvas so it can never leave it; a wrapper
   with only absolutely-positioned children is 0×0 and also never leaves. Camera
   exposed both by making one of them fail for real.
2. **`appearsBy` cannot see a camera.** It tests opacity, so a camera could hide an
   event while satisfying every ordering assertion. Camera shots now assert
   `staysInFrame` on every marker, with a must-be-named `may_leave_view` exception.
3. **No check tied the shot plan's duration to the composition's.** shot_04 rendered
   12.5s against a planned 13.0s and its closing reveal was truncated mid-fade — with
   every assertion passing. Now checked.

---

# Cycle 3 — mechanism as space

Hypothesis under test, taken from cycle 2's own habit ranking:

> Current visual reasoning treats the frame as a left-aligned orthogonal document page
> rather than as a space in which a technical mechanism occurs.

Benchmark chosen to attack it: **retry storm** — feedback, multiplication, density,
circular causality. Three directions, same semantics, same duration, same six marker
timestamps. Full write-up in [D01 directions.md](videos/D01-retry-storm/directions.md),
validation findings in [VALIDATION_NOTES.md](VALIDATION_NOTES.md).

**Result: hypothesis supported, with a qualification that matters more than the result.**

- **dirB (closed feedback orbit) — kept as hero.** The only direction where the geometry
  is not a choice: the mechanism *is* a cycle, and a cycle laid out left-to-right has to
  lie about where its arrows go. Both ends of the system visibly never change while the
  loop between them saturates from a dotted ring to a solid band. Silhouette distance
  from every other shot in the library: 0.82–1.00, against 0.11–0.51 among the three
  earlier benchmarks.
- **dirA (flow through an aperture) — rejected.** A physical constraint only reads
  against solid mass, and this brand has none; the throat was a 5% luminance difference
  and disappeared. Halton-scattered particles read as noise, not space.
- **dirC (stacked proportional bands) — partially salvaged.** The strongest single frame
  of the three, and structurally a vertical bar chart: it shows the consequence and
  never the loop. Its exact-proportion image is kept for a later consequence beat.

**The qualification:** dirA also escaped the document page and was still the worst of
the three. Leaving the page is necessary and nowhere near sufficient — "not a page" is
not a design.

## Three things the gate did that a human would not have

1. **`motion_frozen` measured the hypothesis.** dirC failed with *"nothing moves within
   #stage between 2.91s and 6.37s"*. A chart has nothing to do between updates; a flow
   and a circuit are always moving. An assertion written to catch a missed entrance
   turns out to be a usable probe for whether a shot is a mechanism or a diagram of one.
2. **It proved a measurement is unreliable, with a formula.** `container_overflow` fired
   19× against the rotated orbit, reporting 1197px inside a 1080px canvas while the true
   geometry is a constant 867px. Cause: `getBoundingClientRect` returns the *unrotated
   box, rotated* — `S·(|cos θ|+|sin θ|)`, up to ×1.414. Predicted 1184.6 at 300°;
   hyperframes reported 1184.6. Not suppressed — `cv gate` now groups repeated warnings
   and annotates this one.
3. **`bounded` was a false guarantee.** Reading the invariant for D01 showed it only
   checked the *final* value, so a run that spiked over the ceiling and came back down
   would pass — which is the shape of an actual outage. Now tracks peak. Third instance
   of the "validator reports success" bug class in this project.

## Gaps found and deliberately not filled

No validator was changed until a prototype made it fail. Two gaps are therefore
recorded and left open, because nothing has failed *because* of them yet:

- **Density has no validator.** Nothing can distinguish deliberately saturated from
  accidentally illegible. Every layout check is about named elements not colliding;
  none is about a population being too dense to read.
- **Contrast checking is blind to non-text marks.** D01's load-bearing information is
  450 coloured dots, and nothing checked any of it. The colours happen to pass; that is
  luck, not verification.

## Habits: what actually moved

`camera_devices: static` is gone as an unconscious default — every shipped shot now
declares a semantic reason. The top habit from cycle 2 — *left-anchored orthogonal
document* — is now measured rather than asserted: **eleven of twelve authored shots are
left-anchored and orthogonal, and dirB is the only one that is neither.**

It was not fixed by adding a curve to a checklist. It was fixed once for one shot,
because that shot's mechanism was a loop.
