import express from "express";

import captionsRoutes from "./modules/captions/captions.routes";
import generationRoutes from "./modules/generation/generation.routes";

import audioRoutes from "./modules/media/audio/audio.routes";
import imageRoutes from "./modules/media/image/image.routes";

import promptRoutes from "./modules/script/prompts/prompt.routes";
import storyboardPromptRoutes from "./modules/storyboard/prompts/prompt.routes";
import { errorMiddleware, notFoundMiddleware } from "./shared/middleware";
import { env } from "./config/env";
import testPipelineRoutes from "./modules/video/test-pipeline/test-pipeline.routes";
import v1Routes from "./modules/v1/v1.routes";

const app = express();

function isAllowedOrigin(origin: string): boolean {
  if (env.frontendOrigins.includes(origin)) return true;
  if (env.nodeEnv === "production") return false;

  try {
    const url = new URL(origin);
    const isDevPort = ["3000", "3001", "5173"].includes(url.port);
    const isLocalHost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    const isPrivateLan = /^(10|192\.168|172\.(1[6-9]|2\d|3[0-1]))\./.test(url.hostname);
    return isDevPort && (isLocalHost || isPrivateLan);
  } catch {
    return false;
  }
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
  }
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Request-Id");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});
app.use((_req, res, next) => {
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("Referrer-Policy", "no-referrer");
  next();
});
app.use(express.json({ limit: "8mb" }));
app.use("/storage", express.static(env.storagePath));

app.use("/api/v1", v1Routes);

// Storyboard prompts
app.use(
  "/api/storyboard/prompts",
  storyboardPromptRoutes
);

// Media
app.use("/api/media/audio", audioRoutes);
app.use("/api/media/image", imageRoutes);

// Generation
app.use("/api/generation", generationRoutes);

// Captions
app.use("/api/captions", captionsRoutes);

// General script prompts
app.use("/api/prompts", promptRoutes);
app.use("/api/video", testPipelineRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
