import * as XLSX from "xlsx";
import toast from "react-hot-toast";

/**
 * Reusable function to export data to Excel
 * @param {Array} data - Array of objects to export
 * @param {string} fileName - Name of the file (without extension)
 * @param {string} sheetName - Name of the Excel sheet (default: "Sheet1")
 * @param {Array} columnWidths - Optional array of column width objects [{wch: 20}, ...]
 * @param {Function} dataMapper - Optional function to transform data before export
 * @param {string} successMessage - Optional custom success message
 * @returns {boolean} - Returns true if export was successful, false otherwise
 */
export const exportToExcel = ({
  data,
  fileName,
  sheetName = "Sheet1",
  columnWidths = null,
  dataMapper = null,
  successMessage = null,
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

    // Transform data if mapper is provided
    const exportData = dataMapper ? data.map(dataMapper) : data;

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Create a worksheet from the data
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths if provided
    if (columnWidths && Array.isArray(columnWidths)) {
      ws["!cols"] = columnWidths;
    } else {
      // Auto-size columns if no widths provided
      const maxWidth = 50;
      const range = XLSX.utils.decode_range(ws["!ref"]);
      const colWidths = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxLen = 10;
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[cellAddress];
          if (cell && cell.v) {
            const cellValue = String(cell.v);
            maxLen = Math.max(maxLen, Math.min(cellValue.length, maxWidth));
          }
        }
        colWidths.push({ wch: maxLen + 2 });
      }
      ws["!cols"] = colWidths;
    }

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate filename with current date if not already included
    const dateStr = new Date().toISOString().split("T")[0];
    const finalFileName = fileName.includes(dateStr)
      ? `${fileName}.xlsx`
      : `${fileName}_${dateStr}.xlsx`;

    // Write the file
    XLSX.writeFile(wb, finalFileName);

    // Show success message
    const message =
      successMessage ||
      `Exported ${exportData.length} ${exportData.length === 1 ? "item" : "items"} to Excel`;
    toast.success(message);

    return true;
  } catch (error) {
    console.error("Export error:", error);
    toast.error("Failed to export data to Excel");
    return false;
  }
};

/**
 * Helper function to export products to Excel
 * @param {Array} products - Array of product objects
 * @param {string} fileName - Optional custom file name (default: "Products")
 */
export const exportProductsToExcel = (products, fileName = "Products") => {
  const dataMapper = (product) => ({
    Name: product.name ?? product.title ?? "-",
    SKU: product.sku ?? "-",
    Category: product.category?.name ?? "-",
    Price: typeof product.price === "number" ? product.price : product.price ?? "-",
    "Discount Price": product.discountPrice
      ? typeof product.discountPrice === "number"
        ? product.discountPrice
        : product.discountPrice
      : "-",
    Description: product.description ?? "-",
    Status: product.isActive ? "Active" : "Disabled",
    "Created At": product.createdAt
      ? new Date(product.createdAt).toLocaleString()
      : "-",
  });

  const columnWidths = [
    { wch: 30 }, // Name
    { wch: 15 }, // SKU
    { wch: 20 }, // Category
    { wch: 12 }, // Price
    { wch: 15 }, // Discount Price
    { wch: 50 }, // Description
    { wch: 12 }, // Status
    { wch: 20 }, // Created At
  ];

  return exportToExcel({
    data: products,
    fileName,
    sheetName: "Products",
    columnWidths,
    dataMapper,
    successMessage: `Exported ${products.length} product${products.length === 1 ? "" : "s"} to Excel`,
  });
};

