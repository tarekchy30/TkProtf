import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://tkprotf.onrender.com",        // ← Add this (no -1)
  "https://tkprotf-1.onrender.com",      // Keep this too just in case
];


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir =
  process.env.UPLOAD_DIR ||
  path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    const name = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9-_]/gi, "-")
      .slice(0, 50);

    cb(null, `${Date.now()}-${name}${ext}`);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 8 * 1024 * 1024,
  },

  fileFilter: function (req, file, cb) {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
});

const dbPath =
  process.env.DB_PATH ||
  path.join(__dirname, "portfolio.db");

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,email TEXT UNIQUE,password TEXT,role TEXT DEFAULT 'admin');
CREATE TABLE IF NOT EXISTS content(id INTEGER PRIMARY KEY AUTOINCREMENT,resource TEXT,title TEXT NOT NULL,data TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP,updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS profile(id INTEGER PRIMARY KEY CHECK(id=1),data TEXT);
`);
const adminEmail = process.env.ADMIN_EMAIL,
  adminPassword = process.env.ADMIN_PASSWORD;
if (
  adminEmail &&
  adminPassword &&
  !db.prepare("SELECT id FROM users WHERE email=?").get(adminEmail)
) {
  db.prepare("INSERT INTO users(email,password) VALUES(?,?)").run(
    adminEmail,
    bcrypt.hashSync(adminPassword, 12),
  );
  console.log("Admin account created:", adminEmail);
}
if (!db.prepare("SELECT id FROM profile WHERE id=1").get()) {
  db.prepare("INSERT INTO profile(id,data) VALUES(1,?)").run(
    JSON.stringify({
      name: "Tarek Chy",
      headline: "Computer Science Student & Builder",
      bio: "I learn by building software, hardware experiments, research projects and tutorials.",
      location: "Sylhet, Bangladesh",
      education: "BSc in Computer Science & Engineering",
      github: "https://github.com/tarekchy30/",
      linkedin: "",
      youtube: "",
      cvUrl: "",
      skills: [
        "HTML",
        "CSS",
        "JavaScript",
        "React",
        "Node.js",
        "Android",
        "ESP32",
        "WordPress",
      ],
      interests: [
        "AI",
        "Cybersecurity",
        "Computer Vision",
        "IoT",
        "Robotics",
        "HCI",
      ],
    }),
  );
}

function auth(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    if (!h.startsWith("Bearer ")) throw Error();
    req.user = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
}
const allowed = [
  "projects",
  "university",
  "research",
  "blogs",
  "youtube",
  "experiments",
];
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.post("/api/upload", auth, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Please upload an image.",
    });
  }

  res.json({
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
  });
});
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {},
    u = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!u || !bcrypt.compareSync(password, u.password))
    return res.status(401).json({ message: "Invalid email or password" });
  res.json({
    token: jwt.sign(
      { id: u.id, email: u.email, role: u.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    ),
  });
});
app.get("/api/profile", (req, res) =>
  res.json(
    JSON.parse(db.prepare("SELECT data FROM profile WHERE id=1").get().data),
  ),
);
app.get("/api/:resource", (req, res) => {
  if (!allowed.includes(req.params.resource))
    return res.status(404).json({ message: "Not found" });
  const rows = db
    .prepare("SELECT id,data FROM content WHERE resource=? ORDER BY id DESC")
    .all(req.params.resource);
  res.json(
    rows
      .map((r) => ({ id: r.id, ...JSON.parse(r.data) }))
      .filter((x) => x.status !== "draft"),
  );
});
app.get("/api/admin/stats", auth, (req, res) => {
  const out = {};
  allowed.forEach(
    (x) =>
      (out[x] = db
        .prepare("SELECT COUNT(*) c FROM content WHERE resource=?")
        .get(x).c),
  );
  res.json(out);
});
app.get("/api/admin/:resource", auth, (req, res) => {
  if (!allowed.includes(req.params.resource))
    return res.status(404).json({ message: "Not found" });
  const rows = db
    .prepare("SELECT id,data FROM content WHERE resource=? ORDER BY id DESC")
    .all(req.params.resource);
  res.json(rows.map((r) => ({ id: r.id, ...JSON.parse(r.data) })));
});
app.post("/api/admin/:resource", auth, (req, res) => {
  if (!allowed.includes(req.params.resource))
    return res.status(404).json({ message: "Not found" });
  const data = { ...req.body };
  if (req.params.resource === "blogs" && !data.slug)
    data.slug =
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now();
  const r = db
    .prepare("INSERT INTO content(resource,title,data) VALUES(?,?,?)")
    .run(req.params.resource, data.title || "Untitled", JSON.stringify(data));
  res.status(201).json({ id: r.lastInsertRowid, ...data });
});
app.put("/api/admin/:resource/:id", auth, (req, res) => {
  if (!allowed.includes(req.params.resource))
    return res.status(404).json({ message: "Not found" });
  const data = { ...req.body };
  db.prepare(
    "UPDATE content SET title=?,data=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND resource=?",
  ).run(
    data.title || "Untitled",
    JSON.stringify(data),
    req.params.id,
    req.params.resource,
  );
  res.json({ id: Number(req.params.id), ...data });
});
app.delete("/api/admin/:resource/:id", auth, (req, res) => {
  if (!allowed.includes(req.params.resource))
    return res.status(404).json({ message: "Not found" });
  db.prepare("DELETE FROM content WHERE id=? AND resource=?").run(
    req.params.id,
    req.params.resource,
  );
  res.json({ ok: true });
});
app.put("/api/admin/profile", auth, (req, res) => {
  db.prepare("UPDATE profile SET data=? WHERE id=1").run(
    JSON.stringify(req.body),
  );
  res.json(req.body);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SQLite API running on port ${PORT}`);
});
