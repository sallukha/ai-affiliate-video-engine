# Architecture

## Frontend

`affiliateops-ai-studio` is the existing React + TypeScript + Vite frontend. It keeps the current pages, routing, Tailwind styling, context, and service layer.

Live API calls are centralized in `src/services`.

## Backend

The backend remains at the repository root because the existing Remotion, FFmpeg, Gemini, and Sarvam prototype already uses this layout.

Request flow:

```text
Express /api/v1 routes
-> Zod validation
-> in-memory product/video/workflow service
-> existing local video pipeline
-> storage output under STORAGE_PATH
```

The frontend-facing integration layer is in `src/modules/v1`.

## Video Pipeline

`POST /api/v1/videos` converts frontend product input into the existing `ProductInput` contract and invokes `createTestPipelineJob`.

That pipeline performs:

1. Product image resolution with safe fallback SVG.
2. Gemini script and narration generation via `src/providers/llm/gemini.service.ts`.
3. Sarvam Bulbul TTS via `src/providers/tts/sarvam.service.ts`.
4. Remotion render via `src/modules/video/remotion/render.service.ts`.
5. MP4 output in `storage/output/videos`.

## Persistence

Products, videos, and workflows are currently stored in memory. This matches the existing prototype and keeps integration real without inventing a MongoDB layer that was not present.

Next production step: replace `src/modules/v1/v1.service.ts` maps with MongoDB repositories and move long-running generation to BullMQ/Redis.
