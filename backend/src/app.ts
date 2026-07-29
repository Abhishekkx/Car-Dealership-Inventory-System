import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRouter from "./routes/authRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";

  res.status(200).json({
    status: "ok",
    database: dbStatus,
  });
});

app.use("/api/auth", authRouter);

export default app;
