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

export interface LeadRecord {
  id: string;
  name: string;
  phoneNumber: string;
  city: string;
  serviceType: ServiceType;
  description: string;
  createdAt: string;
}

export interface LeadAssignmentRecord {
  id: string;
  leadId: string;
  providerId: string;
  assignedAt: string;
}

export interface AllocationStateRecord {
  serviceType: ServiceType;
  currentIndex: number;
}

export interface WebhookEventRecord {
  eventId: string;
  processedAt: string;
}

export interface LeadCreateInput {
  name: string;
  phoneNumber: string;
  city: string;
  serviceType: ServiceType;
  description: string;
}

export interface ProviderDashboardItem {
  id: string;
  name: string;
  remainingQuota: number;
  usedQuota: number;
  assignedLeadsCount: number;
  active: boolean;
}

export interface AssignedLeadItem {
  leadId: string;
  leadName: string;
  phoneNumber: string;
  city: string;
  serviceType: ServiceType;
  description: string;
  assignedAt: string;
}

export interface ProviderDashboardResponse {
  provider: ProviderDashboardItem;
  assignedLeads: AssignedLeadItem[];
}

export const SERVICE_TYPES: ServiceType[] = [
  "Service 1",
  "Service 2",
  "Service 3",
];

export const SERVICE_SEED: ServiceRecord[] = SERVICE_TYPES.map(
  (name, index) => ({
    id: `service-${index + 1}`,
    name,
    createdAt: new Date(0).toISOString(),
  }),
);

export const PROVIDER_SEED: ProviderRecord[] = Array.from(
  { length: 8 },
  (_, index) => ({
    id: `provider-${index + 1}`,
    name: `Provider ${index + 1}`,
    monthlyQuota: 10,
    usedQuota: 0,
    active: true,
    createdAt: new Date(0).toISOString(),
  }),
);

export const MANDATORY_PROVIDER_IDS: Record<ServiceType, string[]> = {
  "Service 1": ["provider-1"],
  "Service 2": ["provider-5"],
  "Service 3": ["provider-1", "provider-4"],
};

export const FAIR_PROVIDER_IDS: Record<ServiceType, string[]> = {
  "Service 1": ["provider-2", "provider-3", "provider-4"],
  "Service 2": ["provider-6", "provider-7", "provider-8"],
  "Service 3": [
    "provider-2",
    "provider-3",
    "provider-5",
    "provider-6",
    "provider-7",
    "provider-8",
  ],
};
