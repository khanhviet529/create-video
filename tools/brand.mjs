#!/usr/bin/env node
/**
 * Sync brand/tokens.css into every shot composition between the @brand markers.
 * Brand tokens are the one thing shared across shots; geometry never is.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tokens = fs.readFileSync(path.join(ROOT, 'brand', 'tokens.css'), 'utf8').trim();
const RE = /\/\* @brand:start[\s\S]*?@brand:end \*\//;

let n = 0, missing = [];
for (const html of walk(path.join(ROOT, 'videos'))) {
  const src = fs.readFileSync(html, 'utf8');
  if (!RE.test(src)) { missing.push(path.relative(ROOT, html)); continue; }
  const next = src.replace(RE, tokens);
  if (next !== src) { fs.writeFileSync(html, next); n++; console.log(`  updated ${path.relative(ROOT, html)}`); }
}
console.log(`brand: ${n} composition(s) updated`);
if (missing.length) {
  console.log(`\nno @brand block (add one to inherit tokens):`);
  for (const m of missing) console.log(`  ${m}`);
}

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== 'snapshots') yield* walk(p); }
    else if (e.name.endsWith('.html')) yield p;
  }
}
