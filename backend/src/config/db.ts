/**
 * MongoDB connection helpers used by the API and seed scripts.
 */
import mongoose from "mongoose";

/** Connects Mongoose to the given Atlas (or local) URI. */
export async function connectDatabase(uri: string): Promise<void> {
  await mongoose.connect(uri);
}

/** Returns Mongoose readyState (0 disconnected, 1 connected, 2 connecting). */
export function getDatabaseReadyState(): number {
  return mongoose.connection.readyState;
}
