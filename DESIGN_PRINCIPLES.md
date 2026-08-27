# Design principles

Visual and cognitive rules for this channel. Rules marked **HARD** are checked by
`cv gate` or `cv sem` and are not taste. Everything else is craft, and craft is
allowed to be broken when the material demands it — but not by accident.

---

## 1. Technical truth

1. **HARD — the mechanism must replay.** The event log in `semantics.yaml` must
   actually reproduce the behaviour the narration claims. `expect.violations` is
   checked in both directions: claimed-but-absent is a fabrication, present-but-unclaimed
   is a wrong model.
2. **HARD — event order is checked, not trusted.** Consecutive semantic events compile
   to `before(...)` assertions against first visibility in the rendered composition.
3. **No invented measurements.** No latency figures, no throughput numbers, no
   "production" statistics. C01 shows the *count* of round trips (101, derived from the
   model) and expresses cost relationally — "101 queries, 2 would do" — because the
   count is true and a millisecond figure would not be.
4. **Assumptions are stated in the model.** `assumptions:` is part of `semantics.yaml`.
   A01's lost update only happens because the writes set an absolute value; that
   condition is written down, not glossed. If an in-place delta would have been safe,
   the model says so.
5. **Reference data is separated from simulated data.** `facts:` (who owns invoice
   8842) is declarative and explicitly not reasoned about. Blurring the two would let
   a prose field masquerade as a proof.

## 2. Viewer comprehension

6. **HARD — one new thing at a time.** Enforced structurally: the `before` chain fails
   if two events first become visible simultaneously. A frame that reveals everything
   at once cannot pass.
7. **Evidence before interpretation.** Draw the thing, then name it. B01 puts the empty
   gate slot on screen in the first second and only says `NEVER ASKED` at 12.1s — ten
   seconds for the viewer to notice it themselves. C01 fills the field before printing
   `101`.
8. **Visuals give evidence; narration gives interpretation.** Never set the narration
   as type. `REQUEST B · 100 · read at v0` sitting beside a row that reads `90 v1` is
   evidence. "B's value is stale" would be a caption.
9. **HARD — text floor 26px** at 1080×1920. Below that it is unreadable on a phone. My
   own first cut used 22px for the `read at v0` basis line and broke my own rule.
10. **HARD — WCAG AA contrast.** Checked. `--ink-ghost` (1.8:1) is a *structural* token
    and must never carry text; it failed the gate twice before I learned that.
11. **Hold the final state.** The last important frame stays up ≥1s.
12. **Duration should be honest about effort.** C01's cascade runs 5.5 seconds because
    a hundred round trips ought to feel like a hundred round trips. Speeding it up
    would misrepresent the cost.

## 3. Visual hierarchy

13. **One focal point.** Ask of every frame: what is the one thing to look at?
14. **Demote as you displace.** When a value is superseded it shrinks *and* recolours
    *in the same tween*. Clearing it sideways at full size — which I shipped first —
    made the old value the largest thing in frame for 0.4s, so the eye read the stale
    number as the answer.
15. **Colour is semantic, channel-wide.** `--authoritative` ochre = the value of record.
    `--stale` vermilion = derived from something that has moved. `--lost` grey = work
    discarded. `--boundary` teal = a trust or ownership edge. `--pressure` = accumulation.
    `--counterfactual` = what should have existed. A colour never means two things.
16. **Structure that carries meaning gets brightness.** B01's channel rails were
    `--rule` and read as two faint scratches — the shot's entire spatial premise,
    nearly invisible. Load-bearing structure gets `--rule-bright`.
17. **HARD — no accidental overlap**, and never mark an overlap intentional before you
    have looked at a snapshot of it. I marked the A01 value crossfade
    `data-layout-allow-overlap` from reasoning alone; the snapshot showed two 200px
    figures stacked into mush. The mark was a lie told to the gate.

## 4. Composition

18. **Use the whole frame.** 1080×1920 is tall. The first hero cut used roughly the top
    55% and read as a 16:9 diagram floating in a phone. Both A01 and C01 needed a
    full rescale, not a nudge.
19. **The caption band (below y≈1574) stays clear.** Checked via `--caption-zone`.
20. **Every shot gets its own spatial system, and the system means something.**
    - A01 — **zones**: two hairlines divide stored / in flight / the reckoning. Reads
      descend through the boundary; writes press up against it. Nothing crosses
      invisibly.
    - B01 — **a route**: one channel, stations along it. The subject is what is (and
      is not) mounted across the path.
    - C01 — **an emitter and a field**: source text above, accumulation below.
    These are not three styles of the same layout. They are three different claims
    about what the frame is.
21. **No default chrome.** No permanent header, footer, rail, stage rectangle or title
    card. None of the three heroes has one. Brand is carried by type, colour semantics,
    stroke language and motion timing.
22. **Structure early, content progressively.** Rules and category labels can appear in
    the first second — they anchor the frame while it is still sparse. C01 names both
    `ROWS RETURNED` and `ROUND TRIPS` before either has anything in it, so the viewer
    knows what comparison is coming.
23. **Beware the font metric box.** A 200px numeral's rect extends ~21px above and ~21px
    below its layout box; a 96px one about ~8px. Space to the *metric* box, not the
    font size.

## 5. Motion

24. **Every important motion answers a question** — what duplicated, what went stale,
    what was overwritten, what disappeared, what accumulated, what waited, what crossed
    a boundary. A01's rails answer "where did this copy come from". C01's cascade
    answers "how many". Motion that answers none of these is decoration and gets cut.
25. **HARD — deterministic motion only.** Every visual state is a tween on a paused
    timeline. No `rAF`, no `Date.now`, no `Math.random`, no network. **And no
    `textContent` mutation from a callback** — a callback does not re-fire on a seek, so
    changing a value means stacked elements and opacity, always.
26. **Never linear.** `power3.out` for reveals (fast attack, long settle), `power2.inOut`
    for travel. Nothing bounces, nothing glows, nothing pulses for attention.
27. **HARD — liveness.** `keepsMoving` fails a shot with a fully static window beyond
    its declared ceiling. Holds are for reading, not for stalling.
28. **Watch the handoff frame.** A value left the row at 6.98s and its replacement
    arrived at 7.06s, so for two frames the row had no value at all. A flicker a static
    snapshot barely registers and the eye catches immediately.
29. **A device's job ends.** A01's read rails stay after their write lands, and read as
    leftover furniture in every later frame — so each now fades when its write commits.

## 6. Metaphor

30. **Structural, not childish.** A read is a *duplication*. A lock is a *closure of the
    boundary*. Ownership is a *tag that must match*. Amplification is *accumulation you
    can count*. Each of these behaves the way the mechanism behaves.
31. **Return to accuracy quickly.** The metaphor buys intuition, then the frame goes back
    to real values, real versions, real identifiers.
32. **Code becomes execution.** Not a decorative code card with a window chrome and
    traffic lights. C01's statement *emits* the query it costs and the rows it returns,
    with deliberately unlike glyphs for the two — because conflating cost with result is
    exactly the misconception.

## 7. Repetition

33. **Repetition is allowed when it carries the meaning.** A01 shot_04 reuses shot_02's
    geometry exactly — same ledger slot, same rails, same rhythm — so the only thing the
    viewer can notice changing is the mechanism. The match cut *is* the comparison.
34. **Declare it.** Intentional repetition goes in `fingerprint.intentional_repetition`
    with a reason, so the variety diagnostic's flag can be answered rather than
    designed away.
35. **`cv variety` is a diagnostic, never a target.** Do not distort a good frame to
    improve a number. And do not trust the number blindly: the first implementation
    reported every pair as identical because it was measuring darkness rather than
    structure.

## 8. LLM default aesthetics — the actual ban list

Checked by eye every review. None of these appears in the three benchmark heroes:

rounded cards · purple/blue gradients · glowing nodes · fake HUDs and sci-fi panels ·
symmetrical dashboards · meaningless particles · everything centred · a shared stage
rectangle · boxes-connected-by-arrows as the default answer · decorative code blocks ·
type that restates the narration · drop shadows · glassmorphism · motion added only to
avoid a static frame

They are not forbidden forever. They are forbidden as *defaults*. An outline appears on
B01's request block because a request in flight is an object and needs an edge — that is
a decision, not a reflex.

## 9. Priority order when these conflict

1. Technical truth
2. Viewer comprehension
3. Visual hierarchy
4. Storytelling
5. Visual originality
6. Brand consistency
7. Production reliability
8. Reusability

Applied for real: A01's hero originally ended with the lost `90` detaching and falling
out of frame — a better *device* than what shipped. It lost to legibility, because
making it read required a long transit that crossed three other elements. Comprehension
(2) beat originality (5). The falling-90 idea is recorded in `directions.md` rather than
discarded.

---

## 10. Camera (added cycle 2 — see CAMERA_STUDY.md)

36. **A camera moves only when the movement is the information.** Motion that merely
    varies the frame is decoration with a bigger budget. Every camera move names a
    semantic function in the shot plan: `one_to_many`, `single_actor_to_concurrency`,
    `global_to_root_cause`, `outside_to_inside`, `local_to_global`,
    `preserve_comparison_geometry`, and so on.
37. **HARD — a camera must be declared, even when static.** `cv gate` reports any shot
    without a `camera:` block as *"static by default, not by decision"*, and
    `cv fingerprint` writes `UNDECLARED` into memory where `cv recall` flags it red.
    Static is a good answer — a comparison needs a fixed frame, a reader needs a still
    one — but it has to be an answer.
38. **Memory records the reason, not the motion.** Two moves that look alike but argue
    differently are not repetition. The same argument reused is, whatever it looks like.
39. **HARD — a camera may not hide an event.** `appearsBy` only tests opacity, so a
    camera could satisfy every ordering assertion while pushing the event off screen.
    Camera shots additionally assert `staysInFrame` on every revealed marker;
    `camera.may_leave_view` is the exception and must name each selector.
40. **Never crop an element — push it fully out or keep it fully in.** Half of "PASS"
    at the canvas edge is worse than all of it or none of it. This alone killed the
    B01 camera experiment.
41. **A pull-back ends at scale 1.0, never below.** Below base scale, type goes under
    the 26px floor. "Wide" is the base frame.
42. **Derive the close scale from content, not taste.** The tightest zoom is the one
    that still leaves real margin beside the widest thing that must be legible — and
    whose bottom edge stays clear of the caption band. A camera is subject to the
    layout rules, not exempt from them.
43. **A camera move is part of the reference frame.** A comparison pair shares its
    camera verbatim or the match cut stops being a match cut.
44. **Adding a camera is a layout constraint, not a post-process.** A shot authored for
    scale 1 is not automatically authorable at scale 1.6. Whether a shot can take a
    camera at all is decided by its layout: a composition that spends the full canvas
    width cannot be zoomed without losing a column.
45. **Time the move to the event, not to the edit.** A reveal camera that opens before
    there is anything to reveal splits one beat into two unrelated ones.
46. **A reveal camera is worth the span it withholds.** If the withheld thing arrives
    at 29% of the shot, the camera governs 29% of the shot.
47. **Linear is correct for a camera tracking a constant-rate process.** The one
    place the no-linear rule is wrong: an eased pull-back across a steady accumulation
    would imply the cost was accelerating, and it is not.
