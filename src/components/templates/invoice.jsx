import React from "react";
import PrimaryButton from "../buttons/primary-button";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";
import { useSelector } from "react-redux";

const InvoiceDownload = ({
  children,
  data,
  name = "Invoice",
  invoiceNumber = "INV-12045231",
  handleClose,
  size = "sm",
  className = "w-full",
}) => {
  const { user } = useSelector((state) => state?.auth);

  const invoiceData = {
    invoiceNumber,
    date: moment().format("MMM DD, YYYY - HH:MM"),
    customer: user?.displayName,
    items: data,
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Colors
    const primaryColor = "#bd0000";
    const secondaryColor = "#3498db";
    const textColor = "#333333";

    // Header Section
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 40, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor("#ffffff");
    doc.text(name, 14, 25);

    // Invoice Details
    doc.setFontSize(11);
    doc.setTextColor(textColor);
    doc.setFont("helvetica", "normal");

    const detailsStart = 50;
    doc.text(`Invoice No: ${invoiceData.invoiceNumber}`, 14, detailsStart);
    doc.text(`Date: ${invoiceData.date}`, 14, detailsStart + 7);
    doc.text(`Customer: ${invoiceData.customer}`, 14, detailsStart + 14);

    // Table Configuration
    autoTable(doc, {
      startY: detailsStart + 25,
      body: invoiceData.items.map((item) => [item.label, item.value]),
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 10,
        textColor: textColor,
        lineColor: "#e0e0e0",
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: secondaryColor,
        textColor: "#ffffff",
        fontSize: 11,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: "#f9f9f9",
      },
      columnStyles: {
        0: { cellWidth: 100, cellPadding: 3 }, // Label column
        1: { cellWidth: 70, cellPadding: 3 }, // Value column
      },
      margin: { left: 14, right: 14 },
    });

    // Footer Section
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor("#666666");
      // Bottom left: "restro-fx" at 14mm from left
      doc.text("restro-fx", 14, 287);
      // Bottom right: Page number at 190mm from left with right alignment
      doc.text(`Page ${i} of ${pageCount}`, 190, 287, { align: "right" });
    }

    // Save the PDF
    doc.save(
      `${(
        name?.split(" ")?.join("_") +
        "_" +
        invoiceNumber?.split("-")[1]
      )?.toLowerCase()}.pdf`
    );
    handleClose();
  };

  return (
    <PrimaryButton
      onClick={generatePDF}
      className={className}
      size={size}
      variant="primary"
    >
      {children}
    </PrimaryButton>
  );
};

export default InvoiceDownload;
