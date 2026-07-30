/**
 * Protected vehicle routes. Delete and restock require admin.
 */
import { Router } from "express";
import {
  createVehicle,
  deleteVehicle,
  listVehicles,
  purchaseVehicle,
  restockVehicle,
  searchVehicles,
  updateVehicle,
} from "../controllers/vehicleController";
import { authenticate, requireAdmin } from "../middleware/authMiddleware";

const vehicleRouter = Router();

vehicleRouter.use(authenticate);

vehicleRouter.post("/", createVehicle);
vehicleRouter.get("/", listVehicles);
vehicleRouter.get("/search", searchVehicles);
vehicleRouter.put("/:id", updateVehicle);
vehicleRouter.delete("/:id", requireAdmin, deleteVehicle);
vehicleRouter.post("/:id/purchase", purchaseVehicle);
vehicleRouter.post("/:id/restock", requireAdmin, restockVehicle);

export default vehicleRouter;
