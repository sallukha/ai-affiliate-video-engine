import { Router } from "express";
import {
  addProduct,
  getAllProducts,
  getSingleProduct,
  removeProduct,
} from "./product.controller";

const router = Router();

router.post("/", addProduct);
router.get("/", getAllProducts);
router.get("/:id", getSingleProduct);
router.delete("/:id", removeProduct);

export default router;