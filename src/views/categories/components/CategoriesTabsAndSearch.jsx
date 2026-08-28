import React from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

const CategoriesTabsAndSearch = ({
  t,
  activeTab,
  setActiveTab,
  tabCounts,
  searchTerm,
  setSearchTerm,
}) => {
  const { t: translate } = useTranslation();
  const translation = t || translate;
  
  const tabLabels = {
    all: translation("categories.all"),
    active: translation("categories.active"),
    disabled: translation("categories.disabled"),
    trash: translation("categories.trash"),
  };
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        {["all", "active", "disabled", "trash"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab
                ? "bg-white dark:bg-[#1a1f26] text-indigo-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <span className="flex items-center gap-2">
              <span>{tabLabels[tab]}</span>
              <span
                className={`min-w-6 px-2 py-0.5 rounded-md text-xs font-black ${
                  activeTab === tab
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                {tabCounts?.[tab] ?? 0}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="relative w-full md:w-64 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        <Input
          placeholder={translation("common.search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-10 bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>
    </div>
  );
};

export default CategoriesTabsAndSearch;

