 import express from "express";

import captionsRoutes from "./src/modules/captions/captions.routes";
import generationRoutes from "./src/modules/generation/generation.routes";

import audioRoutes from "./src/modules/media/audio/audio.routes";
import imageRoutes from "./src/modules/media/image/image.routes";

import promptRoutes from "./src/modules/script/prompts/prompt.routes";
import storyboardPromptRoutes from "./src/modules/storyboard/prompts/prompt.routes";

const app = express();

app.use(express.json());

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

export default app;