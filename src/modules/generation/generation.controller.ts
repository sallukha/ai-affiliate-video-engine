import type { Request, Response } from "express";
import { cancelGeneration, generateVideo, getGeneration } from "./generation.service";

export async function generateVideoController(
  req: Request,
  res: Response
) {
  try {
    const { productId, title, description, imageUrl, durationInSeconds, projectId, userId, storyboard } = req.body;

    if ((!storyboard && !title) || (title !== undefined && typeof title !== "string")) {
      return res.status(400).json({
        success: false,
        message: "title is required",
      });
    }

    const result = await generateVideo({
      productId,
      projectId,
      userId,
      storyboard,
      title,
      description,
      imageUrl,
      durationInSeconds,
    });

    return res.status(202).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Generation controller error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate video",
    });
  }
}

export function getGenerationController(req: Request, res: Response) {
  const result = getGeneration(req.params.id as string);
  if (!result) return res.status(404).json({ success: false, message: "Generation not found" });
  return res.status(200).json({ success: true, data: result });
}

export function cancelGenerationController(req: Request, res: Response) {
  const result = cancelGeneration(req.params.id as string);
  if (!result) return res.status(404).json({ success: false, message: "Generation not found" });
  return res.status(200).json({ success: true, data: result });
}