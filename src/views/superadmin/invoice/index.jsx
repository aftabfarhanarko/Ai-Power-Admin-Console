import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  MoreVertical,
  Trash2,
} from "lucide-react";
import {
  useGetInvoicesQuery,
  useDeleteInvoiceMutation,
} from "@/features/invoice/invoiceApiSlice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import InvoiceStatusUpdateForm from "./InvoiceStatusUpdateForm";
import InlineBankPaymentActions from "./InlineBankPaymentActions";
import { generateInvoicePDF } from "./InvoicePDFGenerator";
import toast from "react-hot-toast";
import {
  MaterialIcon,
  PageShell,
} from "../stitchPrimitives";

const ITEMS_PER_PAGE = 8;

const statusMeta = {
  paid: {
    label: "PAID",
    className: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    dotClassName: "bg-emerald-500",
  },
  pending: {
    label: "PENDING",
    className: "bg-amber-50 text-amber-600 border border-amber-100",
    dotClassName: "bg-amber-500 animate-pulse",
  },
  overdue: {
    label: "OVERDUE",
    className: "bg-red-50 text-red-600 border border-red-100",
    dotClassName: "bg-red-500",
  },
  cancelled: {
    label: "CANCELLED",
    className: "bg-slate-50 text-slate-600 border border-slate-100",
    dotClassName: "bg-slate-500",
  },
};

const bankStatusMeta = {
  verified: {
    label: "VERIFIED",
    className: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  },
  pending: {
    label: "BANK PENDING",
    className: "bg-violet-50 text-violet-600 border border-violet-100",
  },
  rejected: {
    label: "REJECTED",
    className: "bg-red-50 text-red-600 border border-red-100",
  },
};

const normalizeStatus = (value) => `${value || "pending"}`.toLowerCase();

const formatCurrency = (value) =>
  `৳${Number(value || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

const downloadInvoicesCsv = (rows) => {
  const headers = [
    "Invoice Number",
    "Customer",
    "Email",
    "Status",
    "Total Amount",
    "Paid Amount",
    "Due Amount",
    "Created At",
  ];

  const data = rows.map((invoice) => [
    invoice.invoiceNumber || "",
    invoice.customer?.name || "",
    invoice.customer?.email || "",
    invoice.status || "",
    Number(invoice.totalAmount || 0).toFixed(2),
    Number(invoice.paidAmount || 0).toFixed(2),
    Number(invoice.computedDueAmount || 0).toFixed(2),
    invoice.createdAt || "",
  ]);

  const csv = [headers, ...data]
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "superadmin-invoices.csv";
  link.click();
  URL.revokeObjectURL(url);
};

const InvoiceDetails = ({ invoice, onDownload, onEdit }) => {
  const bankState = bankStatusMeta[invoice.bankStatus];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Customer Signal Card */}
      <div className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Customer Signal</h3>
          <span className="material-symbols-outlined text-gray-400">person</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              NAME
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {invoice.customer?.name || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              EMAIL
            </p>
            <p className="mt-1 break-all text-sm text-slate-600">
              {invoice.customer?.email || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              COMPANY
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {invoice.customer?.companyName || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              PHONE
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {invoice.customer?.phone || "N/A"}
            </p>
          </div>
        </div>
        
        {invoice.customer?.paymentInfo?.packagename && (
          <div className="mt-5 rounded-xl border border-gray-100 bg-slate-50/50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              ACTIVE PACKAGE
            </p>
            <div className="mt-2 flex items-center justify-between gap-4">
              <span className="text-sm font-semibold text-slate-700">
                {invoice.customer.paymentInfo.packagename}
              </span>
              <span className="text-sm font-bold text-emerald-600">
                {formatCurrency(invoice.customer.paymentInfo.amount)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Payment Stack Card */}
      <div className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Payment Stack</h3>
          <span className="material-symbols-outlined text-gray-400">account_balance_wallet</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              TOTAL
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {formatCurrency(invoice.totalAmount)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              COLLECTED
            </p>
            <p className="mt-1 text-sm font-semibold text-emerald-600">
              {formatCurrency(invoice.paidAmount)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              DUE
            </p>
            <p className="mt-1 text-sm font-semibold text-red-500">
              {formatCurrency(invoice.computedDueAmount)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              UPDATED
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {formatDateTime(invoice.updatedAt || invoice.createdAt)}
            </p>
          </div>
        </div>

        {invoice.bankPayment ? (
          <div className="mt-5 rounded-xl border border-gray-100 bg-slate-50/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  BANK PAYMENT
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {invoice.bankPayment.bankName || "Manual Transfer"}
                </p>
              </div>
              {bankState && (
                <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                  invoice.bankStatus === "verified" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                  invoice.bankStatus === "rejected" ? "bg-red-50 text-red-600 border border-red-100" :
                  "bg-violet-50 text-violet-600 border border-violet-100"
                }`}>
                  {bankState.label}
                </span>
              )}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  ACCOUNT DIGITS
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {invoice.bankPayment.accountNumber || invoice.bankPayment.accLastDigit || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  TRANSACTION ID
                </p>
                <p className="mt-1 break-all text-sm text-slate-600">
                  {invoice.bankPayment.transactionId || invoice.transactionId || "N/A"}
                </p>
              </div>
            </div>
            {invoice.bankPayment.documentUrl && (
              <a
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#3525cd] hover:text-[#2b1ebd] transition-colors"
                href={invoice.bankPayment.documentUrl}
                rel="noreferrer"
                target="_blank"
              >
                <span className="material-symbols-outlined text-[18px]">description</span>
                View payment document
              </a>
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-slate-50/50 p-4 text-sm text-gray-400">
            No bank payment metadata attached to this invoice.
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            className="h-10 rounded-xl bg-[#3525cd] px-5 text-white hover:bg-[#2b1ebd]"
            onClick={() => onEdit(invoice)}
          >
            <span className="material-symbols-outlined text-sm mr-2">edit</span>
            Update Status
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-xl border-gray-200 bg-white px-5 text-slate-700 hover:bg-slate-50"
            onClick={() => onDownload(invoice)}
          >
            <span className="material-symbols-outlined text-sm mr-2">download</span>
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

const InvoiceManagementPage = () => {
  const navigate = useNavigate();
  const { data: invoices = [], isLoading } = useGetInvoicesQuery();
  const [deleteInvoice, { isLoading: isDeleting }] = useDeleteInvoiceMutation();
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const preparedInvoices = useMemo(() => {
    const list = [...invoices].map((invoice) => {
      const totalAmount = Number(invoice.totalAmount || 0);
      const paidAmount = Number(invoice.paidAmount || 0);
      const dueAmount =
        invoice.dueAmount !== undefined && invoice.dueAmount !== null
          ? Number(invoice.dueAmount)
          : Math.max(totalAmount - paidAmount, 0);

      return {
        ...invoice,
        normalizedStatus: normalizeStatus(invoice.status),
        bankStatus: normalizeStatus(invoice.bankPayment?.status),
        totalAmount,
        paidAmount,
        computedDueAmount: dueAmount,
      };
    });

    list.sort(
      (left, right) =>
        new Date(right.updatedAt || right.createdAt || 0).getTime() -
        new Date(left.updatedAt || left.createdAt || 0).getTime(),
    );

    return list;
  }, [invoices]);

  const statusTabs = useMemo(() => {
    const counts = preparedInvoices.reduce(
      (acc, invoice) => {
        const key = invoice.normalizedStatus;
        if (acc[key] !== undefined) acc[key] += 1;
        acc.all += 1;
        return acc;
      },
      { all: 0, pending: 0, paid: 0, cancelled: 0, overdue: 0 },
    );

    return [
      { key: "all", label: "ALL", count: counts.all },
      { key: "pending", label: "PENDING", count: counts.pending },
      { key: "paid", label: "COMPLETED", count: counts.paid },
      { key: "cancelled", label: "CANCELLED", count: counts.cancelled },
    ];
  }, [preparedInvoices]);

  const filteredInvoices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return preparedInvoices.filter((invoice) => {
      const matchesStatus =
        statusFilter === "all" || invoice.normalizedStatus === statusFilter;
      const matchesQuery =
        !query ||
        [
          invoice.invoiceNumber,
          invoice.transactionId,
          invoice.customer?.name,
          invoice.customer?.email,
          invoice.customer?.companyName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesStatus && matchesQuery;
    });
  }, [preparedInvoices, searchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE));
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const metrics = useMemo(() => {
    const totalAmount = preparedInvoices.reduce(
      (sum, invoice) => sum + invoice.totalAmount,
      0,
    );
    const collectedAmount = preparedInvoices.reduce(
      (sum, invoice) => sum + invoice.paidAmount,
      0,
    );
    const dueAmount = preparedInvoices.reduce(
      (sum, invoice) =>
        invoice.normalizedStatus === "pending" || invoice.normalizedStatus === "overdue"
          ? sum + invoice.computedDueAmount
          : sum,
      0,
    );
    const pendingBankVerifications = preparedInvoices.filter(
      (invoice) => invoice.bankStatus === "pending",
    ).length;
    const completedRate = preparedInvoices.length
      ? Math.round(
          (preparedInvoices.filter((invoice) => invoice.normalizedStatus === "paid")
            .length /
            preparedInvoices.length) *
            100,
        )
      : 0;

    return {
      totalInvoices: preparedInvoices.length,
      pendingBankVerifications,
      totalRevenue: collectedAmount,
      completedRate,
      pendingAmount: dueAmount,
      avgInvoiceValue: preparedInvoices.length ? totalAmount / preparedInvoices.length : 0,
    };
  }, [preparedInvoices]);

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleDeleteClick = (invoice) => {
    setInvoiceToDelete(invoice);
  };

  const confirmDelete = async () => {
    if (invoiceToDelete) {
      const res = await deleteInvoice(invoiceToDelete.id);
      if (res?.error) {
        toast.error(res?.error?.data?.message || "Failed to delete invoice");
      } else {
        toast.success("Invoice deleted successfully");
      }
      setInvoiceToDelete(null);
    }
  };

  const handleDownloadPDF = (invoice, event) => {
    event?.stopPropagation();
    try {
      generateInvoicePDF(invoice);
      toast.success("Invoice PDF downloaded successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleExportLedger = () => {
    if (!filteredInvoices.length) {
      toast.error("No invoices available to export");
      return;
    }
    downloadInvoicesCsv(filteredInvoices);
    toast.success("Invoice ledger exported");
  };

  return (
    <PageShell className="space-y-8 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end mb-6">
        <div>
          <nav className="flex gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            <span>Finance</span>
            <span>/</span>
            <span className="text-[#3525cd]">Invoice Management</span>
          </nav>
          <h2 className="text-3xl font-bold text-slate-800">Invoice Management</h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportLedger}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
          </button>
          
          <button
            onClick={() => navigate("/superadmin/invoices/create")}
            className="bg-[#3525cd] hover:bg-[#2b1ebd] text-white py-2.5 px-6 rounded-xl font-semibold shadow-md shadow-[#3525cd]/20 transition-all hover:translate-y-[-2px] border-none flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add</span> Create New Invoice
          </button>
        </div>
      </div>

      {/* Metric Summary Bento Grid */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Total Invoices */}
        <div className="col-span-12 sm:col-span-6 md:col-span-3 bg-white p-6 rounded-3xl shadow-sm hover:translate-y-[-4px] transition-all duration-300 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#3525cd]/10 rounded-2xl">
              <span className="material-symbols-outlined text-[#3525cd]">description</span>
            </div>
            <span className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">
              +12.5% <span className="material-symbols-outlined text-[14px] ml-1">trending_up</span>
            </span>
          </div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Invoices</p>
          <h3 className="text-3xl font-bold text-slate-800">{metrics.totalInvoices.toLocaleString()}</h3>
          <p className="text-xs text-gray-500 mt-2">{metrics.pendingBankVerifications} pending verifications</p>
        </div>

        {/* Total Revenue */}
        <div className="col-span-12 sm:col-span-6 md:col-span-3 bg-white p-6 rounded-3xl shadow-sm hover:translate-y-[-4px] transition-all duration-300 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#006780]/10 rounded-2xl">
              <span className="material-symbols-outlined text-[#006780]">payments</span>
            </div>
            <span className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">
              +8.2% <span className="material-symbols-outlined text-[14px] ml-1">trending_up</span>
            </span>
          </div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Revenue</p>
          <h3 className="text-3xl font-bold text-slate-800">{formatCurrency(metrics.totalRevenue)}</h3>
          <p className="text-xs text-gray-500 mt-2">{metrics.completedRate}% collected</p>
        </div>

        {/* Pending Amount */}
        <div className="col-span-12 sm:col-span-6 md:col-span-3 bg-white p-6 rounded-3xl shadow-sm hover:translate-y-[-4px] transition-all duration-300 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl">
              <span className="material-symbols-outlined text-amber-500">pending_actions</span>
            </div>
            <span className="flex items-center text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded-lg">
              -2.4% <span className="material-symbols-outlined text-[14px] ml-1">trending_down</span>
            </span>
          </div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Pending Amount</p>
          <h3 className="text-3xl font-bold text-slate-800">{formatCurrency(metrics.pendingAmount)}</h3>
          <p className="text-xs text-gray-500 mt-2">
            {statusTabs.find((tab) => tab.key === "pending")?.count || 0} open ledgers
          </p>
        </div>

        {/* Avg. Invoice Value */}
        <div className="col-span-12 sm:col-span-6 md:col-span-3 bg-white p-6 rounded-3xl shadow-sm hover:translate-y-[-4px] transition-all duration-300 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-violet-600/10 rounded-2xl">
              <span className="material-symbols-outlined text-violet-600">analytics</span>
            </div>
            <span className="flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">
              +4.1% <span className="material-symbols-outlined text-[14px] ml-1">trending_up</span>
            </span>
          </div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Avg. Invoice Value</p>
          <h3 className="text-3xl font-bold text-slate-800">{formatCurrency(metrics.avgInvoiceValue)}</h3>
          <p className="text-xs text-gray-500 mt-2">stable across current cycle</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[300px] relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">search</span>
          <input
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] transition-all"
            placeholder="Search by customer, invoice ID, or email..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-500 outline-none focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20 transition-all cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-500 outline-none focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20 transition-all cursor-pointer">
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>This Year</option>
            <option>Custom Range</option>
          </select>
          
          <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-gray-500">filter_list</span>
          </button>
        </div>
      </div>

      {/* All Invoices Table Card */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">All Invoices</h3>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[280px] items-center justify-center px-6 py-14 text-center">
            <div>
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#3525cd]/20 border-t-[#3525cd]" />
              <p className="mt-4 text-sm text-gray-500">Loading invoice ledger...</p>
            </div>
          </div>
        ) : !preparedInvoices.length ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-100 bg-slate-50">
              <span className="material-symbols-outlined text-3xl text-gray-400">receipt_long</span>
            </div>
            <h3 className="mt-5 text-xl font-bold text-slate-800">No invoices found</h3>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              Create your first invoice to start tracking merchant billing operations from this command center.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate("/superadmin/invoices/create")}
                className="bg-[#3525cd] hover:bg-[#2b1ebd] text-white py-2.5 px-6 rounded-xl font-semibold shadow-md shadow-[#3525cd]/20 transition-all hover:translate-y-[-2px] border-none flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">add</span> Create Invoice
              </button>
            </div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-12 text-center">
            <span className="material-symbols-outlined text-4xl text-gray-400">filter_list</span>
            <h3 className="mt-4 text-lg font-bold text-slate-800">No matching invoices</h3>
            <p className="mt-2 text-sm text-gray-500">
              Adjust your search or status filters to view more records.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Invoice ID</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Customer</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Issued Date</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Due Date</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedInvoices.map((invoice) => {
                    const isExpanded = expandedRows.has(invoice.id);
                    const state = statusMeta[invoice.normalizedStatus] || statusMeta.pending;
                    const bankState = bankStatusMeta[invoice.bankStatus];
                    const customerName = invoice.customer?.name || "Unknown Customer";
                    const companyName = invoice.customer?.companyName || customerName;
                    const customerEmail = invoice.customer?.email || "No email";
                    const initials = customerName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "TC";
                    
                    const issuedDate = new Date(invoice.createdAt);
                    const dueDate = new Date(issuedDate.getTime() + 30 * 24 * 60 * 60 * 1000);

                    return (
                      <React.Fragment key={invoice.id}>
                        <tr className="hover:bg-slate-50/80 transition-all duration-200 group hover:translate-x-1">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleRow(invoice.id)}
                                className="p-1 hover:bg-slate-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                              <span className="font-bold text-[#3525cd]">
                                #{invoice.invoiceNumber || `INV-${invoice.id}`}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#e2dfff] flex items-center justify-center font-bold text-[#3525cd] text-xs">
                                {initials}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-sm">{companyName}</p>
                                <p className="text-xs text-gray-400">{customerEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-500">
                            {formatDate(invoice.createdAt)}
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-500">
                            {formatDate(dueDate)}
                          </td>
                          <td className="px-6 py-5">
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{formatCurrency(invoice.totalAmount)}</p>
                              <p className="text-xs text-gray-400">Due {formatCurrency(invoice.computedDueAmount)}</p>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col items-start gap-1">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center w-fit tracking-wider ${state.className}`}>
                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${state.dotClassName}`} /> 
                                {state.label}
                              </span>
                              {bankState && (
                                <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-wider ${
                                  invoice.bankStatus === "verified" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                  invoice.bankStatus === "rejected" ? "bg-red-50 text-red-600 border border-red-100" :
                                  "bg-violet-50 text-violet-600 border border-violet-100"
                                }`}>
                                  {bankState.label}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <InlineBankPaymentActions invoice={invoice} />
                              
                              <button
                                onClick={() => toggleRow(invoice.id)}
                                title="View Details"
                                className="p-2 hover:bg-slate-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                              </button>
                              
                              <button
                                onClick={(e) => handleDownloadPDF(invoice, e)}
                                title="Download PDF"
                                className="p-2 hover:bg-slate-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[20px]">download</span>
                              </button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-2 hover:bg-slate-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-100 shadow-lg rounded-xl">
                                  <DropdownMenuLabel className="text-gray-400 text-xs font-semibold px-3 py-2 uppercase">Actions</DropdownMenuLabel>
                                  <DropdownMenuItem className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-slate-50 rounded-lg" onClick={() => toggleRow(invoice.id)}>
                                    {isExpanded ? "Hide Details" : "View Details"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-slate-50 rounded-lg" onClick={() => setEditingInvoice(invoice)}>
                                    Update Status
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-slate-50 rounded-lg" onClick={() => handleDownloadPDF(invoice)}>
                                    Download PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="border-gray-100" />
                                  <DropdownMenuItem className="cursor-pointer px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg focus:text-red-600 focus:bg-red-50" onClick={() => handleDeleteClick(invoice)}>
                                    Delete Invoice
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-slate-50/40">
                            <td className="px-6 py-6" colSpan={7}>
                              <InvoiceDetails
                                invoice={invoice}
                                onDownload={handleDownloadPDF}
                                onEdit={setEditingInvoice}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="flex flex-col gap-4 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-bold text-slate-800">
                  {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredInvoices.length)}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredInvoices.length)}
                </span>{" "}
                of <span className="font-bold text-slate-800">{filteredInvoices.length}</span> entries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  variant="outline"
                  className="h-8 w-8 rounded-lg border-gray-200 bg-white p-0 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }).slice(0, 5).map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <Button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      variant="outline"
                      className={`h-8 w-8 rounded-lg p-0 text-sm font-semibold ${
                        currentPage === pageNumber
                          ? "bg-[#3525cd] text-white border-none"
                          : "border-gray-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                <Button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  variant="outline"
                  className="h-8 w-8 rounded-lg border-gray-200 bg-white p-0 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {editingInvoice && (
        <InvoiceStatusUpdateForm
          invoice={editingInvoice}
          onClose={() => setEditingInvoice(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!invoiceToDelete}
        onOpenChange={(open) => !open && setInvoiceToDelete(null)}
      >
        <DialogContent className="overflow-hidden rounded-3xl border border-gray-200 bg-white p-0 text-slate-800 sm:max-w-[440px]">
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 text-center text-white">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              Delete Invoice?
            </DialogTitle>
            <DialogDescription className="mt-2 text-red-100">
              This action cannot be undone. This will permanently delete invoice{" "}
              <span className="font-semibold text-white">
                #{invoiceToDelete?.invoiceNumber || invoiceToDelete?.id}
              </span>
              .
            </DialogDescription>
          </div>
          <div className="bg-white p-6">
            <DialogFooter className="gap-2 sm:justify-start">
              <Button
                variant="outline"
                onClick={() => setInvoiceToDelete(null)}
                className="h-11 rounded-xl border-gray-200 bg-white text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="h-11 rounded-xl bg-red-600 text-white hover:bg-red-700 border-none"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Invoice"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* FAB for Quick Actions */}
      <button
        onClick={() => navigate("/superadmin/invoices/create")}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#3525cd] hover:bg-[#2b1ebd] text-white rounded-2xl shadow-xl shadow-[#3525cd]/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 p-0 border-none cursor-pointer"
      >
        <span className="material-symbols-outlined transition-transform duration-300">add</span>
      </button>
    </PageShell>
  );
};

export default InvoiceManagementPage;
