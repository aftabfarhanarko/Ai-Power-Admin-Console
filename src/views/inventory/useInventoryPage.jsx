import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { useGetProductsQuery } from "@/features/product/productApiSlice";
import { useGetCategoriesQuery } from "@/features/category/categoryApiSlice";

const renderPrice = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);

export function useInventoryPage() {
  const authUser = useSelector((state) => state.auth.user);

  const [visibleColumns, setVisibleColumns] = useState({
    details: true,
    sku: true,
    stock: true,
    pricing: true,
    actions: true,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [stockModal, setStockModal] = useState({
    isOpen: false,
    product: null,
    type: "in",
  });
  const [historyModal, setHistoryModal] = useState({
    isOpen: false,
    product: null,
  });

  const { data: products = [], isLoading } = useGetProductsQuery({
    companyId: authUser?.companyId,
  });

  const { data: categories = [] } = useGetCategoriesQuery({
    companyId: authUser?.companyId,
  });

  const categoryOptions = useMemo(() => {
    const opts = categories.map((c) => ({ label: c.name, value: String(c.id) }));
    return [{ label: "All categories", value: "" }, ...opts];
  }, [categories]);

  const processedData = useMemo(() => {
    let data = [...products];

    if (selectedCategoryId) {
      data = data.filter((p) => {
        const catId = p.category?.id ?? p.categoryId;
        return String(catId ?? "") === String(selectedCategoryId);
      });
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(
        (p) =>
          p.name?.toLowerCase().includes(lower) ||
          p.sku?.toLowerCase().includes(lower) ||
          p.category?.name?.toLowerCase().includes(lower),
      );
    }

    if (sortConfig.key) {
      data.sort((a, b) => {
        const aVal = a[sortConfig.key] ?? "";
        const bVal = b[sortConfig.key] ?? "";

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [products, searchTerm, sortConfig, selectedCategoryId]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const totalItems = products.length;
    const newProductsThisMonth = products.filter((p) => {
      if (!p.createdAt) return false;
      const date = new Date(p.createdAt);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    }).length;

    const prevTotal = totalItems - newProductsThisMonth;
    const productGrowth =
      prevTotal > 0
        ? ((newProductsThisMonth / prevTotal) * 100).toFixed(1)
        : "0.0";

    const lowStock = products.filter(
      (p) => (p.stock || 0) <= 5 && (p.stock || 0) > 0,
    ).length;
    const outOfStock = products.filter((p) => (p.stock || 0) === 0).length;
    const totalValue = products.reduce(
      (acc, p) => acc + (p.stock || 0) * (p.price || 0),
      0,
    );

    return {
      totalItems,
      totalValueFormatted: renderPrice(totalValue),
      productGrowth,
      lowStock,
      outOfStock,
    };
  }, [products]);

  const toggleColumn = (key) => {
    setVisibleColumns((prev) => {
      const next = { ...prev, [key]: !prev[key] };

      // Always keep at least 1 column visible
      const anyVisible = Object.values(next).some(Boolean);
      return anyVisible ? next : prev;
    });
  };

  const visibleColumnCount = useMemo(
    () => Object.values(visibleColumns).filter(Boolean).length,
    [visibleColumns],
  );

  return {
    authUser,
    products,
    isLoading,
    visibleColumns,
    toggleColumn,
    visibleColumnCount,
    searchTerm,
    setSearchTerm,
    selectedCategoryId,
    setSelectedCategoryId,
    categoryOptions,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    sortConfig,
    setSortConfig,
    processedData,
    paginatedData,
    renderPrice,
    stockModal,
    setStockModal,
    historyModal,
    setHistoryModal,
    stats,
  };
}

