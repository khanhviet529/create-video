#!/usr/bin/env node
/**
 * Tests the VoiceStudio ADAPTER against a mock that speaks the discovered contract.
 * Nothing here touches D:\Project\VoiceStudio — it is an external provider, and these
 * assertions are about our consumer behaviour, not about theirs.
 *
 * Two behaviours are load-bearing and were previously only asserted in comments:
 *
 *   503 {"status":"starting"} is UNREACHABLE-with-starting, not FAILED. Reporting a
 *   loading backend as a failure sends the operator to fix something that is fine.
 *
 *   200 + a playable WAV + X-OmniVoice-Dropped-Chunks is FAILED. The provider considers
 *   it a success; we cannot, because text that produced no audio means X-Audio-Duration
 *   no longer describes the narration — and that duration is the entire reason this
 *   integration exists.
 *
 *   node tests/voice-adapter.test.mjs
 */
import http from 'node:http';
import { createVoiceStudio } from '../tools/voice/voicestudio.mjs';
import { STATE, endpointIdentity } from '../tools/voice/provider.mjs';

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? '  ok  ' : '  FAIL'} ${name}${detail ? `  ${detail}` : ''}`);
  if (!ok) failed++;
};

/** Minimal WAV so the adapter's byte handling is exercised on something real. */
function wav(seconds = 1, rate = 8000) {
  const n = seconds * rate, dataLen = n * 2, buf = Buffer.alloc(44 + dataLen);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + dataLen, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22); buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 2, 28);
  buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(dataLen, 40);
  return buf;
}

function serve(handler) {
  return new Promise((res) => {
    const s = http.createServer(handler);
    s.listen(0, '127.0.0.1', () => res({ s, url: `http://127.0.0.1:${s.address().port}` }));
  });
}

async function withServer(handler, fn) {
  const { s, url } = await serve(handler);
  try { return await fn(url); } finally { s.close(); }
}

console.log('\nVoiceStudio adapter — behaviour against the discovered contract\n');

/* ---- /health 200 ------------------------------------------------------- */
await withServer((req, res) => {
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', device: 'cuda (T4)', version: '1.2.3' }));
}, async (url) => {
  const r = await createVoiceStudio({ url }).probe();
  check('healthy backend -> CONFIGURED', r.state === STATE.CONFIGURED, r.state);
  check('device and version surfaced', r.device === 'cuda (T4)' && r.version === '1.2.3');
});

/* ---- /health 503 starting ---------------------------------------------- */
await withServer((req, res) => {
  res.writeHead(503, { 'content-type': 'application/json', 'retry-after': '2' });
  res.end(JSON.stringify({ status: 'starting', step: 3, label: 'loading model' }));
}, async (url) => {
  const r = await createVoiceStudio({ url }).probe();
  check('503 starting -> UNREACHABLE, not FAILED', r.state === STATE.UNREACHABLE, r.state);
  check('503 starting is flagged as still-loading', r.starting === true,
    r.starting ? '' : 'would read as a dead backend');
});

/* ---- /generate happy path ---------------------------------------------- */
await withServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', device: 'cpu', version: 'x' }));
  }
  const body = wav(2);
  res.writeHead(200, {
    'content-type': 'audio/wav',
    'x-audio-duration': '166.42', 'x-gen-time': '31.5', 'x-seed': '4242',
    'x-audio-id': 'take_9', 'content-length': String(body.length),
  });
  res.end(body);
}, async (url) => {
  const r = await createVoiceStudio({ url }).generate('xin chào', { speed: 1.0, seed: 4242 });
  check('WAV response -> SUCCEEDED', r.state === STATE.SUCCEEDED, r.state);
  check('duration read from X-Audio-Duration', r.durationSec === 166.42, String(r.durationSec));
  check('seed and audio id surfaced', r.seed === '4242' && r.audioId === 'take_9');
  check('body kept as bytes', Buffer.isBuffer(r.wav) && r.wav.subarray(0, 4).toString() === 'RIFF');
});

/* ---- /generate 200 but text was dropped -------------------------------- */
await withServer((req, res) => {
  const body = wav(1);
  res.writeHead(200, {
    'content-type': 'audio/wav',
    'x-audio-duration': '12.0',
    'x-omnivoice-dropped-chunks': '2',
    'x-omnivoice-dropped-text': 'broken object level authorization | ...',
  });
  res.end(body);
}, async (url) => {
  const r = await createVoiceStudio({ url }).generate('…');
  check('dropped chunks -> FAILED even though HTTP is 200',
    r.state === STATE.FAILED, r.state);
  check('failure names the silent-truncation risk',
    /produced no audio/.test(r.reason || ''), r.reason);
});

/* ---- /generate error --------------------------------------------------- */
await withServer((req, res) => {
  res.writeHead(422, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ detail: 'text must not be empty' }));
}, async (url) => {
  const r = await createVoiceStudio({ url }).generate('');
  check('HTTP error -> FAILED with detail', r.state === STATE.FAILED && /422/.test(r.reason));
});

/* ---- missing duration header ------------------------------------------- */
await withServer((req, res) => {
  const body = wav(1);
  res.writeHead(200, { 'content-type': 'audio/wav' });
  res.end(body);
}, async (url) => {
  const r = await createVoiceStudio({ url }).generate('x');
  check('no X-Audio-Duration -> FAILED (timing is the deliverable)',
    r.state === STATE.FAILED, r.state);
});

/* ---- credentials are optional and only sent when configured ------------ */
await withServer((req, res) => {
  const seen = { pin: req.headers['x-omnivoice-pin'] || '', auth: req.headers['authorization'] || '' };
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', device: 'cpu', version: JSON.stringify(seen) }));
}, async (url) => {
  const bare = await createVoiceStudio({ url }).probe();
  check('no credentials sent when none configured', bare.version === '{"pin":"","auth":""}', bare.version);
  const withCreds = await createVoiceStudio({ url, pin: '123456', apiKey: 'k' }).probe();
  check('pin and bearer sent when configured',
    withCreds.version === '{"pin":"123456","auth":"Bearer k"}', withCreds.version);
});

/* ---- voice profile: the take must say which voice made it ---------------
   /generate returns the seed, the duration and an audio id — and nothing about the voice.
   generation.py:1312 takes `if profile_id:` then `if row:`, so an id matching no row falls
   through to the DEFAULT voice and still answers 200 with a playable WAV. Echoing back the
   profile_id we sent would therefore verify nothing; the provider's own history row is the
   only independent record, and X-Audio-Id is that row's id (generation.py:890 -> :904). */

const PROFILES = [
  { id: 'p-7f2a', name: 'namtre_v2', kind: 'clone' },
  { id: 'p-0001', name: 'default_female', kind: 'design' },
  { id: 'p-9c31', name: 'duplicate', kind: 'clone' },
  { id: 'p-9c32', name: 'Duplicate', kind: 'clone' },
];

/** Mock that honours profile_id the way the real backend does: unknown -> default voice. */
function providerWith({ history = [], profiles = PROFILES } = {}) {
  return (req, res) => {
    const [route] = req.url.split('?');
    const json = (code, body) => {
      res.writeHead(code, { 'content-type': 'application/json' });
      res.end(JSON.stringify(body));
    };
    if (route === '/profiles') return json(200, profiles);
    if (route.startsWith('/profiles/')) {
      const id = decodeURIComponent(route.slice('/profiles/'.length));
      const row = profiles.find((p) => p.id === id);
      return row ? json(200, row) : json(404, { detail: "That voice profile doesn't exist." });
    }
    if (route === '/history') return json(200, history);
    return json(404, { detail: 'no route' });
  };
}

await withServer(providerWith(), async (url) => {
  const vs = createVoiceStudio({ url });

  const byId = await vs.getProfile('p-7f2a');
  check('getProfile finds a real id', byId.state === STATE.SUCCEEDED && byId.body.name === 'namtre_v2',
    byId.state);

  const missing = await vs.getProfile('namtre_v2');
  check('getProfile on a name is a 404, not a match', missing.state === STATE.FAILED && missing.notFound === true,
    missing.state);

  const all = await vs.listProfiles();
  check('listProfiles returns every row', all.state === STATE.SUCCEEDED && all.body.length === 4,
    String(all.body?.length));

  // The name -> id fallback and its ambiguity rule live in cv.mjs; what the adapter has to
  // supply is the raw material for both, which is the full list plus exact-id lookup.
  const hits = all.body.filter((p) => p.name.toLowerCase() === 'duplicate');
  check('two rows can share a name — an id is the only unambiguous pin', hits.length === 2,
    String(hits.length));
});

await withServer(providerWith({
  history: [{ id: 'aud-1', profile_id: 'p-7f2a', text: 'x' },
            { id: 'aud-2', profile_id: null, text: 'y' }],
}), async (url) => {
  const vs = createVoiceStudio({ url });

  const good = await vs.historyProfile('aud-1');
  check('historyProfile reports the voice that actually drove the take',
    good.state === STATE.SUCCEEDED && good.profileId === 'p-7f2a', String(good.profileId));

  // The dangerous case: the caller asked for a profile, the provider ignored an unknown id
  // and used its default. The take succeeded; the voice is wrong.
  const fellBack = await vs.historyProfile('aud-2');
  check('a take that fell back to the default voice reports profile_id null',
    fellBack.state === STATE.SUCCEEDED && fellBack.profileId === null, String(fellBack.profileId));

  // The provider writes history best-effort and returns the audio even if the insert fails,
  // so a missing row is possible. Unverifiable is not the same as wrong, and both have to
  // stop a run that promised one voice.
  const absent = await vs.historyProfile('aud-nope');
  check('a take with no history row is FAILED, not silently accepted',
    absent.state === STATE.FAILED && absent.unrecorded === true, absent.state);
  check('the unverifiable take says why', /did not record this take/.test(absent.reason || ''),
    absent.reason);
});

/* ---- endpoint identity is committable ---------------------------------- */
const id = endpointIdentity('https://abc-def-123.trycloudflare.com');
check('endpoint identity keeps the host suffix', /^trycloudflare\.com · sha256:[0-9a-f]{16}$/.test(id), id);
check('endpoint identity does not leak the URL', !id.includes('abc-def-123'), id);

console.log(failed ? `\n${failed} check(s) failed\n` : '\nall checks passed\n');
process.exitCode = failed ? 1 : 0;
