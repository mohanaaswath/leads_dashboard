import { Request } from "express";

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Lost";
export type LeadSource = "Website" | "Instagram" | "Referral";
export type UserRole = "admin" | "sales";

export interface Lead {
  id?: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdAt: string;
  userId: string;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}