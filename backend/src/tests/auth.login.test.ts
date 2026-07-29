import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "../app";

describe("POST /api/auth/login", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret-key-for-jwt";
    process.env.JWT_EXPIRES_IN = "1d";
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }

    await request(app).post("/api/auth/register").send({
      email: "buyer@example.com",
      password: "password123",
    });
  });

  it("logs in with valid credentials and returns a JWT", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "buyer@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(typeof response.body.token).toBe("string");
    expect(response.body.user).toMatchObject({
      email: "buyer@example.com",
      role: "user",
    });
    expect(response.body.user).not.toHaveProperty("password");
  });

  it("rejects login with wrong password", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "buyer@example.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

  it("rejects login for unknown email", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "unknown@example.com",
      password: "password123",
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

  it("rejects login when email or password is missing", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "buyer@example.com",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });
});
