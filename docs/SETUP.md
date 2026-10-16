# Setup

## Backend

```bash
npm install
cp .env.example .env
npm run dev
```

Required for real generation:

- `GEMINI_API_KEY`
- `SARVAM_API_KEY`
- `FFMPEG_PATH` if `ffmpeg` is not on PATH

Health check:

```bash
curl http://localhost:5000/api/v1/health
```

## Frontend

```bash
cd affiliateops-ai-studio
npm install --legacy-peer-deps
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

## End-To-End Test

1. Start the backend.
2. Start the frontend.
3. Confirm the header health indicator can reach `http://localhost:5000/api/v1`.
4. Go to Products and add a product.
5. Click Generate Video.
6. Submit the Create Video form.
7. Watch `/videos/progress/:id` poll the backend.
8. When completed, preview or download the MP4 from the video library.

## Troubleshooting

- Missing Gemini or Sarvam keys will cause generation jobs to fail at the relevant pipeline stage.
- If frontend install reports peer dependency conflicts, use `npm install --legacy-peer-deps`.
- The frontend build may warn that the bundle is larger than 500 kB. That is a warning, not a failed build.
- Generated media is written under `storage/` and should remain out of Git.
