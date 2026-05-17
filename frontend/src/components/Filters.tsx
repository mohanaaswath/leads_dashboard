import { FilterState, LeadSource, LeadStatus } from "../types";

interface FiltersProps {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
}

const statuses: LeadStatus[] = ["New", "Contacted", "Qualified", "Lost"];
const sources: LeadSource[] = ["Website", "Instagram", "Referral"];

export const Filters = ({ filters, onChange }: FiltersProps) => {
  return (
    <div className="filters">
      <input
        type="text"
        placeholder="Search name or email..."
        value={filters.search}
        onChange={(e) => onChange({ search: e.target.value, page: 1 })}
        className="search-input"
      />

      <select
        value={filters.status}
        onChange={(e) => onChange({ status: e.target.value, page: 1 })}
        className="select-input"
      >
        <option value="">All Statuses</option>
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={filters.source}
        onChange={(e) => onChange({ source: e.target.value, page: 1 })}
        className="select-input"
      >
        <option value="">All Sources</option>
        {sources.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={filters.sort}
        onChange={(e) =>
          onChange({ sort: e.target.value as "newest" | "oldest", page: 1 })
        }
        className="select-input"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
      </select>
    </div>
  );
};
