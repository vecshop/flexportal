require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

// Konfigurasi CORS
app.use(
  cors({
    origin: "http://localhost:3000", // Ganti dengan domain Anda
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // maksimal 100 request per IP
});
app.use(limiter);

// Inisialisasi Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Route untuk verifikasi password
app.post("/api/verify", (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: "Password salah" });
  }
});

// Route untuk mengambil data apps
app.get("/api/apps", async (req, res) => {
  try {
    const { data, error } = await supabase.from("apps").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("Server berjalan di port 5000");
});
