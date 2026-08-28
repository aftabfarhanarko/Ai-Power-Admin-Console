import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import SkeletonLoader from "./SkeletonLoader";

export default function RecentTransactionsCard({
  data = [],
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  isLoading,
}) {
  const { t } = useTranslation();
  const start = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(start, start + itemsPerPage);

  const todayTransactions = currentData.filter((tx) => tx.date === "Today");
  const yesterdayTransactions = currentData.filter((tx) => tx.date === "Yesterday");
  const otherTransactions = currentData.filter(
    (tx) => tx.date !== "Today" && tx.date !== "Yesterday",
  );

  const renderTransaction = (transaction) => (
    <div
      key={transaction.id}
      className="flex items-center justify-between group cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
            transaction.icon === "P" ? "bg-[#003087]" : "bg-[#635BFF]"
          }`}
        >
          {transaction.icon}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-nexus-primary transition-colors">
            {transaction.name}
          </p>
          <p className="text-xs text-gray-400">{transaction.inv}</p>
        </div>
      </div>
      <div
        className={`px-2 py-1 rounded text-sm font-bold ${
          transaction.type === "success"
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
        }`}
      >
        {transaction.amount}
      </div>
    </div>
  );

  return (
    <Card className="border-none shadow-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          {t("dashboard.recentTransactions")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <SkeletonLoader rows={5} />
        ) : (
          <div className="flex flex-col h-full">
            <div className="space-y-6">
              {todayTransactions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-3">
                    {t("dashboard.today")}
                  </h4>
                  <div className="space-y-4">{todayTransactions.map(renderTransaction)}</div>
                </div>
              )}
              {yesterdayTransactions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-3">
                    {t("dashboard.yesterday")}
                  </h4>
                  <div className="space-y-4">{yesterdayTransactions.map(renderTransaction)}</div>
                </div>
              )}
              {otherTransactions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-3">
                    {t("dashboard.earlier")}
                  </h4>
                  <div className="space-y-4">{otherTransactions.map(renderTransaction)}</div>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between sm:justify-end gap-4 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span>{t("table.itemsPerPage")}</span>
                <select className="bg-transparent border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 focus:outline-none" disabled>
                  <option>{itemsPerPage}</option>
                </select>
              </div>
              <span>
                {start + 1}-{Math.min(start + itemsPerPage, data.length)}{" "}
                {t("table.of")} {data.length} {t("table.items")}
              </span>
              <div className="flex items-center gap-1">
                <button
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
                  onClick={() => onPageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
