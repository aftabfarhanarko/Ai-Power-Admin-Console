import React from "react";
import { useTranslation } from "react-i18next";
import { X, Plus, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductVariantSection({
  variants,
  updateVariant,
  removeVariant,
  isAddingVariant,
  setIsAddingVariant,
  newVariantName,
  setNewVariantName,
  newVariantColor,
  setNewVariantColor,
  handleAddVariant,
}) {
  const { t } = useTranslation();
  
  return (
    <div className="grid grid-cols-12 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="col-span-12 lg:col-span-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
          {t("productForm.productNameAndColorVariant")}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          {t("productForm.variantHint")}
        </p>
      </div>
      <div className="col-span-12 lg:col-span-8">
        <div className="space-y-3 grid grid-cols-2 gap-5">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm group hover:border-indigo-300 transition-all duration-200"
            >
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer">
                <input
                  type="color"
                  value={variant.color || "#6366f1"}
                  onChange={(e) =>
                    updateVariant(variant.id, "color", e.target.value)
                  }
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={variant.name}
                  onChange={(e) =>
                    updateVariant(variant.id, "name", e.target.value)
                  }
                  placeholder={t("productForm.variantName")}
                  className="w-full bg-transparent border-none outline-none font-medium text-slate-900 dark:text-slate-50 placeholder-slate-400 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => removeVariant(variant.id)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          {isAddingVariant ? (
            <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900 rounded-xl border-2 border-indigo-600 shadow-md">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer">
                <input
                  type="color"
                  value={newVariantColor}
                  onChange={(e) => setNewVariantColor(e.target.value)}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                />
              </div>
              <input
                type="text"
                value={newVariantName}
                onChange={(e) => setNewVariantName(e.target.value)}
                placeholder={t("productForm.variantNamePlaceholder")}
                className="flex-1 bg-transparent border-none outline-none font-medium text-slate-900 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddVariant();
                  } else if (e.key === "Escape") {
                    setNewVariantName("");
                    setIsAddingVariant(false);
                  }
                }}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddVariant}
                  className="h-8 px-4 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-semibold"
                >
                  {t("productForm.add")}
                </Button>
                <button
                  type="button"
                  onClick={() => setIsAddingVariant(false)}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingVariant(true)}
              className="px-5 py-3 rounded-xl border border-dashed border-indigo-300 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors flex items-center gap-2 w-fit"
            >
              <Plus className="w-4 h-4" />
              {t("productForm.addNewVariant")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
