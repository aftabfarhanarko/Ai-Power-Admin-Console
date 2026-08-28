import React from "react";
import { useTranslation } from "react-i18next";

export default function ProductsTabs({
  activeTab,
  onTabChange,
  publishedCount = 0,
  draftsCount = 0,
  trashCount = 0,
}) {
  const { t } = useTranslation();
  
  const TABS = [
    { key: "published", label: t("products.published") },
    { key: "drafts", label: t("products.drafts") },
    { key: "trash", label: t("products.trash") },
  ];
  
  const counts = {
    published: publishedCount,
    drafts: draftsCount,
    trash: trashCount,
  };

  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onTabChange(tab.key)}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === tab.key
              ? "bg-white dark:bg-[#1a1f26] text-indigo-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          {tab.label}
          <span
            className={`text-xs px-1.5 py-0.5 rounded-md ${
              activeTab === tab.key
                ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            }`}
          >
            {counts[tab.key] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
