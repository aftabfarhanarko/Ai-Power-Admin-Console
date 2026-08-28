import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Upload, Download, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { hasPermission, FeaturePermission } from "@/constants/feature-permission";

export default function ProductsPageHeader({
  onBulkUpload,
  onExport,
  t = (k) => k,
}) {
  const navigate = useNavigate();
  const { data: user } = useGetCurrentUserQuery();


  const canBulkUpload = hasPermission(user, FeaturePermission.PRODUCT_BULK_UPLOAD);
  const canManageFlashSell = hasPermission(user, FeaturePermission.FLASH_SELL);

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-2">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
          {t("products.pageHeadline")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium max-w-lg text-base">
          {t("products.pageSubheadline")}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {canBulkUpload && (
          <Button
            variant="outline"
            onClick={onBulkUpload ?? (() => navigate("/products/bulk-upload"))}
            className="h-14 px-6 rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] font-bold flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
          >
            <Upload className="w-5 h-5" />
            {t("products.bulkUpload")}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={onExport}
          className="h-14 px-6 rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] font-bold flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
        >
          <Download className="w-5 h-5" />
          {t("products.export")}
        </Button>
        {canManageFlashSell && (
          <Button
            variant="outline"
            onClick={() => navigate("/flash-sell")}
            className="h-14 px-6 rounded-2xl border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20 font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
          >
            <Zap className="w-5 h-5" />
            {t("nav.flashSell") || "Flash Sell"}
          </Button>
        )}
    
          <Button
            className="h-14 px-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold flex items-center gap-3 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => navigate("/products/create")}
          >
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-lg">{t("products.addProduct")}</span>
          </Button>
        
      </div>
    </div>
  );
}
