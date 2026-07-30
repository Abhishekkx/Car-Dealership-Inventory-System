import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "../app";
import { User } from "../models/User";

async function getAdminToken() {
  await request(app).post("/api/auth/register").send({
    name: "Admin User",
    email: "admin@example.com",
    password: "password123",
  });
  await User.findOneAndUpdate({ email: "admin@example.com" }, { role: "admin" });
  const login = await request(app).post("/api/auth/login").send({
    email: "admin@example.com",
    password: "password123",
  });
  return login.body.token as string;
}

describe("GET /api/vehicles/search", () => {
  let mongoServer: MongoMemoryServer;
  let token: string;

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

    token = await getAdminToken();

    const vehicles = [
      {
        make: "Toyota",
        model: "Camry",
        category: "Sedan",
        price: 25000,
        quantity: 3,
      },
      {
        make: "Honda",
        model: "CR-V",
        category: "SUV",
        price: 32000,
        quantity: 2,
      },
      {
        make: "Toyota",
        model: "RAV4",
        category: "SUV",
        price: 30000,
        quantity: 4,
      },
    ];

    for (const vehicle of vehicles) {
      await request(app)
        .post("/api/vehicles")
        .set("Authorization", `Bearer ${token}`)
        .send(vehicle);
    }
  });

  it("searches by make", async () => {
    const response = await request(app)
      .get("/api/vehicles/search")
      .query({ make: "Toyota" })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.vehicles).toHaveLength(2);
  });

  it("searches by model", async () => {
    const response = await request(app)
      .get("/api/vehicles/search")
      .query({ model: "CR-V" })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.vehicles).toHaveLength(1);
    expect(response.body.vehicles[0].make).toBe("Honda");
  });

  it("searches by category", async () => {
    const response = await request(app)
      .get("/api/vehicles/search")
      .query({ category: "SUV" })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.vehicles).toHaveLength(2);
  });

  it("searches by price range", async () => {
    const response = await request(app)
      .get("/api/vehicles/search")
      .query({ minPrice: 26000, maxPrice: 31000 })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.vehicles).toHaveLength(1);
    expect(response.body.vehicles[0].model).toBe("RAV4");
  });

  it("combines make and category filters", async () => {
    const response = await request(app)
      .get("/api/vehicles/search")
      .query({ make: "Toyota", category: "SUV" })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.vehicles).toHaveLength(1);
    expect(response.body.vehicles[0].model).toBe("RAV4");
  });

  it("returns all vehicles when no filters are provided", async () => {
    const response = await request(app)
      .get("/api/vehicles/search")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.vehicles).toHaveLength(3);
  });
});
