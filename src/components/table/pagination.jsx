import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const TablePaginate = ({
  className,
  total,
  pageSize,
  setPageSize,
  currentPage,
  setCurrentPage,
}) => {
  const { t } = useTranslation();
  // Calculate total pages
  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (page) => {
    if (page !== currentPage && page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value, 10);
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 ${className || ""}`}>
      {/* Left side: Items per page selector */}
      <div className="flex items-center gap-3 text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          {t("table.itemsPerPage")}
        </span>
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          className="h-8 px-2.5 glass-input text-xs font-semibold cursor-pointer"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          {startItem}-{endItem} {t("table.of")} {total} {t("table.items")}
        </span>
      </div>

      {/* Right side: Page navigation */}
      <div className="flex items-center gap-1.5">
        {/* First page button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(1)}
          disabled={isFirstPage}
          className="h-8 w-8 rounded-xl glass-input text-slate-700 dark:text-slate-200 disabled:opacity-40"
          title={t("table.firstPage")}
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={isFirstPage}
          className="h-8 px-3 text-xs font-semibold rounded-xl glass-input text-slate-700 dark:text-slate-200 disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1" />
          <span>{t("table.previous")}</span>
        </Button>

        {/* Current page indicator */}
        <div className="flex items-center gap-1.5 px-2">
          <div className="h-8 px-3 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold min-w-[32px]">
            {currentPage}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t("table.of")} {totalPages}
          </span>
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={isLastPage}
          className="h-8 px-3 text-xs font-semibold rounded-xl glass-input text-slate-700 dark:text-slate-200 disabled:opacity-40"
        >
          <span>{t("table.next")}</span>
          <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>

        {/* Last page button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(totalPages)}
          disabled={isLastPage}
          className="h-8 w-8 rounded-xl glass-input text-slate-700 dark:text-slate-200 disabled:opacity-40"
          title={t("table.lastPage")}
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default TablePaginate;
