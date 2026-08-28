import React from "react";
import { useTranslation } from "react-i18next";
import ProductFormCard from "../ProductFormCard";
import ProductFormInput from "../ProductFormInput";

export default function ProductPricingSection({ register, errors }) {
  const { t } = useTranslation();
  
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4">
        {t("productForm.pricing")}
      </h3>
      <ProductFormCard>
        <div className="space-y-4">
          <ProductFormInput
            label={t("productForm.inventoryStock")}
            error={errors.stock?.message}
            hint={t("productForm.stockHint")}
          >
            <input
              {...register("stock")}
              type="number"
              min="0"
              step="1"
              placeholder={t("productForm.stockPlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none font-medium transition-all duration-200"
            />
          </ProductFormInput>
          <div className="grid grid-cols-2 gap-4">
            <ProductFormInput label={t("productForm.price")} error={errors.price?.message}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                  $
                </span>
                <input
                  {...register("price")}
                  type="number"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none font-medium transition-all duration-200"
                  placeholder={t("productForm.priceExamplePlaceholder")}
                />
              </div>
            </ProductFormInput>
            <ProductFormInput
              label={t("productForm.discountSalePrice")}
              error={errors.discountPrice?.message}
              hint={t("productForm.discountPriceHint")}
            >
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                  $
                </span>
                <input
                  {...register("discountPrice")}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none font-medium transition-all duration-200"
                  placeholder={t("productForm.discountPriceExamplePlaceholder")}
                />
              </div>
            </ProductFormInput>
          </div>
        </div>
      </ProductFormCard>
    </div>
  );
}
