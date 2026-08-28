import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import {
  useGetSaleInvoiceQuery,
  useUpdateSaleInvoiceMutation,
} from "@/features/invoice/saleInvoiceApiSlice";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

const STATUS_OPTIONS = [
  { value: "draft", labelKey: "invoices.statuses.draft" },
  { value: "pending", labelKey: "invoices.statuses.pending" },
  { value: "sent", labelKey: "invoices.statuses.sent" },
  { value: "paid", labelKey: "invoices.statuses.paid" },
  { value: "partial", labelKey: "invoices.statuses.partial" },
  { value: "overdue", labelKey: "invoices.statuses.overdue" },
  { value: "cancelled", labelKey: "invoices.statuses.cancelled" },
];

const DELIVERY_OPTIONS = [
  { value: "N/A", labelKey: "invoices.edit.delivery.na" },
  { value: "pending", labelKey: "invoices.edit.delivery.pending" },
  { value: "shipped", labelKey: "invoices.edit.delivery.shipped" },
  { value: "delivered", labelKey: "invoices.edit.delivery.delivered" },
];

const FULFILLMENT_OPTIONS = [
  { value: "unfulfilled", labelKey: "invoices.statuses.unfulfilled" },
  { value: "fulfilled", labelKey: "invoices.statuses.fulfilled" },
];

const SaleInvoiceEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const { t } = useTranslation();
  const { data: invoice, isLoading, error } = useGetSaleInvoiceQuery(
    { id, companyId: authUser?.companyId },
    { skip: !id || !authUser?.companyId }
  );
  const [updateSaleInvoice, { isLoading: isUpdating }] =
    useUpdateSaleInvoiceMutation();

  const [status, setStatus] = useState(invoice?.status || "draft");
  const [deliveryStatus, setDeliveryStatus] = useState(
    invoice?.deliveryStatus || "N/A"
  );
  const [fulfillmentStatus, setFulfillmentStatus] = useState(
    invoice?.fulfillmentStatus || "unfulfilled"
  );

  React.useEffect(() => {
    if (invoice) {
      setStatus(invoice.status || "draft");
      setDeliveryStatus(invoice.deliveryStatus || "N/A");
      setFulfillmentStatus(invoice.fulfillmentStatus || "unfulfilled");
    }
  }, [invoice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSaleInvoice({
        id,
        companyId: authUser?.companyId,
        status,
        deliveryStatus,
        fulfillmentStatus,
      }).unwrap();
      toast.success(t("invoices.edit.toast.updatedSuccess"));
      navigate(`/invoices/${id}`);
    } catch (err) {
      toast.error(
        err?.data?.message || t("invoices.edit.toast.updatedFailed"),
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f14] p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/invoices/${id}`)}
            className="rounded-full bg-white dark:bg-[#1a1f26] shadow-sm border border-gray-100 dark:border-gray-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {t("invoices.edit.header.title", {
                number: invoice.invoiceNumber,
              })}
            </h1>
            <p className="text-sm text-gray-500">
              {t("invoices.edit.header.subtitle")}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl p-8 space-y-6"
        >
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              {t("invoices.edit.fields.invoiceStatus")}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1f26] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              {t("invoices.edit.fields.deliveryStatus")}
            </label>
            <select
              value={deliveryStatus}
              onChange={(e) => setDeliveryStatus(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1f26] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
            >
              {DELIVERY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              {t("invoices.edit.fields.fulfillmentStatus")}
            </label>
            <select
              value={fulfillmentStatus}
              onChange={(e) => setFulfillmentStatus(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1f26] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
            >
              {FULFILLMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/invoices/${id}`)}
              className="flex-1"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("common.updating")}
                </>
              ) : (
                t("common.saveChanges")
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleInvoiceEditPage;
