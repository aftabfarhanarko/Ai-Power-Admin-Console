import React, { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  startOfMonth,
  subMonths,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  useGetSaleInvoicesQuery,
  useDeleteSaleInvoiceMutation,
} from "@/features/invoice/saleInvoiceApiSlice";
import {
  InvoicesHeader,
  InvoicesStatsCards,
  InvoicesTabsFilters,
  InvoicesTable,
  InvoiceDeleteModal,
} from "./components";

const InvoicesPage = () => {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const { t } = useTranslation();

  const [statusFilter, setStatusFilter] = useState("All");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  const { data: apiInvoices = [], isLoading } = useGetSaleInvoicesQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId }
  );
  const [deleteSaleInvoice, { isLoading: isDeleting }] =
    useDeleteSaleInvoiceMutation();

  // Fallback mock data for demo when API returns empty
  const mockInvoices = [
    {
      id: "21",
      createdAt: "2026-02-01",
      customer: { name: "MST HASINA BEGUM" },
      status: "paid",
      totalAmount: 10,
      deliveryStatus: "N/A",
      items: 1,
      fulfillmentStatus: "fulfilled",
    },
    {
      id: "20",
      createdAt: "2026-01-31",
      customer: { name: "MST HASINA BEGUM" },
      status: "pending",
      totalAmount: 1,
      deliveryStatus: "N/A",
      items: 1,
      fulfillmentStatus: "unfulfilled",
    },
    {
      id: "19",
      createdAt: "2026-01-31",
      customer: { name: "Aftab Farhan" },
      status: "pending",
      totalAmount: 50,
      deliveryStatus: "N/A",
      items: 1,
      fulfillmentStatus: "unfulfilled",
    },
    {
      id: "18",
      createdAt: "2026-01-31",
      customer: { name: "MST HASINA BEGUM" },
      status: "paid",
      totalAmount: 1,
      deliveryStatus: "N/A",
      items: 1,
      fulfillmentStatus: "fulfilled",
    },
    {
      id: "17",
      createdAt: "2026-01-31",
      customer: { name: "MST HASINA BEGUM" },
      status: "paid",
      totalAmount: 1,
      deliveryStatus: "N/A",
      items: 1,
      fulfillmentStatus: "fulfilled",
    },
    {
      id: "16",
      createdAt: "2026-01-31",
      customer: { name: "MST HASINA BEGUM" },
      status: "paid",
      totalAmount: 1,
      deliveryStatus: "N/A",
      items: 1,
      fulfillmentStatus: "fulfilled",
    },
    {
      id: "15",
      createdAt: "2026-01-30",
      customer: { name: "MST HASINA BEGUM" },
      status: "paid",
      totalAmount: 1,
      deliveryStatus: "N/A",
      items: 1,
      fulfillmentStatus: "fulfilled",
    },
    {
      id: "14",
      createdAt: "2026-01-30",
      customer: { name: "MST HASINA BEGUM" },
      status: "paid",
      totalAmount: 1,
      deliveryStatus: "N/A",
      items: 1,
      fulfillmentStatus: "fulfilled",
    },
    {
      id: "13",
      createdAt: "2026-01-30",
      customer: { name: "MST HASINA BEGUM" },
      status: "paid",
      totalAmount: 1,
      deliveryStatus: "N/A",
      items: 1,
      fulfillmentStatus: "fulfilled",
    },
    {
      id: "12",
      createdAt: "2026-01-30",
      customer: { name: "MST HASINA BEGUM" },
      status: "paid",
      totalAmount: 1,
      deliveryStatus: "N/A",
      items: 1,
      fulfillmentStatus: "fulfilled",
    },
    {
      id: "11",
      createdAt: "2026-01-30",
      customer: { name: "MST HASINA BEGUM" },
      status: "paid",
      totalAmount: 1,
      deliveryStatus: "N/A",
      items: 1,
      fulfillmentStatus: "fulfilled",
    },
  ];

  const displayData =
    apiInvoices?.length > 0
      ? apiInvoices.map((inv) => ({
          ...inv,
          items: Array.isArray(inv.items) ? inv.items.length : inv.items ?? 1,
        }))
      : mockInvoices;

  const saleInvoicesData =
    apiInvoices?.length > 0 ? apiInvoices : mockInvoices;

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const thisMonthInvoices = saleInvoicesData.filter(
      (inv) => inv.createdAt && new Date(inv.createdAt) >= currentMonthStart,
    );

    const lastMonthInvoices = saleInvoicesData.filter(
      (inv) =>
        inv.createdAt &&
        isWithinInterval(new Date(inv.createdAt), {
          start: lastMonthStart,
          end: lastMonthEnd,
        }),
    );

    const calculateTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const total = saleInvoicesData.length;
    const totalTrend = calculateTrend(
      thisMonthInvoices.length,
      lastMonthInvoices.length,
    );

    const totalAmount = saleInvoicesData.reduce(
      (sum, inv) => sum + (Number(inv.totalAmount) || 0),
      0,
    );
    const thisMonthRevenue = thisMonthInvoices.reduce(
      (sum, inv) => sum + (Number(inv.totalAmount) || 0),
      0,
    );
    const lastMonthRevenue = lastMonthInvoices.reduce(
      (sum, inv) => sum + (Number(inv.totalAmount) || 0),
      0,
    );
    const revenueTrend = calculateTrend(thisMonthRevenue, lastMonthRevenue);

    const pendingInvoices = saleInvoicesData.filter((inv) =>
      ["draft", "pending", "sent", "partial"].includes(inv.status?.toLowerCase()),
    );
    const pendingCount = pendingInvoices.length;
    const thisMonthPending = thisMonthInvoices.filter((inv) =>
      ["pending", "unpaid", "processing"].includes(inv.status?.toLowerCase()),
    ).length;
    const lastMonthPending = lastMonthInvoices.filter((inv) =>
      ["pending", "unpaid", "processing"].includes(inv.status?.toLowerCase()),
    ).length;
    const pendingTrend = calculateTrend(thisMonthPending, lastMonthPending);

    const overdueInvoices = saleInvoicesData.filter(
      (inv) => inv.status?.toLowerCase() === "overdue",
    );
    const overdueCount = overdueInvoices.length;
    const thisMonthOverdue = thisMonthInvoices.filter(
      (inv) => inv.status?.toLowerCase() === "overdue",
    ).length;
    const lastMonthOverdue = lastMonthInvoices.filter(
      (inv) => inv.status?.toLowerCase() === "overdue",
    ).length;
    const overdueTrend = calculateTrend(thisMonthOverdue, lastMonthOverdue);

    return [
      {
        label: t("invoices.stats.totalInvoices"),
        value: total,
        trend: `${totalTrend > 0 ? "+" : ""}${totalTrend.toFixed(1)}%`,
        trendDir: totalTrend >= 0 ? "up" : "down",
        icon: FileText,
        color: "text-blue-600",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        wave: "text-blue-500",
      },
      {
        label: t("invoices.stats.totalRevenue"),
        value: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(totalAmount),
        trend: `${revenueTrend > 0 ? "+" : ""}${revenueTrend.toFixed(1)}%`,
        trendDir: revenueTrend >= 0 ? "up" : "down",
        icon: CheckCircle2,
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        wave: "text-emerald-500",
      },
      {
        label: t("invoices.stats.pendingInvoices"),
        value: pendingCount,
        trend: `${pendingTrend > 0 ? "+" : ""}${pendingTrend.toFixed(1)}%`,
        trendDir: pendingTrend >= 0 ? "up" : "down",
        icon: Clock,
        color: "text-orange-600",
        bg: "bg-orange-50 dark:bg-orange-900/20",
        wave: "text-orange-500",
      },
      {
        label: t("invoices.stats.overdueInvoices"),
        value: overdueCount,
        trend: `${overdueTrend > 0 ? "+" : ""}${overdueTrend.toFixed(1)}%`,
        trendDir: overdueTrend >= 0 ? "up" : "down",
        icon: AlertCircle,
        color: "text-red-600",
        bg: "bg-red-50 dark:bg-red-900/20",
        wave: "text-red-500",
      },
    ];
  }, [saleInvoicesData, t]);

  const tabs = [
    { key: "All", label: t("invoices.tabs.all") },
    { key: "draft", label: t("invoices.tabs.draft") },
    { key: "pending", label: t("invoices.tabs.pending") },
    { key: "sent", label: t("invoices.tabs.sent") },
    { key: "paid", label: t("invoices.tabs.paid") },
    { key: "partial", label: t("invoices.tabs.partial") },
    { key: "overdue", label: t("invoices.tabs.overdue") },
    { key: "cancelled", label: t("invoices.tabs.cancelled") },
  ];

  const statusCounts = useMemo(() => {
    const keys = ["draft", "pending", "sent", "paid", "partial", "overdue", "cancelled"];
    const counts = { All: displayData.length };
    keys.forEach((key) => {
      counts[key] = displayData.filter(
        (inv) => (inv.status || "").toLowerCase() === key
      ).length;
    });
    return counts;
  }, [displayData]);

  const filteredData = useMemo(() => {
    if (statusFilter === "All") return displayData;
    return displayData.filter((inv) => {
      const s = (inv.status || "").toLowerCase();
      return s === statusFilter.toLowerCase();
    });
  }, [displayData, statusFilter]);

  const handleDeleteClick = useCallback((invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!invoiceToDelete?.id || !authUser?.companyId) return;
    try {
      await deleteSaleInvoice({
        id: invoiceToDelete.id,
        companyId: authUser.companyId,
      }).unwrap();
      toast.success(t("invoices.toast.deletedSuccess"));
      setDeleteModalOpen(false);
      setInvoiceToDelete(null);
    } catch (err) {
      toast.error(
        err?.data?.message || t("invoices.toast.deletedFailed"),
      );
    }
  }, [invoiceToDelete, authUser?.companyId, deleteSaleInvoice, t]);

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6 space-y-6">
      <InvoicesHeader onNewInvoice={() => navigate("/invoices/create")} />

      <InvoicesStatsCards stats={stats} />

      <InvoicesTabsFilters
        tabs={tabs}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statusCounts={statusCounts}
      />

      <InvoicesTable
        filteredData={filteredData}
        authUser={authUser}
        isLoading={isLoading}
        onDeleteClick={handleDeleteClick}
      />

      <InvoiceDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        invoiceToDelete={invoiceToDelete}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default InvoicesPage;
