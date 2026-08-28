import React from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Package, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetProductStockHistoryQuery } from "@/features/product/productApiSlice";

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ProductHistoryModal = ({ isOpen, onClose, product }) => {
  const authUser = useSelector((state) => state.auth.user);

  const { data: history = [], isLoading, isError } = useGetProductStockHistoryQuery(
    isOpen && product
      ? {
          id: product.id,
          params: {
            companyId: authUser?.companyId,
            limit: 50,
          },
        }
      : { id: 0, params: {} },
    {
      skip: !isOpen || !product,
    },
  );

  if (!isOpen || !product) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="bg-white dark:bg-[#050816] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Stock History
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  All stock in/out events for this product.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <Package className="w-5 h-5 text-slate-400" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {product.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  SKU: {product.sku || "—"} • Current stock:{" "}
                  <span className="font-mono font-bold">
                    {product.stock ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-sm">
                  <TableRow className="border-slate-200 dark:border-slate-800">
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Date
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Type
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Quantity
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Balance
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Performed By
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Reason
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
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
                          Failed to load stock history. Please try again.
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          No stock adjustments recorded for this product yet.
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
                          {formatDateTime(entry.createdAt)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              entry.type === "IN"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                            }`}
                          >
                            {entry.type === "IN" ? "Stock In" : "Stock Out"}
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductHistoryModal;

