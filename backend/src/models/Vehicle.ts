import mongoose, { Document, Schema } from "mongoose";

export interface IVehicle extends Document {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const Vehicle = mongoose.model<IVehicle>("Vehicle", vehicleSchema);
