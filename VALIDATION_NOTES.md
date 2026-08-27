# What breaks in validation when the frame stops being a document

Findings from D01 (retry storm), the first benchmark authored as a *space* rather than
as a laid-out page. Written to the rule: **no validator was changed until a prototype
made it fail.** Every item below is something a real shot did, not something I
anticipated.

---

## 1. A rotated group's bounding box is not its geometry — CONFIRMED, with a formula

**What happened.** dirB's orbit is an SVG `<g>` of 450 dots on a circle, rotated
continuously. `layout/container_overflow` fired 19 times against `#orbit`, reporting a
box up to 1197px wide inside a 1080px canvas. Nothing was actually out of frame: the
dots sit at R=430 around (540,900), so the true extent is 867px and never changes,
because rotating a circle does not move it.

**Why.** `getBoundingClientRect` on a transformed element returns the axis-aligned box
of the **untransformed box, rotated** — not the box of the transformed geometry. For a
square-ish bbox of side `S` at angle `θ` that is:

```
reported = S · (|cos θ| + |sin θ|)      →  up to S·√2 ≈ 1.414·S at 45°
```

Verified against the actual output:

| t | rotation | true width | formula | hyperframes reported |
|---|---|---|---|---|
| 0.833s | 60° | 867.2 | 1184.6 | **1196.9** |
| 4.167s | 300° | 867.2 | 1184.6 | **1184.6** |

**Consequence.** Any layout check built on bounding boxes — `container_overflow`,
`escaped_container`, and in principle `staysInFrame` — is unreliable for a rotated
group whose real shape is not a filled rectangle. It over-reports, so it fails safe,
but at 19 findings per shot it buries the real ones.

**What was done.** Nothing suppressed. `cv gate` now groups repeated warnings by
code+selector with a count and annotates the two codes known to be unreliable here, so
the noise is *explained* rather than hidden:

```
layout/container_overflow #orbit ×19  (rotated-group bbox: measured box is the
    unrotated box rotated, not the real geometry — see VALIDATION_NOTES.md)
```

**Rule for authors:** never point `staysInFrame` at a rotated container. Point it at an
un-rotated child, or at the static element that marks the position.

## 2. `motion_frozen` detected a *design* problem, not a bug — the best result here

dirC (stacked bands) failed with:

```
motion_frozen #stage — nothing moves within #stage between 2.91s and 6.37s (3.46s static)
```

This is the single most useful number of the round. dirC is a beautifully proportioned
chart, and a chart has nothing to do between updates. dirA and dirB both passed
trivially, because a flow and a circuit are *always* moving.

So the liveness assertion turns out to be a usable proxy for the hypothesis itself:
**a space that is operating cannot be still; a page of information has no reason not to
be.** It was written to catch a seek landing past an entrance. It also measures whether
a shot is a mechanism or a diagram of one.

The fix applied was honest rather than cosmetic — throughput really is continuous, so
the capacity line carries a steady drain — but the finding stands as evidence about
dirC's nature, and is recorded as such in `directions.md`.

## 3. Density has no validator at all — GAP, not fixed

At round three dirB has 450 marks at ~6px pitch on a 2702px circumference, and dirC has
900 marks at 30px rows. Marks overlap; individual marks stop being resolvable; the
band becomes solid.

**That is the intent** — saturation is the message. But nothing in the gate can tell
the difference between *deliberately saturated* and *accidentally illegible*. There is
no check for:

- marks so dense that count is no longer readable,
- a population whose members occlude each other,
- a region whose information content has collapsed into a single tone.

Every existing layout check is about **discrete named elements not colliding**. None is
about **a population being too dense to read**. A vertical-video channel that shows
scale visually will need one, and it is not obvious what it should measure — mean
nearest-neighbour distance is the first thing to try.

**Deliberately not built yet.** No prototype has failed *because* of this: dirB's
saturation is legible and intended. Building the check now would be inventing a rule
before the failure exists.

## 4. Contrast checking assumes text — GAP

The contrast pass drove two real fixes in cycle 1 (`--ink-ghost` used as body text).
In D01 the load-bearing information is **not text**: it is 450 dots in `--pressure`
against `--ground`, and a teal arc against a ring of dots. Nothing checked any of it.

The dot colours happen to be fine (`--pressure` on `--ground` ≈ 5.1:1). But that is
luck, not verification. A brand that encodes meaning in the colour of non-text marks
needs contrast checking on marks.

**Not built.** Same reason: nothing has failed yet.

## 5. What did NOT break, and it is worth saying

- **`content_overlap` stayed accurate.** It caught a real text collision in all three
  directions, and every one was a genuine defect (a 168px numeral's metric box
  reaching into its own label, twice; two readouts sharing a `top`). Non-orthogonal
  layout did not confuse it, because the *text* in these shots is still laid out
  orthogonally.
- **The marker contract survived unchanged.** Six semantic events, three completely
  different spatial models, same `appearsBy` + `before` chain, all passing. This is the
  strongest evidence for the original architecture: the assertions genuinely do not
  care what the geometry is. A circuit, a flow field and a stacked column instrument
  the same mechanism the same way.
- **Determinism held** with 450–900 script-generated SVG elements, treadmill repeats
  and continuous rotation. Render was 170s for 450 frames.

## 6. Untested, so unclaimed

The brief asked about several failure modes that D01 did not actually exercise. Listing
them rather than guessing:

- **True curved motion paths.** dirB rotates a group; nothing follows a bezier. GSAP
  MotionPathPlugin was never loaded, so path-following remains unvalidated.
- **Elements deliberately leaving frame.** Every treadmill stays inside the canvas. The
  `may_leave_view` mechanism from cycle 2 was exercised by a camera, never by content.
- **Occlusion between distinct named elements.** Dots occlude each other, but no two
  *identified* elements overlap in depth.
- **Clipping.** Nothing uses `clip-path` or an SVG `clipPath`.
- **Scale extremes.** No element is animated below ~0.28 or above 1.0.

---

## Summary for the architecture

| validator | status under non-orthogonal geometry |
|---|---|
| semantic replay (`cv sem`) | unaffected — it never sees pixels |
| marker contract (`appearsBy` / `before`) | **unaffected, and this is the headline** |
| `content_overlap` | reliable, because text stayed orthogonal |
| `container_overflow` / `escaped_container` | **unreliable on rotated groups** — over-reports by up to ×1.414 |
| `staysInFrame` | reliable only on un-rotated targets |
| `motion_frozen` | reliable, and doubles as a "is this a space or a chart" probe |
| contrast | reliable for text, **blind to non-text marks** |
| density / occlusion | **does not exist** |

## Windows appearing on every render (Windows) — and one wrong diagnosis

Two rounds. The first was reasoned and wrong; the second was measured.

`chrome-headless-shell.exe` is a **console-subsystem** binary, unlike `chrome.exe` which
is GUI-subsystem, so Windows gives it a console. The obvious fix is `CREATE_NO_WINDOW`,
which Node exposes as `windowsHide`. `cv.mjs` already passed it, but only for the node
process it spawns directly; the browser is launched deeper down by `@puppeteer/browsers`,
which does not set it. So `tools/no-console-window.cjs` was written to preload into the
CLI and force `windowsHide: true` on every `spawn`. A `CV_SPAWN_DEBUG=1` run confirmed the
patch intercepted the right spawn, and that was taken as proof.

**It was not proof.** The windows were still there. Polling visible top-level windows
across a full render, comparing against a baseline snapshot:

    621 / 621 samples
    chrome-headless-shell | C:\Users\...\chrome-headless-shell-win64\chrome-headless-shell.exe

Intercepting the spawn and setting the flag is not the same as the flag taking effect.
puppeteer spawns the browser with `detached: true`; libuv turns that into
DETACHED_PROCESS, which conflicts with CREATE_NO_WINDOW — the child does not inherit the
parent's console, so Windows allocates it a fresh one, window included. `windowsHide` was
being set and then ignored.

The fix is to drop `detached` for the browser binary as well, scoped by a filename match
so nothing else in the CLI changes. The child then inherits the console of the node
process `cv.mjs` spawns with `windowsHide`, which has no window. Same measurement after:

    0 new windows, while the headless-shell process was alive for 113 of 300 samples

Rejected alternatives: pointing `HYPERFRAMES_BROWSER_PATH` at the full `chrome.exe` (GUI
subsystem, no console at all) swaps the rasteriser mid-project, and every frame already
shipped came from the headless shell — pixel-exact claims like the shot_06 → shot_07 match
cut would have to be re-established for a cosmetic problem. Patching
`node_modules/@puppeteer/browsers` is lost on the next install.

### Measured incidentally, and it corrects an earlier note here

`resolveHeadlessShellPath` prefers `~/.cache/hyperframes/chrome/chrome-headless-shell` and
falls through to the puppeteer cache, and the two commands do not land in the same place
on this machine:

  - `check` (what `cv gate` runs) resolves to `.cache/puppeteer/…/131.0.6778.204`
  - `render` resolves to `.cache/hyperframes/…/152.0.7977.30`

An earlier version of this note claimed the reverse for render, inferred from a `check`
debug line. It was wrong. The consequence is real and worth knowing: layout, contrast and
overlap are measured on one Chrome build while the shipped pixels are produced by another.
Nothing observed has been attributed to it, and E01 is frozen, so it is recorded rather
than chased.

### The lesson worth keeping

A diagnosis that explains the symptom is not a fix, and a log line proving the patch ran
is not evidence the symptom is gone. The thing to measure is the symptom.
