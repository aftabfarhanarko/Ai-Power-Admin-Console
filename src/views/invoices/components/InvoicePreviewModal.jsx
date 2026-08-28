import React from "react";
import { X, Download, Mail, Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InvoiceDetailsTopBanner,
  InvoiceDetailsInfoGrid,
  InvoiceDetailsItemsTable,
  InvoiceDetailsBottomSection,
  InvoiceDetailsFooterBanner,
} from "./details";
import { useTranslation } from "react-i18next";
import {
  generateSaleInvoicePDF,
  downloadSaleInvoicePDF,
  printSaleInvoicePDF,
} from "@/utils/saleInvoicePDF";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function InvoicePreviewModal({
  open,
  onOpenChange,
  invoiceData,
  items,
  customer,
  companyInfo,
  subTotal,
  taxTotal,
  discountTotal,
  total,
}) {
  const { t } = useTranslation();

  // Construct the invoice object to match what the details components expect
  const previewInvoice = {
    ...invoiceData,
    customer: customer || { name: "N/A", email: "N/A", phone: "N/A", address: "N/A" },
    items: items.map(item => ({
      ...item,
      product: { name: item.name }, // Ensure product name is accessible
    })),
    subTotal,
    taxTotal,
    discountTotal,
    totalAmount: total,
    status: invoiceData.status || "draft",
    currency: invoiceData.currency || "BDT",
    // Add logo info
    logoImage: invoiceData.logoImage,
    logoWidth: invoiceData.logoWidth,
    logoHeight: invoiceData.logoHeight,
  };

  const formatCurrency = (amt) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: previewInvoice.currency,
    }).format(amt);

  const handleDownloadPDF = () => {
    try {
      downloadSaleInvoicePDF(previewInvoice, companyInfo);
      toast.success(t("invoices.toast.downloadSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(t("invoices.toast.downloadFailed"));
    }
  };

  const handlePrint = () => {
    try {
      printSaleInvoicePDF(previewInvoice, companyInfo);
    } catch (err) {
      console.error(err);
      toast.error(t("invoices.details.printFailed"));
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 z-50 bg-gray-50 dark:bg-[#0b0f14] overflow-y-auto"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-[#1a1f26] border-b border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Editor
              </Button>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white border-l pl-4 border-gray-200 dark:border-gray-700">
                Invoice Preview
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="ml-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="max-w-5xl mx-auto p-6 md:p-10 lg:p-12">
            <div className="bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden relative min-h-[1000px]">
              {/* Pass logo info to TopBanner if it supports it, or modify TopBanner */}
              <InvoiceDetailsTopBanner
                companyName={companyInfo?.companyName}
                branchLocation={companyInfo?.branchLocation}
                status={previewInvoice.status}
                logoImage={invoiceData.logoImage}
                logoWidth={invoiceData.logoWidth}
                logoHeight={invoiceData.logoHeight}
              />

              <div className="px-12 pb-12 space-y-12">
                <InvoiceDetailsInfoGrid
                  invoice={previewInvoice}
                  companyName={companyInfo?.companyName}
                  branchLocation={companyInfo?.branchLocation}
                  phone={companyInfo?.phone}
                  email={companyInfo?.email}
                />

                <InvoiceDetailsItemsTable
                  items={previewInvoice.items}
                  formatCurrency={formatCurrency}
                />

                <InvoiceDetailsBottomSection
                  invoice={previewInvoice}
                  formatCurrency={formatCurrency}
                />
              </div>

              <InvoiceDetailsFooterBanner
                companyName={companyInfo?.companyName}
                branchLocation={companyInfo?.branchLocation}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
