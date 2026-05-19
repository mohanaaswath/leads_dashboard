import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { LeadAllocationResult, WebhookResponse } from "../types";

type LogEntry = {
  title: string;
  body: string;
};

const makeEventId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const TestTools = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const pushLog = (title: string, body: unknown) => {
    setLogs((prev) => [
      {
        title,
        body: typeof body === "string" ? body : JSON.stringify(body, null, 2),
      },
      ...prev,
    ]);
  };

  const resetQuotas = async () => {
    const eventId = makeEventId();
    setLoading("reset");
    try {
      const { data } = await api.post<WebhookResponse>(
        "/webhooks/reset-quota",
        { eventId },
      );
      pushLog("Reset quotas", data);
    } finally {
      setLoading(null);
    }
  };

  const triggerWebhookMultipleTimes = async () => {
    const eventId = makeEventId();
    setLoading("webhook");
    try {
      const responses = [] as WebhookResponse[];
      for (let index = 0; index < 3; index += 1) {
        const { data } = await api.post<WebhookResponse>(
          "/webhooks/reset-quota",
          { eventId },
        );
        responses.push(data);
      }
      pushLog("Webhook idempotency check", responses);
    } finally {
      setLoading(null);
    }
  };

  const generateTenLeads = async () => {
    setLoading("leads");
    try {
      const leads = Array.from({ length: 10 }, (_, index) => ({
        name: `Test Lead ${index + 1}`,
        phoneNumber: `555000${String(index + 1).padStart(3, "0")}`,
        city: ["Bengaluru", "Hyderabad", "Pune"][index % 3],
        serviceType: ["Service 1", "Service 2", "Service 3"][
          index % 3
        ] as LeadAllocationResult["lead"]["serviceType"],
        description: `Batch lead ${index + 1}`,
      }));

      const results = await Promise.allSettled(
        leads.map((lead) => api.post<LeadAllocationResult>("/leads", lead)),
      );

      pushLog(
        "Concurrent lead generation",
        results.map((result, index) => ({
          lead: leads[index],
          status: result.status,
          message:
            result.status === "fulfilled"
              ? result.value.data.lead.id
              : "rejected",
        })),
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="test-tools-page">
      <section className="hero card">
        <div className="hero-copy">
          <p className="eyebrow">Test tools</p>
          <h1 className="page-title">Webhook and concurrency checks</h1>
          <p className="page-subtitle">
            Use these buttons to validate quota resets, webhook idempotency, and
            burst lead intake.
          </p>
        </div>
        <div className="hero-links">
          <Link className="button button-secondary" to="/request-service">
            Public form
          </Link>
          <Link className="button button-secondary" to="/dashboard">
            Provider dashboard
          </Link>
        </div>
      </section>

      <section className="tools-grid">
        <button
          className="button button-primary"
          disabled={loading === "reset"}
          onClick={resetQuotas}
        >
          Reset provider quotas
        </button>
        <button
          className="button button-primary"
          disabled={loading === "webhook"}
          onClick={triggerWebhookMultipleTimes}
        >
          Trigger webhook multiple times
        </button>
        <button
          className="button button-primary"
          disabled={loading === "leads"}
          onClick={generateTenLeads}
        >
          Generate 10 leads instantly
        </button>
      </section>

      <section className="card">
        <h2 className="section-title">Activity log</h2>
        <div className="log-list">
          {logs.map((entry, index) => (
            <article className="log-item" key={`${entry.title}-${index}`}>
              <strong>{entry.title}</strong>
              <pre>{entry.body}</pre>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};
