import type { Request, Response } from "express";
import { createTestPipelineJob, getTestPipelineJob, loadMockProduct, loadSampleStoryboard } from "./test-pipeline.service";
import type { ProductInput, TestStoryboard } from "./test-pipeline.types";

export async function startTestGeneration(req: Request, res: Response) {
  try {
    const product = req.body?.product as ProductInput | undefined;
    const storyboard = req.body?.storyboard as TestStoryboard | undefined;
    const job = createTestPipelineJob(product ?? await loadMockProduct(), storyboard ?? await loadSampleStoryboard());
    return res.status(202).json({ success: true, data: job });
  } catch (error) {
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Invalid storyboard" });
  }
}

export function getTestGeneration(req: Request, res: Response) {
  const job = getTestPipelineJob(String(req.params.jobId));
  if (!job) return res.status(404).json({ success: false, message: "Test generation job not found" });
  return res.status(200).json({ success: true, data: job });
}
