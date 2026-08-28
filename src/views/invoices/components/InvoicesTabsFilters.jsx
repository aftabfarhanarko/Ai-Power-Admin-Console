import React from "react";
import { Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InvoicesTabsFilters({
  tabs,
  statusFilter,
  setStatusFilter,
  statusCounts,
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/5 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              statusFilter === tab.key
                ? "bg-white dark:bg-[#2c3036] text-[#5347CE] shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {tab.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                statusFilter === tab.key
                  ? "bg-[#5347CE]/20 text-[#5347CE]"
                  : "bg-gray-200/80 dark:bg-white/10 text-gray-500 dark:text-gray-400"
              }`}
            >
              {statusCounts[tab.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 border-gray-200 dark:border-gray-700"
          >
            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm">This Week</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 border-gray-200 dark:border-gray-700"
          >
            <Filter className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm">Filter</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
