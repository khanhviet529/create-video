# PROJECT HANDOVER — Technical Content Engine × Visual Engine

## 0. Handover protocol

This document is not only a context summary. The new chat must pass a verification step before it is trusted to continue the project.

### Required sequence

1. Read this entire handover.
2. Do **not** continue the project yet.
3. Answer the **Handover Verification Questions** at the end.
4. The user will bring those answers back to the previous chat.
5. The previous chat will grade them as:
   - `PASS`
   - `PARTIAL`
   - `FAIL`
6. Only after the previous chat returns **HANDOVER VERIFIED** should the new chat continue the project.

Do not skip this verification process.

---

# 1. Project goal

The project builds a pipeline for creating technically rigorous Vietnamese software-engineering explainer videos.

The system intentionally separates:

## Content Agent
Owns:
- research;
- technical truth;
- causal reasoning;
- Vietnamese narration;
- semantic beats;
- fixes/trade-offs;
- detection;
- technical review;
- final `content-package.yaml`.

Does **not** own:
- visual layout;
- animation;
- camera;
- rendering;
- visual style.

Repository:
`D:\Project\technical-content-engine`

## Video Agent / Visual Engine
Owns:
- importing the frozen Content Package;
- semantic interpretation without changing technical truth;
- visual strategy;
- motion design;
- persistent visual worlds;
- representation transformation;
- camera/depth when justified;
- voice timing;
- rendering;
- artifact-level validation;
- Creative Memory;
- benchmark freezing.

Does **not** own:
- changing the technical claim;
- fixing Content Package truth silently;
- inventing a more visually convenient mechanism.

## User
The user is the handoff boundary between the two agents.

The agents should not browse each other's repositories as a shortcut.

---

# 2. Core architecture and source-of-truth boundary

Content Engine output:

`packages/<id>-<slug>/content-package.yaml`

This is already the clean handoff artifact / API boundary.

Do **not** introduce a duplicate export such as:

`exports/visual-engine/...`

because that would create two possible sources of truth.

Video Engine imports packages through the existing import boundary:

`cv import <package> --as <video-id>`

Then verifies:

`cv provenance <video-id>`

The imported snapshot is immutable and is the only content truth used by the Video Agent.

Provenance states include:
- `CURRENT`
- `SOURCE_CHANGED`
- `SOURCE_UNAVAILABLE`

Frozen benchmark source changes are informational; they do not automatically trigger rebuilds.

---

# 3. Audience and content philosophy

Primary audience:
Vietnamese software engineers, roughly 2–5+ years experience.

Topics should focus on:
- production incidents;
- internal mechanisms;
- debugging;
- trade-offs;
- edge cases;
- wrong mental models;
- detection and verification.

The Content Agent is a **technical reasoning engine**, not a template script generator.

Preferred semantic backbone:

`phenomenon/problem`
→ `conditions`
→ `internal mechanism`
→ `why a common mental model/fix is wrong`
→ `solution positions`
→ `trade-offs`
→ `detection/verification`

Narrative order is flexible.

Do not force every topic into an incident arc.

---

# 4. Content Engine durable state

Core docs already exist:
- `CONTENT_ARCHITECTURE.md`
- `AUDIENCE.md`
- `VOICE.md`
- `CONTENT_PRINCIPLES.md`
- `TECHNICAL_REVIEW.md`
- `CONTENT_PACKAGE.md`
- `CLAUDE.md`

There are stage skills plus an orchestrator and zero-dependency Node tooling.

Important learned rules:

- Event `role` matters; `causes` alone can be ambiguous.
- Optional `dataset/assertions` should protect real claims, not fill schema.
- Fixes can carry:
  - what changes;
  - what remains unchanged;
  - what capability is enabled;
  - trade-off.
- Detection must preserve:
  - signal;
  - interpretation;
  - false positives;
  - what it does not prove.
- Rejected semantic explanations belong in memory.
- Use the literalization test:

> If a downstream Visual Agent implements this sentence literally, does it teach the correct mechanism?

- Fingerprint the **primary causal mechanism**, not the symptom.
- Validator checks structure; it cannot prove technical truth.
- Duration is mechanism-driven, not a fixed 60–90 second template.
- Beat segmentation is semantic/timing data, not just punctuation.
- Claim + caveat can be an inseparable explanatory unit.
- Terminology discipline should happen during research, not only during review.

---

# 5. Existing Content Packages

## 001
Mechanism:
`check_then_act / concurrency`

## 002
Mechanism:
`indexed_expression_mismatch`

Important lesson:
A plain index on `email` does not automatically satisfy a predicate on `lower(email)`.
Do not teach the false mechanism that the planner simply treats every function as a black box.

## 003
Mechanism:
`self_sustaining_loop`

## 004
Topic:
object-level authorization

Core invariant:
Every protected object access must be subject to the required authorization decision for `(subject, resource, action)`.

Important:
This does **not** mean every handler must manually duplicate a check.

## 005
Redis head-of-line / sequential execution

Core mechanism:
sequential command execution + no preemption
→ other requests wait.

Avoid over-broad shorthand such as “Redis single-threaded” when the narrower execution claim is what matters.

## 006
Topic:
PostgreSQL MVCC bloat / rows flat while size grows

Mechanism shape:
accumulating physical state / delayed reclamation.

This package helped move away from incident-only narrative structure.

## 007 — CURRENT CONTENT PACKAGE
Package 007 is complete and validated.

Topic:
**Read-your-writes through a read replica**

Chosen because the topic is fundamentally a **trade-off**, not a mistake or a single broken component.

Primary mechanism:
write and follow-up read are served at different positions on the same replication history/log.

Key reasoning:
wall-clock order and observed log-position order are not the same guarantee.

Important locks:
- Do **not** teach “the replica is slow”.
- Performance changes the width of the stale window; it does not define the guarantee.
- Stale data is not lost data.
- Eventual consistency may still hold while read-your-writes is lost.
- `synchronous_commit = on` does not mean replication is synchronous.
- PostgreSQL lag is not “one number”.
- `write_lag`, `flush_lag`, and `replay_lag` are not interchangeable for the visibility question.
- `replay_lag` is the relevant visibility signal here, but a low value still does not itself guarantee read-your-writes.

Package 007 characteristics:
- 25 claims
- 22 verified
- 3 assumed
- 0 wrong
- 3 PostgreSQL sources
- glossary includes unresolved distinction:
  `read-your-writes` vs `session consistency`
- 5 content angles
- 5 narrative structures
- selected structure:
  `tradeoff-positions`
- 711 syllables
- 39 semantic beats
- approximately 169 seconds estimated narration
- three `inseparable` beat groups

Four peer trade-off positions:
1. route relevant reads to primary;
2. carry/track log position and wait or reroute;
3. use `remote_apply`;
4. show the just-submitted value without rereading.

These are not “one fix plus three backups”.

Package 007 is ready for Video Agent handoff.

Do not create Package 008 yet.

---

# 6. Visual Engine historical problem

Earlier Video Engine behavior used too many repeated renderer/scene patterns.

The key correction was:

> Brand consistency ≠ layout consistency.

The target is a creative runtime where the agent:
- invents visual explanations;
- codes them;
- validates them;
- reviews the rendered artifact;
- records why devices worked or failed.

Strong default:
HTML/CSS/SVG/JS/GSAP style runtime.

Other engines may be used where appropriate, e.g. Manim for formal geometry.

Avoid default LLM video grammar:
- generic SaaS cards;
- purple gradients everywhere;
- fake sci-fi HUD;
- glowing nodes by default;
- centered or left-aligned repetitive documents;
- boxes + arrows as default explanation;
- decorative code;
- narration repeated as on-screen text.

---

# 7. Visual references and what they mean

The user strongly prefers three reference families:

## SSH reference
What to learn:
- persistent system world;
- progressive disclosure;
- object continuity;
- spatial memory;
- movement through subsystem levels.

Do not copy exact layout.

## Matrix / GlassBox-style reference
What to learn:
- concept becomes geometry;
- mathematical transformation becomes spatial transformation;
- representation changes while identity is preserved;
- 2D may become depth only when meaning supports it.

## Premium technical reference
What to learn:
- restrained glow;
- lighting hierarchy;
- active-path emphasis;
- layered depth;
- polished technical presentation.

Do not learn:
“dark + neon = good video”.

The user's preferred direction is better summarized as:

> technical cinematic explainer with a persistent spatial world, progressive disclosure, meaningful transformation, and restrained cinematic polish.

---

# 8. Master visual philosophy

Hard priority:

1. technical truth;
2. causal clarity;
3. viewer comprehension;
4. semantic motion;
5. spatial continuity;
6. cinematic polish.

Visuals should explain mechanisms, not transcribe narration.

Preferred representation ladder:

`reality/UI`
→ `structural abstraction`
→ `system/spatial`
→ `state/data`
→ `code`

Code should become execution when useful.

Motion should explain:
- state;
- causality;
- scale;
- abstraction;
- focus;
- continuity.

---

# 9. E01 benchmark

Topic:
index defeated by function / expression mismatch.

Important lessons:
- primary mechanism is indexed-expression matching;
- collation/ordering intuition is supporting intuition, not universal cause;
- removed a false execution animation that visually implied a planner path that did not actually occur;
- expression index fix must preserve exact semantics;
- `idx_scan=0` is an investigation signal, not proof;
- Creative Memory stores rejected visual devices.

E01 is frozen and should not be redesigned.

---

# 10. F01 benchmark

Topic:
object-level authorization.

Major semantic lesson:
A later code path may never have had the authorization enforcement at all.

Do not describe that as:
- bypassed;
- skipped;
- ID guessing;
- “three months later caused it”.

The temporal event is context, not cause.

F01 became a strong semantic benchmark but exposed visual limitations:
- heavily left-biased composition;
- static camera throughout;
- document/code-authoring register;
- sparse frame usage.

This motivated stronger visual R&D.

F01 is frozen.

---

# 11. G01 benchmark — latest frozen visual benchmark

Video:
`G01-bloat-not-row-count`

Status:
`FROZEN_BENCHMARK`

Final artifact:
`videos/G01-bloat-not-row-count/output/final.mp4`

Properties:
- 175.500s
- 5265 frames
- 30 fps
- 1080×1920
- voiced
- SHA256:
  `c3816f8ad7fa06674f798c3ac90f1eca7b242665daf686c09529f74963816689`

It is bit-identical to the reviewed prototype.
Freeze did not rerender it.

`full_video_review: passed` is a separate action from rendering and is what unlocks the `final.mp4` name.

Integrity:
18/18 checks passed.

Voice:
38/38 segments used one verified runtime profile for `namtre_v2` at speed 1.00.

Important:
the runtime profile ID is ephemeral.
Do not treat old profile IDs as durable identity.

G01 validated the **persistent-world** stage.

Seven chapters were visually continuous enough to form one world for ~137 seconds.

Important production lessons:
- artifact-level measurement can catch bugs that code review cannot;
- parallel measurement scripts can corrupt their own evidence;
- continuity tooling now uses process-safe temporary names;
- animation state and simulation state must not diverge;
- reading build-time state for runtime animation is dangerous;
- array ordering itself can be hidden state;
- “stationary” should often mean the boundary stays still, not that the whole world stops;
- hero-frame validation on an empty list is meaningless;
- labels/overlays can become false witnesses even when each individual shot looks plausible.

Camera:
11/11 static in G01, but now deliberately justified.
A push-in from CH1→CH2 was tested and rejected because it did not reveal new information.

Do not retrofit G01 into V2.1.
Its role is to preserve the historical benchmark for the persistent-world stage.

---

# 12. Visual Engine V2.1

Durable doctrine:
`docs/VISUAL_ENGINE_V2.1.md`

V2 learned:
> Do not reset the visual world unnecessarily.

V2.1 adds:
> A persistent world should be able to transform representation while preserving conceptual identity.

Core direction:

`persistent world`
+
`representation transformation`
+
`spatial escalation`

Target:
not simply “more cinematic”.

Target:
> the technical concept itself progressively becomes geometry, motion, scale, depth, or transformed representation.

Three levels of visual change:

## Level 1 — State change
active/inactive, live/dead, occupancy change.

## Level 2 — Structural change
one object becomes a network, state accumulates, system structure changes.

## Level 3 — Representation transformation
same concept
→ new representation
→ deeper understanding.

Examples:
- physical world → measurement;
- equation → geometry;
- code → execution;
- timeline → state field;
- system overview → internal mechanism.

Level 3 is the key V2.1 development target.

---

# 13. G01 limitations that V2.1 must attack

G01 recorded three major limitations:

1. Representation changes often meant **adding another layer beside the world** rather than transforming the world itself.
2. Scale barely changed; the same cell/world scale persisted for most of the video.
3. Negative space outside the main frame was often not assigned semantic meaning.

Future benchmarks should actively test these weaknesses.

Do not solve them with decorative camera, 3D, glow, or random motion.

---

# 14. Camera and depth doctrine

Camera is an explanatory tool only.

Allowed reasons:
- focus on a subsystem;
- restore system context;
- reveal scale;
- reveal meaningful depth;
- preserve identity through abstraction change.

Do not move camera because:
- the shot is long;
- the scene is static;
- the reference video uses camera;
- “cinematic energy” feels low.

Depth is allowed only when it carries meaning such as:
- hierarchy;
- history;
- hidden/internal layer;
- abstraction levels;
- multiple observers;
- distance/state relationships.

---

# 15. Negative-space doctrine

For major compositions ask:

`occupied space means: ?`
`empty space means: ?`

Possible meanings:
- unoccupied capacity;
- unreplayed history;
- future state;
- uncertainty window;
- separation;
- scale;
- room for accumulation;
- decision space.

Do not fill space merely for aesthetics.

Do not leave large empty regions with no semantic purpose.

---

# 16. Creative Memory philosophy

Creative Memory stores:
- why a device worked;
- semantic function;
- rejected explanations;
- rejected visual devices;
- known limitations.

It should distinguish:
- intentional reuse;
- habitual reuse.

Successful device in one benchmark must not become automatic grammar for the next.

Examples of habits to watch:
- every video becomes a grid;
- every aha becomes a ruler;
- every active state glows;
- every transition morphs;
- every video becomes 3D;
- every topic becomes a master diagram.

---

# 17. VoiceStudio integration

Repository:
`D:\Project\VoiceStudio`

Video Agent may read it to discover the API contract.

Video Agent must not modify VoiceStudio.

Typical runtime:
- server on local port 3900;
- exposed from Colab through a temporary Cloudflare quick tunnel.

Important:
Cloudflare runtime URLs are ephemeral.

Never hardcode or commit them.

Use environment configuration such as:
`VOICESTUDIO_URL`

Voice API:
`POST /generate`
returns WAV.

Durable voice identity:
`namtre_v2` recipe / reference audio + manifest information.

Ephemeral:
runtime `profile_id`.

A new Colab/runtime may assign a different profile ID.

Provider may silently fall back if an unknown profile ID is sent, so Video Engine must verify the actual profile through generated audio/history evidence.

One video should use one consistent voice.

Current successful starting recipe:
- `namtre_v2`
- speed `1.00`
- seed `1`
- language `vi`

Do not assume this must become a permanent global brand voice without evidence.

Real audio decides production timing.

Package duration estimates are estimates.

---

# 18. G01 voice timing lesson

For G01:
- package estimate ≈157s narration;
- real speech ≈156.69s;
- assumed rate ≈4.19 syllables/sec;
- real rate ≈4.20 syllables/sec.

This happened to match extremely well.

Do not generalize that every package/voice will match as closely.

---

# 19. Production philosophy

High-risk visual work should follow:

`minimum build`
→ `snapshot`
→ `mute review`
→ `semantic review`
→ `voiced review`
→ `artifact validation`
→ `polish`

Do not trust:
- source code alone;
- isolated-shot review alone;
- validator output alone.

Full-video review matters.

Human listen/review matters.

A final video should not be frozen before the required review state has passed.

---

# 20. Current exact project state

## Content side
Package 007 is complete, validated, and waiting for handoff.

Do not create 008.

## Video side
G01 has been frozen successfully.

Video Engine doctrine V2.1 already exists.

## Immediate next action
Handoff Package 007 to Video Agent.

A prompt has already been prepared for the Video Agent.

Its requested scope is only:

`IMPORT`
→ `STEP 1 Semantic Analysis`
→ `STEP 2 Visual Strategy`

Then STOP for review.

Do not assume Step 3 has started.

Do not build the full 007 video yet.

---

# 21. Package 007 — intended V2.1 benchmark challenge

Package 007 is especially valuable because it contains a natural representation transformation:

The same user sequence can be interpreted by:
- wall-clock order;
- replication/log-position order.

The visual aha candidate is:

> “the read happened after the write by clock time, but it observed a position before the write in replication history.”

Do not turn this into:
- a speed race;
- `499` chasing `500`;
- faster/slower meters;
- “replica performance”.

The key dimension is:
**position / visibility / ordering**, not speed.

A strong V2.1 implementation may transform the same visual world from one reference frame to another while preserving object identity.

This is only a hypothesis until Step 1–2 validates it.

---

# 22. Four trade-off positions in 007

The four positions must remain peers, not a ranked fix list:

### Position 1
Route specific reads back to primary.

### Position 2
Carry/track log position and wait or reroute until visibility catches up.

### Position 3
Use `remote_apply`.

Must preserve latency/availability cost.

### Position 4
Show the submitted value immediately without rereading.

Must preserve the caveat:
this changes user-visible experience, not the underlying consistency guarantee.

---

# 23. Detection semantics in 007

Do not show:
`write_lag`, `flush_lag`, `replay_lag`
as three equivalent meters where one happens to be highlighted.

The visual should explain why `replay_lag` connects specifically to the read-visibility mechanism.

Still preserve:

`low replay_lag`
≠
`read-your-writes guaranteed`

and potentially:

`replay_lag ≈ 0`
may occur when there is no new WAL to replay.

Signal is not diagnosis.

---

# 24. Hard boundaries

Never silently do any of the following:

- Video Agent edits technical truth for visual convenience.
- Content Agent dictates layouts/camera/animation.
- Video Agent reads Content Engine internals instead of using the import contract.
- Create duplicate content handoff artifacts.
- Reuse an old VoiceStudio runtime profile ID as durable identity.
- Treat dark/neon as the visual style itself.
- Turn every technical topic into boxes + arrows.
- Treat text labels as proof of mechanism.
- Freeze a benchmark before full required review.
- Retrofit new doctrine into historical frozen benchmarks merely for consistency.
- Create Package 008 before 007 handoff/R&D is complete unless user explicitly changes direction.

---

# 25. How the new chat should behave

The new chat should act as:
- reviewer;
- architecture memory;
- prompt designer;
- handoff coordinator between Content Agent and Video Agent.

It should not pretend to be either repository agent itself.

When an agent returns a report:
1. inspect whether the reasoning matches the project doctrine;
2. identify semantic or visual risks;
3. decide whether to approve the next stage;
4. create the next prompt when appropriate.

Prefer concise Vietnamese unless deeper analysis is requested.

---

# 26. HANDOVER VERIFICATION QUESTIONS

The new chat must answer these **before continuing the project**.

Do not answer from generic software knowledge. Answer from this handover.

## A. Architecture

### Q1
What exactly does the Content Agent own, and what must it never own?

### Q2
What exactly does the Video Agent own, and what must it never silently change?

### Q3
What is the canonical handoff artifact between them, and why should no duplicate `exports/visual-engine` artifact be added?

### Q4
What does `cv import` + provenance protect us from?

---

## B. Benchmark understanding

### Q5
What was the main visual weakness of F01 even though its semantic rigor was strong?

### Q6
What did G01 successfully prove?

### Q7
Name the three G01 limitations that motivated V2.1.

### Q8
Why must G01 not be redesigned to satisfy V2.1?

---

## C. V2.1 reasoning

### Q9
Explain the difference between:
- persistent world;
- transformational world.

Do not answer only with “more animation”.

### Q10
What is a Level-3 representation transformation?

Give one project-consistent example.

### Q11
When is camera movement justified?

Name at least three valid reasons and one invalid reason.

### Q12
What does the rule
`occupied space means / empty space means`
protect against?

---

## D. Voice and production

### Q13
What is durable about `namtre_v2`, and what is ephemeral?

### Q14
Why can a valid-looking HTTP 200 from VoiceStudio still be unsafe to accept blindly?

### Q15
Why is real voice timing authoritative over package duration estimates?

### Q16
What review condition unlocked the `final.mp4` name for G01?

---

## E. Package 007

### Q17
What is the primary mechanism of Package 007?

### Q18
Why is “the replica is slow” a dangerous mental model here?

### Q19
What guarantee can be lost while eventual consistency still remains true?

### Q20
Why must `499` and `500` not be animated like a race?

### Q21
List the four trade-off positions without ranking them.

### Q22
Why is `remote_apply` not allowed to appear as a free consistency switch?

### Q23
Why is “show the just-submitted value” not a repair of replication consistency?

### Q24
Why is `replay_lag` more relevant than the other lag metrics here, and what does a low `replay_lag` still fail to prove?

---

# 27. SCENARIO QUESTIONS

These questions test understanding, not memory.

## S1
The Video Agent says:

> “The content is visually awkward. I will rewrite the mechanism from ‘different log positions’ to ‘replica responds slower than primary’ because it is easier to animate.”

What should happen?

---

## S2
The Video Agent proposes four large cards titled:

- Best fix
- Alternative 1
- Alternative 2
- Workaround

for Package 007.

What is wrong with this architecture?

---

## S3
The Video Agent proposes a beautiful camera orbit around a primary/replica diagram, but cannot state what new information becomes visible during the orbit.

Should the camera stay? Why?

---

## S4
A new Colab runtime starts and the old `profile_id` no longer exists, but the profile name `namtre_v2` and durable recipe remain available.

What should the Video Agent do?

---

## S5
A validator passes a shot, but during full-video review the label visually implies that stale data was lost.

Is the shot acceptable?

Explain which source of truth wins.

---

## S6
Package 007's Step 1 discovers that the “clock order → log-position order” transformation is technically misleading in the actual package semantics.

Should the Video Agent preserve it because it is the main V2.1 experiment?

Explain.

---

# 28. REQUIRED RESPONSE FORMAT FROM THE NEW CHAT

The new chat should respond with:

## Part 1 — Project state summary
Maximum 12 bullets.

## Part 2 — Answers
Answer Q1–Q24 and S1–S6.

Be concise but precise.

## Part 3 — Exact next step
State what should happen next in the project.

Do not execute it yet.

## Part 4 — Confidence / uncertainties
List any detail from the handover that is still ambiguous.

Then STOP and wait for the user.

The user will return these answers to the previous chat for verification.

---

# 29. Current handover checkpoint

At the moment this file was created:

- G01 = frozen.
- Package 007 = complete and validated.
- Package 008 = not created.
- Visual Engine V2.1 doctrine = already durable in Video Engine repo.
- Package 007 has not been assumed to have started Step 3.
- The next intended action is Package 007 → Video Agent, Step 1–2 only, followed by review.

Do not silently advance beyond this checkpoint.
