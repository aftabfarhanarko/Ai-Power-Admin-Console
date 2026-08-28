import React from "react";
import { Calendar, PlusCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function InvoiceDetailsSection({
  invoiceData,
  setInvoiceData,
}) {
  return (
    <div className="lg:col-span-8 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Invoice Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Invoice Number
          </label>
          <input
            value={invoiceData.invoiceNumber}
            className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:bg-black/20 dark:border-gray-800"
            readOnly
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Reference Number
          </label>
          <input
            placeholder="Enter Reference Number"
            value={invoiceData.referenceNumber}
            className="flex h-10 w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800"
            onChange={(e) =>
              setInvoiceData({
                ...invoiceData,
                referenceNumber: e.target.value,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Invoice Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 font-bold" />
            <input
              type="date"
              value={invoiceData.invoiceDate}
              className="flex h-10 w-full rounded-md border border-gray-200 bg-transparent pl-10 pr-3 py-2 text-sm dark:border-gray-800"
              onChange={(e) =>
                setInvoiceData({
                  ...invoiceData,
                  invoiceDate: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-8">
          <PlusCircle className="w-4 h-4 text-[#7c3aed]" />
          <span className="text-sm font-medium text-[#7c3aed] cursor-pointer">
            Add Due Date
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-8 pt-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="recurring"
            checked={invoiceData.recurring}
            onCheckedChange={(val) =>
              setInvoiceData({ ...invoiceData, recurring: val })
            }
          />
          <label
            htmlFor="recurring"
            className="text-sm font-medium leading-none"
          >
            Recurring
          </label>
        </div>
        {invoiceData.recurring && (
          <div className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
            <select
              className="flex h-10 w-[140px] rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800"
              value={invoiceData.recurringInterval}
              onChange={(e) =>
                setInvoiceData({
                  ...invoiceData,
                  recurringInterval: e.target.value,
                })
              }
            >
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
            <select
              className="flex h-10 w-[140px] rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-800"
              value={invoiceData.recurringDuration}
              onChange={(e) =>
                setInvoiceData({
                  ...invoiceData,
                  recurringDuration: e.target.value,
                })
              }
            >
              <option value="1 Month">1 Month</option>
              <option value="3 Months">3 Months</option>
              <option value="6 Months">6 Months</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
