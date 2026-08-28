import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  startOfMonth,
  subMonths,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  RotateCcw,
  Package,
  PackagePlus,
  AlertCircle,
  TrendingUp,
  Archive,
} from "lucide-react";

import {
  useGetProductsQuery,
  useGetDraftProductsQuery,
  useGetTrashedProductsQuery,
  useDeleteProductMutation,
  useToggleProductActiveMutation,
  useRecoverProductMutation,
  usePublishDraftMutation,
  usePermanentDeleteProductMutation,
} from "@/features/product/productApiSlice";
import { useGetCategoriesQuery } from "@/features/category/categoryApiSlice";

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
import { exportProductsToPDF } from "@/utils/pdfExport";

import {
  ProductsPageHeader,
  ProductsStatsGrid,
  ProductsTabs,
  ProductsTableToolbar,
  ProductsModals,
} from "@/pages/products/components/list";
import RestockModal from "@/pages/products/components/RestockModal";

const ProductsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const authUser = useSelector((state) => state.auth.user);

  // State - read initial tab from location state (e.g. from create page Drafts/Trash links)
  const [activeTab, setActiveTab] = useState("published");

  useEffect(() => {
    const tab = location?.state?.tab;
    if (tab && ["published", "drafts", "trash"].includes(tab)) {
      setActiveTab(tab);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location?.state?.tab, location?.pathname, navigate]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const [period, setPeriod] = useState("weekly");

  // API Queries
  const { data: publishedProducts = [], isLoading: isLoadingPublished } =
    useGetProductsQuery({ companyId: authUser?.companyId });
  const { data: draftProducts = [], isLoading: isLoadingDrafts } =
    useGetDraftProductsQuery({ companyId: authUser?.companyId });
  const { data: trashedProducts = [], isLoading: isLoadingTrash } =
    useGetTrashedProductsQuery({ companyId: authUser?.companyId });
  const { data: categories = [] } = useGetCategoriesQuery({
    companyId: authUser?.companyId,
  });

  // Mutations
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [toggleActive, { isLoading: isToggling }] =
    useToggleProductActiveMutation();
  const [recoverProduct, { isLoading: isRecovering }] =
    useRecoverProductMutation();
  const [publishDraft, { isLoading: isPublishing }] = usePublishDraftMutation();
  const [permanentDeleteProduct, { isLoading: isPermanentlyDeleting }] =
    usePermanentDeleteProductMutation();

  // Modals Data
  const [modalState, setModalState] = useState({ type: null, product: null });
  const closeModal = () => setModalState({ type: null, product: null });

  // Data Aggregation
  const currentData = useMemo(() => {
    switch (activeTab) {
      case "drafts":
        return draftProducts;
      case "trash":
        return trashedProducts;
      default:
        return publishedProducts;
    }
  }, [activeTab, publishedProducts, draftProducts, trashedProducts]);

  const isLoading =
    activeTab === "drafts"
      ? isLoadingDrafts
      : activeTab === "trash"
        ? isLoadingTrash
        : isLoadingPublished;

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

    // 1. Total Products (Growth based on createdAt)
    const totalProducts = publishedProducts.length;
    const createdThisMonth = publishedProducts.filter(
      (p) => p.createdAt && new Date(p.createdAt) >= currentMonthStart,
    ).length;
    const createdLastMonth = publishedProducts.filter(
      (p) =>
        p.createdAt &&
        isWithinInterval(new Date(p.createdAt), {
          start: lastMonthStart,
          end: lastMonthEnd,
        }),
    ).length;
    const productTrend = calculateTrend(createdThisMonth, createdLastMonth);

    // 2. Total Inventory Value (Value of new products added)
    const totalValue = publishedProducts.reduce(
      (sum, p) => sum + (parseFloat(p.price) || 0) * (p.stock || 0),
      0,
    );
    const valueAddedThisMonth = publishedProducts
      .filter((p) => p.createdAt && new Date(p.createdAt) >= currentMonthStart)
      .reduce((sum, p) => sum + (parseFloat(p.price) || 0) * (p.stock || 0), 0);
    const valueAddedLastMonth = publishedProducts
      .filter(
        (p) =>
          p.createdAt &&
          isWithinInterval(new Date(p.createdAt), {
            start: lastMonthStart,
            end: lastMonthEnd,
          }),
      )
      .reduce((sum, p) => sum + (parseFloat(p.price) || 0) * (p.stock || 0), 0);
    const valueTrend = calculateTrend(valueAddedThisMonth, valueAddedLastMonth);

    // 3. Low Stock (Based on products updated recently to low stock)
    const lowStockProducts = publishedProducts.filter(
      (p) => (p.stock || 0) <= 5 && (p.stock || 0) > 0,
    );
    const lowStock = lowStockProducts.length;
    const lowStockUpdatedThisMonth = lowStockProducts.filter(
      (p) => p.updatedAt && new Date(p.updatedAt) >= currentMonthStart,
    ).length;
    const lowStockUpdatedLastMonth = lowStockProducts.filter(
      (p) =>
        p.updatedAt &&
        isWithinInterval(new Date(p.updatedAt), {
          start: lastMonthStart,
          end: lastMonthEnd,
        }),
    ).length;
    const lowStockTrend = calculateTrend(
      lowStockUpdatedThisMonth,
      lowStockUpdatedLastMonth,
    );

    // 4. Out of Stock (Based on products updated recently to out of stock)
    const outOfStockProducts = publishedProducts.filter(
      (p) => (p.stock || 0) === 0,
    );
    const outOfStock = outOfStockProducts.length;
    const outOfStockUpdatedThisMonth = outOfStockProducts.filter(
      (p) => p.updatedAt && new Date(p.updatedAt) >= currentMonthStart,
    ).length;
    const outOfStockUpdatedLastMonth = outOfStockProducts.filter(
      (p) =>
        p.updatedAt &&
        isWithinInterval(new Date(p.updatedAt), {
          start: lastMonthStart,
          end: lastMonthEnd,
        }),
    ).length;
    const outOfStockTrend = calculateTrend(
      outOfStockUpdatedThisMonth,
      outOfStockUpdatedLastMonth,
    );

    return [
      {
        label: t("products.totalProductsStat"),
        value: totalProducts,
        trend: `${productTrend > 0 ? "+" : ""}${productTrend.toFixed(1)}%`,
        trendDir: productTrend >= 0 ? "up" : "down",
        trendColor: productTrend >= 0 ? "green" : "red",
        icon: Package,
        color: "text-indigo-600",
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        wave: "text-indigo-500",
      },
      {
        label: t("products.totalInventoryValueStat"),
        value: new Intl.NumberFormat(i18n.language === "bn" ? "bn-BD" : "en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(totalValue),
        trend: `${valueTrend > 0 ? "+" : ""}${valueTrend.toFixed(1)}%`,
        trendDir: valueTrend >= 0 ? "up" : "down",
        trendColor: valueTrend >= 0 ? "green" : "red",
        icon: TrendingUp,
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        wave: "text-emerald-500",
      },
      {
        label: t("products.lowStockItemsStat"),
        value: lowStock,
        trend: `${lowStockTrend > 0 ? "+" : ""}${lowStockTrend.toFixed(1)}%`,
        trendDir: lowStockTrend >= 0 ? "up" : "down",
        trendColor: lowStockTrend > 0 ? "red" : "green", // Increasing low stock is bad (red)
        icon: AlertCircle,
        color: "text-orange-600",
        bg: "bg-orange-50 dark:bg-orange-900/20",
        wave: "text-orange-500",
      },
      {
        label: t("products.outOfStockStat"),
        value: outOfStock,
        trend: `${outOfStockTrend > 0 ? "+" : ""}${outOfStockTrend.toFixed(1)}%`,
        trendDir: outOfStockTrend >= 0 ? "up" : "down",
        trendColor: outOfStockTrend > 0 ? "red" : "green", // Increasing out of stock is bad (red)
        icon: Archive,
        color: "text-red-600",
        bg: "bg-red-50 dark:bg-red-900/20",
        wave: "text-red-500",
      },
    ];
  }, [publishedProducts]);

  // Filtering & Sorting
  const processedData = useMemo(() => {
    let data = [...currentData];

    // Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(
        (p) =>
          p.name?.toLowerCase().includes(lower) ||
          p.sku?.toLowerCase().includes(lower) ||
          p.category?.name?.toLowerCase().includes(lower),
      );
    }

    // Sort
    if (sortConfig.key) {
      data.sort((a, b) => {
        const aVal = a[sortConfig.key] ?? "";
        const bVal = b[sortConfig.key] ?? "";
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [currentData, searchTerm, sortConfig]);

  // Handlers
  const handleToggleStatus = async (product) => {
    try {
      await toggleActive({
        id: product.id,
        active: !product.isActive,
      }).unwrap();
      toast.success(
        product.isActive
          ? t("products.productDeactivated")
          : t("products.productActivated"),
      );
    } catch (err) {
      toast.error(t("common.failed"));
    }
  };

  const handleAction = async (action, product) => {
    try {
      if (action === "delete") {
        await deleteProduct(product.id).unwrap();
        toast.success(t("products.productMovedToTrash"));
      } else if (action === "recover") {
        await recoverProduct(product.id).unwrap();
        toast.success(t("products.productRecovered"));
      } else if (action === "permanentDelete") {
        await permanentDeleteProduct(product.id).unwrap();
        toast.success(t("products.productPermanentlyDeleted"));
      } else if (action === "publish") {
        await publishDraft(product.id).unwrap();
        toast.success(t("products.productPublished"));
      }
      closeModal();
    } catch (err) {
      toast.error(t("common.failed"));
    }
  };

  const renderPrice = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount) || 0);

  // Columns Configuration for ReusableTable
  const columns = [
    {
      header: t("products.tableCode"),
      field: "sku",
      render: (row) => (
        <span className="font-medium text-gray-600 dark:text-gray-300">
          {row.sku || "—"}
        </span>
      ),
    },
    {
      header: t("products.tableProduct"),
      field: "name",
      render: (row) => {
        const cleanThumbnail = row.thumbnail?.replace(/`/g, "").trim();
        const imageUrl =
          cleanThumbnail || row.images?.[0]?.url || row.images?.[0];
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={row.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-gray-400">IMG</span>
              )}
            </div>
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              {row.name}
            </span>
          </div>
        );
      },
    },
    {
      header: t("products.tableCategory"),
      field: "category",
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.category?.name || "—"}
        </span>
      ),
    },
    {
      header: t("products.tableUnit"),
      field: "unit",
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.unit || "Piece"}
        </span>
      ),
    },
    {
      header: t("products.tableSizes"),
      field: "sizes",
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400 text-xs">
          {row.sizes?.length
            ? row.sizes.join(", ")
            : "—"}
        </span>
      ),
    },
    {
      header: t("products.tableVariants"),
      field: "variants",
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400 text-xs">
          {row.variants?.length
            ? row.variants.map((v) => v?.name).filter(Boolean).join(", ")
            : "—"}
        </span>
      ),
    },
    {
      header: t("products.tableQuantity"),
      field: "stock",
      render: (row) => (
        <span
          className={`font-semibold ${
            (row.stock || 0) <= 5
              ? "text-red-600"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {row.stock || 0}
        </span>
      ),
    },
    {
      header: t("products.tableSellingPrice"),
      field: "price",
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {renderPrice(row.price)}
        </span>
      ),
    },
    {
      header: t("products.tableDiscountPrice"),
      field: "discountPrice",
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.discountPrice != null ? renderPrice(row.discountPrice) : "—"}
        </span>
      ),
    },
    ...(activeTab === "published"
      ? [
          {
            header: t("products.tableStatus"),
            field: "isActive",
            render: (row) => (
              <div className="flex justify-center">
                <Switch
                  checked={row.isActive}
                  onCheckedChange={() => handleToggleStatus(row)}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            ),
          },
        ]
      : []),
    {
      header: t("products.tableActions"),
      field: "actions",
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{t("products.openMenuSr")}</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigate(`/products/${row.id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" /> {t("products.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/products/${row.id}`)}>
              <Eye className="mr-2 h-4 w-4" /> {t("products.viewDetails")}
            </DropdownMenuItem>
            {activeTab !== "trash" && (
              <DropdownMenuItem
                onClick={() => setModalState({ type: "restock", product: row })}
              >
                <PackagePlus className="mr-2 h-4 w-4 text-blue-600" /> {t("products.restock")}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {activeTab === "trash" ? (
              <>
                <DropdownMenuItem
                  onClick={() =>
                    setModalState({ type: "recover", product: row })
                  }
                >
                  <RotateCcw className="mr-2 h-4 w-4 text-green-600" />{" "}
                  {t("products.recoverAction")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setModalState({ type: "permanentDelete", product: row })
                  }
                >
                  <Trash2 className="mr-2 h-4 w-4 text-red-600" />{" "}
                  {t("products.deletePermanentlyAction")}
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                onClick={() => setModalState({ type: "delete", product: row })}
              >
                <Trash2 className="mr-2 h-4 w-4 text-red-600" />{" "}
                {t("products.deleteAction")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-10 bg-[#f8f9fa] dark:bg-[#0b0f14] min-h-screen font-sans space-y-6">
      <ProductsPageHeader
        t={t}
        onExport={() =>
          exportProductsToPDF(processedData, t("products.title") || "Products")
        }
      />

      <ProductsStatsGrid stats={stats} />

      <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <ProductsTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            publishedCount={publishedProducts.length}
            draftsCount={draftProducts.length}
            trashCount={trashedProducts.length}
          />
          <ProductsTableToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder={t("products.searchPlaceholder")}
            period={period}
            onPeriodChange={setPeriod}
            t={t}
          />
        </div>

        <ReusableTable
          headers={columns}
          data={processedData}
          isLoading={isLoading}
          totalItems={processedData.length}
          itemsPerPage={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          searchPlaceholder={t("products.searchPlaceholder")}
        />
      </div>

      <ProductsModals
        modalState={modalState}
        onClose={closeModal}
        onAction={handleAction}
        t={t}
        isDeleting={isDeleting}
        isRecovering={isRecovering}
        isPermanentlyDeleting={isPermanentlyDeleting}
      />

      {modalState.type === "restock" && modalState.product && (
        <RestockModal
          isOpen
          onClose={closeModal}
          product={modalState.product}
        />
      )}
    </div>
  );
};

export default ProductsPage;
