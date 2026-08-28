import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetReturnRequestsQuery,
  useCreateReturnRequestMutation,
  useGetReturnRequestQuery,
} from "@/features/steadfast/steadfastApiSlice";
import toast from "react-hot-toast";
import TextField from "@/components/input/TextField";
import ReusableTable from "@/components/table/reusable-table";
import {
  Plus,
  Eye,
  RotateCcw,
  X,
  FileText,
  Barcode,
  PackageSearch,
  RefreshCcw,
  Download,
  Search,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  format,
  subDays,
  isWithinInterval,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import { motion } from "framer-motion";

const ReturnRequests = () => {
  const { t } = useTranslation();
  const { data, isLoading, refetch } = useGetReturnRequestsQuery();
  const returnRequests = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.return_requests)
        ? data.return_requests
        : [];

  const [createReturnRequest, { isLoading: isCreating }] =
    useCreateReturnRequestMutation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    consignment_id: "",
    invoice: "",
    tracking_code: "",
    reason: "",
  });
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });

  const { data: selectedRequest } = useGetReturnRequestQuery(
    selectedRequestId,
    {
      skip: !selectedRequestId,
    },
  );

  // Stats Calculation with Trends
  const statsData = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Helper to get counts for a date range
    const getCounts = (start, end) => {
      const periodRequests = returnRequests.filter((r) => {
        if (!r.created_at) return false;
        const date = new Date(r.created_at);
        return isWithinInterval(date, { start, end });
      });

      return {
        total: periodRequests.length,
        pending: periodRequests.filter((r) => r.status === "pending").length,
        completed: periodRequests.filter((r) =>
          ["completed", "approved"].includes(r.status),
        ).length,
      };
    };

    const current = getCounts(currentMonthStart, currentMonthEnd);
    const last = getCounts(lastMonthStart, lastMonthEnd);

    const calcTrend = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    // Global Totals (All Time)
    const totalAllTime = returnRequests.length;
    const pendingAllTime = returnRequests.filter(
      (r) => r.status === "pending",
    ).length;
    const completedAllTime = returnRequests.filter((r) =>
      ["completed", "approved"].includes(r.status),
    ).length;

    return [
      {
        label: t("steadfast.totalRequests", "Total Requests"),
        value: totalAllTime,
        icon: RotateCcw,
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        color: "text-indigo-600 dark:text-indigo-400",
        trend: `${calcTrend(current.total, last.total)}%`,
        trendDir: current.total >= last.total ? "up" : "down",
        wave: "text-indigo-500",
      },
      {
        label: t("steadfast.pendingRequests", "Pending"),
        value: pendingAllTime,
        icon: Clock,
        bg: "bg-orange-50 dark:bg-orange-900/20",
        color: "text-orange-600 dark:text-orange-400",
        trend: `${calcTrend(current.pending, last.pending)}%`,
        trendDir: current.pending >= last.pending ? "up" : "down",
        wave: "text-orange-500",
      },
      {
        label: t("steadfast.completedRequests", "Completed"),
        value: completedAllTime,
        icon: CheckCircle2,
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        color: "text-emerald-600 dark:text-emerald-400",
        trend: `${calcTrend(current.completed, last.completed)}%`,
        trendDir: current.completed >= last.completed ? "up" : "down",
        wave: "text-emerald-500",
      },
    ];
  }, [returnRequests, t]);

  // Filtered Data
  const filteredRequests = useMemo(() => {
    return returnRequests.filter((request) => {
      // Date Filter
      const requestDate = request.created_at
        ? new Date(request.created_at)
        : null;
      const isDateInRange = requestDate
        ? isWithinInterval(requestDate, {
            start: startOfDay(new Date(dateRange.start)),
            end: endOfDay(new Date(dateRange.end)),
          })
        : true;

      // Search Filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (request.consignment_id?.toString() || "")
          .toLowerCase()
          .includes(searchLower) ||
        (request.invoice?.toString() || "")
          .toLowerCase()
          .includes(searchLower) ||
        (request.tracking_code?.toString() || "")
          .toLowerCase()
          .includes(searchLower) ||
        (request.id?.toString() || "").includes(searchLower);

      return isDateInRange && matchesSearch;
    });
  }, [returnRequests, searchTerm, dateRange]);

  const handleCreate = async (e) => {
    e.preventDefault();

    const identifier =
      formData.consignment_id || formData.invoice || formData.tracking_code;
    if (!identifier) {
      toast.error(
        t(
          "steadfast.provideIdentifier",
          "Please provide Consignment ID, Invoice, or Tracking Code",
        ),
      );
      return;
    }

    try {
      const body = {
        ...(formData.consignment_id && {
          consignment_id: formData.consignment_id,
        }),
        ...(formData.invoice && { invoice: formData.invoice }),
        ...(formData.tracking_code && {
          tracking_code: formData.tracking_code,
        }),
        ...(formData.reason && { reason: formData.reason }),
      };

      await createReturnRequest(body).unwrap();
      toast.success(
        t(
          "steadfast.returnRequestCreated",
          "Return request created successfully",
        ),
      );
      setShowCreateForm(false);
      setFormData({
        consignment_id: "",
        invoice: "",
        tracking_code: "",
        reason: "",
      });
      refetch();
    } catch (error) {
      const errorMessage =
        error?.data?.message ||
        t("steadfast.returnRequestFailed", "Failed to create return request");
      const errorDetails = error?.data?.details;

      if (error?.status === 429) {
        toast.error(
          `${errorMessage}${errorDetails ? ` - ${errorDetails}` : ""}`,
          { duration: 6000 },
        );
      } else if (error?.status === 401) {
        toast.error(
          `${errorMessage}${errorDetails ? ` - ${errorDetails}` : ""}`,
          { duration: 6000 },
        );
      } else {
        toast.error(errorMessage);
      }
      console.error("Create return request error:", error);
    }
  };

  const handleExport = () => {
    if (filteredRequests.length === 0) {
      toast.error(t("steadfast.noDataToExport", "No data to export"));
      return;
    }

    const headers = [
      "ID",
      "Consignment ID",
      "Invoice",
      "Tracking Code",
      "Status",
      "Reason",
      "Created At",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredRequests.map((r) =>
        [
          r.id,
          r.consignment_id || "",
          r.invoice || "",
          r.tracking_code || "",
          r.status || "pending",
          `"${(r.reason || "").replace(/"/g, '""')}"`,
          r.created_at || "",
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `return_requests_${format(new Date(), "yyyy-MM-dd")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusColors = {
    pending:
      "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900",
    approved:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900",
    processing:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900",
    completed:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
    cancelled:
      "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900",
  };

  const headers = [
    { header: t("steadfast.id", "ID"), field: "id" },
    {
      header: t("steadfast.consignmentIdLabel", "Consignment ID"),
      field: "consignment_id",
    },
    { header: t("steadfast.reason", "Reason"), field: "reason" },
    { header: t("steadfast.status", "Status"), field: "status" },
    { header: t("steadfast.createdAt", "Created At"), field: "created_at" },
    { header: t("common.actions", "Actions"), field: "actions" },
  ];

  const tableData = filteredRequests.map((request) => ({
    id: <span className="font-mono text-xs">{request.id}</span>,
    consignment_id: request.consignment_id || (
      <span className="text-gray-400">-</span>
    ),
    reason: (
      <span className="max-w-[200px] truncate block" title={request.reason}>
        {request.reason || "-"}
      </span>
    ),
    status: (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
          statusColors[request.status] || statusColors.pending
        }`}
      >
        {request.status?.toUpperCase()}
      </span>
    ),
    created_at: request.created_at
      ? format(new Date(request.created_at), "MMM dd, yyyy HH:mm")
      : "-",
    actions: (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSelectedRequestId(request.id)}
        className="h-8 w-8 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg"
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
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsData.map((stat, idx) => (
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
                    stat.trendDir === "up"
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
                  vs last month
                </span>
              </div>
            </div>

            {/* Wave Graphic */}
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

      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-orange-500" />
            {t("steadfast.returnRequestsTitle", "Return Requests")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage return requests for your shipments
          </p>
        </div>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            {t("steadfast.createReturnRequest", "New Request")}
          </button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div
          className={`${cardClass} animate-in slide-in-from-top-4 duration-300`}
        >
          <div className="flex items-center justify-between mb-6">
            <h4 className={titleClass}>
              <Plus className="w-5 h-5 text-orange-500" />
              {t("steadfast.createReturnRequest", "Create Return Request")}
            </h4>
            <button
              onClick={() => setShowCreateForm(false)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TextField
                label={t("steadfast.consignmentIdLabel", "Consignment ID")}
                name="consignment_id"
                value={formData.consignment_id}
                onChange={(e) =>
                  setFormData({ ...formData, consignment_id: e.target.value })
                }
                placeholder="1424107"
                icon={<PackageSearch className="w-4 h-4" />}
              />
              <TextField
                label={t("steadfast.invoiceIdLabel", "Invoice ID")}
                name="invoice"
                value={formData.invoice}
                onChange={(e) =>
                  setFormData({ ...formData, invoice: e.target.value })
                }
                placeholder="INV-001"
                icon={<FileText className="w-4 h-4" />}
              />
              <TextField
                label={t("steadfast.trackingCodeLabel", "Tracking Code")}
                name="tracking_code"
                value={formData.tracking_code}
                onChange={(e) =>
                  setFormData({ ...formData, tracking_code: e.target.value })
                }
                placeholder="15BAEB8A"
                icon={<Barcode className="w-4 h-4" />}
              />
            </div>

            <TextField
              label={t("steadfast.reasonOptional", "Reason (Optional)")}
              name="reason"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              placeholder={t(
                "steadfast.returnReasonPlaceholder",
                "Enter reason for return...",
              )}
              multiline
              rows={3}
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {t("common.cancel", "Cancel")}
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("steadfast.creating", "Creating...")}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {t("steadfast.createRequest", "Create Request")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toolbar & Table */}
      <div className={cardClass}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t(
                "steadfast.searchRequests",
                "Search by ID, Invoice, Tracking...",
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#111418] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
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

            <button
              onClick={() => refetch()}
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#111418] border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
              title="Refresh"
            >
              <RefreshCcw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>

            <button
              onClick={handleExport}
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#111418] border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <ReusableTable
          data={tableData}
          headers={headers}
          total={filteredRequests.length}
          isLoading={isLoading}
          searchable={false}
          py="py-3"
        />
      </div>

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className={`${cardClass} w-full max-w-lg max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in duration-200 p-0 overflow-hidden`}
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#1a1f26] z-10">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                {t("steadfast.returnRequestDetails", "Request Details")}
              </h4>
              <button
                onClick={() => setSelectedRequestId(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-xl border ${statusColors[selectedRequest.status] || statusColors.pending} flex items-start gap-3`}
              >
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm uppercase mb-1">
                    {selectedRequest.status}
                  </h5>
                  <p className="text-xs opacity-90">
                    Request ID:{" "}
                    <span className="font-mono">{selectedRequest.id}</span>
                  </p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-[#111418] rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 mb-1">
                    {t("steadfast.consignmentIdLabel", "Consignment ID")}
                  </p>
                  <p className="font-mono font-medium text-gray-900 dark:text-white">
                    {selectedRequest.consignment_id || "-"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-[#111418] rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 mb-1">
                    {t("steadfast.invoiceIdLabel", "Invoice ID")}
                  </p>
                  <p className="font-mono font-medium text-gray-900 dark:text-white">
                    {selectedRequest.invoice || "-"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-[#111418] rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 mb-1">
                    {t("steadfast.trackingCodeLabel", "Tracking Code")}
                  </p>
                  <p className="font-mono font-medium text-gray-900 dark:text-white">
                    {selectedRequest.tracking_code || "-"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-[#111418] rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 mb-1">
                    {t("steadfast.createdAt", "Created At")}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {selectedRequest.created_at
                      ? format(new Date(selectedRequest.created_at), "PPP p")
                      : "-"}
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div className="p-4 bg-gray-50 dark:bg-[#111418] rounded-xl border border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 mb-2">
                  {t("steadfast.reason", "Reason")}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "{selectedRequest.reason || "No reason provided"}"
                </p>
              </div>

              {/* Raw Data (Collapsible) */}
              <div className="mt-4">
                <details className="group">
                  <summary className="cursor-pointer text-xs text-gray-400 hover:text-indigo-500 flex items-center gap-1 select-none transition-colors">
                    <span>Show Raw Data</span>
                  </summary>
                  <div className="mt-2 p-4 bg-gray-50 dark:bg-[#111418] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <pre className="text-[10px] font-mono text-gray-500 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {JSON.stringify(selectedRequest, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnRequests;
