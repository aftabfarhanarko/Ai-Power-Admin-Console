import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useCreateOrderMutation } from "@/features/steadfast/steadfastApiSlice";
import { useGetOrdersQuery, useShipOrderMutation } from "@/features/order/orderApiSlice";
import toast from "react-hot-toast";
import TextField from "@/components/input/TextField";
import Dropdown from "@/components/dropdown/dropdown";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  Package, 
  Truck, 
  CreditCard,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const CreateOrder = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [shipOrder, { isLoading: isShipping }] = useShipOrderMutation();
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Fetch orders with status = "processing"
  const { data: allOrders = [], isLoading: isLoadingOrders } = useGetOrdersQuery({ companyId: authUser?.companyId });
  
  // Filter processing orders
  const processingOrders = allOrders.filter(
    (order) => order.status?.toLowerCase() === "processing"
  );
  
  // Create options for dropdown
  const orderOptions = useMemo(
    () => processingOrders.map((order) => ({
      label: `Order #${order.id} - ${order.customer?.name || order.customerName || "N/A"} - ${order.totalAmount ? `৳${order.totalAmount}` : "N/A"}`,
      value: order.id,
      orderData: order,
    })),
    [processingOrders]
  );
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      invoice: "",
      recipient_name: "",
      recipient_phone: "",
      alternative_phone: "",
      recipient_email: "",
      recipient_address: "",
      cod_amount: "",
      note: "",
      item_description: "",
      total_lot: "",
      delivery_type: 0,
    },
  });

  const selectedDeliveryType = watch("delivery_type");

  // Handle order selection and auto-fill form
  const handleOrderSelect = (option) => {
    setSelectedOrder(option);
    
    if (!option || !option.orderData) {
      reset();
      return;
    }
    
    const order = option.orderData;
    
    // Auto-fill form fields from selected order
    setValue("invoice", order.id?.toString() || "");
    setValue("recipient_name", order.customer?.name || order.customerName || "");
    setValue("recipient_phone", order.customer?.phone || order.shippingPhone || "");
    setValue("alternative_phone", order.customer?.phone || "");
    setValue("recipient_email", order.customer?.email || order.customerEmail || "");
    setValue("recipient_address", order.customerAddress || order.billingAddress || "");
    setValue("cod_amount", order.totalAmount?.toString() || "");
    setValue("note", order.notes || "");
    setValue("item_description", order.orderItems?.map(item => item.productName || item.name).join(", ") || "");
    setValue("total_lot", order.orderItems?.length?.toString() || "1");
    setValue("delivery_type", 0);
    
    toast.success(t("steadfast.orderAutoFilled", "Order details auto-filled"));
  };

  const onSubmit = async (data) => {
    // Validation
    if (data.recipient_phone && data.recipient_phone.length !== 11) {
      toast.error(t("steadfast.recipientPhone11Digits", "Recipient phone must be 11 digits"));
      return;
    }

    if (data.alternative_phone && data.alternative_phone.length !== 11) {
      toast.error(t("steadfast.alternativePhone11Digits", "Alternative phone must be 11 digits"));
      return;
    }

    // Prepare form data
    const formData = {
      invoice: data.invoice,
      recipient_name: data.recipient_name,
      recipient_phone: data.recipient_phone,
      alternative_phone: data.alternative_phone || "",
      recipient_email: data.recipient_email || "",
      recipient_address: data.recipient_address,
      cod_amount: data.cod_amount ? Number(data.cod_amount) : 0,
      note: data.note || "",
      item_description: data.item_description || "",
      total_lot: data.total_lot ? Number(data.total_lot) : "",
      delivery_type: data.delivery_type ? Number(data.delivery_type) : 0,
    };

    try {
      const result = await createOrder(formData).unwrap();
      if (result.status === 200) {
        toast.success(result.message || t("steadfast.orderCreatedSuccess", "Order created successfully"));
        
        // Extract tracking information from Steadfast response
        const trackingCode = result.consignment?.tracking_code || result.tracking_code;
        const consignmentId = result.consignment?.consignment_id || result.consignment_id;
        
        // Update the order with shipping information if we have a selected order
        if (selectedOrder && selectedOrder.orderData) {
          try {
            const shipmentData = {
              shippingTrackingId: trackingCode || consignmentId || "",
              shippingProvider: "Steadfast",
              status: "shipped",
            };
            
            await shipOrder({
              id: selectedOrder.orderData.id,
              body: shipmentData,
            }).unwrap();
            
            toast.success(t("steadfast.orderStatusUpdated", "Order status updated to Shipped"));
          } catch (shipError) {
            console.error("Failed to update order status:", shipError);
            toast.error(t("steadfast.orderCreatedStatusFailed", "Order created but failed to update status"));
          }
        }
        
        reset();
        setSelectedOrder(null);
      }
    } catch (error) {
      const errorMessage = error?.data?.message || t("steadfast.createOrderFailed", "Failed to create order");
      const errorDetails = error?.data?.details;
      
      if (error?.status === 429) {
        toast.error(`${errorMessage}${errorDetails ? ` - ${errorDetails}` : ""}`, { duration: 6000 });
      } else if (error?.status === 401) {
        toast.error(`${errorMessage}${errorDetails ? ` - ${errorDetails}` : ""}`, { duration: 6000 });
      } else {
        toast.error(errorMessage);
      }
      console.error("Create order error:", error);
    }
  };

  const cardClass = "bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 shadow-sm";
  const titleClass = "text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Main Info */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Order Selection Card */}
        <div className={cardClass}>
          <h3 className={titleClass}>
            <Package className="w-5 h-5 text-indigo-500" />
            {t("steadfast.selectOrder", "Select Order")}
          </h3>
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-xl">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              {t("steadfast.selectProcessingOrder", "Select Processing Order")}
            </label>
            {isLoadingOrders ? (
              <p className="text-sm text-gray-500 animate-pulse">{t("steadfast.loadingProcessingOrders", "Loading orders...")}</p>
            ) : orderOptions.length === 0 ? (
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {t("steadfast.noProcessingOrders", "No processing orders found")}
              </div>
            ) : (
              <Dropdown
                name="order"
                options={orderOptions}
                setSelectedOption={handleOrderSelect}
                className="w-full"
              >
                {selectedOrder?.label || t("steadfast.selectOrderPlaceholder", "Select an order to auto-fill")}
              </Dropdown>
            )}
          </div>
        </div>

        {/* Recipient Details Card */}
        <div className={cardClass}>
          <h3 className={titleClass}>
            <User className="w-5 h-5 text-violet-500" />
            {t("steadfast.recipientDetails", "Recipient Details")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label={t("steadfast.recipientName", "Name")}
              name="recipient_name"
              register={register}
              registerOptions={{ required: t("steadfast.required", "Required") }}
              placeholder="e.g. John Doe"
              error={errors.recipient_name}
              icon={<User className="w-4 h-4" />}
            />
            <TextField
              label={t("steadfast.recipientPhone", "Phone")}
              name="recipient_phone"
              type="tel"
              register={register}
              registerOptions={{ 
                required: t("steadfast.required", "Required"),
                minLength: { value: 11, message: "11 digits required" },
                maxLength: { value: 11, message: "11 digits required" }
              }}
              placeholder="01XXXXXXXXX"
              error={errors.recipient_phone}
              icon={<Phone className="w-4 h-4" />}
            />
            <TextField
              label={t("steadfast.alternativePhone", "Alt. Phone")}
              name="alternative_phone"
              type="tel"
              register={register}
              registerOptions={{ 
                minLength: { value: 11, message: "11 digits required" },
                maxLength: { value: 11, message: "11 digits required" }
              }}
              placeholder="01XXXXXXXXX"
              error={errors.alternative_phone}
              icon={<Phone className="w-4 h-4" />}
            />
            <TextField
              label={t("steadfast.recipientEmail", "Email")}
              name="recipient_email"
              type="email"
              register={register}
              placeholder="john@example.com"
              error={errors.recipient_email}
            />
            <div className="md:col-span-2">
              <TextField
                label={t("steadfast.recipientAddress", "Address")}
                name="recipient_address"
                register={register}
                registerOptions={{ required: t("steadfast.required", "Required") }}
                placeholder="Full delivery address"
                error={errors.recipient_address}
                icon={<MapPin className="w-4 h-4" />}
                multiline
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Parcel Details Card */}
        <div className={cardClass}>
          <h3 className={titleClass}>
            <Package className="w-5 h-5 text-pink-500" />
            {t("steadfast.parcelDetails", "Parcel Details")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label={t("steadfast.invoiceId", "Invoice ID")}
              name="invoice"
              register={register}
              registerOptions={{ required: t("steadfast.required", "Required") }}
              placeholder="INV-123456"
              error={errors.invoice}
              icon={<FileText className="w-4 h-4" />}
            />
            <TextField
              label={t("steadfast.itemDescription", "Item Description")}
              name="item_description"
              register={register}
              placeholder="e.g. Blue T-Shirt, Jeans"
              error={errors.item_description}
            />
            <div className="md:col-span-2">
               <TextField
                label={t("steadfast.note", "Special Note")}
                name="note"
                register={register}
                placeholder="Any special instructions for delivery man"
                error={errors.note}
                multiline
                rows={2}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Shipping & Actions */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Shipping & Payment Card */}
        <div className={cn(cardClass, "sticky top-6")}>
          <h3 className={titleClass}>
            <Truck className="w-5 h-5 text-emerald-500" />
            {t("steadfast.shippingPayment", "Shipping & Payment")}
          </h3>
          
          <div className="space-y-4">
            <TextField
              label={t("steadfast.codAmount", "COD Amount")}
              name="cod_amount"
              type="number"
              register={register}
              registerOptions={{ required: t("steadfast.required", "Required"), min: 0 }}
              placeholder="0.00"
              error={errors.cod_amount}
              icon={<CreditCard className="w-4 h-4" />}
            />

            <TextField
              label={t("steadfast.totalLot", "Total Lot (Quantity)")}
              name="total_lot"
              type="number"
              register={register}
              registerOptions={{ min: 1 }}
              placeholder="1"
              error={errors.total_lot}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("steadfast.deliveryType", "Delivery Type")}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setValue("delivery_type", 0)}
                  className={cn(
                    "p-3 rounded-xl border text-sm font-medium transition-all",
                    selectedDeliveryType === 0
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setValue("delivery_type", 1)}
                  className={cn(
                    "p-3 rounded-xl border text-sm font-medium transition-all",
                    selectedDeliveryType === 1
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  Express
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="submit"
                disabled={isLoading || isShipping}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-base shadow-lg shadow-indigo-500/30 dark:shadow-none transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading || isShipping ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("steadfast.processing", "Processing...")}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    {t("steadfast.createOrder", "Create Order")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateOrder;
