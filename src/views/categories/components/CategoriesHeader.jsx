import React from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

const CategoriesHeader = ({ t, onAdd }) => {
  const { t: translate } = useTranslation();
  const translation = t || translate;
  
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-2">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
          {translation("categories.title")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium max-w-lg text-base">
          {translation("categories.subtitle")}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button
          className="h-14 px-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold flex items-center gap-3 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 transform hover:-translate-y-1"
          onClick={onAdd}
        >
          <div className="bg-white/20 p-1.5 rounded-lg">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-lg">
            {translation("common.add")} {translation("nav.categories")}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default CategoriesHeader;

