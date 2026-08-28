import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";

export const generateOrderInvoice = (order) => {
  if (!order) {
    throw new Error("Order data is required");
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Colors
  const primaryColor = "#2563eb";
  const secondaryColor = "#64748b";
  const textColor = "#1e293b";

  // Header Section
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 40, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor("#ffffff");
  doc.text("INVOICE", 14, 25);

  // Invoice Details Section
  doc.setFontSize(11);
  doc.setTextColor(textColor);
  doc.setFont("helvetica", "normal");

  const detailsStart = 50;
  const invoiceNumber = `INV-${order.id}`;
  const invoiceDate = order.createdAt
    ? moment(order.createdAt).format("MMM DD, YYYY - HH:mm")
    : moment().format("MMM DD, YYYY - HH:mm");

  // Left side - Invoice details
  doc.text(`Invoice No: ${invoiceNumber}`, 14, detailsStart);
  doc.text(`Date: ${invoiceDate}`, 14, detailsStart + 7);
  doc.text(`Order ID: #${order.id}`, 14, detailsStart + 14);
  doc.text(`Status: ${order.status || "N/A"}`, 14, detailsStart + 21);

  // Right side - Customer details
  const customerName = order.customer?.name || order.customerName || "N/A";
  const customerEmail = order.customer?.email || "N/A";
  const customerPhone = order.customer?.phone || order.customerPhone || "N/A";

  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 120, detailsStart);
  doc.setFont("helvetica", "normal");
  doc.text(customerName, 120, detailsStart + 7);
  if (customerEmail !== "N/A") {
    doc.text(customerEmail, 120, detailsStart + 14);
  }
  if (customerPhone !== "N/A") {
    doc.text(customerPhone, 120, detailsStart + 21);
  }

  // Order Items Table
  const tableStartY = detailsStart + 35;
  
  if (order.items && order.items.length > 0) {
    const tableData = order.items.map((item) => {
      const productName = item.product?.name || item.name || "N/A";
      const sku = item.product?.sku || item.sku || "-";
      const quantity = item.quantity || 0;
      const unitPrice = typeof item.unitPrice === "number" ? item.unitPrice : 0;
      const totalPrice = typeof item.totalPrice === "number" ? item.totalPrice : unitPrice * quantity;

      return [
        productName,
        sku,
        quantity.toString(),
        `$${unitPrice.toFixed(2)}`,
        `$${totalPrice.toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      startY: tableStartY,
      head: [["Product", "SKU", "Qty", "Unit Price", "Total"]],
      body: tableData,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 10,
        textColor: textColor,
        lineColor: "#e2e8f0",
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: secondaryColor,
        textColor: "#ffffff",
        fontSize: 11,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: "#f8fafc",
      },
      columnStyles: {
        0: { cellWidth: 70, cellPadding: 3 }, // Product
        1: { cellWidth: 40, cellPadding: 3 }, // SKU
        2: { cellWidth: 20, cellPadding: 3 }, // Qty
        3: { cellWidth: 30, cellPadding: 3 }, // Unit Price
        4: { cellWidth: 30, cellPadding: 3 }, // Total
      },
      margin: { left: 14, right: 14 },
    });
  }

  // Get the final Y position after the table
  const finalY = doc.lastAutoTable.finalY || tableStartY + 30;

  // Summary Section
  const summaryStartY = finalY + 10;
  const totalAmount = typeof order.totalAmount === "number" ? order.totalAmount : 0;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Summary", 120, summaryStartY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Subtotal:", 120, summaryStartY + 8);
  doc.text(`$${totalAmount.toFixed(2)}`, 180, summaryStartY + 8, { align: "right" });

  // Add tax if needed (can be extended)
  // doc.text("Tax (0%):", 120, summaryStartY + 15);
  // doc.text("$0.00", 180, summaryStartY + 15, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total:", 120, summaryStartY + 22);
  doc.text(`$${totalAmount.toFixed(2)}`, 180, summaryStartY + 22, { align: "right" });

  // Payment Information
  const paymentInfoY = summaryStartY + 35;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Payment Method:", 14, paymentInfoY);
  doc.text(order.paymentMethod || "N/A", 14, paymentInfoY + 7);
  
  if (order.paymentReference) {
    doc.text("Payment Reference:", 14, paymentInfoY + 14);
    doc.text(order.paymentReference, 14, paymentInfoY + 21);
  }

  doc.text(`Payment Status: ${order.isPaid ? "Paid" : "Unpaid"}`, 14, paymentInfoY + 28);

  // Shipping Information (if available)
  if (order.shippingAddress || order.shippingTrackingId || order.shippingProvider) {
    const shippingY = paymentInfoY + 35;
    doc.setFont("helvetica", "bold");
    doc.text("Shipping Information:", 14, shippingY);
    doc.setFont("helvetica", "normal");
    
    let currentY = shippingY + 7;
    if (order.shippingAddress) {
      doc.text(`Address: ${order.shippingAddress}`, 14, currentY);
      currentY += 7;
    }
    if (order.shippingTrackingId) {
      doc.text(`Tracking ID: ${order.shippingTrackingId}`, 14, currentY);
      currentY += 7;
    }
    if (order.shippingProvider) {
      doc.text(`Provider: ${order.shippingProvider}`, 14, currentY);
    }
  }

  // Footer Section
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor("#64748b");
    doc.text("Thank you for your business!", 105, 287, { align: "center" });
    doc.text(`Page ${i} of ${pageCount}`, 190, 287, { align: "right" });
  }

  // Save the PDF
  const fileName = `Invoice_${invoiceNumber}_${moment().format("YYYYMMDD")}.pdf`;
  doc.save(fileName);
};





