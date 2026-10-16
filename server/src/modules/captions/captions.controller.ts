import type { Request, Response } from "express";
import { generateCaptions } from "./captions.service";

export function generateCaptionsController(
  req: Request,
  res: Response
) {
  try {
    const { text, durationInSeconds } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        message: "text is required",
      });
    }

    if (
      typeof durationInSeconds !== "number" ||
      durationInSeconds <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "durationInSeconds must be a positive number",
      });
    }

    const result = generateCaptions({
      text,
      durationInSeconds,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Caption generation failed:", error);

    return res.status(500).json({
      success: false,
      message: "Caption generation failed",
    });
  }
}