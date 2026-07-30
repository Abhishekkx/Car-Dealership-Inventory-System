/**
 * Snapshot of a completed purchase, including buyer identity for history views.
 */
import mongoose, { Schema } from "mongoose";

export interface IPurchase {
  userId: string;
  buyerName: string;
  buyerEmail: string;
  vehicleId: string;
  make: string;
  model: string;
  category: string;
  price: number;
  purchasedAt: Date;
}

const purchaseSchema = new Schema<IPurchase>({
  userId: { type: String, required: true, index: true },
  buyerName: { type: String, required: true, trim: true },
  buyerEmail: { type: String, required: true, lowercase: true, trim: true },
  vehicleId: { type: String, required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  purchasedAt: { type: Date, default: Date.now },
});

export const Purchase = mongoose.model<IPurchase>("Purchase", purchaseSchema);
