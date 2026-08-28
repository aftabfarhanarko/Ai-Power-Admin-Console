import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { useGetSaleInvoiceQuery, useSendInvoiceEmailMutation } from "@/features/invoice/saleInvoiceApiSlice";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  generateSaleInvoicePDF,
  downloadSaleInvoicePDF,
  printSaleInvoicePDF,
} from "@/utils/saleInvoicePDF";
import {
  InvoiceDetailsHeader,
  InvoiceDetailsTopBanner,
  InvoiceDetailsInfoGrid,
  InvoiceDetailsItemsTable,
  InvoiceDetailsBottomSection,
  InvoiceDetailsFooterBanner,
} from "../components/details";

const SaleInvoiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const { t } = useTranslation();
  const { data: invoice, isLoading, error } = useGetSaleInvoiceQuery(
    { id, companyId: authUser?.companyId },
    { skip: !id || !authUser?.companyId }
  );
  const [sendInvoiceEmail, { isLoading: isSendingEmail }] = useSendInvoiceEmailMutation();

  const companyInfo = {
    companyName: authUser?.companyName,
    branchLocation: authUser?.branchLocation,
    phone: authUser?.phone,
    email: authUser?.email,
  };

  const handleDownloadPDF = () => {
    try {
      downloadSaleInvoicePDF(invoice, companyInfo);
      toast.success(t("invoices.toast.downloadSuccess"));
    } catch (err) {
      toast.error(t("invoices.toast.downloadFailed"));
    }
  };

  const handlePrint = () => {
    try {
      printSaleInvoicePDF(invoice, companyInfo);
      toast.success(t("invoices.details.printOpened"));
    } catch (err) {
      toast.error(t("invoices.details.printFailed"));
    }
  };

  const handleSendEmail = async () => {
    if (!invoice?.customer?.email) {
      toast.error(t("invoices.details.noCustomerEmail"));
      return;
    }
    try {
      const pdfBase64 = generateSaleInvoicePDF(invoice, companyInfo);
      await sendInvoiceEmail({
        id,
        companyId: authUser?.companyId,
        pdfBase64,
      }).unwrap();
      toast.success(
        t("invoices.details.emailSent", {
          email: invoice.customer.email,
        }),
      );
    } catch (err) {
      toast.error(
        err?.data?.message || t("invoices.details.emailFailed"),
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7c3aed]" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <div className="p-4 rounded-full bg-red-50 dark:bg-red-900/10 text-red-500">
          <FileText className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold">
          {t("invoices.details.notFound")}
        </h2>
        <Button onClick={() => navigate("/invoices")}>
          {t("invoices.details.backToList")}
        </Button>
      </div>
    );
  }

  const formatCurrency = (amt) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: invoice.currency || "BDT",
    }).format(amt);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f14] p-4 lg:p-8">
      <InvoiceDetailsHeader
        onBack={() => navigate("/invoices")}
        onDownload={handleDownloadPDF}
        onSendEmail={handleSendEmail}
        onPrint={handlePrint}
        onEdit={() => navigate(`/invoices/${id}/edit`)}
        isSendingEmail={isSendingEmail}
        hasCustomerEmail={!!invoice?.customer?.email}
      />

      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden relative">
          <InvoiceDetailsTopBanner
            companyName={authUser?.companyName}
            branchLocation={authUser?.branchLocation}
            status={invoice.status}
          />

          <div className="px-12 pb-12 space-y-12">
            <InvoiceDetailsInfoGrid
              invoice={invoice}
              companyName={authUser?.companyName}
              branchLocation={authUser?.branchLocation}
              phone={authUser?.phone}
              email={authUser?.email}
            />

            <InvoiceDetailsItemsTable
              items={invoice.items}
              formatCurrency={formatCurrency}
            />

            <InvoiceDetailsBottomSection
              invoice={invoice}
              formatCurrency={formatCurrency}
            />
          </div>

          <InvoiceDetailsFooterBanner
            companyName={authUser?.companyName}
            branchLocation={authUser?.branchLocation}
          />
        </div>
      </div>
    </div>
  );
};

export default SaleInvoiceDetailsPage;
