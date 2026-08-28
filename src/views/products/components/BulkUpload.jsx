import React, { useState } from "react";
import { useBulkUploadProductsMutation } from "@/features/product/productApiSlice";
import { useGetCategoriesQuery } from "@/features/category/categoryApiSlice";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileText, AlertCircle, CheckCircle, XCircle, X } from "lucide-react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";

const BulkUpload = ({ isOpen, onClose }) => {
  const user = useSelector((state) => state.auth.user);
  const [bulkUploadProducts, { isLoading }] = useBulkUploadProductsMutation();
  const { data: categories = [] } = useGetCategoriesQuery({ companyId: user?.companyId });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [results, setResults] = useState(null);
  const [parsing, setParsing] = useState(false);

  // CSV Template
  const csvTemplate = `name,sku,price,discountPrice,categoryId,isActive,description,thumbnail,images
Product Name 1,SKU-001,100.00,80.00,1,true,Product description here,https://example.com/thumb.jpg,https://example.com/img1.jpg,https://example.com/img2.jpg
Product Name 2,SKU-002,200.00,,2,true,Another product description,,https://example.com/img3.jpg`;

  const downloadTemplate = () => {
    // Create CSV template
    const blob = new Blob([csvTemplate], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products_bulk_upload_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("Template downloaded successfully!");
  };

  const downloadExcelTemplate = () => {
    // Create Excel template
    const templateData = [
      {
        name: "Product Name 1",
        sku: "SKU-001",
        price: 100.00,
        discountPrice: 80.00,
        categoryId: 1,
        isActive: true,
        description: "Product description here",
        thumbnail: "https://example.com/thumb.jpg",
        images: "https://example.com/img1.jpg,https://example.com/img2.jpg",
      },
      {
        name: "Product Name 2",
        sku: "SKU-002",
        price: 200.00,
        discountPrice: "",
        categoryId: 2,
        isActive: true,
        description: "Another product description",
        thumbnail: "",
        images: "https://example.com/img3.jpg",
      },
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, ws, "Products");
    XLSX.writeFile(wb, "products_bulk_upload_template.xlsx");
    toast.success("Excel template downloaded successfully!");
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();
    if (![".csv", ".xls", ".xlsx"].includes(fileExtension)) {
      toast.error("Please upload a CSV or Excel file (.csv, .xls, .xlsx)");
      return;
    }

    setFile(selectedFile);
    setParsing(true);
    setResults(null);
    setPreview([]);

    try {
      if (fileExtension === ".csv") {
        const text = await selectedFile.text();
        const lines = text.trim().split("\n");
        if (lines.length < 2) {
          toast.error("CSV file must contain at least a header row and one data row");
          setFile(null);
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim());
        const previewData = [];
        for (let i = 1; i < Math.min(lines.length, 6); i++) {
          const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });
          previewData.push(row);
        }
        setPreview(previewData);
        toast.success(`Parsed ${lines.length - 1} products from CSV file`);
      } else {
        // Excel file
        const arrayBuffer = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { raw: false });
        
        if (data.length === 0) {
          toast.error("Excel file is empty");
          setFile(null);
          return;
        }

        setPreview(data.slice(0, 5));
        toast.success(`Parsed ${data.length} products from Excel file`);
      }
    } catch (error) {
      toast.error("Failed to parse file: " + error.message);
      console.error("Parse error:", error);
      setFile(null);
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    try {
      const params = { companyId: user.companyId };
      const res = await bulkUploadProducts({ file, params });

      if (res?.data) {
        const { success, failed, total, details } = res.data.data;
        setResults({
          success,
          failed,
          total,
          details,
        });

        if (failed === 0) {
          toast.success(`Successfully uploaded ${success} product${success !== 1 ? "s" : ""}!`);
        } else {
          toast.error(
            `Upload completed with errors: ${success} succeeded, ${failed} failed`
          );
        }

        // Reset file after successful upload
        setTimeout(() => {
          setFile(null);
          setPreview([]);
        }, 3000);
      } else {
        toast.error(res?.error?.data?.message || "Failed to upload products");
      }
    } catch (error) {
      toast.error("Failed to upload products: " + error.message);
      console.error("Upload error:", error);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setResults(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
      <div className="bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Bulk Upload Products</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!results ? (
          <>
            {/* Instructions */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Instructions
              </h3>
              <ol className="text-sm space-y-1 list-decimal list-inside text-black/70 dark:text-white/70">
                <li>Download the CSV or Excel template using the buttons below</li>
                <li>Fill in your product details in the file</li>
                <li>Upload the completed file</li>
                <li>Review the preview and submit</li>
              </ol>
            </div>

            {/* Template Downloads */}
            <div className="mb-6 flex gap-2">
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download CSV Template
              </Button>
              <Button
                variant="outline"
                onClick={downloadExcelTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Excel Template
              </Button>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Upload File (CSV or Excel)
              </label>
              <div className="border-2 border-dashed border-black/20 dark:border-white/20 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  disabled={parsing}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-black/40 dark:text-white/40" />
                  <span className="text-sm text-black/60 dark:text-white/60">
                    {file ? file.name : "Click to upload CSV or Excel file"}
                  </span>
                </label>
              </div>
              {parsing && (
                <p className="text-sm text-black/60 dark:text-white/60 mt-2">
                  Parsing file...
                </p>
              )}
            </div>

            {/* Preview */}
            {preview.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-2">Preview (First 5 rows)</h3>
                <div className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-black/5 dark:bg-white/5">
                      <tr>
                        {Object.keys(preview[0] || {}).map((key) => (
                          <th key={key} className="px-3 py-2 text-left font-medium">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, index) => (
                        <tr key={index} className="border-t border-gray-100 dark:border-gray-800">
                          {Object.values(row).map((value, i) => (
                            <td key={i} className="px-3 py-2">
                              {String(value || "").substring(0, 30)}
                              {String(value || "").length > 30 ? "..." : ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Format Reference */}
            <div className="mb-6 p-4 bg-black/5 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-lg">
              <h4 className="text-sm font-semibold mb-2">Required Fields</h4>
              <div className="text-xs space-y-1 text-black/60 dark:text-white/60">
                <ul className="list-disc list-inside ml-2 space-y-0.5">
                  <li>
                    <strong>name</strong> (text) - Product name
                  </li>
                  <li>
                    <strong>sku</strong> (text) - Unique SKU code
                  </li>
                  <li>
                    <strong>price</strong> (number) - Product price
                  </li>
                  <li>
                    <strong>categoryId</strong> (number) - Category ID (must exist)
                  </li>
                </ul>
                <p className="mt-2 font-semibold">Optional Fields:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>
                    <strong>discountPrice</strong> (number) - Discounted price
                  </li>
                  <li>
                    <strong>isActive</strong> (true/false) - Product status (default: true)
                  </li>
                  <li>
                    <strong>description</strong> (text) - Product description
                  </li>
                  <li>
                    <strong>thumbnail</strong> (URL) - Thumbnail image URL
                  </li>
                  <li>
                    <strong>images</strong> (comma-separated URLs) - Product image URLs
                  </li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!file || isLoading || parsing}>
                {isLoading ? "Uploading..." : "Upload Products"}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Results */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">{results.success} Succeeded</span>
                </div>
                {results.failed > 0 && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <XCircle className="h-5 w-5" />
                    <span className="font-semibold">{results.failed} Failed</span>
                  </div>
                )}
                <div className="text-sm text-black/60 dark:text-white/60">
                  Total: {results.total}
                </div>
              </div>

              {results.details?.failed?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    Failed Products
                  </h3>
                  <div className="border border-red-200 dark:border-red-800 rounded-lg overflow-x-auto max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-red-50 dark:bg-red-900/20">
                        <tr>
                          <th className="px-3 py-2 text-left">Row</th>
                          <th className="px-3 py-2 text-left">SKU</th>
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-left">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.details.failed.map((item, index) => (
                          <tr
                            key={index}
                            className="border-t border-red-200 dark:border-red-800"
                          >
                            <td className="px-3 py-2">{item.row}</td>
                            <td className="px-3 py-2">{item.data?.sku || "-"}</td>
                            <td className="px-3 py-2">{item.data?.name || "-"}</td>
                            <td className="px-3 py-2 text-red-600 dark:text-red-400">
                              {item.error}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {results.details?.successful?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    Successful Products
                  </h3>
                  <div className="border border-green-200 dark:border-green-800 rounded-lg overflow-x-auto max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-green-50 dark:bg-green-900/20">
                        <tr>
                          <th className="px-3 py-2 text-left">ID</th>
                          <th className="px-3 py-2 text-left">SKU</th>
                          <th className="px-3 py-2 text-left">Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.details.successful.map((item, index) => (
                          <tr
                            key={index}
                            className="border-t border-green-200 dark:border-green-800"
                          >
                            <td className="px-3 py-2">{item.id}</td>
                            <td className="px-3 py-2">{item.sku}</td>
                            <td className="px-3 py-2">{item.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={handleClose}>Close</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;
