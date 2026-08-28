import React, { useState } from "react";
import { useBulkUploadProductsMutation } from "@/features/product/productApiSlice";
import { useGetCategoriesQuery } from "@/features/category/categoryApiSlice";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Sparkles,
  Table2,
  ClipboardList,
} from "lucide-react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";

const BulkUploadPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [bulkUploadProducts, { isLoading }] = useBulkUploadProductsMutation();
  const { data: categories = [] } = useGetCategoriesQuery({
    companyId: user?.companyId,
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [results, setResults] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const csvTemplate = `name,sku,price,discountPrice,categoryId,stock,isActive,description,thumbnail,images
Product Name 1,SKU-001,100.00,80.00,1,10,true,Product description here,https://example.com/thumb.jpg,https://example.com/img1.jpg|https://example.com/img2.jpg
Product Name 2,SKU-002,200.00,,2,5,true,Another product description,,https://example.com/img3.jpg`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products_bulk_upload_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("CSV template downloaded!");
  };

  const downloadExcelTemplate = () => {
    const templateData = [
      {
        name: "Product Name 1",
        sku: "SKU-001",
        price: 100.0,
        discountPrice: 80.0,
        categoryId: 1,
        stock: 10,
        isActive: true,
        description: "Product description here",
        thumbnail: "https://example.com/thumb.jpg",
        images: "https://example.com/img1.jpg|https://example.com/img2.jpg",
      },
      {
        name: "Product Name 2",
        sku: "SKU-002",
        price: 200.0,
        discountPrice: "",
        categoryId: 2,
        stock: 5,
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
    toast.success("Excel template downloaded!");
  };

  const parseFile = async (selectedFile) => {
    const fileExtension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();
    if (![".csv", ".xls", ".xlsx"].includes(fileExtension)) {
      toast.error("Please upload a CSV or Excel file (.csv, .xls, .xlsx)");
      return null;
    }

    setParsing(true);
    setResults(null);
    setPreview([]);

    try {
      if (fileExtension === ".csv") {
        const text = await selectedFile.text();
        const lines = text.trim().split("\n");
        if (lines.length < 2) {
          toast.error("CSV must have a header row and at least one data row");
          setFile(null);
          return null;
        }
        const headers = lines[0].split(",").map((h) => h.trim());
        const previewData = [];
        for (let i = 1; i < Math.min(lines.length, 6); i++) {
          const values = lines[i]
            .split(",")
            .map((v) => v.trim().replace(/^"|"$/g, ""));
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });
          previewData.push(row);
        }
        setPreview(previewData);
        toast.success(`Parsed ${lines.length - 1} products from CSV`);
        return previewData;
      } else {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { raw: false });
        if (data.length === 0) {
          toast.error("Excel file is empty");
          setFile(null);
          return null;
        }
        setPreview(data.slice(0, 5));
        toast.success(`Parsed ${data.length} products from Excel`);
        return data;
      }
    } catch (error) {
      toast.error("Failed to parse file: " + error.message);
      setFile(null);
      return null;
    } finally {
      setParsing(false);
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    await parseFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    setFile(droppedFile);
    parseFile(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    try {
      const params = { companyId: user.companyId };
      const res = await bulkUploadProducts({ file, params });
      if (res?.data) {
        const { success, failed, total, details } = res.data.data ?? res.data;
        setResults({ success, failed, total, details });
        if (failed === 0) {
          toast.success(
            `Successfully uploaded ${success} product${success !== 1 ? "s" : ""}!`
          );
          setTimeout(() => navigate("/products"), 3000);
        } else {
          toast.error(
            `Upload completed with errors: ${success} succeeded, ${failed} failed`
          );
        }
      } else {
        toast.error(res?.error?.data?.message || "Failed to upload products");
      }
    } catch (error) {
      toast.error("Failed to upload products: " + error.message);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview([]);
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Sticky header – same pattern as create/edit */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/products")}
              className="hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Button>
            <div>
              <div className="text-xs text-slate-500">Products</div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                Bulk Upload
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-6 pt-8">
        {!results ? (
          <div className="space-y-8">
            {/* Instructions card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                    How it works
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Add many products at once with CSV or Excel
                  </p>
                </div>
              </div>
              <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  "Download the CSV or Excel template below",
                  "Fill in your product details (name, price, categoryId, etc.)",
                  "Upload your file here and check the preview",
                  "Click Upload Products to import",
                ].map((step, i) => (
                  <li
                    key={i}
                    className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Template downloads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={downloadTemplate}
                className="flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/10 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 flex items-center justify-center transition-colors">
                  <FileText className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-50">
                    CSV Template
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Download className="w-4 h-4" />
                    Download .csv
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={downloadExcelTemplate}
                className="flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-500/10 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 flex items-center justify-center transition-colors">
                  <FileSpreadsheet className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-50">
                    Excel Template
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Download className="w-4 h-4" />
                    Download .xlsx
                  </div>
                </div>
              </button>
            </div>

            {/* Drop zone */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6">
              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
                  Upload file
                </span>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`
                    relative rounded-2xl border-2 border-dashed transition-all duration-200
                    flex flex-col items-center justify-center min-h-[220px] py-10 px-6
                    cursor-pointer
                    ${
                      isDragging
                        ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10"
                        : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600"
                    }
                  `}
                >
                  <input
                    type="file"
                    accept=".csv,.xls,.xlsx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={parsing}
                  />
                  {parsing ? (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-4">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Parsing file…
                      </p>
                    </>
                  ) : file ? (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-1">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Click or drop a new file to replace
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <Upload className="w-7 h-7 text-slate-500 dark:text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-1">
                        Drag and drop your file here
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        or click to browse — CSV, .xls, .xlsx
                      </p>
                    </>
                  )}
                </div>
              </label>
            </div>

            {/* Preview table */}
            {preview.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <Table2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                    Preview (first 5 rows)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50">
                        {Object.keys(preview[0] || {}).map((key) => (
                          <th
                            key={key}
                            className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {preview.map((row, index) => (
                        <tr
                          key={index}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          {Object.values(row).map((value, i) => (
                            <td
                              key={i}
                              className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-[200px] truncate"
                              title={String(value || "")}
                            >
                              {String(value || "").substring(0, 40)}
                              {String(value || "").length > 40 ? "…" : ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Required fields reference */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6">
              <div className="flex items-center gap-3 mb-4">
                <ClipboardList className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                  Column reference
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Required
                  </p>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                    <li><code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium">name</code> — Product name</li>
                    <li><code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium">price</code> — Number</li>
                    <li><code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium">categoryId</code> — Existing category ID</li>
                    <li><code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium">sku</code> — Unique code</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Optional
                  </p>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                    <li><code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium">discountPrice</code>, <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium">stock</code></li>
                    <li><code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium">description</code>, <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium">thumbnail</code></li>
                    <li><code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium">images</code> — pipe-separated URLs</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/products")}
                className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!file || isLoading || parsing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Products
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Results view */
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                      {results.success}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Succeeded
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                      {results.failed}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Failed
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Table2 className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                      {results.total}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Total
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {results.details?.failed?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                    Failed rows
                  </h3>
                </div>
                <div className="overflow-x-auto max-h-72 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">Row</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">SKU</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">Name</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {results.details.failed.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.row}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.data?.sku ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.data?.name ?? "—"}</td>
                          <td className="px-4 py-3 text-red-600 dark:text-red-400 text-xs">{item.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {results.details?.successful?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                    Successful products
                  </h3>
                </div>
                <div className="overflow-x-auto max-h-72 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">ID</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">SKU</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">Name</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {results.details.successful.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.id}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.sku}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" onClick={handleReset} className="border-slate-200 dark:border-slate-700">
                Upload another file
              </Button>
              <Button onClick={() => navigate("/products")} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Back to Products
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUploadPage;
