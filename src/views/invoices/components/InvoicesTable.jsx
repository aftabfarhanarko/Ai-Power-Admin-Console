import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Edit3, Download, Trash2, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { downloadSaleInvoicePDF } from "@/utils/saleInvoicePDF";
import { Button } from "@/components/ui/button";
import ReusableTable from "@/components/table/reusable-table";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

const headers = [
  { header: "ID", field: "id", sortable: true, tKey: "invoices.table.id" },
  {
    header: "CREATED",
    field: "created",
    sortable: true,
    tKey: "invoices.table.created",
  },
  {
    header: "CUSTOMER",
    field: "customer",
    tKey: "invoices.table.customer",
  },
  {
    header: "PAID",
    field: "paid",
    sortable: true,
    tKey: "invoices.table.paidStatus",
  },
  {
    header: "TOTAL",
    field: "total",
    sortable: true,
    tKey: "invoices.table.total",
  },
  {
    header: "ORDERS.DELIVERY",
    field: "delivery",
    tKey: "invoices.table.deliveryStatus",
  },
  {
    header: "ITEMS",
    field: "items",
    tKey: "invoices.table.items",
  },
  {
    header: "STATUS",
    field: "status",
    tKey: "invoices.table.fulfillmentStatus",
  },
  {
    header: "ACTIONS",
    field: "actions",
    sortable: false,
    tKey: "invoices.table.actions",
  },
];

export default function InvoicesTable({
  filteredData,
  authUser,
  isLoading,
  onDeleteClick,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const localizedHeaders = useMemo(
    () =>
      headers.map((h) => ({
        ...h,
        header: h.tKey ? t(h.tKey) : h.header,
      })),
    [t],
  );

  const tableData = useMemo(() => {
    return filteredData.map((invoice) => ({
      id: (
        <span className="font-bold text-gray-900 dark:text-gray-100">
          #{invoice.id}
        </span>
      ),
      created: invoice.createdAt
        ? format(new Date(invoice.createdAt), "d MMM yyyy")
        : "-",
      customer: (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#5347CE]/10 flex items-center justify-center text-[#5347CE] font-bold text-xs">
            {(invoice.customer?.name || "C").charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {invoice.customer?.name || t("invoices.table.unknownCustomer")}
          </span>
        </div>
      ),
      paid: (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-fit capitalize ${
            invoice.status?.toLowerCase() === "paid"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
              : invoice.status?.toLowerCase() === "overdue"
                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                : invoice.status?.toLowerCase() === "cancelled"
                  ? "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                  : "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              invoice.status?.toLowerCase() === "paid"
                ? "bg-emerald-500"
                : invoice.status?.toLowerCase() === "overdue"
                  ? "bg-red-500"
                  : invoice.status?.toLowerCase() === "cancelled"
                    ? "bg-gray-500"
                    : "bg-orange-500"
            }`}
          ></span>
          {(() => {
            const s = (invoice.status || "pending").toString().toLowerCase();
            switch (s) {
              case "paid":
                return t("invoices.statuses.paid");
              case "overdue":
                return t("invoices.statuses.overdue");
              case "cancelled":
                return t("invoices.statuses.cancelled");
              case "sent":
                return t("invoices.statuses.sent");
              case "draft":
                return t("invoices.statuses.draft");
              case "partial":
                return t("invoices.statuses.partial");
              case "pending":
              default:
                return t("invoices.statuses.pending");
            }
          })()}
        </span>
      ),
      total: (
        <span className="font-bold text-gray-900 dark:text-gray-100">
          {formatCurrency(invoice.totalAmount)}
        </span>
      ),
      delivery: (
        <span className="text-gray-500 text-sm font-medium">
          {invoice.deliveryStatus || t("invoices.table.na")}
        </span>
      ),
      items: (
        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
          {(Array.isArray(invoice.items) ? invoice.items?.length : invoice.items) ||
            1}{" "}
          {t("invoices.table.itemsSuffix")}
        </span>
      ),
      status: (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-fit ${
            invoice.fulfillmentStatus?.toLowerCase() === "fulfilled"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${invoice.fulfillmentStatus?.toLowerCase() === "fulfilled" ? "bg-emerald-500" : "bg-red-500"}`}
          ></span>
          {invoice.fulfillmentStatus?.toLowerCase() === "fulfilled"
            ? t("invoices.statuses.fulfilled")
            : t("invoices.statuses.unfulfilled")}
        </span>
      ),
      actions: (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">
                    {t("invoices.table.openMenu")}
                  </span>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {t("invoices.table.actionsLabel")}
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigate(`/invoices/${invoice.id}`)}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              {t("invoices.table.viewDetails")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
              className="cursor-pointer"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              {t("invoices.table.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                try {
                  const companyInfo = {
                    companyName: authUser?.companyName,
                    branchLocation: authUser?.branchLocation,
                  };
                  downloadSaleInvoicePDF(invoice, companyInfo);
                  toast.success(t("invoices.toast.downloadSuccess"));
                } catch (err) {
                  toast.error(t("invoices.toast.downloadFailed"));
                }
              }}
              className="cursor-pointer"
            >
              <Download className="mr-2 h-4 w-4" />
              {t("invoices.table.downloadPdf")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 cursor-pointer"
              onClick={() => onDeleteClick(invoice)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("invoices.table.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }));
  }, [filteredData, authUser, onDeleteClick]);

  return (
    <ReusableTable
      data={tableData}
      headers={localizedHeaders}
      isLoading={isLoading}
      searchPlaceholder={t("invoices.table.searchPlaceholder")}
      py="py-4"
    />
  );
}
