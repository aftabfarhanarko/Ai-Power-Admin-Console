import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import OrderActionsDropdown from "../components/OrderActionsDropdown";

const useOrdersTable = (
  filteredOrders,
  getStatusLabel,
  setProcessModal,
  handleShipModalOpen,
  setDeliverModal,
  setCancelModal,
  setRefundModal,
  setPartialPaymentModal,
  setDeleteModal
) => {
  const { t } = useTranslation();

  const headers = useMemo(
    () => [
      { header: t("orders.id"), field: "id" },
      { header: t("orders.created"), field: "createdAt" },
      { header: t("orders.customer"), field: "customer" },
      { header: t("orders.paid"), field: "paid" },
      { header: t("orders.total"), field: "total" },
      { header: t("orders.trackingId") || "Tracking ID", field: "trackingId" },
      { header: t("orders.items") || "Items", field: "items" },
      { header: t("common.status") || "Fulfilment", field: "status" },
      { header: t("common.actions"), field: "actions" },
    ],
    [t],
  );

  const tableData = useMemo(
    () =>
      filteredOrders.map((o) => ({
        id: (
          <span className="font-bold text-gray-900 dark:text-gray-100 italic">
            #{o.id}
          </span>
        ),
        createdAt: o.createdAt
          ? new Date(o.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "-",
        customer: (
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {o.customer?.name ?? o.customerName ?? "-"}
          </span>
        ),
        paid: (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${o.isPaid ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${o.isPaid ? "bg-emerald-500" : "bg-amber-500"}`}
            />
            {o.isPaid ? "Success" : "Pending"}
          </div>
        ),
        total: (
          <span className="font-bold text-gray-900 dark:text-gray-100">
            ৳{Number(o.totalAmount || 0).toLocaleString()}
          </span>
        ),
        trackingId: (
          <div className="group">
            <span
              className="font-bold text-gray-900 dark:text-gray-100 italic cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5"
              onClick={async () => {
                const trackingId = o.shippingTrackingId || "";
                if (trackingId) {
                  try {
                    await navigator.clipboard.writeText(trackingId);
                    toast.success(t("orders.trackingIdCopied") || "Tracking ID copied to clipboard");
                  } catch (err) {
                    toast.error(t("common.failed") || "Failed to copy");
                  }
                }
              }}
              title={o.shippingTrackingId ? "Click to copy tracking ID" : ""}
            >
              {o.shippingTrackingId || "-"}
              {o.shippingTrackingId && (
                <svg
                  className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </span>
          </div>
        ),
        items: (
          <span className="text-gray-600 dark:text-gray-400 font-medium">
            {o.items?.length || 0} items
          </span>
        ),
        status: (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${["delivered", "paid", "completed", "shipped"].includes(o.status?.toLowerCase()) ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"} ${o.status?.toLowerCase() === "shipped" ? "cursor-pointer" : ""}`}
            onClick={() => {
              if ((o.status || "").toLowerCase() === "shipped") {
                handleShipModalOpen(o);
              }
            }}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${["delivered", "paid", "completed", "shipped"].includes(o.status?.toLowerCase()) ? "bg-emerald-500" : "bg-rose-500"}`}
            />
            <span className="capitalize">
              {getStatusLabel(o.status)}
            </span>
          </div>
        ),
        actions: (
          <OrderActionsDropdown
            order={o}
            onProcess={() => setProcessModal({ isOpen: true, order: o })}
            onShip={() => handleShipModalOpen(o)}
            onDeliver={() => setDeliverModal({ isOpen: true, order: o })}
            onCancel={() => setCancelModal({ isOpen: true, order: o })}
            onRefund={() => setRefundModal({ isOpen: true, order: o })}
            onPartialPayment={() =>
              setPartialPaymentModal({ isOpen: true, order: o })
            }
            onDelete={() => setDeleteModal({ isOpen: true, order: o })}
          />
        ),
      })),
    [
      filteredOrders,
      getStatusLabel,
      setProcessModal,
      handleShipModalOpen,
      setDeliverModal,
      setCancelModal,
      setRefundModal,
      setPartialPaymentModal,
      setDeleteModal,
      t,
    ],
  );

  return { headers, tableData };
};

export default useOrdersTable;
