import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import { cors } from "hono/cors";
import { hash, compare } from "bcrypt-ts";

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  REFRESH_SECRET: string;
  SHEETY_SECRET: string;
};

type User = {
  id: string;
  email: string;
  username: string;
  password: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware: CORS
app.use("*", cors({ origin: "https://tskd.us.kg", credentials: true }));

// Helper function to generate tokens
const generateToken = (payload: Partial<User>, secret: string, expiresIn: number) => {
  return sign({ ...payload, exp: Math.floor(Date.now() / 1000) + expiresIn }, secret);
};

// Authentication middleware
const authenticateToken = async (c: any, next: any) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) return c.json({ error: "Access token required" }, 401);

  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    c.set("user", payload);
    await next();
  } catch {
    return c.json({ error: "Invalid or expired token" }, 403);
  }
};

// Signup Route
app.post("/auth/signup", async (c) => {
  const { email, password, username } = await c.req.json();
  if (!email || !password || !username) return c.json({ error: "Missing fields" }, 400);

  const { results } = await c.env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).all();
  if (results.length > 0) return c.json({ error: "User already exists" }, 400);

  const hashedPassword = await hash(password, 10);
  const userId = crypto.randomUUID();
  await c.env.DB.prepare("INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)")
    .bind(userId, email, username, hashedPassword)
    .run();

  const accessToken = generateToken({ id: userId, email }, c.env.JWT_SECRET, 86400);
  const refreshToken = generateToken({ id: userId, email }, c.env.REFRESH_SECRET, 604800);

  c.header("Set-Cookie", `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=None`);
  return c.json({ accessToken, user: { id: userId, email, username } });
});

// Login Route
app.post("/auth/login", async (c) => {
  const { email, password } = await c.req.json();
  const { results } = await c.env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).all();
  if (results.length === 0) return c.json({ error: "Invalid credentials" }, 401);

  const user = results[0];
  if (!(await compare(password, user.password))) return c.json({ error: "Invalid credentials" }, 401);

  const accessToken = generateToken({ id: user.id, email }, c.env.JWT_SECRET, 86400);
  const refreshToken = generateToken({ id: user.id, email }, c.env.REFRESH_SECRET, 604800);

  c.header("Set-Cookie", `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=None`);
  return c.json({ accessToken, user: { id: user.id, email, username: user.username } });
});

// Refresh Token Route
app.post("/auth/refresh", async (c) => {
  const refreshToken = c.req.cookie("refreshToken");
  if (!refreshToken) return c.json({ error: "Refresh token required" }, 400);

  try {
    const payload = await verify(refreshToken, c.env.REFRESH_SECRET);
    const accessToken = generateToken(payload, c.env.JWT_SECRET, 86400);
    return c.json({ accessToken });
  } catch {
    return c.json({ error: "Invalid or expired refresh token" }, 403);
  }
});

// Logout Route
app.post("/auth/logout", async (c) => {
  c.header("Set-Cookie", "refreshToken=; HttpOnly; Secure; SameSite=None; Max-Age=0");
  return c.json({ success: true });
});

// Feedback Route
app.post("/api/feedback", async (c) => {
  const { email, message } = await c.req.json();
  if (!email || !message) return c.json({ error: "Both 'email' and 'message' are required" }, 400);

  const sheetyUrl = "https://api.sheety.co/2870e9315faaeee780eaf2deae61d926/tskdFeedback/feedback";

  try {
    const response = await fetch(sheetyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${c.env.SHEETY_SECRET}`,
      },
      body: JSON.stringify({ feedback: { email, message } }),
    });

    if (!response.ok) {
      const error = await response.json();
      return c.json({ error: error.message || "Failed to send feedback" }, response.status);
    }

    const data = await response.json();
    return c.json({ success: true, feedback: data.feedback });
  } catch (err) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;

