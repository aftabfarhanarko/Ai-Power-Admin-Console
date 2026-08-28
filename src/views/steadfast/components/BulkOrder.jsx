import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCreateBulkOrdersMutation } from "@/features/steadfast/steadfastApiSlice";
import toast from "react-hot-toast";
import {
  Upload,
  Download,
  PackageCheck,
  FileJson,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const BulkOrder = () => {
  const { t } = useTranslation();
  const [createBulkOrders, { isLoading }] = useCreateBulkOrdersMutation();
  const [ordersJson, setOrdersJson] = useState("");
  const [results, setResults] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const parsed = JSON.parse(content);
        setOrdersJson(JSON.stringify(parsed, null, 2));
        toast.success(t("steadfast.fileLoadedSuccess"));
      } catch (error) {
        toast.error(t("steadfast.invalidJsonFile"));
        console.error("File read error:", error);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ordersJson.trim()) {
      toast.error(t("steadfast.provideOrdersData"));
      return;
    }

    try {
      const orders = JSON.parse(ordersJson);

      if (!Array.isArray(orders)) {
        toast.error(t("steadfast.ordersMustBeArray"));
        return;
      }

      if (orders.length > 500) {
        toast.error(t("steadfast.max500Orders"));
        return;
      }

      // Validate each order
      const invalidOrders = orders.filter(
        (order) =>
          !order.invoice ||
          !order.recipient_name ||
          !order.recipient_phone ||
          !order.recipient_address ||
          order.cod_amount === undefined,
      );

      if (invalidOrders.length > 0) {
        toast.error(
          t("steadfast.ordersMissingFields", { count: invalidOrders.length }),
        );
        return;
      }

      const result = await createBulkOrders(orders).unwrap();
      setResults(result);

      const successCount = result.filter((r) => r.status === "success").length;
      const errorCount = result.filter((r) => r.status === "error").length;

      toast.success(
        t("steadfast.bulkOrderSuccess", {
          success: successCount,
          failed: errorCount,
        }),
      );
    } catch (error) {
      const errorMessage =
        error?.data?.message || t("steadfast.bulkOrderFailed");
      const errorDetails = error?.data?.details;

      if (error?.status === 429) {
        toast.error(
          `${errorMessage}${errorDetails ? ` - ${errorDetails}` : ""}`,
          { duration: 6000 },
        );
      } else if (error?.status === 401) {
        toast.error(
          `${errorMessage}${errorDetails ? ` - ${errorDetails}` : ""}`,
          { duration: 6000 },
        );
      } else {
        toast.error(errorMessage);
      }
      console.error("Bulk order error:", error);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        invoice: "INV-001",
        recipient_name: "John Doe",
        recipient_address: "House 44, Road 2/A, Dhanmondi, Dhaka 1209",
        recipient_phone: "01711111111",
        cod_amount: "1000.00",
        note: "Deliver within 3 PM",
        item_description: "Sample item",
        total_lot: "1",
        delivery_type: 0,
      },
    ];
    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk-order-template.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const cardClass =
    "bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 shadow-sm";
  const titleClass =
    "text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Input */}
      <div className="lg:col-span-2 space-y-6">
        <div className={cardClass}>
          <h3 className={titleClass}>
            <PackageCheck className="w-5 h-5 text-indigo-500" />
            {t("steadfast.bulkOrderCreate", "Create Bulk Orders")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {t(
              "steadfast.bulkOrderDesc",
              "Upload a JSON file or paste JSON content to create multiple orders at once.",
            )}
          </p>

          <div className="flex flex-wrap gap-4 mb-6">
            <label className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors border border-indigo-100 dark:border-indigo-800">
              <Upload className="h-4 w-4" />
              <span className="font-medium">
                {t("steadfast.uploadJsonFile", "Upload JSON File")}
              </span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
            >
              <Download className="h-4 w-4" />
              <span className="font-medium">
                {t("steadfast.downloadTemplate", "Download Template")}
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FileJson className="w-4 h-4 text-gray-500" />
                {t("steadfast.ordersJsonLabel", "Orders JSON Content")}
              </label>
              <div className="relative">
                <textarea
                  value={ordersJson}
                  onChange={(e) => setOrdersJson(e.target.value)}
                  placeholder='[{"invoice": "INV-001", "recipient_name": "John Doe", "recipient_phone": "01711111111", "recipient_address": "Address", "cod_amount": "1000.00"}]'
                  className="w-full h-[400px] bg-gray-50 dark:bg-[#111418] border border-gray-200 dark:border-gray-800 rounded-xl p-4 font-mono text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-base shadow-lg shadow-indigo-500/30 dark:shadow-none transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("steadfast.processing", "Processing...")}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  {t("steadfast.createBulkOrders", "Create Bulk Orders")}
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Column - Results */}
      <div className="lg:col-span-1">
        {results ? (
          <div className={`${cardClass} h-full`}>
            <h4 className="text-md font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              {t("steadfast.results", "Results")}
            </h4>
            <div className="bg-gray-50 dark:bg-[#111418] rounded-xl p-4 border border-gray-200 dark:border-gray-800 overflow-hidden">
              <pre className="text-xs font-mono text-gray-600 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap h-[500px] overflow-y-auto custom-scrollbar">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div
            className={`${cardClass} h-full flex flex-col items-center justify-center text-center p-8 opacity-60`}
          >
            <PackageCheck className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {t(
                "steadfast.resultsPlaceholder",
                "Results will appear here after submission",
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkOrder;
