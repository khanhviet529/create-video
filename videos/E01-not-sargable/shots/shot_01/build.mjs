#!/usr/bin/env node
/**
 * SHOT 01 — engine: ffmpeg.
 *
 * WHY NOT HYPERFRAMES: two measured quantities, two bars and a header. No layout to
 * solve and no choreography — a browser runtime would cost ~70s of headless render
 * and a Chrome dependency to draw what a filtergraph draws in about a second.
 *
 * THE ARGUMENT OF THE SHOT is carried by the two bars being the SAME LENGTH at every
 * stage. Rows and elapsed time are given as exactly proportional pairs
 * (200.000 -> 40ms, 800.000 -> 160ms, 2.000.000 -> 400ms), so the bars can only be
 * equal if cost tracks table size — which is precisely the invariant
 * `cost_independent_of_table_size` failing. The final row count is 2.000.000 because
 * that is the number the replay produces and the number shot_07 pays off.
 *
 * The numbers step rather than sweep: they are three measurements, not a continuous
 * function, and animating between them would invent readings nobody took. The bars
 * step with them for the same reason.
 *
 * Deterministic: every value is a closed-form function of t. No frame state.
 *
 * Usage: node build.mjs <out.mp4>
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FONTS = path.resolve(HERE, '../../../../brand/fonts');
const out = path.resolve(process.argv[2] || path.join(HERE, 'render.mp4'));

const W = 1080, H = 1920, FPS = 30, DUR = 7;

// brand tokens, as ffmpeg colours
const GROUND      = '0x0C0D0F';
const INK         = '0xEDEAE4';
const INK_DIM     = '0x8B9198';
const RULE        = '0x23272A';
const STALE       = '0xE0533D';
const PRESSURE    = '0xB4623A';

const MONO  = 'IBMPlexMono-600.ttf';
const LABEL = 'IBMPlexSansCondensed-500.ttf';
const LABEL_B = 'IBMPlexSansCondensed-600.ttf';

const X = 93;   // shared left margin for every shot in this video

/** the three measurements, and when each one is on screen */
const STAGES = [
  { rows: '200.000',   ms: '40 ms',  frac: 0.10, t0: 0.90, t1: 2.55 },
  { rows: '800.000',   ms: '160 ms', frac: 0.40, t0: 2.55, t1: 3.95 },
  { rows: '2.000.000', ms: '400 ms', frac: 1.00, t0: 3.95, t1: DUR + 1 },
];
const BAR_MAX = 800;

/** fade-in alpha as a closed form in t — no state, so any frame is independent */
const fade = (t0, d = 0.38) => `'min(1,max(0,(t-${t0})/${d}))'`;

const label = (text, y, t0, color = INK_DIM, size = 30, font = LABEL) =>
  `drawtext=fontfile=${font}:text='${text}':x=${X}:y=${y}:fontsize=${size}:` +
  `fontcolor=${color}:alpha=${fade(t0)}`;

const figure = (text, y, color, t0, t1) =>
  `drawtext=fontfile=${MONO}:text='${text}':x=${X}:y=${y}:fontsize=140:` +
  `fontcolor=${color}:enable='between(t,${t0},${t1})'`;

/** One drawbox per stage, at a width that is a plain integer.
 *
 *  A single box with w='800*(0.1*between(t,...)+...)' rendered at full 800px in every
 *  stage: drawbox does not re-evaluate `w` per frame the way drawtext re-evaluates
 *  `alpha` and `enable`, so the expression collapsed. Three fixed-width layers gated by
 *  `enable` is both correct and stronger for this shot — the two bars now take their
 *  width from the SAME constant, so equal length is guaranteed by construction rather
 *  than by two expressions agreeing. */
const bar = (y, color) =>
  STAGES.map((s) =>
    `drawbox=x=${X}:y=${y}:w=${Math.round(BAR_MAX * s.frac)}:h=16:color=${color}:t=fill:` +
    `enable='between(t,${s.t0},${s.t1})'`);

const filters = [
  // 0.30 — the premise. Says "index" and "email" out loud, because the paradox only
  // exists if the viewer accepts that the index is really there.
  label('bảng users — có index trên email', 268, 0.30, INK_DIM, 32, LABEL_B),

  // 0.85 / 1.20 — quantity one
  label('số dòng', 430, 0.55),
  ...STAGES.map((s) => figure(s.rows, 478, INK, s.t0, s.t1)),
  `drawbox=x=${X}:y=660:w=${BAR_MAX}:h=16:color=${RULE}:t=fill:enable='gte(t,0.75)'`,
  ...bar(660, INK_DIM),

  // 0.85 / 1.20 — quantity two, read at the same moment, never alone
  label('thời gian một query', 800, 0.55),
  ...STAGES.map((s) => figure(s.ms, 848, PRESSURE, s.t0, s.t1)),
  `drawbox=x=${X}:y=1030:w=${BAR_MAX}:h=16:color=${RULE}:t=fill:enable='gte(t,0.75)'`,
  ...bar(1030, PRESSURE),

  // 5.10 — the contradiction, only after the third pair has been on screen long
  // enough for the equal lengths to be noticed rather than asserted.
  label('index có thật.', 1300, 5.10, INK, 46, LABEL_B),
  label('chi phí vẫn tăng đúng theo số dòng.', 1364, 5.45, STALE, 46, LABEL_B),
];

const args = [
  '-f', 'lavfi', '-i', `color=c=${GROUND}:s=${W}x${H}:r=${FPS}:d=${DUR}`,
  '-vf', filters.join(','),
  // matched to the HyperFrames renderer so `-c copy` concat stays lossless
  '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.0', '-pix_fmt', 'yuv420p',
  '-preset', 'slow', '-crf', '17', '-r', String(FPS), '-t', String(DUR),
  '-movflags', '+faststart', out,
];

const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args],
  { encoding: 'utf8', cwd: FONTS, stdio: 'inherit', windowsHide: true });
process.exit(r.status ?? 1);
