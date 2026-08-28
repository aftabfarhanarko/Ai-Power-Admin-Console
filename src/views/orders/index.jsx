import { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  useGetOrdersQuery,
  useProcessOrderMutation,
  useDeliverOrderMutation,
  useShipOrderMutation,
  useDeleteOrderMutation,
  useGetOrderStatsQuery,
  useBarcodeScanMutation,
  useRecordPartialPaymentMutation,
  useCancelOrderMutation,
  useRefundOrderMutation,
} from "@/features/order/orderApiSlice";
import DeleteModal from "@/components/modals/DeleteModal";
import OrdersHeader from "./components/OrdersHeader";
import OrdersStats from "./components/OrdersStats";
import OrdersTableSection from "./components/OrdersTableSection";
import ProcessOrderModal from "./components/ProcessOrderModal";
import ShipOrderModal from "./components/ShipOrderModal";
import DeliverOrderModal from "./components/DeliverOrderModal";
import CancelOrderModal from "./components/CancelOrderModal";
import RefundOrderModal from "./components/RefundOrderModal";
import PartialPaymentModal from "./components/PartialPaymentModal";
import BarcodeScanModal from "./components/BarcodeScanModal";
import useOrdersFilters from "./hooks/useOrdersFilters";
import useOrdersTable from "./hooks/useOrdersTable";

const OrdersPage = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const { data: orders = [], isLoading } = useGetOrdersQuery({
    companyId: authUser?.companyId,
  });
  const { data: stats = {} } = useGetOrderStatsQuery({
    companyId: authUser?.companyId,
  });
  const [processOrder, { isLoading: isProcessing }] = useProcessOrderMutation();
  const [deliverOrder, { isLoading: isDelivering }] = useDeliverOrderMutation();
  const [shipOrder, { isLoading: isShipping }] = useShipOrderMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();
  const [barcodeScan, { isLoading: isBarcodeScanning }] =
    useBarcodeScanMutation();
  const [recordPartialPayment, { isLoading: isRecordingPartial }] =
    useRecordPartialPaymentMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [refundOrder, { isLoading: isRefunding }] = useRefundOrderMutation();

  // Modal states
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    order: null,
  });
  const [processModal, setProcessModal] = useState({
    isOpen: false,
    order: null,
  });
  const [shipModal, setShipModal] = useState({ isOpen: false, order: null });
  const [shipForm, setShipForm] = useState({ trackingId: "", provider: "" });
  const [deliverModal, setDeliverModal] = useState({
    isOpen: false,
    order: null,
  });
  const [deliverForm, setDeliverForm] = useState({
    comment: "",
    markAsPaid: true,
  });
  const [barcodeScanModal, setBarcodeScanModal] = useState({
    isOpen: false,
    value: "",
  });
  const [partialPaymentModal, setPartialPaymentModal] = useState({
    isOpen: false,
    order: null,
  });
  const [partialPaymentForm, setPartialPaymentForm] = useState({
    partialAmount: "",
    partialPaymentRef: "",
  });
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    order: null,
  });
  const [cancelForm, setCancelForm] = useState({
    comment: "",
  });
  const [refundModal, setRefundModal] = useState({
    isOpen: false,
    order: null,
  });

  // Filter states
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const tabs = [
    "All",
    "Pending",
    "Processing",
    "Paid",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Refunded",
    "Unpaid",
  ];

  // Calculate counts for each tab using stats API data
  const tabCounts = useMemo(() => {
    return {
      All: stats?.total || 0,
      Pending: stats?.pending || 0,
      Processing: stats?.processing || 0,
      Paid: stats?.paid || 0,
      Shipped: stats?.shipped || 0,
      Delivered: stats?.delivered || 0,
      Cancelled: stats?.cancelled || 0,
      Refunded: stats?.refunded || 0,
      Unpaid: stats?.unpaidCount || 0,
    };
  }, [stats]);

  // Use custom hook for filtering
  const filteredOrders = useOrdersFilters(
    orders,
    activeTab,
    searchQuery,
    sortBy,
    sortOrder,
    dateRange,
  );

  // Helper function to translate order status
  const getStatusLabel = useCallback(
    (status) => {
      if (!status) return t("common.na");
      const statusLower = status.toLowerCase();
      switch (statusLower) {
        case "pending":
          return t("orders.filterPending") || status;
        case "processing":
          return t("orders.filterProcessing") || status;
        case "paid":
          return t("orders.filterPaid") || status;
        case "shipped":
          return t("orders.filterShipped") || status;
        case "delivered":
          return t("orders.filterDelivered") || status;
        case "cancelled":
          return t("orders.filterCancelled") || status;
        case "refunded":
          return t("orders.filterRefunded") || status;
        default:
          return status;
      }
    },
    [t],
  );

  // Use custom hook for table data
  const handleShipModalOpen = useCallback((order) => {
    setShipModal({ isOpen: true, order });
    setShipForm({
      trackingId: order?.shippingTrackingId || "",
      provider: order?.shippingProvider || "",
    });
  }, []);

  const { headers, tableData } = useOrdersTable(
    filteredOrders,
    getStatusLabel,
    setProcessModal,
    handleShipModalOpen,
    setDeliverModal,
    setCancelModal,
    setRefundModal,
    setPartialPaymentModal,
    setDeleteModal,
  );

  // Handler functions
  const handleProcess = async () => {
    if (!processModal.order) return;
    const res = await processOrder({ id: processModal.order.id });
    if (res?.data) {
      toast.success(t("orders.orderProcessing"));
      try {
        const shipped = await shipOrder({
          id: processModal.order.id,
          body: {},
        }).unwrap();
        setShipModal({ isOpen: true, order: shipped });
        setShipForm({
          trackingId: shipped?.shippingTrackingId || "",
          provider: shipped?.shippingProvider || "",
        });
      } catch (err) {
        toast.error(err?.data?.message || t("common.failed"));
      }
      setProcessModal({ isOpen: false, order: null });
    } else {
      toast.error(res?.error?.data?.message || t("common.failed"));
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.order) return;
    const res = await deleteOrder({ id: deleteModal.order.id });
    if (res?.data || !res?.error) {
      toast.success(t("orders.orderDeleted"));
      setDeleteModal({ isOpen: false, order: null });
    } else {
      toast.error(res?.error?.data?.message || t("common.failed"));
    }
  };

  const handleDeliver = async () => {
    if (!deliverModal.order) return;
    const res = await deliverOrder({
      id: deliverModal.order.id,
      body: {
        comment: deliverForm.comment?.trim() || undefined,
        markAsPaid: deliverForm.markAsPaid,
      },
    });
    if (res?.data) {
      toast.success(t("orders.orderDelivered"));
      setDeliverModal({ isOpen: false, order: null });
      setDeliverForm({ comment: "", markAsPaid: true });
    } else {
      toast.error(res?.error?.data?.message || t("common.failed"));
    }
  };

  const handleShip = async () => {
    if (!shipModal.order) return;
    const res = await shipOrder({
      id: shipModal.order.id,
      body: {
        trackingId: shipForm.trackingId?.trim() || undefined,
        provider: shipForm.provider?.trim() || undefined,
      },
    });
    if (res?.data) {
      toast.success(t("orders.orderShipped"));
      setShipModal({ isOpen: false, order: null });
      setShipForm({ trackingId: "", provider: "" });
    } else {
      toast.error(res?.error?.data?.message || t("common.failed"));
    }
  };

  const handlePartialPayment = async () => {
    if (!partialPaymentModal.order) return;
    const amount = Number(partialPaymentForm.partialAmount);
    if (!amount || amount <= 0) {
      toast.error(
        t("orders.validation.amountRequired") || "Amount is required",
      );
      return;
    }
    const total = Number(partialPaymentModal.order.totalAmount ?? 0);
    const paid = Number(partialPaymentModal.order.paidAmount ?? 0);
    const remaining = total - paid;
    if (amount > remaining) {
      toast.error(
        t("orders.validation.amountExceedsRemaining") ||
          "Amount exceeds remaining balance",
      );
      return;
    }
    const res = await recordPartialPayment({
      id: partialPaymentModal.order.id,
      body: {
        amount,
        paymentRef: partialPaymentForm.partialPaymentRef?.trim() || undefined,
      },
      params: { companyId: authUser?.companyId },
    });
    if (res?.data) {
      toast.success(t("orders.partialPaymentRecorded"));
      setPartialPaymentModal({ isOpen: false, order: null });
      setPartialPaymentForm({ partialAmount: "", partialPaymentRef: "" });
    } else {
      toast.error(
        res?.error?.data?.message || t("orders.partialPaymentFailed"),
      );
    }
  };

  const handleCancel = async () => {
    if (!cancelModal.order) return;
    const res = await cancelOrder({
      id: cancelModal.order.id,
      body: {
        comment: cancelForm.comment?.trim() || undefined,
      },
      params: { companyId: authUser?.companyId },
    });
    if (res?.data) {
      toast.success(t("orders.orderCancelled"));
      setCancelModal({ isOpen: false, order: null });
      setCancelForm({ comment: "" });
    } else {
      toast.error(res?.error?.data?.message || t("common.failed"));
    }
  };

  const handleRefund = async () => {
    if (!refundModal.order) return;
    const res = await refundOrder({
      id: refundModal.order.id,
      params: { companyId: authUser?.companyId },
    });
    if (res?.data) {
      toast.success(t("orders.orderRefunded"));
      setRefundModal({ isOpen: false, order: null });
    } else {
      toast.error(res?.error?.data?.message || t("common.failed"));
    }
  };

  const handleBarcodeScan = async (trackingId) => {
    try {
      await barcodeScan({ body: { trackingId } }).unwrap();
      toast.success(t("orders.barcodeScanRecorded"));
      setBarcodeScanModal({ isOpen: false, value: "" });
    } catch (err) {
      toast.error(err?.data?.message || t("common.failed"));
    }
  };

  const handleExport = () => {
    if (filteredOrders.length === 0) {
      toast.error(t("orders.noOrdersToExport") || "No orders to export");
      return;
    }

    const headers = [
      "Order ID",
      "Date",
      "Customer",
      "Phone",
      "Email",
      "Status",
      "Total Amount",
      "Paid Amount",
      "Is Paid",
      "Tracking ID",
      "Provider",
    ];

    const rows = filteredOrders.map((o) => [
      o.id || "",
      o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-GB") : "",
      o.customer?.name || o.customerName || "",
      o.customer?.phone || o.customerPhone || "",
      o.customer?.email || o.customerEmail || "",
      o.status || "",
      o.totalAmount || 0,
      o.paidAmount || 0,
      o.isPaid ? "Yes" : "No",
      o.shippingTrackingId || "",
      o.shippingProvider || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `orders_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(t("orders.exportSuccess") || "Orders exported successfully");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-neutral-950 p-6 space-y-8">
      <OrdersHeader
        dateRange={dateRange}
        setDateRange={setDateRange}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        handleExport={handleExport}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <OrdersStats stats={stats} />

      <OrdersTableSection
        filteredOrders={filteredOrders}
        isLoading={isLoading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
        tabCounts={tabCounts}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        headers={headers}
        tableData={tableData}
      />

      <ProcessOrderModal
        isOpen={processModal.isOpen}
        onClose={() => setProcessModal({ isOpen: false, order: null })}
        order={processModal.order}
        onConfirm={handleProcess}
        isLoading={isProcessing}
      />

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, order: null })}
        onConfirm={handleDelete}
        title={t("orders.deleteOrder")}
        description={t("orders.deleteOrderDesc")}
        itemName={deleteModal.order ? `Order #${deleteModal.order.id}` : ""}
        isLoading={isDeleting}
      />

      <ShipOrderModal
        isOpen={shipModal.isOpen}
        onClose={() => {
          setShipModal({ isOpen: false, order: null });
          setShipForm({ trackingId: "", provider: "" });
        }}
        order={shipModal.order}
        form={shipForm}
        setForm={setShipForm}
        onConfirm={handleShip}
        isLoading={isShipping}
      />

      <BarcodeScanModal
        isOpen={barcodeScanModal.isOpen}
        onClose={() => setBarcodeScanModal({ isOpen: false, value: "" })}
        value={barcodeScanModal.value}
        setValue={(val) =>
          setBarcodeScanModal((prev) => ({ ...prev, value: val }))
        }
        onScan={handleBarcodeScan}
        isLoading={isBarcodeScanning}
      />

      <DeliverOrderModal
        isOpen={deliverModal.isOpen}
        onClose={() => {
          setDeliverModal({ isOpen: false, order: null });
          setDeliverForm({ comment: "", markAsPaid: true });
        }}
        order={deliverModal.order}
        form={deliverForm}
        setForm={setDeliverForm}
        onConfirm={handleDeliver}
        isLoading={isDelivering}
      />

      <CancelOrderModal
        isOpen={cancelModal.isOpen}
        onClose={() => {
          setCancelModal({ isOpen: false, order: null });
          setCancelForm({ comment: "" });
        }}
        order={cancelModal.order}
        form={cancelForm}
        setForm={setCancelForm}
        onConfirm={handleCancel}
        isLoading={isCancelling}
      />

      <RefundOrderModal
        isOpen={refundModal.isOpen}
        onClose={() => setRefundModal({ isOpen: false, order: null })}
        order={refundModal.order}
        onConfirm={handleRefund}
        isLoading={isRefunding}
      />

      <PartialPaymentModal
        isOpen={partialPaymentModal.isOpen}
        onClose={() => {
          setPartialPaymentModal({ isOpen: false, order: null });
          setPartialPaymentForm({ partialAmount: "", partialPaymentRef: "" });
        }}
        order={partialPaymentModal.order}
        form={partialPaymentForm}
        setForm={setPartialPaymentForm}
        onConfirm={handlePartialPayment}
        isLoading={isRecordingPartial}
      />
    </div>
  );
};

export default OrdersPage;
