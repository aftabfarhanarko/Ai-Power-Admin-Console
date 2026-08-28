import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Package,
  User,
  CreditCard,
  Truck,
  Calendar,
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Edit,
  MapPin,
  Mail,
  Phone,
  Box,
  CircleDollarSign,
  Receipt,
  Download,
} from "lucide-react";
import { useGetOrderQuery, useProcessOrderMutation } from "@/features/order/orderApiSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";

const OrderViewPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useGetOrderQuery(parseInt(id));
  const [processOrder, { isLoading: isProcessing }] = useProcessOrderMutation();
  const [processModal, setProcessModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">
            {t("orders.loadingOrderDetails", "Loading order details...")}
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
        <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {t("orders.orderNotFound", "Order Not Found")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {t("orders.orderNotFoundDesc", "The order you are looking for might have been removed or is temporarily unavailable.")}
          </p>
        </div>
        <Button
          onClick={() => navigate("/orders")}
          className="rounded-xl px-8 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-medium transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t("orders.backToOrders", "Back to Orders")}
        </Button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "paid":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "cancelled":
      case "refunded":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800";
      case "shipped":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "processing":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "paid":
        return <CheckCircle2 className="w-4 h-4" />;
      case "cancelled":
      case "refunded":
        return <AlertCircle className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "processing":
        return <Clock className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const primaryImage = (product) => {
    if (product?.images?.length > 0) {
      const primary = product.images.find((img) => img.isPrimary);
      return primary?.url || product.images[0]?.url;
    }
    return null;
  };

  // Handle amounts from API (TypeORM returns decimals as strings)
  const formatAmount = (val) => {
    const num = Number(val);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const subtotal = order.items?.reduce(
    (sum, it) => sum + (Number(it.totalPrice) || 0),
    0
  ) ?? 0;

  const canMarkProcessing =
    order.status?.toLowerCase() === "pending" ||
    order.status?.toLowerCase() === "paid";

  const handleProcess = async () => {
    const res = await processOrder({ id: order.id });
    if (res?.data) {
      toast.success(t("orders.orderProcessing", "Order marked as processing"));
      setProcessModal(false);
    } else {
      toast.error(res?.error?.data?.message || t("common.failed", "Operation failed"));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1600px] mx-auto space-y-8 pb-12"
    >
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/orders")}
              className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t("orders.order", "Order")} #{order.id}
              </h1>
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusIcon(order.status)}
                <span className="text-xs font-bold uppercase tracking-wider">
                  {order.status || "PENDING"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 pl-14">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">
              {order.createdAt &&
                new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pl-14 lg:pl-0 w-full lg:w-auto">
          {canMarkProcessing && (
            <Button
              onClick={() => setProcessModal(true)}
              disabled={isProcessing}
              className="flex-1 lg:flex-none h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-lg shadow-amber-500/20 transition-all"
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              {isProcessing ? t("common.processing") : t("orders.markProcessing", "Mark Processing")}
            </Button>
          )}
          <Button
            variant="outline"
            className="flex-1 lg:flex-none h-11 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
          >
            <Printer className="h-4 w-4 mr-2" />
            {t("common.print", "Print Invoice")}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/orders/${id}/edit`)}
            className="flex-1 lg:flex-none h-11 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
          >
            <Edit className="h-4 w-4 mr-2" />
            {t("common.edit", "Edit Order")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Content Column */}
        <div className="xl:col-span-8 space-y-8">
          {/* Order Items Card */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[18px] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                  <Box className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t("orders.orderItems", "Order Items")}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {order.items?.length || 0} {t("orders.itemsIncluded", "items included in this order")}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {order.items?.map((item, index) => {
                const productImage = primaryImage(item.product);
                return (
                  <div
                    key={index}
                    className="group flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-[24px] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300"
                  >
                    <div className="relative">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={item.product?.name}
                          className="w-24 h-24 rounded-2xl object-cover shadow-sm group-hover:shadow-md transition-shadow"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          <Package className="h-8 w-8 text-slate-400" />
                        </div>
                      )}
                      <span className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center bg-indigo-600 text-white text-xs font-bold rounded-full shadow-lg border-2 border-white dark:border-slate-900">
                        {item.quantity}x
                      </span>
                    </div>

                    <div className="flex-1 w-full sm:w-auto">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {item.product?.name || item.name || t("orders.unknownProduct")}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                            {item.product?.type && (
                              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                                item.product.type === 'physical' 
                                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-800'
                                  : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-100 dark:border-purple-800'
                              }`}>
                                {item.product.type}
                              </span>
                            )}
                            <span className="bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-mono">
                              {item.product?.sku || item.sku || "N/A"}
                            </span>
                            <span>•</span>
                            <span>
                              {t("products.unitPrice", "Unit Price")}: ৳{formatAmount(item.unitPrice)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">
                            {t("orders.total", "Total")}
                          </p>
                          <p className="text-xl font-bold text-slate-900 dark:text-white">
                            ৳{formatAmount(item.totalPrice)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-8 pb-8">
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[24px] p-6 space-y-4 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="font-medium">{t("orders.subtotal", "Subtotal")}</span>
                  <span className="font-bold">৳{formatAmount(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="font-medium">{t("orders.shippingCost", "Shipping Cost")}</span>
                  <span className="font-bold">৳0.00</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="font-medium">{t("orders.discount", "Discount")}</span>
                  <span className="font-bold text-emerald-600">-৳0.00</span>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-700 my-4" />
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {t("orders.grandTotal", "Grand Total")}
                  </span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    ৳{formatAmount(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Cancellation Info (Conditional) */}
          {order.status?.toLowerCase() === "cancelled" && order.cancelNote && (
            <motion.div variants={itemVariants} className="bg-red-50 dark:bg-red-900/10 rounded-[32px] border border-red-100 dark:border-red-900/20 p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-red-700 dark:text-red-400">
                    {t("orders.cancellationReason", "Cancellation Reason")}
                  </h3>
                  <p className="text-red-600 dark:text-red-300 leading-relaxed">
                    {order.cancelNote}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="xl:col-span-4 space-y-8">
          {/* Customer Card */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-[18px] bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t("orders.customerDetails", "Customer Details")}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
                  {t("orders.contactInfo", "Contact Info")}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-slate-600 dark:text-slate-300">
                    {(order.customer?.name || order.customerName || "?").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-white">
                    {order.customer?.name || order.customerName || "N/A"}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t("orders.customerID", "ID")}: {order.customerId || "Guest"}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                {(order.customer?.email || order.customerEmail) && (
                  <div className="flex items-center gap-3 group">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                      <Mail className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">
                        {t("customers.email", "Email")}
                      </p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                        {order.customer?.email || order.customerEmail}
                      </p>
                    </div>
                  </div>
                )}

                {(order.customer?.phone || order.customerPhone) && (
                  <div className="flex items-center gap-3 group">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                      <Phone className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">
                        {t("customers.phone", "Phone")}
                      </p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {order.customer?.phone || order.customerPhone}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Shipping & Address Card */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-[18px] bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t("orders.shippingInfo", "Shipping Info")}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
                  {t("orders.deliveryDetails", "Delivery Details")}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {order.customerAddress && (
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
                      {t("orders.deliveryAddress", "Delivery Address")}
                    </p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                      {order.customerAddress}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
                    {t("orders.deliveryType", "Delivery Type")}
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Box className="w-4 h-4 text-indigo-500" />
                    {order.deliveryType || "Standard Delivery"}
                  </p>
                </div>

                {order.shippingTrackingId && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
                      {t("orders.trackingId", "Tracking ID")}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-mono font-bold text-slate-900 dark:text-white">
                        {order.shippingTrackingId}
                      </p>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                        <ClipboardCheck className="w-4 h-4 text-slate-400" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Payment Card */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-[18px] bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t("orders.paymentInfo", "Payment Info")}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
                  {t("orders.billingDetails", "Billing Details")}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
                    {t("orders.status", "Status")}
                  </p>
                  <p className={`font-bold ${order.isPaid ? "text-emerald-600" : "text-amber-600"}`}>
                    {order.isPaid ? t("orders.paid", "PAID") : t("orders.unpaid", "UNPAID")}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  order.isPaid ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                }`}>
                  {order.isPaid ? <CheckCircle2 className="w-5 h-5" /> : <CircleDollarSign className="w-5 h-5" />}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {t("orders.method", "Payment Method")}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {order.paymentMethod || "N/A"}
                  </span>
                </div>
                {order.paymentReference && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {t("orders.reference", "Reference")}
                    </span>
                    <span className="text-sm font-mono font-medium text-slate-900 dark:text-white">
                      {order.paymentReference}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {t("orders.amountPaid", "Amount Paid")}
                  </span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    ৳{formatAmount(order.paidAmount || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {t("orders.remaining", "Remaining")}
                  </span>
                  <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                    ৳{formatAmount((Number(order.totalAmount) || 0) - (Number(order.paidAmount) || 0))}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Process Confirmation Modal */}
      <Dialog open={processModal} onOpenChange={setProcessModal}>
        <DialogContent className="sm:max-w-[425px] rounded-[32px] p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClipboardCheck className="w-10 h-10 text-amber-500" />
            </div>
            
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white text-center">
                {t("orders.markProcessing", "Mark as Processing")}
              </DialogTitle>
              <p className="text-slate-500 dark:text-slate-400 text-center max-w-[280px] mx-auto">
                {t("orders.confirmProcessing", "Are you sure you want to mark Order")} <span className="font-bold text-slate-900 dark:text-white">#{order.id}</span> {t("orders.asProcessing", "as processing?")}
              </p>
            </DialogHeader>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => setProcessModal(false)}
                disabled={isProcessing}
                className="flex-1 h-12 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                onClick={handleProcess}
                disabled={isProcessing}
                className="flex-1 h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-500/20"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t("common.processing", "Processing...")}</span>
                  </div>
                ) : (
                  t("orders.confirm", "Confirm")
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default OrderViewPage;
