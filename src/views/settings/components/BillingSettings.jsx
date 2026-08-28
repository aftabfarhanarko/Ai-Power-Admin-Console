import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  FileText,
  Building2,
  Smartphone,
  Wallet,
} from "lucide-react";
import { generateInvoicePDF } from "@/pages/superadmin/invoice/InvoicePDFGenerator";

const BillingSettings = ({ user: userFromApi }) => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const user = userFromApi ?? authUser ?? null;

  const handleDownloadInvoicePDF = (invoice) => {
    try {
      // Attach customer information to invoice if not already present
      const invoiceWithCustomer = {
        ...invoice,
        customer: invoice.customer || {
          name: user.name,
          email: user.email,
          companyName: user.companyName,
          companyId: user.companyId,
          phone: user.phone,
          branchLocation: user.branchLocation,
          paymentInfo: user.paymentInfo,
        },
      };
      generateInvoicePDF(invoiceWithCustomer);
      toast.success(t("settings.invoiceDownloaded"));
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error(t("settings.invoiceDownloadFailed"));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (!user?.invoices || user.invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-6 rounded-[24px] border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {t("settings.noInvoices")}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          {t("settings.noInvoicesDesc")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
            <FileText className="h-6 w-6" />
          </div>
          {t("settings.myInvoices")}
          <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
            {user.invoices.length}
          </span>
        </h2>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {user.invoices.map((invoice) => {
          const getStatusBadge = (status) => {
            const statusConfig = {
              pending: {
                color:
                  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
                icon: Clock,
              },
              paid: {
                color:
                  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
                icon: CheckCircle,
              },
              cancelled: {
                color:
                  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800",
                icon: XCircle,
              },
            };
            const config = statusConfig[status] || statusConfig.pending;
            const Icon = config.icon;
            return (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            );
          };

          return (
            <motion.div variants={itemVariants} key={invoice.id}>
              <Card className="group relative overflow-hidden rounded-[24px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <FileText className="w-24 h-24 text-violet-500 transform rotate-12 translate-x-8 -translate-y-8" />
                </div>
                
                <CardContent className="p-5 md:p-6 relative z-10">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                        <CreditCard className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {invoice.invoiceNumber}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono">
                          {invoice.transactionId}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      {getStatusBadge(invoice.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoicePDF(invoice)}
                        className="h-9 px-4 rounded-full bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:hover:bg-violet-900/40 dark:text-violet-300 dark:border-violet-800 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {t("settings.downloadPdf")}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {t("settings.totalAmount")}
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        ৳{parseFloat(invoice.totalAmount).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {t("settings.paidAmount")}
                      </p>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        ৳{parseFloat(invoice.paidAmount).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {t("settings.dueAmount")}
                      </p>
                      <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                        ৳{parseFloat(invoice.dueAmount).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {t("settings.type")}
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                        {invoice.amountType}
                      </p>
                    </div>
                  </div>

                  {/* Payment Details Section */}
                  {(invoice.bankPayment || invoice.bkashPaymentID || invoice.bkashTrxID) && (
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                      {invoice.bankPayment && (
                        <div className="mb-4 last:mb-0">
                          <div className="flex items-center gap-2 mb-3">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {t("settings.bankPaymentDetails")}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400">{t("settings.bankName")}</p>
                              <p className="text-sm font-medium">{invoice.bankPayment.bankName}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400">{t("settings.amount")}</p>
                              <p className="text-sm font-medium">৳{parseFloat(invoice.bankPayment.amount).toFixed(2)}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400">{t("settings.accountLastDigits")}</p>
                              <p className="text-sm font-medium font-mono">•••• {invoice.bankPayment.accLastDigit}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400">{t("settings.paymentStatus")}</p>
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                  invoice.bankPayment.status === "verified"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                    : invoice.bankPayment.status === "rejected"
                                      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                }`}
                              >
                                {invoice.bankPayment.status.charAt(0).toUpperCase() + invoice.bankPayment.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {(invoice.bkashPaymentID || invoice.bkashTrxID) && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Smartphone className="h-4 w-4 text-gray-400" />
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {t("settings.bkashPaymentDetails")}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {invoice.bkashPaymentID && (
                              <div className="bg-pink-50 dark:bg-pink-900/10 p-3 rounded-xl border border-pink-100 dark:border-pink-900/20">
                                <p className="text-xs text-pink-600 dark:text-pink-400 mb-1">{t("settings.paymentId")}</p>
                                <p className="text-sm font-medium font-mono text-gray-900 dark:text-white">{invoice.bkashPaymentID}</p>
                              </div>
                            )}
                            {invoice.bkashTrxID && (
                              <div className="bg-pink-50 dark:bg-pink-900/10 p-3 rounded-xl border border-pink-100 dark:border-pink-900/20">
                                <p className="text-xs text-pink-600 dark:text-pink-400 mb-1">{t("settings.transactionId")}</p>
                                <p className="text-sm font-medium font-mono text-gray-900 dark:text-white">{invoice.bkashTrxID}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default BillingSettings;
