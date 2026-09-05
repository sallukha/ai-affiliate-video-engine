import { Router } from "express";
import { generateCaptionsController } from "./captions.controller";

const router = Router();

router.post("/generate", generateCaptionsController);

export default router;