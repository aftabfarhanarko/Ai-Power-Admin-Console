import React from "react";
import { useTranslation } from "react-i18next";
import { Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const CustomerNotesCard = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {t("customers.internalNotes")}
        </h3>
      </div>
      <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-800/50">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200 leading-relaxed">
          {t("customers.internalNotesSample")}
        </p>
      </div>
      <Button
        variant="outline"
        className="w-full mt-4 rounded-xl border-dashed border-gray-300 dark:border-gray-700 text-gray-500 font-bold hover:text-indigo-600 hover:border-indigo-300"
      >
        <Plus className="w-4 h-4 mr-2" /> {t("customers.addNote")}
      </Button>
    </div>
  );
};

export default CustomerNotesCard;

