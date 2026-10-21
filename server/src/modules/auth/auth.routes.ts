import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { clearSessionCookie, login, revoke, sessionCookie, signup, tokenFromCookie } from "./auth.service";
import { requireAuth } from "./auth.middleware";
import { isAllowedFrontendOrigin } from "../../shared/utils/origin";

const router = Router();
const limits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60_000;
const MAX_ATTEMPTS = 10;
const credentialsSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(10).max(128),
}).strict();
const signupSchema = credentialsSchema.extend({ name: z.string().trim().min(1).max(80) }).strict();

function rateLimit(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  if (limits.size > 5000) for (const [key, value] of limits) if (value.resetAt <= now) limits.delete(key);
  const key = `${req.path}:${req.ip}`;
  const entry = limits.get(key);
  if (!entry || entry.resetAt <= now) limits.set(key, { count: 1, resetAt: now + WINDOW_MS });
  else if (++entry.count > MAX_ATTEMPTS) {
    res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
    return res.status(429).json({ message: "Too many attempts. Please try again later." });
  }
  next();
}

function checkOrigin(req: Request, res: Response): boolean {
  const origin = req.get("origin");
  if (origin && !isAllowedFrontendOrigin(origin)) {
    res.status(403).json({ message: "Request origin is not allowed." });
    return false;
  }
  return true;
}

function serviceError(res: Response, error: unknown) {
  const code = error instanceof Error ? error.message : "";
  if (code === "INVALID_CREDENTIALS") return res.status(401).json({ message: "Invalid email or password." });
  if (code === "ACCOUNT_EXISTS") return res.status(409).json({ message: "An account with that email already exists." });
  if (code === "AUTH_STORAGE_UNAVAILABLE" || code === "AUTH_CONFIGURATION_INVALID") {
    return res.status(503).json({ message: "Authentication is not configured. Contact the administrator." });
  }
  return res.status(503).json({ message: "Authentication service is temporarily unavailable." });
}

router.post("/signup", rateLimit, async (req, res) => {
  if (!checkOrigin(req, res)) return;
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Enter a valid name, email, and password of at least 10 characters." });
  try {
    const result = await signup(parsed.data.name, parsed.data.email, parsed.data.password);
    res.setHeader("Set-Cookie", sessionCookie(result.token));
    return res.status(201).json({ user: result.user });
  } catch (error) { return serviceError(res, error); }
});

router.post("/login", rateLimit, async (req, res) => {
  if (!checkOrigin(req, res)) return;
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Enter a valid email and password." });
  try {
    const result = await login(parsed.data.email, parsed.data.password);
    res.setHeader("Set-Cookie", sessionCookie(result.token));
    return res.json({ user: result.user });
  } catch (error) { return serviceError(res, error); }
});

router.post("/logout", async (req, res) => {
  if (!checkOrigin(req, res)) return;
  try { await revoke(tokenFromCookie(req.headers.cookie)); }
  catch (error) { serviceError(res, error); return; }
  res.setHeader("Set-Cookie", clearSessionCookie);
  return res.json({ message: "Logged out." });
});

router.get("/me", requireAuth, (req, res) => res.json({ user: req.authUser }));

export default router;
