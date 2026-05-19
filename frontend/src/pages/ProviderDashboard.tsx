import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import {
  ProviderDashboardData,
  ProviderRecord,
  ProvidersResponse,
} from "../types";
import { Link } from "react-router-dom";

export const ProviderDashboard = () => {
  const [providers, setProviders] = useState<ProviderRecord[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [dashboard, setDashboard] = useState<ProviderDashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const selectedProvider = useMemo(
    () =>
      providers.find((provider) => provider.id === selectedProviderId) ?? null,
    [providers, selectedProviderId],
  );

  useEffect(() => {
    let active = true;

    const loadProviders = async () => {
      const { data } = await api.get<ProvidersResponse>("/dashboard/providers");
      if (!active) return;
      setProviders(data.providers);
      setSelectedProviderId(
        (current) => current || data.providers[0]?.id || "",
      );
    };

    void loadProviders();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedProviderId) return;

    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<ProviderDashboardData>(
          `/dashboard/providers/${selectedProviderId}`,
        );
        if (active) {
          setDashboard(data);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();
    const timer = window.setInterval(() => {
      void loadDashboard();
    }, 5000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [selectedProviderId]);

  return (
    <main className="dashboard-shell">
      <section className="hero card">
        <div className="hero-copy">
          <p className="eyebrow">Provider dashboard</p>
          <h1 className="page-title">Live quota and assignment view</h1>
          <p className="page-subtitle">
            Polling keeps this dashboard fresh without a manual refresh.
            Allocation state remains persistent across restarts.
          </p>
        </div>
        <div className="hero-links">
          <Link className="button button-secondary" to="/request-service">
            Public form
          </Link>
          <Link className="button button-secondary" to="/test-tools">
            Test tools
          </Link>
        </div>
      </section>

      <section className="card split-row">
        <div className="field">
          <label className="field-label" htmlFor="provider-select">
            Select provider
          </label>
          <select
            id="provider-select"
            className="field-control"
            value={selectedProviderId}
            onChange={(e) => setSelectedProviderId(e.target.value)}
          >
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        {selectedProvider && (
          <div className="summary-grid">
            <div className="summary-card">
              <span className="small">Remaining quota</span>
              <strong>
                {dashboard?.provider.remainingQuota ??
                  selectedProvider.monthlyQuota - selectedProvider.usedQuota}
              </strong>
            </div>
            <div className="summary-card">
              <span className="small">Used quota</span>
              <strong>
                {dashboard?.provider.usedQuota ?? selectedProvider.usedQuota}
              </strong>
            </div>
            <div className="summary-card">
              <span className="small">Assigned leads</span>
              <strong>{dashboard?.provider.assignedLeadsCount ?? 0}</strong>
            </div>
          </div>
        )}
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <h2 className="section-title">
              {dashboard?.provider.name ?? selectedProvider?.name ?? "Provider"}
            </h2>
            <p className="helper-text">
              {dashboard?.provider.active ? "Active" : "Inactive"}
              {loading ? " • Refreshing" : ""}
            </p>
          </div>
        </div>

        <div className="table-shell">
          <table className="table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Phone</th>
                <th>City</th>
                <th>Service</th>
                <th>Assigned at</th>
              </tr>
            </thead>
            <tbody>
              {(dashboard?.assignedLeads ?? []).map((lead) => (
                <tr key={lead.leadId + lead.assignedAt}>
                  <td>{lead.leadName}</td>
                  <td>{lead.phoneNumber}</td>
                  <td>{lead.city}</td>
                  <td>
                    <span className="badge">{lead.serviceType}</span>
                  </td>
                  <td>{new Date(lead.assignedAt).toLocaleString()}</td>
                </tr>
              ))}
              {!loading && (dashboard?.assignedLeads.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={5} className="empty-table-cell">
                    No assigned leads yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};
