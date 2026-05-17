import { Lead } from "../types";

export const exportToCSV = (leads: Lead[]) => {
  const headers = ["Name", "Email", "Status", "Source", "Created At"];
  const rows = leads.map((l) => [
    l.name,
    l.email,
    l.status,
    l.source,
    new Date(l.createdAt).toLocaleDateString(),
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

  const link = document.createElement("a");
  link.href = encodeURI(csvContent);
  link.download = "leads_export.csv";
  link.click();
};
