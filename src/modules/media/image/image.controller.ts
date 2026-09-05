import { Request, Response } from "express";
import {
  createImage,
  deleteImage,
  getAllImages,
  getImageById,
} from "./image.service";

export const uploadImage = (req: Request, res: Response) => {
  const { url, mimeType, size, width, height } = req.body;

  if (!url || !mimeType) {
    return res.status(400).json({
      success: false,
      message: "url and mimeType are required",
    });
  }

  if (!mimeType.startsWith("image/")) {
    return res.status(400).json({
      success: false,
      message: "Only image files are allowed",
    });
  }

  const image = createImage({
    url,
    mimeType,
    size,
    width,
    height,
  });

  return res.status(201).json({
    success: true,
    message: "Image created successfully",
    data: image,
  });
};

export const getImages = (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    data: getAllImages(),
  });
};

export const getSingleImage = (req: Request, res: Response) => {
  const image = getImageById(req.params.id);

  if (!image) {
    return res.status(404).json({
      success: false,
      message: "Image not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: image,
  });
};

export const removeImage = (req: Request, res: Response) => {
  const deleted = deleteImage(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: "Image not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Image deleted successfully",
  });
};