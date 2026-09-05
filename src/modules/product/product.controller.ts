import { Request, Response } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
} from "./product.service";

export const addProduct = (req: Request, res: Response) => {
  const {
    name,
    description,
    price,
    currency,
    imageUrl,
    productUrl,
    affiliateUrl,
    source,
  } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Product name is required",
    });
  }

  const product = createProduct({
    name,
    description,
    price,
    currency,
    imageUrl,
    productUrl,
    affiliateUrl,
    source,
  });

  return res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
};

export const getAllProducts = (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    data: getProducts(),
  });
};

export const getSingleProduct = (req: Request, res: Response) => {
  const product = getProductById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: product,
  });
};

export const removeProduct = (req: Request, res: Response) => {
  const deleted = deleteProduct(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
};