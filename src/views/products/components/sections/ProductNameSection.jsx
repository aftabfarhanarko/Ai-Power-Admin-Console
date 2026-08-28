import React from "react";
import { useTranslation } from "react-i18next";

export default function ProductNameSection({ register, errors }) {
  const { t } = useTranslation();
  
  return (
    <div className="grid grid-cols-12 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="col-span-12 lg:col-span-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
          {t("productForm.productNameLabel")}<span className="text-red-500">*</span>
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          {t("productForm.productNameHint")}
        </p>
      </div>
      <div className="col-span-12 lg:col-span-8">
        <input
          {...register("name")}
          className="w-full h-14 px-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-medium transition-all shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 placeholder:text-slate-400"
          placeholder={t("productForm.productNamePlaceholder")}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>
    </div>
  );
}
