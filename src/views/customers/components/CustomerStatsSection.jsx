import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * Maps legacy stat card config → new enterprise minimalist card.
 * The `stat` shape from CustomersPage:
 *   { label, value, trend, trendDir, trendColor, icon: LucideIcon, color, bg }
 */
const ICON_COLOR_MAP = {
  "text-blue-600": { dot: "bg-indigo-500", iconBg: "bg-indigo-50 dark:bg-indigo-500/10", iconColor: "text-indigo-600 dark:text-indigo-400" },
  "text-emerald-600": { dot: "bg-emerald-500", iconBg: "bg-emerald-50 dark:bg-emerald-500/10", iconColor: "text-emerald-600 dark:text-emerald-400" },
  "text-amber-600": { dot: "bg-amber-500", iconBg: "bg-amber-50 dark:bg-amber-500/10", iconColor: "text-amber-600 dark:text-amber-400" },
  "text-violet-600": { dot: "bg-violet-500", iconBg: "bg-violet-50 dark:bg-violet-500/10", iconColor: "text-violet-600 dark:text-violet-400" },
  "text-red-600": { dot: "bg-red-500", iconBg: "bg-red-50 dark:bg-red-500/10", iconColor: "text-red-600 dark:text-red-400" },
  "text-indigo-600": { dot: "bg-indigo-500", iconBg: "bg-indigo-50 dark:bg-indigo-500/10", iconColor: "text-indigo-600 dark:text-indigo-400" },
};

const TrendBadge = ({ trend, trendDir, trendColor }) => {
  const isUp = trendDir === "up";
  const isDown = trendDir === "down";
  const isGood = trendColor === "green";

  const badgeColor = isGood
    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
    : isDown
    ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
    : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400";

  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${badgeColor}`}>
      <Icon className="w-3 h-3" />
      {trend}
    </span>
  );
};

const CustomerStatCard = ({ stat, index }) => {
  const { label, value, trend, trendDir, trendColor, icon: Icon, color } = stat;
  const colorMap = ICON_COLOR_MAP[color] ?? {
    dot: "bg-indigo-500",
    iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  };

  return (
    <div
      className="bg-white dark:bg-[#1a1f26] rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:-translate-y-1 transition-transform duration-200 group"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-2xl ${colorMap.iconBg} ${colorMap.iconColor} flex items-center justify-center`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        {trend && (
          <TrendBadge trend={trend} trendDir={trendDir} trendColor={trendColor} />
        )}
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
        {label}
      </p>
      <p className="text-2xl font-semibold text-gray-900 dark:text-white leading-none">
        {value}
      </p>
    </div>
  );
};

const CustomerStatsSection = ({ statCards }) => {
  if (!statCards?.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <CustomerStatCard key={index} stat={stat} index={index} />
      ))}
    </div>
  );
};

export default CustomerStatsSection;
