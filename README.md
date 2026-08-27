# creative-video

A creative runtime for technical explainer video — vertical, 60–90s, for engineers with
a few years behind them.

It contains **no scene types, no composition presets and no templates**. It contains a
semantic model that can be proved, a validation gate that bites, a review loop you can
look at, and memory of what has already been done. The creativity lives in the shots.

```
Correctness lives in a semantic model.  Composition lives in code.
The two are joined by machine-checkable assertions that mention no coordinates.
```

Read [ARCHITECTURE.md](ARCHITECTURE.md) for how, [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md)
for the rules, [CRITIC_REPORT.md](CRITIC_REPORT.md) for what went wrong and got redesigned,
[CAMERA_STUDY.md](CAMERA_STUDY.md) for how a camera becomes part of a technical
explanation plus the ranked list of creative habits, and [VALIDATION_NOTES.md](VALIDATION_NOTES.md)
for what breaks in validation once the frame stops being a document.

---

## Setup

```bash
npm install                     # yaml + hyperframes
node tools/fetch-fonts.mjs      # pinned IBM Plex TTFs, for engines freetype can reach
```

Needs Node 22+, ffmpeg on PATH, and Chrome (HyperFrames fetches a headless shell on
first use). `npx hyperframes doctor` checks the lot.

## The loop

```bash
node tools/cv.mjs recall                     # what have we already done? what are our habits?
node tools/cv.mjs sem     A01-lost-update    # replay the mechanism. does it reproduce the bug?
node tools/cv.mjs assert  A01-lost-update    # semantics -> index.motion.json + MARKERS.txt
#   ... author videos/A01-lost-update/shots/shot_02/index.html — any composition at all
node tools/cv.mjs gate    A01-lost-update    # lint + runtime + layout + motion + contrast
node tools/cv.mjs snap    A01-lost-update    # hero frames + per-shot contact sheet
node tools/cv.mjs sheet   A01-lost-update    # one frame per shot, tiled
node tools/cv.mjs variety A01-lost-update    # silhouette similarity (diagnostic only)
node tools/cv.mjs gallery                    # every shot of every video — the variety surface
node tools/cv.mjs render  A01-lost-update
node tools/cv.mjs compose A01-lost-update    # -> output/final.mp4
node tools/cv.mjs fingerprint A01-lost-update # -> creative_memory/
```

`cv ab <video> <a> <b>` puts two shots side by side at identical timestamps — the only
way "did this actually help?" is answerable. `cv onion <video> <shot> <selector>` renders
an onion-skin motion diagnostic when a single element's path needs checking.

## What is in here

| Benchmark | Mechanism | Hero's spatial system | Hero's camera |
|---|---|---|---|
| **A01** lost update | two writers, one stale read | **zones** — hairlines dividing stored / in flight / the reckoning | widen · `single_actor_to_concurrency` |
| **B01** tenant boundary | authenticated ≠ authorised | **a route** — one channel, stations along it, one of them missing | static · `whole_route_must_stay_visible` |
| **C01** N+1 | one list, a hundred round trips | **an emitter and a field** — code above, accumulation below | pull_back · `one_to_many` |
| **D01** retry storm | the load is the failure | **a circuit** — a closed loop that fills while both its ends stay constant | static · `orbit_is_the_frame` |

Nine authored shots (including the static originals kept for A/B), two engines
(HyperFrames + ffmpeg), `cv gate` clean on all. `creative_memory/gallery.jpg` is the
evidence: nine different visual structures, one brand.

Every shot declares a camera — including the static ones, which name the reason they
are still. A shot with no `camera:` block is reported by `cv gate` as *"static by
default, not by decision"*.

## The two guarantees worth knowing about

**1. A video cannot narrate a bug its own event log does not reproduce.**

`semantics.yaml` declares state, events and invariants; `expect.violations` names what
the story claims breaks. `cv sem` replays and compares — both directions.

```
FABRICATION: story claims invariant "no_lost_write" is violated, but replay
satisfies it. The event log does not reproduce the bug it describes.
```

The simulator *derives* lost writes, read overlaps, lock contention, authorisation gaps
and work amplification. Nobody declares them.

**2. Correctness never touches a coordinate.**

For each semantic event the shot dramatises, the composition must contain an element
`id="ev-<eventId>"` visible at that moment. What the element *is* is free — the moving
object, a tick, a node, one square in a grid of a hundred. `cv assert` compiles the
event order into `before(...)` assertions, so a shot that reveals the mechanism out of
order fails the gate however good it looks, and a shot that reveals everything at once
fails immediately.

## Adding a video

1. `videos/<id>/semantics.yaml` — the mechanism, its `assumptions`, its `expect.violations`.
   Schema: [semantic/schema/SEMANTICS.md](semantic/schema/SEMANTICS.md).
2. `cv sem <id>` until the replay agrees with the story.
3. `videos/<id>/directions.md` — at least three approaches for any important shot,
   differing in *mental model*, scored, with the rejected ones kept.
4. `videos/<id>/shot_plan.yaml` — purpose, visual question, duration, engine, what must
   stay in frame.
5. `cv assert <id>`, then author each shot. Read `MARKERS.txt`; ignore everything else
   about how it should look.
6. `cv gate` → `cv snap` → look at it → redesign → repeat.
7. `cv render` → `cv compose` → `cv fingerprint`.

Adding a story requires **no change to the core** unless it needs a genuinely new
invariant kind.

## Authoring rules that are not negotiable

- Every visual state is a tween on a **paused** GSAP timeline registered at
  `window.__timelines[id]`. That is where determinism comes from.
- No `rAF`, no `Date.now`, no `Math.random`, no network.
- **Never mutate `textContent` from a callback** — a callback does not re-fire on a
  seek. Changing a displayed value means stacked elements and opacity.
- Any element an assertion targets needs a real box. A wrapper whose children are all
  absolutely positioned collapses to 0×0 and counts as never visible.
- Brand tokens live between the `@brand` markers; `node tools/brand.mjs` syncs them.
  Never hand-edit them in a shot.
