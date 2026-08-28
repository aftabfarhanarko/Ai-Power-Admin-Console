import { Search, X, Command } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";

const OrdersSearchBar = ({ searchQuery, setSearchQuery }) => {
  const { t } = useTranslation();
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full mb-8">
      <div className="relative w-full max-w-[600px] group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder={t("orders.searchPlaceholder") || "Search orders by ID, customer, phone, email, tracking..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 pl-11 pr-12 rounded-[18px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium shadow-sm hover:shadow-md text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            aria-label={t("common.clear") || "Clear search"}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {!searchQuery && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-400 pointer-events-none select-none">
            <Command className="w-3 h-3" /> <span>/</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersSearchBar;
