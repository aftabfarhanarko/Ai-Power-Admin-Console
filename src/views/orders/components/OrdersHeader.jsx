import { Calendar, Download, Plus, PackageSearch } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import OrdersSearchBar from "./OrdersSearchBar";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { hasPermission, FeaturePermission } from "@/constants/feature-permission";

const OrdersHeader = ({
  dateRange,
  setDateRange,
  showDatePicker,
  setShowDatePicker,
  handleExport,
  searchQuery,
  setSearchQuery,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: user } = useGetCurrentUserQuery();

  const canCreateOrder = hasPermission(user, FeaturePermission.ORDER_CREATION_MANUAL);
  const canTrackOrder = hasPermission(user, FeaturePermission.ORDER_TRACKING);

  return (
    <div className="space-y-6">
      {/* Search Bar Section */}
      <OrdersSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Title Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Orders
        </h1>
      </div>

      {/* Actions Toolbar Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Date Range Picker */}
        <div className="flex items-center">
          <DropdownMenu open={showDatePicker} onOpenChange={setShowDatePicker}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold flex items-center gap-2 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-slate-700 dark:text-slate-200">
                  {dateRange.start && dateRange.end
                    ? `${new Date(dateRange.start).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${new Date(dateRange.end).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                    : dateRange.start
                      ? `From ${new Date(dateRange.start).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                      : t("orders.selectDateRange") || "Select Date Range"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 p-4 rounded-2xl shadow-xl border-slate-200 dark:border-slate-800">
              <DropdownMenuLabel className="pb-2 text-base">{t("orders.dateRange") || "Date Range"}</DropdownMenuLabel>
              <div className="space-y-4 mt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                      {t("orders.startDate") || "Start Date"}
                    </label>
                    <input
                      type="date"
                      value={dateRange.start || ""}
                      onChange={(e) =>
                        setDateRange((prev) => ({ ...prev, start: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                      {t("orders.endDate") || "End Date"}
                    </label>
                    <input
                      type="date"
                      value={dateRange.end || ""}
                      onChange={(e) =>
                        setDateRange((prev) => ({ ...prev, end: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDateRange({ start: null, end: null });
                      setShowDatePicker(false);
                    }}
                    className="flex-1 text-xs h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  >
                    {t("common.clear") || "Clear"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowDatePicker(false)}
                    className="flex-1 text-xs h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                  >
                    {t("common.apply") || "Apply"}
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
            className="h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4 mr-2 text-slate-500" />
            {t("orders.export") || "Export"}
          </Button>
          {canTrackOrder && (
            <Button
              onClick={() => navigate("/orders/track")}
              variant="outline"
              className="h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <PackageSearch className="w-4 h-4 mr-2 text-slate-500" />
              {t("orders.trackOrder") || "Track Order"}
            </Button>
          )}
        
            <Button
              onClick={() => navigate("/orders/create")}
              className="h-10 rounded-xl bg-[#5347CE] hover:bg-[#4338ca] text-white text-sm font-bold px-6 shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02]"
            >
              Create order
            </Button>
          
        </div>
      </div>
    </div>
  );
};

export default OrdersHeader;
