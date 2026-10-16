import type { Request, Response } from "express";
import { getHealthStatus } from "./health.service";

export function healthController(
  _req: Request,
  res: Response
) {
  return res.status(200).json(getHealthStatus());
}