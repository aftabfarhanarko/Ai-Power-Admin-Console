import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  useCreateOrderMutation,
  useGetStoresQuery,
  useGetCitiesQuery,
  useGetZonesQuery,
  useGetAreasQuery,
} from "@/features/pathao/pathaoApiSlice";
import { useGetOrdersQuery, useShipOrderMutation } from "@/features/order/orderApiSlice";
import toast from "react-hot-toast";
import TextField from "@/components/input/TextField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Dropdown from "@/components/dropdown/dropdown";
import { useSelector } from "react-redux";
import { Loader2, AlertCircle, ChevronDown, Package, User, MapPin, Store, Truck, FileText, CheckCircle2, DollarSign, Scale, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const CreateOrder = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [shipOrder, { isLoading: isShipping }] = useShipOrderMutation();
  const { data: storesData } = useGetStoresQuery();
  const { data: citiesData } = useGetCitiesQuery();
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  
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
  
  const { data: zonesData } = useGetZonesQuery(selectedCity, {
    skip: !selectedCity,
  });
  
  const { data: areasData } = useGetAreasQuery(selectedZone, {
    skip: !selectedZone,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      store_id: "",
      merchant_order_id: "",
      recipient_name: "",
      recipient_phone: "",
      recipient_address: "",
      recipient_city: "",
      recipient_zone: "",
      recipient_area: "",
      delivery_type: 48,
      item_type: 2,
      special_instruction: "",
      item_quantity: 1,
      item_weight: 0.5,
      amount_to_collect: 0,
      item_description: "",
    },
  });

  // Watch city and zone changes
  const watchCity = watch("recipient_city");
  const watchZone = watch("recipient_zone");

  useEffect(() => {
    if (watchCity) {
      setSelectedCity(watchCity);
      setValue("recipient_zone", "");
      setValue("recipient_area", "");
    }
  }, [watchCity, setValue]);

  useEffect(() => {
    if (watchZone) {
      setSelectedZone(watchZone);
      setValue("recipient_area", "");
    }
  }, [watchZone, setValue]);

  // Handle order selection and auto-fill form
  const handleOrderSelect = (option) => {
    setSelectedOrder(option);
    
    if (!option || !option.orderData) {
      reset();
      setSelectedCity("");
      setSelectedZone("");
      return;
    }
    
    const order = option.orderData;
    
    // Auto-fill form fields from selected order
    // Store ID - use first available store as default
    if (stores.length > 0) {
      setValue("store_id", stores[0].store_id.toString());
    }
    
    setValue("merchant_order_id", order.id?.toString() || "");
    setValue("recipient_name", order.customer?.name || order.customerName || "");
    setValue("recipient_phone", order.customer?.phone || order.shippingPhone || "");
    setValue("recipient_address", order.customerAddress || order.billingAddress || "");
    
    // City, Zone, Area - cannot auto-populate as they require specific IDs from Pathao API
    // User will need to select these manually
    setValue("recipient_city", "");
    setValue("recipient_zone", "");
    setValue("recipient_area", "");
    setSelectedCity("");
    setSelectedZone("");
    
    // Build item description: product name and description only
    const items = order.items || order.orderItems || [];
    const itemDescription = items
      .map((item) => {
        const name = item.product?.name || item.productName || item.name || "Product";
        const desc = item.product?.description || item.description;
        return desc ? `${name}: ${desc}` : name;
      })
      .join(", ");
    setValue("item_description", itemDescription || "");
    setValue("special_instruction", order.notes || "");
    setValue("item_quantity", items.length || 1);
    setValue("amount_to_collect", order.totalAmount?.toString() || "0");
    setValue("item_weight", "0.5"); // Default weight
    setValue("delivery_type", 48); // Normal delivery
    setValue("item_type", 2); // Parcel
    
    toast.success(t("pathao.orderAutoFilled"));
  };

  const onSubmit = async (data) => {
    try {
      const orderData = {
        store_id: Number(data.store_id),
        merchant_order_id: data.merchant_order_id,
        recipient_name: data.recipient_name,
        recipient_phone: data.recipient_phone,
        recipient_address: data.recipient_address,
        recipient_city: Number(data.recipient_city),
        recipient_zone: Number(data.recipient_zone),
        recipient_area: Number(data.recipient_area),
        delivery_type: Number(data.delivery_type),
        item_type: Number(data.item_type),
        special_instruction: data.special_instruction || "",
        item_quantity: Number(data.item_quantity),
        item_weight: Number(data.item_weight),
        amount_to_collect: Number(data.amount_to_collect),
        item_description: data.item_description || "",
      };

      const result = await createOrder(orderData).unwrap();
      
      if (result.code === 200 || result.type === "success") {
        toast.success(t("pathao.orderCreatedSuccess"));
        
        // Extract tracking information from Pathao response
        const consignmentId = result.data?.data?.consignment_id || result.data?.consignment_id;
        const trackingCode = result.data?.data?.tracking_code || result.data?.tracking_code;
        
        // Get city name from selected city
        const cityName = cities.find(c => c.city_id === Number(data.recipient_city))?.city_name || "";
        
        // Update the order with shipping information if we have a selected order
        if (selectedOrder && selectedOrder.orderData) {
          try {
            const shipmentData = {
              shippingTrackingId: consignmentId || trackingCode || "",
              shippingProvider: "Pathao",
              status: "shipped",
              ...(cityName && { shippingCity: cityName }),
            };
            
            await shipOrder({
              id: selectedOrder.orderData.id,
              body: shipmentData,
            }).unwrap();
            
            toast.success(t("pathao.orderStatusUpdated"));
          } catch (shipError) {
            console.error("Failed to update order status:", shipError);
            toast.error(t("pathao.orderCreatedStatusFailed"));
          }
        }
        
        reset();
        setSelectedOrder(null);
        setSelectedCity("");
        setSelectedZone("");
      }
    } catch (error) {
      const errorMessage = error?.data?.message || t("pathao.createOrderFailed");
      toast.error(errorMessage);
      console.error("Create order error:", error);
    }
  };

  const stores = storesData?.data?.data || [];
  const cities = citiesData?.data?.data || [];
  const zones = zonesData?.data?.data || [];
  const areas = areasData?.data?.data || [];

  // Standardized Design Classes
  const cardClass = "bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 shadow-sm";
  const titleClass = "text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2";
  const selectClassName = "flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950/50 px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/20 focus-visible:border-violet-500 transition-all duration-200";
  const selectWrapperClass = "relative group";
  const selectIconClass = "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none transition-transform duration-200 group-focus-within:rotate-180";

  return (
    <div className="max-w-[1600px] mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order Selection Card */}
          <div className={cardClass}>
            <h3 className={titleClass}>
              <FileText className="w-5 h-5 text-violet-600" />
              {t("pathao.selectProcessingOrder")}
            </h3>
            
            <div className="p-4 bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800 rounded-xl mb-4">
               <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                 Quick fill your form by selecting an existing processing order
               </p>
               
               {isLoadingOrders ? (
                <div className="flex items-center gap-3 text-sm text-violet-600 dark:text-violet-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="font-medium">{t("pathao.loadingProcessingOrders")}</span>
                </div>
              ) : orderOptions.length === 0 ? (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{t("pathao.noProcessingOrders")}</span>
                </div>
              ) : (
                <Dropdown
                  name="order"
                  options={orderOptions}
                  setSelectedOption={handleOrderSelect}
                  className="w-full"
                >
                  {selectedOrder?.label || t("pathao.selectOrderPlaceholder")}
                </Dropdown>
              )}
            </div>
          </div>
          
          {/* Store Warning */}
          {stores.length === 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  {t("pathao.noStoresFound")}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Please configure your store settings before creating orders
                </p>
              </div>
            </div>
          )}

          {/* Store & Order Info Section */}
          <div className={cardClass}>
            <h3 className={titleClass}>
              <Store className="w-5 h-5 text-violet-600" />
              {t("pathao.storeAndOrderInfo") || "Store & Order Information"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  {t("pathao.selectStore")} <span className="text-red-500">*</span>
                </label>
                <div className={selectWrapperClass}>
                  <select
                    {...register("store_id", { required: t("pathao.storeRequired") })}
                    className={selectClassName}
                  >
                    <option value="">{t("pathao.selectStorePlaceholder")}</option>
                    {stores.map((store) => (
                      <option key={store.store_id} value={store.store_id}>
                        {store.store_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={selectIconClass} />
                </div>
                {errors.store_id && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.store_id.message}
                  </span>
                )}
              </div>

              <TextField
                label={t("pathao.merchantOrderId")}
                name="merchant_order_id"
                register={register}
                registerOptions={{ required: t("pathao.orderIdRequired") }}
                placeholder={t("pathao.merchantOrderPlaceholder")}
                error={errors.merchant_order_id}
              />
            </div>
          </div>

          {/* Recipient Information Section */}
          <div className={cardClass}>
            <h3 className={titleClass}>
              <User className="w-5 h-5 text-violet-600" />
              {t("pathao.recipientInformation")}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField
                label={t("pathao.recipientName")}
                name="recipient_name"
                register={register}
                registerOptions={{ required: t("pathao.recipientNameRequired") }}
                placeholder="John Doe"
                error={errors.recipient_name}
              />

              <TextField
                label={t("pathao.recipientPhone")}
                name="recipient_phone"
                type="tel"
                register={register}
                registerOptions={{
                  required: t("pathao.phoneRequired"),
                  pattern: {
                    value: /^01[0-9]{9}$/,
                    message: t("pathao.invalidPhoneFormat"),
                  },
                }}
                placeholder="01XXXXXXXXX"
                error={errors.recipient_phone}
              />
            </div>
          </div>

          {/* Location Section */}
          <div className={cardClass}>
            <h3 className={titleClass}>
              <MapPin className="w-5 h-5 text-violet-600" />
              {t("pathao.deliveryLocation")}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 mb-3 block">
                    {t("pathao.city")} <span className="text-red-500">*</span>
                  </label>
                  <div className={selectWrapperClass}>
                    <select
                      {...register("recipient_city", { required: t("pathao.cityRequired") })}
                      className={selectClassName}
                    >
                      <option value="">{t("pathao.selectCity")}</option>
                      {cities.map((city) => (
                        <option key={city.city_id} value={city.city_id}>
                          {city.city_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className={selectIconClass} />
                  </div>
                  {errors.recipient_city && (
                    <span className="text-red-500 text-xs font-medium ml-1 mt-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.recipient_city.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    {t("pathao.zone")} <span className="text-red-500">*</span>
                  </label>
                  <div className={selectWrapperClass}>
                    <select
                      {...register("recipient_zone", { required: t("pathao.zoneRequired") })}
                      className={selectClassName}
                      disabled={!selectedCity}
                    >
                      <option value="">{t("pathao.selectZone")}</option>
                      {zones.map((zone) => (
                        <option key={zone.zone_id} value={zone.zone_id}>
                          {zone.zone_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className={selectIconClass} />
                  </div>
                  {errors.recipient_zone && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {errors.recipient_zone.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    {t("pathao.area")} <span className="text-red-500">*</span>
                  </label>
                  <div className={selectWrapperClass}>
                    <select
                      {...register("recipient_area", { required: t("pathao.areaRequired") })}
                      className={selectClassName}
                      disabled={!selectedZone}
                    >
                      <option value="">{t("pathao.selectArea")}</option>
                      {areas.map((area) => (
                        <option key={area.area_id} value={area.area_id}>
                          {area.area_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className={selectIconClass} />
                  </div>
                  {errors.recipient_area && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {errors.recipient_area.message}
                    </span>
                  )}
                </div>
              </div>

              <TextField
                label={t("pathao.recipientAddress")}
                name="recipient_address"
                register={register}
                registerOptions={{ required: t("pathao.addressRequired") }}
                placeholder={t("pathao.addressPlaceholder")}
                multiline
                rows={3}
                error={errors.recipient_address}
              />
          </div>

          {/* Parcel Description Card */}
          <div className={cardClass}>
            <h3 className={titleClass}>
              <Package className="w-5 h-5 text-violet-600" />
              {t("pathao.parcelDetails")}
            </h3>
            
            <div className="space-y-6">
              <TextField
                label={t("pathao.itemDescription")}
                name="item_description"
                register={register}
                placeholder={t("pathao.itemDescriptionPlaceholder")}
                multiline
                rows={2}
                error={errors.item_description}
              />

              <TextField
                label={t("pathao.specialInstructions")}
                name="special_instruction"
                register={register}
                placeholder={t("pathao.specialInstructionsPlaceholder")}
                multiline
                rows={2}
                error={errors.special_instruction}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Shipping & Actions */}
        <div className="lg:col-span-1 space-y-6 sticky top-6">
          <div className={cardClass}>
            <h3 className={titleClass}>
              <Truck className="w-5 h-5 text-violet-600" />
              {t("pathao.shippingOptions")}
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  {t("pathao.deliveryType")} <span className="text-red-500">*</span>
                </label>
                <div className={selectWrapperClass}>
                  <select
                    {...register("delivery_type", { required: t("pathao.deliveryTypeRequired") })}
                    className={selectClassName}
                  >
                    <option value={48}>{t("pathao.normalDelivery")}</option>
                    <option value={12}>{t("pathao.onDemandDelivery")}</option>
                  </select>
                  <ChevronDown className={selectIconClass} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  {t("pathao.itemType")} <span className="text-red-500">*</span>
                </label>
                <div className={selectWrapperClass}>
                  <select
                    {...register("item_type", { required: t("pathao.itemTypeRequired") })}
                    className={selectClassName}
                  >
                    <option value={1}>{t("pathao.document")}</option>
                    <option value={2}>{t("pathao.parcel")}</option>
                  </select>
                  <ChevronDown className={selectIconClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label={t("pathao.itemQuantity")}
                  name="item_quantity"
                  type="number"
                  register={register}
                  registerOptions={{
                    required: t("pathao.quantityRequired"),
                    min: { value: 1, message: t("pathao.minQuantity") },
                  }}
                  placeholder="1"
                  error={errors.item_quantity}
                />

                <TextField
                  label={t("pathao.itemWeight")}
                  name="item_weight"
                  type="number"
                  step="0.1"
                  register={register}
                  registerOptions={{
                    required: t("pathao.weightRequired"),
                    min: { value: 0.1, message: t("pathao.minWeight") },
                  }}
                  placeholder="0.5"
                  error={errors.item_weight}
                />
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
                   <DollarSign className="w-4 h-4 text-green-600" />
                   {t("pathao.amountToCollect")}
                 </label>
                 <TextField
                  name="amount_to_collect"
                  type="number"
                  register={register}
                  registerOptions={{
                    required: t("pathao.amountRequired"),
                    min: { value: 0, message: t("pathao.amountMin") },
                  }}
                  placeholder="1000"
                  error={errors.amount_to_collect}
                  inputClassName="bg-white dark:bg-gray-950/50 border border-green-200 dark:border-green-800 rounded-xl h-12 px-4 text-lg font-bold text-green-700 dark:text-green-400 focus:ring-green-500"
                  className="mt-0"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading || isShipping} 
            className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-violet-500/30 dark:shadow-none transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {(isLoading || isShipping) ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isLoading ? t("pathao.creatingOrder") : t("pathao.updatingStatus")}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                {t("pathao.createPathaoOrder")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;
