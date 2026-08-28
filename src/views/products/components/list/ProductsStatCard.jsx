import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

/**
 * Single stat card for products dashboard (value, trend, icon).
 * @param {Object} stat - { label, value, trend, trendDir, trendColor?, icon, color, bg, wave }
 * @param {number} index - Optional delay index for animation
 */
export default function ProductsStatCard({ stat, index = 0 }) {
  const trendColorClass =
    (stat.trendColor ?? (stat.trendDir === "up" ? "green" : "red")) === "green"
      ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
      : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}
        >
          <stat.icon className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          {stat.label}
        </p>
      </div>

      <div className="relative z-10">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          {stat.value}
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md ${trendColorClass}`}
          >
            {stat.trendDir === "up" ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {stat.trend}
          </span>
          <span className="text-xs text-gray-400 font-medium">
            vs last month
          </span>
        </div>
      </div>

      {stat.wave && (
        <div
          className={`absolute bottom-0 right-0 w-24 h-16 opacity-20 ${stat.wave}`}
        >
          <svg
            viewBox="0 0 100 60"
            fill="currentColor"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path d="M0 60 C 20 60, 20 20, 50 20 C 80 20, 80 50, 100 50 L 100 60 Z" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}
