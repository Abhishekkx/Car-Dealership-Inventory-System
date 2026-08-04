/**
 * Express application entry for the dealership API.
 * Mounts health, auth, vehicle, and purchase routes.
 */
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRouter from "./routes/authRoutes";
import vehicleRouter from "./routes/vehicleRoutes";
import purchaseRouter from "./routes/purchaseRoutes";
import {
  dealershipBusinessHours,
  isBusinessOpen,
} from "./utils/buisnesshours";

const app = express();

app.use(cors());
app.use(express.json());

/** Liveness check including MongoDB connection state. */
app.get("/api/health", (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";

  res.status(200).json({
    status: "ok",
    database: dbStatus,
  });
});

/** Returns the published schedule and the dealership's current availability. */
app.get("/api/business-hours", (_req, res) => {
  res.status(200).json({
    isOpen: isBusinessOpen(),
    hours: dealershipBusinessHours,
  });
});

app.use("/api/auth", authRouter);
app.use("/api/vehicles", vehicleRouter);
app.use("/api/purchases", purchaseRouter);

export default app;
