import React from "react";
import { format } from "date-fns";

export default function InvoiceDetailsInfoGrid({
  invoice,
  companyName,
  branchLocation,
  phone,
  email,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="space-y-4">
        <h4 className="text-gray-900 dark:text-white font-bold text-base">Invoice Details</h4>
        <div className="space-y-1 text-sm">
          <div className="flex gap-2">
            <span className="text-gray-500">Invoice number :</span>
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {invoice.invoiceNumber}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500">Issued On :</span>
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {format(new Date(invoice.createdAt), "dd MMM yyyy")}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500">Due Date :</span>
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {invoice.dueDate
                ? format(new Date(invoice.dueDate), "dd MMM yyyy")
                : "31 Jan 2025"}
            </span>
          </div>
          {invoice.recurring && (
            <div className="flex gap-2">
              <span className="text-gray-500">Recurring Invoice :</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {invoice.recurringInterval || "Monthly"}
              </span>
            </div>
          )}
          <div className="mt-2">
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              Due in 8 days
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-gray-900 dark:text-white font-bold text-base">Billing From</h4>
        <div className="space-y-1 text-sm">
          <p className="font-bold text-gray-800 dark:text-gray-200">{companyName || "-"}</p>
          <p className="text-gray-500">{branchLocation || "-"}</p>
          {phone && <p className="text-gray-500">Phone : {phone}</p>}
          {email && <p className="text-gray-500">Email : {email}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-gray-900 dark:text-white font-bold text-base">Billing To</h4>
        <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 border border-gray-100 dark:border-gray-800 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#1a1f26] text-white flex items-center justify-center font-bold text-lg shrink-0">
            {(invoice.customer?.name || "C").charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1 text-sm flex-1">
            <p className="font-bold text-gray-900 dark:text-white">
              {invoice.customer?.name || "-"}
            </p>
            {(invoice.customer?.address || invoice.customer?.district) && (
              <p className="text-gray-500 text-xs truncate">
                {[invoice.customer?.address, invoice.customer?.district]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
            {invoice.customer?.phone && (
              <p className="text-gray-500 text-xs">Phone : {invoice.customer.phone}</p>
            )}
            {invoice.customer?.email && (
              <p className="text-gray-500 text-xs">Email : {invoice.customer.email}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
