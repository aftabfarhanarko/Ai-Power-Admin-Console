import React from "react";
import { motion } from "framer-motion";
import { ArrowDownCircle, ArrowUpCircle, History, MoreHorizontal, Package } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TablePaginate from "@/components/table/pagination";

const SkeletonBar = ({ className = "" }) => (
  <div className={`h-3 rounded bg-slate-200/70 dark:bg-slate-700/50 ${className}`} />
);

const InventoryTable = ({
  isLoading,
  processedTotal,
  paginatedData,
  renderPrice,
  navigate,
  visibleColumns,
  visibleColumnCount,
  pageSize,
  setPageSize,
  currentPage,
  setCurrentPage,
  setStockModal,
  setHistoryModal,
}) => {
  const { t } = useTranslation();
  const isTableLoading = isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none"
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-sm">
            <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
              {visibleColumns?.details !== false && (
                <TableHead className="h-14 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("inventory.productDetails")}
                </TableHead>
              )}
              {visibleColumns?.sku !== false && (
                <TableHead className="h-14 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("inventory.skuCode")}
                </TableHead>
              )}
              {visibleColumns?.stock !== false && (
                <TableHead className="h-14 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("inventory.stockLevel")}
                </TableHead>
              )}
              {visibleColumns?.pricing !== false && (
                <TableHead className="h-14 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("inventory.pricing")}
                </TableHead>
              )}
              {visibleColumns?.actions !== false && (
                <TableHead className="h-14 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right pr-6">
                  {t("inventory.actions")}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isTableLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow
                  key={i}
                  className="border-slate-100 dark:border-slate-800/50"
                >
                  {visibleColumns?.details !== false && (
                    <TableCell className="pl-6 py-5">
                      <div className="flex items-center gap-4 animate-pulse">
                        <div className="w-12 h-12 rounded-xl bg-slate-200/70 dark:bg-slate-700/50" />
                        <div className="space-y-2 w-full">
                          <SkeletonBar className="w-32" />
                          <SkeletonBar className="w-20 h-2.5 opacity-70" />
                        </div>
                      </div>
                    </TableCell>
                  )}

                  {visibleColumns?.sku !== false && (
                    <TableCell className="py-5">
                      <div className="animate-pulse">
                        <SkeletonBar className="w-20 h-6 rounded-md" />
                      </div>
                    </TableCell>
                  )}

                  {visibleColumns?.stock !== false && (
                    <TableCell className="py-5">
                      <div className="animate-pulse space-y-2 w-32">
                        <SkeletonBar className="w-16" />
                        <SkeletonBar className="w-full h-2 rounded-full opacity-70" />
                      </div>
                    </TableCell>
                  )}

                  {visibleColumns?.pricing !== false && (
                    <TableCell className="py-5">
                      <div className="animate-pulse space-y-2 w-28">
                        <SkeletonBar className="w-20" />
                        <SkeletonBar className="w-16 h-2.5 opacity-70" />
                      </div>
                    </TableCell>
                  )}

                  {visibleColumns?.actions !== false && (
                    <TableCell className="py-5 text-right pr-6">
                      <div className="flex justify-end gap-2 animate-pulse">
                        <SkeletonBar className="w-8 h-8 rounded-lg" />
                        <SkeletonBar className="w-8 h-8 rounded-lg" />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumnCount || 1}
                  className="h-64 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      <Package className="w-8 h-8 opacity-50" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      {t("inventory.noProductsFound")}
                    </h3>
                    <p className="text-sm">{t("inventory.tryAdjustingFilters")}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((product) => {
                const cleanThumbnail = product.thumbnail
                  ? product.thumbnail.replace(/`/g, "").trim()
                  : "";
                const imageUrl =
                  cleanThumbnail ||
                  product.images?.[0]?.url ||
                  product.images?.[0] ||
                  null;

                return (
                  <TableRow
                    key={product.id}
                    className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors border-slate-100 dark:border-slate-800/50"
                  >
                    {visibleColumns?.details !== false && (
                      <TableCell>
                        <div className="flex items-center gap-4 py-2">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform duration-300">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <span className="block font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 transition-colors">
                              {product.name}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {product.unit || t("inventory.piece")}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                    )}

                  {visibleColumns?.sku !== false && (
                    <TableCell>
                      <span className="font-mono text-xs font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300">
                        {product.sku || "—"}
                      </span>
                    </TableCell>
                  )}

                  {visibleColumns?.stock !== false && (
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-bold ${
                              (product.stock || 0) === 0
                                ? "text-red-500"
                                : (product.stock || 0) <= 5
                                  ? "text-amber-500"
                                  : "text-emerald-600"
                            }`}
                          >
                            {product.stock || 0}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {t("inventory.inStock")}
                          </span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (product.stock || 0) === 0
                                ? "bg-red-500"
                                : (product.stock || 0) <= 5
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                            }`}
                            style={{
                              width: `${Math.min(product.stock || 0, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                  )}

                    {visibleColumns?.pricing !== false && (
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {renderPrice(product.price)}
                          </span>
                          <span className="text-xs text-slate-400">
                            {t("inventory.cost")}{" "}
                            {renderPrice(product.costPrice || product.price * 0.8)}
                          </span>
                        </div>
                      </TableCell>
                    )}

                    {visibleColumns?.actions !== false && (
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                              >
                                <span className="sr-only">{t("inventory.openMenu")}</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="rounded-xl border-slate-200 dark:border-slate-800"
                            >
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/products/${product.id}/edit`)
                                }
                              >
                                <Package className="w-4 h-4 mr-2" /> {t("inventory.editDetails")}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />

                              <DropdownMenuItem
                                onClick={() =>
                                  setStockModal({
                                    isOpen: true,
                                    product,
                                    type: "in",
                                  })
                                }
                                className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 dark:focus:bg-emerald-900/20"
                              >
                                <ArrowDownCircle className="w-4 h-4 mr-2" /> {t("inventory.stockIn")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setStockModal({
                                    isOpen: true,
                                    product,
                                    type: "out",
                                  })
                                }
                                className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20"
                              >
                                <ArrowUpCircle className="w-4 h-4 mr-2" /> {t("inventory.stockOut")}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />

                              <DropdownMenuItem
                                onClick={() => navigate(`/inventory/${product.id}/history`)}
                              >
                                <History className="w-4 h-4 mr-2" /> {t("inventory.history")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
        <TablePaginate
          total={processedTotal}
          pageSize={pageSize}
          setPageSize={setPageSize}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </motion.div>
  );
};

export default InventoryTable;

