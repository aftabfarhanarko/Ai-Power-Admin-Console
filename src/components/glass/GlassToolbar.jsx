import React from "react";
import { Search, Filter, X } from "lucide-react";

/**
 * Premium Search + Filter Toolbar Component
 */
export const GlassToolbar = ({
  searchQuery,
  onSearchChange,
  placeholder = "Search...",
  filters,
  activeFilterCount = 0,
  onClearFilters,
  actions,
  children,
  className = "",
}) => {
  return (
    <div className={`glass-panel p-3 sm:p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${className}`}>
      {/* Search Input */}
      {onSearchChange !== undefined && (
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 text-sm glass-input placeholder-slate-400 dark:placeholder-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Filter Options & Custom Children */}
      <div className="flex flex-wrap items-center gap-2">
        {filters}
        {children}

        {activeFilterCount > 0 && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors border border-rose-500/20"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear ({activeFilterCount})</span>
          </button>
        )}

        {actions && <div className="flex items-center gap-2 ml-auto">{actions}</div>}
      </div>
    </div>
  );
};

export default GlassToolbar;
