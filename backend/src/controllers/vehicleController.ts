import { Response } from "express";
import { Vehicle } from "../models/Vehicle";
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
