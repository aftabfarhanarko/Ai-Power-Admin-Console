import React from "react";
import { ChevronLeft, Download, Mail, Printer, Edit3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InvoiceDetailsHeader({
  onBack,
  onDownload,
  onSendEmail,
  onPrint,
  onEdit,
  isSendingEmail,
  hasCustomerEmail,
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full bg-white dark:bg-[#1a1f26] shadow-sm border border-gray-100 dark:border-gray-800"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Invoice (Admin)
          </h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-white dark:bg-[#1a1f26] border-gray-200 dark:border-gray-800"
          onClick={onDownload}
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-white dark:bg-[#1a1f26] border-gray-200 dark:border-gray-800"
          onClick={onSendEmail}
          disabled={isSendingEmail || !hasCustomerEmail}
        >
          {isSendingEmail ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Mail className="w-4 h-4 mr-2" />
          )}
          Send Email
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-white dark:bg-[#1a1f26] border-gray-200 dark:border-gray-800"
          onClick={onPrint}
        >
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button
          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
          size="sm"
          onClick={onEdit}
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </div>
    </div>
  );
}
