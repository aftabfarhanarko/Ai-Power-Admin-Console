import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  TrendingUp,
  Package,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const InventoryStats = ({ stats }) => {
  const { t } = useTranslation();

  const cards = useMemo(() => {
    const productGrowth = stats?.productGrowth ?? "0.0";
    const growthUp = parseFloat(productGrowth) >= 0;

    return [
      {
        title: t("inventory.totalProducts"),
        value: stats?.totalItems ?? 0,
        icon: Package,
        color: "text-indigo-600",
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        trend: `${productGrowth}%`,
        trendUp: growthUp,
        waveColor: "#6366f1",
      },
      {
        title: t("inventory.totalInventoryValue"),
        value: stats?.totalValueFormatted ?? "$0.00",
        icon: TrendingUp,
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        trend: "+12.5%",
        trendUp: true,
        waveColor: "#10b981",
      },
      {
        title: t("inventory.lowStockItems"),
        value: stats?.lowStock ?? 0,
        icon: AlertTriangle,
        color: "text-amber-600",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        trend: (stats?.lowStock ?? 0) > 0 ? "+2.4%" : "0.0%",
        trendUp: true,
        waveColor: "#f59e0b",
      },
      {
        title: t("inventory.outOfStock"),
        value: stats?.outOfStock ?? 0,
        icon: XCircle,
        color: "text-red-600",
        bg: "bg-red-50 dark:bg-red-900/20",
        trend: (stats?.outOfStock ?? 0) > 0 ? "+4.1%" : "0.0%",
        trendUp: false,
        waveColor: "#ef4444",
      },
    ];
  }, [stats, t]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {cards.map((stat, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover={{ y: -5 }}
          className="relative bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {stat.title}
              </span>
            </div>

            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              {stat.value}
            </h3>

            <div className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1 text-xs font-bold ${
                  stat.trendUp !== false
                    ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                    : "text-red-600 bg-red-50 dark:bg-red-900/20"
                } px-2 py-1 rounded-full`}
              >
                <TrendingUp
                  className={`w-3 h-3 ${stat.trendUp !== false ? "" : "rotate-180"}`}
                />
                {stat.trend}
              </span>
              <span className="text-xs text-slate-400">{t("inventory.vsLastMonth")}</span>
            </div>
          </div>

          <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:opacity-20 transition-opacity duration-500 scale-150">
            <svg
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
              width="140"
              height="140"
            >
              <path
                fill={stat.waveColor}
                d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,70.6,31.7C59,41.9,47.1,49.5,35.2,55.9C23.3,62.3,11.4,67.6,-1.3,69.8C-14,72,-28.3,71.2,-41.2,65.1C-54.1,59,-65.6,47.7,-73.8,34.4C-82,21.1,-86.9,5.8,-84.6,-8.7C-82.3,-23.2,-72.8,-36.9,-61.4,-47.2C-50,-57.5,-36.7,-64.4,-23.4,-72.2C-10.1,-80,3.2,-88.7,17.2,-91.7C31.2,-94.7,46,-92,44.7,-76.4Z"
                transform="translate(100 100)"
              />
            </svg>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default InventoryStats;

