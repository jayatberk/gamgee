# Gamgee

**A desktop AI assistant that sees your screen and talks to you.**

Press a hotkey. Speak your question. Gamgee captures your screen, understands what you're looking at, and answers out loud — with context from your entire conversation.

---

## How It Works

```
You speak     →  your voice is recorded until you stop talking
Your screen   →  a screenshot is captured at the same moment
Both          →  sent to GPT-4.1 vision with your full conversation history
Response      →  spoken back to you out loud
```

No typing. No switching windows. Just ask.

---

## Features

- **Voice input** — records until you stop talking, no button to hold
- **Screen awareness** — GPT-4.1 sees exactly what you see
- **Conversation memory** — context from previous questions is passed on every call, so you can say "now do the second one" and it knows what you mean
- **Prompt caching** — conversation history is structured to take advantage of OpenAI's prompt caching, keeping costs low as conversations grow
- **Cross-platform** — macOS, Linux, and Windows
- **Native voice** — uses macOS's built-in `say` on Mac, OpenAI TTS everywhere else

---

## Requirements

- Node.js 20.18+
- An OpenAI API key
- [sox](https://sox.sourceforge.net) for audio recording
  ```bash
  # macOS
  brew install sox

  # Ubuntu / Debian
  sudo apt install sox
  ```

---

## Setup

```bash
git clone https://github.com/yourusername/gamgee.git
cd gamgee
npm install
```

Create a `.env` file in the project root:

```
OPENAI_API_KEY=your_key_here
```

---

## Run

```bash
npm start
```

---

## Tests

```bash
npm run test:capture
npm run test:audio
```

All tests are fully mocked; no microphone or display required.

---

## Architecture

Gamgee is built as a set of focused, single-responsibility modules:

| Module | What it does |
|---|---|
| `src/capture` | Screenshots the screen → base64 JPEG |
| `src/audio` | Records mic until silence → base64 WAV |
| `src/ai` | Manages conversation history, calls GPT-4.1 vision |
| `src/tts` | Speaks the response out loud |
| `src/overlay` | Draws annotations on screen *(coming soon)* |

Every module boundary passes data as **base64 strings** so each piece is independently testable and the formats are ready for API calls without transformation.

---

## Roadmap

- [ ] Overlay window with arrows pointing at screen elements
- [ ] Whisper transcription for the audio pipeline
- [ ] Global hotkey to trigger from any app
- [ ] Electron UI with conversation history
- [ ] Configurable voice and personality
- [ ] Add local model support

---

## License

MIT
