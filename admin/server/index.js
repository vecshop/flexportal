// filepath: /server/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000", // Ganti dengan URL frontend Anda
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // maksimal 100 request per IP
});
app.use(limiter);

// Generate JWT token
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "24h" });
}

// Verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Routes
app.post("/api/login", (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    const token = generateToken("admin");
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

app.get("/api/apps", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase.from("apps").select("*");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/apps", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase.from("apps").insert([req.body]);
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/apps/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("apps")
      .update(req.body)
      .eq("id", id);
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/apps/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("apps").delete().eq("id", id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
