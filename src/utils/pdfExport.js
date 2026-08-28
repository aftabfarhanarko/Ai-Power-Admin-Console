import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

/**
 * Reusable function to export data to PDF
 * @param {Array} data - Array of objects to export
 * @param {string} fileName - Name of the file (without extension)
 * @param {Array} headers - Array of header objects with { header: string, field: string }
 * @param {Function} dataMapper - Optional function to transform data before export
 * @param {string} successMessage - Optional custom success message
 * @param {string} title - Optional title for the PDF document
 * @returns {boolean} - Returns true if export was successful, false otherwise
 */
export const exportToPDF = ({
  data,
  fileName,
  headers,
  dataMapper = null,
  successMessage = null,
  title = null,
}) => {
  try {
    // Validate input
    if (!data || !Array.isArray(data) || data.length === 0) {
      toast.error("No data available to export");
      return false;
    }

    if (!fileName) {
      toast.error("File name is required");
      return false;
    }

    if (!headers || !Array.isArray(headers) || headers.length === 0) {
      toast.error("Headers are required");
      return false;
    }

    // Transform data if mapper is provided
    const exportData = dataMapper ? data.map(dataMapper) : data;

    // Create a new PDF document
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Colors
    const primaryColor = [41, 128, 185]; // Blue
    const secondaryColor = [52, 73, 94]; // Dark gray
    const lightGray = [236, 240, 241];

    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    // Title Section
    if (title) {
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 20, "F");
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(title, margin, 14);
    }

    // Date and time
    const dateStr = new Date().toLocaleString();
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${dateStr}`, pageWidth - margin, title ? 14 : 10, { align: "right" });

    // Prepare table data
    const tableHeaders = headers
      .filter((h) => h.field !== "actions") // Exclude actions column
      .map((h) => h.header);

    const tableRows = exportData.map((item) => {
      return headers
        .filter((h) => h.field !== "actions") // Exclude actions column
        .map((h) => {
          const value = item[h.field];
          // Handle React elements and complex objects
          if (value == null || value === undefined) return "-";
          if (typeof value === "object" && value !== null) {
            // If it's a React element or complex object, try to extract text
            if (value.props) {
              // React element - try to get text content
              return String(value.props?.children || "-");
            }
            return JSON.stringify(value);
          }
          return String(value);
        });
    });

    // Generate table
    autoTable(doc, {
      startY: title ? 25 : 15,
      head: [tableHeaders],
      body: tableRows,
      theme: "striped",
      styles: {
        font: "helvetica",
        fontSize: 9,
        textColor: [0, 0, 0],
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: secondaryColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
        halign: "left",
      },
      alternateRowStyles: {
        fillColor: lightGray,
      },
      margin: { left: margin, right: margin },
      tableWidth: "auto",
    });

    // Footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - margin,
        doc.internal.pageSize.getHeight() - 10,
        { align: "right" }
      );
    }

    // Generate filename with current date
    const dateStrFile = new Date().toISOString().split("T")[0];
    const finalFileName = fileName.includes(dateStrFile)
      ? `${fileName}.pdf`
      : `${fileName}_${dateStrFile}.pdf`;

    // Save the PDF
    doc.save(finalFileName);

    // Show success message
    const message =
      successMessage ||
      `Exported ${exportData.length} ${exportData.length === 1 ? "item" : "items"} to PDF`;
    toast.success(message);

    return true;
  } catch (error) {
    console.error("PDF Export error:", error);
    toast.error("Failed to export data to PDF");
    return false;
  }
};

/**
 * Helper function to export products to PDF
 * @param {Array} products - Array of product objects
 * @param {string} fileName - Optional custom file name (default: "Products")
 */
export const exportProductsToPDF = (products, fileName = "Products") => {
  const headers = [
    { header: "Name", field: "name" },
    { header: "SKU", field: "sku" },
    { header: "Category", field: "category" },
    { header: "Price", field: "price" },
    { header: "Discount Price", field: "discountPrice" },
    { header: "Stock", field: "stock" },
    { header: "Status", field: "status" },
    { header: "Created At", field: "createdAt" },
  ];

  const dataMapper = (product) => ({
    name: product.name ?? product.title ?? "-",
    sku: product.sku ?? "-",
    category: product.category?.name ?? "-",
    price: typeof product.price === "number" ? `$${product.price.toFixed(2)}` : product.price ?? "-",
    discountPrice: product.discountPrice
      ? typeof product.discountPrice === "number"
        ? `$${product.discountPrice.toFixed(2)}`
        : product.discountPrice
      : "-",
    stock: product.stock ?? 0,
    status: product.isActive ? "Active" : "Disabled",
    createdAt: product.createdAt
      ? new Date(product.createdAt).toLocaleString()
      : "-",
  });

  return exportToPDF({
    data: products,
    fileName,
    headers,
    dataMapper,
    title: "Products Export",
    successMessage: `Exported ${products.length} product${products.length === 1 ? "" : "s"} to PDF`,
  });
};

/**
 * Helper function to export flash sell products to PDF
 * @param {Array} flashSellProducts - Array of flash sell product objects
 * @param {string} fileName - Optional custom file name (default: "Flash_Sell_Products")
 */
export const exportFlashSellToPDF = (flashSellProducts, fileName = "Flash_Sell_Products") => {
  const headers = [
    { header: "Product Name", field: "name" },
    { header: "SKU", field: "sku" },
    { header: "Regular Price", field: "regularPrice" },
    { header: "Flash Price", field: "flashPrice" },
    { header: "Discount", field: "discount" },
    { header: "Start Time", field: "startTime" },
    { header: "End Time", field: "endTime" },
    { header: "Status", field: "status" },
  ];

  const dataMapper = (product) => {
    const regularPrice = product.price || 0;
    const flashPrice = product.flashSellPrice || product.price || 0;
    const discount = regularPrice > 0 
      ? (((regularPrice - flashPrice) / regularPrice) * 100).toFixed(0)
      : 0;
    
    const now = new Date();
    const startTime = product.flashSellStartTime ? new Date(product.flashSellStartTime) : null;
    const endTime = product.flashSellEndTime ? new Date(product.flashSellEndTime) : null;
    
    let status = "Scheduled";
    if (startTime && endTime) {
      if (now < startTime) {
        status = "Scheduled";
      } else if (now >= startTime && now <= endTime) {
        status = "Active";
      } else {
        status = "Expired";
      }
    }

    return {
      name: product.name || "-",
      sku: product.sku || "-",
      regularPrice: `$${regularPrice.toFixed(2)}`,
      flashPrice: `$${flashPrice.toFixed(2)}`,
      discount: `${discount}%`,
      startTime: startTime ? startTime.toLocaleString() : "-",
      endTime: endTime ? endTime.toLocaleString() : "-",
      status: status,
    };
  };

  return exportToPDF({
    data: flashSellProducts,
    fileName,
    headers,
    dataMapper,
    title: "Flash Sell Products Export",
    successMessage: `Exported ${flashSellProducts.length} flash sell product${flashSellProducts.length === 1 ? "" : "s"} to PDF`,
  });
};

/**
 * Helper function to export customers to PDF
 * @param {Array} customers - Array of customer objects
 * @param {string} fileName - Optional custom file name (default: "Customers")
 */
export const exportCustomersToPDF = (customers, fileName = "Customers") => {
  const headers = [
    { header: "Name", field: "name" },
    { header: "Email", field: "email" },
    { header: "Phone", field: "phone" },
    { header: "Total Orders", field: "totalOrdersCount" },
    { header: "Successful Orders", field: "successfulOrdersCount" },
    { header: "Cancelled Orders", field: "cancelledOrdersCount" },
    { header: "Active", field: "isActive" },
    { header: "Banned", field: "isBanned" },
    { header: "Ban Reason", field: "banReason" },
    { header: "Banned At", field: "bannedAt" },
    { header: "Created At", field: "createdAt" },
  ];

  const dataMapper = (customer) => ({
    name: customer.name ?? "-",
    email: customer.email ?? "-",
    phone: customer.phone ?? "-",
    totalOrdersCount: (customer.successfulOrdersCount ?? 0) + (customer.cancelledOrdersCount ?? 0),
    successfulOrdersCount: customer.successfulOrdersCount ?? 0,
    cancelledOrdersCount: customer.cancelledOrdersCount ?? 0,
    isActive: customer.isActive ? "Yes" : "No",
    isBanned: customer.isBanned ? "Yes" : "No",
    banReason: customer.banReason ?? "-",
    bannedAt: customer.bannedAt
      ? new Date(customer.bannedAt).toLocaleString()
      : "-",
    createdAt: customer.createdAt
      ? new Date(customer.createdAt).toLocaleString()
      : "-",
  });

  return exportToPDF({
    data: customers,
    fileName,
    headers,
    dataMapper,
    title: "Customers Export",
    successMessage: `Exported ${customers.length} customer${customers.length === 1 ? "" : "s"} to PDF`,
  });
};

/**
 * Helper function to export order items to PDF
 * @param {Array} orderItems - Array of order item objects
 * @param {string} fileName - Optional custom file name (default: "Order_Items")
 */
export const exportOrderItemsToPDF = (orderItems, fileName = "Order_Items") => {
  const headers = [
    { header: "Order ID", field: "orderId" },
    { header: "Product", field: "product" },
    { header: "SKU", field: "sku" },
    { header: "Quantity", field: "quantity" },
    { header: "Unit Price", field: "unitPrice" },
    { header: "Total Price", field: "totalPrice" },
    { header: "Order Status", field: "orderStatus" },
    { header: "Created At", field: "createdAt" },
  ];

  const dataMapper = (item) => ({
    orderId: item.orderId ?? "-",
    product: item.productName ?? "-",
    sku: item.sku ?? "-",
    quantity: item.quantity ?? 0,
    unitPrice:
      typeof item.unitPrice === "number"
        ? `$${item.unitPrice.toFixed(2)}`
        : item.unitPrice ?? "-",
    totalPrice:
      typeof item.totalPrice === "number"
        ? `$${item.totalPrice.toFixed(2)}`
        : item.totalPrice ?? "-",
    orderStatus: item.orderStatus ?? "-",
    createdAt: item.createdAt
      ? new Date(item.createdAt).toLocaleString()
      : "-",
  });

  return exportToPDF({
    data: orderItems,
    fileName,
    headers,
    dataMapper,
    title: "Order Items Export",
    successMessage: `Exported ${orderItems.length} order item${orderItems.length === 1 ? "" : "s"} to PDF`,
  });
};
