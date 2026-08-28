import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Package, Plus, ArrowRight } from "lucide-react";
import TextField from "@/components/input/TextField";
import { useUpdateProductMutation } from "@/features/product/productApiSlice";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const RestockModal = ({ isOpen, onClose, product }) => {
  const { user } = useSelector((state) => state.auth);
  const [updateProduct, { isLoading }] = useUpdateProductMutation();
  const [newStock, setNewStock] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product || !newStock || parseInt(newStock) <= 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }

    const currentStock = product.stock || 0;
    const stockToAdd = parseInt(newStock);
    const updatedStock = currentStock + stockToAdd;

    try {
      const res = await updateProduct({
        id: product.id,
        body: {
          stock: updatedStock,
          newStock: stockToAdd,
        },
        params: { companyId: user?.companyId },
      });

      if (res?.data) {
        toast.success(`Successfully added ${stockToAdd} units. New stock: ${updatedStock}`);
        setNewStock("");
        onClose();
      } else {
        toast.error(res?.error?.data?.message || "Failed to restock product");
      }
    } catch (error) {
      toast.error("Failed to restock product: " + error.message);
    }
  };

  if (!isOpen || !product) return null;

  const currentStock = product.stock ?? 0;
  const projectedStock = newStock && parseInt(newStock) > 0 ? currentStock + parseInt(newStock) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200/80 dark:border-zinc-700/80 max-w-md w-full overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        role="dialog"
        aria-labelledby="restock-modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400">
            <Package className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="restock-modal-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Restock Product
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Add inventory to this product
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Product summary */}
        <div className="px-6 py-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Product
            </p>
            <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {product.name}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-200/80 dark:bg-zinc-700/80 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <Package className="h-3 w-3" />
                {currentStock} in stock
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <TextField
            label="Quantity to Add"
            placeholder="e.g. 50"
            value={newStock}
            onChange={(e) => setNewStock(e.target.value)}
            type="number"
            step="1"
            min="1"
            required
          />

          {projectedStock !== null && (
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Plus className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-emerald-700/80 dark:text-emerald-400/90 mb-0.5">
                  New total stock
                </p>
                <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">
                  {projectedStock} units
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !newStock || parseInt(newStock) <= 0}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              {isLoading ? "Adding…" : "Add Stock"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestockModal;
