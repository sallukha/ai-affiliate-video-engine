import { Request, Response } from "express";
import {
  createAudio,
  deleteAudio,
  getAllAudio,
  getAudioById,
} from "./audio.service";

export const uploadAudio = (req: Request, res: Response) => {
  const { url, mimeType, size, duration } = req.body;

  if (!url || !mimeType) {
    return res.status(400).json({
      success: false,
      message: "url and mimeType are required",
    });
  }

  if (!mimeType.startsWith("audio/")) {
    return res.status(400).json({
      success: false,
      message: "Only audio files are allowed",
    });
  }

  const audio = createAudio({
    url,
    mimeType,
    size,
    duration,
  });

  return res.status(201).json({
    success: true,
    message: "Audio created successfully",
    data: audio,
  });
};

export const getAudio = (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    data: getAllAudio(),
  });
};

export const getSingleAudio = (req: Request, res: Response) => {
  const audio = getAudioById(req.params.id);

  if (!audio) {
    return res.status(404).json({
      success: false,
      message: "Audio not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: audio,
  });
};

export const removeAudio = (req: Request, res: Response) => {
  const deleted = deleteAudio(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: "Audio not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Audio deleted successfully",
  });
};