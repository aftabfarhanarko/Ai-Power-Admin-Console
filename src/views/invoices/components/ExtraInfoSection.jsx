import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function ExtraInfoSection({
  extraInfoTab,
  setExtraInfoTab,
  invoiceData,
  setInvoiceData,
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-900 dark:text-white underline decoration-[#7c3aed] decoration-2 underline-offset-8 mb-6">
        {t("invoices.create.extra.title")}
      </h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={extraInfoTab === "notes" ? "default" : "outline"}
          size="sm"
          className={
            extraInfoTab === "notes"
              ? "bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
              : "border-gray-200 dark:border-gray-800"
          }
          onClick={() => setExtraInfoTab("notes")}
        >
          {t("invoices.create.extra.tabNotes")}
        </Button>
        <Button
          variant={extraInfoTab === "terms" ? "default" : "outline"}
          size="sm"
          className={
            extraInfoTab === "terms"
              ? "bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
              : "border-gray-200 dark:border-gray-800"
          }
          onClick={() => setExtraInfoTab("terms")}
        >
          {t("invoices.create.extra.tabTerms")}
        </Button>
        <Button
          variant={extraInfoTab === "bank" ? "default" : "outline"}
          size="sm"
          className={
            extraInfoTab === "bank"
              ? "bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
              : "border-gray-200 dark:border-gray-800"
          }
          onClick={() => setExtraInfoTab("bank")}
        >
          {t("invoices.create.extra.tabBank")}
        </Button>
      </div>
      {extraInfoTab === "notes" && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <label className="text-xs text-gray-500 font-medium">
            {t("invoices.create.extra.notesLabel")}
          </label>
          <textarea
            className="w-full h-32 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
            placeholder={t("invoices.create.extra.notesPlaceholder")}
            value={invoiceData.notes}
            onChange={(e) =>
              setInvoiceData({ ...invoiceData, notes: e.target.value })
            }
          />
        </div>
      )}
      {extraInfoTab === "terms" && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <label className="text-xs text-gray-500 font-medium">
            {t("invoices.create.extra.termsLabel")}
          </label>
          <textarea
            className="w-full h-32 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
            placeholder={t("invoices.create.extra.termsPlaceholder")}
            value={invoiceData.termsAndConditions}
            onChange={(e) =>
              setInvoiceData({
                ...invoiceData,
                termsAndConditions: e.target.value,
              })
            }
          />
        </div>
      )}
      {extraInfoTab === "bank" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <label className="text-xs text-gray-500 font-medium block">
            {t("invoices.create.extra.bankTitle")}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-400">
                {t("invoices.create.extra.bankName")}
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-2 text-sm"
                placeholder={t(
                  "invoices.create.extra.bankNamePlaceholder",
                )}
                value={invoiceData.bankDetails?.bankName || ""}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    bankDetails: {
                      ...invoiceData.bankDetails,
                      bankName: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">
                {t("invoices.create.extra.accountNumber")}
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-2 text-sm"
                placeholder={t(
                  "invoices.create.extra.accountNumberPlaceholder",
                )}
                value={invoiceData.bankDetails?.accountNumber || ""}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    bankDetails: {
                      ...invoiceData.bankDetails,
                      accountNumber: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">
                {t("invoices.create.extra.ifsc")}
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-2 text-sm"
                placeholder={t("invoices.create.extra.ifscPlaceholder")}
                value={invoiceData.bankDetails?.ifscCode || ""}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    bankDetails: {
                      ...invoiceData.bankDetails,
                      ifscCode: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">
                {t("invoices.create.extra.paymentRef")}
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-2 text-sm"
                placeholder={t("invoices.create.extra.paymentRefPlaceholder", {
                  invoiceNumber:
                    invoiceData.invoiceNumber || "Invoice number",
                })}
                value={invoiceData.bankDetails?.paymentReference || ""}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    bankDetails: {
                      ...invoiceData.bankDetails,
                      paymentReference: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
