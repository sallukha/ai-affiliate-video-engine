import captionsRoutes from "./modules/captions/captions.routes";

import generationRoutes from "./modules/generation/generation.routes";

import audioRoutes from "./modules/media/audio/audio.routes";
import imageRoutes from "./modules/media/image/image.routes";

app.use("/api/media/audio", audioRoutes);
app.use("/api/media/image", imageRoutes);

app.use("/api/generation", generationRoutes);
app.use("/api/captions", captionsRoutes);