import React, { useRef } from "react";
import { Settings, Upload, X, Image as ImageIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function InvoiceSidebar({
  invoiceData,
  setInvoiceData,
  onLogoUpload,
  isUploadingLogo,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await onLogoUpload(file);
    }
  };

  const handleRemoveLogo = () => {
    setInvoiceData({ ...invoiceData, logoImage: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="lg:col-span-4 flex flex-col items-end space-y-6">
      {/* Logo Upload Section */}
      <div className="w-full space-y-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Invoice Logo
        </label>
        
        {invoiceData.logoImage ? (
          <div className="relative group w-full max-w-[240px] p-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center">
            <img
              src={invoiceData.logoImage}
              alt="Invoice Logo"
              style={{
                width: `${invoiceData.logoWidth || 120}px`,
                height: `${invoiceData.logoHeight || 120}px`,
                objectFit: "contain",
              }}
              className="rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemoveLogo}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-[240px] p-6 rounded-xl bg-gray-50 dark:bg-black/20 border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-[#7c3aed] dark:hover:border-[#7c3aed] flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1a1f26] flex items-center justify-center text-gray-400 group-hover:text-[#7c3aed] shadow-sm transition-colors">
              {isUploadingLogo ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7c3aed]"></div>
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-500 group-hover:text-[#7c3aed] transition-colors">
              Click to upload logo
            </span>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Logo Settings */}
        {invoiceData.logoImage && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">Width (px)</label>
              <input
                type="number"
                value={invoiceData.logoWidth || 120}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    logoWidth: Number(e.target.value),
                  })
                }
                className="w-full h-8 px-2 rounded-md border border-gray-200 dark:border-gray-800 bg-transparent text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">Height (px)</label>
              <input
                type="number"
                value={invoiceData.logoHeight || 120}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    logoHeight: Number(e.target.value),
                  })
                }
                className="w-full h-8 px-2 rounded-md border border-gray-200 dark:border-gray-800 bg-transparent text-sm"
              />
            </div>
          </div>
        )}
      </div>

      <div className="w-full space-y-4">
        <select
          value={invoiceData.status}
          onChange={(e) =>
            setInvoiceData({ ...invoiceData, status: e.target.value })
          }
          className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-800 bg-transparent text-sm"
        >
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          defaultValue="currency"
          className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-800 bg-transparent text-sm"
        >
          <option value="currency">Currency</option>
          <option value="usd">USD</option>
          <option value="bdt">BDT</option>
        </select>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="tax"
              checked={invoiceData.enableTax}
              onCheckedChange={(val) =>
                setInvoiceData({ ...invoiceData, enableTax: val })
              }
            />
            <label htmlFor="tax" className="text-xs">
              Enable tax
            </label>
          </div>
          <Settings className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
