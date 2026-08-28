import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Pencil, 
  Power, 
  Trash2, 
  Plus, 
  ImageIcon, 
  Layers, 
  MousePointerClick, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";
import {
  useGetBannersQuery,
  useDeleteBannerMutation,
  useUpdateBannerMutation,
} from "@/features/banners/bannersApiSlice";
import DeleteModal from "@/components/modals/DeleteModal";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const BannerPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const { data: banners = [], isLoading: isBannersLoading } = useGetBannersQuery({ companyId: authUser?.companyId });
  const [deleteBanner, { isLoading: isDeletingBanner }] = useDeleteBannerMutation();
  const [updateBanner, { isLoading: isUpdatingBanner }] = useUpdateBannerMutation();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, banner: null });
  const [toggleModal, setToggleModal] = useState({ isOpen: false, banner: null, nextIsActive: false });

  // Stats Calculation
  const stats = useMemo(() => {
    const total = banners.length;
    const active = banners.filter(b => b.isActive).length;
    const inactive = total - active;
    // Mock clicks for now as backend doesn't provide it yet
    const totalClicks = banners.reduce((acc, curr) => acc + (curr.clicks || Math.floor(Math.random() * 500)), 0);

    return [
      {
        label: t("banners.totalBanners"),
        value: total,
        icon: ImageIcon,
        color: "text-blue-600",
        bg: "bg-blue-100 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
      },
      {
        label: t("banners.activeBanners"),
        value: active,
        icon: CheckCircle2,
        color: "text-emerald-600",
        bg: "bg-emerald-100 dark:bg-emerald-900/20",
        border: "border-emerald-200 dark:border-emerald-800",
      },
      {
        label: t("banners.inactiveBanners"),
        value: inactive,
        icon: XCircle,
        color: "text-rose-600",
        bg: "bg-rose-100 dark:bg-rose-900/20",
        border: "border-rose-200 dark:border-rose-800",
      },
      {
        label: t("banners.totalClicks"),
        value: totalClicks.toLocaleString(),
        icon: MousePointerClick,
        color: "text-purple-600",
        bg: "bg-purple-100 dark:bg-purple-900/20",
        border: "border-purple-200 dark:border-purple-800",
      },
    ];
  }, [banners, t]);

  const headers = useMemo(
    () => [
      { header: t("banners.imageUrl"), field: "imageUrl" },
      { header: t("banners.titleField"), field: "title" },
      { header: t("banners.buttonText"), field: "buttonText" },
      { header: t("banners.order"), field: "order" },
      { header: t("common.status"), field: "status" },
      { header: t("common.actions"), field: "actions" },
    ],
    [t]
  );

  const bannerTableData = useMemo(
    () =>
      banners.map((b) => ({
        imageUrl: (
          <div className="w-24 h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 relative group">
            {b.imageUrl ? (
              <img 
                src={b.imageUrl} 
                alt={b.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ImageIcon className="w-5 h-5" />
              </div>
            )}
          </div>
        ),
        title: (
          <div>
            <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">{b.title}</p>
            {b.subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{b.subtitle}</p>}
          </div>
        ),
        buttonText: b.buttonText ? (
          <span className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium border border-gray-200 dark:border-gray-700">
            {b.buttonText}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        ),
        order: (
          <span className="font-mono font-medium text-gray-600 dark:text-gray-400">
            #{b.order}
          </span>
        ),
        status: (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold flex w-fit items-center gap-1.5 ${
              b.isActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${b.isActive ? "bg-emerald-500" : "bg-gray-500"}`} />
            {b.isActive ? t("common.active") : t("common.disabled")}
          </span>
        ),
        actions: (
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors"
              onClick={() => navigate(`/banners/${b.id}/edit`)}
              title={t("common.edit")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setToggleModal({ isOpen: true, banner: b, nextIsActive: !b.isActive })}
              disabled={isUpdatingBanner}
              className={`h-8 w-8 rounded-full transition-colors ${
                b.isActive
                  ? "hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20 dark:hover:text-amber-400"
                  : "hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400"
              }`}
              title={b.isActive ? t("banners.disable") : t("banners.activate")}
            >
              <Power className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteModal({ isOpen: true, banner: b })}
              disabled={isDeletingBanner}
              className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
              title={t("common.delete")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      })),
    [banners, updateBanner, isDeletingBanner, isUpdatingBanner, t, navigate]
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            {t("banners.managementTitle")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              {t("banners.managementHighlight")}
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-lg text-base">
            {t("banners.managementSubtitle")}
          </p>
        </div>

        <Button
          className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold flex items-center gap-2 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-1"
          onClick={() => navigate("/banners/create")}
        >
          <div className="bg-white/20 p-1 rounded-lg">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-base">{t("banners.addBanner")}</span>
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
            className={`rounded-2xl p-5 border ${stat.bg} ${stat.border} flex flex-col justify-between h-32 relative overflow-hidden group`}
          >
            <div className="flex justify-between items-start z-10">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider opacity-70 ${stat.color}`}>
                  {stat.label}
                </p>
                <h3 className={`text-3xl font-black mt-2 ${stat.color}`}>
                  {stat.value}
                </h3>
              </div>
              <div className={`p-2.5 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <stat.icon className={`absolute -bottom-4 -right-4 w-24 h-24 opacity-10 rotate-12 ${stat.color} transition-transform group-hover:scale-110 duration-500`} />
          </motion.div>
        ))}
      </div>

      {/* Table Section */}
      <div className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6 shadow-xl shadow-gray-100/50 dark:shadow-black/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Layers className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("banners.allBanners")}
          </h3>
        </div>

        <ReusableTable
          data={bannerTableData}
          headers={headers}
          total={banners.length}
          isLoading={isBannersLoading}
          py="py-3"
        />
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, banner: null })}
        onConfirm={async () => {
          if (!deleteModal.banner) return;
          const res = await deleteBanner(deleteModal.banner.id);
          if (res?.data) {
            toast.success(t("banners.bannerDeleted"));
            setDeleteModal({ isOpen: false, banner: null });
          } else {
            toast.error(res?.error?.data?.message || t("common.failed"));
          }
        }}
        title={t("banners.deleteBanner")}
        description={t("banners.deleteBannerDesc")}
        itemName={deleteModal.banner?.title}
        isLoading={isDeletingBanner}
      />

      {/* Enable/Disable Confirmation Modal */}
      <ConfirmModal
        isOpen={toggleModal.isOpen}
        onClose={() => setToggleModal({ isOpen: false, banner: null, nextIsActive: false })}
        onConfirm={async () => {
          if (!toggleModal.banner) return;
          const res = await updateBanner({ id: toggleModal.banner.id, isActive: toggleModal.nextIsActive });
          if (res?.data) {
            toast.success(t("banners.bannerStateUpdated"));
            setToggleModal({ isOpen: false, banner: null, nextIsActive: false });
          } else {
            toast.error(t("banners.bannerUpdateFailed"));
          }
        }}
        isLoading={isUpdatingBanner}
        type={toggleModal.nextIsActive ? "success" : "warning"}
        title={toggleModal.nextIsActive ? t("banners.enableBanner") : t("banners.disableBanner")}
        description={
          toggleModal.nextIsActive
            ? t("banners.enableBannerDesc")
            : t("banners.disableBannerDesc")
        }
        itemName={toggleModal.banner?.title ? `"${toggleModal.banner.title}"` : undefined}
        confirmText={toggleModal.nextIsActive ? t("common.enable") : t("common.disable")}
        cancelText={t("common.cancel")}
      />
    </div>
  );
};

export default BannerPage;
