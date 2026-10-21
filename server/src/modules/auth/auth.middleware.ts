import { RequestHandler } from "express";
import { authenticate, tokenFromCookie } from "./auth.service";

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const user = await authenticate(tokenFromCookie(req.headers.cookie));
    if (!user) return res.status(401).json({ message: "Authentication required." });
    req.authUser = user;
    return next();
  } catch {
    return res.status(503).json({ message: "Authentication service is temporarily unavailable." });
  }
};
