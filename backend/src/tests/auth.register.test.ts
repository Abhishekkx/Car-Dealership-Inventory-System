import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "../app";

describe("POST /api/auth/register", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
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
  });

  it("registers a new user and returns 201", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Buyer One",
      email: "buyer@example.com",
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({
      name: "Buyer One",
      email: "buyer@example.com",
      role: "user",
    });
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user).not.toHaveProperty("password");
  });

  it("rejects registration when name is missing", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "buyer@example.com",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  it("rejects registration when email is missing", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Buyer One",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  it("rejects registration when password is missing", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Buyer One",
      email: "buyer@example.com",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  it("rejects duplicate email registration", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Buyer One",
      email: "buyer@example.com",
      password: "password123",
    });

    const response = await request(app).post("/api/auth/register").send({
      name: "Buyer Two",
      email: "buyer@example.com",
      password: "password123",
    });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("message");
  });
});
