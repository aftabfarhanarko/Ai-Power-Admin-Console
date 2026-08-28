import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  FileText,
  User,
  Download,
  Trash2,
  CreditCard,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useGetCreditNoteQuery,
  useDeleteCreditNoteMutation,
} from "@/features/credit-note/creditNoteApiSlice";
import { useGetOrderQuery } from "@/features/order/orderApiSlice";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

const CreditNoteDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);

  // Try to fetch as credit note first
  const {
    data: creditNote,
    isLoading: isLoadingCreditNote,
    isError: isCreditNoteError,
  } = useGetCreditNoteQuery(
    {
      id: parseInt(id),
      companyId: authUser?.companyId,
    },
    { skip: !id || isNaN(parseInt(id)) }
  );

  // Also try to fetch as order (will be used if credit note doesn't exist)
  const {
    data: order,
    isLoading: isLoadingOrder,
  } = useGetOrderQuery(parseInt(id), {
    skip: !id || isNaN(parseInt(id)),
  });

  const [deleteCreditNote] = useDeleteCreditNoteMutation();

  // Determine which data to use - prioritize credit note if it exists
  const note = creditNote || order;
  const isOrder = !!order && !creditNote;
  // Loading if we don't have data yet and either query is still loading
  const isLoading = !note && (isLoadingCreditNote || isLoadingOrder);

  // Download functionality - generate and download PDF/CSV
  const handleDownload = () => {
    if (!note) return;

    const fileName = isOrder 
      ? `Return_Invoice_Order_${note.id}_${format(new Date(), "yyyy-MM-dd")}.pdf`
      : `Return_Invoice_${note.creditNoteNumber}_${format(new Date(), "yyyy-MM-dd")}.pdf`;

    // Create printable content
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${fileName}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              .no-print { display: none; }
            }
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { border-bottom: 2px solid #976DF7; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #976DF7; }
            .subtitle { font-size: 14px; color: #666; margin-top: 5px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; border-bottom: 1px solid #eee; }
            .info-label { font-weight: bold; color: #666; }
            .info-value { color: #333; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            .table th { background-color: #f5f5f5; font-weight: bold; }
            .total-section { margin-top: 30px; padding-top: 20px; border-top: 2px solid #976DF7; }
            .total-amount { font-size: 28px; font-weight: bold; color: #976DF7; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${isOrder ? t("creditNotes.detail.returnInvoice") : t("creditNotes.detail.creditNote")}</div>
            <div class="subtitle">${isOrder ? `Order #${note.id}` : note.creditNoteNumber}</div>
            <div class="subtitle">${t("creditNotes.detail.createdOn")}: ${format(new Date(note.createdAt), "dd MMM yyyy, hh:mm a")}</div>
          </div>

          <div class="section">
            <div class="section-title">${t("creditNotes.detail.customerInformation")}</div>
            <div class="info-row">
              <span class="info-label">${t("creditNotes.detail.name")}:</span>
              <span class="info-value">${note.customer?.name || note.customerName || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t("creditNotes.detail.email")}:</span>
              <span class="info-value">${note.customer?.email || note.customerEmail || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t("creditNotes.detail.phone")}:</span>
              <span class="info-value">${note.customer?.phone || note.customerPhone || "N/A"}</span>
            </div>
            ${note.customerAddress ? `
            <div class="info-row">
              <span class="info-label">${t("creditNotes.detail.address")}:</span>
              <span class="info-value">${note.customerAddress}</span>
            </div>
            ` : ''}
          </div>

          ${isOrder && note.items && note.items.length > 0 ? `
          <div class="section">
            <div class="section-title">${t("creditNotes.detail.orderItems")}</div>
            <table class="table">
              <thead>
                <tr>
                  <th>${t("creditNotes.detail.product")}</th>
                  <th>${t("creditNotes.detail.quantity")}</th>
                  <th>${t("creditNotes.detail.unitPrice")}</th>
                  <th>${t("creditNotes.detail.total")}</th>
                </tr>
              </thead>
              <tbody>
                ${note.items.map(item => `
                  <tr>
                    <td>${item.product?.name || `Product #${item.productId}`}</td>
                    <td>${item.quantity}</td>
                    <td>$${Number(item.unitPrice).toLocaleString()}</td>
                    <td>$${Number(item.totalPrice).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">${isOrder ? t("creditNotes.detail.orderDetails") : t("creditNotes.detail.returnDetails")}</div>
            <div class="info-row">
              <span class="info-label">${t("creditNotes.detail.status")}:</span>
              <span class="info-value">${note.status}</span>
            </div>
            <div class="info-row">
              <span class="info-label">${t("creditNotes.detail.paymentMethod")}:</span>
              <span class="info-value">${isOrder ? note.paymentMethod : note.paymentMode}</span>
            </div>
            ${isOrder ? `
            <div class="info-row">
              <span class="info-label">${t("creditNotes.detail.paidAmount")}:</span>
              <span class="info-value">$${Number(note.paidAmount || 0).toLocaleString()}</span>
            </div>
            ` : ''}
            ${note.cancelNote || note.reason ? `
            <div class="info-row">
              <span class="info-label">${isOrder ? t("creditNotes.detail.cancelNote") : t("creditNotes.detail.reason")}:</span>
              <span class="info-value">${isOrder ? (note.cancelNote || note.deliveryNote || "N/A") : (note.reason || "N/A")}</span>
            </div>
            ` : ''}
          </div>

          <div class="total-section">
            <div class="info-row">
              <span class="info-label" style="font-size: 20px;">${isOrder ? t("creditNotes.detail.totalAmount") : t("creditNotes.detail.refundAmount")}:</span>
              <span class="total-amount">$${Number(isOrder ? note.totalAmount : note.amount).toLocaleString()}</span>
            </div>
          </div>

          <div class="footer">
            <p>${t("creditNotes.detail.computerGenerated")}</p>
            <p>${t("creditNotes.detail.generatedOn")} ${format(new Date(), "dd MMM yyyy, hh:mm a")}</p>
          </div>
        </body>
      </html>
    `;

    // Open print dialog
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then trigger print
    setTimeout(() => {
      printWindow.print();
      // Optionally close after printing
      // printWindow.close();
    }, 250);
  };

  const handleDelete = async () => {
    if (window.confirm(t("creditNotes.detail.confirmDelete"))) {
      try {
        await deleteCreditNote({
          id: parseInt(id),
          companyId: authUser?.companyId,
        }).unwrap();
        toast.success(t("creditNotes.detail.deleteSuccess"));
        navigate("/credit-notes");
      } catch (err) {
        toast.error(t("creditNotes.detail.deleteFailed"));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0b0f14]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#976DF7]"></div>
      </div>
    );
  }

  if (!isLoading && !note) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0b0f14] gap-4">
        <FileText className="w-16 h-16 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {isOrder ? t("creditNotes.detail.orderNotFound") : t("creditNotes.detail.creditNoteNotFound")}
        </h2>
        <Button onClick={() => navigate("/credit-notes")}>{t("creditNotes.detail.goBack")}</Button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
      <div className="p-6 lg:p-10 bg-gray-50 dark:bg-[#0b0f14] min-h-screen font-sans print:p-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 max-w-5xl mx-auto gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/credit-notes")}
              className="no-print rounded-xl bg-white dark:bg-[#1a1f26] shadow-sm border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#2c323c] transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {isOrder ? `Order #${note.id}` : note.creditNoteNumber}
              </h1>
              <Badge
                className={`
                ${
                  note.status === "Paid" || note.status === "paid"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : note.status === "Pending" || note.status === "pending"
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      : note.status === "Refunded" || note.status === "refunded"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : note.status === "Cancelled" || note.status === "cancelled"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                }
              `}
              >
                {note.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 font-medium mt-1">
              {t("creditNotes.detail.createdOn")}{" "}
              {format(new Date(note.createdAt), "dd MMM yyyy, hh:mm a")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 no-print">
          <Button
            variant="outline"
            className="gap-2 bg-white dark:bg-[#1a1f26]"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" /> {t("creditNotes.detail.download")}
          </Button>
          {!isOrder && (
            <Button
              variant="destructive"
              className="gap-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-900"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" /> {t("creditNotes.detail.delete")}
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Customer & Invoice */}
          <div className="bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#976DF7]" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[#976DF7]" /> {t("creditNotes.detail.customerDetails")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t("creditNotes.detail.customerName")}</p>
                <p className="font-semibold text-gray-900 dark:text-white text-lg">
                  {note.customer?.name || note.customerName || t("common.na")}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {note.customer?.email || note.customerEmail || t("creditNotes.noEmail")}
                </p>
                <p className="text-sm text-gray-500">
                  {note.customer?.phone || note.customerPhone || t("creditNotes.detail.noPhone")}
                </p>
                {note.customerAddress && (
                  <p className="text-sm text-gray-500 mt-1">
                    {note.customerAddress}
                  </p>
                )}
              </div>

              {note.relatedInvoice && (
                <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> {t("creditNotes.detail.relatedInvoice")}
                  </p>
                  <p
                    className="font-bold text-[#976DF7] text-lg cursor-pointer hover:underline"
                    onClick={() =>
                      navigate(`/invoices/${note.relatedInvoice.id}`)
                    }
                  >
                    {note.relatedInvoice.invoiceNumber}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {t("creditNotes.detail.invoiceAmount")}: ${note.relatedInvoice.total}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Reason / Notes */}
          <div className="bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" /> 
              {isOrder ? t("creditNotes.detail.orderNotes") : t("creditNotes.detail.reasonForReturn")}
            </h3>
            <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              {isOrder 
                ? (note.cancelNote || note.deliveryNote || t("creditNotes.detail.noNotesProvided"))
                : (note.reason || t("creditNotes.detail.noReasonProvided"))
              }
            </div>
          </div>

          {/* Order Items (if order) */}
          {isOrder && note.items && note.items.length > 0 && (
            <div className="bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#976DF7]" /> {t("creditNotes.detail.orderItems")}
              </h3>
              <div className="space-y-3">
                {note.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-xl"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {item.product?.name || `Product #${item.productId}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t("creditNotes.detail.quantity")}: {item.quantity} × ${Number(item.unitPrice).toLocaleString()}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      ${Number(item.totalPrice).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Financials */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#976DF7] to-[#7c3aed] rounded-2xl p-6 text-white shadow-lg shadow-[#976DF7]/25 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-purple-100 font-medium mb-1">
                {isOrder ? t("creditNotes.detail.orderAmount") : t("creditNotes.detail.refundAmount")}
              </p>
              <h2 className="text-4xl font-bold tracking-tight">
                ${Number(isOrder ? note.totalAmount : note.amount).toLocaleString()}
              </h2>

              {isOrder && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-100 text-sm">{t("creditNotes.detail.paidAmount")}</span>
                    <span className="font-semibold">
                      ${Number(note.paidAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-100 text-sm">{t("creditNotes.detail.remaining")}</span>
                    <span className="font-semibold">
                      ${Number((note.totalAmount || 0) - (note.paidAmount || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-white/20 flex items-center justify-between">
                <span className="text-purple-100 text-sm">{t("creditNotes.detail.paymentMode")}</span>
                <span className="font-bold flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                  <CreditCard className="w-4 h-4" /> 
                  {isOrder ? note.paymentMethod : note.paymentMode}
                </span>
              </div>
            </div>

            {/* Background Pattern */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
          </div>

          {/* Timeline / Activity (Placeholder) */}
          <div className="bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider text-xs">
              {t("creditNotes.detail.activity")}
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-1">
                  <div className="w-2 h-2 rounded-full bg-[#976DF7]"></div>
                  <div className="w-0.5 h-full bg-gray-100 dark:bg-gray-800 mx-auto mt-1"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {isOrder ? t("creditNotes.detail.orderCreated") : t("creditNotes.detail.creditNoteCreated")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(note.createdAt), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      note.status === "Paid" || note.status === "paid" || note.status === "Refunded" || note.status === "refunded"
                        ? "bg-emerald-500"
                        : note.status === "Cancelled" || note.status === "cancelled"
                          ? "bg-red-500"
                          : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  ></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {t("creditNotes.detail.status")}: {note.status}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(
                      new Date(note.updatedAt || note.createdAt),
                      "MMM dd, yyyy HH:mm",
                    )}
                  </p>
                </div>
              </div>
              {isOrder && note.shippingTrackingId && (
                <div className="flex gap-3">
                  <div className="mt-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {t("creditNotes.detail.trackingId")}: {note.shippingTrackingId}
                    </p>
                    {note.shippingProvider && (
                      <p className="text-xs text-gray-500">
                        {t("creditNotes.detail.provider")}: {note.shippingProvider}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default CreditNoteDetailsPage;
