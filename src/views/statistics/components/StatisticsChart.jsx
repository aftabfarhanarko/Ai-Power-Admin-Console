import React from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

/**
 * StatisticsChart Component
 * Displays a bar chart showing earnings, sells, and visits statistics
 */
export default function StatisticsChart({ chartData = [] }) {
  const { t } = useTranslation();

  // Legend items configuration
  const legendItems = [
    { key: "earning", color: "#8B5CF6", label: t("statistics.earning") },
    { key: "sells", color: "#F59E0B", label: t("statistics.sells") },
    { key: "visit", color: "#14B8A6", label: t("statistics.visit") },
  ];

  // Format Y-axis values
  const formatYAxisValue = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toString();
  };

  // Calculate max value for Y-axis scaling
  const maxValue = React.useMemo(() => {
    if (!chartData || chartData.length === 0) return 1000;
    const allValues = chartData.flatMap(item => [
      item.earning || 0,
      item.sells || 0,
      item.visit || 0
    ]);
    const max = Math.max(...allValues);
    return Math.ceil(max * 1.1);
  }, [chartData]);

  // Calculate totals for summary
  const totals = React.useMemo(() => {
    return {
      earning: chartData.reduce((sum, item) => sum + (item.earning || 0), 0),
      sells: chartData.reduce((sum, item) => sum + (item.sells || 0), 0),
      visit: chartData.reduce((sum, item) => sum + (item.visit || 0), 0),
    };
  }, [chartData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-[#1a1f26] rounded-[32px] p-8 shadow-sm"
    >
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t("statistics.statistic")}
        </h2>
        
        {/* Legend */}
        <div className="flex items-center gap-6 text-sm">
          {legendItems.map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium text-gray-500 dark:text-gray-400">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            barGap={8}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#E5E7EB"
              strokeDasharray="0"
              strokeOpacity={0.3}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              dy={10}
              interval={0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              tickFormatter={formatYAxisValue}
              domain={[0, maxValue]}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.03)" }}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Bar
              dataKey="earning"
              fill="#8B5CF6"
              radius={[4, 4, 4, 4]}
              barSize={8}
              animationDuration={1000}
            />
            <Bar
              dataKey="sells"
              fill="#F59E0B"
              radius={[4, 4, 4, 4]}
              barSize={8}
              animationDuration={1000}
            />
            <Bar
              dataKey="visit"
              fill="#14B8A6"
              radius={[4, 4, 4, 4]}
              barSize={8}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800">
        {legendItems.map((item) => (
          <div key={item.key} className="text-center">
            <p className="text-2xl font-bold" style={{ color: item.color }}>
              {formatYAxisValue(totals[item.key])}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Total {item.label}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
