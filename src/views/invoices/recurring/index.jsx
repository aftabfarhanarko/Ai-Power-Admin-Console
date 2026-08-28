import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Eye,
  Download,
  Filter,
  Calendar,
  MoreVertical,
  Trash2,
  RefreshCw,
  MoreHorizontal,
  TrendingUp,
} from "lucide-react";
import {
  format,
  startOfMonth,
  subMonths,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ReusableTable from "@/components/table/reusable-table";

const RecurringInvoicesPage = () => {
  const navigate = useNavigate();

  // State
  const [statusFilter, setStatusFilter] = useState("All");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  // Hardcoded Mock Data
  const mockRecurringInvoices = [
    {
      id: "INV00025",
      customer: "Emily Clark",
      createdAt: "2026-02-22",
      cycle: "6 Months",
      issueDate: "2026-02-25",
      dueDate: "2026-03-04",
      paid: 5000,
      due: 10000,
      totalAmount: 15000,
      status: "Paid",
    },
    {
      id: "INV00024",
      customer: "John Carter",
      createdAt: "2026-02-07",
      cycle: "1 Year",
      issueDate: "2026-02-10",
      dueDate: "2026-02-20",
      paid: 10750,
      due: 25750,
      totalAmount: 36500,
      status: "Unpaid",
    },
    {
      id: "INV00023",
      customer: "Sophia White",
      createdAt: "2026-01-30",
      cycle: "9 Months",
      issueDate: "2026-02-03",
      dueDate: "2026-02-13",
      paid: 20000,
      due: 50125,
      totalAmount: 70125,
      status: "Cancelled",
    },
    {
      id: "INV00022",
      customer: "Michael Johnson",
      createdAt: "2026-01-17",
      cycle: "2 Years",
      issueDate: "2026-01-20",
      dueDate: "2026-01-30",
      paid: 50000,
      due: 75900,
      totalAmount: 125900,
      status: "Partially Paid",
    },
    {
      id: "INV00021",
      customer: "Olivia Harris",
      createdAt: "2026-01-04",
      cycle: "3 Months",
      issueDate: "2026-01-07",
      dueDate: "2026-01-17",
      paid: 80000,
      due: 99999,
      totalAmount: 179999,
      status: "Overdue",
    },
    {
      id: "INV00020",
      customer: "MST HASINA BEGUM",
      createdAt: "2026-02-01",
      cycle: "Monthly",
      issueDate: "2026-02-01",
      dueDate: "2026-02-10",
      paid: 1000,
      due: 0,
      totalAmount: 1000,
      status: "Paid",
    },
    {
      id: "INV00019",
      customer: "Aftab Farhan",
      createdAt: "2026-01-31",
      cycle: "Monthly",
      issueDate: "2026-01-31",
      dueDate: "2026-02-07",
      paid: 0,
      due: 5000,
      totalAmount: 5000,
      status: "Unpaid",
    },
  ];

  // Calculate Stats with Trends
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const thisMonthInvoices = mockRecurringInvoices.filter(
      (inv) => inv.createdAt && new Date(inv.createdAt) >= currentMonthStart,
    );

    const lastMonthInvoices = mockRecurringInvoices.filter(
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

    // 1. Total Recurring Invoices
    const total = mockRecurringInvoices.length;
    const totalTrend = calculateTrend(
      thisMonthInvoices.length,
      lastMonthInvoices.length,
    );

    // 2. Total Revenue (Paid Amount)
    const totalPaid = mockRecurringInvoices.reduce(
      (sum, inv) => sum + (Number(inv.paid) || 0),
      0,
    );
    const thisMonthPaid = thisMonthInvoices.reduce(
      (sum, inv) => sum + (Number(inv.paid) || 0),
      0,
    );
    const lastMonthPaid = lastMonthInvoices.reduce(
      (sum, inv) => sum + (Number(inv.paid) || 0),
      0,
    );
    const paidTrend = calculateTrend(thisMonthPaid, lastMonthPaid);

    // 3. Expired/Cancelled Invoices
    const expiredCount = mockRecurringInvoices.filter((inv) =>
      ["cancelled", "expired"].includes(inv.status.toLowerCase()),
    ).length;
    const thisMonthExpired = thisMonthInvoices.filter((inv) =>
      ["cancelled", "expired"].includes(inv.status.toLowerCase()),
    ).length;
    const lastMonthExpired = lastMonthInvoices.filter((inv) =>
      ["cancelled", "expired"].includes(inv.status.toLowerCase()),
    ).length;
    const expiredTrend = calculateTrend(thisMonthExpired, lastMonthExpired);

    // 4. Pending/Unpaid Invoices
    const pendingCount = mockRecurringInvoices.filter((inv) =>
      ["unpaid", "pending", "overdue"].includes(inv.status.toLowerCase()),
    ).length;
    const thisMonthPending = thisMonthInvoices.filter((inv) =>
      ["unpaid", "pending", "overdue"].includes(inv.status.toLowerCase()),
    ).length;
    const lastMonthPending = lastMonthInvoices.filter((inv) =>
      ["unpaid", "pending", "overdue"].includes(inv.status.toLowerCase()),
    ).length;
    const pendingTrend = calculateTrend(thisMonthPending, lastMonthPending);

    return [
      {
        label: "Total Recurring Invoices",
        value: total,
        trend: `${totalTrend > 0 ? "+" : ""}${totalTrend.toFixed(1)}%`,
        trendDir: totalTrend >= 0 ? "up" : "down",
        icon: RefreshCw,
        color: "text-blue-600",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        wave: "text-blue-500",
      },
      {
        label: "Total Revenue",
        value: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(totalPaid),
        trend: `${paidTrend > 0 ? "+" : ""}${paidTrend.toFixed(1)}%`,
        trendDir: paidTrend >= 0 ? "up" : "down",
        icon: TrendingUp,
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        wave: "text-emerald-500",
      },
      {
        label: "Pending Invoices",
        value: pendingCount,
        trend: `${pendingTrend > 0 ? "+" : ""}${pendingTrend.toFixed(1)}%`,
        trendDir: pendingTrend >= 0 ? "up" : "down",
        icon: Clock,
        color: "text-orange-600",
        bg: "bg-orange-50 dark:bg-orange-900/20",
        wave: "text-orange-500",
      },
      {
        label: "Expired Invoices",
        value: expiredCount,
        trend: `${expiredTrend > 0 ? "+" : ""}${expiredTrend.toFixed(1)}%`,
        trendDir: expiredTrend >= 0 ? "up" : "down",
        icon: AlertCircle,
        color: "text-red-600",
        bg: "bg-red-50 dark:bg-red-900/20",
        wave: "text-red-500",
      },
    ];
  }, []);

  // Format Currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Status Tabs
  const tabs = ["All", "Paid", "Unpaid", "Overdue", "Cancelled"];

  // Filter Data
  const filteredData = useMemo(() => {
    if (statusFilter === "All") return mockRecurringInvoices;
    return mockRecurringInvoices.filter(
      (inv) => inv.status.toLowerCase() === statusFilter.toLowerCase(),
    );
  }, [statusFilter]);

  // Map Data for Table
  const tableData = useMemo(() => {
    return filteredData.map((invoice) => ({
      id: (
        <span className="font-bold text-gray-900 dark:text-gray-100">
          #{invoice.id}
        </span>
      ),
      customer: (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            {invoice.customer
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {invoice.customer}
          </span>
        </div>
      ),
      created: invoice.createdAt
        ? format(new Date(invoice.createdAt), "d MMM yyyy")
        : "-",
      cycle: (
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {invoice.cycle}
        </span>
      ),
      issueDate: invoice.issueDate
        ? format(new Date(invoice.issueDate), "d MMM yyyy")
        : "-",
      dueDate: invoice.dueDate
        ? format(new Date(invoice.dueDate), "d MMM yyyy")
        : "-",
      paid: (
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(invoice.paid)}
        </span>
      ),
      due: (
        <span className="font-bold text-red-500 dark:text-red-400">
          {formatCurrency(invoice.due)}
        </span>
      ),
      status: (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-fit ${
            invoice.status.toLowerCase() === "paid"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
              : invoice.status.toLowerCase() === "unpaid"
                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                : invoice.status.toLowerCase() === "overdue"
                  ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                  : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              invoice.status.toLowerCase() === "paid"
                ? "bg-emerald-500"
                : invoice.status.toLowerCase() === "unpaid"
                  ? "bg-amber-500"
                  : invoice.status.toLowerCase() === "overdue"
                    ? "bg-red-500"
                    : "bg-gray-500"
            }`}
          ></span>
          {invoice.status}
        </span>
      ),
      actions: (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigate(`/invoices/recurring/${invoice.id}`)}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 cursor-pointer"
              onClick={() => {
                setInvoiceToDelete(invoice);
                setDeleteModalOpen(true);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }));
  }, [filteredData, navigate]);

  const headers = [
    { header: "ID", field: "id", sortable: true },
    { header: "CUSTOMER", field: "customer", sortable: true },
    { header: "CREATED ON", field: "created", sortable: true },
    { header: "CYCLE", field: "cycle" },
    { header: "ISSUE DATE", field: "issueDate" },
    { header: "DUE DATE", field: "dueDate" },
    { header: "PAID", field: "paid", sortable: true },
    { header: "DUE AMOUNT", field: "due", sortable: true },
    { header: "STATUS", field: "status", sortable: true },
    { header: "ACTIONS", field: "actions", sortable: false },
  ];

  return (
    <div className="p-6 lg:p-10 bg-[#f8f9fa] dark:bg-[#0b0f14] min-h-screen font-sans space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-2">
        <div className="space-y-2">
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            Recurring <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">Invoices</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-lg text-base">
            Automate your billing cycles and manage subscription-based payments efficiently.
          </p>
        </div>

     
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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

      {/* Table Section */}
      <div className="bg-white dark:bg-[#1a1f26] rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden p-6 space-y-6">
        {/* Tabs & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/5 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  statusFilter === tab
                    ? "bg-white dark:bg-[#2c3036] text-[#7c3aed] shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 border-gray-200 dark:border-gray-700"
              >
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm">This Week</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 border-gray-200 dark:border-gray-700"
              >
                <Filter className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm">Filter</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Reusable Table */}
        <ReusableTable
          data={tableData}
          headers={headers}
          isLoading={false}
          searchPlaceholder="Search recurring invoices..."
          py="py-4"
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recurring Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                #{invoiceToDelete?.id}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                // Handle delete logic here
                console.log("Deleting invoice:", invoiceToDelete?.id);
                setDeleteModalOpen(false);
              }}
            >
              Delete Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecurringInvoicesPage;
