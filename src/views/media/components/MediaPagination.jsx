import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui/button";

/**
 * Pagination controls for media library
 */
export default function MediaPagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-400 hover:text-indigo-600 disabled:opacity-50"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const p = i + 1;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                page === p
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "bg-white dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
              }`}
            >
              {p}
            </button>
          );
        })}
        {totalPages > 5 && (
          <>
            <span className="text-gray-400 px-1">...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                page === totalPages
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "bg-white dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
              }`}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-400 hover:text-indigo-600 disabled:opacity-50"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
