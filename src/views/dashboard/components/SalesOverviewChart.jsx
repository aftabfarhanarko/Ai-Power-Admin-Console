import React from "react";
import { useTranslation } from "react-i18next";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TrendingUp, Filter, ChevronDown, ArrowUpRight } from "lucide-react";

export default function SalesOverviewChart({
  data,
  filter,
  onFilterChange,
  totalRevenue,
  delta,
}) {
  const { t } = useTranslation();

  const getFilterLabel = (value) => {
    switch (value) {
      case "Daily":
        return t("dashboard.filterDaily");
      case "Weekly":
        return t("dashboard.filterWeekly");
      case "Monthly":
        return t("dashboard.filterMonthly");
      case "Yearly":
        return t("dashboard.filterYearly");
      default:
        return value;
    }
  };

  return (
    <Card className="lg:col-span-2 border-none shadow-sm bg-white dark:bg-[#111622] transition-all">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-4 sm:gap-0">
        <div>
          <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white font-bold">
            <TrendingUp className="w-5 h-5 text-[var(--brand-primary)]" />
            {t("dashboard.salesOverviewTitle")}
          </CardTitle>
          <div className="flex flex-wrap items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ${totalRevenue ?? "0.00"}
            </span>
            <span className="text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> {delta ?? "0%"}
            </span>
            <span className="text-xs text-gray-400 ml-1">
              {t("dashboard.salesOverviewLabel")}
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1 flex-1 sm:flex-none border-gray-200 dark:border-gray-800 dark:text-gray-300">
              <Filter className="w-3 h-3 text-gray-400" /> {getFilterLabel(filter)}{" "}
              <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onFilterChange("Daily")}>
              {t("dashboard.filterDaily")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("Weekly")}>
              {t("dashboard.filterWeekly")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("Monthly")}>
              {t("dashboard.filterMonthly")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("Yearly")}>
              {t("dashboard.filterYearly")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-primary, #6366F1)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--brand-primary, #6366F1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color, #E2E8F0)" opacity={0.6} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                dy={10}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} dx={-10} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid var(--border-color, #E2E8F0)",
                  backgroundColor: "var(--surface, #F8FAFC)",
                  color: "var(--foreground, #0F172A)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Legend 
                iconType="circle" 
                wrapperStyle={{ paddingTop: "15px" }} 
              />
              <Area 
                type="monotone" 
                dataKey="Revenue" 
                stroke="var(--brand-primary, #6366F1)" 
                strokeWidth={3}
                fill="url(#salesGradient)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: "var(--brand-primary)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
