import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

/**
 * TopCustomersTable Component
 * Displays a table of top customers with their payment information
 */
export default function TopCustomersTable({ paymentData = [] }) {
  const { t } = useTranslation();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return paymentData;
    return [...paymentData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (sortConfig.key === "amount") {
        const aNum = parseFloat(String(aValue || "0").replace(/[^0-9.-]+/g, "") || 0);
        const bNum = parseFloat(String(bValue || "0").replace(/[^0-9.-]+/g, "") || 0);
        return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
      }
      
      const comparison = String(aValue || "").localeCompare(String(bValue || ""));
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [paymentData, sortConfig]);

  // Handle column header click for sorting
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Format amount for display
  const formatAmount = (amount) => {
    if (typeof amount === "string") return amount;
    return `$${amount.toFixed(2)}`;
  };

  // Get sort icon
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  // Calculate total amount
  const totalAmount = React.useMemo(() => {
    return sortedData.reduce(
      (sum, item) =>
        sum + parseFloat(String(item.amount || "0").replace(/[^0-9.-]+/g, "") || 0),
      0
    );
  }, [sortedData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-[#1a1f26] rounded-[32px] p-8 shadow-sm"
    >
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t("statistics.topCustomers")}
        </h2>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
              <th
                className="pb-4 pl-4 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-2">
                  {t("statistics.userName")}
                  {getSortIcon("name")}
                </div>
              </th>
              <th
                className="pb-4 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                onClick={() => handleSort("contact")}
              >
                <div className="flex items-center gap-2">
                  {t("statistics.contact")}
                  {getSortIcon("contact")}
                </div>
              </th>
              <th
                className="pb-4 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                onClick={() => handleSort("product")}
              >
                <div className="flex items-center gap-2">
                  {t("statistics.product")}
                  {getSortIcon("product")}
                </div>
              </th>
              <th
                className="pb-4 text-right pr-4 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end gap-2">
                  {t("statistics.amount")}
                  {getSortIcon("amount")}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-gray-500 dark:text-gray-400">
                  {t("statistics.noCustomersFound", { defaultValue: "No customers found" })}
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 object-cover"
                        onError={(e) => {
                          e.target.src = "https://i.pravatar.cc/150?u=default";
                        }}
                      />
                      <div>
                        <p className="font-bold text-[#1A1A1A] dark:text-white text-sm">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {item.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {item.contact}
                  </td>
                  <td className="py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {item.product}
                  </td>
                  <td className="py-4 text-right pr-4 font-bold text-emerald-500 dark:text-emerald-400">
                    {formatAmount(item.amount)}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Stats */}
      {sortedData.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm">
          <p className="text-gray-500 dark:text-gray-400">
            {t("statistics.showing", { defaultValue: "Showing" })} {sortedData.length}{" "}
            {t("statistics.of", { defaultValue: "of" })} {paymentData.length}{" "}
            {t("statistics.customers", { defaultValue: "customers" })}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            {t("statistics.totalAmount", { defaultValue: "Total" })}:{" "}
            <span className="font-bold text-emerald-500 dark:text-emerald-400">
              {formatAmount(totalAmount)}
            </span>
          </p>
        </div>
      )}
    </motion.div>
  );
}
