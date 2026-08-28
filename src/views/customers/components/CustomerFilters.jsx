import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal, X } from "lucide-react";

const CustomerFilters = ({
  selectedSuccessfulOrders,
  setSelectedSuccessfulOrders,
  SUCCESSFUL_ORDERS_OPTIONS,
  selectedCancelledOrders,
  setSelectedCancelledOrders,
  CANCELLED_ORDERS_OPTIONS,
  selectedStatus,
  setSelectedStatus,
  STATUS_OPTIONS,
  searchQuery,
  onSearchChange,
}) => {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-3 mb-5">
      {/* Primary row: search + filter toggle */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery ?? ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={t("customers.searchPlaceholder", "Filter by name, email, or phone...")}
            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange?.("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters toggle button */}
        <button
          onClick={() => setShowAdvanced((v) => !v)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
            showAdvanced
              ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
              : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {t("common.filters", "Filters")}
          {showAdvanced && (
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
          )}
        </button>
      </div>

      {/* Advanced filter row */}
      {showAdvanced && (
        <div className="flex flex-wrap gap-3 p-4 bg-gray-50 dark:bg-black/10 rounded-2xl border border-gray-100 dark:border-gray-800">
          {/* Successful Orders */}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
              {t("customers.filterBySuccessfulOrders", "Successful Orders")}
            </label>
            <select
              value={selectedSuccessfulOrders.value}
              onChange={(e) => {
                const selected = SUCCESSFUL_ORDERS_OPTIONS.find(
                  (opt) => opt.value === e.target.value
                );
                setSelectedSuccessfulOrders(selected);
              }}
              className="w-full h-9 rounded-xl bg-white dark:bg-[#1a1f26] border border-gray-200 dark:border-gray-700 px-3 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            >
              {SUCCESSFUL_ORDERS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cancelled Orders */}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
              {t("customers.filterByCancelledOrders", "Cancelled Orders")}
            </label>
            <select
              value={selectedCancelledOrders.value}
              onChange={(e) => {
                const selected = CANCELLED_ORDERS_OPTIONS.find(
                  (opt) => opt.value === e.target.value
                );
                setSelectedCancelledOrders(selected);
              }}
              className="w-full h-9 rounded-xl bg-white dark:bg-[#1a1f26] border border-gray-200 dark:border-gray-700 px-3 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            >
              {CANCELLED_ORDERS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
              {t("customers.filterByStatus", "Status")}
            </label>
            <select
              value={selectedStatus.value}
              onChange={(e) => {
                const selected = STATUS_OPTIONS.find(
                  (opt) => opt.value === e.target.value
                );
                setSelectedStatus(selected);
              }}
              className="w-full h-9 rounded-xl bg-white dark:bg-[#1a1f26] border border-gray-200 dark:border-gray-700 px-3 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerFilters;
