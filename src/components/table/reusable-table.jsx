import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FolderOpen,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TablePaginate from "./pagination";

/**
 * ReusableTable Component
 * Modern, client-side sortable, filterable and paginated table
 *
 * @param {Array} data - Array of row objects
 * @param {Array} headers - [{ header: string, field: string, sortable?: boolean }]
 * @param {boolean} isLoading - Show skeleton loading state
 * @param {boolean} searchable - Show search input (default: true)
 * @param {string} searchPlaceholder - Custom placeholder
 * @param {string[]} searchFields - Limit search to specific fields (optional)
 * @param {(item) => string} getRowClassName - Optional row class generator
 * @param {string} py - Optional custom padding-y class for cells (e.g. "py-5")
 * @param {(item) => void} onRowClick - Optional row click handler
 */
export default function ReusableTable({
  data = [],
  headers = [],
  isLoading = false,
  searchable = true,
  searchPlaceholder,
  searchFields = null,
  getRowClassName = null,
  py, // optional custom py class
  headerClassName = "", // optional custom header class
  total, // currently unused – maybe for server pagination later?
  onRowClick = null,
}) {
  const { t } = useTranslation();
  const placeholder =
    searchPlaceholder ?? t("table.searchPlaceholder") ?? "Search...";

  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Sorting handler
  const onHeaderClick = (field) => {
    if (!field) return;
    if (sortKey === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(field);
      setSortDir("asc");
    }
  };

  // Filtered data (search)
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    const searchLower = searchTerm.toLowerCase().trim();
    const fields = searchFields || headers.map((h) => h.field).filter(Boolean);

    return data.filter((item) =>
      fields.some((field) => {
        const value = item[field];
        if (value == null) return false;
        // Skip complex objects / components
        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          return false;
        }
        return String(value).toLowerCase().includes(searchLower);
      }),
    );
  }, [data, searchTerm, searchFields, headers]);

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    const copy = [...filteredData];

    copy.sort((a, b) => {
      const av = a?.[sortKey];
      const bv = b?.[sortKey];

      if (av == null && bv == null) return 0;
      if (av == null) return sortDir === "asc" ? -1 : 1;
      if (bv == null) return sortDir === "asc" ? 1 : -1;

      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }

      const aStr = String(av).toLowerCase();
      const bStr = String(bv).toLowerCase();
      return sortDir === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    return copy;
  }, [filteredData, sortKey, sortDir]);

  // Paginated slice
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Reset page when data or search changes significantly
  useEffect(() => {
    const maxPage = Math.ceil(sortedData.length / pageSize) || 1;
    if (currentPage > maxPage) {
      setCurrentPage(1);
    }
  }, [sortedData.length, pageSize, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const showPagination = !isLoading && sortedData.length > 0;

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      {searchable && (
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 text-sm glass-input placeholder-slate-400 dark:placeholder-slate-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Glass Table Wrapper */}
      <div className="glass-table-container">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="glass-table-header">
              <TableRow className="border-b border-slate-200/60 dark:border-white/10 hover:bg-transparent">
                {headers.map((cell, idx) => {
                  const isLast = idx === headers.length - 1;
                  const isActive = sortKey === cell.field;
                  const sortable = cell.sortable !== false;

                  const SortIcon = !sortable
                    ? null
                    : isActive
                      ? sortDir === "asc"
                        ? ArrowUp
                        : ArrowDown
                      : ArrowUpDown;

                  return (
                    <TableHead
                      key={cell.field || idx}
                      onClick={() => sortable && onHeaderClick(cell.field)}
                      className={`h-11 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 select-none py-3 px-4 ${
                        sortable
                          ? "cursor-pointer hover:text-slate-900 dark:hover:text-slate-100"
                          : ""
                      } ${isLast ? "text-center" : "text-left"} ${headerClassName}`}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        {cell.header}
                        {SortIcon && (
                          <SortIcon
                            size={14}
                            className={isActive ? "text-indigo-600 dark:text-indigo-400 opacity-100" : "opacity-40"}
                          />
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow
                    key={i}
                    className="border-b border-slate-200/40 dark:border-white/5"
                  >
                    {headers.map((_, j) => (
                      <TableCell key={j} className="py-4 px-4">
                        <div className="h-5 w-full max-w-[180px] glass-skeleton rounded-lg" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={headers.length}
                    className="h-36 text-center text-slate-500 dark:text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 py-4">
                      <FolderOpen className="w-8 h-8 text-slate-400 opacity-60" />
                      <p className="text-sm font-medium">
                        {searchTerm
                          ? (t("table.noResults") ?? "No results found")
                          : (t("table.empty") ?? "No data available")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, rowIdx) => {
                  const rowClass = getRowClassName?.(item) ?? "";
                  return (
                    <TableRow
                      key={rowIdx}
                      onClick={() => onRowClick?.(item)}
                      className={`glass-table-row border-b border-slate-200/50 dark:border-white/5 ${rowClass} ${onRowClick ? "cursor-pointer" : ""}`}
                    >
                      {headers.map((header, colIdx) => {
                        const isLast = colIdx === headers.length - 1;
                        return (
                          <TableCell
                            key={colIdx}
                            className={`${py || "py-3.5"} px-4 text-sm font-medium text-slate-900 dark:text-slate-100 ${
                              isLast ? "text-center" : "text-left"
                            }`}
                          >
                            {header.render
                              ? header.render(item)
                              : item[header.field] ?? "—"}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="pt-2">
          <TablePaginate
            total={sortedData.length}
            pageSize={pageSize}
            setPageSize={setPageSize}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
