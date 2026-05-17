import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../types";
import { localStore } from "../services/localStore";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body as User;
    const jwtSecret =
      process.env.JWT_SECRET ||
      (process.env.NODE_ENV !== "production" ? "smart-leads-dev-secret" : "");

    if (!jwtSecret) {
      res.status(500).json({ message: "JWT secret is not configured" });
      return;
    }

    if (!name || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const existing = await localStore.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      name,
      email,
      password: hashedPassword,
      role: role === "admin" ? "admin" : "sales",
    };

    const storedUser = await localStore.addUser(newUser);
    const token = jwt.sign(
      { userId: storedUser.id, email, role: newUser.role },
      jwtSecret,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      token,
      user: { id: storedUser.id, name, email, role: newUser.role },
    });
  } catch (error) {
    console.error("Register failed:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as Pick<User, "email" | "password">;
    const jwtSecret =
      process.env.JWT_SECRET ||
      (process.env.NODE_ENV !== "production" ? "smart-leads-dev-secret" : "");

    if (!jwtSecret) {
      res.status(500).json({ message: "JWT secret is not configured" });
      return;
    }

    if (!email || !password) {
      res.status(400).json({ message: "Email and password required" });
      return;
    }

    const user = await localStore.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { userId: user.id!, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    console.error("Login failed");
    res.status(500).json({ message: "Server error" });
  }
};
