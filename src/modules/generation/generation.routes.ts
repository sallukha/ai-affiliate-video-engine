import { Router } from "express";
import { generateVideoController } from "./generation.controller";

const router = Router();

router.post("/generate", generateVideoController);

export default router;