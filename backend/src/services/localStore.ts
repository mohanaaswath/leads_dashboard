import fs from "fs/promises";
import path from "path";
import { Lead, User } from "../types";

const dataDir = path.resolve(process.cwd(), "data");
const usersFile = path.join(dataDir, "users.json");
const leadsFile = path.join(dataDir, "leads.json");

const ensureDataDir = async () => {
  await fs.mkdir(dataDir, { recursive: true });
};

const readJsonFile = async <T>(filePath: string, fallback: T): Promise<T> => {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJsonFile = async (filePath: string, value: unknown) => {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
};

export interface StoredUser extends User {
  id: string;
}

export interface StoredLead extends Lead {
  id: string;
}

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

// In-memory cache to avoid repeated file I/O on auth-critical paths
let usersCache: StoredUser[] | null = null;

export const localStore = {
  // Initialize cache at startup
  async init(): Promise<void> {
    usersCache = await readJsonFile<StoredUser[]>(usersFile, []);
  },

  async getUsers(): Promise<StoredUser[]> {
    if (usersCache === null) {
      usersCache = await readJsonFile<StoredUser[]>(usersFile, []);
    }
    return usersCache;
  },

  async findUserByEmail(email: string): Promise<StoredUser | undefined> {
    const users = await this.getUsers();
    return users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  },

  async addUser(user: User): Promise<StoredUser> {
    const users = await this.getUsers();
    const storedUser: StoredUser = { ...user, id: createId() };
    users.push(storedUser);
    usersCache = users;
    await writeJsonFile(usersFile, users);
    return storedUser;
  },

  async getLeads(): Promise<StoredLead[]> {
    return readJsonFile<StoredLead[]>(leadsFile, []);
  },

  async getLeadById(id: string): Promise<StoredLead | undefined> {
    const leads = await this.getLeads();
    return leads.find((lead) => lead.id === id);
  },

  async addLead(lead: Lead): Promise<StoredLead> {
    const leads = await this.getLeads();
    const storedLead: StoredLead = { ...lead, id: createId() };
    leads.push(storedLead);
    await writeJsonFile(leadsFile, leads);
    return storedLead;
  },

  async updateLead(
    id: string,
    patch: Partial<Lead>,
  ): Promise<StoredLead | null> {
    const leads = await this.getLeads();
    const index = leads.findIndex((lead) => lead.id === id);
    if (index === -1) return null;
    leads[index] = { ...leads[index], ...patch, id };
    await writeJsonFile(leadsFile, leads);
    return leads[index];
  },

  async deleteLead(id: string): Promise<boolean> {
    const leads = await this.getLeads();
    const next = leads.filter((lead) => lead.id !== id);
    if (next.length === leads.length) return false;
    await writeJsonFile(leadsFile, next);
    return true;
  },
};
