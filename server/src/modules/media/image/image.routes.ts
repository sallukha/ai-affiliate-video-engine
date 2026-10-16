import { Router } from "express";
import {
  getImages,
  getSingleImage,
  removeImage,
  uploadImage,
} from "./image.controller";

const router = Router();

router.post("/", uploadImage);
router.get("/", getImages);
router.get("/:id", getSingleImage);
router.delete("/:id", removeImage);

export default router;