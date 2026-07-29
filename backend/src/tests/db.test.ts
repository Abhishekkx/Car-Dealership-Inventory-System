import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { connectDatabase, getDatabaseReadyState } from "../config/db";

describe("connectDatabase", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("connects successfully to MongoDB", async () => {
    await connectDatabase(mongoServer.getUri());
    expect(getDatabaseReadyState()).toBe(1);
  });
});
