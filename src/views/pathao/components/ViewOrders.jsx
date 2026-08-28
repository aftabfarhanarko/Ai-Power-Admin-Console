import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetOrdersQuery,
  useViewOrderQuery,
} from "@/features/pathao/pathaoApiSlice";
import {
  Package,
  Search,
  Eye,
  RefreshCw,
  FileText,
  Smartphone,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Dropdown from "@/components/dropdown/dropdown";
import TextField from "@/components/input/TextField";
import toast from "react-hot-toast";

const ViewOrders = () => {
  const { t } = useTranslation();
  const { data: ordersData, isLoading, refetch } = useGetOrdersQuery();
  const [searchType, setSearchType] = useState("consignment");
  const [searchValue, setSearchValue] = useState("");
  const [shouldFetch, setShouldFetch] = useState(false);

  const {
    data: singleOrderData,
    isLoading: isLoadingOrder,
    error: searchError,
  } = useViewOrderQuery(searchValue, {
    skip: !shouldFetch || !searchValue.trim(),
  });

  const handleSearch = () => {
    if (!searchValue.trim()) {
      toast.error(t("pathao.enterSearchValue", "Please enter a search value"));
      return;
    }
    setShouldFetch(true);
  };

  const orders = ordersData?.data?.data || [];
  const singleOrder = singleOrderData?.data?.data;

  const searchOptions = [
    {
      label: t("pathao.consignmentId", "Consignment ID"),
      value: "consignment",
      icon: <Package className="w-4 h-4" />,
    },
    {
      label: t("pathao.merchantOrderId", "Merchant Order ID"),
      value: "merchant_order_id",
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  const currentOption = searchOptions.find((opt) => opt.value === searchType);

  const cardClass =
    "bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 shadow-sm";
  const titleClass =
    "text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2";

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-2xl shadow-lg shadow-[#8B5CF6]/20">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#8B5CF6] bg-clip-text text-transparent">
                {t("pathao.viewOrdersTitle")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-base">
                Track and manage your delivery orders
              </p>
            </div>
          </div>
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            className="group h-12 px-6 text-base font-semibold border-2 border-[#8B5CF6]/20 bg-white dark:bg-gray-900 text-[#8B5CF6] hover:bg-[#8B5CF6]/5 dark:hover:bg-[#8B5CF6]/10 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <RefreshCw
              className={`h-5 w-5 mr-2 ${isLoading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`}
            />
            {t("steadfast.refresh")}
          </Button>
        </div>

        {/* === Search + Single Result Grid === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Search */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-950/50 rounded-[24px] border-2 border-[#8B5CF6]/20 shadow-xl shadow-[#8B5CF6]/5 overflow-hidden h-full">
              <div className="p-6 border-b-2 border-[#8B5CF6]/10 bg-gradient-to-r from-[#8B5CF6]/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl shadow-md shadow-[#8B5CF6]/20">
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t("pathao.trackOrder")}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-1">
                  Enter order details to find specific shipment information
                </p>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-1">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block uppercase tracking-wide">
                      {t("steadfast.searchBy")}
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
                      <div className="flex items-center gap-2 font-medium">
                        {currentOption?.icon &&
                          React.cloneElement(currentOption.icon, {
                            className: "w-4 h-4 text-[#8B5CF6]",
                          })}
                        {currentOption?.label}
                      </div>
                    </Dropdown>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex gap-2 items-end h-full">
                      <div className="flex-1">
                        <TextField
                          label={t("steadfast.enterValue")}
                          placeholder={
                            searchType === "consignment"
                              ? t("pathao.enterConsignmentId")
                              : t("pathao.enterMerchantOrderId")
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
                  <Button
                    onClick={handleSearch}
                    disabled={isLoadingOrder}
                    className="w-full md:w-auto px-8 h-12 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white font-bold text-base shadow-lg shadow-[#8B5CF6]/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 flex items-center gap-2"
                  >
                    {isLoadingOrder ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        {t("pathao.trackShipment")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Single Order Result */}
          <div className="lg:col-span-1">
            {singleOrder ? (
              <div className={`${cardClass} h-full`}>
                <h4 className={titleClass}>
                  <Truck className="w-5 h-5 text-[#8B5CF6]" />
                  Result Found
                </h4>

                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#111418] border border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                      Order Status
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-3 py-1.5 rounded-full text-sm font-semibold border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900">
                        {singleOrder.order_status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#111418] border border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                      Recipient
                    </p>
                    <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
                      {singleOrder.recipient_name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <Smartphone className="w-3 h-3" />{" "}
                      {singleOrder.recipient_phone}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
                    <p className="text-xs text-[#8B5CF6] uppercase font-bold mb-1">
                      Amount to Collect
                    </p>
                    <p className="text-xl font-bold text-[#7C3AED] dark:text-[#A78BFA]">
                      ৳{singleOrder.amount_to_collect}
                    </p>
                  </div>
                </div>
              </div>
            ) : searchError ? (
              <div
                className={`${cardClass} h-full flex flex-col items-center justify-center text-center p-8`}
              >
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
                  <Search className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Order Not Found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  We couldn't find any order with that ID. Please check and try
                  again.
                </p>
              </div>
            ) : (
              <div
                className={`${cardClass} h-full flex flex-col items-center justify-center text-center p-8 opacity-60`}
              >
                <Package className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  Enter a consignment ID to see the details here
                </p>
              </div>
            )}
          </div>
        </div>
        {/* ↑ Grid properly closed here */}

        {/* All Orders Table */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={titleClass}>
              <Truck className="w-5 h-5 text-[#8B5CF6]" />
              {t("pathao.allOrders")}
            </h3>
            <Button
              onClick={() => refetch()}
              disabled={isLoading}
              variant="outline"
              className="h-10 px-4 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              {t("steadfast.refresh")}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-[#8B5CF6]/30 border-t-[#8B5CF6] rounded-full animate-spin" />
              <p className="mt-4 text-sm text-gray-500">
                {t("pathao.loadingOrders")}
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center">
              <div className="inline-flex p-4 bg-gray-50 dark:bg-gray-800 rounded-full mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-900 dark:text-white font-medium mb-1">
                {t("pathao.noOrdersFound")}
              </p>
              <p className="text-sm text-gray-500">
                Your orders will appear here once created
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-[#111418]">
                  <tr>
                    <th className="px-4 py-3 font-medium rounded-l-xl">
                      Consignment ID
                    </th>
                    <th className="px-4 py-3 font-medium">Recipient</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium rounded-r-xl">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {orders.map((order) => (
                    <tr
                      key={order.consignment_id}
                      className="hover:bg-gray-50 dark:hover:bg-[#111418]/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {order.consignment_id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {order.recipient_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.recipient_phone}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        ৳{order.amount_to_collect}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          {order.order_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg hover:bg-[#8B5CF6]/10 hover:text-[#8B5CF6]"
                          onClick={() => {
                            setSearchValue(order.consignment_id);
                            setSearchType("consignment");
                            setShouldFetch(true);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewOrders;
