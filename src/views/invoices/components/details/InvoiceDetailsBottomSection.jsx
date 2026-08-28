import React from "react";

export default function InvoiceDetailsBottomSection({
  invoice,
  formatCurrency,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-6">
        <div className="flex gap-6 items-start">
          <div className="p-2 bg-white dark:bg-white/10 rounded-lg border border-gray-100 dark:border-gray-800 shrink-0">
            <div className="w-24 h-24 bg-gray-50 dark:bg-black/40 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
              <div className="text-[10px] text-gray-400 font-bold uppercase text-center px-1">
                Scan to the pay
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-4 pt-2">
            <h4 className="text-gray-900 dark:text-white font-bold text-sm uppercase tracking-wider">
              Bank Details
            </h4>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex gap-2">
                <span className="text-gray-400">Bank Name :</span>
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  {invoice.bankDetails?.bankName || "-"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400">Account Number :</span>
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  {invoice.bankDetails?.accountNumber || "-"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400">IFSC Code :</span>
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  {invoice.bankDetails?.ifscCode || "-"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400">Payment Reference :</span>
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  {invoice.bankDetails?.paymentReference || invoice.invoiceNumber || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-6">
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase">
              Terms and Conditions
            </p>
            <p className="text-[11px] text-gray-500 leading-relaxed italic">
              {invoice.termsAndConditions || "The Payment must be returned in the same condition."}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase">Notes</p>
            <p className="text-[11px] text-gray-500 leading-relaxed italic">
              {invoice.notes ||
                "All charges are final and include applicable taxes, fees, and additional costs"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700 dark:text-gray-400 font-bold">Amount</span>
            <span className="font-black text-gray-900 dark:text-white">
              {formatCurrency(invoice.subTotal)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700 dark:text-gray-400 font-bold">CGST (9%)</span>
            <span className="font-black text-gray-900 dark:text-white">
              {formatCurrency(invoice.subTotal * 0.09)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700 dark:text-gray-400 font-bold">SGST (9%)</span>
            <span className="font-black text-gray-900 dark:text-white">
              {formatCurrency(invoice.subTotal * 0.09)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-red-500 font-bold">Discount (25%)</span>
            <span className="font-black text-red-500">
              -{formatCurrency(invoice.discountTotal || 0)}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t-2 border-gray-100 dark:border-gray-800 mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
              Total (USD)
            </span>
            <span className="text-3xl font-black text-[#7c3aed]">
              {formatCurrency(invoice.totalAmount)}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Total In Words
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium italic">
              Five Hundred & Ninety Six Dollars
            </p>
          </div>
        </div>

        <div className="pt-12 flex flex-col items-end gap-2">
          <div className="h-16 w-32 relative">
            {invoice.signatureImage ? (
              <img
                src={invoice.signatureImage}
                alt="Signature"
                className="max-h-16 object-contain"
              />
            ) : (
              <>
                <p className="text-2xl font-cursive text-gray-800 dark:text-white/80 opacity-60 italic">
                  {invoice.signatureName || "Signature"}
                </p>
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gray-900 dark:bg-white/20" />
              </>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tighter">
              {invoice.signatureName || "Authorized"}
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}
