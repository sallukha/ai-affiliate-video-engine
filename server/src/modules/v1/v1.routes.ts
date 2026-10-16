import { Router } from "express";
import { ZodError } from "zod";
import {
  cancelVideo,
  createProduct,
  createVideo,
  deleteProduct,
  getAnalytics,
  getProduct,
  getVideo,
  getWorkflow,
  importProducts,
  listProducts,
  listVideos,
  listWorkflows,
  retryVideo,
  updateProduct,
} from "./v1.service";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "affiliateops-ai-backend",
    timestamp: new Date().toISOString(),
  });
});

router.get("/products", (_req, res) => res.json(listProducts()));
router.post("/products", (req, res) => handle(res, () => res.status(201).json(createProduct(req.body))));
router.post("/products/import", (req, res) => handle(res, () => res.status(201).json(importProducts(req.body))));
router.get("/products/:id", (req, res) => {
  const product = getProduct(req.params.id);
  return product ? res.json(product) : res.status(404).json({ message: "Product not found" });
});
router.patch("/products/:id", (req, res) => handle(res, () => {
  const product = updateProduct(req.params.id, req.body);
  return product ? res.json(product) : res.status(404).json({ message: "Product not found" });
}));
router.delete("/products/:id", (req, res) => {
  return deleteProduct(req.params.id) ? res.status(204).send() : res.status(404).json({ message: "Product not found" });
});

router.get("/videos", (_req, res) => res.json(listVideos()));
router.post("/videos", (req, res) => handle(res, () => res.status(202).json(createVideo(req.body))));
router.post("/videos/generate", (req, res) => handle(res, () => res.status(202).json(createVideo(req.body))));
router.get("/videos/:id", (req, res) => {
  const video = getVideo(req.params.id);
  return video ? res.json(video) : res.status(404).json({ message: "Video not found" });
});
router.get("/videos/:id/status", (req, res) => {
  const video = getVideo(req.params.id);
  return video ? res.json(video) : res.status(404).json({ message: "Video not found" });
});
router.post("/videos/:id/cancel", (req, res) => {
  const video = cancelVideo(req.params.id);
  return video ? res.json(video) : res.status(404).json({ message: "Video not found" });
});
router.post("/videos/:id/retry", (req, res) => handle(res, () => {
  const video = retryVideo(req.params.id);
  return video ? res.status(202).json(video) : res.status(404).json({ message: "Video not found" });
}));

router.get("/workflows", (_req, res) => res.json(listWorkflows()));
router.get("/workflows/:id", (req, res) => {
  const workflow = getWorkflow(req.params.id);
  return workflow ? res.json(workflow) : res.status(404).json({ message: "Workflow not found" });
});

router.get("/analytics/overview", (_req, res) => res.json(getAnalytics()));

function handle(res: import("express").Response, action: () => unknown): void {
  try {
    action();
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: "Validation failed", errors: error.issues });
      return;
    }
    res.status(500).json({ message: error instanceof Error ? error.message : "Unexpected error" });
  }
}

export default router;
