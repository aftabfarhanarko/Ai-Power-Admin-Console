import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ProductsTableToolbar({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search products...",
  period,
  onPeriodChange,
  periodOptions = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ],
  t = (k) => k,
}) {
  return (
    <div className="flex items-center gap-3 w-full md:w-auto">
      <div className="relative flex-1 md:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-10 rounded-xl bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-gray-800 focus:ring-indigo-500"
        />
      </div>
      <select
        value={period}
        onChange={(e) => onPeriodChange(e.target.value)}
        className="h-10 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {periodOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.value === "weekly"
              ? t("products.periodWeekly")
              : opt.value === "monthly"
                ? t("products.periodMonthly")
                : opt.value === "yearly"
                  ? t("products.periodYearly")
                  : opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
