import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { XCircle, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreditNotesStatusBadge from "./CreditNotesStatusBadge";

/**
 * Credit notes data table: header, loading/empty states, rows with view/refund actions.
 * Target ~150 lines per component.
 */
const CreditNotesTable = ({
  isLoading,
  paginatedNotes,
  onViewDetails,
  onRefundOrder,
  onClearSearch,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleRowClick = (note) => {
    if (onViewDetails) onViewDetails(note);
    else navigate(`/credit-notes/${note.id}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold text-xs">
          <tr>
            <th className="px-6 py-4">{t("creditNotes.orderId")}</th>
            <th className="px-6 py-4">{t("creditNotes.customer")}</th>
            <th className="px-6 py-4">{t("creditNotes.amount")}</th>
            <th className="px-6 py-4">{t("creditNotes.date")}</th>
            <th className="px-6 py-4">{t("creditNotes.status")}</th>
            <th className="px-6 py-4 text-right">{t("creditNotes.actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {isLoading ? (
            <tr>
              <td colSpan="6" className="px-6 py-20 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#976DF7]"></div>
                  <p className="text-gray-500">{t("creditNotes.loadingOrders")}</p>
                </div>
              </td>
            </tr>
          ) : paginatedNotes?.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-6 py-20 text-center">
                <div className="flex flex-col items-center gap-3 opacity-50">
                  <XCircle className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 font-medium">
                    {t("creditNotes.noCancelledOrRefunded")}
                  </p>
                  {onClearSearch && (
                    <Button
                      variant="link"
                      className="text-[#976DF7]"
                      onClick={onClearSearch}
                    >
                      {t("creditNotes.clearSearch")}
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            paginatedNotes?.map((note) => (
              <tr
                key={`${note.type}-${note.id}`}
                className="group hover:bg-[#976DF7]/5 dark:hover:bg-[#976DF7]/10 transition-colors cursor-pointer"
                onClick={() => handleRowClick(note)}
              >
                <td className="px-6 py-4 font-bold text-[#976DF7] hover:text-[#8250e5] transition-colors">
                  {note.displayId}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#976DF7] to-[#7c3aed] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-[#976DF7]/20">
                      {note.customer?.name?.charAt(0) || "C"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-200 group-hover:text-[#976DF7] transition-colors">
                        {note.customer?.name || note.customerName || t("common.na")}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {note.customer?.email || note.customerEmail || t("creditNotes.noEmail")}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                    ${Number(note.amount || 0).toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 font-medium">
                  {format(new Date(note.date || note.createdAt), "dd MMM yyyy")}
                </td>
                <td className="px-6 py-4">
                  <CreditNotesStatusBadge status={note.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-[#976DF7] hover:bg-[#976DF7]/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewDetails) onViewDetails(note);
                        else navigate(`/credit-notes/${note.id}`);
                      }}
                      title={t("creditNotes.viewDetails")}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {note.canRefund && onRefundOrder && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRefundOrder(note);
                        }}
                        title={t("creditNotes.refundOrder")}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CreditNotesTable;
