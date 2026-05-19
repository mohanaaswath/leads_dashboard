import {
  AssignedLeadItem,
  AllocationStateRecord,
  FAIR_PROVIDER_IDS,
  LeadAssignmentRecord,
  LeadCreateInput,
  LeadRecord,
  MANDATORY_PROVIDER_IDS,
  PROVIDER_SEED,
  ProviderDashboardResponse,
  ProviderRecord,
  SERVICE_SEED,
  SERVICE_TYPES,
  ServiceRecord,
  ServiceType,
} from "../models/domain";
import { runtimeStore, RuntimeTransaction } from "./runtimeStore";

const collections = {
  leads: "leads",
  providers: "providers",
  assignments: "leadAssignments",
  allocationState: "allocationState",
  services: "services",
} as const;

const normalizePhoneNumber = (phoneNumber: string) =>
  phoneNumber.replace(/\D/g, "");

const makeLeadId = (phoneNumber: string, serviceType: ServiceType) => {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  return `lead-${serviceType.toLowerCase().replace(/\s+/g, "-")}-${normalizedPhone}`;
};

const isServiceType = (value: string): value is ServiceType =>
  (SERVICE_TYPES as string[]).includes(value);

const selectRoundRobinProviders = ({
  pool,
  currentIndex,
  requiredCount,
  providers,
  excluded,
}: {
  pool: string[];
  currentIndex: number;
  requiredCount: number;
  providers: Map<string, ProviderRecord>;
  excluded: Set<string>;
}) => {
  const chosen: string[] = [];
  let cursor = pool.length === 0 ? 0 : currentIndex % pool.length;
  let inspected = 0;

  while (chosen.length < requiredCount && inspected < pool.length) {
    const providerId = pool[cursor];
    const provider = providers.get(providerId);

    if (
      provider &&
      provider.active &&
      provider.usedQuota < provider.monthlyQuota &&
      !excluded.has(providerId)
    ) {
      chosen.push(providerId);
      excluded.add(providerId);
    }

    cursor = (cursor + 1) % pool.length;
    inspected += 1;
  }

  return {
    providerIds: chosen,
    nextIndex: pool.length === 0 ? 0 : cursor,
  };
};

export const seedInitialData = async () => {
  const seedTimestamp = new Date(0).toISOString();

  await Promise.all(
    SERVICE_SEED.map(async (service) => {
      const existing = await runtimeStore.getDoc<ServiceRecord>(
        collections.services,
        service.id,
      );
      if (!existing.exists) {
        await runtimeStore.setDoc(collections.services, service.id, service);
      }

      const allocationSnapshot =
        await runtimeStore.getDoc<AllocationStateRecord>(
          collections.allocationState,
          service.name,
        );
      if (!allocationSnapshot.exists) {
        await runtimeStore.setDoc(collections.allocationState, service.name, {
          serviceType: service.name,
          currentIndex: 0,
        } satisfies AllocationStateRecord);
      }
    }),
  );

  await Promise.all(
    PROVIDER_SEED.map(async (provider) => {
      const existing = await runtimeStore.getDoc<ProviderRecord>(
        collections.providers,
        provider.id,
      );
      if (!existing.exists) {
        await runtimeStore.setDoc(collections.providers, provider.id, {
          ...provider,
          createdAt: seedTimestamp,
        });
      }
    }),
  );
};

export const listServices = async (): Promise<ServiceRecord[]> => {
  const snapshot = await runtimeStore.listDocs<ServiceRecord>(
    collections.services,
  );
  return snapshot
    .map((doc) => doc.data)
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const listProviders = async (): Promise<ProviderRecord[]> => {
  const snapshot = await runtimeStore.listDocs<ProviderRecord>(
    collections.providers,
  );
  return snapshot
    .map((doc) => doc.data)
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const getProviderDashboard = async (
  providerId: string,
): Promise<ProviderDashboardResponse | null> => {
  const providerSnapshot = await runtimeStore.getDoc<ProviderRecord>(
    collections.providers,
    providerId,
  );
  if (!providerSnapshot.exists) return null;

  const provider = providerSnapshot.data();
  const assignmentSnapshot = await runtimeStore.queryDocs<LeadAssignmentRecord>(
    collections.assignments,
    "providerId",
    providerId,
  );

  const assignments = assignmentSnapshot
    .map((doc) => doc.data)
    .sort((a, b) => b.assignedAt.localeCompare(a.assignedAt));

  const leadSnapshots = await Promise.all(
    assignments.map((assignment) =>
      runtimeStore.getDoc<LeadRecord>(collections.leads, assignment.leadId),
    ),
  );

  const assignedLeads: AssignedLeadItem[] = leadSnapshots
    .map((snapshot, index) => {
      if (!snapshot.exists) return null;

      const lead = snapshot.data();
      return {
        leadId: lead.id,
        leadName: lead.name,
        phoneNumber: lead.phoneNumber,
        city: lead.city,
        serviceType: lead.serviceType,
        description: lead.description,
        assignedAt: assignments[index].assignedAt,
      } satisfies AssignedLeadItem;
    })
    .filter((value): value is AssignedLeadItem => Boolean(value));

  return {
    provider: {
      id: provider.id,
      name: provider.name,
      remainingQuota: Math.max(provider.monthlyQuota - provider.usedQuota, 0),
      usedQuota: provider.usedQuota,
      assignedLeadsCount: assignedLeads.length,
      active: provider.active,
    },
    assignedLeads,
  };
};

export class DuplicateLeadError extends Error {
  constructor() {
    super("Duplicate lead for the same phone number and service type");
    this.name = "DuplicateLeadError";
  }
}

export class AllocationCapacityError extends Error {
  constructor(message = "No eligible providers available for this service") {
    super(message);
    this.name = "AllocationCapacityError";
  }
}

export const createLeadWithAssignments = async (input: LeadCreateInput) => {
  if (!isServiceType(input.serviceType)) {
    throw new AllocationCapacityError("Unsupported service type");
  }

  const leadId = makeLeadId(input.phoneNumber, input.serviceType);
  const mandatoryIds = MANDATORY_PROVIDER_IDS[input.serviceType];
  const fairPool = FAIR_PROVIDER_IDS[input.serviceType];
  const assignedAt = new Date().toISOString();

  return runtimeStore.runTransaction(
    async (transaction: RuntimeTransaction) => {
      const existingLead = await transaction.getDoc<LeadRecord>(
        collections.leads,
        leadId,
      );
      if (existingLead.exists) {
        throw new DuplicateLeadError();
      }

      const providerIds = Array.from(new Set([...mandatoryIds, ...fairPool]));
      const providerRefs = providerIds.map((providerId) => providerId);
      const providerSnapshots = await Promise.all(
        providerRefs.map((providerId) =>
          transaction.getDoc<ProviderRecord>(collections.providers, providerId),
        ),
      );

      const providers = new Map<string, ProviderRecord>();
      providerSnapshots.forEach((snapshot) => {
        if (snapshot.exists) {
          providers.set(snapshot.id, snapshot.data());
        }
      });

      const chosenProviderIds = [...mandatoryIds];
      const excluded = new Set(chosenProviderIds);

      for (const providerId of mandatoryIds) {
        const provider = providers.get(providerId);
        if (
          !provider ||
          !provider.active ||
          provider.usedQuota >= provider.monthlyQuota
        ) {
          throw new AllocationCapacityError(
            `Mandatory provider ${providerId} is unavailable`,
          );
        }
      }

      const allocationSnapshot =
        await transaction.getDoc<AllocationStateRecord>(
          collections.allocationState,
          input.serviceType,
        );
      const currentIndex = allocationSnapshot.exists
        ? allocationSnapshot.data().currentIndex
        : 0;

      const fairSelection = selectRoundRobinProviders({
        pool: fairPool,
        currentIndex,
        requiredCount: 3 - mandatoryIds.length,
        providers,
        excluded,
      });

      if (fairSelection.providerIds.length !== 3 - mandatoryIds.length) {
        throw new AllocationCapacityError(
          `Not enough eligible providers in the ${input.serviceType} pool`,
        );
      }

      chosenProviderIds.push(...fairSelection.providerIds);

      const leadRecord: LeadRecord = {
        id: leadId,
        name: input.name.trim(),
        phoneNumber: normalizePhoneNumber(input.phoneNumber),
        city: input.city.trim(),
        serviceType: input.serviceType,
        description: input.description.trim(),
        createdAt: assignedAt,
      };

      transaction.setDoc(collections.leads, leadId, leadRecord);

      for (const providerId of chosenProviderIds) {
        const assignmentId = `${leadId}_${providerId}`;

        transaction.setDoc(collections.assignments, assignmentId, {
          id: assignmentId,
          leadId,
          providerId,
          assignedAt,
        } satisfies LeadAssignmentRecord);

        const provider = providers.get(providerId);
        if (!provider) {
          throw new AllocationCapacityError(`Provider ${providerId} not found`);
        }

        transaction.updateDoc<ProviderRecord>(
          collections.providers,
          providerId,
          {
            usedQuota: provider.usedQuota + 1,
          },
        );
      }

      transaction.setDoc(
        collections.allocationState,
        input.serviceType,
        {
          serviceType: input.serviceType,
          currentIndex: fairSelection.nextIndex,
        } satisfies AllocationStateRecord,
        true,
      );

      const providerRecords = chosenProviderIds.map((providerId) => {
        const provider = providers.get(providerId);
        if (!provider) {
          throw new AllocationCapacityError(`Provider ${providerId} not found`);
        }

        return {
          id: provider.id,
          name: provider.name,
          monthlyQuota: provider.monthlyQuota,
          usedQuota: provider.usedQuota + 1,
          active: provider.active,
          createdAt: provider.createdAt,
        } satisfies ProviderRecord;
      });

      return {
        lead: leadRecord,
        assignedProviders: providerRecords,
      };
    },
  );
};
