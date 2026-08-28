import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export default function OrderViewModal({ order }) {
  const { t } = useTranslation();
  if (!order) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400"
          title={t("common.view")}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("orders.orderDetails")} #{order.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {/* Order Summary Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                {t("orders.orderSummary")}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-black/70 dark:text-white/70">{t("orders.orderId")}</label>
                <p className="text-base text-black dark:text-white mt-1">{order.id || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-black/70 dark:text-white/70">{t("common.status")}</label>
                <p className="text-base text-black dark:text-white mt-1">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      order.status === "completed" || order.status === "delivered"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : order.status === "cancelled"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                    }`}
                  >
                    {order.status || "-"}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-black/70 dark:text-white/70">{t("orders.totalAmount")}</label>
                <p className="text-lg text-black dark:text-white mt-1 font-bold">
                  {typeof order.totalAmount === "number"
                    ? `$${Number(order.totalAmount).toFixed(2)}`
                    : order.totalAmount || "-"}
                </p>
              </div>
              {order.createdAt && (
                <div>
                  <label className="text-sm font-medium text-black/70 dark:text-white/70">{t("orders.created")}</label>
                  <p className="text-base text-black dark:text-white mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
              {order.updatedAt && (
                <div>
                  <label className="text-sm font-medium text-black/70 dark:text-white/70">{t("orders.lastUpdated")}</label>
                  <p className="text-base text-black dark:text-white mt-1">
                    {new Date(order.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                {t("orders.customerInformation")}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-black/70 dark:text-white/70">{t("orders.customerName")}</label>
                <p className="text-base text-black dark:text-white mt-1">
                  {order.customer?.name || order.customerName || "-"}
                </p>
              </div>
              {order.customer?.email && (
                <div>
                  <label className="text-sm font-medium text-black/70 dark:text-white/70">{t("customers.email")}</label>
                  <p className="text-base text-black dark:text-white mt-1">{order.customer.email}</p>
                </div>
              )}
              {order.customer?.phone && (
                <div>
                  <label className="text-sm font-medium text-black/70 dark:text-white/70">{t("customers.phone")}</label>
                  <p className="text-base text-black dark:text-white mt-1">{order.customer.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                {t("orders.paymentInformation")}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-black/70 dark:text-white/70">{t("orders.paymentStatus")}</label>
                <p className="text-base text-black dark:text-white mt-1">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      order.isPaid
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {order.isPaid ? t("orders.paid") : t("orders.unpaid")}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-black/70 dark:text-white/70">{t("orders.paymentMethod")}</label>
                <p className="text-base text-black dark:text-white mt-1">{order.paymentMethod || "-"}</p>
              </div>
              {order.paymentReference && (
                <div>
                  <label className="text-sm font-medium text-black/70 dark:text-white/70">{t("orders.paymentReference")}</label>
                  <p className="text-base text-black dark:text-white mt-1">{order.paymentReference}</p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Information Section */}
          {(order.shippingAddress || order.shippingTrackingId || order.shippingProvider) && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                  {t("orders.shippingInformation")}
                </h3>
              </div>
              <div className="border border-black/5 dark:border-gray-800 rounded-md p-4 space-y-3 bg-black/5 dark:bg-white/5">
                {order.shippingAddress && (
                  <div>
                    <label className="text-xs uppercase font-medium text-black/60 dark:text-white/60">{t("orders.address")}</label>
                    <p className="text-sm text-black dark:text-white mt-1 whitespace-pre-wrap">
                      {order.shippingAddress}
                    </p>
                  </div>
                )}
                {order.shippingTrackingId && (
                  <div>
                    <label className="text-xs uppercase font-medium text-black/60 dark:text-white/60">{t("orders.trackingId")}</label>
                    <p className="text-sm text-black dark:text-white mt-1 font-mono">{order.shippingTrackingId}</p>
                  </div>
                )}
                {order.shippingProvider && (
                  <div>
                    <label className="text-xs uppercase font-medium text-black/60 dark:text-white/60">{t("orders.provider")}</label>
                    <p className="text-sm text-black dark:text-white mt-1">{order.shippingProvider}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Items Section */}
          {order.items && order.items.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                  {t("orders.orderItems")} ({order.items.length})
                </h3>
              </div>
              <div className="border border-black/5 dark:border-gray-800 rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-black/5 dark:bg-white/5">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-black/70 dark:text-white/70">
                          {t("orders.product")}
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-black/70 dark:text-white/70">
                          {t("products.sku")}
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-black/70 dark:text-white/70">
                          {t("orders.quantity")}
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-black/70 dark:text-white/70">
                          {t("orders.unitPrice")}
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-black/70 dark:text-white/70">
                          {t("orders.total")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {order.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-black dark:text-white">
                            {item.product?.name || item.name || "-"}
                          </td>
                          <td className="px-4 py-2 text-sm text-black/70 dark:text-white/70">
                            {item.product?.sku || item.sku || "-"}
                          </td>
                          <td className="px-4 py-2 text-sm text-black dark:text-white text-right">
                            {item.quantity || 0}
                          </td>
                          <td className="px-4 py-2 text-sm text-black dark:text-white text-right">
                            {typeof item.unitPrice === "number"
                              ? `$${Number(item.unitPrice).toFixed(2)}`
                              : item.unitPrice || "-"}
                          </td>
                          <td className="px-4 py-2 text-sm font-medium text-black dark:text-white text-right">
                            {typeof item.totalPrice === "number"
                              ? `$${Number(item.totalPrice).toFixed(2)}`
                              : item.totalPrice || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}





