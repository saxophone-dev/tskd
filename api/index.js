const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:1420", // Replace with your frontend's URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// In-memory storage for simplicity (replace with a database in production)
const users = [];
let refreshTokens = [];

// Secret keys (use environment variables in production)
const ACCESS_TOKEN_SECRET = "your_access_token_secret";
const REFRESH_TOKEN_SECRET = "your_refresh_token_secret";

// Helper functions
const generateAccessToken = (user) => {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (user) => {
  const refreshToken = jwt.sign(user, REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);
  return refreshToken;
};

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access token required." });

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ error: "Invalid or expired token." });
    req.user = user;
    next();
  });
};

// Routes

// Signup
app.post("/auth/signup", (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res
      .status(400)
      .json({ error: "Email, password, and username are required." });
  }

  if (users.find((user) => user.email === email)) {
    return res.status(400).json({ error: "User already exists." });
  }

  const newUser = { id: Date.now().toString(), email, username, password };
  users.push(newUser);

  const accessToken = generateAccessToken({
    id: newUser.id,
    email: newUser.email,
  });
  const refreshToken = generateRefreshToken({
    id: newUser.id,
    email: newUser.email,
  });

  res.json({
    tokens: { accessToken, refreshToken },
    user: { id: newUser.id, email, username },
  });
});

// Login
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const accessToken = generateAccessToken({ id: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

  res.json({
    tokens: { accessToken, refreshToken },
    user: { id: user.id, email, username: user.username },
  });
});

// Token refresh
app.post("/auth/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(400).json({ error: "Refresh token required." });
  if (!refreshTokens.includes(refreshToken))
    return res.status(403).json({ error: "Invalid refresh token." });

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err)
      return res
        .status(403)
        .json({ error: "Invalid or expired refresh token." });

    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    res.json({ accessToken });
  });
});

// Logout
app.post("/auth/logout", (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.json({ message: "Logged out successfully." });
});

// Protected route example
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route.", user: req.user });
});

// Feedback endpoint
app.post("/api/feedback", (req, res) => {
  const { email, message } = req.body;

  if (!email || !message) {
    return res
      .status(400)
      .json({ error: "Both 'email' and 'message' are required." });
  }

  res.json({
    received: {
      email,
      message,
    },
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
