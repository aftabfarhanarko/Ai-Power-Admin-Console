import React from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import DescriptionInputWithAI from "@/components/input/DescriptionInputWithAI";

export default function ProductDescriptionSection({
  control,
  errors,
  watchedName,
}) {
  const { t } = useTranslation();

  return (
    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <DescriptionInputWithAI
            {...field}
            label={t("productForm.businessDescription")}
            placeholder={t("productForm.descriptionPlaceholder")}
            rows={6}
            error={errors.description?.message}
            type="product"
            title={watchedName}
          />
        )}
      />
    </div>
  );
}
