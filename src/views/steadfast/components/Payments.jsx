import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  useGetPaymentsQuery,
  useGetPaymentQuery,
} from "@/features/steadfast/steadfastApiSlice";
import ReusableTable from "@/components/table/reusable-table";
import { 
  Eye, 
  CreditCard, 
  X, 
  Clock ,
  FileText, 
  TrendingUp, 
  Calendar, 
  Download, 
  DollarSign, 
  Filter,
  RefreshCcw,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, subDays, startOfMonth, subMonths, endOfMonth } from "date-fns";
import toast from "react-hot-toast";

const Payments = () => {
  const { t } = useTranslation();
  const { data: payments = [], isLoading, refetch } = useGetPaymentsQuery();
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  // Filter States
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });

  const { data: paymentDetails, isLoading: isLoadingDetails } =
    useGetPaymentQuery(selectedPaymentId, {
      skip: !selectedPaymentId,
    });

  // Filter Logic
  const filteredPayments = useMemo(() => {
    if (!Array.isArray(payments)) return [];

    return payments.filter((payment) => {
      if (!payment.date && !payment.created_at) return true;

      const paymentDate = parseISO(payment.date || payment.created_at);
      const start = startOfDay(parseISO(dateRange.start));
      const end = endOfDay(parseISO(dateRange.end));

      return isWithinInterval(paymentDate, { start, end });
    });
  }, [payments, dateRange]);

  // Stats Calculation
  const stats = useMemo(() => {
    const safePayments = Array.isArray(payments) ? payments : [];

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const thisMonthPayments = safePayments.filter(p => {
        if (!p.date && !p.created_at) return false;
        const date = parseISO(p.date || p.created_at);
        return date >= currentMonthStart;
    });

    const lastMonthPayments = safePayments.filter(p => {
        if (!p.date && !p.created_at) return false;
        const date = parseISO(p.date || p.created_at);
        return isWithinInterval(date, { start: lastMonthStart, end: lastMonthEnd });
    });

    const calculateTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // 1. Total Received
    const totalAmount = safePayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const thisMonthAmount = thisMonthPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const lastMonthAmount = lastMonthPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const amountTrend = calculateTrend(thisMonthAmount, lastMonthAmount);

    // 2. Total Transactions
    const totalCount = safePayments.length;
    const countTrend = calculateTrend(thisMonthPayments.length, lastMonthPayments.length);

    // 3. Pending Payments (assuming status exists)
    const pendingPayments = safePayments.filter(p => (p.status || "").toLowerCase() === "pending");
    const pendingCount = pendingPayments.length;
    const thisMonthPending = thisMonthPayments.filter(p => (p.status || "").toLowerCase() === "pending").length;
    const lastMonthPending = lastMonthPayments.filter(p => (p.status || "").toLowerCase() === "pending").length;
    const pendingTrend = calculateTrend(thisMonthPending, lastMonthPending);

    // 4. Average Transaction
    const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;
    const thisMonthAvg = thisMonthPayments.length > 0 ? thisMonthAmount / thisMonthPayments.length : 0;
    const lastMonthAvg = lastMonthPayments.length > 0 ? lastMonthAmount / lastMonthPayments.length : 0;
    const avgTrend = calculateTrend(thisMonthAvg, lastMonthAvg);

    return [
      {
        label: t("steadfast.totalReceived", "Total Received"),
        value: `৳${totalAmount.toLocaleString("en-BD")}`,
        trend: `${amountTrend > 0 ? "+" : ""}${amountTrend.toFixed(1)}%`,
        trendDir: amountTrend >= 0 ? "up" : "down",
        icon: DollarSign,
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        wave: "text-emerald-500",
      },
      {
        label: t("steadfast.totalTransactions", "Total Transactions"),
        value: totalCount,
        trend: `${countTrend > 0 ? "+" : ""}${countTrend.toFixed(1)}%`,
        trendDir: countTrend >= 0 ? "up" : "down",
        icon: CreditCard,
        color: "text-indigo-600",
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        wave: "text-indigo-500",
      },
      {
        label: t("steadfast.pendingPayments", "Pending Payments"),
        value: pendingCount,
        trend: `${pendingTrend > 0 ? "+" : ""}${pendingTrend.toFixed(1)}%`,
        trendDir: pendingTrend >= 0 ? "up" : "down",
        icon: Clock,
        color: "text-orange-600",
        bg: "bg-orange-50 dark:bg-orange-900/20",
        wave: "text-orange-500",
      },
      {
        label: t("steadfast.avgTransaction", "Avg. Transaction"),
        value: `৳${avgAmount.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`,
        trend: `${avgTrend > 0 ? "+" : ""}${avgTrend.toFixed(1)}%`,
        trendDir: avgTrend >= 0 ? "up" : "down",
        icon: TrendingUp,
        color: "text-blue-600",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        wave: "text-blue-500",
      }
    ];
  }, [payments, t]);

  // Export Function
  const handleExport = () => {
    if (filteredPayments.length === 0) {
      toast.error(t("steadfast.noDataToExport", "No data to export"));
      return;
    }

    const headers = ["Payment ID", "Amount", "Date", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredPayments.map((p) =>
        [
          p.id || p.payment_id,
          p.amount,
          p.date || p.created_at,
          p.status || "Paid",
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `payments_export_${format(new Date(), "yyyy-MM-dd")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const headers = [
    { header: t("steadfast.paymentId", "Payment ID"), field: "id" },
    { header: t("steadfast.amount", "Amount"), field: "amount" },
    { header: t("steadfast.date", "Date"), field: "date" },
    { header: t("common.status", "Status"), field: "status" },
    { header: t("common.actions", "Actions"), field: "actions" },
  ];

  const tableData = filteredPayments.map((payment) => ({
    id: (
      <span className="font-mono font-medium text-gray-700 dark:text-gray-300">
        #{payment.id || payment.payment_id || "-"}
      </span>
    ),
    amount: (
      <span className="font-bold text-emerald-600 dark:text-emerald-400">
        ৳{Number(payment.amount).toLocaleString("en-BD")}
      </span>
    ),
    date: payment.date
      ? format(parseISO(payment.date), "dd MMM yyyy, hh:mm a")
      : payment.created_at
        ? format(parseISO(payment.created_at), "dd MMM yyyy, hh:mm a")
        : "-",
    status: (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 w-fit">
        <CheckCircle2 className="w-3 h-3" />
        {t("steadfast.paid", "Paid")}
      </span>
    ),
    actions: (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSelectedPaymentId(payment.id || payment.payment_id)}
        className="h-8 w-8 p-0 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 dark:text-indigo-400 transition-colors"
      >
        <Eye className="h-4 w-4" />
      </Button>
    ),
  }));

  const cardClass =
    "bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 shadow-sm";
  const titleClass =
    "text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2";

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-indigo-500" />
            {t("steadfast.paymentsTitle", "Payments History")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-9">
            {t(
              "steadfast.paymentsDesc",
              "View and manage your payment transactions and invoices",
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={refetch}
            variant="outline"
            size="sm"
            className="rounded-xl h-10 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <RefreshCcw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            {t("common.refresh", "Refresh")}
          </Button>
          <Button
            onClick={handleExport}
            className="rounded-xl h-10 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20"
          >
            <Download className="w-4 h-4 mr-2" />
            {t("common.export", "Export CSV")}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
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
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
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
                <span className={`
                  inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md
                  ${stat.trendDir === "up" 
                    ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" 
                    : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"}
                `}>
                  {stat.trendDir === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.trend}
                </span>
                <span className="text-xs text-gray-400 font-medium">{t("common.vsLastMonth", "vs last month")}</span>
              </div>
            </div>

            {/* Wave Graphic */}
            <div className={`absolute bottom-0 right-0 w-24 h-16 opacity-20 ${stat.wave}`}>
              <svg viewBox="0 0 100 60" fill="currentColor" preserveAspectRatio="none" className="w-full h-full">
                <path d="M0 60 C 20 60, 20 20, 50 20 C 80 20, 80 50, 100 50 L 100 60 Z" />
              </svg>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Card */}
      <div className={cardClass}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h4 className={titleClass}>
            <FileText className="w-5 h-5 text-indigo-500" />
            {t("steadfast.transactionHistory", "Transaction History")}
          </h4>

          {/* Date Filters */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#111418] p-1 rounded-xl border border-gray-200 dark:border-gray-800">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="bg-transparent border-none text-sm text-gray-600 dark:text-gray-300 focus:ring-0 px-3 py-1.5"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="bg-transparent border-none text-sm text-gray-600 dark:text-gray-300 focus:ring-0 px-3 py-1.5"
            />
          </div>
        </div>

        <ReusableTable
          data={tableData}
          headers={headers}
          total={filteredPayments.length}
          isLoading={isLoading}
          searchPlaceholder={t(
            "steadfast.searchPaymentId",
            "Search Payment ID...",
          )}
          py="py-4"
        />
      </div>

      {/* Payment Details Modal */}
      {selectedPaymentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`${cardClass} w-full max-w-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200 p-0 overflow-hidden`}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-[#111418]/50">
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  {t("steadfast.paymentDetails", "Payment Details")}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  ID:{" "}
                  <span className="font-mono text-gray-700 dark:text-gray-300">
                    {selectedPaymentId}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedPaymentId(null)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingDetails ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-gray-500 animate-pulse">
                    {t("common.loading", "Loading details...")}
                  </p>
                </div>
              ) : paymentDetails ? (
                <div className="space-y-6">
                  {/* Summary Section */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800">
                      <p className="text-xs text-gray-500 dark:text-indigo-300 mb-1">
                        {t("steadfast.amount", "Amount")}
                      </p>
                      <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        ৳{Number(paymentDetails.amount || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 mb-1">
                        {t("steadfast.date", "Date")}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {paymentDetails.date
                          ? format(parseISO(paymentDetails.date), "dd MMM yyyy")
                          : "-"}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 mb-1">
                        {t("common.status", "Status")}
                      </p>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Paid
                      </span>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 mb-1">
                        {t("steadfast.consignments", "Consignments")}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {paymentDetails.consignments?.length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Consignments Table (if available) */}
                  {paymentDetails.consignments &&
                    paymentDetails.consignments.length > 0 && (
                      <div>
                        <h5 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-gray-500" />
                          {t(
                            "steadfast.includedConsignments",
                            "Included Consignments",
                          )}
                        </h5>
                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500">
                              <tr>
                                <th className="px-4 py-3 font-medium">
                                  Consignment ID
                                </th>
                                <th className="px-4 py-3 font-medium">
                                  Tracking Code
                                </th>
                                <th className="px-4 py-3 font-medium text-right">
                                  COD Amount
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                              {paymentDetails.consignments.map((c, idx) => (
                                <tr
                                  key={idx}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                >
                                  <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-300">
                                    {c.consignment_id || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                    {c.tracking_code || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                                    {c.cod_amount ? `৳${c.cod_amount}` : "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  {/* Raw Data (Collapsible/Optional) */}
                  <div className="mt-4">
                    <details className="group">
                      <summary className="cursor-pointer text-xs text-gray-400 hover:text-indigo-500 flex items-center gap-1 select-none">
                        <span>Show Raw Data</span>
                      </summary>
                      <div className="mt-2 p-4 bg-gray-50 dark:bg-[#111418] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <pre className="text-[10px] font-mono text-gray-500 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                          {JSON.stringify(paymentDetails, null, 2)}
                        </pre>
                      </div>
                    </details>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {t("common.noData", "No details available")}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111418]/50 flex justify-end">
              <Button
                onClick={() => setSelectedPaymentId(null)}
                variant="secondary"
                className="rounded-xl"
              >
                {t("common.close", "Close")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
