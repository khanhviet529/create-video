/**
 * VoiceStudio adapter — a THIN consumer of the contract discovered in
 * D:\Project\VoiceStudio. That repo is an external provider: read, never modified, never
 * copied. Everything asserted here is sourced in docs/VOICESTUDIO_INTEGRATION.md.
 *
 * Contract, in one place:
 *   GET  /health     200 {status:"ok",device,version}  |  503 {status:"starting",step,label}
 *   POST /generate   form-encoded; returns WAV BYTES, not JSON
 *                    headers: X-Audio-Duration (s) · X-Gen-Time · X-Seed · X-Audio-Id
 *                             X-OmniVoice-Dropped-Chunks / -Text  (partial synthesis)
 *
 * Two things this adapter refuses to paper over:
 *
 *   503 from /health is "starting", not "dead". Reporting it as a failure would send the
 *   operator to fix a backend that is merely loading a model.
 *
 *   X-OmniVoice-Dropped-Chunks is an ERROR here even though the provider returns 200 with
 *   a playable WAV. Text that produced no audio means the measured duration no longer
 *   corresponds to the narration — silent corruption of the exact number this whole
 *   integration exists to obtain.
 */
import { STATE, endpointIdentity } from './provider.mjs';

const HEALTH_TIMEOUT_MS = 12_000;
/** First generation loads (and may download) the model. The Colab smoke test allows 1800s
 *  and that is the number to match — a shorter timeout would report a working backend as
 *  unreachable on its first call. */
const GENERATE_TIMEOUT_MS = 1_800_000;

export function createVoiceStudio({ url, pin, apiKey }) {
  const base = String(url).replace(/\/+$/, '');

  const authHeaders = () => {
    const h = {};
    // Both are optional and independent: the PIN gate only exists when an operator set
    // one, and it only applies to non-loopback clients. The API key only exists when
    // OMNIVOICE_API_KEY is set server-side.
    if (pin) h['x-omnivoice-pin'] = pin;
    if (apiKey) h['authorization'] = `Bearer ${apiKey}`;
    return h;
  };

  const json = async (route, timeoutMs = HEALTH_TIMEOUT_MS) => {
    let res;
    try {
      res = await fetch(`${base}${route}`, {
        headers: authHeaders(), signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (e) {
      return { state: STATE.UNREACHABLE, reason: String(e?.message || e) };
    }
    if (res.status === 404) return { state: STATE.FAILED, notFound: true, reason: 'HTTP 404' };
    if (!res.ok) return { state: STATE.FAILED, reason: `HTTP ${res.status}` };
    try { return { state: STATE.SUCCEEDED, body: await res.json() }; }
    catch (e) { return { state: STATE.FAILED, reason: `unparseable JSON from ${route}` }; }
  };

  return {
    identity: () => endpointIdentity(base),

    /** GET /profiles — every stored voice profile, each with id and name. */
    listProfiles: () => json('/profiles'),

    /** GET /profiles/{id} — 404 when the id does not exist. */
    getProfile: (profileId) => json(`/profiles/${encodeURIComponent(profileId)}`),

    /**
     * The provider's OWN record of which voice drove a take.
     *
     * This exists because /generate cannot answer the question. Its response headers carry
     * the seed, the duration and the audio id, but nothing about the profile — and
     * generation.py:1312 takes `if profile_id:` then `if row:`, so an id that matches no
     * row falls straight through to the default voice and still returns HTTP 200. Echoing
     * back the profile_id this side SENT would verify nothing at all.
     *
     * X-Audio-Id is generation_history.id (generation.py:890 -> :904), so the history row
     * is the same take, and its profile_id column is what actually conditioned it.
     */
    async historyProfile(audioId) {
      const r = await json('/history');
      if (r.state !== STATE.SUCCEEDED) return r;
      const rows = Array.isArray(r.body) ? r.body : (r.body?.items || r.body?.history || []);
      const row = rows.find((x) => String(x?.id) === String(audioId));
      // The history write is best-effort on the provider side — it self-heals the schema
      // and returns the audio anyway if the insert fails. No row means the take cannot be
      // verified, which is not the same as a take that used the wrong voice, and both have
      // to stop a run that promised one voice.
      if (!row) return { state: STATE.FAILED, unrecorded: true,
        reason: `no history row for audio id ${audioId} — the provider did not record this take` };
      return { state: STATE.SUCCEEDED, profileId: row.profile_id ?? null, row };
    },

    /** Never throws for an offline runtime — that is a state, not an exception. */
    async probe() {
      let res;
      try {
        res = await fetch(`${base}/health`, {
          headers: authHeaders(),
          signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
        });
      } catch (e) {
        return { state: STATE.UNREACHABLE, reason: e?.name === 'TimeoutError'
          ? `no response within ${HEALTH_TIMEOUT_MS / 1000}s` : String(e?.message || e) };
      }
      let body = null;
      try { body = await res.json(); } catch { /* non-JSON body */ }

      if (res.status === 503 && body?.status === 'starting') {
        return { state: STATE.UNREACHABLE, starting: true,
          reason: `backend is starting — step ${body.step}: ${body.label}`, body };
      }
      if (!res.ok) {
        return { state: STATE.UNREACHABLE, reason: `HTTP ${res.status}`, body };
      }
      return {
        state: STATE.CONFIGURED,
        device: body?.device ?? null,
        version: body?.version ?? null,
        body,
      };
    },

    /**
     * One synchronous generation. `text` goes through verbatim: the provider applies its
     * own pronunciation dictionary when `pronounce` is true, so nothing is normalised on
     * this side.
     */
    async generate(text, params = {}) {
      const form = new URLSearchParams();
      form.set('text', text);
      // Only send what the caller chose. Every omitted field keeps the provider's own
      // default, so this adapter never silently pins a value the provider may change.
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null) form.set(k, String(v));
      }

      let res;
      try {
        res = await fetch(`${base}/generate`, {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded', ...authHeaders() },
          body: form,
          signal: AbortSignal.timeout(GENERATE_TIMEOUT_MS),
        });
      } catch (e) {
        // A dropped connection is a transport event, not an answer about the audio.
        return { state: STATE.UNREACHABLE, retryable: true, reason: String(e?.message || e) };
      }

      if (!res.ok) {
        let detail = '';
        try { detail = JSON.stringify(await res.json()); } catch { detail = await res.text().catch(() => ''); }
        // 502/503/504 over a quick tunnel are the tunnel or the origin blinking, and the
        // provider marks its own transient failures with X-OmniVoice-Retryable. Nothing
        // else is retryable: a 4xx is a request this side got wrong, and repeating it
        // just asks the same wrong question again.
        const retryable = [502, 503, 504].includes(res.status)
          || res.headers.get('x-omnivoice-retryable') === 'true';
        return { state: STATE.FAILED, retryable, reason: `HTTP ${res.status}`, detail: detail.slice(0, 800) };
      }

      const h = res.headers;
      const droppedCount = h.get('x-omnivoice-dropped-chunks');
      if (droppedCount) {
        // 200 with a playable WAV, and still a failure: see the header note above.
        return {
          state: STATE.FAILED,
          reason: `provider dropped ${droppedCount} chunk(s) — part of the narration produced no audio, `
                + `so the returned duration does not describe the narration`,
          detail: h.get('x-omnivoice-dropped-text') || '(no text sample in header)',
        };
      }

      const wav = Buffer.from(await res.arrayBuffer());
      // A truncated or empty body still arrives as 200 with a plausible duration header.
      // 44 bytes is a bare RIFF header with no samples; anything at or below that carries
      // no audio at all, whatever the header claims.
      if (wav.length <= 44 || wav.toString('ascii', 0, 4) !== 'RIFF' || wav.toString('ascii', 8, 12) !== 'WAVE') {
        return { state: STATE.FAILED,
          reason: `body is not usable audio: ${wav.length} bytes, `
                + `starts "${wav.toString('ascii', 0, 4)}"` };
      }
      const durationSec = Number(h.get('x-audio-duration'));
      if (!Number.isFinite(durationSec) || durationSec <= 0) {
        return { state: STATE.FAILED, reason: `missing or unusable X-Audio-Duration: ${h.get('x-audio-duration')}` };
      }

      return {
        state: STATE.SUCCEEDED,
        wav,
        durationSec,
        genTimeSec: Number(h.get('x-gen-time')) || null,
        seed: h.get('x-seed') || null,
        audioId: h.get('x-audio-id') || null,
      };
    },
  };
}
