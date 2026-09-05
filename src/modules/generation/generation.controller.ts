import type { Request, Response } from "express";
import { generateVideo } from "./generation.service";

export async function generateVideoController(
  req: Request,
  res: Response
) {
  try {
    const {
      productId,
      title,
      description,
      imageUrl,
      durationInSeconds,
    } = req.body;

    if (!title || typeof title !== "string") {
      return res.status(400).json({
        success: false,
        message: "title is required",
      });
    }

    const result = await generateVideo({
      productId,
      title,
      description,
      imageUrl,
      durationInSeconds,
    });

    return res.status(201).json({
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