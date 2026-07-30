import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDatabase } from "../config/db";
import { User } from "../models/User";

async function seedAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  const email = (process.env.ADMIN_EMAIL || "admin@apexmotors.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";

  await connectDatabase(uri);

  const hashedPassword = await bcrypt.hash(password, 10);
  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = "admin";
    existing.password = hashedPassword;
    await existing.save();
    console.log(`Updated existing user to admin: ${email}`);
  } else {
    await User.create({
      email,
      password: hashedPassword,
      role: "admin",
    });
    console.log(`Created admin user: ${email}`);
  }

  await mongoose.disconnect();
}

seedAdmin().catch(async (error) => {
  console.error("Failed to seed admin", error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
