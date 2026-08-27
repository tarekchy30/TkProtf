import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import supabase from "./supabase.js";

dotenv.config();

/* =========================================================
   BASIC CONFIG
========================================================= */

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================================================
   CORS
========================================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://tkprotf.onrender.com",
  "https://tkprotf-1.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin
      // Example: mobile apps, curl, Postman
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ CORS blocked:", origin);

      return callback(new Error("Not allowed by CORS"));
    },

    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,

    optionsSuccessStatus: 200,
  })
);

app.options("*", cors());

/* =========================================================
   BODY PARSER
========================================================= */

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    limit: "10mb",
    extended: true,
  })
);

/* =========================================================
   ALLOWED CONTENT TYPES
========================================================= */

const allowed = [
  "projects",
  "university",
  "research",
  "blogs",
  "youtube",
  "experiments",
];

/* =========================================================
   MULTER
   Memory storage because images are uploaded directly
   to Supabase Storage.
========================================================= */

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 8 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
});

/* =========================================================
   AUTH MIDDLEWARE
========================================================= */

function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";

    if (!header.startsWith("Bearer ")) {
      throw new Error("Missing token");
    }

    const token = header.slice(7);

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error.message);

    return res.status(401).json({
      message: "Unauthorized",
    });
  }
}

/* =========================================================
   ADMIN CHECK
========================================================= */

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
}

/* =========================================================
   ENSURE ADMIN USER
========================================================= */

async function ensureAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.log(
        "⚠️ ADMIN_EMAIL or ADMIN_PASSWORD missing"
      );
      return;
    }

    const {
      data: existing,
      error: findError,
    } = await supabase
      .from("users")
      .select("id,email,role")
      .eq("email", email)
      .maybeSingle();

    if (findError) {
      console.error(
        "❌ Could not check admin:",
        findError.message
      );
      return;
    }

    if (existing) {
      console.log(
        "✅ Admin account exists:",
        email
      );

      return;
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const {
      error: insertError,
    } = await supabase
      .from("users")
      .insert({
        email,
        password: hashedPassword,
        role: "admin",
      });

    if (insertError) {
      console.error(
        "❌ Admin creation failed:",
        insertError.message
      );

      return;
    }

    console.log(
      "✅ Admin account created:",
      email
    );
  } catch (error) {
    console.error(
      "❌ ensureAdmin error:",
      error.message
    );
  }
}

/* =========================================================
   YOUTUBE HELPERS
========================================================= */

function getYouTubeId(url) {
  if (!url) {
    return "";
  }

  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&?/]+)/
  );

  return match ? match[1] : "";
}

function getYouTubeThumbnail(url) {
  const id = getYouTubeId(url);

  if (!id) {
    return "";
  }

  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", async (req, res) => {
  try {
    const { error } = await supabase
      .from("profile")
      .select("id")
      .limit(1);

    if (error) {
      return res.status(500).json({
        ok: false,
        message: "Supabase connection failed",
        error: error.message,
      });
    }

    return res.json({
      ok: true,
      message: "API and Supabase are running",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
});

/* =========================================================
   LOGIN
========================================================= */

app.post("/api/auth/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const {
      data: user,
      error,
    } = await supabase
      .from("users")
      .select(
        "id,email,password,role"
      )
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error(
        "LOGIN DATABASE ERROR:",
        error.message
      );

      return res.status(500).json({
        message: "Login failed",
      });
    }

    if (!user) {
      console.log(
        "❌ Login failed:",
        email
      );

      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    const valid = await bcrypt.compare(
      password,
      user.password
    );

    if (!valid) {
      console.log(
        "❌ Wrong password:",
        email
      );

      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message:
          "JWT_SECRET is not configured",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    console.log(
      "✅ Login successful:",
      email
    );

    return res.json({
      token,
    });
  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      message: "Login failed",
    });
  }
});

/* =========================================================
   IMAGE UPLOAD → SUPABASE STORAGE
========================================================= */

app.post(
  "/api/upload",
  auth,
  adminOnly,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image uploaded",
        });
      }

      const extension = path
        .extname(req.file.originalname)
        .toLowerCase();

      const fileName =
        `${Date.now()}-` +
        `${Math.random()
          .toString(36)
          .substring(2, 10)}` +
        extension;

      const {
        data,
        error,
      } = await supabase.storage
        .from("portfolio")
        .upload(
          fileName,
          req.file.buffer,
          {
            contentType:
              req.file.mimetype,

            cacheControl: "3600",

            upsert: false,
          }
        );

      if (error) {
        console.error(
          "❌ Storage error:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Supabase upload failed",
          error: error.message,
        });
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("portfolio")
        .getPublicUrl(data.path);

      const url =
        publicUrlData.publicUrl;

      console.log(
        "✅ Image uploaded:",
        url
      );

      return res.json({
        success: true,
        url,
        imageUrl: url,
        path: data.path,
      });
    } catch (error) {
      console.error(
        "UPLOAD ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Image upload failed",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   GET PROFILE
========================================================= */

app.get(
  "/api/profile",
  async (req, res) => {
    try {
      const {
        data,
        error,
      } = await supabase
        .from("profile")
        .select("data")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        return res.status(500).json({
          message: error.message,
        });
      }

      if (!data) {
        return res.status(404).json({
          message: "Profile not found",
        });
      }

      return res.json(
        data.data || {}
      );
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }
);

/* =========================================================
   PUBLIC CONTENT
========================================================= */

app.get(
  "/api/:resource",
  async (req, res) => {
    try {
      const resource =
        req.params.resource;

      if (!allowed.includes(resource)) {
        return res.status(404).json({
          message: "Not found",
        });
      }

      const {
        data,
        error,
      } = await supabase
        .from("content")
        .select(
          "id,resource,title,data,created_at,updated_at"
        )
        .eq(
          "resource",
          resource
        )
        .eq(
          "data->>status",
          "published"
        )
        .order("id", {
          ascending: false,
        });

      if (error) {
        console.error(
          "PUBLIC CONTENT ERROR:",
          error
        );

        return res.status(500).json({
          message: error.message,
        });
      }

      const result =
        (data || []).map(
          (row) => ({
            id: row.id,

            ...(row.data || {}),

            created_at:
              row.created_at,

            updated_at:
              row.updated_at,
          })
        );

      return res.json(result);
    } catch (error) {
      console.error(
        "PUBLIC CONTENT ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to load content",
      });
    }
  }
);

/* =========================================================
   ADMIN STATS
========================================================= */

app.get(
  "/api/admin/stats",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const result = {};

      for (const resource of allowed) {
        const {
          count,
          error,
        } = await supabase
          .from("content")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq(
            "resource",
            resource
          );

        if (error) {
          throw error;
        }

        result[resource] =
          count || 0;
      }

      return res.json(result);
    } catch (error) {
      console.error(
        "STATS ERROR:",
        error
      );

      return res.status(500).json({
        message: error.message,
      });
    }
  }
);

/* =========================================================
   ADMIN GET CONTENT
========================================================= */

app.get(
  "/api/admin/:resource",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const resource =
        req.params.resource;

      if (!allowed.includes(resource)) {
        return res.status(404).json({
          message: "Not found",
        });
      }

      const {
        data,
        error,
      } = await supabase
        .from("content")
        .select(
          "id,resource,title,data,created_at,updated_at"
        )
        .eq(
          "resource",
          resource
        )
        .order("id", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      const result =
        (data || []).map(
          (row) => ({
            id: row.id,

            ...(row.data || {}),

            created_at:
              row.created_at,

            updated_at:
              row.updated_at,
          })
        );

      return res.json(result);
    } catch (error) {
      console.error(
        "ADMIN GET ERROR:",
        error
      );

      return res.status(500).json({
        message: error.message,
      });
    }
  }
);

/* =========================================================
   BUILD CLEAN CONTENT DATA
========================================================= */

function buildContentData(
  resource,
  formData
) {
  const cleanData = {
    title:
      formData.title ||
      "Untitled",

    description:
      formData.description ||
      "",

    category:
      formData.category ||
      "",

    status:
      formData.status ||
      "published",
  };

  /* -------------------------------------------------------
     PROJECTS
  ------------------------------------------------------- */

  if (resource === "projects") {
    cleanData.tech =
      Array.isArray(formData.tech)
        ? formData.tech
        : typeof formData.tech ===
          "string"
        ? formData.tech
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

    cleanData.github =
      formData.github || "";

    cleanData.liveUrl =
      formData.liveUrl || "";

    cleanData.image =
      formData.image || "";
  }

  /* -------------------------------------------------------
     BLOGS
  ------------------------------------------------------- */

  else if (resource === "blogs") {
    cleanData.content =
      formData.content || "";

    cleanData.excerpt =
      formData.excerpt || "";

    cleanData.coverImage =
      formData.coverImage || "";

    cleanData.tags =
      Array.isArray(formData.tags)
        ? formData.tags
        : typeof formData.tags ===
          "string"
        ? formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

    cleanData.slug =
      formData.slug ||
      (
        formData.title ||
        "untitled"
      )
        .toLowerCase()
        .replace(
          /[^a-z0-9]+/g,
          "-"
        )
        .replace(
          /(^-|-$)/g,
          ""
        ) +
        "-" +
        Date.now();
  }

  /* -------------------------------------------------------
     YOUTUBE
  ------------------------------------------------------- */

  else if (resource === "youtube") {
    cleanData.youtubeUrl =
      formData.youtubeUrl || "";

    cleanData.videoId =
      getYouTubeId(
        formData.youtubeUrl
      );

    cleanData.thumbnail =
      getYouTubeThumbnail(
        formData.youtubeUrl
      );

    cleanData.description =
      formData.description ||
      "";
  }

  /* -------------------------------------------------------
     RESEARCH
  ------------------------------------------------------- */

  else if (resource === "research") {
    cleanData.icon =
      formData.icon ||
      "BrainCircuit";

    cleanData.link =
      formData.link || "";
  }

  /* -------------------------------------------------------
     UNIVERSITY
  ------------------------------------------------------- */

  else if (
    resource === "university"
  ) {
    cleanData.course =
      formData.course || "";

    cleanData.semester =
      formData.semester || "";

    cleanData.type =
      formData.type || "";

    cleanData.fileUrl =
      formData.fileUrl || "";

    cleanData.github =
      formData.github || "";

    cleanData.liveUrl =
      formData.liveUrl || "";
  }

  /* -------------------------------------------------------
     EXPERIMENTS
  ------------------------------------------------------- */

  else if (
    resource === "experiments"
  ) {
    cleanData.technology =
      Array.isArray(
        formData.technology
      )
        ? formData.technology
        : typeof formData.technology ===
          "string"
        ? formData.technology
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

    cleanData.image =
      formData.image || "";

    cleanData.github =
      formData.github || "";
  }

  return cleanData;
}

/* =========================================================
   ADMIN CREATE CONTENT
========================================================= */

app.post(
  "/api/admin/:resource",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const resource =
        req.params.resource;

      if (!allowed.includes(resource)) {
        return res.status(404).json({
          message: "Not found",
        });
      }

      console.log(
        "📥 Creating content:",
        resource
      );

      const cleanData =
        buildContentData(
          resource,
          req.body || {}
        );

      console.log(
        "📥 Clean data:",
        cleanData
      );

      const now =
        new Date().toISOString();

      const {
        data: inserted,
        error,
      } = await supabase
        .from("content")
        .insert({
          resource,

          title:
            cleanData.title,

          data:
            cleanData,

          created_at:
            now,

          updated_at:
            now,
        })
        .select(
          "id,resource,title,data,created_at,updated_at"
        )
        .single();

      if (error) {
        console.error(
          "❌ SUPABASE CREATE ERROR:",
          error
        );

        return res.status(500).json({
          message: error.message,
        });
      }

      console.log(
        "✅ Saved:",
        inserted.id
      );

      return res.status(201).json({
        id: inserted.id,

        ...(inserted.data || {}),

        created_at:
          inserted.created_at,

        updated_at:
          inserted.updated_at,
      });
    } catch (error) {
      console.error(
        "❌ CREATE ERROR:",
        error
      );

      return res.status(500).json({
        message: error.message,
      });
    }
  }
);

/* =========================================================
   ADMIN UPDATE CONTENT
========================================================= */

app.put(
  "/api/admin/:resource/:id",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const resource =
        req.params.resource;

      const id =
        req.params.id;

      if (!allowed.includes(resource)) {
        return res.status(404).json({
          message: "Not found",
        });
      }

      console.log(
        "📥 Updating:",
        resource,
        id
      );

      const cleanData =
        buildContentData(
          resource,
          req.body || {}
        );

      const {
        data: updated,
        error,
      } = await supabase
        .from("content")
        .update({
          title:
            cleanData.title,

          data:
            cleanData,

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id)
        .eq(
          "resource",
          resource
        )
        .select(
          "id,resource,title,data,created_at,updated_at"
        )
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!updated) {
        return res.status(404).json({
          message:
            "Content not found",
        });
      }

      console.log(
        "✅ Updated:",
        updated.id
      );

      return res.json({
        id: updated.id,

        ...(updated.data || {}),

        created_at:
          updated.created_at,

        updated_at:
          updated.updated_at,
      });
    } catch (error) {
      console.error(
        "UPDATE ERROR:",
        error
      );

      return res.status(500).json({
        message: error.message,
      });
    }
  }
);

/* =========================================================
   ADMIN DELETE CONTENT
========================================================= */

app.delete(
  "/api/admin/:resource/:id",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const resource =
        req.params.resource;

      const id =
        req.params.id;

      if (!allowed.includes(resource)) {
        return res.status(404).json({
          message: "Not found",
        });
      }

      const {
        error,
      } = await supabase
        .from("content")
        .delete()
        .eq("id", id)
        .eq(
          "resource",
          resource
        );

      if (error) {
        throw error;
      }

      return res.json({
        ok: true,
      });
    } catch (error) {
      console.error(
        "DELETE ERROR:",
        error
      );

      return res.status(500).json({
        message: error.message,
      });
    }
  }
);

/* =========================================================
   ADMIN UPDATE PROFILE
========================================================= */

app.put(
  "/api/admin/profile",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const {
        error,
      } = await supabase
        .from("profile")
        .upsert({
          id: 1,

          data: req.body,

          updated_at:
            new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      return res.json(
        req.body
      );
    } catch (error) {
      console.error(
        "PROFILE UPDATE ERROR:",
        error
      );

      return res.status(500).json({
        message: error.message,
      });
    }
  }
);

/* =========================================================
   DEBUG CONTENT
   Remove these endpoints before production if not needed.
========================================================= */

app.get(
  "/api/debug/content",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const {
        data,
        error,
      } = await supabase
        .from("content")
        .select("*")
        .limit(10);

      if (error) {
        return res.status(500).json({
          error: error.message,
        });
      }

      return res.json({
        count:
          data?.length || 0,

        data,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }
);

app.get(
  "/api/debug/all",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const {
        data,
        error,
      } = await supabase
        .from("content")
        .select("*")
        .order("id", {
          ascending: false,
        });

      if (error) {
        return res.status(500).json({
          error: error.message,
        });
      }

      return res.json({
        total:
          data?.length || 0,

        data,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }
);

/* =========================================================
   FRONTEND
========================================================= */

const staticPath = path.join(
  __dirname,
  "../client/dist"
);

if (fs.existsSync(staticPath)) {
  console.log(
    "📁 Serving frontend from:",
    staticPath
  );

  app.use(
    express.static(staticPath)
  );

  /*
     IMPORTANT:
     API routes are already registered above.
     This fallback only handles frontend routes.
  */

  app.get(
    "*",
    (req, res) => {
      res.sendFile(
        path.join(
          staticPath,
          "index.html"
        )
      );
    }
  );
} else {
  console.log(
    "⚠️ dist folder not found."
  );

  console.log(
    "📁 Build your client first:"
  );

  console.log(
    "cd client && npm run build"
  );
}

/* =========================================================
   404 HANDLER
========================================================= */

app.use(
  (req, res) => {
    if (
      req.path.startsWith("/api/")
    ) {
      return res.status(404).json({
        message:
          "API endpoint not found",
      });
    }

    return res.status(404).send(
      "Not found"
    );
  }
);

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
  (error, req, res, next) => {
    console.error(
      "SERVER ERROR:",
      error
    );

    if (
      error instanceof
      multer.MulterError
    ) {
      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }

    return res.status(500).json({
      message:
        error.message ||
        "Internal server error",
    });
  }
);

/* =========================================================
   START SERVER
========================================================= */

async function startServer() {
  try {
    await ensureAdmin();

    app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          "===================================="
        );

        console.log(
          `🚀 Server running on port ${PORT}`
        );

        console.log(
          `📍 API: http://localhost:${PORT}/api/health`
        );

        console.log(
          `📍 Frontend: http://localhost:${PORT}`
        );

        console.log(
          "===================================="
        );
      }
    );
  } catch (error) {
    console.error(
      "❌ Failed to start server:",
      error
    );

    process.exit(1);
  }
}

startServer();