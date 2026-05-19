import { Router } from "express";
import {
  getProviderDashboardById,
  getProviders,
  getServices,
} from "../controllers/dashboard.controller";

const router = Router();

router.get("/services", getServices);
router.get("/providers", getProviders);
router.get("/providers/:providerId", getProviderDashboardById);

export default router;
