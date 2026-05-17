import { useState } from "react";
import { Lead, LeadSource, LeadStatus } from "../types";

type LeadFormData = Omit<Lead, "id" | "createdAt" | "userId">;

interface LeadFormProps {
  initial?: LeadFormData;
  onSubmit: (data: LeadFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const statuses: LeadStatus[] = ["New", "Contacted", "Qualified", "Lost"];
const sources: LeadSource[] = ["Website", "Instagram", "Referral"];

export const LeadForm = ({
  initial,
  onSubmit,
  onCancel,
  loading,
}: LeadFormProps) => {
  const [form, setForm] = useState<LeadFormData>(
    initial ?? { name: "", email: "", status: "New", source: "Website" },
  );
  const [errors, setErrors] = useState<Partial<LeadFormData>>({});

  const validate = (): boolean => {
    const errs: Partial<LeadFormData> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Invalid email";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit(form);
  };

  const field = (key: keyof LeadFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <h2 className="modal-title">
          {initial ? "Edit Lead" : "Add New Lead"}
        </h2>

        <div className="modal-grid">
          <div>
            <label className="field-label">Name</label>
            <input
              value={form.name}
              onChange={(e) => field("name", e.target.value)}
              className="field-control"
              placeholder="Full name"
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          <div>
            <label className="field-label">Email</label>
            <input
              value={form.email}
              onChange={(e) => field("email", e.target.value)}
              type="email"
              className="field-control"
              placeholder="email@example.com"
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div>
            <label className="field-label">Status</label>
            <select
              value={form.status}
              onChange={(e) => field("status", e.target.value)}
              className="field-control"
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Source</label>
            <select
              value={form.source}
              onChange={(e) => field("source", e.target.value)}
              className="field-control"
            >
              {sources.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button
            onClick={onCancel}
            className="button button-secondary button-full"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="button button-primary button-full"
          >
            {loading ? "Saving..." : initial ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};
