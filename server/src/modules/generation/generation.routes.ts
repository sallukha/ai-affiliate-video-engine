import { Router } from "express";
import { cancelGenerationController, generateVideoController, getGenerationController } from "./generation.controller";

const router = Router();

router.post("/generate", generateVideoController);
router.get("/:id", getGenerationController);
router.post("/:id/cancel", cancelGenerationController);

export default router;