import { Router } from "express";
import {
  createVehicle,
  deleteVehicle,
  listVehicles,
  updateVehicle,
} from "../controllers/vehicleController";
import { authenticate, requireAdmin } from "../middleware/authMiddleware";

const vehicleRouter = Router();

vehicleRouter.use(authenticate);

vehicleRouter.post("/", createVehicle);
vehicleRouter.get("/", listVehicles);
vehicleRouter.put("/:id", updateVehicle);
vehicleRouter.delete("/:id", requireAdmin, deleteVehicle);

export default vehicleRouter;
