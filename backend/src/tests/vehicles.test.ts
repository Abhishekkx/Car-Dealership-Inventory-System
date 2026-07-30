import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "../app";
import { User } from "../models/User";

async function registerAndLogin(email: string, password: string) {
  await request(app).post("/api/auth/register").send({
    name: "Test User",
    email,
    password,
  });
  const login = await request(app).post("/api/auth/login").send({ email, password });
  return login.body.token as string;
}

describe("Vehicles API", () => {
  let mongoServer: MongoMemoryServer;
  let userToken: string;
  let adminToken: string;

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

    userToken = await registerAndLogin("buyer@example.com", "password123");

    await request(app).post("/api/auth/register").send({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
    });
    await User.findOneAndUpdate(
      { email: "admin@example.com" },
      { role: "admin" }
    );
    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "password123",
    });
    adminToken = adminLogin.body.token;
  });

  it("rejects unauthenticated vehicle creation", async () => {
    const response = await request(app).post("/api/vehicles").send({
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 3,
    });

    expect(response.status).toBe(401);
  });

  it("creates a vehicle when authenticated", async () => {
    const response = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        make: "Toyota",
        model: "Camry",
        category: "Sedan",
        price: 25000,
        quantity: 3,
      });

    expect(response.status).toBe(201);
    expect(response.body.vehicle).toMatchObject({
      make: "Toyota",
      model: "Camry",
      category: "Sedan",
      price: 25000,
      quantity: 3,
    });
    expect(response.body.vehicle).toHaveProperty("id");
  });

  it("lists all vehicles", async () => {
    await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        make: "Toyota",
        model: "Camry",
        category: "Sedan",
        price: 25000,
        quantity: 3,
      });

    const response = await request(app)
      .get("/api/vehicles")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.vehicles).toHaveLength(1);
    expect(response.body.vehicles[0].make).toBe("Toyota");
  });

  it("updates a vehicle", async () => {
    const created = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        make: "Toyota",
        model: "Camry",
        category: "Sedan",
        price: 25000,
        quantity: 3,
      });

    const id = created.body.vehicle.id;

    const response = await request(app)
      .put(`/api/vehicles/${id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        make: "Toyota",
        model: "Camry",
        category: "Sedan",
        price: 24000,
        quantity: 5,
      });

    expect(response.status).toBe(200);
    expect(response.body.vehicle.price).toBe(24000);
    expect(response.body.vehicle.quantity).toBe(5);
  });

  it("deletes a vehicle as admin", async () => {
    const created = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        make: "Toyota",
        model: "Camry",
        category: "Sedan",
        price: 25000,
        quantity: 3,
      });

    const id = created.body.vehicle.id;

    const response = await request(app)
      .delete(`/api/vehicles/${id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
  });

  it("forbids non-admin from deleting a vehicle", async () => {
    const created = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        make: "Toyota",
        model: "Camry",
        category: "Sedan",
        price: 25000,
        quantity: 3,
      });

    const id = created.body.vehicle.id;

    const response = await request(app)
      .delete(`/api/vehicles/${id}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(403);
  });
});
