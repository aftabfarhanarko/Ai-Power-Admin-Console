import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react";
import ProductFormCard from "../ProductFormCard";
import ProductFormInput from "../ProductFormInput";

export default function ProductShippingSection({ register, errors }) {
  const { t } = useTranslation();
  
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4">
        {t("productForm.shippingAndDelivery")}
      </h3>
      <ProductFormCard>
        <div className="space-y-4">
          <ProductFormInput label={t("productForm.itemsWeight")} error={errors.weight?.message}>
            <div className="relative">
              <input
                {...register("weight")}
                type="number"
                step="0.01"
                min="0"
                placeholder={t("productForm.weightPlaceholder")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none font-medium transition-all duration-200"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                kg <ChevronLeft className="inline w-3 h-3 rotate-270" />
              </span>
            </div>
          </ProductFormInput>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("productForm.packageSize")}
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-slate-500 mb-1">{t("productForm.length")}</div>
                <input
                  {...register("length")}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={t("productForm.dimensionPlaceholder")}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none font-medium text-center transition-all duration-200"
                />
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">{t("productForm.breadth")}</div>
                <input
                  {...register("breadth")}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={t("productForm.dimensionPlaceholder")}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none font-medium text-center transition-all duration-200"
                />
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">{t("productForm.width")}</div>
                <input
                  {...register("width")}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={t("productForm.dimensionPlaceholder")}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none font-medium text-center transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>
      </ProductFormCard>
    </div>
  );
}
