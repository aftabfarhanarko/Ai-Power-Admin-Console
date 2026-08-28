import React from "react";
import { motion } from "framer-motion";
import { ChevronDown, LayoutGrid, ListFilter, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const InventoryToolbar = ({
  searchTerm,
  setSearchTerm,
  selectedCategoryId,
  setSelectedCategoryId,
  categoryOptions,
  setSortConfig,
  visibleColumns,
  toggleColumn,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
    >
      <div className="relative w-full sm:max-w-md group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
          type="text"
          placeholder={t("inventory.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
        <Button
          variant="outline"
          className="flex-1 sm:flex-none border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
        >
          <ListFilter className="w-4 h-4 mr-2" />
          {t("inventory.filter")}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 sm:flex-none border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
            >
              {t("inventory.category")}:{" "}
              <span className="ml-1 max-w-[140px] truncate">
                {categoryOptions?.find(
                  (c) => c.value === String(selectedCategoryId),
                )?.label || t("inventory.allCategories")}
              </span>
              <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-xl border-slate-200 dark:border-slate-800 max-h-[320px] overflow-y-auto"
          >
            {(categoryOptions || [{ label: t("inventory.allCategories"), value: "" }]).map(
              (opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setSelectedCategoryId(opt.value)}
                >
                  {opt.label}
                </DropdownMenuItem>
              ),
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 sm:flex-none border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
            >
              {t("inventory.sortByLatest")}
              <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-xl border-slate-200 dark:border-slate-800"
          >
            <DropdownMenuItem
              onClick={() => setSortConfig({ key: "createdAt", direction: "desc" })}
            >
              {t("inventory.sortLatestAdded")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortConfig({ key: "stock", direction: "asc" })}
            >
              {t("inventory.sortStockLowToHigh")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortConfig({ key: "stock", direction: "desc" })}
            >
              {t("inventory.sortStockHighToLow")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-xl border-slate-200 dark:border-slate-800 w-56"
          >
            <div className="grid grid-cols-2 gap-1 p-1">
              {[
                {
                  key: "details",
                  label: t("inventory.columnDetails"),
                  color: "bg-indigo-500",
                },
                {
                  key: "sku",
                  label: t("inventory.columnSku"),
                  color: "bg-slate-500",
                },
                {
                  key: "stock",
                  label: t("inventory.columnStock"),
                  color: "bg-amber-500",
                },
                {
                  key: "pricing",
                  label: t("inventory.columnPricing"),
                  color: "bg-emerald-500",
                },
                {
                  key: "actions",
                  label: t("inventory.columnActions"),
                  color: "bg-purple-500",
                },
              ].map((col) => (
                <DropdownMenuItem
                  key={col.key}
                  onSelect={(e) => e.preventDefault()}
                  onClick={() => toggleColumn(col.key)}
                  className="col-span-1 flex items-center justify-between gap-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 py-2"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-sm ${col.color}`} />
                    <span className="text-sm truncate">{col.label}</span>
                  </span>
                  <Checkbox checked={!!visibleColumns?.[col.key]} />
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              onClick={() => {
                ["details", "sku", "stock", "pricing", "actions"].forEach((k) => {
                  if (!visibleColumns?.[k]) toggleColumn(k);
                });
              }}
            >
              {t("inventory.resetColumns")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};

export default InventoryToolbar;

