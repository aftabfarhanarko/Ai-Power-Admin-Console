import React from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

export default function ProductSizeVariantSection({
  sizes,
  selectedSizes,
  setSelectedSizes,
  setSizes,
  isAddingSize,
  setIsAddingSize,
  newSizeValue,
  setNewSizeValue,
}) {
  const { t } = useTranslation();
  
  return (
    <div className="grid grid-cols-12 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="col-span-12 lg:col-span-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
          {t("productForm.sizeVariant")}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          {t("productForm.sizeVariantHint")}
        </p>
      </div>
      <div className="col-span-12 lg:col-span-8">
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => {
                if (selectedSizes.includes(size)) {
                  setSelectedSizes(selectedSizes.filter((s) => s !== size));
                } else {
                  setSelectedSizes([...selectedSizes, size]);
                }
              }}
              className={`min-w-[48px] h-12 px-2 rounded-xl flex items-center justify-center font-medium transition-all border text-sm ${
                selectedSizes.includes(size)
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
              }`}
            >
              {size}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setIsAddingSize(true)}
            className="w-12 h-12 rounded-xl flex items-center justify-center font-medium bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        {isAddingSize && (
          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              autoFocus
              placeholder={t("productForm.enterSize")}
              className="w-24 h-12 px-3 rounded-xl border-2 border-indigo-600 text-center font-medium outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm shadow-md"
              value={newSizeValue}
              onChange={(e) => setNewSizeValue(e.target.value)}
              onBlur={() => {
                if (
                  newSizeValue.trim() &&
                  !sizes.includes(newSizeValue.trim())
                ) {
                  setSizes([...sizes, newSizeValue.trim()]);
                  setSelectedSizes([
                    ...selectedSizes,
                    newSizeValue.trim(),
                  ]);
                }
                setNewSizeValue("");
                setIsAddingSize(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.target.blur();
                } else if (e.key === "Escape") {
                  setNewSizeValue("");
                  setIsAddingSize(false);
                }
              }}
            />
            <span className="text-xs text-slate-400">{t("productForm.pressEnterToAdd")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
