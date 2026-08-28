import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Zap,
  X,
  ArrowLeft,
  Download,
  Search,
  CheckCircle2,
  Package,
  Calendar,
  Tag,
  Percent,
  MoreHorizontal,
  Trash2,
  List,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TextField from "@/components/input/TextField";
import {
  useGetActiveFlashSellProductsQuery,
  useSetFlashSellMutation,
  useRemoveFlashSellMutation,
  useGetProductsQuery,
} from "@/features/product/productApiSlice";
import { useSelector } from "react-redux";
import DeleteModal from "@/components/modals/DeleteModal";
import { exportFlashSellToPDF } from "@/utils/pdfExport";

const FlashSellPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("list"); // "list" or "add"
  const [searchTerm, setSearchTerm] = useState("");

  const flashSellSchema = useMemo(
    () =>
      yup.object().shape({
        productIds: yup
          .array()
          .of(yup.number())
          .min(1, t("flashSell.validation.atLeastOneProduct"))
          .required(t("flashSell.validation.productsRequired")),
        flashSellStartTime: yup
          .string()
          .required(t("flashSell.validation.startTimeRequired")),
        flashSellEndTime: yup
          .string()
          .required(t("flashSell.validation.endTimeRequired"))
          .test(
            "is-after-start",
            t("flashSell.validation.endTimeAfterStart"),
            function (value) {
              const { flashSellStartTime } = this.parent;
              if (!value || !flashSellStartTime) return true;
              return new Date(value) > new Date(flashSellStartTime);
            },
          ),
        flashSellPrice: yup
          .number()
          .positive(t("flashSell.validation.pricePositive"))
          .nullable(),
      }),
    [t],
  );

  const { data: flashSellProducts = [], isLoading } =
    useGetActiveFlashSellProductsQuery(
      { companyId: authUser?.companyId },
      { skip: !authUser?.companyId },
    );
  const { data: allProducts = [] } = useGetProductsQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId },
  );
  const [setFlashSell, { isLoading: isSetting }] = useSetFlashSellMutation();
  const [removeFlashSell, { isLoading: isRemoving }] =
    useRemoveFlashSellMutation();

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    product: null,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(flashSellSchema),
    defaultValues: {
      productIds: [],
      flashSellStartTime: "",
      flashSellEndTime: "",
      flashSellPrice: "",
    },
  });

  const flashSellStartTime = watch("flashSellStartTime");
  const flashSellEndTime = watch("flashSellEndTime");

  // Get products that are currently on flash sell
  const activeFlashProductIds = useMemo(
    () => flashSellProducts.map((p) => p.id),
    [flashSellProducts],
  );

  // Filter products - show only active, published products that are not already on flash sell
  const availableProducts = useMemo(
    () =>
      allProducts.filter(
        (p) =>
          p.isActive &&
          p.status === "published" &&
          !activeFlashProductIds.includes(p.id),
      ),
    [allProducts, activeFlashProductIds],
  );

  const filteredFlashSellProducts = useMemo(() => {
    if (!searchTerm) return flashSellProducts;
    const lower = searchTerm.toLowerCase();
    return flashSellProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(lower) ||
        p.sku?.toLowerCase().includes(lower),
    );
  }, [flashSellProducts, searchTerm]);

  const headers = useMemo(
    () => [
      { header: t("flashSell.productName"), field: "name" },
      { header: t("products.sku"), field: "sku" },
      { header: t("flashSell.regularPrice"), field: "regularPrice" },
      { header: t("flashSell.flashPrice"), field: "flashPrice" },
      { header: t("flashSell.discount"), field: "discount" },
      { header: t("flashSell.duration"), field: "duration" },
      { header: t("common.status"), field: "status" },
      { header: t("common.actions"), field: "actions" },
    ],
    [t],
  );

  const tableData = useMemo(
    () =>
      filteredFlashSellProducts.map((product) => {
        const regularPrice = parseFloat(product.price) || 0;
        const flashPrice =
          parseFloat(product.flashSellPrice ?? product.price) || 0;
        const discount =
          regularPrice > 0
            ? (((regularPrice - flashPrice) / regularPrice) * 100).toFixed(0)
            : 0;

        const now = new Date();
        const startTime = product.flashSellStartTime
          ? new Date(product.flashSellStartTime)
          : null;
        const endTime = product.flashSellEndTime
          ? new Date(product.flashSellEndTime)
          : null;

        let status = t("flashSell.scheduled");
        if (startTime && endTime) {
          if (now < startTime) {
            status = t("flashSell.scheduled");
          } else if (now >= startTime && now <= endTime) {
            status = t("common.active");
          } else {
            status = t("flashSell.expired");
          }
        }

        const productImage =
          product.image || product.images?.[0] || product.thumbnail;

        return {
          name: (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                {productImage ? (
                  <img
                    src={productImage}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                  {product.name || "-"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ID: {product.id}
                </span>
              </div>
            </div>
          ),
          sku: (
            <div className="flex items-center gap-1.5 text-sm font-mono text-gray-500 dark:text-gray-400">
              <Tag className="w-3 h-3" />
              {product.sku || "-"}
            </div>
          ),
          regularPrice: (
            <span className="line-through text-gray-400 text-sm">
              ${regularPrice.toFixed(2)}
            </span>
          ),
          flashPrice: (
            <div className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
              <span>${flashPrice.toFixed(2)}</span>
            </div>
          ),
          discount: (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 w-fit">
              <Percent className="w-3 h-3" />
              {discount}% OFF
            </div>
          ),
          duration: (
            <div className="flex flex-col text-xs text-gray-500 dark:text-gray-400 gap-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-emerald-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {startTime
                    ? startTime.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })
                    : "-"}
                </span>
                <span className="text-gray-400">to</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {endTime
                    ? endTime.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })
                    : "-"}
                </span>
              </div>
              <div className="pl-4.5 text-[10px] opacity-80">
                {startTime
                  ? startTime.toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}{" "}
                -
                {endTime
                  ? endTime.toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </div>
            </div>
          ),
          status: (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                status === t("common.active")
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                  : status === t("flashSell.scheduled")
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20"
                    : "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700"
              }`}
            >
              {status === t("common.active") && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              )}
              {status}
            </span>
          ),
          actions: (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {t("flashSell.viewProduct")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteModal({ isOpen: true, product })}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("flashSell.removeFromFlashSell")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        };
      }),
    [filteredFlashSellProducts, navigate, isRemoving, t],
  );

  const handleProductToggle = (productId) => {
    setSelectedProducts((prev) => {
      const newSelection = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      setValue("productIds", newSelection);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === availableProducts.length) {
      const empty = [];
      setSelectedProducts(empty);
      setValue("productIds", empty);
    } else {
      const allIds = availableProducts.map((p) => p.id);
      setSelectedProducts(allIds);
      setValue("productIds", allIds);
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        productIds:
          selectedProducts.length > 0 ? selectedProducts : data.productIds,
        flashSellStartTime: data.flashSellStartTime,
        flashSellEndTime: data.flashSellEndTime,
        ...(data.flashSellPrice
          ? { flashSellPrice: parseFloat(data.flashSellPrice) }
          : {}),
      };

      const res = await setFlashSell(payload).unwrap();
      if (res) {
        toast.success(t("flashSell.flashSellSetSuccess"));
        reset();
        setSelectedProducts([]);
        setActiveTab("list");
      }
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          t("flashSell.flashSellSetFailed"),
      );
    }
  };

  const handleRemoveFlashSell = async () => {
    if (!deleteModal.product) return;

    try {
      const res = await removeFlashSell({
        productIds: [deleteModal.product.id],
      }).unwrap();
      if (res) {
        toast.success(t("flashSell.productRemovedFromFlashSell"));
        setDeleteModal({ isOpen: false, product: null });
      }
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          t("flashSell.flashSellRemoveFailed"),
      );
    }
  };

  // Format datetime-local value from Date
  const getDateTimeLocal = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Get minimum datetime (now)
  const minDateTime = getDateTimeLocal(new Date());

  const handleExportToPDF = () => {
    exportFlashSellToPDF(flashSellProducts, "Flash_Sell_Products");
  };

  return (
    <div className="p-6 lg:p-0 bg-[#f8f9fa] dark:bg-[#0b0f14] min-h-screen font-sans space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-2">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            Flash Sell{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Management
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-lg text-base">
            {t("flashSell.description") ||
              "Create and manage time-limited flash sales for your products."}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6 space-y-6">
        {/* Tabs & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-1 p-1.5 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={() => setActiveTab("list")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === "list"
                  ? "bg-white dark:bg-[#1a1f26] text-indigo-600 dark:text-indigo-400 shadow-md shadow-gray-200/50 dark:shadow-none ring-1 ring-black/5 dark:ring-white/10"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5"
              }`}
            >
              <List className="w-4 h-4" />
              {t("flashSell.flashSellList")}
              <span
                className={`ml-1.5 px-2 py-0.5 rounded-md text-xs ${
                  activeTab === "list"
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                {flashSellProducts.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === "add"
                  ? "bg-white dark:bg-[#1a1f26] text-indigo-600 dark:text-indigo-400 shadow-md shadow-gray-200/50 dark:shadow-none ring-1 ring-black/5 dark:ring-white/10"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5"
              }`}
            >
              <Plus className="w-4 h-4" />
              {t("flashSell.addFlashSell")}
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {activeTab === "list" && (
              <div className="relative w-full md:w-64 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <Input
                  placeholder={t("common.search")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 bg-white dark:bg-black/20 border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                />
              </div>
            )}

            {activeTab === "list" && flashSellProducts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportToPDF}
                className="h-11 px-5 rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium"
              >
                <Download className="h-4 w-4 mr-2" />
                {t("common.export")}
              </Button>
            )}
          </div>
        </div>

        {activeTab === "list" ? (
          <ReusableTable
            data={tableData}
            headers={headers}
            total={filteredFlashSellProducts.length}
            isLoading={isLoading}
            py="py-4"
            searchable={false}
          />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Product Selection */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between bg-white dark:bg-[#1a1f26] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Package className="w-5 h-5 text-indigo-500" />
                      {t("flashSell.selectProducts")}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedProducts.length} products selected
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-medium"
                  >
                    {selectedProducts.length === availableProducts.length
                      ? t("flashSell.deselectAll")
                      : t("flashSell.selectAll")}
                  </Button>
                </div>

                <div className="min-h-[400px]">
                  {availableProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1a1f26] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                      <div className="h-20 w-20 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <Package className="h-10 w-10 text-gray-400" />
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium text-lg">
                        {t("flashSell.noAvailableProducts")}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 max-w-xs text-center">
                        All active products are already in flash sell or hidden.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {availableProducts.map((product) => {
                        const isSelected = selectedProducts.includes(
                          product.id,
                        );
                        const productImage =
                          product.image ||
                          product.images?.[0] ||
                          product.thumbnail;

                        return (
                          <div
                            key={product.id}
                            onClick={() => handleProductToggle(product.id)}
                            className={`group relative flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                              isSelected
                                ? "bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-500 shadow-lg shadow-indigo-500/10"
                                : "bg-white dark:bg-[#1a1f26] border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5"
                            }`}
                          >
                            {/* Selection Indicator */}
                            <div
                              className={`absolute top-4 right-4 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isSelected
                                  ? "bg-indigo-600 text-white scale-100 opacity-100 shadow-md shadow-indigo-500/30"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-300 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100"
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>

                            <div className="h-16 w-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                              {productImage ? (
                                <img
                                  src={productImage}
                                  alt={product.name}
                                  className="h-full w-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0 pr-8">
                              <h4
                                className={`font-bold text-sm truncate transition-colors ${
                                  isSelected
                                    ? "text-indigo-900 dark:text-indigo-300"
                                    : "text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                                }`}
                              >
                                {product.name || product.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
                                <span className="font-semibold text-gray-900 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                                  $
                                  {typeof product.price === "number"
                                    ? product.price.toFixed(2)
                                    : product.price}
                                </span>
                                <span className="flex items-center gap-1.5 text-gray-400">
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      (product.stock ?? 0) > 0
                                        ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                        : "bg-red-500"
                                    }`}
                                  />
                                  {product.stock ?? 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {errors.productIds && (
                  <p className="text-red-500 text-sm mt-1 font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-center gap-2">
                    <X className="w-4 h-4" />
                    {errors.productIds.message}
                  </p>
                )}
              </div>

              {/* Right Column: Configuration Panel */}
              <div className="lg:col-span-4 space-y-6 sticky top-6">
                <div className="bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-indigo-500 fill-indigo-500" />
                      Configuration
                    </h3>
                  </div>

                  <div className="p-6 space-y-6">
                    <Controller
                      name="flashSellStartTime"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          label={t("flashSell.startTimeRequired")}
                          type="datetime-local"
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.flashSellStartTime?.message}
                          min={minDateTime}
                          inputClassName="bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-black/40 transition-all"
                        />
                      )}
                    />

                    <Controller
                      name="flashSellEndTime"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          label={t("flashSell.endTimeRequired")}
                          type="datetime-local"
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.flashSellEndTime?.message}
                          min={flashSellStartTime || minDateTime}
                          inputClassName="bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-black/40 transition-all"
                        />
                      )}
                    />

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                      <Controller
                        name="flashSellPrice"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            label={t("flashSell.flashPriceOptional")}
                            placeholder="Optional price override"
                            type="number"
                            step="0.01"
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.flashSellPrice?.message}
                            inputClassName="bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-black/40 transition-all"
                            helperText="Leave empty to keep original price"
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                    <Button
                      type="submit"
                      disabled={isSetting || selectedProducts.length === 0}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-0.5"
                    >
                      {isSetting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2 fill-white" />
                          {t("flashSell.setFlashSell")}
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        reset();
                        setSelectedProducts([]);
                        setActiveTab("list");
                      }}
                      disabled={isSetting}
                      className="w-full h-10 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                    >
                      {t("common.cancel")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Delete Modal */}
        <DeleteModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, product: null })}
          onConfirm={handleRemoveFlashSell}
          title={t("flashSell.removeFromFlashSellTitle")}
          description={t("flashSell.removeFromFlashSellDesc")}
          itemName={deleteModal.product?.name || deleteModal.product?.title}
          isLoading={isRemoving}
        />
      </div>
    </div>
  );
};

export default FlashSellPage;
