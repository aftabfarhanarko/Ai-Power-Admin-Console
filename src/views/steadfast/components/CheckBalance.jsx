import React from "react";
import { useTranslation } from "react-i18next";
import { useGetBalanceQuery } from "@/features/steadfast/steadfastApiSlice";
import { DollarSign, RefreshCw, Wallet, CreditCard } from "lucide-react";

const CheckBalance = () => {
  const { t } = useTranslation();
  const { data, isLoading, refetch } = useGetBalanceQuery();

  const cardClass = "bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800 p-8 shadow-sm";
  const titleClass = "text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2";

  return (
    <div className="max-w-3xl mx-auto">
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-8">
          <h3 className={titleClass}>
            <Wallet className="w-6 h-6 text-emerald-500" />
            {t("steadfast.accountBalance", "Account Balance")}
          </h3>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
            title={t("steadfast.refresh", "Refresh")}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Balance Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[24px] p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <DollarSign className="w-32 h-32 transform translate-x-8 -translate-y-8" />
            </div>
            
            <div className="relative z-10">
              <p className="text-emerald-100 font-medium mb-2">{t("steadfast.currentBalance", "Current Balance")}</p>
              <h2 className="text-4xl font-bold mb-4 tracking-tight">
                {isLoading ? (
                  <span className="opacity-50 text-2xl">Loading...</span>
                ) : (
                  `৳${data?.current_balance?.toLocaleString("en-BD") || "0.00"}`
                )}
              </h2>
              <div className="flex items-center gap-2 text-sm text-emerald-100 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                <CreditCard className="w-4 h-4" />
                <span>Steadfast Account</span>
              </div>
            </div>
          </div>

          {/* Info/Stats Card */}
          <div className="bg-gray-50 dark:bg-[#111418] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 flex flex-col justify-center">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("steadfast.lastUpdated", "Last Updated")}</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {new Date().toLocaleString()}
                </p>
              </div>
              <div className="h-px bg-gray-200 dark:bg-gray-700/50" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("steadfast.status", "Status")}</p>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-base font-medium text-emerald-600 dark:text-emerald-400">{t("steadfast.active", "Active")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckBalance;
