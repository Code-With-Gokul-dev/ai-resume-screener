import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import jobRoutes from "./routes/jobs.js";
import resumeRoutes from "./routes/resumes.js";
import resultRoutes from "./routes/results.js";

const app = express();

const allowedOrigin = (process.env.CLIENT_URL || "").replace(/\/$/, "");
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin === allowedOrigin) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());
app.use(express.json({ limit: "1mb" }));

// Routes
app.get("/api/health", (_req, res) => res.json({ message: "The server is live" }));
app.use("/api/jobs", jobRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api", resultRoutes);

// 404 
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error("Startup failed:", err.message);
    process.exit(1);
  });
