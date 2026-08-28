import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Trash2 } from "lucide-react";

export default function ProductFormHeader({ title, backLabel }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const defaultTitle = title || t("productForm.editProduct");
  const defaultBackLabel = backLabel || t("productForm.backToProductList");

  return (
    <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all duration-200">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/products")}
            className="hover:bg-indigo-50 dark:hover:bg-indigo-900/20 p-2 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Button>
          <div>
            <div className="hidden md:block text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">{defaultBackLabel}</div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {defaultTitle}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/products", { state: { tab: "drafts" } })}
            className="hidden md:flex text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            {t("productForm.drafts")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/products", { state: { tab: "trash" } })}
            className="hidden md:flex text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            {t("productForm.trash")}
          </Button>
          <Button
            variant="outline"
            className="text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-sm"
          >
            {t("productForm.viewShop")}
          </Button>
        </div>
      </div>
    </div>
  );
}
