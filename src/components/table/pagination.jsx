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
    <div className={`flex items-center justify-between ${className || ""}`}>
      {/* Left side: Items per page selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-black/70 dark:text-white/70">
          {t("table.itemsPerPage")}
        </span>
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          className="h-9 px-3 border border-black/20 dark:border-white/20 rounded-md bg-white dark:bg-[#1a1f26] text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 cursor-pointer"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-sm text-black/70 dark:text-white/70">
          {startItem}-{endItem} {t("table.of")} {total} {t("table.items")}
        </span>
      </div>

      {/* Right side: Page navigation */}
      <div className="flex items-center gap-2">
        {/* First page button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handlePageChange(1)}
          disabled={isFirstPage}
          className={`h-9 w-9 bg-black text-white ${isFirstPage ? "opacity-50 cursor-not-allowed" : "hover:bg-black/90"}`}
          title={t("table.firstPage")}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous button */}
        <Button
          variant="ghost"
          size="default"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={isFirstPage}
          className={`h-9 px-3 gap-1 bg-black text-white ${isFirstPage ? "opacity-50 cursor-not-allowed" : "hover:bg-black/90"}`}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{t("table.previous")}</span>
        </Button>

        {/* Current page indicator */}
        <div className="flex items-center gap-2">
          <div className="h-9 px-3 flex items-center justify-center border border-black/20 dark:border-white/20 rounded-md bg-white dark:bg-[#1a1f26] text-black dark:text-white text-sm font-medium min-w-[40px]">
            {currentPage}
          </div>
          <span className="text-sm text-black/70 dark:text-white/70">
            {t("table.of")} {totalPages}
          </span>
        </div>

        {/* Next button */}
        <Button
          variant="ghost"
          size="default"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={isLastPage}
          className={`h-9 px-3 gap-1 bg-black text-white ${isLastPage ? "opacity-50 cursor-not-allowed" : "hover:bg-black/90"}`}
        >
          <span>{t("table.next")}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handlePageChange(totalPages)}
          disabled={isLastPage}
          className={`h-9 w-9 bg-black text-white ${isLastPage ? "opacity-50 cursor-not-allowed" : "hover:bg-black/90"}`}
          title={t("table.lastPage")}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TablePaginate;
