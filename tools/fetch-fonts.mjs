#!/usr/bin/env node
/**
 * Brand includes a typeface, so every rendering adapter needs it in a format it
 * can actually read. HyperFrames gets woff2 from Google Fonts automatically;
 * freetype (ffmpeg drawtext) cannot read woff2 at all. Fetch real TTFs once.
 *
 * Run: node tools/fetch-fonts.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'brand', 'fonts');
fs.mkdirSync(OUT, { recursive: true });

// Google Fonts now serves woff2 to every UA, including the ancient ones that used
// to get TTF. Pull the upstream TTFs from the IBM/plex tag instead — pinned, so a
// re-fetch a year from now produces byte-identical files and identical renders.
const BASE = 'https://cdn.jsdelivr.net/gh/IBM/plex@v6.4.0';

const WANT = [
  { path: 'IBM-Plex-Mono/fonts/complete/ttf/IBMPlexMono-Regular.ttf',  as: 'IBMPlexMono-400.ttf' },
  { path: 'IBM-Plex-Mono/fonts/complete/ttf/IBMPlexMono-SemiBold.ttf', as: 'IBMPlexMono-600.ttf' },
  { path: 'IBM-Plex-Sans-Condensed/fonts/complete/ttf/IBMPlexSansCondensed-Medium.ttf',   as: 'IBMPlexSansCondensed-500.ttf' },
  { path: 'IBM-Plex-Sans-Condensed/fonts/complete/ttf/IBMPlexSansCondensed-SemiBold.ttf', as: 'IBMPlexSansCondensed-600.ttf' },
];

/** The legacy css endpoint serves extension-less /l/font URLs to old UAs, which
 *  are real TTF/OTF payloads. Sniff the magic bytes rather than trusting a suffix. */
function sniff(buf) {
  const tag = buf.subarray(0, 4).toString('latin1');
  if (tag === 'OTTO') return 'otf';
  if (tag === 'ttcf' || tag === 'true') return 'ttf';
  if (buf.readUInt32BE(0) === 0x00010000) return 'ttf';
  if (tag === 'wOFF') return 'woff';
  if (tag === 'wOF2') return 'woff2';
  return null;
}

let ok = 0;
for (const spec of WANT) {
  const dest = path.join(OUT, spec.as);
  if (fs.existsSync(dest)) { console.log(`  have ${spec.as}`); ok++; continue; }
  const res = await fetch(`${BASE}/${spec.path}`);
  if (!res.ok) { console.error(`  !! ${res.status} ${spec.path}`); continue; }
  const buf = Buffer.from(await res.arrayBuffer());
  const kind = sniff(buf);
  if (kind !== 'ttf' && kind !== 'otf') {
    console.error(`  !! ${spec.as} is ${kind || 'unrecognised'} — freetype cannot use it`);
    continue;
  }
  fs.writeFileSync(dest, buf);
  console.log(`  got  ${spec.as}  ${(buf.length / 1024).toFixed(0)} KB`);
  ok++;
}
console.log(`${ok}/${WANT.length} fonts in ${path.relative(ROOT, OUT)}`);
if (ok < WANT.length) process.exit(1);
