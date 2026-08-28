import React from "react";
import { PlusCircle, Upload, X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";

export default function InvoiceSummarySection({
  subTotal,
  cgst,
  sgst,
  total,
  invoiceData,
  setInvoiceData,
  signatureInputRef,
  handleSignatureUpload,
  removeSignature,
  isUploadingSignature,
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="p-8 rounded-2xl bg-gray-50/50 dark:bg-black/10 border border-gray-100 dark:border-gray-800 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            {t("invoices.create.summary.amount")}
          </span>
          <span className="font-bold">${subTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            {t("invoices.create.summary.cgst")}
          </span>
          <span className="font-bold">${cgst.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            {t("invoices.create.summary.sgst")}
          </span>
          <span className="font-bold">${sgst.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 pt-2 text-[#7c3aed] cursor-pointer">
          <PlusCircle className="w-4 h-4" />
          <span className="text-sm font-medium">
            {t("invoices.create.summary.addCharges")}
          </span>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {t("invoices.create.summary.discount")}
            </span>
            <div className="flex bg-white dark:bg-[#1a1f26] border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden h-8">
              <input
                type="number"
                className="w-12 h-full border-none focus:ring-0 text-center text-xs p-0 bg-transparent"
                value={invoiceData.discountTotal}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    discountTotal: parseFloat(e.target.value) || 0,
                  })
                }
              />
              <div className="w-px h-full bg-gray-200 dark:bg-gray-800" />
              <select
                className="w-12 h-full border-none focus:ring-0 text-xs p-0 px-2 bg-transparent"
                value={invoiceData.discountType}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    discountType: e.target.value,
                  })
                }
              >
                <option value="%">%</option>
                <option value="fixed">$</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch checked />
            <span className="text-xs font-medium text-gray-500">
              {t("invoices.create.summary.roundOff")}
            </span>
          </div>
          <span className="font-bold text-lg">
            ${Math.round(total).toLocaleString()}
          </span>
        </div>
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-end">
          <div>
            <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
              {t("invoices.create.summary.totalTitle")}
            </h4>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-[#7c3aed]">
              ${Math.round(total).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="pt-2 text-right">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            {t("invoices.create.summary.totalInWords")}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium italic">
            {t("invoices.create.summary.totalInWordsSample")}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <select
          className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-800 bg-transparent text-sm"
          value={invoiceData.signatureName}
          onChange={(e) =>
            setInvoiceData({
              ...invoiceData,
              signatureName: e.target.value,
            })
          }
        >
          <option value="adrian">
            {t("invoices.create.summary.signaturePresetAdrian")}
          </option>
          <option value="other">
            {t("invoices.create.summary.signaturePresetOther")}
          </option>
        </select>
        <div className="text-center py-2 text-xs text-gray-400 font-bold">
          {t("invoices.create.summary.or")}
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-gray-500 font-medium">
              {t("invoices.create.summary.signatureName")}
            </label>
            <input
              value={invoiceData.signatureName}
              className="flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800"
              onChange={(e) =>
                setInvoiceData({
                  ...invoiceData,
                  signatureName: e.target.value,
                })
              }
            />
          </div>
          <input
            ref={signatureInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSignatureUpload}
          />
          {invoiceData.signatureImage ? (
            <div className="relative w-full min-h-24 border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-gray-50/30">
              <img
                src={invoiceData.signatureImage}
                alt="Signature"
                className="max-h-20 object-contain"
              />
              <button
                type="button"
                onClick={removeSignature}
                className="absolute top-2 right-2 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => signatureInputRef.current?.click()}
              disabled={isUploadingSignature}
              className="w-full h-24 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center gap-2 bg-gray-50/30 hover:bg-gray-50/50 dark:hover:bg-black/10 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploadingSignature ? (
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-xs text-[#7c3aed] font-semibold">
                {isUploadingSignature
                  ? t("invoices.create.summary.uploading")
                  : t("invoices.create.summary.uploadSignature")}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
