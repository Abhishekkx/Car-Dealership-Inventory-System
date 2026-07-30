import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "../app";
import { User } from "../models/User";

describe("Role-based access", () => {
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
    expect(userLogin.body.user.role).toBe("user");

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
    expect(adminLogin.body.user.role).toBe("admin");

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

  it("allows a normal user to create, list, search, update, and purchase", async () => {
    const created = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        make: "Honda",
        model: "Civic",
        category: "Sedan",
        price: 22000,
        quantity: 4,
      });
    expect(created.status).toBe(201);

    const list = await request(app)
      .get("/api/vehicles")
      .set("Authorization", `Bearer ${userToken}`);
    expect(list.status).toBe(200);
    expect(list.body.vehicles.length).toBeGreaterThanOrEqual(2);

    const search = await request(app)
      .get("/api/vehicles/search")
      .query({ make: "Honda" })
      .set("Authorization", `Bearer ${userToken}`);
    expect(search.status).toBe(200);
    expect(search.body.vehicles).toHaveLength(1);

    const updated = await request(app)
      .put(`/api/vehicles/${created.body.vehicle.id}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        make: "Honda",
        model: "Civic",
        category: "Sedan",
        price: 21000,
        quantity: 4,
      });
    expect(updated.status).toBe(200);
    expect(updated.body.vehicle.price).toBe(21000);

    const purchase = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(purchase.status).toBe(200);
    expect(purchase.body.vehicle.quantity).toBe(1);
  });

  it("blocks a normal user from delete and restock", async () => {
    const deleted = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(deleted.status).toBe(403);

    const restocked = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantity: 3 });
    expect(restocked.status).toBe(403);
  });

  it("allows an admin to delete and restock", async () => {
    const restocked = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 3 });
    expect(restocked.status).toBe(200);
    expect(restocked.body.vehicle.quantity).toBe(5);

    const deleted = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(deleted.status).toBe(200);
  });
});
