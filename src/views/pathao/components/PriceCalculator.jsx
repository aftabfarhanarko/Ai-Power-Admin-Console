import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  useGetPriceCalculationMutation,
  useGetCitiesQuery,
  useGetZonesQuery,
} from "@/features/pathao/pathaoApiSlice";
import toast from "react-hot-toast";
import TextField from "@/components/input/TextField";
import { Calculator, DollarSign, Loader2, MapPin, Scale, Package, Truck, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const PriceCalculator = () => {
  const { t } = useTranslation();
  const [calculatePrice, { isLoading }] = useGetPriceCalculationMutation();
  const { data: citiesData } = useGetCitiesQuery();

  const [selectedCity, setSelectedCity] = useState("");
  const { data: zonesData } = useGetZonesQuery(selectedCity, {
    skip: !selectedCity,
  });
  const [priceData, setPriceData] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      recipient_city: "",
      recipient_zone: "",
      delivery_type: 48,
      item_type: 2,
      item_weight: 0.5,
    },
  });

  const watchCity = watch("recipient_city");
  const watchDeliveryType = watch("delivery_type");
  const watchItemType = watch("item_type");

  useEffect(() => {
    if (watchCity) {
      setSelectedCity(watchCity);
      setValue("recipient_zone", "");
    }
  }, [watchCity, setValue]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        recipient_city: Number(data.recipient_city),
        recipient_zone: Number(data.recipient_zone),
        delivery_type: Number(data.delivery_type),
        item_type: Number(data.item_type),
        item_weight: Number(data.item_weight),
      };

      const result = await calculatePrice(payload).unwrap();

      if (result?.code === 200 || result?.type === "success") {
        setPriceData(result.data?.data);
        toast.success(t("pathao.priceCalculatedSuccess"));
      }
    } catch (error) {
      toast.error(error?.data?.message || t("pathao.priceCalculateFailed"));
    }
  };

  const cities = citiesData?.data?.data || [];
  const zones = zonesData?.data?.data || [];

  const cardClass = "bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 shadow-sm";
  const titleClass = "text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2";

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Calculator Form */}
        <div className="lg:col-span-2">
          <div className={cardClass}>
            <h3 className={titleClass}>
              <Calculator className="w-5 h-5 text-[#8B5CF6]" />
              {t("pathao.deliveryPriceCalculator")}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {t("pathao.priceCalculatorDesc")}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* City Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("pathao.city")}
                  </label>
                  <div className="relative">
                    <select
                      {...register("recipient_city", {
                        required: t("pathao.cityRequired"),
                      })}
                      className="w-full h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                    >
                      <option value="">{t("pathao.selectCity")}</option>
                      {cities.map((city) => (
                        <option key={city.city_id} value={city.city_id}>
                          {city.city_name}
                        </option>
                      ))}
                    </select>
                    <MapPin className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.recipient_city && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.recipient_city.message}
                    </p>
                  )}
                </div>

                {/* Zone Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("pathao.zone")}
                  </label>
                  <div className="relative">
                    <select
                      {...register("recipient_zone", {
                        required: t("pathao.zoneRequired"),
                      })}
                      disabled={!selectedCity}
                      className="w-full h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{t("pathao.selectZone")}</option>
                      {zones.map((zone) => (
                        <option key={zone.zone_id} value={zone.zone_id}>
                          {zone.zone_name}
                        </option>
                      ))}
                    </select>
                    <MapPin className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.recipient_zone && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.recipient_zone.message}
                    </p>
                  )}
                </div>

                {/* Delivery Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Delivery Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setValue("delivery_type", 48)}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2",
                        watchDeliveryType === 48
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <Truck className="w-4 h-4" />
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("delivery_type", 12)}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2",
                        watchDeliveryType === 12
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <Truck className="w-4 h-4" />
                      On Demand
                    </button>
                  </div>
                </div>

                {/* Item Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Item Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setValue("item_type", 2)}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2",
                        watchItemType === 2
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <Package className="w-4 h-4" />
                      Parcel
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("item_type", 1)}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2",
                        watchItemType === 1
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <Info className="w-4 h-4" />
                      Document
                    </button>
                  </div>
                </div>

                {/* Weight */}
                <div className="md:col-span-2">
                  <TextField
                    label="Item Weight (kg)"
                    name="item_weight"
                    type="number"
                    step="0.1"
                    register={register}
                    registerOptions={{
                      required: "Weight is required",
                      min: {
                        value: 0.1,
                        message: "Minimum weight is 0.1kg",
                      },
                    }}
                    placeholder="0.5"
                    error={errors.item_weight}
                    icon={<Scale className="w-4 h-4" />}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-violet-500/30 dark:shadow-none transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[180px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5" />
                      {t("pathao.calculatePrice")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Result */}
        <div className="lg:col-span-1">
          {priceData ? (
            <div className={`${cardClass} sticky top-6`}>
              <h4 className={titleClass}>
                <DollarSign className="w-5 h-5 text-green-500" />
                {t("pathao.estimatedDeliveryCharge")}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {t("pathao.basedOnInputs")}
              </p>

              <div className="space-y-4">
                <div className="p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                  <p className="text-sm text-gray-500 mb-1">
                    {t("pathao.basePrice")}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">৳{priceData.price}</p>
                </div>

                {priceData.additional_charge > 0 && (
                  <div className="p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <p className="text-sm text-gray-500 mb-1">
                      {t("pathao.additionalCharge")}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      ৳{priceData.additional_charge}
                    </p>
                  </div>
                )}

                {priceData.service_type && (
                   <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <span className="font-semibold">{t("pathao.serviceType")}:</span>{" "}
                      {priceData.service_type}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`${cardClass} h-full flex flex-col items-center justify-center text-center p-8 opacity-60`}>
               <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Calculator className="w-8 h-8 text-gray-400" />
               </div>
               <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                 No Calculation Yet
               </h4>
               <p className="text-sm text-gray-500">
                 Fill out the form and click calculate to see the estimated delivery charges here.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceCalculator;
