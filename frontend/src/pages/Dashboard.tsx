import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { Lead, LeadsResponse, FilterState } from "../types";
import { Navbar } from "../components/Navbar";
import { Filters } from "../components/Filters";
import { LeadTable } from "../components/LeadTable";
import { LeadForm } from "../components/LeadForm";
import { Pagination } from "../components/Pagination";
import { exportToCSV } from "../utils/csvExport";
import { useDebounce } from "../hooks/useDebounce";

export const Dashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    status: "",
    source: "",
    search: "",
    sort: "newest",
    page: 1,
  });

  const debouncedSearch = useDebounce(filters.search, 400);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.source) params.set("source", filters.source);
      if (debouncedSearch) params.set("search", debouncedSearch);
      params.set("sort", filters.sort);
      params.set("page", String(filters.page));

      const { data } = await api.get<LeadsResponse>(`/leads?${params}`);
      setLeads(data.leads);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      console.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  }, [
    filters.status,
    filters.source,
    debouncedSearch,
    filters.sort,
    filters.page,
  ]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleCreate = async (
    data: Omit<Lead, "id" | "createdAt" | "userId">,
  ) => {
    setFormLoading(true);
    try {
      await api.post("/leads", data);
      setShowForm(false);
      fetchLeads();
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (
    data: Omit<Lead, "id" | "createdAt" | "userId">,
  ) => {
    if (!editingLead) return;
    setFormLoading(true);
    try {
      await api.put(`/leads/${editingLead.id}`, data);
      setEditingLead(null);
      fetchLeads();
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    await api.delete(`/leads/${id}`);
    fetchLeads();
  };

  const updateFilters = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  return (
    <div className="dashboard-page">
      <Navbar darkMode={darkMode} toggleDark={() => setDarkMode((d) => !d)} />

      <main className="page-main">
        <div className="page-header">
          <div className="page-heading">
            <h1 className="page-title">Leads Dashboard</h1>
            <p className="page-subtitle">
              {total} lead{total !== 1 ? "s" : ""} total
            </p>
          </div>
          <div className="page-actions inline-actions">
            <button
              onClick={() => exportToCSV(leads)}
              className="button button-secondary"
            >
              Export CSV
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="button button-primary"
            >
              + Add Lead
            </button>
          </div>
        </div>

        <section className="section card">
          <Filters filters={filters} onChange={updateFilters} />
        </section>

        <section className="table-shell">
          <LeadTable
            leads={leads}
            loading={loading}
            onEdit={(lead) => setEditingLead(lead)}
            onDelete={handleDelete}
          />
        </section>

        <section className="pagination">
          <Pagination
            page={filters.page}
            totalPages={totalPages}
            onChange={(p) => updateFilters({ page: p })}
          />
        </section>
      </main>

      {/* Modals */}
      {showForm && (
        <LeadForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          loading={formLoading}
        />
      )}
      {editingLead && (
        <LeadForm
          initial={{
            name: editingLead.name,
            email: editingLead.email,
            status: editingLead.status,
            source: editingLead.source,
          }}
          onSubmit={handleUpdate}
          onCancel={() => setEditingLead(null)}
          loading={formLoading}
        />
      )}
    </div>
  );
};
