import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { TestCase } from "./store";

export function exportCSV(rows: TestCase[], filename = "test-cases.csv") {
  const header = ["Module", "Title", "Steps", "Expected", "Type", "Priority", "Status"];
  const csv = [
    header.join(","),
    ...rows.map((r) =>
      [r.module, r.title, r.steps.replace(/\n/g, " | "), r.expected, r.type, r.priority, r.status]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPDF(rows: TestCase[], title = "Speclane — Test Cases") {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.text(title, 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(new Date().toLocaleString(), 14, 22);
  autoTable(doc, {
    startY: 28,
    head: [["Module", "Title", "Steps", "Expected", "Type", "Priority", "Status"]],
    body: rows.map((r) => [r.module, r.title, r.steps, r.expected, r.type, r.priority, r.status]),
    styles: { fontSize: 8, cellPadding: 3, valign: "top" },
    headStyles: { fillColor: [88, 80, 236] },
    columnStyles: { 2: { cellWidth: 60 }, 3: { cellWidth: 50 } },
  });
  doc.save("speclane-report.pdf");
}
