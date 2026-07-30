import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "../app";
import { User } from "../models/User";

describe("Purchases", () => {
  let mongoServer: MongoMemoryServer;
  let userToken: string;
  let otherToken: string;
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
      name: "Other Buyer",
      email: "other@example.com",
      password: "password123",
    });
    const otherLogin = await request(app).post("/api/auth/login").send({
      email: "other@example.com",
      password: "password123",
    });
    otherToken = otherLogin.body.token;

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
        quantity: 5,
      });
    vehicleId = created.body.vehicle.id;
  });

  it("records a purchase for the buyer", async () => {
    const purchase = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(purchase.status).toBe(200);

    const response = await request(app)
      .get("/api/purchases")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.purchases).toHaveLength(1);
    expect(response.body.purchases[0]).toMatchObject({
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      vehicleId,
      buyerName: "Buyer One",
      buyerEmail: "buyer@example.com",
    });
    expect(response.body.purchases[0]).toHaveProperty("id");
    expect(response.body.purchases[0]).toHaveProperty("purchasedAt");
  });

  it("returns only the current user's purchases", async () => {
    await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${userToken}`);
    await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${otherToken}`);

    const response = await request(app)
      .get("/api/purchases")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.purchases).toHaveLength(1);
  });

  it("rejects unauthenticated purchase history access", async () => {
    const response = await request(app).get("/api/purchases");
    expect(response.status).toBe(401);
  });
});
