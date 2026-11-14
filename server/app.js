require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./Config/db");
const validateEnv = require("./middlewares/validateEnv");
const errorHandler = require("./middlewares/errorHandler");

// Validate critical configs
validateEnv();

// Connect to MongoDB
connectDB();

const app = express();

// Security: Whitelist CORS origins in production
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Lightweight request logger for monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== "test") {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// Import API Routes
const authRoutes = require("./routes/auth");
const requestRoutes = require("./routes/requests");
const skillRoutes = require("./routes/skills");
const reviewRoutes = require("./routes/reviews");
const notificationRoutes = require("./routes/notifications");
const userRoutes = require("./routes/users");

// Register Endpoints
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);

// Production Health & Diagnostic Check
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };

  res.json({
    status: dbState === 1 ? "healthy" : "degraded",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: states[dbState] || "unknown",
    environment: process.env.NODE_ENV || "development",
  });
});

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 SkillSwap Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

// Graceful Shutdown for Zero-Downtime deployments (Docker / Kubernetes / PM2)
const handleGracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Closing HTTP server and database connections cleanly...`);
  server.close(async () => {
    try {
      await mongoose.connection.close(false);
      console.log("MongoDB connection closed. Process terminating safely.");
      process.exit(0);
    } catch (err) {
      console.error("Error during MongoDB disconnection:", err);
      process.exit(1);
    }
  });

  // Force close after 10s if hanging
  setTimeout(() => {
    console.error("Forced termination: shutdown timed out after 10s.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));

module.exports = app;
