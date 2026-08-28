import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  startOfMonth,
  subMonths,
  endOfMonth,
  isWithinInterval,
  format,
} from "date-fns";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  FolderTree,
  CheckCircle,
  Archive,
  TrendingUp,
} from "lucide-react";

import {
  useGetCategoriesQuery,
  useGetTrashedCategoriesQuery,
  useDeleteCategoryMutation,
  useRestoreCategoryMutation,
  useToggleCategoryActiveMutation,
} from "@/features/category/categoryApiSlice";

// UI Components
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReusableTable from "@/components/table/reusable-table";

// Modals
import DeleteModal from "@/components/modals/DeleteModal";
import ConfirmModal from "@/components/modals/ConfirmModal";

import CategoriesHeader from "./components/CategoriesHeader";
import CategoriesStats from "./components/CategoriesStats";
import CategoriesTabsAndSearch from "./components/CategoriesTabsAndSearch";

const CategoriesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);

  // State
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'active', 'disabled'
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    category: null,
  });
  const [toggleModal, setToggleModal] = useState({
    isOpen: false,
    category: null,
  });
  const [restoreModal, setRestoreModal] = useState({
    isOpen: false,
    category: null,
  });

  // API Queries
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
  } = useGetCategoriesQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId },
  );

  const {
    data: trashedCategories = [],
    isLoading: isTrashLoading,
  } = useGetTrashedCategoriesQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId },
  );

  // Mutations
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();
  const [toggleActive, { isLoading: isToggling }] =
    useToggleCategoryActiveMutation();
  const [restoreCategory, { isLoading: isRestoring }] =
    useRestoreCategoryMutation();

  // Data Filtering
  const filteredData = useMemo(() => {
    const source = activeTab === "trash" ? trashedCategories : categories;
    let data = [...source];

    // Filter by Tab
    if (activeTab === "active") {
      data = data.filter((c) => c.isActive);
    } else if (activeTab === "disabled") {
      data = data.filter((c) => !c.isActive);
    } else if (activeTab === "trash") {
      // already only trashed
    }

    // Filter by Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(
        (c) =>
          c.name?.toLowerCase().includes(lower) ||
          c.slug?.toLowerCase().includes(lower) ||
          c.parent?.name?.toLowerCase().includes(lower),
      );
    }

    return data;
  }, [categories, trashedCategories, activeTab, searchTerm]);

  const tabCounts = useMemo(() => {
    const activeCount = categories.filter((c) => c.isActive).length;
    const disabledCount = categories.filter((c) => !c.isActive).length;
    const trashCount = trashedCategories.length;
    return {
      all: categories.length,
      active: activeCount,
      disabled: disabledCount,
      trash: trashCount,
    };
  }, [categories, trashedCategories]);

  // Stats Calculation
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const calculateTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // 1. Total Categories
    const totalCategories = categories.length;
    const createdThisMonth = categories.filter(
      (c) => c.createdAt && new Date(c.createdAt) >= currentMonthStart,
    ).length;
    const createdLastMonth = categories.filter(
      (c) =>
        c.createdAt &&
        isWithinInterval(new Date(c.createdAt), {
          start: lastMonthStart,
          end: lastMonthEnd,
        }),
    ).length;
    const totalTrend = calculateTrend(createdThisMonth, createdLastMonth);

    // 2. Active Categories
    const activeCategories = categories.filter((c) => c.isActive).length;
    const activeThisMonth = categories.filter(
      (c) =>
        c.isActive && c.updatedAt && new Date(c.updatedAt) >= currentMonthStart,
    ).length;
    const activeLastMonth = categories.filter(
      (c) =>
        c.isActive &&
        c.updatedAt &&
        isWithinInterval(new Date(c.updatedAt), {
          start: lastMonthStart,
          end: lastMonthEnd,
        }),
    ).length;
    const activeTrend = calculateTrend(activeThisMonth, activeLastMonth);

    // 3. Disabled Categories
    const disabledCategories = categories.filter((c) => !c.isActive).length;
    const disabledTrend = 0; // Simplified for now

    // 4. Subcategories (Has Parent)
    const subCategories = categories.filter((c) => c.parent).length;
    const subTrend = 0; // Simplified

    return [
      {
        label: t("dashboard.totalCategories") || "Total Categories",
        value: totalCategories,
        trend: `${totalTrend > 0 ? "+" : ""}${totalTrend.toFixed(1)}%`,
        trendDir: totalTrend >= 0 ? "up" : "down",
        trendColor: totalTrend >= 0 ? "green" : "red",
        icon: FolderTree,
        color: "text-indigo-600",
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        wave: "text-indigo-500",
      },
      {
        label: t("dashboard.activeCategories") || "Active Categories",
        value: activeCategories,
        trend: `${activeTrend > 0 ? "+" : ""}${activeTrend.toFixed(1)}%`,
        trendDir: activeTrend >= 0 ? "up" : "down",
        trendColor: activeTrend >= 0 ? "green" : "red",
        icon: CheckCircle,
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        wave: "text-emerald-500",
      },
      {
        label: t("categories.disabledCategories") || "Disabled Categories",
        value: disabledCategories,
        trend: "0.0%",
        trendDir: "up",
        trendColor: "red",
        icon: Archive,
        color: "text-orange-600",
        bg: "bg-orange-50 dark:bg-orange-900/20",
        wave: "text-orange-500",
      },
      {
        label: t("categories.subcategories") || "Subcategories",
        value: subCategories,
        trend: "0.0%",
        trendDir: "up",
        trendColor: "green",
        icon: TrendingUp,
        color: "text-blue-600",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        wave: "text-blue-500",
      },
    ];
  }, [categories, t]);

  // Handlers
  const handleToggleStatus = async (category) => {
    try {
      await toggleActive({
        id: category.id,
        active: !category.isActive,
      }).unwrap();
      toast.success(
        category.isActive
          ? t("modal.categoryUpdated", { status: t("common.disabled") })
          : t("modal.categoryUpdated", { status: t("common.enabled") }),
      );
    } catch (err) {
      toast.error(t("common.failed"));
    }
  };

  // Columns Configuration
  const headers = useMemo(
    () => [
      {
        header: t("common.name"),
        field: "name",
        render: (row) => {
          // Clean photo URL if it contains backticks or extra spaces
          const cleanPhoto = row.photo?.replace(/`/g, "").trim();

          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                {cleanPhoto ? (
                  <img
                    src={cleanPhoto}
                    alt={row.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-gray-400">IMG</span>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {row.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {row.slug}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        header: t("common.parent"),
        field: "parentName",
        render: (row) => (
          <span className="text-gray-600 dark:text-gray-400">
            {row.parent?.name || "—"}
          </span>
        ),
      },
      {
        header: t("activityLogs.date") || t("common.date") || "Date",
        field: "createdAt",
        render: (row) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {activeTab === "trash"
                ? row.deletedAt
                  ? format(new Date(row.deletedAt), "MMM dd, yyyy")
                  : "—"
                : row.createdAt
                  ? format(new Date(row.createdAt), "MMM dd, yyyy")
                  : "—"}
            </span>
            <span className="text-xs text-gray-500">
              {activeTab === "trash"
                ? row.deletedAt
                  ? format(new Date(row.deletedAt), "hh:mm a")
                  : ""
                : row.createdAt
                  ? format(new Date(row.createdAt), "hh:mm a")
                  : ""}
            </span>
          </div>
        ),
      },
      {
        header: t("common.status"),
        field: "status",
        render: (row) =>
          activeTab === "trash" ? (
                  <span className="inline-flex items-center gap-2 text-xs font-bold px-2.5 py-1 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300">
                    <Trash2 className="w-3.5 h-3.5" />
                    {t("categories.statusTrashed")}
                  </span>
          ) : (
            <div className="flex items-center">
              <Switch
                checked={row.isActive}
                onCheckedChange={() => handleToggleStatus(row)}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          ),
      },
      {
        header: t("common.actions"),
        field: "actions",
        render: (row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">
                  {t("products.openMenuSr") || "Open menu"}
                </span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
              {activeTab === "trash" ? (
                <DropdownMenuItem
                  onClick={() => setRestoreModal({ isOpen: true, category: row })}
                >
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />{" "}
                  {t("categories.restoreConfirm")}
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem
                    onClick={() => navigate(`/categories/${row.id}/edit`)}
                  >
                    <Edit className="mr-2 h-4 w-4" /> {t("common.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      setToggleModal({ isOpen: true, category: row })
                    }
                  >
                    {row.isActive ? (
                      <>
                        <Archive className="mr-2 h-4 w-4 text-orange-600" />{" "}
                        {t("common.disable")}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />{" "}
                        {t("common.enable")}
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      setDeleteModal({ isOpen: true, category: row })
                    }
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> {t("common.delete")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, navigate, activeTab],
  );

  return (
    <div className="p-6 lg:p-0 bg-[#f8f9fa] dark:bg-[#0b0f14] min-h-screen font-sans space-y-6">
      {/* --- Header --- */}
      <CategoriesHeader t={t} onAdd={() => navigate("/categories/create")} />

      {/* --- Stats Cards --- */}
      <CategoriesStats stats={stats} />

      {/* --- Table Container --- */}
      <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6 space-y-6">
        {/* Tabs & Controls */}
        <CategoriesTabsAndSearch
          t={t}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabCounts={tabCounts}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Reusable Table */}
        <ReusableTable
          data={filteredData}
          headers={headers}
          total={filteredData.length}
          isLoading={activeTab === "trash" ? isTrashLoading : isCategoriesLoading}
          py="py-4"
          searchable={false}
        />
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, category: null })}
        onConfirm={async () => {
          if (!deleteModal.category) return;
          const res = await deleteCategory(deleteModal.category.id);
          if (res?.data) {
            toast.success(t("modal.categoryDeleted"));
            setDeleteModal({ isOpen: false, category: null });
          } else {
            toast.error(t("modal.categoryDeleteFailed"));
          }
        }}
        title={t("modal.deleteCategory")}
        description={t("modal.deleteCategoryDesc")}
        itemName={deleteModal.category?.name}
        isLoading={isDeleting}
      />

      <ConfirmModal
        isOpen={toggleModal.isOpen}
        onClose={() => setToggleModal({ isOpen: false, category: null })}
        onConfirm={async () => {
          if (!toggleModal.category) return;
          const res = await toggleActive({ id: toggleModal.category.id });
          if (res?.data) {
            toast.success(
              t("modal.categoryUpdated", {
                status: toggleModal.category?.isActive
                  ? t("common.disabled")
                  : t("common.enabled"),
              }),
            );
            setToggleModal({ isOpen: false, category: null });
          } else {
            toast.error(t("modal.categoryUpdateFailed"));
          }
        }}
        title={
          toggleModal.category?.isActive
            ? t("modal.disableCategory")
            : t("modal.enableCategory")
        }
        description={
          toggleModal.category?.isActive
            ? t("modal.disableCategoryDesc")
            : t("modal.enableCategoryDesc")
        }
        itemName={`${
          toggleModal.category?.isActive
            ? t("common.disable")
            : t("common.enable")
        } "${toggleModal.category?.name}"?`}
        isLoading={isToggling}
        type={toggleModal.category?.isActive ? "warning" : "success"}
        confirmText={
          toggleModal.category?.isActive
            ? t("common.disable")
            : t("common.enable")
        }
      />

      <ConfirmModal
        isOpen={restoreModal.isOpen}
        onClose={() => setRestoreModal({ isOpen: false, category: null })}
        onConfirm={async () => {
          if (!restoreModal.category) return;
          try {
            await restoreCategory({
              id: restoreModal.category.id,
              params: { companyId: authUser?.companyId },
            }).unwrap();
            toast.success(t("categories.restored"));
            setRestoreModal({ isOpen: false, category: null });
          } catch (e) {
            toast.error(t("common.failed"));
          }
        }}
        title={t("categories.restoreTitle")}
        description={t("categories.restoreDescription")}
        itemName={`${t("categories.restoreConfirm")} "${restoreModal.category?.name}"?`}
        isLoading={isRestoring}
        type="success"
        confirmText={t("categories.restoreConfirm")}
      />
    </div>
  );
};

export default CategoriesPage;
