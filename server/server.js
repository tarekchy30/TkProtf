import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
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
  "http://127.0.0.1:5173",
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

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

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
  "products",
];

/* =========================================================
   MULTER
   Memory storage because images are uploaded directly
   to Supabase Storage.
========================================================= */

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 25 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
      "application/pdf",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image or PDF files are allowed."));
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

function getVisitorHash(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  const ip = forwardedFor
    ? String(forwardedFor).split(",")[0].trim()
    : req.socket.remoteAddress || "unknown";
  const salt =
    process.env.VISITOR_HASH_SALT ||
    process.env.JWT_SECRET ||
    "portfolio-visitor";

  return crypto
    .createHash("sha256")
    .update(`${salt}:${ip}`)
    .digest("hex");
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
   PUBLIC HOME DATA
========================================================= */

app.get("/api/home", async (req, res) => {
  try {
    const resources = ["projects", "blogs", "youtube", "research", "products"];
    const [contentResults, profileResult] = await Promise.all([
      Promise.all(
        resources.map((resource) =>
          supabase
            .from("content")
            .select("id,resource,title,data,created_at,updated_at")
            .eq("resource", resource)
            .eq("data->>status", "published")
            .order("id", { ascending: false })
        )
      ),
      supabase
        .from("profile")
        .select("data")
        .eq("id", 1)
        .maybeSingle(),
    ]);

    const profileError = profileResult.error;
    if (profileError) {
      throw profileError;
    }

    const response = { profile: profileResult.data?.data || {} };

    contentResults.forEach((result, index) => {
      if (result.error) {
        throw result.error;
      }

      response[resources[index]] = (result.data || []).map((row) => ({
        id: row.id,
        ...(row.data || {}),
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
    });

    return res.json(response);
  } catch (error) {
    console.error("HOME DATA ERROR:", error);
    return res.status(500).json({ message: "Failed to load home data" });
  }
});

/* =========================================================
   RECORD PUBLIC VISITS
========================================================= */

app.post("/api/visits", async (req, res) => {
  try {
    const userAgent = String(req.headers["user-agent"] || "Unknown").slice(0, 500);
    const referrer = String(req.headers.referer || "").slice(0, 500);
    const page = typeof req.body?.page === "string"
      ? req.body.page.slice(0, 200)
      : "/";

    const { error } = await supabase
      .from("visitor_events")
      .insert({
        visitor_hash: getVisitorHash(req),
        user_agent: userAgent,
        referrer,
        page,
      });

    if (error) {
      console.error("VISITOR RECORD ERROR:", error.message);
      return res.status(500).json({ message: "Could not record visit" });
    }

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error("VISITOR RECORD ERROR:", error);
    return res.status(500).json({ message: "Could not record visit" });
  }
});

/* =========================================================
   PUBLIC MODERATED GUESTBOOK
========================================================= */

app.get("/api/guestbook", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("guestbook_entries")
      .select("id,name,message,role,created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(60);

    if (error) throw error;
    return res.json(data || []);
  } catch (error) {
    console.error("GUESTBOOK READ ERROR:", error.message);
    return res.status(500).json({ message: "Could not load guestbook" });
  }
});

app.post("/api/guestbook", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim().slice(0, 80);
    const message = String(req.body?.message || "").trim().slice(0, 500);
    const role = String(req.body?.role || "").trim().slice(0, 100);
    const website = String(req.body?.website || "").trim();

    // Quiet honeypot for simple bots; do not tell a bot whether it worked.
    if (website) return res.status(201).json({ ok: true });
    if (name.length < 2 || message.length < 8) {
      return res.status(400).json({
        message: "Please provide a name and a message of at least 8 characters.",
      });
    }

    const { data, error } = await supabase
      .from("guestbook_entries")
      .insert({
        name,
        message,
        role,
        status: "pending",
        visitor_hash: getVisitorHash(req),
      })
      .select("id,name,message,role,status,created_at")
      .single();

    if (error) throw error;
    return res.status(201).json({
      ok: true,
      status: data.status,
      message: "Thanks — your note is waiting for moderation.",
    });
  } catch (error) {
    console.error("GUESTBOOK SUBMIT ERROR:", error.message);
    return res.status(500).json({ message: "Could not submit guestbook note" });
  }
});

/* =========================================================
   PUBLIC CONTENT
========================================================= */

app.get("/api/:resource/:id/reactions", async (req, res) => {
  if (!["products", "projects"].includes(req.params.resource)) {
    return res.status(404).json({ message: "Reaction resource not found" });
  }
  const productId = Number(req.params.id);
  if (!Number.isInteger(productId)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  try {
    const visitorHash = getVisitorHash(req);
    const [{ data: rows, error: rowsError }, { data: ownReaction, error: ownError }] = await Promise.all([
      supabase
        .from("product_reactions")
        .select("reaction")
        .eq("product_id", productId),
      supabase
        .from("product_reactions")
        .select("reaction")
        .eq("product_id", productId)
        .eq("visitor_hash", visitorHash)
        .maybeSingle(),
    ]);

    if (rowsError) throw rowsError;
    if (ownError) throw ownError;
    const reactionCounts = (rows || []).reduce((counts, row) => {
      counts[row.reaction] = (counts[row.reaction] || 0) + 1;
      return counts;
    }, {});
    return res.json({
      reactions: reactionCounts,
      selected: ownReaction?.reaction || null,
      count: rows?.length || 0,
      liked: Boolean(ownReaction),
    });
  } catch (error) {
    console.error("PRODUCT REACTIONS LOAD ERROR:", error.message);
    return res.status(500).json({ message: "Could not load product reactions" });
  }
});

app.post("/api/:resource/:id/reactions", async (req, res) => {
  if (!["products", "projects"].includes(req.params.resource)) {
    return res.status(404).json({ message: "Reaction resource not found" });
  }
  const productId = Number(req.params.id);
  if (!Number.isInteger(productId)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  try {
    const allowedReactions = new Set(["love", "fire", "like"]);
    const reaction = String(req.body?.reaction || "love");
    if (!allowedReactions.has(reaction)) {
      return res.status(400).json({ message: "Invalid reaction type" });
    }

    const visitorHash = getVisitorHash(req);
    const { data: existing, error: findError } = await supabase
      .from("product_reactions")
      .select("id,reaction")
      .eq("product_id", productId)
      .eq("visitor_hash", visitorHash)
      .maybeSingle();

    if (findError) throw findError;

    if (existing?.reaction === reaction) {
      const { error } = await supabase
        .from("product_reactions")
        .delete()
        .eq("id", existing.id);
      if (error) throw error;
    } else if (existing) {
      const { error } = await supabase
        .from("product_reactions")
        .update({ reaction })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("product_reactions")
        .insert({ product_id: productId, reaction, visitor_hash: visitorHash });
      if (error) throw error;
    }

    const { data: rows, error: rowsError } = await supabase
      .from("product_reactions")
      .select("reaction")
      .eq("product_id", productId);

    if (rowsError) throw rowsError;
    const reactionCounts = (rows || []).reduce((counts, row) => {
      counts[row.reaction] = (counts[row.reaction] || 0) + 1;
      return counts;
    }, {});
    return res.json({
      reactions: reactionCounts,
      selected: existing?.reaction === reaction ? null : reaction,
      count: rows?.length || 0,
      liked: existing?.reaction !== reaction,
    });
  } catch (error) {
    console.error("PRODUCT REACTION ERROR:", error.message);
    return res.status(500).json({ message: "Could not update product reaction" });
  }
});

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

      const { data: visitors, error: visitorError } = await supabase
        .from("visitor_events")
        .select("visitor_hash");

      if (visitorError) {
        throw visitorError;
      }

      result.visits = visitors?.length || 0;
      result.uniqueVisitors = new Set(
        (visitors || []).map((visitor) => visitor.visitor_hash)
      ).size;

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
   ADMIN GET VISITORS
========================================================= */

app.get(
  "/api/admin/visitors",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("visitor_events")
        .select("id,visitor_hash,user_agent,referrer,page,visited_at")
        .order("visited_at", { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      return res.json(
        (data || []).map((visitor) => ({
          ...visitor,
          visitor_id: visitor.visitor_hash.slice(0, 10),
        }))
      );
    } catch (error) {
      console.error("ADMIN VISITORS ERROR:", error);
      return res.status(500).json({ message: error.message });
    }
  }
);

app.get(
  "/api/admin/visitor-insights",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("visitor_events")
        .select("visitor_hash,referrer,page,visited_at")
        .order("visited_at", { ascending: false })
        .limit(5000);

      if (error) throw error;

      const events = data || [];
      const now = Date.now();
      const recent = events.filter((event) => (
        now - new Date(event.visited_at).getTime() <= 7 * 24 * 60 * 60 * 1000
      ));
      const countBy = (key, fallback) => Object.entries(
        events.reduce((counts, event) => {
          const value = String(event[key] || "").trim() || fallback;
          counts[value] = (counts[value] || 0) + 1;
          return counts;
        }, {})
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, count]) => ({ label, count }));

      return res.json({
        last7Days: recent.length,
        uniqueLast7Days: new Set(recent.map((event) => event.visitor_hash)).size,
        topPages: countBy("page", "/"),
        topReferrers: countBy("referrer", "Direct"),
      });
    } catch (error) {
      console.error("VISITOR INSIGHTS ERROR:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
);

app.get(
  "/api/admin/guestbook",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("guestbook_entries")
        .select("id,name,message,role,status,created_at,moderated_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return res.json(data || []);
    } catch (error) {
      console.error("ADMIN GUESTBOOK ERROR:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
);

app.patch(
  "/api/admin/guestbook/:id",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const status = String(req.body?.status || "").toLowerCase();
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid moderation status" });
      }

      const { data, error } = await supabase
        .from("guestbook_entries")
        .update({
          status,
          moderated_at: new Date().toISOString(),
          moderated_by: req.user.email || null,
        })
        .eq("id", req.params.id)
        .select("id,name,message,role,status,created_at,moderated_at")
        .maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ message: "Guestbook entry not found" });
      return res.json(data);
    } catch (error) {
      console.error("GUESTBOOK MODERATION ERROR:", error.message);
      return res.status(500).json({ message: error.message });
    }
  }
);

app.delete(
  "/api/admin/guestbook/:id",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const { error } = await supabase
        .from("guestbook_entries")
        .delete()
        .eq("id", req.params.id);
      if (error) throw error;
      return res.json({ ok: true });
    } catch (error) {
      console.error("GUESTBOOK DELETE ERROR:", error.message);
      return res.status(500).json({ message: error.message });
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
     DIGITAL PRODUCTS
  ------------------------------------------------------- */

  else if (resource === "products") {
    cleanData.productType = formData.productType || "Digital product";
    cleanData.framework = formData.framework || "React";
    cleanData.downloadType = formData.downloadType === "paid" ? "paid" : "free";
    cleanData.price = formData.price || "";
    cleanData.currency = formData.currency || "USD";
    cleanData.checkoutUrl = formData.checkoutUrl || "";
    cleanData.freeDownloadUrl = formData.freeDownloadUrl || formData.pdfUrl || "";
    cleanData.pdfUrl = formData.pdfUrl || "";
    cleanData.previewUrl = formData.previewUrl || "";
    cleanData.image = formData.image || "";
    cleanData.features = Array.isArray(formData.features)
      ? formData.features
      : typeof formData.features === "string"
      ? formData.features.split(",").map((item) => item.trim()).filter(Boolean)
      : [];
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