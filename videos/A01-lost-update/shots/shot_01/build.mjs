#!/usr/bin/env node
/**
 * SHOT 01 — engine: ffmpeg.
 *
 * WHY NOT HYPERFRAMES: this shot is three numerals, three labels and one rule.
 * There is no layout to solve, no choreography, nothing a DOM buys us. A browser
 * runtime here would cost ~70s of headless render and a Chrome dependency to draw
 * what a filtergraph draws in about a second. Engine choice is per shot, and this
 * is what "the simplest engine that can express it" actually looks like.
 *
 * Brand still applies: same ground, same palette semantics, same typeface — read
 * from brand/fonts (TTF, because freetype cannot read the woff2 HyperFrames uses).
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

const W = 1080, H = 1920, FPS = 30, DUR = 11;

// brand tokens, as ffmpeg colours
const GROUND        = '0x0C0D0F';
const INK           = '0xEDEAE4';
const INK_DIM       = '0x8B9198';
const RULE_BRIGHT   = '0x3D4348';
const AUTHORITATIVE = '0xC9A227';
const COUNTERFACT   = '0x7A8086';
const STALE         = '0xE0533D';

const MONO  = 'IBMPlexMono-600.ttf';
const LABEL = 'IBMPlexSansCondensed-500.ttf';

/** fade-in alpha as a closed form in t — no state, so any frame is independent */
const fade = (t0, d = 0.38) => `'min(1,max(0,(t-${t0})/${d}))'`;

const label = (text, y, t0, color = INK_DIM) =>
  `drawtext=fontfile=${LABEL}:text='${text}':x=120:y=${y}:fontsize=30:` +
  `fontcolor=${color}:alpha=${fade(t0)}`;

const figure = (text, y, t0, color) =>
  `drawtext=fontfile=${MONO}:text='${text}':x=120:y=${y}:fontsize=180:` +
  `fontcolor=${color}:alpha=${fade(t0, 0.45)}`;

const filters = [
  // 0.5 / 0.9 — what actually left the building
  label('SHIPPED FROM THE WAREHOUSE', 268, 0.50),
  figure('30', 320, 0.90, INK),

  // 2.6 / 3.0 — what the row claims
  label('THE LEDGER SAYS', 628, 2.60),
  figure('80', 680, 3.00, AUTHORITATIVE),

  // 4.6 — the rule that puts the two figures in the same argument
  `drawbox=x=120:y=980:w='max(0,min(840,(t-4.6)*1700))':h=2:color=${RULE_BRIGHT}:t=fill`,

  // 5.4 / 5.8 — the arithmetic the ledger disagrees with
  label('IT SHOULD SAY', 1038, 5.40),
  figure('70', 1090, 5.80, COUNTERFACT),

  // 7.6 — named last, once both figures have been read
  `drawtext=fontfile=${MONO}:text='10 UNITS UNACCOUNTED FOR':x=120:y=1392:fontsize=44:` +
    `fontcolor=${STALE}:alpha=${fade(7.60, 0.5)}`,
];

const args = [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-f', 'lavfi', '-i', `color=c=${GROUND}:s=${W}x${H}:r=${FPS}:d=${DUR}`,
  '-vf', filters.join(','),
  // matched to the HyperFrames shots so `cv compose` can concat with -c copy
  '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
  '-preset', 'medium', '-crf', '18', '-r', String(FPS), '-t', String(DUR),
  '-movflags', '+faststart',
  out,
];

// cwd = the font directory so fontfile needs no path, which sidesteps having to
// escape a Windows drive colon inside a filtergraph value.
const r = spawnSync('ffmpeg', args, { cwd: FONTS, encoding: 'utf8', stdio: ['ignore', 'inherit', 'inherit'], windowsHide: true });
if (r.status !== 0) process.exit(r.status || 1);
console.log(`shot_01 -> ${out}`);
