import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useDeleteSystemuserMutation,
  useGetSystemusersQuery,
} from "@/features/systemuser/systemuserApiSlice";
import { useImpersonateMerchantMutation } from "@/features/superadminAuth/superadminAuthApiSlice";
import { Trash2, LogIn } from "lucide-react";

/* ── helpers ─────────────────────────────────────────────────────────── */

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
];

const avatarColor = (name = "") => {
  const code = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

const getPackageColor = (name = "") => {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes("gold") || lowercaseName.includes("enterprise")) return "bg-[#3525cd]";
  if (lowercaseName.includes("scale") || lowercaseName.includes("advanced") || lowercaseName.includes("premium")) return "bg-[#6b00b8]";
  if (lowercaseName.includes("standard") || lowercaseName.includes("plus") || lowercaseName.includes("basic")) return "bg-[#6cd3f7]";
  return "bg-[#3525cd]";
};

const getRenewalDate = (u) => {
  if (u.createdAt) {
    const date = new Date(u.createdAt);
    date.setMonth(date.getMonth() + 1);
    return `Renewal: ${date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}`;
  }
  return "Renewal: Oct 12, 2024";
};

const MaterialIcon = ({ children, className = "", filled = false, style }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{
      fontVariationSettings: `"FILL" ${filled ? 1 : 0}, "wght" 400, "GRAD" 0, "opsz" 24`,
      ...style,
    }}
  >
    {children}
  </span>
);

/* ── status badge ────────────────────────────────────────────────────── */
const StatusBadge = ({ user }) => {
  const status = user.paymentInfo?.paymentstatus?.toUpperCase() || "";
  
  if (status === "PENDING") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#f59e0b]/10 text-[#f59e0b]">
        Pending
      </span>
    );
  }
  
  if (["FAILED", "CANCELLED", "OVERDUE"].includes(status)) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ef4444]/10 text-[#ef4444]">
        Overdue
      </span>
    );
  }
  
  if (user.isActive) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#10b981]/10 text-[#10b981]">
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
      Inactive
    </span>
  );
};

/* ── stat card ───────────────────────────────────────────────────────── */
const StatCard = ({ materialIcon, iconClass, iconBg, label, value, trend, trendUp, index }) => (
  <div
    className="bg-white dark:bg-[#1a1f26] rounded-3xl p-8 border border-gray-100 dark:border-gray-800/40 shadow-sm hover:translate-y-[-4px] transition-transform duration-200"
    style={{ animationDelay: `${index * 60}ms` }}
  >
    <div className="flex items-start justify-between mb-6">
      <div className={`w-12 h-12 rounded-2xl ${iconBg} ${iconClass} flex items-center justify-center`}>
        <MaterialIcon className="text-2xl" filled>{materialIcon}</MaterialIcon>
      </div>
      {trend && (
        <span
          className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
            trend === "Pending"
              ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
              : trendUp
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          {trend !== "Pending" && (
            <MaterialIcon className="text-xs">
              {trendUp ? "trending_up" : "trending_down"}
            </MaterialIcon>
          )}
          {trend}
        </span>
      )}
    </div>
    <p className="text-[10px] font-bold uppercase tracking-widest text-[#777587] dark:text-[#777587]/80 mb-1">
      {label}
    </p>
    <h4 className="text-2xl font-bold text-[#1b1b24] dark:text-white leading-none">
      {value}
    </h4>
  </div>
);

/* ── main component ──────────────────────────────────────────────────── */
const SuperAdminCustomersPage = () => {
  const navigate = useNavigate();
  const { data: users = [], isLoading } = useGetSystemusersQuery();
  const [deleteSystemuser, { isLoading: isDeleting }] = useDeleteSystemuserMutation();
  const [impersonateMerchant] = useImpersonateMerchantMutation();
  const [impersonatingId, setImpersonatingId] = React.useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  /* stats */
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const paid = users.filter((u) =>
      ["paid", "PAID"].includes(u.paymentInfo?.paymentstatus),
    ).length;
    const pending = users.filter((u) =>
      ["pending", "PENDING"].includes(u.paymentInfo?.paymentstatus),
    ).length;
    return { total, active, paid, pending };
  }, [users]);

  /* filtered list */
  const filteredUsers = useMemo(() => {
    let list = [...users];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) =>
          u.companyName?.toLowerCase().includes(q) ||
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q),
      );
    }
    if (statusFilter === "active") list = list.filter((u) => u.isActive);
    if (statusFilter === "inactive") list = list.filter((u) => !u.isActive);
    if (statusFilter === "paid")
      list = list.filter((u) => ["paid", "PAID"].includes(u.paymentInfo?.paymentstatus));
    if (statusFilter === "pending")
      list = list.filter((u) => ["pending", "PENDING"].includes(u.paymentInfo?.paymentstatus));
    return list;
  }, [users, searchQuery, statusFilter]);

  /* pagination */
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(
    () => filteredUsers.slice((page - 1) * pageSize, page * pageSize),
    [filteredUsers, page, pageSize],
  );

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, "...", totalPages];
    if (page >= totalPages - 2) return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  }, [page, totalPages]);

  const confirmDelete = async () => {
    if (!userToDelete?.id) return;
    await deleteSystemuser(userToDelete.id);
    setUserToDelete(null);
  };

  return (
    <div className="space-y-8">
      {/* ── Page subtitle + actions ───────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="font-bold text-3xl text-[#1b1b24] dark:text-white mb-2">Customers</h3>
          <p className="text-[#464555] dark:text-gray-400 text-base">
            Manage your global enterprise client portfolio and subscription statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-[#1a1f26] border border-gray-200 dark:border-gray-700 rounded-xl text-[#3525cd] dark:text-[#c3c0ff] font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
            <MaterialIcon className="text-lg">file_download</MaterialIcon>
            Export List
          </button>
          <button
            onClick={() => navigate("/superadmin/customers/create")}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#3525cd] hover:bg-[#4f46e5] text-white rounded-xl font-bold shadow-md hover:shadow-[#3525cd]/30 transition-all duration-200 active:scale-95 border-none"
          >
            <MaterialIcon className="text-lg">person_add</MaterialIcon>
            Create New
          </button>
        </div>
      </div>

      {/* ── Stats Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          index={0}
          materialIcon="group"
          iconBg="bg-indigo-50 dark:bg-indigo-500/10"
          iconClass="text-[#3525cd] dark:text-[#c3c0ff]"
          label="Total Customers"
          value={stats.total.toLocaleString()}
          trend="+12%"
          trendUp
        />
        <StatCard
          index={1}
          materialIcon="bolt"
          iconBg="bg-emerald-50 dark:bg-emerald-500/10"
          iconClass="text-[#10b981] dark:text-emerald-400"
          label="Active Users"
          value={stats.active.toLocaleString()}
          trend="+8%"
          trendUp
        />
        <StatCard
          index={2}
          materialIcon="payments"
          iconBg="bg-violet-50 dark:bg-violet-500/10"
          iconClass="text-[#6b00b8] dark:text-[#ddb8ff]"
          label="Paid Subscriptions"
          value={stats.paid.toLocaleString()}
          trend="+24%"
          trendUp
        />
        <StatCard
          index={3}
          materialIcon="verified_user"
          iconBg="bg-warning/10 dark:bg-warning/5"
          iconClass="text-[#f59e0b] dark:text-warning"
          label="Pending Verification"
          value={stats.pending.toLocaleString()}
          trend="Pending"
        />
      </div>

      {/* ── Table Card ───────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#1a1f26] rounded-3xl border border-gray-100 dark:border-gray-800/40 shadow-sm overflow-hidden">

        {/* Filters bar */}
        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800/40">
          <div className="flex items-center gap-4 flex-wrap justify-between">
            {/* Search */}
            <div className="flex items-center gap-3 flex-1 min-w-[280px] max-w-md">
              <div className="relative w-full">
                <MaterialIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#777587] pointer-events-none">search</MaterialIcon>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  placeholder="Filter by name, email, or company..."
                  className="w-full bg-white dark:bg-[#1a1f26] border border-[#c7c4d8]/50 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] transition-all"
                />
              </div>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all border border-none ${
                  showFilters
                    ? "bg-[#3525cd]/10 text-[#3525cd]"
                    : "bg-[#f0ecf9] dark:bg-gray-800 text-[#464555] dark:text-gray-300 hover:bg-[#e4e1ee] dark:hover:bg-gray-700"
                }`}
              >
                <MaterialIcon className="text-lg">tune</MaterialIcon>
                Filters
              </button>
            </div>

            {/* Showing count & Pagination info */}
            <div className="flex items-center gap-4">
              <p className="text-sm text-[#464555] dark:text-gray-400 whitespace-nowrap">
                Showing{" "}
                <span className="font-bold text-[#1b1b24] dark:text-white">
                  {filteredUsers.length === 0
                    ? "0"
                    : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, filteredUsers.length)}`}
                </span>{" "}
                of{" "}
                <span className="font-bold text-[#1b1b24] dark:text-white">
                  {filteredUsers.length.toLocaleString()}
                </span>
              </p>

              {/* Prev / Next arrows */}
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-none bg-transparent"
                >
                  <MaterialIcon className="text-xl">chevron_left</MaterialIcon>
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border-none bg-transparent"
                >
                  <MaterialIcon className="text-xl">chevron_right</MaterialIcon>
                </button>
              </div>
            </div>
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="mt-3 flex flex-wrap gap-3 p-4 bg-gray-50 dark:bg-black/10 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="h-9 rounded-xl bg-white dark:bg-[#1a1f26] border border-gray-200 dark:border-gray-700 px-3 text-sm text-[#1b1b24] dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="p-5 flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4">
              <MaterialIcon className="text-3xl text-indigo-400">group</MaterialIcon>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              No customers found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f5f2ff]/30 dark:bg-black/20">
                  {[
                    "Customer Info",
                    "Company",
                    "Package & Tier",
                    "Status",
                    "Actions",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#777587] dark:text-[#777587]/80 border-b border-[#c7c4d8]/20 whitespace-nowrap ${
                        i === 4 ? "text-right" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                {paginatedUsers.map((u, idx) => {
                  const name = u.companyName || u.name || "Unnamed";
                  const email = u.email ?? "—";
                  const packageName = u.package?.name || u.paymentInfo?.packagename || "—";
                  const branch = u.branchLocation || u.address || "—";
                  const renewalInfo = getRenewalDate(u);

                  return (
                    <tr
                      key={u.id ?? idx}
                      className="group hover:bg-[#fcf8ff] dark:hover:bg-white/[0.01] transition-colors cursor-pointer"
                      onClick={() => navigate(`/superadmin/customers/${u.id}`)}
                    >
                      {/* Customer Info */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          {u.companyLogo ? (
                            <img
                              src={u.companyLogo}
                              alt={name}
                              className="w-10 h-10 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(name)}`}
                            >
                              {getInitials(name)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-sm text-[#1b1b24] dark:text-white leading-none mb-1">
                              {name}
                            </p>
                            <p className="text-xs text-[#777587] dark:text-[#777587]/85">
                              {email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="px-8 py-5">
                        <p className="text-sm text-[#1b1b24] dark:text-white font-medium">
                          {u.companyName || "—"}
                        </p>
                        <p className="text-xs text-[#777587] dark:text-[#777587]/85">
                          {branch}
                        </p>
                      </td>

                      {/* Package & Tier */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${getPackageColor(packageName)} shrink-0`} />
                          <p className="text-sm text-[#1b1b24] dark:text-white">
                            {packageName}
                          </p>
                        </div>
                        <p className="text-xs text-[#777587] dark:text-[#777587]/85 mt-0.5 pl-4">
                          {renewalInfo}
                        </p>
                      </td>

                      {/* Status */}
                      <td
                        className="px-8 py-5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <StatusBadge user={u} />
                      </td>

                      {/* Actions */}
                      <td
                        className="px-8 py-5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center justify-end">
                          <button
                            onClick={() => navigate(`/superadmin/customers/${u.id}`)}
                            className="p-2 text-[#777587] hover:text-[#3525cd] hover:bg-[#3525cd]/5 rounded-lg transition-all border-none bg-transparent"
                            title="View"
                          >
                            <MaterialIcon className="text-xl">more_vert</MaterialIcon>
                          </button>
                          <button
                            disabled={impersonatingId === u.id}
                            onClick={async () => {
                              setImpersonatingId(u.id);
                              try {
                                const result = await impersonateMerchant({ merchantId: u.id }).unwrap();
                                if (result?.accessToken) {
                                  sessionStorage.setItem("isImpersonating", "true");
                                  sessionStorage.setItem("impersonatedMerchantId", String(u.id));
                                  sessionStorage.setItem("accessToken", result.accessToken);
                                  window.location.href = "/dashboard";
                                }
                              } catch (err) {
                                console.error("Impersonation failed", err);
                              } finally {
                                setImpersonatingId(null);
                              }
                            }}
                            className="p-2 text-[#777587] hover:text-[#22c55e] hover:bg-[#22c55e]/5 rounded-lg transition-all border-none bg-transparent"
                            title="Login as Merchant"
                          >
                            <LogIn className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setUserToDelete(u)}
                            className="p-2 text-[#777587] hover:text-[#ef4444] hover:bg-[#ef4444]/5 rounded-lg transition-all border-none bg-transparent"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {!isLoading && (
          <div className="px-8 py-4 bg-[#f5f2ff]/10 dark:bg-black/10 border-t border-gray-100 dark:border-gray-800/40 flex items-center justify-between gap-4">
            {/* Rows per page selector */}
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="bg-transparent border-none text-xs font-bold text-[#777587] outline-none cursor-pointer p-0"
              >
                <option value={10}>10 Rows</option>
                <option value={25}>25 Rows</option>
                <option value={50}>50 Rows</option>
              </select>
            </div>

            {/* Page numbers */}
            <div className="flex items-center gap-2">
              {pageNumbers.map((p, i) =>
                p === "..." ? (
                  <span
                    key={`e-${i}`}
                    className="w-8 h-8 flex items-center justify-center text-xs text-[#777587]"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-all border-none ${
                      page === p
                        ? "bg-[#3525cd] text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-[#f0ecf9] dark:hover:bg-gray-800 bg-transparent"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button Contextual */}
      <button
        onClick={() => navigate("/superadmin/customers/create")}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#3525cd] text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center group z-50 border-none"
      >
        <span className="material-symbols-outlined text-3xl transition-transform group-hover:rotate-90">add</span>
      </button>

      {/* ── Delete Confirm Dialog ─────────────────────────────────── */}
      <Dialog
        open={Boolean(userToDelete)}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <DialogContent className="max-w-sm rounded-3xl">
          <div className="text-center py-2">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Delete Customer?
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              This will permanently remove{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {userToDelete?.email}
              </span>{" "}
              from the system.
            </DialogDescription>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-center mt-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setUserToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-xl"
              disabled={isDeleting}
              onClick={confirmDelete}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminCustomersPage;
