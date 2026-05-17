import { Lead } from "../types";
import { useAuth } from "../context/AuthContext";

interface LeadTableProps {
  leads: Lead[];
  loading: boolean;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

export const LeadTable = ({
  leads,
  loading,
  onEdit,
  onDelete,
}: LeadTableProps) => {
  const { isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-icon">📭</p>
        <p className="small">No leads found. Add your first lead!</p>
      </div>
    );
  }

  return (
    <div className="table-shell">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Source</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>{lead.name}</td>
              <td>{lead.email}</td>
              <td className="status-col">
                <span className="badge">{lead.status}</span>
              </td>
              <td>{lead.source}</td>
              <td className="created-col small">
                {new Date(lead.createdAt).toLocaleDateString()}
              </td>
              <td>
                <div className="inline-actions">
                  <button
                    onClick={() => onEdit(lead)}
                    className="button button-secondary small"
                  >
                    Edit
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => onDelete(lead.id)}
                      className="button button-secondary small"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
