import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useCreateBulkOrdersMutation,
  useGetStoresQuery,
  useGetCitiesQuery,
} from "@/features/pathao/pathaoApiSlice";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Upload,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Package,
  Sparkles,
} from "lucide-react";

const BulkCreateOrder = () => {
  const { t } = useTranslation();
  const [createBulkOrders, { isLoading }] = useCreateBulkOrdersMutation();
  const { data: storesData } = useGetStoresQuery();
  const { data: citiesData } = useGetCitiesQuery();

  const [file, setFile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [results, setResults] = useState(null);
  const [parsing, setParsing] = useState(false);

  const stores = storesData?.data?.data || [];
  const cities = citiesData?.data?.data || [];

  // CSV Template
  const csvTemplate = `store_id,merchant_order_id,recipient_name,recipient_phone,recipient_address,recipient_city,recipient_zone,recipient_area,delivery_type,item_type,item_quantity,item_weight,amount_to_collect,item_description,special_instruction
1,ORDER001,John Doe,01712345678,"House 10, Road 5, Block A",1,1,1,48,2,1,0.5,1000,T-Shirt,Handle with care
1,ORDER002,Jane Smith,01812345678,"Flat 3B, Building 7",1,2,5,48,2,2,1.0,2000,Books,Fragile items`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pathao_bulk_orders_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success(t("pathao.templateDownloaded"));
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      toast.error(t("pathao.uploadCsvOnly"));
      return;
    }

    setFile(selectedFile);
    setParsing(true);
    setResults(null);

    try {
      const text = await selectedFile.text();
      const parsedOrders = parseCSV(text);
      setOrders(parsedOrders);
      toast.success(
        t("pathao.parsedOrdersSuccess", { count: parsedOrders.length }),
      );
    } catch (error) {
      toast.error(t("pathao.parseCsvFailed"));
      console.error("Parse error:", error);
      setOrders([]);
    } finally {
      setParsing(false);
    }
  };

  const parseCSV = (text) => {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());
    const parsedOrders = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",");
      if (values.length < headers.length) continue;

      const order = {};
      headers.forEach((header, index) => {
        let value = values[index]?.trim().replace(/^"|"$/g, "");

        // Convert numeric fields
        if (
          [
            "store_id",
            "recipient_city",
            "recipient_zone",
            "recipient_area",
            "delivery_type",
            "item_type",
            "item_quantity",
            "amount_to_collect",
          ].includes(header)
        ) {
          value = Number(value);
        } else if (header === "item_weight") {
          value = parseFloat(value);
        }

        order[header] = value;
      });

      parsedOrders.push(order);
    }

    return parsedOrders;
  };

  const validateOrders = () => {
    const errors = [];
    orders.forEach((order, index) => {
      if (!order.store_id) errors.push(`Row ${index + 2}: Missing store_id`);
      if (!order.merchant_order_id)
        errors.push(`Row ${index + 2}: Missing merchant_order_id`);
      if (!order.recipient_name)
        errors.push(`Row ${index + 2}: Missing recipient_name`);
      if (!order.recipient_phone)
        errors.push(`Row ${index + 2}: Missing recipient_phone`);
      if (!order.recipient_address)
        errors.push(`Row ${index + 2}: Missing recipient_address`);
      if (!order.recipient_city)
        errors.push(`Row ${index + 2}: Missing recipient_city`);
      if (!order.recipient_zone)
        errors.push(`Row ${index + 2}: Missing recipient_zone`);
      if (!order.recipient_area)
        errors.push(`Row ${index + 2}: Missing recipient_area`);
    });
    return errors;
  };

  const handleSubmit = async () => {
    if (orders.length === 0) {
      toast.error(t("pathao.noOrdersToCreate"));
      return;
    }

    const validationErrors = validateOrders();
    if (validationErrors.length > 0) {
      toast.error(t("pathao.validationFailed", { error: validationErrors[0] }));
      console.error("All errors:", validationErrors);
      return;
    }

    try {
      const result = await createBulkOrders({ orders }).unwrap();

      if (result.code === 200 || result.type === "success") {
        const successCount = result.data?.success_count || orders.length;
        const failedCount = result.data?.failed_count || 0;

        setResults({
          success: true,
          total: orders.length,
          successful: successCount,
          failed: failedCount,
          details: result.data?.details || [],
        });

        toast.success(
          t("pathao.bulkOrderCreated") +
            ` ${successCount} ${t("pathao.successful")}, ${failedCount} ${t("pathao.failed")}`,
        );

        // Reset form
        setFile(null);
        setOrders([]);
        document.getElementById("file-input").value = "";
      }
    } catch (error) {
      const errorMessage =
        error?.data?.message || t("pathao.bulkOrderCreateFailed");
      toast.error(errorMessage);
      console.error("Bulk order error:", error);

      setResults({
        success: false,
        error: errorMessage,
        details: error?.data?.errors || [],
      });
    }
  };

  const cardClass =
    "bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 shadow-sm";
  const titleClass =
    "text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2";

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Premium Header - Pathao Style */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-2xl shadow-lg shadow-[#8B5CF6]/20">
              <Package className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#8B5CF6] bg-clip-text text-transparent">
                {t("pathao.bulkCreateOrders")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-base">
                {t("pathao.bulkCreateOrdersDesc") ||
                  "Upload a CSV file to create multiple orders at once"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input */}
          <div className="lg:col-span-2 space-y-6">
            <div className={cardClass}>
              <h3 className={titleClass}>
                <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
                {t("pathao.howToUseBulkOrder")}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Follow these simple steps to create orders in bulk
              </p>

              <ol className="space-y-4 mb-8">
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-sm font-bold shadow-md shadow-[#8B5CF6]/20">
                    1
                  </div>
                  <p className="text-[15px] text-gray-700 dark:text-gray-300 pt-1">
                    {t("pathao.bulkOrderStep1") || "Download the CSV template"}
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-sm font-bold shadow-md shadow-[#8B5CF6]/20">
                    2
                  </div>
                  <p className="text-[15px] text-gray-700 dark:text-gray-300 pt-1">
                    {t("pathao.bulkOrderStep2") || "Fill in your order details"}
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-sm font-bold shadow-md shadow-[#8B5CF6]/20">
                    3
                  </div>
                  <p className="text-[15px] text-gray-700 dark:text-gray-300 pt-1">
                    {t("pathao.bulkOrderStep3") ||
                      "Upload the completed CSV file"}
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-sm font-bold shadow-md shadow-[#8B5CF6]/20">
                    4
                  </div>
                  <p className="text-[15px] text-gray-700 dark:text-gray-300 pt-1">
                    {t("pathao.bulkOrderStep4") ||
                      "Review and submit your orders"}
                  </p>
                </li>
              </ol>

              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={downloadTemplate}
                  className="group h-12 px-6 text-base font-semibold bg-white dark:bg-gray-900 border-2 border-[#8B5CF6]/20 text-[#8B5CF6] hover:bg-[#8B5CF6]/5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <Download className="mr-2 h-5 w-5 group-hover:translate-y-0.5 transition-transform duration-300" />
                  {t("pathao.downloadCsvTemplate")}
                </Button>

                <div className="relative">
                  <input
                    id="file-input"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    onClick={() =>
                      document.getElementById("file-input").click()
                    }
                    className="group h-12 px-6 text-base font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white rounded-xl transition-all duration-300 shadow-lg shadow-[#8B5CF6]/20 hover:shadow-xl hover:shadow-[#8B5CF6]/30"
                  >
                    <Upload className="mr-2 h-5 w-5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                    {t("pathao.uploadCsvFile")}
                  </Button>
                </div>
              </div>
            </div>

            {/* Orders Preview */}
            {orders.length > 0 && (
              <div className={cardClass}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={titleClass + " mb-0"}>
                    <FileText className="w-5 h-5 text-[#8B5CF6]" />
                    {t("pathao.previewOrders", { count: orders.length })}
                  </h3>
                  <Button
                    variant="ghost"
                    onClick={clearFile}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    {t("common.clear")}
                  </Button>
                </div>

                <div className="border rounded-xl overflow-hidden border-gray-200 dark:border-gray-800 mb-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Merchant Order ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Recipient
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-950/50 divide-y divide-gray-200 dark:divide-gray-800">
                        {orders.slice(0, 5).map((order, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {order.merchant_order_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {order.recipient_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {order.recipient_phone}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {order.amount_to_collect}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {orders.length > 5 && (
                    <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 text-sm text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-800">
                      {t("pathao.andMoreOrders", { count: orders.length - 5 })}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#8B5CF6] hover:from-[#7C3AED] hover:via-[#8B5CF6] hover:to-[#7C3AED] text-white rounded-xl shadow-xl shadow-[#8B5CF6]/20 hover:shadow-2xl hover:shadow-[#8B5CF6]/30 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading && (
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  )}
                  {!isLoading && (
                    <CheckCircle className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                  )}
                  {t("pathao.createOrdersCount", { count: orders.length })}
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-1">
            {results ? (
              <div className={`${cardClass} h-full`}>
                <h4 className="text-md font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  {t("pathao.results")}
                </h4>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {results.successful}
                    </div>
                    <div className="text-xs font-medium text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mt-1">
                      {t("pathao.successful")}
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {results.failed}
                    </div>
                    <div className="text-xs font-medium text-red-800 dark:text-red-300 uppercase tracking-wider mt-1">
                      {t("pathao.failed")}
                    </div>
                  </div>
                </div>

                {results.details && results.details.length > 0 && (
                  <div className="bg-gray-50 dark:bg-[#111418] rounded-xl p-4 border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
                      Error Details
                    </h5>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {results.details.map((detail, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-red-600 dark:text-red-400 p-2 bg-red-50/50 dark:bg-red-900/10 rounded border border-red-100 dark:border-red-900/20"
                        >
                          {typeof detail === "string"
                            ? detail
                            : JSON.stringify(detail)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => {
                    setFile(null);
                    setOrders([]);
                    document.getElementById("file-input").value = "";
                    setResults(null);
                  }}
                  className="w-full mt-6 bg-gray-900 dark:bg-gray-800 text-white rounded-xl h-12 hover:bg-gray-800 dark:hover:bg-gray-700"
                >
                  {t("pathao.uploadNewFile")}
                </Button>
              </div>
            ) : (
              <div
                className={`${cardClass} h-full flex flex-col items-center justify-center text-center p-8 opacity-60`}
              >
                <Package className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {t(
                    "pathao.resultsPlaceholder",
                    "Results will appear here after submission",
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkCreateOrder;
