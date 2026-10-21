import { env } from "../../config/env";

export function isAllowedFrontendOrigin(origin: string): boolean {
  if (env.frontendOrigins.includes(origin)) return true;
  if (env.nodeEnv === "production") return false;

  try {
    const url = new URL(origin);
    const isDevPort = ["3000", "3001", "5173"].includes(url.port);
    const isLocalHost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    const isPrivateLan = /^(10|192\.168|172\.(1[6-9]|2\d|3[0-1]))\./.test(url.hostname);
    return isDevPort && (isLocalHost || isPrivateLan);
  } catch {
    return false;
  }
}
