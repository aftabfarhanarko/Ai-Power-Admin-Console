import React from "react";
import { useTranslation } from "react-i18next";
import { Briefcase, MoreHorizontal, ArrowUpRight } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatNumber, formatPercentage } from "@/utils/banglaFormatter";
import GlassCard from "./GlassCard";

const WorkLifeBalanceGauge = ({
  gaugeData,
  balanceScore,
  workHours,
  workHoursChange,
  workHoursIsPositive,
  personalTime,
  personalTimeChange,
  personalTimeIsPositive,
  currentLang,
}) => {
  const { t } = useTranslation();

  return (
    <GlassCard className="p-6 sm:p-8 flex flex-col relative">
      <div className="flex items-center justify-between w-full mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("aiReport.workLifeBalance")}
          </h3>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-400 cursor-pointer" />
      </div>

      <div className="h-[300px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <linearGradient
                id="gaugeGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor="#84CC16" stopOpacity={1} />
                <stop offset="100%" stopColor="#22C55E" stopOpacity={1} />
              </linearGradient>
            </defs>
            <Pie
              data={gaugeData}
              cx="50%"
              cy="85%"
              startAngle={180}
              endAngle={0}
              innerRadius={120}
              outerRadius={160}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              cornerRadius={6}
            >
              {gaugeData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.name === "Filled"
                      ? "url(#gaugeGradient)"
                      : "#F1F5F9"
                  }
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatNumber(value, currentLang)} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text for Gauge */}
        <div className="absolute inset-x-0 bottom-[40px] flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            {formatPercentage(balanceScore, currentLang)}
          </span>
          <span className="text-sm text-gray-500 mt-1">
            {t("aiReport.balanceScore")}
          </span>
        </div>
      </div>

      {/* Legend/Info */}
      <div className="flex justify-around w-full mt-2">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(workHours, currentLang, { showCommas: true })}
          </span>
          <div
            className={`flex items-center text-xs font-medium px-2 py-1 rounded-full mt-1 ${
              workHoursIsPositive
                ? "text-green-500 bg-green-50"
                : "text-rose-500 bg-rose-50"
            }`}
          >
            <ArrowUpRight size={12} className="mr-1" />
            {workHoursIsPositive ? "+" : ""}
            {workHoursChange}
          </div>
          <span className="text-xs text-gray-400 mt-1">
            {t("aiReport.workHours")}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(personalTime, currentLang)}
          </span>
          <div
            className={`flex items-center text-xs font-medium px-2 py-1 rounded-full mt-1 ${
              personalTimeIsPositive
                ? "text-orange-500 bg-orange-50"
                : "text-rose-500 bg-rose-50"
            }`}
          >
            <ArrowUpRight size={12} className="mr-1" />
            {personalTimeIsPositive ? "+" : ""}
            {personalTimeChange}
          </div>
          <span className="text-xs text-gray-400 mt-1">
            {t("aiReport.personalTime")}
          </span>
        </div>
      </div>
    </GlassCard>
  );
};

export default WorkLifeBalanceGauge;
