import express from "express";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";
import multer from "multer";

const app = express();
const PORT = 5001;

// 🧱 CORS Middleware for bumble.com
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://bumble.com");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: "10mb" }));
const upload = multer({ dest: "temp_uploads" });

app.post("/save", async (req, res) => {
  const {
    userId,
    name,
    photos,
    birth_date,
    bio,
    gender,
    jobs,
    schools,
    city,
    distance
  } = req.body;

  if (!userId || !photos || photos.length === 0) {
    return res.status(400).send("Invalid Bumble profile payload.");
  }

  const safeName = name.replace(/[^\w\s-]/g, "_").trim();
  const dir = path.join("bumble_photos", `${safeName}_${userId}`);
  mkdirp.sync(dir);

  console.log(`\n🐝 Saving Bumble profile: ${name} (${userId})`);

  // 📥 Download Photos
  for (let i = 0; i < photos.length; i++) {
    try {
      const photoURL = photos[i];
      const response = await fetch(photoURL);
      const buffer = await response.buffer();
      const ext = path.extname(photoURL).split("?")[0] || ".jpg";
      const filename = path.join(dir, `photo_${i + 1}${ext}`);
      fs.writeFileSync(filename, buffer);
      console.log(`📸 Saved: ${filename}`);
    } catch (err) {
      console.error(`❌ Failed to download image ${i + 1}`, err);
    }
  }

  // 🎂 Calculate age
  let age = null;
  try {
    if (birth_date) {
      const birth = new Date(birth_date);
      const now = new Date();
      age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
      }
    }
  } catch (e) {
    console.warn("Could not calculate age:", e);
  }

  // 🧠 Enriched Metadata
  const metadata = {
    userId,
    name,
    age,
    birth_date,
    bio,
    gender,
    jobs,
    schools,
    city,
    distance_mi: distance,
    distance_km: distance ? Math.round(distance * 1.60934 * 10) / 10 : null,
    photoCount: photos.length,
    timestamp: new Date().toISOString()
  };

  const metadataPath = path.join(dir, "profile.json");
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`🧠 Metadata saved to: ${metadataPath}`);

  res.send("✅ Bumble profile saved");
});

app.post("/proof", upload.single("screenshot"), (req, res) => {
  const { userId } = req.body;
  const file = req.file;

  if (!userId || !file) {
    return res.status(400).send("Missing screenshot or user ID");
  }

  const profileDirs = fs.readdirSync("bumble_photos");
  const matchingDir = profileDirs.find(d => d.includes(userId));
  if (!matchingDir) return res.status(404).send("Profile dir not found");

  const dest = path.join("bumble_photos", matchingDir, "screenshot.png");
  fs.renameSync(file.path, dest);
  console.log(`🖼️ Screenshot saved to: ${dest}`);
  res.send("Screenshot stored");
});

app.listen(PORT, () => {
  console.log(`🚀 Bumble Sniffer backend running at http://localhost:${PORT}`);
});
