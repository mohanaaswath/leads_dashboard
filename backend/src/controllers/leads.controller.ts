import { Response } from "express";
import { AuthRequest } from "../types";
import {
  AllocationCapacityError,
  DuplicateLeadError,
  createLeadWithAssignments,
} from "../services/allocation.service";

export const createLead = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, phoneNumber, city, serviceType, description } = req.body as {
      name?: string;
      phoneNumber?: string;
      city?: string;
      serviceType?: string;
      description?: string;
    };

    if (!name || !phoneNumber || !city || !serviceType || !description) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const result = await createLeadWithAssignments({
      name,
      phoneNumber,
      city,
      serviceType: serviceType as never,
      description,
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof DuplicateLeadError) {
      res.status(409).json({ message: error.message });
      return;
    }

    if (error instanceof AllocationCapacityError) {
      res.status(409).json({ message: error.message });
      return;
    }

    res.status(500).json({ message: "Server error" });
  }
};
