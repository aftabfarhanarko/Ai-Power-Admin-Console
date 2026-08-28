import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  subMonths,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  useGetOrdersQuery,
  useRefundOrderMutation,
} from "@/features/order/orderApiSlice";
import CreditNotesPageHeader from "./components/CreditNotesPageHeader";
import CreditNotesStatsCards from "./components/CreditNotesStatsCards";
import CreditNotesFilterToolbar from "./components/CreditNotesFilterToolbar";
import CreditNotesTable from "./components/CreditNotesTable";
import CreditNotesPagination from "./components/CreditNotesPagination";
import { useCreditNotesPdfExport } from "./hooks/useCreditNotesPdfExport";

const ITEMS_PER_PAGE = 5;

const CreditNotesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);

  const { data: orders = [], isLoading } = useGetOrdersQuery({
    companyId: authUser?.companyId,
  });
  const [refundOrder] = useRefundOrderMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [currentPage, setCurrentPage] = useState(1);

  const handleRefundOrder = async (order) => {
    try {
      await refundOrder({
        id: order.id,
        params: { companyId: authUser?.companyId },
      }).unwrap();
      toast.success(t("creditNotes.orderRefundedSuccess"));
    } catch (err) {
      toast.error(err?.data?.message || t("creditNotes.orderRefundFailed"));
      console.error("Refund error:", err);
    }
  };

  const cancelledOrders =
    orders?.filter((o) => o.status?.toLowerCase() === "cancelled") || [];
  const refundedOrders =
    orders?.filter((o) => o.status?.toLowerCase() === "refunded") || [];

  const combinedItems = [
    ...cancelledOrders.map((order) => ({
      ...order,
      type: "order",
      id: order.id,
      displayId: `Order #${order.id}`,
      customer: order.customer || {
        name: order.customerName,
        email: order.customerEmail,
      },
      amount: order.totalAmount,
      date: order.createdAt,
      status: "Cancelled",
      canRefund: true,
    })),
    ...refundedOrders.map((order) => ({
      ...order,
      type: "order",
      id: order.id,
      displayId: `Order #${order.id}`,
      customer: order.customer || {
        name: order.customerName,
        email: order.customerEmail,
      },
      amount: order.totalAmount,
      date: order.createdAt,
      status: "Refunded",
      canRefund: false,
    })),
  ];

  const filteredNotes = combinedItems?.filter((item) => {
    const matchesSearch =
      item.displayId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "Pending Refund" && item.status === "Cancelled") ||
      (selectedStatus === "Refunded" && item.status === "Refunded") ||
      item.status === selectedStatus;
    let matchesDate = true;
    if (dateRange.start || dateRange.end) {
      const itemDate = new Date(item.date || item.createdAt).getTime();
      const startTime = dateRange.start
        ? new Date(dateRange.start).setHours(0, 0, 0, 0)
        : 0;
      const endTime = dateRange.end
        ? new Date(dateRange.end).setHours(23, 59, 59, 999)
        : Date.now();
      matchesDate = itemDate >= startTime && itemDate <= endTime;
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil((filteredNotes?.length || 0) / ITEMS_PER_PAGE);
  const paginatedNotes = filteredNotes?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, dateRange]);

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));
  const thisMonthCancelled = cancelledOrders.filter(
    (o) => new Date(o.createdAt) >= currentMonthStart
  );
  const lastMonthCancelled = cancelledOrders.filter((o) =>
    isWithinInterval(new Date(o.createdAt), {
      start: lastMonthStart,
      end: lastMonthEnd,
    })
  );
  const thisMonthRefunded = refundedOrders.filter(
    (o) => new Date(o.createdAt) >= currentMonthStart
  );
  const lastMonthRefunded = refundedOrders.filter((o) =>
    isWithinInterval(new Date(o.createdAt), {
      start: lastMonthStart,
      end: lastMonthEnd,
    })
  );

  const calculateTrend = (current, previous) =>
    previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;

  const pendingRefundCount = cancelledOrders.length;
  const refundedCount = refundedOrders.length;
  const totalRefundAmount = refundedOrders.reduce(
    (acc, curr) => acc + Number(curr.totalAmount || 0),
    0
  );
  const thisMonthRefundAmount = thisMonthRefunded.reduce(
    (acc, curr) => acc + Number(curr.totalAmount || 0),
    0
  );
  const lastMonthRefundAmount = lastMonthRefunded.reduce(
    (acc, curr) => acc + Number(curr.totalAmount || 0),
    0
  );

  const totalCancelledTrend = calculateTrend(
    thisMonthCancelled.length,
    lastMonthCancelled.length
  );
  const pendingRefundTrend = totalCancelledTrend;
  const refundedTrend = calculateTrend(
    thisMonthRefunded.length,
    lastMonthRefunded.length
  );
  const refundAmountTrend = calculateTrend(
    thisMonthRefundAmount,
    lastMonthRefundAmount
  );

  const stats = [
    {
      label: t("creditNotes.allCancelledOrders"),
      value: cancelledOrders.length,
      trend: `${totalCancelledTrend > 0 ? "+" : ""}${totalCancelledTrend.toFixed(1)}%`,
      trendDir: totalCancelledTrend >= 0 ? "up" : "down",
      icon: "XCircle",
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-900/20",
      wave: "text-red-500",
    },
    {
      label: t("creditNotes.pendingRefund"),
      value: pendingRefundCount,
      trend: `${pendingRefundTrend > 0 ? "+" : ""}${pendingRefundTrend.toFixed(1)}%`,
      trendDir: pendingRefundTrend >= 0 ? "up" : "down",
      icon: "Clock",
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      wave: "text-orange-500",
    },
    {
      label: t("creditNotes.successfullyRefunded"),
      value: refundedCount,
      trend: `${refundedTrend > 0 ? "+" : ""}${refundedTrend.toFixed(1)}%`,
      trendDir: refundedTrend >= 0 ? "up" : "down",
      icon: "CheckCircle2",
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-900/20",
      wave: "text-green-500",
    },
    {
      label: t("creditNotes.totalRefundAmount"),
      value: `$${totalRefundAmount.toLocaleString()}`,
      trend: `${refundAmountTrend > 0 ? "+" : ""}${refundAmountTrend.toFixed(1)}%`,
      trendDir: refundAmountTrend >= 0 ? "up" : "down",
      icon: "CreditCard",
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      wave: "text-purple-500",
    },
  ];

  const { exportToPDF } = useCreditNotesPdfExport({
    filteredNotes,
    paginatedNotes,
    currentPage,
    totalPages,
    searchTerm,
    selectedStatus,
    dateRange,
    cancelledOrdersCount: cancelledOrders.length,
    pendingRefundCount,
    refundedCount,
    totalRefundAmount,
  });

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
      <CreditNotesPageHeader
        onExportCurrentView={() => exportToPDF(false)}
        onExportAllRecords={() => exportToPDF(true)}
        currentPageRecordCount={paginatedNotes?.length || 0}
        allFilteredRecordCount={filteredNotes?.length || 0}
      />

      <CreditNotesStatsCards stats={stats} />

      <div className="bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
        <CreditNotesFilterToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        <CreditNotesTable
          isLoading={isLoading}
          paginatedNotes={paginatedNotes}
          onViewDetails={(note) => navigate(`/credit-notes/${note.id}`)}
          onRefundOrder={handleRefundOrder}
          onClearSearch={() => setSearchTerm("")}
        />

        <CreditNotesPagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={filteredNotes?.length || 0}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default CreditNotesPage;
