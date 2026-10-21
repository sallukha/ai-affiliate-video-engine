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

## Authentication

Login and signup store user records and revocable sessions in MongoDB. Set `MONGODB_URI` in `server/.env` (`MONGODB_DATABASE` defaults to `affiliate_video_engine`), plus these backend-only variables:

```dotenv
JWT_SECRET=<at least 32 random bytes, encoded as hex>
JWT_EXPIRES_IN=15m
JWT_ISSUER=ai-affiliate-video-engine
JWT_AUDIENCE=ai-affiliate-video-engine-client
FRONTEND_ORIGIN=http://localhost:3000
```

Generate a strong secret locally with `node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))"` and store its output only in `server/.env` or a deployment secret manager. Never use a `VITE_` variable for `JWT_SECRET`.

The browser receives only an HttpOnly, SameSite=Lax cookie. Its 15 minute JWT is checked against a MongoDB session record, so logout revokes the session immediately. Production cookies are Secure; deploy frontend and backend over HTTPS on a same-site domain and set `FRONTEND_ORIGIN` to the exact frontend origin(s). Existing video and product APIs remain unchanged and are not server-side protected by this addition.

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
