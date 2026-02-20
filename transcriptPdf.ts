import jsPDF from "jspdf";
import type { TranscriptionItem } from "./types";

export function downloadTranscriptPdf(items: TranscriptionItem[]) {
  if (!items || items.length === 0) return;

  const doc = new jsPDF({
    unit: "pt",
    format: "letter",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 50;
  const lineHeight = 14;
  let y = margin;

  // ===== TITLE =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(
    "ASM Educational Center Mock Interview Chat Summary",
    margin,
    y
  );

  y += 24;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, y);

  y += 20;

  doc.setDrawColor(180);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  doc.setFontSize(11);

  const maxWidth = pageWidth - margin * 2;

  items.forEach((item) => {
    const speaker = item.role === "user" ? "You" : "Coach";

    // New page if needed
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    // Speaker label
    doc.setFont("helvetica", "bold");
    doc.text(`${speaker}:`, margin, y);
    y += lineHeight;

    // Message body
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(item.text, maxWidth);

    lines.forEach((line: string) => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });

    y += 12;
  });

  doc.save(
    `ASM_Mock_Interview_${new Date().toISOString().slice(0, 10)}.pdf`
  );
}
