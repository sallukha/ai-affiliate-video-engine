import captionsRoutes from "./modules/captions/captions.routes";

import generationRoutes from "./modules/generation/generation.routes";

app.use("/api/generation", generationRoutes);
app.use("/api/captions", captionsRoutes);