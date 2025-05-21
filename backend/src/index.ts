import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { config } from "./config/env";
import { connectDB } from "./config/db";
import healthRouter from "./routes/health.route";
import authRouter from "./routes/auth.routes";
import farmerRouter from "./routes/farmer.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

// Connect to MongoDB
connectDB().catch((error) => {
  console.error("Failed to connect to MongoDB:", error);
  process.exit(1);
});

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Routes
app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", farmerRouter);

// Error handling
app.use(errorMiddleware);

// Start server
app.listen(config.port, () => {
  console.log(
    `Server running on port ${config.port} in ${config.nodeEnv} mode`
  );
  console.log(`API docs available at http://localhost:${config.port}/api`);
});
