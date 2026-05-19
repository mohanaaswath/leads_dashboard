export type LeadStatus = "New" | "Contacted" | "Qualified" | "Lost";
export type LeadSource = "Website" | "Instagram" | "Referral";
export type UserRole = "admin" | "sales";

export interface Lead {
  id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdAt: string;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FilterState {
  status: string;
  source: string;
  search: string;
  sort: "newest" | "oldest";
  page: number;
}

export type ServiceType = "Service 1" | "Service 2" | "Service 3";

export interface ServiceRecord {
  id: string;
  name: ServiceType;
  createdAt: string;
}

export interface ProviderRecord {
  id: string;
  name: string;
  monthlyQuota: number;
  usedQuota: number;
  active: boolean;
  createdAt: string;
}

export interface LeadAllocationResult {
  lead: {
    id: string;
    name: string;
    phoneNumber: string;
    city: string;
    serviceType: ServiceType;
    description: string;
    createdAt: string;
  };
  assignedProviders: ProviderRecord[];
}

export interface ProviderDashboardLead {
  leadId: string;
  leadName: string;
  phoneNumber: string;
  city: string;
  serviceType: ServiceType;
  description: string;
  assignedAt: string;
}

export interface ProviderDashboardData {
  provider: {
    id: string;
    name: string;
    remainingQuota: number;
    usedQuota: number;
    assignedLeadsCount: number;
    active: boolean;
  };
  assignedLeads: ProviderDashboardLead[];
}

export interface ServicesResponse {
  services: ServiceRecord[];
}

export interface ProvidersResponse {
  providers: ProviderRecord[];
}

export interface WebhookResponse {
  message: string;
  processed: boolean;
  duplicate: boolean;
}
