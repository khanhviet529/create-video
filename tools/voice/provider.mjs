/**
 * The voice provider boundary.
 *
 *   Content Package narration → VoiceProvider → <adapter> → provider API → audio artifact
 *
 * Nothing in this file knows what VoiceStudio is. Shots never talk to a provider at all;
 * they consume timings from the provenance record. Swapping VoiceStudio for another
 * engine means writing one more adapter and changing one line in `resolve()`.
 *
 * The narration is READ from the frozen Content Package snapshot and never rewritten.
 * Its sha256 is what ties an audio artifact to the exact text it was spoken from — a
 * version number would only tell us the contract changed, not the words.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

/** The four outcomes the caller must be able to tell apart. An inactive Colab runtime is
 *  UNREACHABLE — a normal operational state, never an implementation failure. */
export const STATE = {
  CONFIGURED: 'VOICE_PROVIDER_CONFIGURED',
  UNREACHABLE: 'VOICE_PROVIDER_UNREACHABLE',
  FAILED: 'VOICE_GENERATION_FAILED',
  SUCCEEDED: 'VOICE_GENERATION_SUCCEEDED',
};

export const NOT_CONFIGURED = 'VOICE_PROVIDER_NOT_CONFIGURED';

export const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

/**
 * Canonical narration, straight out of the frozen snapshot.
 *
 * Reads `videos/<id>/content-package.yaml`, which `cv import` wrote read-only. This
 * function never writes to it and never edits the text: no TTS normalisation, no
 * pronunciation rewriting. VoiceStudio applies its own pronunciation dictionary
 * (`pronounce=true`), so a second normalisation layer here would be a duplicate of
 * something the provider already owns — see docs/VOICESTUDIO_INTEGRATION.md.
 */
export function loadNarration(videoDir) {
  const p = path.join(videoDir, 'content-package.yaml');
  if (!fs.existsSync(p)) {
    throw new Error(`no frozen Content Package at ${p} — run \`cv import\` first`);
  }
  const pkg = YAML.parse(fs.readFileSync(p, 'utf8'));
  const n = pkg?.narration;
  if (!n?.text) throw new Error(`${p} has no narration.text`);
  const text = String(n.text).trim();
  return {
    text,
    sha256: sha256(Buffer.from(text, 'utf8')),
    chars: text.length,
    language: n.language ?? null,
    syllable_count: n.syllable_count ?? null,
    estimated_duration_sec: n.estimated_duration_sec ?? null,
    package_id: String(pkg.id ?? ''),
  };
}

/**
 * An endpoint identity that can be committed.
 *
 * The active URL is a temporary Colab/tunnel address and must never land in a tracked
 * file, but provenance still has to answer "was this the same endpoint as last time".
 * Registrable host suffix plus a short digest of the full URL does that without
 * publishing the URL itself.
 */
/**
 * Split the canonical narration into its authored paragraphs.
 *
 * Forced by an operational limit and kept because it is the better instrument. A
 * Cloudflare quick tunnel drops any origin response slower than ~100s — observed as
 * HTTP 524 on the full 166s narration — and the whole text in one request exceeds that.
 * Paragraphs are 2–11s each, far inside the budget.
 *
 * This is SEGMENTATION, never rewriting. It asserts that rejoining the pieces with the
 * separator reproduces the canonical text exactly and throws if it does not. Nothing is
 * normalised, reordered or reworded.
 *
 * The by-product is what Step 4.5 actually needs: a measured duration per authored beat,
 * rather than one 166s blob that would then have to be force-aligned.
 *
 * No silence is inserted between segments. A pause between beats is a decision the VIDEO
 * makes; inventing one here would put fabricated time into a measurement.
 */
export function splitNarration(text) {
  const canonical = String(text).trim();
  const parts = canonical.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (parts.join('\n\n') !== canonical) {
    throw new Error('segmentation is not lossless — refusing to speak text that is not the narration');
  }
  return parts;
}

export function endpointIdentity(url) {
  let host = '(unparseable)';
  try { host = new URL(url).hostname.split('.').slice(-2).join('.'); } catch { /* keep */ }
  return `${host} · sha256:${sha256(Buffer.from(String(url), 'utf8')).slice(0, 16)}`;
}

export function writeProvenance(videoDir, record) {
  const p = path.join(videoDir, 'VOICE_PROVENANCE.yaml');
  fs.writeFileSync(p, YAML.stringify(record));
  return p;
}

export function readProvenance(videoDir) {
  const p = path.join(videoDir, 'VOICE_PROVENANCE.yaml');
  return fs.existsSync(p) ? YAML.parse(fs.readFileSync(p, 'utf8')) : null;
}

/**
 * Pick an adapter from the environment.
 *
 * Returns `{ ok: false, state: NOT_CONFIGURED, missing: [...] }` when the runtime values
 * are absent — which is the expected state on a machine where the Colab runtime has not
 * been started. It is deliberately NOT an error: the caller reports what to supply.
 */
export async function resolve(env = process.env) {
  const url = (env.VOICESTUDIO_URL || '').trim();
  if (!url) {
    return {
      ok: false,
      state: NOT_CONFIGURED,
      missing: ['VOICESTUDIO_URL'],
      hint: 'base URL of the running VoiceStudio backend, e.g. https://xxx.trycloudflare.com — '
          + 'see docs/VOICESTUDIO_INTEGRATION.md, RUNTIME_VALUE_REQUIRED',
    };
  }
  const { createVoiceStudio } = await import('./voicestudio.mjs');
  return {
    ok: true,
    adapter: createVoiceStudio({
      url,
      pin: (env.VOICESTUDIO_PIN || '').trim() || null,
      apiKey: (env.VOICESTUDIO_API_KEY || '').trim() || null,
    }),
  };
}
