import { Search, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReusableTable from "@/components/table/reusable-table";

const OrdersTableSection = ({
  filteredOrders,
  isLoading,
  activeTab,
  setActiveTab,
  tabs,
  tabCounts,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  headers,
  tableData,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 px-2">
      {/* Search Results Info */}
      {searchQuery.trim() && (
        <div className="flex items-center justify-between px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
              {filteredOrders.length === 0
                ? t("orders.noSearchResults") || "No orders found"
                : filteredOrders.length === 1
                  ? t("orders.oneSearchResult") || "1 order found"
                  : t("orders.searchResults", { count: filteredOrders.length }) || `${filteredOrders.length} orders found`}
            </span>
          </div>
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline"
          >
            {t("common.clear") || "Clear"}
          </button>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center p-1 bg-gray-100/50 dark:bg-neutral-900/50 rounded-2xl w-fit overflow-x-auto">
          {tabs.map((tab) => {
            const tabLabel = tab === "All" 
              ? t("common.all") || "All"
              : tab === "Pending"
              ? t("orders.filterPending") || tab
              : tab === "Processing"
              ? t("orders.filterProcessing") || tab
              : tab === "Paid"
              ? t("orders.filterPaid") || tab
              : tab === "Shipped"
              ? t("orders.filterShipped") || tab
              : tab === "Delivered"
              ? t("orders.filterDelivered") || tab
              : tab === "Cancelled"
              ? t("orders.filterCancelled") || tab
              : tab === "Refunded"
              ? t("orders.filterRefunded") || tab
              : tab === "Unpaid"
              ? t("orders.statsUnpaid") || tab
              : tab;
            
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab ? "bg-white dark:bg-neutral-800 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
              >
                <span>{tabLabel}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${activeTab === tab ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300" : "bg-gray-300 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
                  {tabCounts[tab] || 0}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-neutral-900 border border-transparent hover:border-gray-100 dark:hover:border-neutral-800"
              >
                <ArrowUpDown className="w-4 h-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("orders.sortBy") || "Sort By"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSortBy("date");
                  setSortOrder(sortBy === "date" && sortOrder === "desc" ? "asc" : "desc");
                }}
              >
                {t("orders.sortByDate") || "Date"} {sortBy === "date" && (sortOrder === "desc" ? "↓" : "↑")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSortBy("amount");
                  setSortOrder(sortBy === "amount" && sortOrder === "desc" ? "asc" : "desc");
                }}
              >
                {t("orders.sortByAmount") || "Amount"} {sortBy === "amount" && (sortOrder === "desc" ? "↓" : "↑")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSortBy("status");
                  setSortOrder(sortBy === "status" && sortOrder === "desc" ? "asc" : "desc");
                }}
              >
                {t("orders.sortByStatus") || "Status"} {sortBy === "status" && (sortOrder === "desc" ? "↓" : "↑")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-neutral-900 border border-transparent hover:border-gray-100 dark:hover:border-neutral-800"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900/40 rounded-[24px] border border-gray-100 dark:border-neutral-800 overflow-hidden">
        <ReusableTable
          data={tableData}
          headers={headers}
          total={filteredOrders.length}
          isLoading={isLoading}
          searchable={false}
          py="py-4"
        />
      </div>
    </div>
  );
};

export default OrdersTableSection;
