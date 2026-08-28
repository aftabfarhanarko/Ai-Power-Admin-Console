import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import {
  Power,
  Trash2,
  Ticket,
  Percent,
  DollarSign,
  CalendarClock,
  CheckCircle2,
  XCircle,
  Plus,
  Pencil,
  Copy,
} from "lucide-react";
import {
  useGetPromocodesQuery,
  useDeletePromocodeMutation,
  useTogglePromocodeActiveMutation,
} from "@/features/promocode/promocodeApiSlice";
import { useNavigate } from "react-router-dom";
import DeleteModal from "@/components/modals/DeleteModal";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const PromocodePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const { data: promos = [], isLoading } = useGetPromocodesQuery({
    companyId: authUser?.companyId,
  });
  const [deletePromocode, { isLoading: isDeleting }] =
    useDeletePromocodeMutation();
  const [toggleActive, { isLoading: isToggling }] =
    useTogglePromocodeActiveMutation();
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    promocode: null,
  });
  const [toggleModal, setToggleModal] = useState({
    isOpen: false,
    promocode: null,
    nextActive: false,
  });

  // Stats Calculation
  const stats = useMemo(() => {
    const total = promos.length;
    const active = promos.filter((p) => p.isActive).length;
    const expired = promos.filter(
      (p) => p.expiresAt && new Date(p.expiresAt) < new Date(),
    ).length;
    const totalUses = promos.reduce(
      (acc, curr) => acc + (curr.currentUses || 0),
      0,
    );

    return [
      {
        label: t("promocodes.totalPromocodes"),
        value: total,
        icon: Ticket,
        color: "text-blue-600",
        bg: "bg-blue-100 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
      },
      {
        label: t("promocodes.activePromocodes"),
        value: active,
        icon: CheckCircle2,
        color: "text-emerald-600",
        bg: "bg-emerald-100 dark:bg-emerald-900/20",
        border: "border-emerald-200 dark:border-emerald-800",
      },
      {
        label: t("promocodes.expiredPromocodes"),
        value: expired,
        icon: CalendarClock,
        color: "text-rose-600",
        bg: "bg-rose-100 dark:bg-rose-900/20",
        border: "border-rose-200 dark:border-rose-800",
      },
      {
        label: t("promocodes.totalRedemptions"),
        value: totalUses,
        icon: Percent,
        color: "text-purple-600",
        bg: "bg-purple-100 dark:bg-purple-900/20",
        border: "border-purple-200 dark:border-purple-800",
      },
    ];
  }, [promos, t]);

  const headers = useMemo(
    () => [
      { header: t("promocodes.code"), field: "code" },
      { header: t("promocodes.discount"), field: "discount" },
      { header: t("promocodes.usage"), field: "usage" },
      { header: t("promocodes.period"), field: "period" },
      { header: t("common.status"), field: "status" },
      { header: t("common.actions"), field: "actions" },
    ],
    [t],
  );

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(t("common.copied"));
  };

  const tableData = useMemo(
    () =>
      promos.map((p) => {
        const isPercentage =
          String(p?.discountType).toLowerCase() === "percentage";
        const valueLabel =
          typeof p?.discountValue === "number"
            ? isPercentage
              ? `${p.discountValue}%`
              : `$${Number(p.discountValue).toFixed(2)}`
            : String(p?.discountValue ?? "-");

        const starts = p?.startsAt
          ? new Date(p.startsAt).toLocaleDateString()
          : "-";
        const expires = p?.expiresAt
          ? new Date(p.expiresAt).toLocaleDateString()
          : "-";

        // Check if expired
        const isExpired = p?.expiresAt && new Date(p.expiresAt) < new Date();

        return {
          code: (
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg font-mono font-medium text-sm flex items-center gap-2 border border-gray-200 dark:border-gray-700">
                {p?.code}
                <button
                  onClick={() => copyToClipboard(p?.code)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
          ),
          discount: (
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                {isPercentage ? (
                  <Percent className="h-3 w-3" />
                ) : (
                  <DollarSign className="h-3 w-3" />
                )}
                {valueLabel}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t("promocodes.minOrderLabel")}{" "}
                ${Number(p?.minOrderAmount || 0).toFixed(2)}
              </span>
            </div>
          ),
          usage: (
            <div className="flex flex-col gap-1 w-32">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  {t("promocodes.usedLabel", {
                    count: p?.currentUses || 0,
                  })}
                </span>
                {p?.maxUses && (
                  <span className="text-gray-400">
                    {t("promocodes.ofLabel", { count: p?.maxUses })}
                  </span>
                )}
              </div>
              {p?.maxUses > 0 && (
                <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(((p?.currentUses || 0) / p.maxUses) * 100, 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>
          ),
          period: (
            <div className="flex flex-col text-sm">
              <span className="text-gray-900 dark:text-white">{starts}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                {t("promocodes.toLabel")} {expires}
                {isExpired && (
                  <span className="text-rose-500 font-medium">
                    ({t("promocodes.expiredLabel")})
                  </span>
                )}
              </span>
            </div>
          ),
          status: (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                p?.isActive
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {p?.isActive ? t("common.active") : t("common.inactive")}
            </span>
          ),
          actions: (
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setToggleModal({
                    isOpen: true,
                    promocode: p,
                    nextActive: !p.isActive,
                  })
                }
                disabled={isToggling}
                className={`h-8 w-8 rounded-lg ${
                  p?.isActive
                    ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/40"
                    : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                }`}
                title={p?.isActive ? t("common.disable") : t("common.activate")}
              >
                <Power className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                onClick={() => navigate(`/promocodes/${p.id}/edit`)}
                title={t("common.edit")}
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteModal({ isOpen: true, promocode: p })}
                disabled={isDeleting}
                className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40"
                title={t("common.delete")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ),
        };
      }),
    [promos, deletePromocode, toggleActive, isDeleting, isToggling, t],
  );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#111318] p-4 md:p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            {t("promocodes.title")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("promocodes.manageDesc")}
          </p>
        </div>
        <Button
          onClick={() => navigate("/promocodes/create")}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 rounded-xl px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("promocodes.addPromocode")}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`rounded-[24px] p-5 border ${stat.bg} ${stat.border} flex flex-col justify-between h-32 relative overflow-hidden group`}
          >
            <div className="flex justify-between items-start z-10">
              <div>
                <p
                  className={`text-xs font-bold uppercase tracking-wider opacity-70 ${stat.color}`}
                >
                  {stat.label}
                </p>
                <h3 className={`text-3xl font-black mt-2 ${stat.color}`}>
                  {stat.value}
                </h3>
              </div>
              <div
                className={`p-2.5 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm ${stat.color}`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <stat.icon
              className={`absolute -bottom-4 -right-4 w-24 h-24 opacity-10 rotate-12 ${stat.color} transition-transform group-hover:scale-110 duration-500`}
            />
          </motion.div>
        ))}
      </div>

      {/* Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/20 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("promocodes.allPromocodes")}
          </h2>
        </div>
        <div className="p-2">
          <ReusableTable
            data={tableData}
            headers={headers}
            total={promos.length}
            isLoading={isLoading}
            py="py-3"
          />
        </div>
      </motion.div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, promocode: null })}
        onConfirm={async () => {
          if (!deleteModal.promocode) return;
          const res = await deletePromocode(deleteModal.promocode.id);
          if (res?.data) {
            toast.success(t("promocodes.promocodeDeleted"));
            setDeleteModal({ isOpen: false, promocode: null });
          } else {
            toast.error(res?.error?.data?.message || t("common.failed"));
          }
        }}
        title={t("promocodes.deletePromocode")}
        description={t("promocodes.deletePromocodeDesc")}
        itemName={deleteModal.promocode?.code}
        isLoading={isDeleting}
      />

      {/* Enable/Disable confirmation modal */}
      <ConfirmModal
        isOpen={toggleModal.isOpen}
        onClose={() =>
          setToggleModal({
            isOpen: false,
            promocode: null,
            nextActive: false,
          })
        }
        onConfirm={async () => {
          if (!toggleModal.promocode) return;
          const res = await toggleActive({
            id: toggleModal.promocode.id,
            active: toggleModal.nextActive,
          });
          if (res?.data) {
            toast.success(t("promocodes.promocodeStateUpdated"));
            setToggleModal({
              isOpen: false,
              promocode: null,
              nextActive: false,
            });
          } else {
            toast.error(
              res?.error?.data?.message ||
                t("promocodes.promocodeUpdateFailed"),
            );
          }
        }}
        isLoading={isToggling}
        type={toggleModal.nextActive ? "success" : "warning"}
        title={
          toggleModal.nextActive
            ? t("promocodes.enablePromocode")
            : t("promocodes.disablePromocode")
        }
        description={
          toggleModal.nextActive
            ? t("promocodes.enablePromocodeDesc")
            : t("promocodes.disablePromocodeDesc")
        }
        itemName={
          toggleModal.promocode?.code
            ? `"${toggleModal.promocode.code}"`
            : undefined
        }
        confirmText={
          toggleModal.nextActive ? t("common.enable") : t("common.disable")
        }
        cancelText={t("common.cancel")}
      />
    </div>
  );
};

export default PromocodePage;
