import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "../app";
import { User } from "../models/User";

describe("Inventory endpoints", () => {
  let mongoServer: MongoMemoryServer;
  let userToken: string;
  let adminToken: string;
  let vehicleId: string;

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
      name: "Buyer One",
      email: "buyer@example.com",
      password: "password123",
    });
    const userLogin = await request(app).post("/api/auth/login").send({
      email: "buyer@example.com",
      password: "password123",
    });
    userToken = userLogin.body.token;

    await request(app).post("/api/auth/register").send({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
    });
    await User.findOneAndUpdate({ email: "admin@example.com" }, { role: "admin" });
    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "password123",
    });
    adminToken = adminLogin.body.token;

    const created = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        make: "Toyota",
        model: "Camry",
        category: "Sedan",
        price: 25000,
        quantity: 2,
      });
    vehicleId = created.body.vehicle.id;
  });

  it("purchases a vehicle and decreases quantity", async () => {
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.vehicle.quantity).toBe(1);
  });

  it("rejects purchase when quantity is zero", async () => {
    await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${userToken}`);
    await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${userToken}`);

    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  it("restocks a vehicle as admin", async () => {
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 5 });

    expect(response.status).toBe(200);
    expect(response.body.vehicle.quantity).toBe(7);
  });

  it("forbids non-admin from restocking", async () => {
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantity: 5 });

    expect(response.status).toBe(403);
  });
});
