import React from "react";
import { useTranslation } from "react-i18next";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import GlassCard from "./GlassCard";

const MetricCard = ({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  color,
  chartData,
}) => {
  const { t } = useTranslation();
  const colors = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
      fill: "#3b82f6",
      stroke: "#2563eb",
    },
    green: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-600 dark:text-emerald-400",
      fill: "#10b981",
      stroke: "#059669",
    },
    red: {
      bg: "bg-rose-50 dark:bg-rose-900/20",
      text: "text-rose-600 dark:text-rose-400",
      fill: "#f43f5e",
      stroke: "#e11d48",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      text: "text-purple-600 dark:text-purple-400",
      fill: "#8b5cf6",
      stroke: "#7c3aed",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      text: "text-orange-600 dark:text-orange-400",
      fill: "#f97316",
      stroke: "#ea580c",
    },
  };

  const theme = colors[color] || colors.blue;

  return (
    <GlassCard className="p-6 relative overflow-hidden h-[180px]">
      <div className="flex flex-col h-full justify-between z-10 relative">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${theme.bg}`}>
            <Icon className={`w-5 h-5 ${theme.text}`} />
          </div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </span>
        </div>

        {/* Value */}
        <div className="mt-2">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {value}
          </h3>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 mt-auto">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-md ${isPositive ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30" : "bg-rose-50 text-rose-600 dark:bg-rose-900/30"}`}
          >
            {isPositive ? "↗" : "↘"} {change}
          </span>
          <span className="text-xs text-gray-400">{t("aiReport.vsLastMonth")}</span>
        </div>
      </div>

      {/* Chart Background */}
      <div className="absolute bottom-0 right-0 w-[140px] h-[80px] opacity-50 pointer-events-none translate-y-2 translate-x-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id={`gradient-${color}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={theme.fill} stopOpacity={0.3} />
                <stop offset="95%" stopColor={theme.fill} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={theme.stroke}
              strokeWidth={3}
              fill={`url(#gradient-${color})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

export default MetricCard;
