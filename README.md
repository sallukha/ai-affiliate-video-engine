# AI Affiliate Video Engine

AffiliateOps AI is a React frontend plus Node/TypeScript backend for generating affiliate marketing videos from product details.

## Structure

```text
.
|-- app.ts                         # Express app and route mounting
|-- src/                           # Backend modules, providers, config, shared utilities
|   |-- modules/v1/                # Frontend-facing /api/v1 integration layer
|   |-- providers/llm/             # Gemini integration
|   |-- providers/tts/             # Sarvam Bulbul TTS integration
|   `-- modules/video/remotion/    # Remotion render pipeline
|-- affiliateops-ai-studio/        # Existing React + TypeScript + Vite frontend
|-- storage/                       # Runtime media output, ignored by Git
|-- docs/                          # API, setup, and architecture docs
`-- tests/                         # Backend smoke tests
```

The frontend and backend remain separate. The existing backend is at the repository root to preserve the working Remotion and TypeScript paths already in this project.

## Local Setup

Backend:

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend:

```bash
cd affiliateops-ai-studio
npm install --legacy-peer-deps
cp .env.example .env
npm run dev
```

Open the frontend at `http://localhost:3000`. The frontend defaults to `http://localhost:5000/api/v1`.

## Required Environment

Backend video generation requires:

- `GEMINI_API_KEY`
- `SARVAM_API_KEY`
- `FFMPEG_PATH` or `ffmpeg` on PATH
- `STORAGE_PATH=storage`

`MONGODB_URI` and `REDIS_URL` are documented placeholders for the next persistence/queue stage. The current integration uses an in-memory job store and the existing async local pipeline.

## Verification

Commands run during integration:

```bash
npm run build
npm test
cd affiliateops-ai-studio
npm run lint
npm run build
```

The frontend production build emits a chunk-size warning only. See `docs/SETUP.md` for troubleshooting.
