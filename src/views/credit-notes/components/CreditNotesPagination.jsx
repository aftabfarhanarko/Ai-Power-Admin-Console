import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Pagination for credit notes table: range text and page buttons.
 * Target ~150 lines per component.
 */
const CreditNotesPagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
}) => {
  const { t } = useTranslation();

  const start = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const end = Math.min(currentPage * itemsPerPage, totalItems || 0);

  const pageNumbers = (() => {
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }
    if (currentPage >= totalPages - 2) {
      return Array.from({ length: maxVisible }, (_, i) => totalPages - 4 + i);
    }
    return Array.from({ length: maxVisible }, (_, i) => currentPage - 2 + i);
  })();

  return (
    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/30 dark:bg-gray-900/10">
      <div className="text-sm text-gray-500">
        {t("creditNotes.showing")}{" "}
        <span className="font-bold text-gray-900 dark:text-white">{start}-{end}</span>{" "}
        {t("creditNotes.of")}{" "}
        <span className="font-bold text-gray-900 dark:text-white">{totalItems || 0}</span>{" "}
        {t("creditNotes.results")}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0 rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronDown className="w-4 h-4 rotate-90" />
        </Button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNum) => (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "ghost"}
              size="sm"
              className={`h-9 w-9 p-0 rounded-lg font-medium transition-all
                ${
                  currentPage === pageNum
                    ? "bg-[#976DF7] text-white shadow-md shadow-[#976DF7]/20 hover:bg-[#8250e5]"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                }
              `}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0 rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          <ChevronDown className="w-4 h-4 -rotate-90" />
        </Button>
      </div>
    </div>
  );
};

export default CreditNotesPagination;
