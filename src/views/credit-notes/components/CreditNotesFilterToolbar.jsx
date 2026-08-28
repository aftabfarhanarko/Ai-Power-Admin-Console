import React from "react";
import { useTranslation } from "react-i18next";
import { Search, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Filter toolbar: search, status tabs, date range (quick + custom).
 * Target ~150 lines per component.
 */
const CreditNotesFilterToolbar = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  dateRange,
  onDateRangeChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-4 bg-gray-50/30 dark:bg-gray-900/10">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#976DF7] transition-colors" />
          <input
            placeholder={t("creditNotes.searchPlaceholder")}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#976DF7]/20 focus:border-[#976DF7] transition-all"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {["all", "Pending Refund", "Refunded"].map((status) => (
              <button
                key={status}
                onClick={() => onStatusChange(status)}
                className={`
                    px-3 py-1.5 rounded-md text-xs font-semibold transition-all
                    ${
                      selectedStatus === status
                        ? "bg-white dark:bg-gray-700 text-[#976DF7] shadow-sm"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    }
                  `}
              >
                {status === "all"
                  ? t("common.all")
                  : status === "Pending Refund"
                    ? t("creditNotes.pendingRefund")
                    : t("creditNotes.refunded")}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Filter className="w-4 h-4 text-gray-500" />
          </Button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("creditNotes.filterByDate")}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => {
                const today = new Date();
                onDateRangeChange({
                  start: today.toISOString().split("T")[0],
                  end: today.toISOString().split("T")[0],
                });
              }}
              className="px-2 py-1 text-xs font-medium rounded text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-700"
            >
              {t("creditNotes.today")}
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const last7Days = new Date(today);
                last7Days.setDate(today.getDate() - 7);
                onDateRangeChange({
                  start: last7Days.toISOString().split("T")[0],
                  end: today.toISOString().split("T")[0],
                });
              }}
              className="px-2 py-1 text-xs font-medium rounded text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-700"
            >
              {t("creditNotes.last7Days")}
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const last30Days = new Date(today);
                last30Days.setDate(today.getDate() - 30);
                onDateRangeChange({
                  start: last30Days.toISOString().split("T")[0],
                  end: today.toISOString().split("T")[0],
                });
              }}
              className="px-2 py-1 text-xs font-medium rounded text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-700"
            >
              {t("creditNotes.last30Days")}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange?.start || ""}
              onChange={(e) =>
                onDateRangeChange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#976DF7]/20 focus:border-[#976DF7]"
              placeholder={t("creditNotes.startDate")}
            />
            <span className="text-gray-500 text-sm">to</span>
            <input
              type="date"
              value={dateRange?.end || ""}
              onChange={(e) =>
                onDateRangeChange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#976DF7]/20 focus:border-[#976DF7]"
              placeholder={t("creditNotes.endDate")}
            />
            {(dateRange?.start || dateRange?.end) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDateRangeChange({ start: null, end: null })}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {t("creditNotes.clear")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditNotesFilterToolbar;
