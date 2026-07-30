/**
 * Purchase history for the authenticated buyer.
 */
import { Response } from "express";
import { Purchase } from "../models/Purchase";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

/** Lists purchases belonging to the current user. */
export async function listMyPurchases(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const purchases = await Purchase.find({ userId: req.user.id }).sort({
      purchasedAt: -1,
    });

    res.status(200).json({
      purchases: purchases.map((purchase) => ({
        id: purchase.id,
        userId: purchase.userId,
        buyerName: purchase.buyerName,
        buyerEmail: purchase.buyerEmail,
        vehicleId: purchase.vehicleId,
        make: purchase.make,
        model: purchase.model,
        category: purchase.category,
        price: purchase.price,
        purchasedAt: purchase.purchasedAt,
      })),
    });
  } catch {
    res.status(500).json({ message: "Failed to list purchases" });
  }
}
