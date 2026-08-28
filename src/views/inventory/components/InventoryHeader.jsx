import React from "react";
import { motion } from "framer-motion";
import { Box, Download, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

const InventoryHeader = ({ onExport, onAdd }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t("inventory.title")}
        </h1>
        <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <Box className="w-4 h-4" /> {t("inventory.overview")}
          </span>
          <span>•</span>
          <span>{t("inventory.subtitle")}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onExport}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Download className="w-4 h-4 mr-2" />
          {t("inventory.exportReport")}
        </Button>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
          onClick={onAdd}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("inventory.addNewItem")}
        </Button>
      </div>
    </motion.div>
  );
};

export default InventoryHeader;

