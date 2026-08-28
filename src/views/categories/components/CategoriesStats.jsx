import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const CategoriesStats = ({ stats }) => {
  const { t } = useTranslation();
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1, duration: 0.4 }}
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
                className={`
                  inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md
                  ${
                    (stat.trendColor ||
                      (stat.trendDir === "up" ? "green" : "red")) === "green"
                      ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                  }
                `}
              >
                {stat.trendDir === "up" ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {stat.trend}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {t("categories.vsLastMonth")}
              </span>
            </div>
          </div>

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
        </motion.div>
      ))}
    </div>
  );
};

export default CategoriesStats;

