/** Authenticated purchase-history routes for the current buyer. */
import { Router } from "express";
import { listMyPurchases } from "../controllers/purchaseController";
import { authenticate } from "../middleware/authMiddleware";

const purchaseRouter = Router();

purchaseRouter.use(authenticate);
purchaseRouter.get("/", listMyPurchases);

export default purchaseRouter;
