import React from "react";
import { useTranslation } from "react-i18next";
import { MoreHorizontal } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatNumber } from "@/utils/banglaFormatter";
import GlassCard from "./GlassCard";

const ProductivityTrendsChart = ({
  productivityData,
  productivityColors,
  weeklyTotalHours,
  activityRateChange,
  activityRateIsPositive,
  formatTooltipValue,
  formatLabel,
  currentLang,
}) => {
  const { t } = useTranslation();

  return (
    <GlassCard className="lg:col-span-2 p-6 sm:p-8 relative">
      <div className="absolute top-8 right-8 text-gray-400 dark:text-gray-600">
        <MoreHorizontal className="w-5 h-5" />
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {t("aiReport.productivityTrends")}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t("aiReport.dailyFocusHours")}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            {formatNumber(weeklyTotalHours.toFixed(1), currentLang)}
            <span className="text-xl font-normal text-gray-500">h</span>
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-medium text-gray-500">
            {t("aiReport.loggedThisWeek")}
          </span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
              activityRateIsPositive
                ? "text-emerald-600 bg-emerald-50"
                : "text-rose-600 bg-rose-50"
            }`}
          >
            {activityRateIsPositive ? "+" : ""}
            {activityRateChange} {t("aiReport.vsLastWeek")}
          </span>
        </div>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={productivityData}
            margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              {productivityColors.map((color, index) => (
                <linearGradient
                  key={index}
                  id={`grad-${index}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={color} stopOpacity={1} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
              opacity={0.4}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              tickFormatter={formatLabel}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.02)", radius: 8 }}
              contentStyle={{
                borderRadius: "16px",
                border: "none",
                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                padding: "12px",
              }}
              formatter={(value) => formatTooltipValue(value)}
            />
            <Bar dataKey="hours" radius={[12, 12, 12, 12]} barSize={40}>
              {productivityData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.hours > 0
                      ? productivityColors[index - 1]
                        ? `url(#grad-${index - 1})`
                        : entry.fill
                      : entry.fill
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

export default ProductivityTrendsChart;
