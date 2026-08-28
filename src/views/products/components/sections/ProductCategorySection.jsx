import React from "react";
import { useTranslation } from "react-i18next";
import Dropdown from "@/components/dropdown/dropdown";

export default function ProductCategorySection({
  categoryOptions,
  categoryOption,
  setCategoryOption,
}) {
  const { t } = useTranslation();
  
  return (
    <div className="grid grid-cols-12 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="col-span-12 lg:col-span-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
          {t("productForm.category")}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          {t("productForm.categoryHint")}
        </p>
      </div>
      <div className="col-span-12 lg:col-span-8">
        <Dropdown
          name={t("productForm.category")}
          options={categoryOptions}
          setSelectedOption={setCategoryOption}
          className="w-full max-w-xs"
          triggerClassName="w-full h-14 px-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-medium text-left flex justify-between items-center text-sm transition-all shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700"
        >
          {categoryOption?.label || t("productForm.selectCategory")}
        </Dropdown>
      </div>
    </div>
  );
}
