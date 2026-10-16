import { Router } from "express";
import {
  getAudio,
  getSingleAudio,
  removeAudio,
  uploadAudio,
} from "./audio.controller";

const router = Router();

router.post("/", uploadAudio);
router.get("/", getAudio);
router.get("/:id", getSingleAudio);
router.delete("/:id", removeAudio);

export default router;