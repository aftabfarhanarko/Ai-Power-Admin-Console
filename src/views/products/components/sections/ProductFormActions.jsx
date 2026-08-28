import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ProductFormActions({
  handleSubmit,
  onSubmit,
  isUpdating,
  isUploading,
  isValid,
  submitLabel = "Publish",
  savingLabel = "Saving...",
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 pt-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate("/products")}
        className="flex-1 border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold h-12 rounded-xl dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-400"
      >
        {t("productForm.discard")}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="flex-1 border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-semibold h-12 rounded-xl dark:border-indigo-900/50 dark:hover:bg-indigo-500/10"
        onClick={handleSubmit((d) => onSubmit(d, { asDraft: true }))}
        disabled={isUpdating || isUploading || !isValid}
      >
        {isUpdating ? savingLabel : t("productForm.saveAsDraft")}
      </Button>
      <Button
        type="submit"
        disabled={isUpdating || isUploading || !isValid}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        {isUpdating ? savingLabel : submitLabel}
      </Button>
    </div>
  );
}
