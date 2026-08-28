import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetStatusByConsignmentIdQuery,
  useGetStatusByInvoiceQuery,
  useGetStatusByTrackingCodeQuery,
} from "@/features/steadfast/steadfastApiSlice";
import toast from "react-hot-toast";
import TextField from "@/components/input/TextField";
import { Search, PackageSearch, FileText, Barcode, Truck } from "lucide-react";
import Dropdown from "@/components/dropdown/dropdown";

const CheckStatus = () => {
  const { t } = useTranslation();
  const [searchType, setSearchType] = useState("consignment");
  const [searchValue, setSearchValue] = useState("");
  const [shouldFetch, setShouldFetch] = useState(false);

  const {
    data: statusByCid,
    isLoading: loadingCid,
    refetch: refetchCid,
  } = useGetStatusByConsignmentIdQuery(searchValue, {
    skip: !shouldFetch || searchType !== "consignment" || !searchValue,
  });

  const {
    data: statusByInvoice,
    isLoading: loadingInvoice,
    refetch: refetchInvoice,
  } = useGetStatusByInvoiceQuery(searchValue, {
    skip: !shouldFetch || searchType !== "invoice" || !searchValue,
  });

  const {
    data: statusByTracking,
    isLoading: loadingTracking,
    refetch: refetchTracking,
  } = useGetStatusByTrackingCodeQuery(searchValue, {
    skip: !shouldFetch || searchType !== "tracking" || !searchValue,
  });

  const isLoading = loadingCid || loadingInvoice || loadingTracking;

  const handleSearch = () => {
    if (!searchValue.trim()) {
      toast.error(
        t("steadfast.enterSearchValue", "Please enter a search value"),
      );
      return;
    }
    setShouldFetch(true);

    if (searchType === "consignment") {
      refetchCid();
    } else if (searchType === "invoice") {
      refetchInvoice();
    } else {
      refetchTracking();
    }
  };

  const getStatusData = () => {
    if (searchType === "consignment") return statusByCid;
    if (searchType === "invoice") return statusByInvoice;
    return statusByTracking;
  };

  const statusData = getStatusData();

  const statusColors = {
    pending:
      "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900",
    delivered_approval_pending:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900",
    partial_delivered_approval_pending:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900",
    cancelled_approval_pending:
      "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900",
    unknown_approval_pending:
      "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    delivered:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
    partial_delivered:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
    cancelled:
      "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900",
    hold: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900",
    in_review:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900",
    unknown:
      "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700",
  };

  const searchOptions = [
    {
      label: t("steadfast.consignmentId", "Consignment ID"),
      value: "consignment",
      icon: <PackageSearch />,
    },
    {
      label: t("steadfast.invoiceIdOption", "Invoice ID"),
      value: "invoice",
      icon: <FileText />,
    },
    {
      label: t("steadfast.trackingCode", "Tracking Code"),
      value: "tracking",
      icon: <Barcode />,
    },
  ];

  const currentOption = searchOptions.find((opt) => opt.value === searchType);

  const cardClass =
    "bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 shadow-sm";
  const titleClass =
    "text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className={cardClass}>
          <h3 className={titleClass}>
            <Search className="w-5 h-5 text-indigo-500" />
            {t("steadfast.checkDeliveryStatus", "Check Delivery Status")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {t(
              "steadfast.checkStatusDesc",
              "Track your shipment by Consignment ID, Invoice ID, or Tracking Code.",
            )}
          </p>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  {t("steadfast.searchBy", "Search By")}
                </label>
                <Dropdown
                  options={searchOptions}
                  setSelectedOption={(opt) => {
                    setSearchType(opt.value);
                    setSearchValue("");
                    setShouldFetch(false);
                  }}
                  className="w-full"
                >
                  <div className="flex items-center gap-2">
                    {currentOption?.icon &&
                      React.cloneElement(currentOption.icon, {
                        className: "w-4 h-4 text-gray-500",
                      })}
                    {currentOption?.label}
                  </div>
                </Dropdown>
              </div>
              <div className="md:col-span-2">
                <div className="flex gap-2 items-end h-full">
                  <div className="flex-1">
                    <TextField
                      label={t("steadfast.enterValue", "Search Value")}
                      placeholder={
                        searchType === "consignment"
                          ? t(
                              "steadfast.enterConsignmentId",
                              "Enter Consignment ID",
                            )
                          : searchType === "invoice"
                            ? t("steadfast.enterInvoiceId", "Enter Invoice ID")
                            : t(
                                "steadfast.enterTrackingCode",
                                "Enter Tracking Code",
                              )
                      }
                      value={searchValue}
                      onChange={(e) => {
                        setSearchValue(e.target.value);
                        setShouldFetch(false);
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full md:w-auto px-8 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-base shadow-lg shadow-indigo-500/30 dark:shadow-none transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("steadfast.searching", "Searching...")}
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    {t("steadfast.trackShipment", "Track Shipment")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        {statusData ? (
          <div className={`${cardClass} h-full`}>
            <h4 className="text-md font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Truck className="w-5 h-5 text-violet-500" />
              {t("steadfast.statusResult", "Status Result")}
            </h4>

            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#111418] border border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                  {t("steadfast.deliveryStatus", "Delivery Status")}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                      statusColors[statusData.delivery_status] ||
                      statusColors.unknown
                    }`}
                  >
                    {statusData.delivery_status
                      ?.replace(/_/g, " ")
                      .toUpperCase()}
                  </span>
                </div>
              </div>

              {statusData.status && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#111418] border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                    {t("steadfast.systemStatus", "System Status")}
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                    {statusData.status}
                  </p>
                </div>
              )}

              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800">
                <pre className="text-xs font-mono text-indigo-700 dark:text-indigo-300 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(statusData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`${cardClass} h-full flex flex-col items-center justify-center text-center p-8 opacity-60`}
          >
            <PackageSearch className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {t(
                "steadfast.statusPlaceholder",
                "Search results will appear here",
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckStatus;
