import { runtimeStore, RuntimeTransaction } from "./runtimeStore";
import { ProviderRecord, WebhookEventRecord } from "../models/domain";

export const resetProviderQuotas = async (eventId: string) => {
  if (!eventId.trim()) {
    throw new Error("eventId is required");
  }

  return runtimeStore.runTransaction(
    async (transaction: RuntimeTransaction) => {
      const eventSnapshot = await transaction.getDoc<WebhookEventRecord>(
        "webhookEvents",
        eventId,
      );
      if (eventSnapshot.exists) {
        return { processed: false, duplicate: true };
      }

      const providerSnapshot =
        await transaction.listDocs<ProviderRecord>("providers");
      providerSnapshot.forEach((doc) => {
        transaction.updateDoc<ProviderRecord>("providers", doc.id, {
          usedQuota: 0,
        });
      });

      transaction.setDoc("webhookEvents", eventId, {
        eventId,
        processedAt: new Date().toISOString(),
      } satisfies WebhookEventRecord);

      return { processed: true, duplicate: false };
    },
  );
};
