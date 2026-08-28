import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Hook to export credit notes to PDF (current page or all).
 * Target ~150 lines per module.
 */
export function useCreditNotesPdfExport({
  filteredNotes,
  paginatedNotes,
  currentPage,
  totalPages,
  searchTerm,
  selectedStatus,
  dateRange,
  cancelledOrdersCount,
  pendingRefundCount,
  refundedCount,
  totalRefundAmount,
}) {
  const { t } = useTranslation();

  const exportToPDF = useCallback(
    (exportAll = false) => {
      try {
        const dataToExport = exportAll ? filteredNotes : paginatedNotes;

        if (!dataToExport || dataToExport.length === 0) {
          toast.error(t("creditNotes.noDataToExport"));
          return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        let yPos = margin;

        doc.setFillColor(151, 109, 247);
        doc.rect(0, 0, pageWidth, 40, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text(t("creditNotes.title"), margin, 25);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Generated on ${format(new Date(), "dd MMM yyyy, hh:mm a")}`,
          margin,
          32
        );
        doc.setTextColor(0, 0, 0);
        yPos = 50;

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Summary Statistics", margin, yPos);
        yPos += 8;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const summaryData = [
          [t("creditNotes.allCancelledOrders"), cancelledOrdersCount],
          [t("creditNotes.pendingRefund"), pendingRefundCount],
          [t("creditNotes.successfullyRefunded"), refundedCount],
          [t("creditNotes.totalRefundAmount"), `$${Number(totalRefundAmount || 0).toLocaleString()}`],
        ];
        const tableContentWidth = pageWidth - margin * 2;
        const summaryCol0 = tableContentWidth * 0.65;
        const summaryCol1 = tableContentWidth * 0.35;
        autoTable(doc, {
          startY: yPos,
          head: [["Metric", "Value"]],
          body: summaryData,
          theme: "striped",
          tableWidth: tableContentWidth,
          columnStyles: {
            0: { cellWidth: summaryCol0, halign: "left" },
            1: { cellWidth: summaryCol1, halign: "right" },
          },
          headStyles: {
            fillColor: [151, 109, 247],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          bodyStyles: { fontSize: 10 },
          styles: { fontSize: 10, cellPadding: 6 },
          margin: { left: margin, right: margin },
          tableLineWidth: 0.2,
          tableLineColor: [200, 200, 200],
        });
        yPos = doc.lastAutoTable.finalY + 15;

        if (searchTerm || selectedStatus !== "all" || dateRange?.start || dateRange?.end) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(100, 100, 100);
          const filters = [];
          if (searchTerm) filters.push(`Search: "${searchTerm}"`);
          if (selectedStatus !== "all") filters.push(`Status: ${selectedStatus}`);
          if (dateRange?.start || dateRange?.end) {
            const start = dateRange.start ? format(new Date(dateRange.start), "dd MMM yyyy") : "Start";
            const end = dateRange.end ? format(new Date(dateRange.end), "dd MMM yyyy") : "End";
            filters.push(`Date: ${start} - ${end}`);
          }
          doc.text("Filters Applied: " + filters.join(", "), margin, yPos);
          yPos += 8;
        }
        doc.setTextColor(0, 0, 0);

        const tableData = dataToExport.map((note) => {
          const email = note.customer?.email || note.customerEmail || "No email";
          const shortEmail = email.length > 28 ? email.slice(0, 25) + "…" : email;
          return [
            note.displayId || `Order #${note.id}`,
            note.customer?.name || note.customerName || "N/A",
            shortEmail,
            `$${Number(note.amount || 0).toLocaleString()}`,
            format(new Date(note.date || note.createdAt), "dd MMM yyyy"),
            note.status || "N/A",
          ];
        });
        const colWidths = [
          (tableContentWidth * 0.16) | 0,
          (tableContentWidth * 0.20) | 0,
          (tableContentWidth * 0.24) | 0,
          (tableContentWidth * 0.14) | 0,
          (tableContentWidth * 0.13) | 0,
          (tableContentWidth * 0.13) | 0,
        ];
        autoTable(doc, {
          startY: yPos,
          head: [["Order ID", "Customer Name", "Email", "Amount", "Date", "Status"]],
          body: tableData,
          theme: "striped",
          tableWidth: tableContentWidth,
          headStyles: {
            fillColor: [151, 109, 247],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 9,
          },
          bodyStyles: { fontSize: 9, textColor: [0, 0, 0] },
          alternateRowStyles: { fillColor: [248, 248, 248] },
          styles: { cellPadding: 5, overflow: "linebreak" },
          columnStyles: {
            0: { cellWidth: colWidths[0], fontStyle: "bold", halign: "left" },
            1: { cellWidth: colWidths[1], halign: "left" },
            2: { cellWidth: colWidths[2], halign: "left" },
            3: { cellWidth: colWidths[3], halign: "right" },
            4: { cellWidth: colWidths[4], halign: "center" },
            5: { cellWidth: colWidths[5], halign: "center" },
          },
          margin: { left: margin, right: margin },
          tableLineWidth: 0.2,
          tableLineColor: [200, 200, 200],
          didDrawPage: (data) => {
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${data.pageNumber} of ${data.pageCount}`, pageWidth - margin, pageHeight - 10, { align: "right" });
            doc.text(exportAll ? "All Records" : `Page ${currentPage} of ${totalPages}`, margin, pageHeight - 10);
          },
        });
        const finalY = doc.lastAutoTable.finalY + 10;
        if (finalY < pageHeight - 20) {
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(
            `Total Records: ${dataToExport.length} | ${exportAll ? "All Records" : `Showing page ${currentPage} of ${totalPages}`}`,
            margin,
            finalY
          );
        }
        const filename = `credit-notes-${format(new Date(), "yyyy-MM-dd")}${exportAll ? "-all" : `-page-${currentPage}`}.pdf`;
        doc.save(filename);
        toast.success(`${t("creditNotes.pdfExportedSuccess")}: ${filename}`);
      } catch (error) {
        console.error("PDF export error:", error);
        toast.error(t("creditNotes.pdfExportFailed"));
      }
    },
    [
      t,
      filteredNotes,
      paginatedNotes,
      currentPage,
      totalPages,
      searchTerm,
      selectedStatus,
      dateRange,
      cancelledOrdersCount,
      pendingRefundCount,
      refundedCount,
      totalRefundAmount,
    ]
  );

  return { exportToPDF };
}
