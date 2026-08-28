import React from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

const TableFilterResult = ({
  page,
  pageSize = 10,
  totalItems,
  filters,
  setFilters,
}) => {
  const { t } = useTranslation();
  const startItem = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
  const endItem = Math.min(page * pageSize, totalItems);

  const handleFilterChange = (key) => {
    setFilters((prev) => ({ ...prev, [key]: null }));
  };

  return (
    <div className="mt-6 ml-4 fl gap-6 h-12">
      <p className="text-sm">
        {totalItems > 0
          ? t("table.itemsShownOf", { start: startItem, end: endItem, total: totalItems })
          : t("table.itemsFound")}
      </p>
      <div className="fl gap-2.5">
        {Object.entries(filters).map(([key, filter]) =>
          filter?.value ? (
            <span
              key={key}
              className="fl gap-2 pl-3 pr-2 text-sm py-1.5 bg-gray-50 dark:bg-[#1a1f26] hover:bg-red-500/20 dark:bg-white/10 dark:hover:bg-red-500/20 tr rounded-full border dark:border-white/20"
            >
              {filter.label}
              <button onClick={() => handleFilterChange(key)}>
                <X className="h-4 w-4" />
              </button>
            </span>
          ) : null
        )}
      </div>
    </div>
  );
};

export default TableFilterResult;
