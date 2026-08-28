import type { StoredApplication } from "@/types/domain";

export function buildPdfLines(application: StoredApplication, departmentName: string): string[] {
  return [
    "Nyaya-Setu — Prepared RTI Application",
    "Independent developer prototype — not filed with any government portal",
    "",
    `Tracking ID: ${application.tracking_id}`,
    `Prepared for: ${departmentName}`,
    `Prepared on: ${new Date(application.created_at).toLocaleDateString("en-IN")}`,
    "",
    application.compliant_request_text,
    "",
    "Requested records:",
    ...application.requested_records.map((record, index) => `${index + 1}. ${record}`),
    "",
    "This PDF is a citizen-controlled draft from an independent hackathon prototype. It is not proof of filing.",
  ];
}

export async function downloadApplicationPdf(application: StoredApplication, departmentName: string): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const document = new jsPDF({ unit: "mm", format: "a4" });
  const lines = buildPdfLines(application, departmentName);
  let y = 18;
  for (const line of lines) {
    const wrapped = document.splitTextToSize(line, 176) as string[];
    if (y + wrapped.length * 6 > 280) { document.addPage(); y = 18; }
    document.setFont("helvetica", y < 30 ? "bold" : "normal");
    document.setFontSize(y < 30 ? 14 : 10.5);
    document.text(wrapped, 17, y);
    y += Math.max(6, wrapped.length * 5.5);
  }
  document.save(`${application.tracking_id}.pdf`);
}
