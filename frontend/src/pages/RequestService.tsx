import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import {
  LeadAllocationResult,
  ServiceRecord,
  ServicesResponse,
} from "../types";

const initialForm = {
  name: "",
  phoneNumber: "",
  city: "",
  serviceType: "Service 1" as const,
  description: "",
};

export const RequestService = () => {
  const [form, setForm] = useState(initialForm);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<LeadAllocationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    api.get<ServicesResponse>("/dashboard/services").then(({ data }) => {
      if (!active) return;
      setServices(data.services);
      setForm((prev) => ({
        ...prev,
        serviceType: (data.services[0]?.name ??
          "Service 1") as typeof prev.serviceType,
      }));
    });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess(null);

    if (!form.name || !form.phoneNumber || !form.city || !form.description) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post<LeadAllocationResult>("/leads", form);
      setSuccess(data);
      setForm((prev) => ({
        ...prev,
        name: "",
        phoneNumber: "",
        city: "",
        description: "",
      }));
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Unable to create lead",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="request-page">
      <section className="hero card">
        <div className="hero-copy">
          <p className="eyebrow">Public intake</p>
          <h1 className="page-title">
            Request a service and auto-assign three providers.
          </h1>
          <p className="page-subtitle">
            Duplicate phone plus service submissions fail immediately, and
            successful leads are allocated through the same production flow as
            the dashboard.
          </p>
        </div>
        <div className="hero-links">
          <Link className="button button-secondary" to="/login">
            Admin login
          </Link>
          <Link className="button button-secondary" to="/dashboard">
            Provider dashboard
          </Link>
        </div>
      </section>

      <section className="card form-card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <input
            className="field-control"
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <input
            className="field-control"
            placeholder="Phone Number"
            value={form.phoneNumber}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))
            }
          />
          <input
            className="field-control"
            placeholder="City"
            value={form.city}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, city: e.target.value }))
            }
          />
          <select
            className="field-control"
            value={form.serviceType}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                serviceType: e.target.value as typeof prev.serviceType,
              }))
            }
          >
            {services.map((service) => (
              <option key={service.id} value={service.name}>
                {service.name}
              </option>
            ))}
          </select>
          <textarea
            className="field-control"
            placeholder="Description"
            rows={5}
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
          />

          {error && <div className="auth-alert">{error}</div>}

          <button
            className="button button-primary"
            disabled={loading}
            type="submit"
          >
            {loading ? "Creating..." : "Submit request"}
          </button>
        </form>
      </section>

      {success && (
        <section className="card">
          <h2 className="section-title">Assigned providers</h2>
          <p className="helper-text">
            Lead {success.lead.id} was created successfully.
          </p>
          <div className="pill-row">
            {success.assignedProviders.map((provider) => (
              <span className="badge" key={provider.id}>
                {provider.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};
