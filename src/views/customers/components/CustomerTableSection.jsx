import React, { useMemo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  ShieldX,
  ShieldCheck,
  Trash2,
  Info,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import {
  useDeleteUserMutation,
  useBanUserMutation,
  useUnbanUserMutation,
} from "@/features/user/userApiSlice";

/* ── helpers ────────────────────────────────────────────────────────── */

const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
];

const avatarColor = (name = "") => {
  const code = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

const StatusBadge = ({ isActive, isBanned }) => {
  if (isBanned)
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
        Banned
      </span>
    );
  if (isActive === true || isActive === "Yes" || isActive === "yes")
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
        Active
      </span>
    );
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
      Inactive
    </span>
  );
};

const PAGE_SIZE = 10;

/* ── component ──────────────────────────────────────────────────────── */

const CustomerTableSection = ({ users = [], isLoading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [banUser, { isLoading: isBanning }] = useBanUserMutation();
  const [unbanUser, { isLoading: isUnbanning }] = useUnbanUserMutation();

  const [selectedBanDetails, setSelectedBanDetails] = useState(null);
  const [banConfirmUser, setBanConfirmUser] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [unbanConfirmUser, setUnbanConfirmUser] = useState(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(users.length / PAGE_SIZE);
  const paginatedUsers = useMemo(
    () => users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [users, page],
  );

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, "...", totalPages];
    if (page >= totalPages - 2) return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  }, [page, totalPages]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4">
          <Eye className="w-7 h-7 text-indigo-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          {t("customers.noCustomers", "No customers found")}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/60 dark:bg-black/20">
              {[
                t("customers.customerInfo", "Customer Info"),
                t("customers.phone", "Phone"),
                t("orders.totalOrders", "Orders"),
                t("customers.successfulOrders", "Success"),
                t("customers.cancelledOrders", "Cancelled"),
                t("common.status", "Status"),
                t("common.actions", "Actions"),
              ].map((h, i) => (
                <th
                  key={i}
                  className={`px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800 whitespace-nowrap ${
                    i === 6 ? "text-right" : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
            {paginatedUsers.map((u, idx) => {
              const successCount = u.successfulOrdersCount ?? 0;
              const cancelCount = u.cancelledOrdersCount ?? 0;
              const totalOrders = successCount + cancelCount;
              const rowHighlight =
                successCount >= 3 && cancelCount <= 1
                  ? "border-l-2 border-l-emerald-400"
                  : cancelCount >= 2
                  ? "border-l-2 border-l-amber-400"
                  : "";

              return (
                <tr
                  key={u.id ?? idx}
                  className={`group hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors cursor-pointer ${rowHighlight}`}
                  onClick={() => navigate(`/customers/${u.id}`)}
                >
                  {/* Customer Info */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(u.name)}`}
                      >
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white leading-none mb-0.5">
                          {u.name ?? "—"}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {u.email ?? "—"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {u.phone ?? "—"}
                  </td>

                  {/* Total Orders */}
                  <td className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {totalOrders}
                  </td>

                  {/* Successful */}
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {successCount}
                    </span>
                  </td>

                  {/* Cancelled */}
                  <td className="px-5 py-4">
                    <span
                      className={`text-sm font-semibold ${
                        cancelCount >= 2
                          ? "text-amber-500"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {cancelCount}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <StatusBadge
                      isActive={u.isActive}
                      isBanned={u.isBanned}
                    />
                  </td>

                  {/* Actions */}
                  <td
                    className="px-5 py-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all">
                          <span className="sr-only">{t("customers.openMenu")}</span>
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate(`/customers/${u.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          {t("common.view")}
                        </DropdownMenuItem>
                        {u.phone && (
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/fraud?phone=${encodeURIComponent(u.phone || "")}`)
                            }
                          >
                            <ShieldX className="mr-2 h-4 w-4" />
                            {t("fraud.title")}
                          </DropdownMenuItem>
                        )}
                        {u.isBanned && (
                          <DropdownMenuItem
                            onClick={() =>
                              setSelectedBanDetails({
                                name: u.name ?? "—",
                                email: u.email ?? "—",
                                reason: u.banReason || t("customers.noReasonProvided"),
                                bannedAt: u.bannedAt
                                  ? new Date(u.bannedAt).toLocaleString()
                                  : t("customers.notAvailable"),
                              })
                            }
                          >
                            <Info className="mr-2 h-4 w-4" />
                            {t("customers.viewBanDetails")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {u.isBanned ? (
                          <DropdownMenuItem
                            onClick={() => setUnbanConfirmUser(u)}
                            disabled={isUnbanning}
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            {t("customers.unban")}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => {
                              setBanConfirmUser(u);
                              setBanReason("");
                            }}
                            disabled={isBanning}
                            className="text-amber-600 focus:text-amber-600"
                          >
                            <ShieldX className="mr-2 h-4 w-4" />
                            {t("customers.ban")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={async () => {
                            if (!window.confirm(t("customers.confirmDeleteUser"))) return;
                            const res = await deleteUser(u.id);
                            if (res?.data || !res?.error)
                              toast.success(t("customers.userDeleted"));
                            else
                              toast.error(res?.error?.data?.message || t("common.failed"));
                          }}
                          disabled={isDeleting}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("common.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between px-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("common.showing", "Showing")}{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, users.length)}
            </span>{" "}
            {t("common.of", "of")}{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {users.length}
            </span>
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span
                  key={`ellipsis-${i}`}
                  className="w-8 h-8 flex items-center justify-center text-xs text-gray-400"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                    page === p
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Ban Details Dialog ───────────────────────────────────────── */}
      <Dialog
        open={!!selectedBanDetails}
        onOpenChange={(open) => { if (!open) setSelectedBanDetails(null); }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("customers.banDetails")}</DialogTitle>
            <DialogDescription className="text-center">
              {t("customers.banDetailsDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">
                {t("orders.customer")}
              </p>
              <p className="font-medium text-sm">
                {selectedBanDetails?.name} ({selectedBanDetails?.email})
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">
                {t("customers.reason")}
              </p>
              <p className="font-medium text-sm whitespace-pre-wrap">
                {selectedBanDetails?.reason}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">
                {t("customers.bannedAt")}
              </p>
              <p className="font-medium text-sm">{selectedBanDetails?.bannedAt}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => setSelectedBanDetails(null)}
            >
              {t("customers.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Unban Confirm Dialog ─────────────────────────────────────── */}
      <Dialog
        open={!!unbanConfirmUser}
        onOpenChange={(open) => { if (!open) setUnbanConfirmUser(null); }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("customers.confirmUnbanTitle")}</DialogTitle>
            <DialogDescription>{t("customers.confirmUnbanDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUnbanConfirmUser(null)} disabled={isUnbanning}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={async () => {
                if (!unbanConfirmUser) return;
                const res = await unbanUser(unbanConfirmUser.id);
                if (res?.data) {
                  toast.success(t("customers.userUnbanned"));
                  setUnbanConfirmUser(null);
                } else {
                  toast.error(res?.error?.data?.message || t("common.failed"));
                }
              }}
              disabled={isUnbanning}
            >
              {t("customers.unban")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Ban Confirm Dialog ───────────────────────────────────────── */}
      <Dialog
        open={!!banConfirmUser}
        onOpenChange={(open) => { if (!open) setBanConfirmUser(null); }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("customers.confirmBanTitle")}</DialogTitle>
            <DialogDescription>{t("customers.confirmBanDesc")}</DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {t("customers.banReasonOptionalLabel")}
            </label>
            <textarea
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              rows={3}
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder={t("customers.banReasonOptionalPlaceholder")}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBanConfirmUser(null)} disabled={isBanning}>
              {t("common.cancel")}
            </Button>
            <Button
              className="text-amber-600 border-amber-500"
              variant="outline"
              onClick={async () => {
                if (!banConfirmUser) return;
                const res = await banUser({ id: banConfirmUser.id, reason: banReason || undefined });
                if (res?.data) {
                  toast.success(t("customers.userBanned"));
                  setBanConfirmUser(null);
                  setBanReason("");
                } else {
                  toast.error(res?.error?.data?.message || t("common.failed"));
                }
              }}
              disabled={isBanning}
            >
              {t("customers.ban")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerTableSection;
