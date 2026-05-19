import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import leadsRoutes from "./routes/leads.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import webhooksRoutes from "./routes/webhooks.routes";
import { localStore } from "./services/localStore";
import { seedInitialData } from "./services/allocation.service";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://mohanaaswath.github.io",
  ...(process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

corsOptions.allowedHeaders = ["Content-Type", "Authorization"];
corsOptions.methods = [
  "GET",
  "HEAD",
  "PUT",
  "PATCH",
  "POST",
  "DELETE",
  "OPTIONS",
];

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  // quick-response for preflight to reduce latency
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/webhooks", webhooksRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Global error handler
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  },
);

(async () => {
  try {
    await localStore.init();
    await seedInitialData();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error("Failed to initialize local store:", e);
    process.exit(1);
  }
})();
