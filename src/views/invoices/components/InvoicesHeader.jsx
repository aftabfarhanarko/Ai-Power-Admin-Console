import React from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function InvoicesHeader({ onNewInvoice }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("invoices.header.title")}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {t("invoices.header.subtitle")}
        </p>
      </div>
      <Button
        className="bg-[#5347CE] hover:bg-[#4338ca] text-white px-6 shadow-lg shadow-[#5347CE]/20"
        onClick={onNewInvoice}
      >
        <Plus className="w-4 h-4 mr-2" />
        {t("invoices.header.newInvoice")}
      </Button>
    </div>
  );
}
