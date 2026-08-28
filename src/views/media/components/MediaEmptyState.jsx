import React from "react";
import { useTranslation } from "react-i18next";
import { Image as ImageIcon, Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";

/**
 * Empty state when no media items exist
 */
export default function MediaEmptyState({ onUploadClick }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-500 dark:text-gray-400">
      <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
      <p className="text-lg font-medium">{t("media.noMediaYet")}</p>
      <p className="text-sm mt-1">{t("media.uploadFirstImage")}</p>
      <Button
        onClick={onUploadClick}
        className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        {t("media.uploadMedia")}
      </Button>
    </div>
  );
}
