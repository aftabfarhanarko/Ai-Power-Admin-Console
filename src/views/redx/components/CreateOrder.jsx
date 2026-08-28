import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  useCreateParcelMutation,
  useGetPickupStoresQuery,
  useGetAreasQuery,
  useGetAreasByPostCodeQuery,
  useGetAreasByDistrictQuery,
} from "@/features/redx/redxApiSlice";
import {
  useGetOrdersQuery,
  useShipOrderMutation,
} from "@/features/order/orderApiSlice";
import toast from "react-hot-toast";
import TextField from "@/components/input/TextField";
import Dropdown from "@/components/dropdown/dropdown";
import { useSelector } from "react-redux";
import {
  User,
  Phone,
  MapPin,
  FileText,
  Package,
  Truck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Store,
  Scale,
  DollarSign,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CreateOrder = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const [createParcel, { isLoading }] = useCreateParcelMutation();
  const [shipOrder, { isLoading: isShipping }] = useShipOrderMutation();
  const { data: storesData } = useGetPickupStoresQuery();
  const { data: areasData } = useGetAreasQuery();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [areaSearchType, setAreaSearchType] = useState("all");
  const [postCode, setPostCode] = useState("");
  const [districtName, setDistrictName] = useState("");

  const { data: areasByPostCode } = useGetAreasByPostCodeQuery(postCode, {
    skip: areaSearchType !== "postcode" || !postCode,
  });
  const { data: areasByDistrict } = useGetAreasByDistrictQuery(districtName, {
    skip: areaSearchType !== "district" || !districtName,
  });

  const { data: allOrders = [], isLoading: isLoadingOrders } =
    useGetOrdersQuery({
      companyId: authUser?.companyId,
    });

  const processingOrders = allOrders.filter(
    (order) => order.status?.toLowerCase() === "processing",
  );

  const orderOptions = useMemo(
    () =>
      processingOrders.map((order) => ({
        label: `Order #${order.id} - ${order.customer?.name || order.customerName || "N/A"} - ${order.totalAmount ? `৳${order.totalAmount}` : "N/A"}`,
        value: order.id,
        orderData: order,
      })),
    [processingOrders],
  );

  const areas =
    areaSearchType === "postcode"
      ? areasByPostCode?.areas || []
      : areaSearchType === "district"
        ? areasByDistrict?.areas || []
        : areasData?.areas || [];

  const pickupStores = storesData?.pickup_stores || [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      pickup_store_id: "",
      merchant_invoice_id: "",
      customer_name: "",
      customer_phone: "",
      customer_address: "",
      delivery_area: "",
      delivery_area_id: "",
      cash_collection_amount: 0,
      parcel_weight: 500,
      value: 0,
      instruction: "",
    },
  });

  const watchDeliveryArea = watch("delivery_area");

  useEffect(() => {
    const area = areas.find((a) => a.name === watchDeliveryArea);
    if (area) {
      setValue("delivery_area_id", area.id);
    }
  }, [watchDeliveryArea, areas, setValue]);

  const handleOrderSelect = (option) => {
    setSelectedOrder(option);

    if (!option || !option.orderData) {
      reset();
      return;
    }

    const order = option.orderData;
    // const items = order.items || order.orderItems || []; // Unused

    if (pickupStores.length > 0) {
      setValue("pickup_store_id", pickupStores[0].id.toString());
    }
    setValue("merchant_invoice_id", order.id?.toString() || "");
    setValue("customer_name", order.customer?.name || order.customerName || "");
    setValue(
      "customer_phone",
      order.customer?.phone || order.shippingPhone || "",
    );
    setValue(
      "customer_address",
      order.customerAddress || order.billingAddress || "",
    );
    setValue("cash_collection_amount", order.totalAmount?.toString() || "0");
    setValue("value", order.totalAmount?.toString() || "0");
    setValue("parcel_weight", "500");
    setValue("instruction", order.notes || "");
    setValue("delivery_area", "");
    setValue("delivery_area_id", "");

    toast.success(t("redx.orderAutoFilled"));
  };

  const onSubmit = async (data) => {
    try {
      const parcelData = {
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        delivery_area: data.delivery_area,
        delivery_area_id: Number(data.delivery_area_id),
        customer_address: data.customer_address,
        cash_collection_amount: data.cash_collection_amount.toString(),
        parcel_weight: data.parcel_weight.toString(),
        value: data.value.toString(),
        merchant_invoice_id: data.merchant_invoice_id || undefined,
        instruction: data.instruction || undefined,
        ...(data.pickup_store_id && {
          pickup_store_id: data.pickup_store_id,
        }),
      };

      const result = await createParcel(parcelData).unwrap();
      const trackingId = result.tracking_id || result.data?.tracking_id;

      if (trackingId) {
        toast.success(t("redx.orderCreatedSuccess"));

        if (selectedOrder?.orderData) {
          try {
            await shipOrder({
              id: selectedOrder.orderData.id,
              body: {
                shippingTrackingId: trackingId,
                shippingProvider: "RedX",
                status: "shipped",
              },
            }).unwrap();
            toast.success(t("redx.orderStatusUpdated"));
          } catch (shipError) {
            console.error("Failed to update order status:", shipError);
            toast.error(t("redx.orderCreatedStatusFailed"));
          }
        }

        reset();
        setSelectedOrder(null);
      }
    } catch (error) {
      const errorMessage = error?.data?.message || t("redx.createOrderFailed");
      toast.error(errorMessage);
      console.error("Create parcel error:", error);
    }
  };

  const cardClass =
    "bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 shadow-sm";
  const titleClass =
    "text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2";
  const selectClassName =
    "flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950/50 px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20 focus-visible:border-red-500 transition-all duration-200 appearance-none";
  const selectWrapperClass = "relative group";
  const selectIconClass =
    "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none transition-transform duration-200 group-focus-within:rotate-180";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
    >
      {/* Left Column - Main Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Order Selection Card */}
        <div className={cardClass}>
          <h3 className={titleClass}>
            <Package className="w-5 h-5 text-red-600" />
            {t("redx.selectOrder", "Select Order")}
          </h3>
          <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-xl">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              {t("redx.selectProcessingOrder", "Select Processing Order")}
            </label>
            {isLoadingOrders ? (
              <p className="text-sm text-gray-500 animate-pulse">
                {t("redx.loadingProcessingOrders", "Loading orders...")}
              </p>
            ) : orderOptions.length === 0 ? (
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {t("redx.noProcessingOrders", "No processing orders found")}
              </div>
            ) : (
              <Dropdown
                name="order"
                options={orderOptions}
                setSelectedOption={handleOrderSelect}
                className="w-full"
              >
                {selectedOrder?.label ||
                  t(
                    "redx.selectOrderPlaceholder",
                    "Select an order to auto-fill",
                  )}
              </Dropdown>
            )}
          </div>
        </div>

        {/* Recipient Details Card */}
        <div className={cardClass}>
          <h3 className={titleClass}>
            <User className="w-5 h-5 text-violet-500" />
            {t("redx.recipientInformation", "Recipient Information")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label={t("redx.customerName", "Customer Name")}
              name="customer_name"
              register={register}
              registerOptions={{
                required: t("redx.customerNameRequired", "Name is required"),
              }}
              placeholder="e.g. John Doe"
              error={errors.customer_name}
              icon={<User className="w-4 h-4" />}
            />
            <TextField
              label={t("redx.customerPhone", "Customer Phone")}
              name="customer_phone"
              type="tel"
              register={register}
              registerOptions={{
                required: t("redx.phoneRequired", "Phone is required"),
                pattern: {
                  value: /^01[0-9]{9}$/,
                  message: t("redx.invalidPhoneFormat", "Invalid phone format"),
                },
              }}
              placeholder="01XXXXXXXXX"
              error={errors.customer_phone}
              icon={<Phone className="w-4 h-4" />}
            />
            <div className="md:col-span-2">
              <TextField
                label={t("redx.customerAddress", "Address")}
                name="customer_address"
                register={register}
                registerOptions={{
                  required: t("redx.addressRequired", "Address is required"),
                }}
                placeholder={t(
                  "redx.addressPlaceholder",
                  "Full delivery address",
                )}
                error={errors.customer_address}
                icon={<MapPin className="w-4 h-4" />}
                multiline
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Delivery Location Card */}
        <div className={cardClass}>
          <h3 className={titleClass}>
            <MapPin className="w-5 h-5 text-red-600" />
            {t("redx.deliveryLocation", "Delivery Location")}
          </h3>

          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap mb-4">
              <button
                type="button"
                onClick={() => setAreaSearchType("all")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  areaSearchType === "all"
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700",
                )}
              >
                {t("redx.allAreas", "All Areas")}
              </button>
              <button
                type="button"
                onClick={() => setAreaSearchType("postcode")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  areaSearchType === "postcode"
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700",
                )}
              >
                {t("redx.byPostCode", "By Post Code")}
              </button>
              <button
                type="button"
                onClick={() => setAreaSearchType("district")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  areaSearchType === "district"
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700",
                )}
              >
                {t("redx.byDistrict", "By District")}
              </button>
            </div>

            {areaSearchType === "postcode" && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  {t("redx.postCode", "Post Code")}
                </label>
                <input
                  type="text"
                  value={postCode}
                  onChange={(e) => setPostCode(e.target.value)}
                  placeholder="1209"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                />
              </div>
            )}

            {areaSearchType === "district" && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  {t("redx.districtName", "District Name")}
                </label>
                <input
                  type="text"
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  placeholder={t("redx.districtPlaceholder", "e.g. Dhaka")}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                {t("redx.deliveryArea", "Delivery Area")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className={selectWrapperClass}>
                <select
                  {...register("delivery_area", {
                    required: t("redx.areaRequired", "Area is required"),
                  })}
                  className={selectClassName}
                >
                  <option value="">
                    {t("redx.selectArea", "Select Area")}
                  </option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.name}>
                      {area.name} ({area.division_name})
                    </option>
                  ))}
                </select>
                <ChevronDown className={selectIconClass} />
              </div>
              {errors.delivery_area && (
                <span className="text-red-500 text-xs ml-1 mt-1 block">
                  {errors.delivery_area.message}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Parcel Details Card */}
        <div className={cardClass}>
          <h3 className={titleClass}>
            <FileText className="w-5 h-5 text-pink-500" />
            {t("redx.parcelDetails", "Parcel Details")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label={t("redx.merchantInvoiceId", "Merchant Invoice ID")}
              name="merchant_invoice_id"
              register={register}
              placeholder={t("redx.merchantInvoicePlaceholder", "Optional")}
              error={errors.merchant_invoice_id}
              icon={<FileText className="w-4 h-4" />}
            />
            <div className="md:col-span-2">
              <TextField
                label={t("redx.instruction", "Special Instruction")}
                name="instruction"
                register={register}
                placeholder={t(
                  "redx.instructionPlaceholder",
                  "Any special instructions",
                )}
                error={errors.instruction}
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
            {t("redx.shippingPayment", "Shipping & Payment")}
          </h3>

          {pickupStores.length === 0 && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                {t(
                  "redx.noStoresFound",
                  "No pickup stores found. Please create one in Manage Stores.",
                )}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {pickupStores.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  {t("redx.selectPickupStore", "Pickup Store")}
                </label>
                <div className="relative">
                  <select
                    {...register("pickup_store_id")}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all appearance-none"
                  >
                    <option value="">
                      {t("redx.selectStorePlaceholder", "Select Store")}
                    </option>
                    {pickupStores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name} - {store.area_name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Store className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            )}

            <TextField
              label={t("redx.cashCollectionAmount", "COD Amount")}
              name="cash_collection_amount"
              type="number"
              register={register}
              registerOptions={{
                required: t("redx.amountRequired", "Amount is required"),
                min: {
                  value: 0,
                  message: t("redx.amountMin", "Cannot be negative"),
                },
              }}
              placeholder="0.00"
              error={errors.cash_collection_amount}
              icon={<CreditCard className="w-4 h-4" />}
            />

            <TextField
              label={t("redx.parcelWeight", "Weight (grams)")}
              name="parcel_weight"
              type="number"
              register={register}
              registerOptions={{
                required: t("redx.weightRequired", "Weight is required"),
                min: { value: 1, message: t("redx.minWeight", "Minimum 1g") },
              }}
              placeholder="500"
              error={errors.parcel_weight}
              icon={<Scale className="w-4 h-4" />}
            />

            <TextField
              label={t("redx.declaredValue", "Declared Value")}
              name="value"
              type="number"
              register={register}
              registerOptions={{
                required: t("redx.valueRequired", "Value is required"),
                min: {
                  value: 0,
                  message: t("redx.valueMin", "Cannot be negative"),
                },
              }}
              placeholder="1000"
              error={errors.value}
              icon={<DollarSign className="w-4 h-4" />}
            />

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="submit"
                disabled={isLoading || isShipping}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-violet-500/30 dark:shadow-none transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading || isShipping ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isLoading
                      ? t("redx.creatingOrder", "Creating...")
                      : t("redx.updatingStatus", "Updating...")}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    {t("redx.createRedXOrder", "Create Order")}
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
