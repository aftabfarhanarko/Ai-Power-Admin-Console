import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Renders a status badge with specific colors for credit note/order status.
 * Kept under ~50 lines; part of credit-notes component set (~150 lines per compo).
 */
const CreditNotesStatusBadge = ({ status }) => {
  const { t } = useTranslation();

  switch (status) {
    case "Paid":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {t("creditNotes.paid")}
        </span>
      );
    case "Pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
          {t("creditNotes.pending")}
        </span>
      );
    case "Cancelled":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          {t("creditNotes.cancelled")}
        </span>
      );
    case "Refunded":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          {t("creditNotes.refunded")}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
          {status}
        </span>
      );
  }
};

export default CreditNotesStatusBadge;
