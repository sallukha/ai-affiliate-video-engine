import { Router } from "express";
import { getTestGeneration, startTestGeneration } from "./test-pipeline.controller";

const router = Router();

router.post("/test-generate", startTestGeneration);
router.get("/test-generate/:jobId", getTestGeneration);

export default router;
