import React from "react";
import { useTranslation } from "react-i18next";
import { Download, ChevronDown, FileDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Credit notes page header: title, subtitle, and export dropdown.
 * Target ~150 lines per component.
 */
const CreditNotesPageHeader = ({
  onExportCurrentView,
  onExportAllRecords,
  currentPageRecordCount,
  allFilteredRecordCount,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t("creditNotes.title")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t("creditNotes.subtitle")}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-white dark:bg-[#1a1f26] border-gray-200 dark:border-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              <Download className="w-4 h-4 mr-2" /> {t("creditNotes.export")}
              <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center gap-2">
              <FileDown className="w-4 h-4 text-[#976DF7]" />
              {t("creditNotes.exportOptions")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onExportCurrentView}
              className="cursor-pointer hover:bg-[#976DF7]/10 focus:bg-[#976DF7]/10"
            >
              <FileText className="w-4 h-4 mr-2 text-[#976DF7]" />
              <div className="flex flex-col">
                <span className="font-medium">{t("creditNotes.exportCurrentView")}</span>
                <span className="text-xs text-gray-500">
                  {currentPageRecordCount || 0} {t("creditNotes.records")}
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onExportAllRecords}
              className="cursor-pointer hover:bg-[#976DF7]/10 focus:bg-[#976DF7]/10"
            >
              <FileText className="w-4 h-4 mr-2 text-[#976DF7]" />
              <div className="flex flex-col">
                <span className="font-medium">{t("creditNotes.exportAllRecords")}</span>
                <span className="text-xs text-gray-500">
                  {allFilteredRecordCount || 0} {t("creditNotes.records")}
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default CreditNotesPageHeader;
