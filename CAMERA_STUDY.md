# Camera as technical explanation — R&D cycle 2

`static_camera` showed up as a habit in `cv recall`. The response was not to add
camera moves. It was to ask what a camera can *mean*, run four experiments, keep two
and a half, throw one away, and change what creative memory records so the next
video inherits the reasoning rather than the motion.

Success condition for this cycle was **not** "camera movement was added". It was:
prove two or three ways a camera becomes part of a technical explanation, and get
memory recording *why* a visual decision was made. Both are met.

---

## 1. Audit of the five existing shots

| shot | camera was | why | semantic function? | intentional? | better alternative |
|---|---|---|---|---|---|
| A01 shot_01 | static | never considered — ffmpeg filtergraph, camera was not on the table | no | **no — pure default** | none. Three figures counted onto a fixed page so the viewer can re-read them as one sum; a move would remove a term mid-comparison. Now declared `sequential_arithmetic_reveal`. |
| A01 shot_02 | static | default. I designed three zones and left everything in frame. | partial (zones must coexist) | **no** | `single_actor_to_concurrency` — hold one request, then widen onto the second → **EXPERIMENT A** |
| A01 shot_04 | static | deliberate: same geometry as shot_02 for comparison | **yes** — `preserve_comparison_geometry` | yes, but unnamed | if shot_02 gains a camera this shot *must* gain the same one → **EXPERIMENT D** |
| B01 shot_02 | static | default | no | **no** | `global_to_root_cause` — push into the empty slot as the request passes → **EXPERIMENT C** |
| C01 shot_02 | static | default; the grid seemed to need to be whole | partial, and it has a real cost | **no** | `one_to_many` — open close enough to see one row cost one query → **EXPERIMENT B** |

Two things fell out of the audit worth stating. Only one of five shots had a real
reason for its camera, and that reason had never been written down — so it was
indistinguishable from the four defaults. And the experiments were not chosen to
cover a taxonomy; each one is the answer to a specific defect the audit found.

---

## 2. Experiment B — scale through camera (`one_to_many`) · **KEPT**

`C01/shot_02_cam`, motion `pull_back`, moving only across 3.78–9.40s.

**The defect it fixes.** The static cut cannot do both of its jobs. At scale 1 a row
tick is 2px and a query mark is 20px, so the ONE-row-costs-ONE-query relationship —
the actual mechanism of N+1 — is not legible. Zoomed in, you cannot see 101 of
anything. A static frame has to pick one job and fail the other.

**What the camera does.** Opens at s=2.0 where a single statement visibly costs a
single round trip, then pulls back across the cascade so the count arrives as an
experience. Ends at s=1.0 — never below, because a pull-back past base scale would
push type under the 26px readability floor.

**Result: the clearest win of the cycle.** In the A/B at 1.3s the camera cut shows
one statement and one mark, both large; the static cut shows a 20px square that
reads as noise. At 3.9s the camera cut has four countable marks; static has four
faint dots. From 9.5s the two are identical by design, so nothing is lost at the
payoff.

| | comprehension | hierarchy | novelty | cognitive load | phone readability |
|---|---|---|---|---|---|
| static | fails the mechanism | flat | low | low | poor for first 7s |
| camera | **teaches the mechanism** | one subject at a time | high | low | good throughout |

One correction during review: the first cut put the code line 12px from the canvas
edge. Not clipped — the gate was right that it stayed in frame — but far too tight.
The close scale is now *derived* rather than guessed: 480px of type plus 60px of
margin each side means s = 1080/540 = 2.0 exactly.

## 3. Experiment A — reveal through camera (`single_actor_to_concurrency`) · **KEPT, with a caveat**

`A01/shot_02_cam`, motion `widen`, moving 3.20–4.20s.

**The defect it fixes.** The static cut shows both request sites from frame one, so
the viewer knows there are two writers before the shot has said anything. That gives
the mechanism away for free — and it is not how anyone meets this bug. You read one
request's code path, it looks correct, and in isolation it *is* correct.

**What the camera does.** For three seconds the frame holds exactly one request doing
something unremarkable. Then it widens and there is a second one, already holding the
same number. The reveal is not an element appearing; it is the frame admitting it was
cropped.

**Result: real but local.** Confirmed working — at 3.1s the static cut already shows
two nodes on the boundary, the camera cut one. But the caveat is honest: the camera
only governs the first 4 of 12.5 seconds. After 4.2s the two cuts are identical.

**The generalisable finding:** a reveal camera is worth only as much as the span it
withholds. Here B reads at 3.6s of a 12.5s shot, so the camera had 29% of the shot to
work in. `single_actor_to_concurrency` will pay much better on a story where the
second actor arrives late.

The first version was worse and the A/B caught it: widening at 2.40 opened the frame
a full second before B appeared at 3.62, splitting the reveal into two unrelated beats
— "the frame got bigger", then later "oh, a second request". Moving the widen to
3.20–4.20 puts B's descent *inside* the opening move.

## 4. Experiment C — causality through camera (`global_to_root_cause`) · **REJECTED**

`B01/shot_02_cam`, motion `push_in`. Kept in the shot plan as
`status: experiment_rejected` with its reasons, not deleted.

**The idea was sound and the shot cannot have it.** Two reasons, and the second is the
one that generalises:

1. `may_leave_view` let `#ev-authn` exit the frame, but at s=1.48 it exits
   *partially* — "PASS / token valid" is sliced down the middle at the canvas edge.
   Half a word is worse than the whole word or none of it.
2. **The layout forbids zoom.** B01 spends the full 1080px on three columns: station
   names at x90, the channel at x300–780, verdicts at x820–1060. Any zoom tight
   enough to be a zoom loses a column.

**The finding: whether a shot can take a camera is decided by its layout, not by its
subject.** B01 is a security video with a textbook `global_to_root_cause` story and no
room to tell it that way. C01 and A01 could be zoomed because their close-up content
is gathered at one side; B01 is horizontally committed everywhere.

So B01 shot_02 is now static *for a reason it earned*:
`whole_route_must_stay_visible` — the subject is a comparison between a station that
has a gate and one that does not, and both must be in frame for the absence to mean
anything.

## 5. Experiment D — camera as reference frame (`camera_as_shared_reference_frame`) · **KEPT**

`A01/shot_04_cam`. Not a fourth way of moving a camera; a test of a *consequence* of
the first two.

shot_04 exists to be compared against shot_02: identical geometry, changed mechanism,
so the only thing the viewer can notice is the mechanism. The moment shot_02 acquires
a camera move, that guarantee breaks — a viewer cannot tell whether the frame changed
because the mechanism changed or because the camera did.

So shot_04_cam carries shot_02_cam's move **verbatim** — same scale, same centre,
same timing, same easing. The A/B confirms the match cut survives: at 3.7s both cuts
are mid-widen at identical scale, and the single difference is that one has
`REQUEST B / 100` fading in while the other has `WAITING`. That frame is the whole
comparison in one image.

**The rule this establishes: a camera move is part of the reference frame, so a
comparison pair shares it or the pair stops working.**

**And a second finding, delivered by the gate.** Adding the camera to shot_04
immediately failed: the 700px lock container became 1120px at s=1.6 and its label
left the canvas. A shot authored for one scale is not automatically authorable at
another — **adding a camera is a layout constraint, not a post-process.** Three
positions had to be re-derived before it passed.

---

## 6. What camera did to the validation architecture

Camera broke an assumption in the assertion compiler, and fixing it made the whole
gate stronger.

**`appearsBy` only sees opacity.** Under a world transform an element can be fully
opaque and outside the canvas — so a camera could satisfy every ordering assertion
while hiding the event from the viewer entirely. A camera-driven shot now also
requires that every already-revealed event marker stays inside the frame, with
`camera.may_leave_view` as a per-selector, must-be-named exception. A camera that
moves from consequence to root cause *should* lose the consequence; naming it keeps
that a decision.

**Camera exposed that several of my `staysInFrame` assertions were vacuous.**
`#ledger` is a full-stage container: at scale 1 its box equals the canvas, so "does it
leave the canvas" can never be false. `.site` (`#copyA`/`#copyB`) has only absolutely
positioned children, so its box is 0×0 — a zero-size box at a fixed point also never
leaves. Both had been passing for the wrong reason since cycle 1. They now point at
elements with a real painted box. **Assertions must target painted boxes; a
full-stage wrapper or a 0×0 container asserts nothing.**

**A new gate check.** `cv gate` now reports any shot with no `camera:` block as
*"static by default, not by decision"*. An undeclared camera is not a static camera;
it is nobody having decided.

**A known false positive.** `layout/escaped_container` fires on `#world` in every
camera shot, because the camera transform does move it outside its offset parent. That
is what a camera is. Warning only.

---

## 7. Creative memory now records WHY

Before:

```yaml
camera_devices: [static]
```

After:

```yaml
camera:
  - { shot: shot_01,     motion: static,    semantic_function: sequential_arithmetic_reveal }
  - { shot: shot_02_cam, motion: widen,     semantic_function: single_actor_to_concurrency }
  - { shot: shot_04_cam, motion: widen,     semantic_function: camera_as_shared_reference_frame }
```

`cv recall` now tallies **semantic functions**, and says so explicitly:

```
camera reasoning: <fn> ×3
  same visual ARGUMENT reused — that is the repetition worth attacking, not the motion.
camera motions: static ×4 — only a habit if the reasons repeat too
undeclared camera: A01/shot_03, A01/shot_05
  these are static because nobody decided, which is the habit itself.
```

Two motions that look alike but argue differently are not repetition. The same
argument reused is, whatever it looks like. And `UNDECLARED` is flagged in red,
because an unmade decision is the habit in its purest form.

Memory also now records only what **shipped** — a superseded static original, a
planned shot and a rejected experiment are records elsewhere. Writing intentions into
memory would teach the next video habits this one did not have.

---

## 8. TOP 5 creative habits — ranked

From all nine authored shots in `creative_memory/gallery.jpg`. Ranked by how much
each one determines that every frame looks like every other frame. Camera is no
longer number one, because camera has now been attacked.

### 1. Left-margin anchoring — 9/9 shots
Every shot begins its content at x≈90–120 and flows rightward. Not one uses the right
margin, centred mass, right alignment, or a full-bleed edge. **This is the strongest
determinant of frame silhouette in the whole system** — it is why the variety
diagnostic needed normalising before it could see anything. A01 anchors at 120, B01's
labels at 90, C01 at 100. The channel is starting to look like a left-aligned
document, and that is a typographic default, not a decision.

### 2. One reveal grammar — 9/9 shots
Everything that appears does so as `opacity 0→1` plus a 14–20px y-offset. No masks, no
wipes, no `clip-path` reveals, no scale-in, no draw-on except a rule's `scaleX`, no
reveal that is itself informative. The *device* for "new information exists" is
identical across three unrelated mechanisms.

### 3. Orthogonal-only geometry — 9/9 shots
Verticals, horizontals and grids. No diagonal, no curve, no circle, no radial, no
non-grid topology. Defensible for ledgers and routes; indefensible as a universal.
Any story about a graph, a cycle, a retry loop or a distribution will have to fight
this to get drawn at all.

### 4. Zero depth layering — 9/9 shots
Every element sits on one plane. Colour carries hierarchy, but nothing recedes:
no foreground/background separation, no occlusion, no context layer held at low
opacity behind an active one. Brand forbids shadows and glow — correctly — but depth
does not require either; opacity layering and scale would do it.

### 5. Typography is never the subject — 9/9 shots
All type is either a small-caps label or a monospace value. The brand has a 200px
hero size and it has only ever been given to a *number*. No kinetic type, no sentence
used as structure, no word carrying a shot. For a channel about mechanisms this is a
real gap: some mechanisms are best explained by a word changing.

**Dropped to #6: static camera.** 2 of 9 shots now carry a camera with a declared
semantic function; of the shots that shipped, none is `UNDECLARED`. The habit is no
longer unconscious, which was the actual problem.

### What to attack next, and how

Not by adding one of each. Habits #1 and #3 are the same underlying reflex — *the
frame is a left-aligned orthogonal document* — and the honest test is a single shot
whose subject genuinely is not documentary: a retry storm, a fan-out graph, a cycle.
If that shot comes out left-anchored and orthogonal, the reflex is confirmed and
worth attacking directly. Habit #5 has a natural home too: shot_03's "code becomes
execution" is exactly where a word, not a number, should carry the frame.

---

## 9. Where A01 stands, by communication need rather than shot count

Not "finish A01 to six shots". The question is what the story still needs.

| # | need | status | reasoning |
|---|---|---|---|
| 01 | symptom — the arithmetic is impossible | **shipped** | creates the question |
| 02 | mechanism — a read is a duplication | **shipped** (camera) | answers it |
| 03 | which line of *your* code does it | **planned, needed** | without it the video is theory, and this audience needs the line |
| 04 | fix 1: the lock | **shipped** (camera) | |
| 05 | fix 2: optimistic | **planned, needed** | the *pair* is the content; one fix alone reads as "the answer" instead of a trade-off |
| 06 | detection signal | **planned, needed but short** | "you will not see it in your error log, you will see a total that drifts" is real information; ~8s, not 9.5s |

That is six because six needs were found, and each is written down in the shot plan
next to the shot it justifies. Shots 03, 05 and 06 are marked `status: planned` with
their reason inline, so `cv recall` stops counting them as things this video did.
