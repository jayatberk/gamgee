# Agents Guide

## What This App Does
Desktop Electron AI screen assistant. The user speaks a question, the app captures their screen, sends both to GPT-4.1 vision, and speaks the response back. The full pipeline runs in a loop.

## Pipeline

```
recordAudio()        → base64 WAV  ─┐
                                     ├─→ callGpt41(image, prompt) → speakText()
captureScreen()      → base64 JPG  ─┘                            → showOverlay()
```

## Module Responsibilities

| Module | File | Status | What it does |
|---|---|---|---|
| Capture | `src/capture/index.js` | Done | Screenshots screen → base64 JPG |
| Audio | `src/audio/index.js` | Done | Records mic until silence → base64 WAV |
| AI | `src/ai/index.js` | Done | Sends image + prompt to GPT-4.1, maintains conversation history |
| TTS | `src/tts/index.js` | Done | Speaks text via `say` (macOS) or OpenAI TTS (other platforms) |
| Overlay | `src/overlay/index.js` | Stub | Transparent window with arrows/annotations — not yet implemented |
| Preload | `src/preload.js` | Stub | Electron contextBridge — not yet implemented |

## Data Formats
Every module boundary uses **base64 strings**, not raw Buffers. This keeps the interface consistent and ready for API calls.
- `captureScreen()` → base64 JPEG (`data:image/jpeg;base64,...` prefix added by `callGpt41`)
- `recordAudio()` → base64 WAV (16kHz, mono)
- `callGpt41()` → plain text string (assistant reply)
- `speakText()` → void (fire and forget after awaiting)

## AI Module Rules
- `messages` array in `src/ai/index.js` is module-level state — it persists across calls intentionally for conversation context.
- The system prompt is always at index 0 and must never change mid-session. This is required for OpenAI prompt caching to work (cached prefix must be identical across calls).
- On API failure, the failed user message is popped from history so the array stays clean.
- `resetConversation()` removes everything after the system prompt (index 0). Call it when the user starts a new task.
- Never change the system prompt content without considering cache invalidation.

## Platform Behavior
| Feature | macOS | Linux | Windows |
|---|---|---|---|
| Screen capture | `screenshot-desktop` | `screenshot-desktop` + `scrot` | `screenshot-desktop` |
| Audio recording | `sox` (brew) | `sox` (apt) | `sox` (installer) |
| TTS | `say` (built-in) | OpenAI TTS API + `play` (sox) | OpenAI TTS API + `play` (sox) |

`speakText` branches on `process.platform === 'darwin'`. Do not collapse this into a single path.

## System Dependencies (not npm)
- **`sox`** — required on all platforms for `recordAudio`. Install: `brew install sox` / `apt install sox`.
- **`say`** — macOS only, built-in, no install needed.
- **`play`** — part of sox, used for audio playback on non-macOS.

## Environment Variables
- `OPENAI_API_KEY` — required for `callGpt41` and `speakText` (non-macOS). Load via dotenv. Never hardcode.

## Testing Rules
- **Never test real hardware** (mic, screen, display) in automated tests. Mock all system dependencies.
- `screenshot-desktop` is a `defaultExport` mock: `mock.module('screenshot-desktop', { defaultExport: () => Promise.resolve(buffer) })`.
- `node-record-lpcm16` is a `namedExports` mock: `mock.module('node-record-lpcm16', { namedExports: { record: () => ... } })`.
- **Mock must be set up before `require`ing the module under test.** The mock intercepts the `require` call inside the source file.
- Use `process.nextTick` in stream mocks to ensure event listeners are registered before `data`/`end` fire.
- All test scripts require `--test --experimental-test-module-mocks` flags (set in `package.json` scripts).
- Use `Buffer.subarray()` not `Buffer.slice()` (deprecated).

## Adding a New Module Test
1. Mock the external dependency before requiring the source module.
2. Use `describe` + `it` from `node:test`, `assert` from `node:assert/strict`.
3. Add the script to `package.json`: `node --test --experimental-test-module-mocks test/test-<name>.js`.
4. Add a syntax check entry and test step in `.github/workflows/ci.yml`.

## CI
- Runs on `macos-latest` and `ubuntu-latest` with `fail-fast: false`.
- `sox` is installed as a system dep on both platforms (needed even though tests are mocked, because it's a runtime dependency).
- Node 20 minimum (`--experimental-test-module-mocks` added in Node 20.18.0).
- `npm ci` not `npm install`.
- Tests run identically on both platforms — no OS-conditional test steps.

## What Still Needs Implementation
- `src/overlay/index.js` — `showOverlay(text, arrowTarget)`: transparent Electron window drawn over the screen with annotations pointing at UI elements.
- `src/preload.js` — expose pipeline functions to the renderer via `contextBridge`.
- `src/main.js` — Electron main process: app lifecycle, hotkey to trigger the pipeline, wiring all modules together.
- Audio transcription step: `recordAudio()` produces base64 WAV which needs to be sent to a transcription API (e.g. OpenAI Whisper) before being passed as `prompt` to `callGpt41`.
