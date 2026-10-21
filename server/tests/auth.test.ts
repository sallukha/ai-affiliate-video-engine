import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { randomUUID } from "node:crypto";
import { MongoClient } from "mongodb";
import app from "../src/app";
import { env } from "../src/config/env";
import { closeAuthDatabase } from "../src/modules/auth/auth.service";

let baseUrl: string;
let server: ReturnType<typeof app.listen>;

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not bind to a TCP port");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (server) await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await closeAuthDatabase();
});

test("auth endpoints reject missing sessions and invalid inputs safely", async () => {
  const me = await fetch(`${baseUrl}/api/auth/me`);
  assert.equal(me.status, 401);
  assert.deepEqual(await me.json(), { message: "Authentication required." });

  const signup = await fetch(`${baseUrl}/api/auth/signup`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "", email: "invalid", password: "short" }),
  });
  assert.equal(signup.status, 400);
  assert.equal(typeof (await signup.json()).message, "string");

  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "invalid", password: "short" }),
  });
  assert.equal(login.status, 400);

  const localFrontend = await fetch(`${baseUrl}/api/auth/signup`, {
    method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
    body: JSON.stringify({ name: "", email: "invalid", password: "short" }),
  });
  assert.equal(localFrontend.status, 400);
});

test("logout clears the HttpOnly session cookie and rejects foreign origins", async () => {
  const logout = await fetch(`${baseUrl}/api/auth/logout`, { method: "POST" });
  assert.equal(logout.status, 200);
  assert.match(logout.headers.get("set-cookie") ?? "", /HttpOnly/);
  assert.match(logout.headers.get("set-cookie") ?? "", /Max-Age=0/);

  const csrf = await fetch(`${baseUrl}/api/auth/logout`, {
    method: "POST", headers: { Origin: "https://untrusted.example" },
  });
  assert.equal(csrf.status, 403);
});

test("Mongo-backed signup, login, profile, and revocation flow", { skip: !env.mongodbUri }, async () => {
  const client = new MongoClient(env.mongodbUri);
  const email = `auth-check-${randomUUID()}@example.invalid`;
  const password = `temporary-${randomUUID()}-Password9`;
  await client.connect();
  const db = client.db(env.mongodbDatabase);
  const users = db.collection("users");
  const sessions = db.collection("auth_sessions");

  try {
    const signup = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Auth integration check", email, password }),
    });
    assert.equal(signup.status, 201);
    const signupBody = await signup.json() as { user: { id: string; name: string; email: string } };
    assert.deepEqual(Object.keys(signupBody.user).sort(), ["email", "id", "name"]);
    const cookie = (signup.headers.get("set-cookie") ?? "").split(";")[0];
    assert.match(cookie, /^affiliate_session=/);

    const stored = await users.findOne({ email });
    assert.ok(stored?.passwordHash);
    assert.notEqual(stored?.passwordHash, password);
    assert.match(stored?.passwordHash ?? "", /^[a-f\d]{32}:[a-f\d]{128}$/i);

    const duplicate = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Auth integration check", email, password }),
    });
    assert.equal(duplicate.status, 409);

    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    assert.equal(login.status, 200);
    const loginCookie = (login.headers.get("set-cookie") ?? "").split(";")[0];
    assert.match(loginCookie, /^affiliate_session=/);

    const invalidLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: `wrong-${randomUUID()}-Password9` }),
    });
    assert.equal(invalidLogin.status, 401);
    assert.deepEqual(await invalidLogin.json(), { message: "Invalid email or password." });

    const me = await fetch(`${baseUrl}/api/auth/me?userId=000000000000000000000000`, {
      headers: { Cookie: loginCookie },
    });
    assert.equal(me.status, 200);
    assert.equal((await me.json() as { user: { email: string } }).user.email, email);

    const logout = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST", headers: { Cookie: loginCookie },
    });
    assert.equal(logout.status, 200);
    const revoked = await fetch(`${baseUrl}/api/auth/me`, { headers: { Cookie: loginCookie } });
    assert.equal(revoked.status, 401);
  } finally {
    const stored = await users.findOne({ email });
    if (stored?._id) await sessions.deleteMany({ userId: String(stored._id) });
    await users.deleteOne({ email });
    await client.close();
  }
});
