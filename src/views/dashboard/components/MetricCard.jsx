import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function MetricCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconBgColor,
  iconColor,
  sparklineData,
}) {
  const { t } = useTranslation();
  const isPositive = changeType === "increase";
  const safeId = `gradient-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${iconBgColor} transition-colors group-hover:scale-110 duration-300`}
            >
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <span className="text-gray-500 dark:text-gray-400 font-medium text-sm tracking-wide">
              {title}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-4 relative z-10">
          <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {value}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <div
              className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                isPositive
                  ? "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                  : "bg-rose-100/50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {change}
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {t("dashboard.vsLastMonth")}
            </span>
          </div>
        </div>

        <div className="absolute bottom-0 right-0 w-32 h-16 opacity-20 group-hover:opacity-30 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={safeId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? "#16C8C6" : "#F43F5E"}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? "#16C8C6" : "#F43F5E"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={isPositive ? "#16C8C6" : "#F43F5E"}
                fill={`url(#${safeId})`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
