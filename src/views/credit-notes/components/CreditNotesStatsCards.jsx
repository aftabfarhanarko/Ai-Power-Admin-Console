import React from "react";
import { useTranslation } from "react-i18next";
import {
  XCircle,
  Clock,
  CheckCircle2,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

/**
 * Stats cards grid for credit notes: cancelled, pending refund, refunded, total amount.
 * Target ~150 lines per component.
 */
const CreditNotesStatsCards = ({ stats }) => {
  const { t } = useTranslation();

  const iconMap = {
    XCircle,
    Clock,
    CheckCircle2,
    CreditCard,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => {
        const Icon = typeof stat.icon === "string" ? iconMap[stat.icon] : stat.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-[#1a1f26] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}
              >
                {Icon && <Icon className="w-6 h-6" />}
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
                    stat.trendDir === "up"
                      ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                      : stat.trendDir === "down"
                        ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                        : "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }
                `}
                >
                  {stat.trendDir === "up" && (
                    <ArrowUpRight className="w-3 h-3" />
                  )}
                  {stat.trendDir === "down" && (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {stat.trend}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {t("creditNotes.vsLastMonth")}
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
          </div>
        );
      })}
    </div>
  );
};

export default CreditNotesStatsCards;
