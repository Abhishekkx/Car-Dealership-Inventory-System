import mongoose from "mongoose";

export async function connectDatabase(uri: string): Promise<void> {
  await mongoose.connect(uri);
}

export function getDatabaseReadyState(): number {
  return mongoose.connection.readyState;
}
