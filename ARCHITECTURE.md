# Architecture

A creative runtime for technical explainer video. It contains no scene types, no
compositions and no templates. It contains a semantic model that can be *proved*, a
validation gate that bites, a review loop you can actually look at, and memory of
what we have already done. The creativity is supposed to live in the shots.

---

## The one idea

> **Correctness lives in a semantic model. Composition lives in code. The two are
> joined by machine-checkable assertions that mention no coordinates.**

Everything else follows from that sentence.

A shot is free-form HTML/CSS/SVG/JS — any composition, any metaphor, any geometry.
What it is *not* free to do is misrepresent the mechanism. The mechanism is declared
separately, replayed by a simulator, and compiled into assertions the rendered
composition must satisfy. Two utterly different visual projections of the same
mechanism pass the same assertions. A beautiful shot that reveals events in the
wrong order fails.

---

## Data flow

```
story (prose, human)
        │
        ▼
semantics.yaml ──────────► cv sem       replay the event log.
  actors, state,                        Does it actually reproduce the bug
  events, invariants,                   the story claims? If not: FABRICATION.
  expect.violations
        │
        ▼
shot_plan.yaml ──────────► cv assert    compile semantics + shot timing into
  purpose, visual question,             shots/<id>/index.motion.json
  semantic event subset,                and a MARKERS.txt brief
  engine, validation
        │
        ▼
shots/<id>/index.html ───► cv gate      lint + runtime + layout + MOTION + contrast
  bespoke code, any                     (HyperFrames `check --json`)
  composition at all
        │
        ▼
              ┌────────► cv snap        hero frames + per-shot contact sheet
              ├────────► cv onion       onion-skin motion diagnostic
              ├────────► cv sheet       one frame per shot, tiled
              ├────────► cv gallery     every shot of every video, tiled
              └────────► cv variety     silhouette-similarity matrix (diagnostic)
        │
        ▼   (critic reads the images, redesigns, loops)
        │
        ▼
cv render ──► cv compose ──► output/final.mp4
        │
        ▼
cv fingerprint ──► creative_memory/<id>.yaml ──► cv recall (before the next video)
```

---

## Upstream boundary — how a Content Package enters, and how it does not

The diagram above starts at "story (prose, human)". That is not the real input. The real
input is a **Content Package** produced by a separate Content Engine, whose contract is
`packages/<id>-<slug>/content-package.yaml` in that repo. E01 was built from package `002`.

**That repo already owns the handoff and owns it well.** The package is declared as the API
contract on both sides of its docs, it has a JSON schema with a `schema_version` const, and
`tools/validate-package.mjs` enforces a hard ban on visual decisions — `camera`, `scene`,
`storyboard`, `typography`, `keyframe` are errors; `shot`, `frame`, `layout`, `màu` are
warnings that must be declared as `lint_exceptions` with a written reason. All four packages
validate clean. Each package directory holds exactly one file. There is nothing to strip and
no second copy worth making: an `exports/` mirror on that side would only create a second
source of truth for one artifact.

**This repo, by contrast, has no ingestion at all.** Grepping creative-video for
`content_package`, `content-package` and `contentPackage` returns zero hits. E01 arrived by
being pasted into a conversation; `semantics.yaml` and `shot_plan.yaml` were authored from it
by hand, and no copy of the source was kept.

The consequence is measured, not hypothetical:

    videos/E01-not-sargable/output/final.mp4      2026-08-24 11:14:59
    …/packages/002-index-defeated-by-function/
      content-package.yaml                        2026-08-24 13:39:02

The source package changed 2h24m after the video was composed. Nothing here can detect that,
and **what changed is unknowable from this side** — because no snapshot was kept, there is
nothing to diff against. That is the whole defect in one line. Note also that the package
carries no `revision` field, so revision is not expressible in the contract; only content
identity is.

What ingestion does, now that it is built (`cv import`, `cv provenance`):

- a frozen, read-only snapshot at `videos/<video-id>/content-package.yaml`
- `videos/<video-id>/PROVENANCE.yaml` recording package id, slug, `schema_version`, absolute
  source path, **sha256 of the bytes imported**, and the import timestamp
- refusal to import unless the **producer's own** validator exits 0 — this repo does not get
  to decide whether a package is valid; it uses the sending side's ruler
- a staleness check comparing the recorded sha256 against the source file

sha256 is the load-bearing part. `schema_version` detects a change of *contract*;
a hash detects a change of *content*. E01 needed the second one and had neither.

Two boundaries this must not cross. This repo never writes into the Content Engine repo —
not an export directory, not a status field, not a marker. And whether a package is "ready to
hand off" is that repo's concern; its own operating rules classify a change to the Visual
Engine contract as an owner decision, not an agent one.

Two behaviours are load-bearing and were verified rather than assumed. A package whose
validator exits non-zero is refused and **nothing is written** — no video directory, no
snapshot, no provenance. And a second import over an existing snapshot refuses instead of
overwriting, because a snapshot that can be quietly replaced is not evidence.

`retroactive: true` exists for videos built before ingestion. Their consumed bytes were never
recorded and cannot be recovered, so `consumed_sha256` is `unknown` and `cv provenance` can
never answer CURRENT for them. Writing today hash there would have made E01 report CURRENT,
which would be false. E01 reports SOURCE_CHANGED on the evidence of the timestamps alone.

---

## Responsibilities

| Component | Owns | Explicitly does not own |
|---|---|---|
| `semantic/lib/simulate.mjs` | replaying events; deriving lost writes, read overlaps, lock contention, authorisation gaps, work amplification; judging invariants | anything visual |
| `semantic/lib/compile-assertions.mjs` | turning semantic order into `*.motion.json` | what the markers look like |
| `videos/<id>/semantics.yaml` | the mechanism, its assumptions, and what the story claims breaks | timing in seconds, layout |
| `videos/<id>/shot_plan.yaml` | purpose, visual question, duration, engine, what must stay in frame | how the shot looks |
| `videos/<id>/shots/<id>/` | **all** composition and choreography — bespoke, isolated, disposable | correctness of the mechanism |
| `brand/tokens.css` + `brand/fonts/` | typography, colour *semantics*, stroke language, motion timing | geometry, layout, composition |
| `tools/cv.mjs` | one deterministic command surface | making creative decisions |
| `creative_memory/` | what we have already done, so we can notice habits | forbidding repetition |

The asymmetry is deliberate. The parts that can be wrong in a *checkable* way are
centralised. The parts that can only be judged by eye are pushed into isolated
per-shot directories where they can be thrown away without touching anything else.

---

## Semantic correctness strategy

### 1. Replay, don't assert

`semantics.yaml` declares state, an event log, and invariants. `cv sem` replays it.
Every field carries a version, so the simulator *derives* facts the author never
stated:

```
0.05  req_a  read   row.stock=100 v0
0.22  req_b  read   row.stock=100 v0
0.55  req_a  write  row.stock=90  v1
0.82  req_b  write  row.stock=80  v2   <- based on a stale read
lost write   req_a's row.stock=90 overwritten by req_b
overlap      req_a & req_b hold concurrent open reads of row.stock
```

Nobody wrote "this is a lost update". The replay found it.

### 2. The anti-fabrication gate

`expect.violations` names the invariants the story is *about* breaking. `cv sem`
compares that claim against the replay and fails both ways:

- claimed but not reproduced → `FABRICATION: story claims invariant "X" is violated,
  but replay satisfies it. The event log does not reproduce the bug it describes.`
- reproduced but not claimed → `UNDECLARED VIOLATION` (the mechanism is wrong, or the
  story is understating it).

Verified by deliberately breaking a model: moving B's read to *after* A's write made
all three invariants hold, and the gate refused it. A video whose events do not
reproduce its own narration cannot get through.

### 3. Invariant kinds

Four families, each a real formal property, each chosen because a benchmark needed it
— not because a taxonomy wanted completeness:

| kind | catches | used by |
|---|---|---|
| `final_state` | outcome arithmetic | A01 |
| `no_lost_write` | a write computed from a version that has since moved | A01 |
| `mutual_exclusion` | interleaved read-modify-write windows | A01 |
| `authorized_access` | an access with no passing check for *that subject and that resource* | B01 |
| `bounded` | queue depth / field ceiling | (available) |
| `work_ratio` | op count exceeding its budget — the N+1 detector | C01 |

`facts:` holds declarative reference data (who owns which record) that the visual
layer may use and the simulator deliberately does **not** reason about.

### 4. Semantics carry order, not seconds

Event `t` is normalised 0–1. The shot plan's `duration` and `t_window` project it into
seconds. The mechanism's *order* is the truth; how long it gets on screen is a
directorial decision. Change a shot's length and the assertions recompile.

---

## The marker contract (semantics → pixels, without coordinates)

For every semantic event a shot dramatises, the composition must contain an element
`id="ev-<eventId>"` that becomes visible at that event's moment.

What the element *is* is entirely free — the travelling object, a tick, a value
label, a node on a rule, one square in a grid of a hundred. The contract constrains
**instrumentation**, never composition.

`cv assert` emits, per shot:

- `appearsBy(#ev-X, t+0.3)` for every event — nothing may be late.
- **`before(#ev-A, #ev-B)` for consecutive events** — the load-bearing assertion. It
  compares *first visibility*, so it simultaneously forbids revealing everything at
  once and forbids revealing the mechanism out of order.
- `staysInFrame(...)` for whatever the shot plan declares as its persistent subject.
- `keepsMoving(...)` — liveness, catching a frozen shot or a seek that lands past the
  motion.

Plus `MARKERS.txt`, the brief an authoring agent actually reads:

```
  #ev-a_read   @ 1.239s   req_a read  — A sees 100
  #ev-b_read   @ 3.153s   req_b read  — B sees the same 100
  #ev-a_write  @ 6.869s   req_a write — A commits 90
  #ev-b_write  @  9.91s   req_b write — B commits 80 over A
```

**Known limitation.** The vocabulary has `appearsBy` but no `appearsAfter`, so an
element visible from t=0 trivially satisfies its own `appearsBy`. The `before` chain
is what actually holds the line; a static diagram showing everything at once fails it
immediately (`motion_out_of_order: both appear at 0s`). Worth adding a real
`notBefore` if we ever hit a case the chain misses.

### Camera makes "on screen" mean something else

`appearsBy` only tests opacity. Under a world transform an element can be fully
opaque and outside the canvas, so a camera could satisfy every ordering assertion
while hiding the event from the viewer entirely. When a shot declares `camera:`, the
compiler therefore also emits `staysInFrame` for every event marker, with
`camera.may_leave_view` as a per-selector exception that has to be named. A camera
moving from consequence to root cause *should* lose the consequence; naming it keeps
that a decision rather than an accident.

Two things this exposed, both recorded in CAMERA_STUDY.md:

- **Several `staysInFrame` assertions were vacuous.** A full-stage container's box
  equals the canvas, so it can never leave it; a wrapper whose children are all
  absolutely positioned has a 0×0 box, which also never leaves. Both had been passing
  for the wrong reason. **Assertions must target elements with a real painted box.**
- **`cv gate` now reports a shot with no `camera:` block** as "static by default, not
  by decision", and `cv fingerprint` writes `UNDECLARED` into memory where `cv recall`
  flags it. An undeclared camera is not a static camera; it is nobody having decided.

---

## Engine selection

Per shot, not per project. Chosen from what the shot needs, and the choice is
recorded in `shot_plan.yaml`.

**HyperFrames is the default creative runtime**, on evidence rather than preference:

- **Determinism by construction.** A composition registers a *paused* GSAP timeline
  on `window.__timelines`; the renderer seeks it frame by frame. Any frame is a pure
  function of `t`. This also dictates a real authoring rule: never mutate text in a
  callback, because a callback does not re-fire on a seek. Stacked elements plus
  opacity is the only safe way to change a value.
- **The validation surface is the one we needed anyway.** `check --json` covers most
  of the rendering-correctness rules natively — overflow, off-frame, overlap, unpainted
  text, WCAG contrast, caption-band intrusion — plus the `*.motion.json` sidecar the
  marker contract compiles into.
- **Unbounded composition space.** Plain HTML/CSS/SVG/JS. The C01 hero builds 201
  elements in a loop; no template library would have offered that shape.
- **Fast review.** Snapshot pass ≈ 18s versus ≈ 70s for a full render, so design
  iteration never waits on encoding.

**ffmpeg** is a real second adapter, not a token one. A01 shot_01 is three numerals,
three labels and one rule: no layout to solve, nothing a DOM buys. It renders in about
**one second** versus ~70 for the browser path, from a filtergraph where every value
is a closed form in `t`.

Two things made the multi-engine claim honest rather than nominal:

1. **Brand crosses the boundary.** freetype cannot read the woff2 HyperFrames fetches,
   so `tools/fetch-fonts.mjs` pins real IBM Plex TTFs from `IBM/plex@v6.4.0`. Same
   ground, same typeface, same colour semantics in both engines.
2. **Output params match exactly** — h264 High, level 40, yuv420p, 30fps, timebase
   1/15360 — so `cv compose` concatenates across engines with `-c copy`, losslessly.

**Manim / Three.js / Remotion** — adapter contract defined (`engine:` + a
`build.mjs`-style entry writing `render.mp4`), none implemented. Manim is
specifically deferred rather than skipped: this machine has Smart App Control on,
which blocks unsigned DLLs, so the Python/ML stack must run under WSL. That is a real
cost to pay only when a shot genuinely needs exact formal geometry, and none of the
three benchmarks did.

---

## Validation strategy

Layered, cheapest first, each layer catching what the previous cannot:

| Layer | Command | Catches |
|---|---|---|
| semantic | `cv sem` | fabricated mechanisms, wrong arithmetic, undeclared violations |
| structural | `cv gate` (lint) | missing timing attributes, unregistered timelines, transform conflicts |
| runtime | `cv gate` (runtime) | JS errors, missing assets |
| layout | `cv gate` (layout, `--at-transitions`) | overlap, overflow, off-frame, unpainted text, escaped containers |
| **motion** | `cv gate` (motion sidecar) | late entrances, wrong event order, drift off-canvas, frozen shots |
| perceptual | `cv gate` (contrast) | WCAG AA failures, caption-band intrusion |
| human | `cv snap` / `sheet` / `gallery` / `onion` | everything above still passing while the shot is bad |

### The gate earned its keep

Real defects it caught that I would have shipped:

- A 200px numeral's *metric* box reaches ~21px above its layout box; the row label was
  touching it. Invisible in a snapshot, obvious to `content_overlap`.
- `color: transparent` + `-webkit-text-stroke` — my outlined "70" would not have
  painted at all (`text_not_painted`).
- `--ink-ghost` at 1.8:1 used as body text, twice, in two different videos.
- Two rail wrappers with only absolutely-positioned children collapsed to 0×0 and
  therefore "never reached visible opacity" — a render-vs-preview class of bug that no
  still frame reveals.
- A01 shot_04 shared one element between `b_lock` and `b_read`, two events six seconds
  apart, so the gate reported B as having "read" at 3.3s. That was a genuine semantic
  error in my composition, found by an assertion compiled from the model.

### The escape hatch, used correctly and incorrectly

`data-layout-allow-overlap` marks intentional layering. I applied it to the value
crossfade *before looking at a snapshot*, and the snapshot then showed the overlap was
genuinely unreadable — two 200px figures stacked. The mark was wrong; the design was
wrong. It got redesigned (the departing value now clears sideways while shrinking).
The rule this produced is in DESIGN_PRINCIPLES.md: **never mark an overlap intentional
before you have looked at it.**

---

## Creative-memory strategy

Generative code repeats itself as readily as a template library does — LLMs have
habits. So each finished video writes a fingerprint (`cv fingerprint`) and the next
video reads them first (`cv recall`), which tallies devices across recent videos and
flags any that appear in *all* of them:

```
habits across the last 3  (a device in every recent video is a habit until proven semantic)
  camera_devices: static
```

That flag is a question, not an instruction. "Hairlines in all three" is brand and
should stay; "static camera in all three" was a real habit, and cycle 2 attacked it.

Camera specifically is stored as a **reason**, not as a primitive:

```yaml
camera:
  - { shot: shot_01,     motion: static, semantic_function: sequential_arithmetic_reveal }
  - { shot: shot_02_cam, motion: widen,  semantic_function: single_actor_to_concurrency }
```

`cv recall` tallies semantic functions rather than motions, because two moves that
look alike but argue differently are not repetition — the same argument reused is,
whatever it looks like. Memory also records only what **shipped**: a superseded static
original, a planned shot and a rejected experiment are records elsewhere, and writing
intentions into memory would teach the next video habits this one did not have.

Repetition is explicitly allowed when it carries meaning. `fingerprint.intentional_repetition`
records which shots repeat, and why:

```yaml
intentional_repetition:
  - shots: [shot_02, shot_04, shot_05]
    reason: >-
      Same geometry three times on purpose. The comparison IS the content:
      identical frame, changed mechanism.
```

`cv variety` computes a silhouette-similarity matrix as a **diagnostic only**. Its
first version was broken in an instructive way: raw grey levels at 10×18 reported every
pair of shots as 0.00–0.01 apart, because a near-black frame with sparse light type
averages to almost nothing — it was measuring exposure, not structure. Mean-centring
and normalising each signature before comparing fixed it, and the corrected matrix now
puts the deliberately-identical pair (shot_02 ↔ shot_04, 0.22) closest and the
different-engine shot furthest (shot_01 ↔ shot_02, 0.51).

---

## Layout

```
creative-video/
├── ARCHITECTURE.md  DESIGN_PRINCIPLES.md  CRITIC_REPORT.md
├── brand/
│   ├── tokens.css              synced into every shot between @brand markers
│   └── fonts/                  pinned TTFs, for engines freetype can reach
├── semantic/
│   ├── schema/SEMANTICS.md     the schema, and what it deliberately excludes
│   └── lib/{simulate,compile-assertions}.mjs
├── tools/
│   ├── cv.mjs                  the whole command surface
│   ├── brand.mjs  fetch-fonts.mjs
├── videos/<video_id>/
│   ├── semantics.yaml  shot_plan.yaml  directions.md
│   ├── shots/<shot_id>/        hyperframes.json, index.html,
│   │                           index.motion.json (generated), MARKERS.txt (generated),
│   │                           snapshots/, render.mp4          — or build.mjs for ffmpeg
│   ├── review/                 contact-sheet.jpg
│   └── output/final.mp4
└── creative_memory/
    ├── <video_id>.yaml         fingerprints
    └── gallery.jpg             every shot of every video, tiled
```

A shot directory is self-contained and cross-imports nothing. That is what makes a
shot independently previewable, renderable, validatable and **replaceable** — and what
lets several be authored in parallel without collisions.

---

## What is deliberately absent

- **No scene types, no composition presets, no card catalogue.** The vocabulary in this
  system is semantic (`actor`, `event`, `invariant`) and validational
  (`appearsBy`, `staysInFrame`). Neither says anything about how a frame looks.
- **No shared layout utilities yet.** Three shots is not enough evidence to know which
  helper is a primitive and which is a template in disguise. Brand tokens and the
  assertion compiler are shared because they are provably not compositional.
- **No queue, no database, no dashboard, no cloud rendering.** Local filesystem, one
  CLI, ~10 commands.
