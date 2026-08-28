import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Clock, Package, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetProductQuery,
  useGetProductStockHistoryQuery,
} from "@/features/product/productApiSlice";

const formatDateTime = (value, locale = "en-US") => {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const InventoryHistoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const { t, i18n } = useTranslation();

  const {
    data: product,
    isLoading: isProductLoading,
    isError: isProductError,
  } = useGetProductQuery(id, {
    skip: !id,
  });

  const {
    data: history = [],
    isLoading,
    isError,
  } = useGetProductStockHistoryQuery(
    id && authUser
      ? {
          id,
          params: {
            companyId: authUser.companyId,
            limit: 50,
          },
        }
      : { id: 0, params: {} },
    {
      skip: !id || !authUser,
    },
  );

  const isPageLoading = isProductLoading || isLoading;

  const cleanThumbnail = product?.thumbnail
    ? product.thumbnail.replace(/`/g, "").trim()
    : "";
  const imageUrl =
    cleanThumbnail ||
    product?.images?.[0]?.url ||
    product?.images?.[0] ||
    null;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 lg:p-8 space-y-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 dark:to-transparent -z-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-slate-200 dark:border-slate-700"
            onClick={() => navigate("/inventory")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                {t("inventory.historyTitle")}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("inventory.historySubtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#050816] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="px-6 pt-4 pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
          {isProductError ? (
            <div className="text-sm text-red-500">
              {t("inventory.failedToLoadProductDetails")}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product?.name || t("inventory.loadingProduct")}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {product?.name || t("inventory.loadingProduct")}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {t("inventory.sku")} {product?.sku || "—"} • {t("inventory.currentStockLabel")}{" "}
                  <span className="font-mono font-bold">
                    {product?.stock ?? 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4">
          <div className="h-full overflow-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <Table>
              <TableHeader className="bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-sm">
                <TableRow className="border-slate-200 dark:border-slate-800">
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t("inventory.date")}
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t("inventory.type")}
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t("inventory.quantity")}
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t("inventory.balance")}
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t("inventory.performedBy")}
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t("inventory.reason")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPageLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6} className="h-14">
                        <div className="h-3 w-full rounded bg-slate-200/70 dark:bg-slate-800/60 animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {t("inventory.loadHistoryFailed")}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {t("inventory.noHistory")}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className="border-slate-100 dark:border-slate-800"
                    >
                      <TableCell className="text-sm text-slate-700 dark:text-slate-200">
                        {formatDateTime(
                          entry.createdAt,
                          i18n.language === "bn" ? "bn-BD" : "en-US",
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            entry.type === "IN"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                          }`}
                        >
                          {entry.type === "IN"
                            ? t("inventory.stockIn")
                            : t("inventory.stockOut")}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {entry.quantity > 0 ? "+" : ""}
                        {entry.quantity}
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {entry.previousStock} →{" "}
                          <span className="font-semibold">
                            {entry.newStock}
                          </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {entry.user?.name || entry.user?.email || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {entry.reason || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryHistoryPage;

