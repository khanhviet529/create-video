/**
 * Preloaded before the HyperFrames CLI (node --require this-file hyperframes.mjs …).
 *
 * WHY THIS EXISTS. Four windows appear on screen on every render, snap and gate. They are
 * not cmd — they are `chrome-headless-shell.exe` and its children. Unlike `chrome.exe`,
 * which is a GUI-subsystem binary, chrome-headless-shell is built as a CONSOLE-subsystem
 * executable, so Windows gives it a console.
 *
 * WHAT DID NOT WORK, measured rather than reasoned. Setting `windowsHide: true` on the
 * browser spawn is not enough. Polling visible top-level windows across a full render
 * showed this present in 621 of 621 samples, owned by the browser process itself:
 *
 *   chrome-headless-shell | C:\Users\...\chrome-headless-shell-win64\chrome-headless-shell.exe
 *
 * The flag was being set and then ignored. puppeteer spawns the browser with
 * `detached: true`; libuv turns that into DETACHED_PROCESS, which conflicts with
 * CREATE_NO_WINDOW — the child does not inherit the parent's console, so Windows
 * allocates it a brand new one, window included.
 *
 * WHAT WORKS. For the browser binary only, drop `detached` as well. The child then
 * inherits the console of the node process cv.mjs already spawned with windowsHide, and
 * that console has no window. Scoped to the browser so nothing else changes in the CLI:
 * puppeteer uses detached to survive console signals, and these renders are short-lived
 * and closed explicitly over CDP.
 *
 * WHY NOT the two obvious alternatives:
 *   - Point HYPERFRAMES_BROWSER_PATH at the full chrome.exe. GUI subsystem, so no console
 *     at all — but it swaps the rasteriser mid-project. Every frame already shipped came
 *     from the headless shell, and pixel-exact claims like the shot_06 → shot_07 match cut
 *     would have to be re-established for a cosmetic problem.
 *   - Patch node_modules/@puppeteer/browsers. Lost on the next npm install.
 *
 * `child_process` and `node:child_process` are the same module instance, and this runs
 * before any of the CLI's imports are evaluated, so the bundled `import { spawn }` binding
 * picks up the patched function.
 *
 * Set CV_SPAWN_DEBUG=1 to print what actually goes through here.
 */
'use strict';
const cp = require('node:child_process');

const debug = process.env.CV_SPAWN_DEBUG === '1';
const BROWSER = /(chrome|chromium|headless_shell|headless-shell|msedge|firefox)/i;

// spawn(file) | spawn(file, args) | spawn(file, options) | spawn(file, args, options)
function hide(original, name) {
  return function (file, second, third) {
    const browser = typeof file === 'string' && BROWSER.test(file);
    const fix = (given) => {
      const options = Object.assign({}, given || {}, { windowsHide: true });
      if (browser && options.detached) options.detached = false;
      if (debug) {
        process.stderr.write('[no-console-window] ' + name +
          (browser ? ' BROWSER detached->false' : '') + ' ' + file + '\n');
      }
      return options;
    };
    if (Array.isArray(second)) return original.call(this, file, second, fix(third));
    return original.call(this, file, fix(second));
  };
}

// Only spawn/spawnSync: their second argument is never a callback, so the signature
// sniffing above is safe. execFile/exec take a trailing callback that can sit in either
// position, and swallowing it would break them — the browser does not go through them.
cp.spawn = hide(cp.spawn, 'spawn');
cp.spawnSync = hide(cp.spawnSync, 'spawnSync');
