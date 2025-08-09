import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { prisma } from "./lib/prisma";
import logger from "./utils/logger";

// Import security middleware
import { csrfProtection, provideCSRFToken } from "./middleware/csrf";
import {
  generalUserRateLimit,
  authRateLimit,
  adminRateLimit,
} from "./middleware/userRateLimit";

// Import routes
import activityRoutes from "./routes/activity";
import adminRoutes from "./routes/admin";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";

dotenv.config();

export const app = express();
const PORT = process.env["PORT"] || 5000;

/**
 * Security middleware configuration
 * - Helmet for security headers and CSP
 * - CORS with specific origins and security headers
 */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:", "res.cloudinary.com"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding for development
    // Enhanced XSS Protection
    xssFilter: true, // Enable XSS filter
    noSniff: true, // Prevent MIME type sniffing
    frameguard: { action: "deny" }, // Prevent clickjacking
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    // Additional security headers
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

app.use(
  cors({
    origin: process.env["FRONTEND_URL"] || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    exposedHeaders: [
      "X-CSRF-Token",
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
      "X-RateLimit-Reset",
    ],
  })
);

/**
 * Global IP-based rate limiting
 * Fallback protection for unauthenticated requests
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", globalLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/**
 * Request logging middleware
 * Logs all incoming requests for monitoring and debugging
 */
app.use((req, _res, next) => {
  logger.info(
    {
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    },
    "Incoming request"
  );
  next();
});

/**
 * Health check endpoint for monitoring
 */
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "UMS Backend is running",
    timestamp: new Date().toISOString(),
    environment: process.env["NODE_ENV"] || "development",
  });
});

/**
 * Apply security middleware to all API routes
 * - User-specific rate limiting
 * - CSRF token provision and validation
 */
app.use("/api", generalUserRateLimit);
app.use("/api", provideCSRFToken());
app.use("/api", csrfProtection());

/**
 * API routes with specific rate limiting
 */
app.use("/api/auth", authRateLimit, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRateLimit, adminRoutes);
app.use("/api/activity", activityRoutes);

/**
 * 404 handler for undefined routes
 */
app.use("*", (req, res) => {
  logger.warn({ url: req.originalUrl }, "Route not found");
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/**
 * Global error handler
 * Must be last middleware to catch all errors
 */
import { errorHandler } from "./middleware/errorHandler";
app.use(errorHandler);

/**
 * Database connection function
 */
export async function connectDB() {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Failed to connect to database:", error);
    throw error;
  }
}

/**
 * Start server only in non-test environments
 */
if (process.env["NODE_ENV"] !== "test") {
  connectDB().then(() => {
    app.listen(PORT, () => {
      logger.info(
        `Server running on port ${PORT} in ${
          process.env["NODE_ENV"] || "development"
        } mode`
      );
    });
  });
}

/**
 * Graceful shutdown handlers
 * Ensures proper cleanup of database connections
 */
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});
