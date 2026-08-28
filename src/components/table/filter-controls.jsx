import React from "react";
import { useTranslation } from "react-i18next";
import Dropdown from "../dropdown/dropdown";
import SearchBar from "../input/search-bar";

const FilterControls = ({ filtersConfig, filters, setFilters }) => {
  const { t } = useTranslation();
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const resetFilters = () => {
    setFilters({});
  };
  return (
    <div className="fl flex-wrap gap-4">
      {Object.values(filters).some((filter) => filter?.value) && (
        <button
          onClick={resetFilters}
          className="fl gap-2 px-4 text-sm py-2 bg-primary opacity-80 hover:opacity-100 tr text-white rounded-full border border-primary"
        >
          {t("table.resetFilter")}
        </button>
      )}
      {filtersConfig.map((filter) =>
        filter.type === "dropdown" ? (
          <Dropdown
            key={filter.key}
            name={filter.label}
            options={filter.options}
            setSelectedOption={(value) => handleFilterChange(filter.key, value)}
            className="border-blue-100 bg-gray-50 dark:bg-[#1a1f26] py-2"
          >
            {filters[filter.key]?.label || (
              <span className="text-black/50 dark:text-white/50">
                {filter.label}
              </span>
            )}
          </Dropdown>
        ) : filter.type === "search" ? (
          <SearchBar
            key={filter.key}
            placeholder={filter.placeholder}
            setSearhValue={(value) => handleFilterChange(filter.key, value)}
            searchValue={filters[filter.key]}
          />
        ) : null
      )}
    </div>
  );
};

export default FilterControls;
