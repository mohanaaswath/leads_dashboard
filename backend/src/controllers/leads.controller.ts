import { Response } from "express";
import { AuthRequest, Lead } from "../types";
import { localStore } from "../services/localStore";

// GET /leads — with filtering, search, sort, pagination
export const getLeads = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      status,
      source,
      search,
      sort = "newest",
      page = "1",
    } = req.query as Record<string, string>;

    const pageNum = parseInt(page, 10) || 1;
    const pageSize = 10;

    const stored = await localStore.getLeads();
    let leads = stored.filter((lead) => {
      if (status && lead.status !== status) return false;
      if (source && lead.source !== source) return false;
      return true;
    });

    leads = leads.sort((a, b) => {
      const diff =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sort === "oldest" ? diff : -diff;
    });

    // Search filter (client-side after fetch — Firestore doesn't support full-text)
    if (search) {
      const s = search.toLowerCase();
      leads = leads.filter(
        (l) =>
          l.name.toLowerCase().includes(s) || l.email.toLowerCase().includes(s),
      );
    }

    const total = leads.length;
    const totalPages = Math.ceil(total / pageSize);
    const paginated = leads.slice((pageNum - 1) * pageSize, pageNum * pageSize);

    res.json({ leads: paginated, total, page: pageNum, totalPages });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /leads/:id
export const getLead = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const lead = await localStore.getLeadById(req.params.id);
    if (!lead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }
    res.json(lead);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// POST /leads
export const createLead = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, email, status, source } = req.body as Lead;

    if (!name || !email || !status || !source) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const newLead: Lead = {
      name,
      email,
      status,
      source,
      createdAt: new Date().toISOString(),
      userId: req.user!.userId,
    };

    const storedLead = await localStore.addLead(newLead);
    res.status(201).json(storedLead);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /leads/:id
export const updateLead = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, email, status, source } = req.body as Partial<Lead>;
    const updated = await localStore.updateLead(req.params.id, {
      name,
      email,
      status,
      source,
    });

    if (!updated) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    res.json(updated);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /leads/:id — admin only
export const deleteLead = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const deleted = await localStore.deleteLead(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }
    res.json({ message: "Lead deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
