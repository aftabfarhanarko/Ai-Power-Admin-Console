import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Simple number to words (supports up to millions)
 * Uses integer math to avoid float precision issues
 */
const numberToWords = (num) => {
  const val = Number(num) || 0;
  const intPart = Math.floor(val);
  const decPart = Math.round((val - intPart) * 100);
  if (intPart === 0 && decPart === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const toWords = (x) => {
    const n = Math.floor(x);
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + toWords(n % 100) : "");
    if (n < 1000000) return toWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + toWords(n % 1000) : "");
    return toWords(Math.floor(n / 1000000)) + " Million" + (n % 1000000 ? " " + toWords(n % 1000000) : "");
  };
  let s = intPart > 0 ? toWords(intPart) : "Zero";
  if (decPart > 0) s += ` and ${decPart}/100`;
  return s;
};

/**
 * Generate sale invoice PDF matching the details page layout
 * @param {Object} invoice - Sale invoice with customer, items, bankDetails, termsAndConditions, notes, signatureName, signatureImage
 * @param {Object} companyInfo - { companyName, branchLocation, phone?, email? }
 * @returns {string} Base64 PDF
 */
export const generateSaleInvoicePDF = (invoice, companyInfo = {}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = 15;

  const formatCurrency = (amount, curr = "BDT") => {
    const num = parseFloat(amount || 0);
    const formatted = num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (curr === "USD") return `$${formatted}`;
    if (curr === "BDT") return `৳${formatted}`;
    return `${formatted} ${curr}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const companyName = companyInfo.companyName || "SquadCart";
  const branchLocation = companyInfo.branchLocation || "";
  const companyPhone = companyInfo.phone || "";
  const companyEmail = companyInfo.email || "";
  const currency = invoice.currency || "BDT";

  // === TOP BANNER ===
  doc.setFillColor(249, 250, 251);
  doc.rect(0, 0, pageWidth, 50, "F");
  doc.setDrawColor(229, 231, 235);
  doc.line(0, 50, pageWidth, 50);
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", margin, 18);
  doc.setFontSize(11);
  doc.text(companyName, margin, 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  if (branchLocation) doc.text(branchLocation, margin, 34);
  doc.setTextColor(31, 41, 55);

  // Right side: NOT PAID stamp (if unpaid) or company name
  const headerRightX = pageWidth - margin;
  if (invoice.status?.toLowerCase() !== "paid") {
    const stampW = 40;
    const stampH = 14;
    doc.setFillColor(239, 68, 68);
    doc.rect(headerRightX - stampW, 10, stampW, stampH, "FD");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("NOT PAID", headerRightX - stampW / 2, 19, { align: "center" });
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(companyName, headerRightX - stampW - 5, 19, { align: "right" });
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(companyName, headerRightX, 22, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    if (branchLocation) doc.text(branchLocation, headerRightX, 28, { align: "right" });
  }
  y = 60;

  // === INFO GRID: Invoice Details | Billing From | Billing To ===
  const col1 = margin;
  const col2 = margin + 62;
  const col3 = margin + 124;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Details", col1, y);
  doc.text("Billing From", col2, y);
  doc.text("Billing To", col3, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Invoice number: ${invoice.invoiceNumber || "-"}`, col1, y);
  doc.text(`Issued On: ${formatDate(invoice.invoiceDate || invoice.createdAt)}`, col1, y + 5);
  doc.text(`Due Date: ${invoice.dueDate ? formatDate(invoice.dueDate) : "-"}`, col1, y + 10);
  if (invoice.isRecurring) {
    doc.text(`Recurring: ${invoice.recurringInterval || "Monthly"}`, col1, y + 15);
  }

  doc.text((companyName || "-").substring(0, 25), col2, y);
  if (branchLocation) doc.text(branchLocation.substring(0, 30), col2, y + 5);
  if (companyPhone) doc.text(`Phone: ${companyPhone}`, col2, y + 10);
  if (companyEmail) doc.text(`Email: ${companyEmail}`, col2, y + 15);

  const cust = invoice.customer;
  doc.text((cust?.name || "-").substring(0, 25), col3, y);
  if (cust?.address || cust?.district) {
    doc.text([cust?.address, cust?.district].filter(Boolean).join(", ").substring(0, 35), col3, y + 5);
  }
  if (cust?.phone) doc.text(`Phone: ${cust.phone}`, col3, y + 10);
  if (cust?.email) doc.text(`Email: ${cust.email}`, col3, y + 15);

  y += 32;

  // === PRODUCT / SERVICE ITEMS TABLE ===
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Product / Service Items", margin, y);
  y += 6;

  const tableHeaders = ["#", "Product/Service", "Qty", "Unit", "Rate", "Discount", "Tax", "Amount"];
  const tableRows = (invoice.items || []).map((item, idx) => [
    String(idx + 1),
    (item.name || "-").substring(0, 30),
    String(item.quantity || 0),
    item.unit || "Pcs",
    formatCurrency(item.rate, currency),
    `${item.discount || 0}%`,
    `${item.tax || 0}%`,
    formatCurrency(item.amount, currency),
  ]);

  autoTable(doc, {
    startY: y,
    head: [tableHeaders],
    body: tableRows.length ? tableRows : [["-", "No items", "-", "-", "-", "-", "-", "-"]],
    theme: "grid",
    headStyles: {
      fillColor: [17, 24, 39],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
      cellPadding: 4,
    },
    bodyStyles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 52 },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 16, halign: "center" },
      4: { cellWidth: 26, halign: "right" },
      5: { cellWidth: 22, halign: "right" },
      6: { cellWidth: 16, halign: "right" },
      7: { cellWidth: 28, halign: "right" },
    },
    margin: { left: 11, right: 11 },
    didParseCell: (data) => {
      if (data.section === "head" && [4, 5, 6, 7].includes(data.column.index)) {
        data.cell.styles.halign = "right";
      }
    },
  });

  const tableEndY = doc.lastAutoTable?.finalY || y;
  y = tableEndY + 16;

  // === BOTTOM SECTION: Bank Details + Terms/Notes | Totals + Signature ===
  const leftX = margin;
  const rightX = pageWidth / 2 + 8;
  const rightAlignX = pageWidth - margin;
  const totalsStartY = y;

  // Left: Bank Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Bank Details", leftX, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const bank = invoice.bankDetails || {};
  doc.text(`Bank Name: ${bank.bankName || "-"}`, leftX, y);
  doc.text(`Account Number: ${bank.accountNumber || "-"}`, leftX, y + 5);
  doc.text(`IFSC Code: ${bank.ifscCode || "-"}`, leftX, y + 10);
  doc.text(`Payment Reference: ${bank.paymentReference || invoice.invoiceNumber || "-"}`, leftX, y + 15);
  y += 22;

  // Terms and Conditions
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Terms and Conditions", leftX, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const terms = (invoice.termsAndConditions || "The Payment must be returned in the same condition.").substring(0, 100);
  doc.text(terms, leftX, y + 5, { maxWidth: 90 });
  y += 16;

  // Notes
  doc.setFont("helvetica", "bold");
  doc.text("Notes", leftX, y);
  doc.setFont("helvetica", "normal");
  const notes = (invoice.notes || "All charges are final and include applicable taxes, fees, and additional costs").substring(0, 100);
  doc.text(notes, leftX, y + 5, { maxWidth: 90 });

  // Right: Totals (aligned with left section start)
  let rightY = totalsStartY;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Amount", rightX, rightY);
  doc.text(formatCurrency(invoice.subTotal, currency), rightAlignX, rightY, { align: "right" });
  rightY += 7;
  doc.setFont("helvetica", "normal");
  doc.text("Tax", rightX, rightY);
  doc.text(formatCurrency(invoice.taxTotal, currency), rightAlignX, rightY, { align: "right" });
  rightY += 7;
  doc.text("Discount", rightX, rightY);
  doc.text(`-${formatCurrency(invoice.discountTotal, currency)}`, rightAlignX, rightY, { align: "right" });
  rightY += 12;

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  doc.line(rightX, rightY, rightAlignX, rightY);
  rightY += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`Total (${currency})`, rightX, rightY);
  doc.setTextColor(124, 58, 237);
  doc.text(formatCurrency(invoice.totalAmount, currency), rightAlignX, rightY, { align: "right" });
  doc.setTextColor(0, 0, 0);
  rightY += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Total In Words", rightAlignX, rightY, { align: "right" });
  rightY += 6;
  doc.setFontSize(9);
  const totalAmount = Number(invoice.totalAmount) || 0;
  const totalWords = `${numberToWords(totalAmount)} ${currency}`;
  doc.text(totalWords, rightAlignX, rightY, { align: "right", maxWidth: 100 });
  rightY += 22;

  // Signature
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(rightAlignX - 55, rightY - 10, rightAlignX, rightY - 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(invoice.signatureName || "Authorized", rightAlignX, rightY - 2, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Manager", rightAlignX, rightY + 4, { align: "right" });

  // === FOOTER BANNER ===
  doc.setFillColor(249, 250, 251);
  doc.rect(0, pageHeight - 20, pageWidth, 20, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(companyName, margin, pageHeight - 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(branchLocation || "-", margin, pageHeight - 7);
  doc.setFont("helvetica", "bold");
  doc.text(companyName, pageWidth - margin, pageHeight - 12, { align: "right" });

  return doc.output("datauristring").split(",")[1];
};

/**
 * Generate and download sale invoice PDF (same layout as details page)
 */
export const downloadSaleInvoicePDF = (invoice, companyInfo = {}) => {
  const base64 = generateSaleInvoicePDF(invoice, companyInfo);
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${invoice.invoiceNumber || "invoice"}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Generate PDF and open print dialog
 */
export const printSaleInvoicePDF = (invoice, companyInfo = {}) => {
  const base64 = generateSaleInvoicePDF(invoice, companyInfo);
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([new Uint8Array(byteNumbers)], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, "_blank", "width=800,height=600");
  if (printWindow) {
    setTimeout(() => {
      printWindow.print();
      URL.revokeObjectURL(url);
    }, 800);
  } else {
    URL.revokeObjectURL(url);
  }
};
