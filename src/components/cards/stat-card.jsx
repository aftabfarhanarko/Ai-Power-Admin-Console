import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

/**
 * StatCard Component
 *
 * Displays a single key performance indicator (KPI) with an icon, value, and trend.
 * Designed to be responsive and visually appealing with a modern aesthetic.
 *
 * Props:
 * @param {string} title - The label for the statistic (e.g., "Total Revenue")
 * @param {string} value - The main value to display (e.g., "$45,970")
 * @param {string} delta - The percentage change or trend text (e.g., "+12.5%")
 * @param {React.Component} icon - The Lucide icon component to display
 * @param {string} tone - Color theme for the card ('green', 'blue', 'red', 'default')
 */
const StatCard = ({ title, value, delta, icon: Icon, tone = "default" }) => {
  // Determine color scheme based on tone prop
  // Modern dashboard trends use subtle backgrounds with punchy icon colors
  const styles = {
    green: {
      bg: "bg-emerald-50 dark:bg-emerald-900/10",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      deltaColor: "text-emerald-600 dark:text-emerald-400",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/10",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      deltaColor: "text-blue-600 dark:text-blue-400",
    },
    red: {
      bg: "bg-rose-50 dark:bg-rose-900/10",
      iconBg: "bg-rose-100 dark:bg-rose-900/30",
      iconColor: "text-rose-600 dark:text-rose-400",
      deltaColor: "text-rose-600 dark:text-rose-400",
    },
    violet: {
      bg: "bg-[#5347CE]/5 dark:bg-[#5347CE]/10",
      iconBg: "bg-[#5347CE]/10 dark:bg-[#5347CE]/20",
      iconColor: "text-[#5347CE]",
      deltaColor: "text-[#5347CE]",
    },
    default: {
      bg: "bg-gray-50 dark:bg-gray-800/50",
      iconBg: "bg-gray-100 dark:bg-gray-800",
      iconColor: "text-gray-600 dark:text-gray-400",
      deltaColor: "text-gray-600 dark:text-gray-400",
    },
  };

  const activeStyle = styles[tone] || styles.default;

  // Determine trend icon based on delta string
  const isPositive = delta?.startsWith("+");
  const isNegative = delta?.startsWith("-");
  const TrendIcon = isPositive ? ArrowUp : isNegative ? ArrowDown : Minus;

  return (
    <Card className="relative overflow-hidden border border-white/50 dark:border-white/20 backdrop-blur-2xl bg-white/40 dark:bg-gray-900/40 transition-all duration-300 hover:scale-[1.02] group shadow-none hover:shadow-none">
      {/* Glass overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/10 dark:to-transparent opacity-60 pointer-events-none" />

      {/* Background Glow */}
      <div
        className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-30 transition-opacity duration-500 ${activeStyle.bg.replace("bg-", "bg-")}`}
      />

      <CardContent className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          {/* Icon with glass effect */}
          <div
            className={`relative p-3 rounded-2xl ${activeStyle.iconBg} backdrop-blur-md transition-transform group-hover:scale-110 duration-200 border border-white/30`}
          >
            {Icon && <Icon className={`h-6 w-6 ${activeStyle.iconColor}`} />}
          </div>

          {/* Trend Indicator */}
          {delta && (
            <div
              className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-lg border border-white/30 ${activeStyle.bg} ${activeStyle.deltaColor}`}
            >
              <TrendIcon className="h-3 w-3" />
              <span>{delta}</span>
            </div>
          )}
        </div>

        {/* Value and Title */}
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {value}
          </h3>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
