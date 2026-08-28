import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = (invoice) => {
  const doc = new jsPDF();
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Colors
  const primaryColor = [41, 128, 185]; // Blue
  const secondaryColor = [52, 73, 94]; // Dark gray
  const lightGray = [236, 240, 241];
  const successColor = [39, 174, 96];
  const warningColor = [243, 156, 18];
  const dangerColor = [231, 76, 60];

  // Helper function to format currency
  const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount || 0);
    // Format with proper number formatting to avoid spacing issues
    return numericAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Helper function to format date
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==================== HEADER ====================
  // Company Logo/Name (Top Left)
  doc.setFillColor(...primaryColor);
  doc.rect(margin, margin, 60, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setCharSpace(0); // Ensure no character spacing
  doc.text("SquadCart", margin + 5, margin + 8);

  // Invoice Title (Top Right)
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setCharSpace(0); // Ensure no character spacing
  doc.text("INVOICE", pageWidth - margin, margin + 10, { align: "right" });

  // ==================== INVOICE INFO BOX ====================
  const invoiceInfoY = margin + 18;
  doc.setFillColor(...lightGray);
  doc.rect(pageWidth - 80, invoiceInfoY, 60, 36, "F");
  
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);
  doc.setFont("helvetica", "bold");
  doc.setCharSpace(0); // Ensure no character spacing
  doc.text("Invoice Number:", pageWidth - 75, invoiceInfoY + 6);
  doc.setFont("helvetica", "normal");
  doc.setCharSpace(0);
  doc.text(invoice.invoiceNumber || "-", pageWidth - 75, invoiceInfoY + 11);
  
  doc.setFont("helvetica", "bold");
  doc.setCharSpace(0);
  doc.text("Transaction ID:", pageWidth - 75, invoiceInfoY + 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setCharSpace(0);
  doc.text(invoice.transactionId || "-", pageWidth - 75, invoiceInfoY + 23);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setCharSpace(0);
  doc.text("Date:", pageWidth - 75, invoiceInfoY + 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setCharSpace(0);
  doc.text(formatDate(invoice.createdAt), pageWidth - 75, invoiceInfoY + 32);

  // ==================== CUSTOMER INFORMATION ====================
  const customerY = invoiceInfoY;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.setCharSpace(0); // Ensure no character spacing
  doc.text("Bill To:", margin, customerY + 6);

  doc.setFontSize(11);
  doc.setTextColor(...secondaryColor);
  doc.setFont("helvetica", "bold");
  doc.setCharSpace(0);
  doc.text(invoice.customer?.name || "-", margin, customerY + 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setCharSpace(0);
  doc.text(invoice.customer?.companyName || "-", margin, customerY + 20);
  doc.text(invoice.customer?.email || "-", margin, customerY + 25);
  doc.text(invoice.customer?.phone || "-", margin, customerY + 30);
  doc.text(invoice.customer?.branchLocation || "-", margin, customerY + 35);

  // ==================== STATUS BADGE ====================
  const statusY = customerY + 42;
  let statusColor = warningColor;
  let statusText = invoice.status?.toUpperCase() || "PENDING";
  
  if (invoice.status === "paid") statusColor = successColor;
  else if (invoice.status === "cancelled") statusColor = dangerColor;
  
  doc.setFillColor(...statusColor);
  doc.roundedRect(margin, statusY, 35, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setCharSpace(0); // Ensure no character spacing
  doc.text(statusText, margin + 17.5, statusY + 5.5, { align: "center" });

  // ==================== LINE ITEMS TABLE ====================
  const tableStartY = statusY + 15;

  // Amount breakdown data
  const tableData = [
    ["Description", "Amount Type", "Amount"],
    [
      invoice.customer?.paymentInfo?.packagename || "Service",
      invoice.amountType?.toUpperCase() || "PACKAGE",
      formatCurrency(invoice.totalAmount)
    ],
  ];

  // Reset character spacing before table rendering
  doc.setCharSpace(0);
  
  autoTable(doc, {
    startY: tableStartY,
    head: [tableData[0]],
    body: [tableData[1]],
    theme: "grid",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold",
      halign: "left",
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: secondaryColor,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 50, halign: "center" },
      2: { cellWidth: 40, halign: "right", fontStyle: "bold" },
    },
    margin: { left: margin, right: margin },
    willDrawCell: function(data) {
      // Reset character spacing before drawing each cell
      doc.setCharSpace(0);
    },
    didDrawCell: function(data) {
      // Reset character spacing after drawing each cell
      doc.setCharSpace(0);
    },
  });

  // ==================== PAYMENT SUMMARY ====================
  const summaryStartY = (doc.lastAutoTable?.finalY || tableStartY + 30) + 10;
  const summaryX = pageWidth - 70;

  // Summary box
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.5);
  doc.line(summaryX - 5, summaryStartY, pageWidth - margin, summaryStartY);

  const summaryLines = [
    { label: "Subtotal:", value: formatCurrency(invoice.totalAmount), bold: false },
    { label: "Paid Amount:", value: formatCurrency(invoice.paidAmount), bold: false, color: successColor },
    { label: "Due Amount:", value: formatCurrency(invoice.dueAmount), bold: true, color: dangerColor },
  ];

  let currentY = summaryStartY + 8;
  summaryLines.forEach((line) => {
    // Reset character spacing before rendering
    doc.setCharSpace(0);
    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
    doc.setFont("helvetica", line.bold ? "bold" : "normal");
    doc.text(line.label, summaryX, currentY);
    
    // Reset character spacing before rendering amount
    doc.setCharSpace(0);
    if (line.color) doc.setTextColor(...line.color);
    else doc.setTextColor(...secondaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(line.value, pageWidth - margin, currentY, { align: "right" });
    currentY += 6;
  });

  // Total box
  doc.setFillColor(...primaryColor);
  doc.rect(summaryX - 5, currentY + 2, pageWidth - summaryX + 5 - margin, 10, "F");
  
  // Reset character spacing and render label
  doc.setCharSpace(0);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", summaryX, currentY + 9);
  
  // Reset character spacing again before rendering amount
  doc.setCharSpace(0);
  doc.text(formatCurrency(invoice.totalAmount), pageWidth - margin - 5, currentY + 9, { align: "right" });

  // ==================== PAYMENT DETAILS ====================
  let paymentDetailsY = currentY + 20;

  if (invoice.bankPayment) {
    // Highlighted box for bank payment
    doc.setFillColor(255, 248, 220); // Light yellow background for highlight
    doc.rect(margin - 2, paymentDetailsY - 3, pageWidth - 2 * margin + 4, 35, "F");
    
    // Border for emphasis
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.8);
    doc.rect(margin - 2, paymentDetailsY - 3, pageWidth - 2 * margin + 4, 35);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.setCharSpace(0);
    doc.text("Bank Payment Details:", margin + 3, paymentDetailsY + 3);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    // Bank Name
    doc.setCharSpace(0);
    doc.setTextColor(...secondaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("Bank Name:", margin + 5, paymentDetailsY + 11);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.bankPayment.bankName || "-", margin + 35, paymentDetailsY + 11);
    
    // Amount (highlighted)
    doc.setFont("helvetica", "bold");
    doc.text("Amount:", margin + 5, paymentDetailsY + 18);
    doc.setTextColor(...successColor);
    doc.setFont("helvetica", "bold");
    doc.setCharSpace(0);
    doc.text(formatCurrency(invoice.bankPayment.amount), margin + 35, paymentDetailsY + 18);
    
    // Account Last Digits
    doc.setTextColor(...secondaryColor);
    doc.setFont("helvetica", "bold");
    doc.setCharSpace(0);
    doc.text("Account Last Digits:", margin + 5, paymentDetailsY + 25);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.bankPayment.accLastDigit || "-", margin + 50, paymentDetailsY + 25);
    
    // Status (with color coding)
    doc.setFont("helvetica", "bold");
    doc.setCharSpace(0);
    doc.text("Status:", margin + 100, paymentDetailsY + 25);
    
    const status = invoice.bankPayment.status?.toUpperCase() || "PENDING";
    let statusBgColor = warningColor;
    if (status === "VERIFIED") statusBgColor = successColor;
    else if (status === "REJECTED") statusBgColor = dangerColor;
    
    doc.setFillColor(...statusBgColor);
    doc.roundedRect(margin + 118, paymentDetailsY + 21, 30, 6, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setCharSpace(0);
    doc.text(status, margin + 133, paymentDetailsY + 25.5, { align: "center" });

    paymentDetailsY += 37;
  }

  if (invoice.bkashPaymentID || invoice.bkashTrxID) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.setCharSpace(0); // Ensure no character spacing
    doc.text("Bkash Payment Details:", margin, paymentDetailsY);

    doc.setFillColor(...lightGray);
    doc.rect(margin, paymentDetailsY + 3, pageWidth - 2 * margin, 15, "F");

    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
    doc.setFont("helvetica", "normal");
    
    let bkashY = paymentDetailsY + 10;
    if (invoice.bkashPaymentID) {
      doc.setCharSpace(0); // Reset character spacing before rendering
      doc.text(`Payment ID: ${invoice.bkashPaymentID}`, margin + 5, bkashY);
      bkashY += 6;
    }
    if (invoice.bkashTrxID) {
      doc.setCharSpace(0); // Reset character spacing before rendering
      doc.text(`Transaction ID: ${invoice.bkashTrxID}`, margin + 5, bkashY);
    }

    paymentDetailsY += 20;
  }

  // ==================== FOOTER ====================
  const footerY = pageHeight - 25;
  
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.setFont("helvetica", "italic");
  doc.setCharSpace(0); // Ensure no character spacing
  doc.text("Thank you for your business!", pageWidth / 2, footerY + 6, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setCharSpace(0);
  doc.text(
    "This is a computer-generated invoice. For any queries, please contact support.",
    pageWidth / 2,
    footerY + 11,
    { align: "center" }
  );

  // Page number
  doc.setFontSize(8);
  doc.setCharSpace(0);
  doc.text(`Page 1 of 1`, pageWidth - margin, footerY + 16, { align: "right" });
  doc.setCharSpace(0);
  doc.text(`Generated: ${formatDate(new Date())}`, margin, footerY + 16);

  // ==================== SAVE PDF ====================
  const filename = `Invoice_${invoice.invoiceNumber}_${invoice.customer?.name?.replace(/\s+/g, "_")}.pdf`;
  doc.save(filename);
};
