import React from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserPlus, ChevronDown, ArrowUpRight } from "lucide-react";

export default function SubscriberChart({
  data,
  filter,
  onFilterChange,
  totalCustomers,
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
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            {t("dashboard.totalSubscriber")}
          </CardTitle>
          <div className="flex flex-wrap items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold">{totalCustomers ?? "0"}</span>
            <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> {delta ?? "0%"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {t("dashboard.totalCustomersLabel")}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              {getFilterLabel(filter)} <ChevronDown className="w-3 h-3 opacity-50" />
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
        <div className="h-[250px] w-full mt-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={32}>
              <defs>
                <linearGradient id="subscriberGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5347CE" stopOpacity={1} />
                  <stop offset="100%" stopColor="#887CFD" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                dy={10}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 6, 6]} fill="url(#subscriberGradient)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
