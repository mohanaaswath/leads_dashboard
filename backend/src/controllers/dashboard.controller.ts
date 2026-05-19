import { Response } from "express";
import { AuthRequest } from "../types";
import {
  getProviderDashboard,
  listProviders,
  listServices,
} from "../services/allocation.service";

export const getServices = async (_req: AuthRequest, res: Response) => {
  try {
    const services = await listServices();
    res.json({ services });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getProviders = async (_req: AuthRequest, res: Response) => {
  try {
    const providers = await listProviders();
    res.json({ providers });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getProviderDashboardById = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const dashboard = await getProviderDashboard(req.params.providerId);
    if (!dashboard) {
      res.status(404).json({ message: "Provider not found" });
      return;
    }

    res.json(dashboard);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
