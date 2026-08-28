import React from "react";
import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";

const formatOrderAmount = (order) => {
  const amount =
    typeof order.totalAmount === "number"
      ? order.totalAmount
      : Number(order.totalAmount || 0);
  if (!amount || Number.isNaN(amount)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatOrderStatusChip = (statusRaw) => {
  const status = (statusRaw || "").toLowerCase();
  if (status === "paid" || status === "delivered") {
    return "text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400";
  }
  if (status === "cancelled" || status === "refunded") {
    return "text-rose-700 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400";
  }
  if (status === "processing" || status === "shipped") {
    return "text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400";
  }
  return "text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400";
};

const CustomerRecentOrdersCard = ({ recentOrders, isLoadingOrders }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 flex items-center">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {t("customers.recentOrders")}
          </h3>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-white/5 text-[10px] uppercase font-black text-gray-400 tracking-widest">
              <th className="px-8 py-5">{t("customers.invoiceId")}</th>
              <th className="px-8 py-5">{t("customers.date")}</th>
              <th className="px-8 py-5">{t("customers.amount")}</th>
              <th className="px-8 py-5">{t("customers.status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoadingOrders ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-8 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {t("customers.loadingRecentOrders")}
                </td>
              </tr>
            ) : recentOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-8 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {t("customers.noOrdersForCustomer")}
                </td>
              </tr>
            ) : (
              recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group"
                >
                  <td className="px-8 py-5 font-bold text-indigo-600 dark:text-indigo-400">
                    #{String(order.id).padStart(6, "0")}
                  </td>
                  <td className="px-8 py-5 text-gray-500">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </td>
                  <td className="px-8 py-5 font-bold">
                    {formatOrderAmount(order)}
                  </td>
                  <td className="px-8 py-5">
                    <span
                      className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${formatOrderStatusChip(
                        order.status,
                      )}`}
                    >
                      {order.status || t("customers.unknownStatus")}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerRecentOrdersCard;

