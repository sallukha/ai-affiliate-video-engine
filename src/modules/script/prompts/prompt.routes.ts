import { Router } from "express";
import promptController from "./prompt.controller";

const router = Router();

router.post("/", promptController.createPrompt);

router.get("/", promptController.getAllPrompts);

router.post("/generate", promptController.generatePrompt);
router.get("/:promptId", promptController.getPromptById);

router.put("/:promptId", promptController.updatePrompt);

router.delete("/:promptId", promptController.deletePrompt);


export default router;