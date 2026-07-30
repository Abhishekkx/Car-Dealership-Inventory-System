import { Response } from "express";
import { FilterQuery } from "mongoose";
import { IVehicle, Vehicle } from "../models/Vehicle";
import { Purchase } from "../models/Purchase";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

function toVehicleResponse(vehicle: {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}) {
  return {
    id: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    category: vehicle.category,
    price: vehicle.price,
    quantity: vehicle.quantity,
  };
}

export async function createVehicle(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { make, model, category, price, quantity } = req.body;

    if (
      !make ||
      !model ||
      !category ||
      price === undefined ||
      quantity === undefined
    ) {
      res.status(400).json({
        message: "make, model, category, price, and quantity are required",
      });
      return;
    }

    const vehicle = await Vehicle.create({
      make,
      model,
      category,
      price,
      quantity,
    });

    res.status(201).json({ vehicle: toVehicleResponse(vehicle) });
  } catch {
    res.status(500).json({ message: "Failed to create vehicle" });
  }
}

export async function listVehicles(
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.status(200).json({
      vehicles: vehicles.map((vehicle) => toVehicleResponse(vehicle)),
    });
  } catch {
    res.status(500).json({ message: "Failed to list vehicles" });
  }
}

export async function searchVehicles(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { make, model, category, minPrice, maxPrice } = req.query;
    const filter: FilterQuery<IVehicle> = {};

    if (typeof make === "string" && make.trim()) {
      filter.make = new RegExp(make.trim(), "i");
    }
    if (typeof model === "string" && model.trim()) {
      filter.model = new RegExp(model.trim(), "i");
    }
    if (typeof category === "string" && category.trim()) {
      filter.category = new RegExp(category.trim(), "i");
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      vehicles: vehicles.map((vehicle) => toVehicleResponse(vehicle)),
    });
  } catch {
    res.status(500).json({ message: "Failed to search vehicles" });
  }
}

export async function updateVehicle(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { make, model, category, price, quantity } = req.body;

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { make, model, category, price, quantity },
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      res.status(404).json({ message: "Vehicle not found" });
      return;
    }

    res.status(200).json({ vehicle: toVehicleResponse(vehicle) });
  } catch {
    res.status(500).json({ message: "Failed to update vehicle" });
  }
}

export async function deleteVehicle(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      res.status(404).json({ message: "Vehicle not found" });
      return;
    }

    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch {
    res.status(500).json({ message: "Failed to delete vehicle" });
  }
}

export async function purchaseVehicle(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      res.status(404).json({ message: "Vehicle not found" });
      return;
    }

    if (vehicle.quantity <= 0) {
      res.status(400).json({ message: "Vehicle is out of stock" });
      return;
    }

    vehicle.quantity -= 1;
    await vehicle.save();

    await Purchase.create({
      userId: req.user.id,
      buyerName: req.user.name,
      buyerEmail: req.user.email,
      vehicleId: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      category: vehicle.category,
      price: vehicle.price,
    });

    res.status(200).json({ vehicle: toVehicleResponse(vehicle) });
  } catch {
    res.status(500).json({ message: "Failed to purchase vehicle" });
  }
}

export async function restockVehicle(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { quantity } = req.body;

    if (quantity === undefined || Number(quantity) <= 0) {
      res.status(400).json({ message: "A positive quantity is required" });
      return;
    }

    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      res.status(404).json({ message: "Vehicle not found" });
      return;
    }

    vehicle.quantity += Number(quantity);
    await vehicle.save();

    res.status(200).json({ vehicle: toVehicleResponse(vehicle) });
  } catch {
    res.status(500).json({ message: "Failed to restock vehicle" });
  }
}
