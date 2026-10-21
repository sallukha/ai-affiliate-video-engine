import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual, randomUUID } from "node:crypto";
import { promisify } from "node:util";
import { MongoClient, Collection, ObjectId } from "mongodb";
import { env } from "../../config/env";

const scrypt = promisify(scryptCallback);
const USERS = "users";
const SESSIONS = "auth_sessions";
const TOKEN_COOKIE = "affiliate_session";
const COOKIE_PATH = "/api/auth";
const SESSION_MS = parseDuration(env.jwtExpiresIn);

type User = { _id: ObjectId; name: string; email: string; passwordHash: string; createdAt: Date };
type Session = { _id: string; userId: string; expiresAt: Date };
export type SafeUser = { id: string; name: string; email: string };
let clientPromise: Promise<MongoClient> | undefined;

function parseDuration(input: string): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(input);
  if (!match) throw new Error("JWT_EXPIRES_IN must use seconds, minutes, hours, or days (for example 15m)");
  const amount = Number(match[1]);
  const unit = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2] as "s" | "m" | "h" | "d"];
  const duration = amount * unit;
  if (!Number.isSafeInteger(duration) || duration < 60_000 || duration > 3_600_000) {
    throw new Error("JWT_EXPIRES_IN must be between 1 minute and 1 hour");
  }
  return duration;
}

async function collections(): Promise<{ users: Collection<User>; sessions: Collection<Session> }> {
  if (!env.mongodbUri) throw new Error("AUTH_STORAGE_UNAVAILABLE");
  if (!clientPromise) {
    clientPromise = new MongoClient(env.mongodbUri).connect().catch((error) => {
      clientPromise = undefined;
      throw error;
    });
  }
  const client = await clientPromise;
  const db = client.db(env.mongodbDatabase);
  const users = db.collection<User>(USERS);
  const sessions = db.collection<Session>(SESSIONS);
  await Promise.all([
    users.createIndex({ email: 1 }, { unique: true, name: "email_unique" }),
    sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "session_expiry" }),
  ]);
  return { users, sessions };
}

export async function closeAuthDatabase(): Promise<void> {
  const connection = clientPromise;
  clientPromise = undefined;
  if (!connection) return;
  const client = await connection.catch(() => undefined);
  if (client) await client.close();
}

function safeUser(user: User): SafeUser {
  return { id: user._id.toHexString(), name: user.name, email: user.email };
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex || !/^[a-f\d]+$/i.test(saltHex) || !/^[a-f\d]{128}$/i.test(hashHex)) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length) as Buffer;
  return timingSafeEqual(actual, expected);
}

function b64(value: string): string { return Buffer.from(value).toString("base64url"); }
function sign(user: SafeUser, sessionId: string, issued: number): string {
  const header = b64(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64(JSON.stringify({ sub: user.id, sid: sessionId, iat: issued, exp: issued + Math.floor(SESSION_MS / 1000), iss: env.jwtIssuer, aud: env.jwtAudience }));
  const input = `${header}.${payload}`;
  const signature = createHmac("sha256", env.jwtSecret).update(input).digest("base64url");
  return `${input}.${signature}`;
}

function verify(token: string): { userId: string; sessionId: string } | null {
  if (Buffer.byteLength(env.jwtSecret) < 32 || token.length > 4096) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8")) as { alg?: string; typ?: string };
    const claims = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as Record<string, unknown>;
    if (header.alg !== "HS256" || header.typ !== "JWT") return null;
    const expected = createHmac("sha256", env.jwtSecret).update(`${parts[0]}.${parts[1]}`).digest();
    const actual = Buffer.from(parts[2], "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const now = Math.floor(Date.now() / 1000);
    if (typeof claims.sub !== "string" || typeof claims.sid !== "string" || !ObjectId.isValid(claims.sub) ||
      typeof claims.iat !== "number" || typeof claims.exp !== "number" || claims.exp <= now || claims.iat > now + 60 ||
      claims.exp - claims.iat > SESSION_MS / 1000 || claims.iss !== env.jwtIssuer || claims.aud !== env.jwtAudience) return null;
    return { userId: claims.sub, sessionId: claims.sid };
  } catch { return null; }
}

export function sessionCookie(token: string): string {
  const secure = env.nodeEnv === "production" ? "; Secure" : "";
  return `${TOKEN_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=${COOKIE_PATH}; Max-Age=${Math.floor(SESSION_MS / 1000)}${secure}`;
}
export const clearSessionCookie = `${TOKEN_COOKIE}=; HttpOnly; SameSite=Lax; Path=${COOKIE_PATH}; Max-Age=0${env.nodeEnv === "production" ? "; Secure" : ""}`;

async function createSession(user: User): Promise<{ user: SafeUser; token: string }> {
  if (Buffer.byteLength(env.jwtSecret) < 32) throw new Error("AUTH_CONFIGURATION_INVALID");
  const sessionId = randomUUID();
  const userInfo = safeUser(user);
  const expiresAt = new Date(Date.now() + SESSION_MS);
  const { sessions } = await collections();
  await sessions.insertOne({ _id: sessionId, userId: user._id.toHexString(), expiresAt });
  return { user: userInfo, token: sign(userInfo, sessionId, Math.floor(Date.now() / 1000)) };
}

export async function signup(name: string, email: string, password: string) {
  if (Buffer.byteLength(env.jwtSecret) < 32) throw new Error("AUTH_CONFIGURATION_INVALID");
  const { users } = await collections();
  const passwordHash = await hashPassword(password);
  let user: User;
  try {
    const result = await users.insertOne({ _id: new ObjectId(), name, email, passwordHash, createdAt: new Date() });
    user = { _id: result.insertedId, name, email, passwordHash, createdAt: new Date() };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) throw new Error("ACCOUNT_EXISTS");
    throw error;
  }
  try {
    return await createSession(user);
  } catch (error) {
    await users.deleteOne({ _id: user._id }).catch(() => undefined);
    throw error;
  }
}

const dummyPasswordHash = "0123456789abcdef0123456789abcdef:00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
export async function login(email: string, password: string) {
  const { users } = await collections();
  const user = await users.findOne({ email });
  const valid = await verifyPassword(password, user?.passwordHash ?? dummyPasswordHash);
  if (!user || !valid) throw new Error("INVALID_CREDENTIALS");
  return createSession(user);
}

export async function authenticate(token: string | undefined): Promise<SafeUser | null> {
  if (!token || Buffer.byteLength(env.jwtSecret) < 32) return null;
  const claims = verify(token);
  if (!claims) return null;
  const { users, sessions } = await collections();
  const session = await sessions.findOne({ _id: claims.sessionId, userId: claims.userId, expiresAt: { $gt: new Date() } });
  if (!session) return null;
  const user = await users.findOne({ _id: new ObjectId(claims.userId) });
  return user ? safeUser(user) : null;
}

export async function revoke(token: string | undefined): Promise<void> {
  if (!token) return;
  const claims = verify(token);
  if (!claims) return;
  const { sessions } = await collections();
  await sessions.deleteOne({ _id: claims.sessionId, userId: claims.userId });
}

export function tokenFromCookie(cookieHeader: string | undefined): string | undefined {
  const entry = cookieHeader?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${TOKEN_COOKIE}=`));
  return entry ? entry.slice(TOKEN_COOKIE.length + 1) : undefined;
}
