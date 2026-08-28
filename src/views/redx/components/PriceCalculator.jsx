import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  useLazyCalculateChargeQuery,
  useGetAreasQuery,
} from "@/features/redx/redxApiSlice";
import toast from "react-hot-toast";
import { Calculator, DollarSign, ChevronDown, Weight, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const PriceCalculator = () => {
  const { t } = useTranslation();
  const [calculateCharge, { isLoading }] = useLazyCalculateChargeQuery();
  const { data: areasData } = useGetAreasQuery();

  const [chargeData, setChargeData] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      delivery_area_id: "",
      pickup_area_id: "",
      cash_collection_amount: 1000,
      weight: 500,
    },
  });

  const areas = areasData?.areas || [];

  // Standardized Design Classes
  const cardClass = "bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-700";
  const titleClass = "text-lg font-bold text-gray-900 dark:text-white";
  const labelClass = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider";
  const inputClass = "flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950/50 px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all duration-200 placeholder:text-gray-400";
  const selectClassName = "flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950/50 px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all duration-200 appearance-none";
  const selectWrapperClass = "relative group";
  const selectIconClass = "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none transition-transform duration-200 group-focus-within:rotate-180";
  const errorClass = "text-red-500 text-xs mt-1 font-medium";

  const onSubmit = async (data) => {
    try {
      const result = await calculateCharge({
        deliveryAreaId: Number(data.delivery_area_id),
        pickupAreaId: Number(data.pickup_area_id),
        cashCollectionAmount: Number(data.cash_collection_amount),
        weight: Number(data.weight),
      }).unwrap();

      setChargeData(result);
      toast.success(t("redx.priceCalculatedSuccess"));
    } catch (error) {
      const errorMessage =
        error?.data?.message || t("redx.priceCalculateFailed");
      toast.error(errorMessage);
      console.error("Price calculation error:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className={titleClass}>{t("redx.deliveryPriceCalculator")}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("redx.priceCalculatorDesc")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator Form */}
        <div className={`lg:col-span-2 ${cardClass}`}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>{t("redx.pickupArea")}</label>
                <div className={selectWrapperClass}>
                  <select
                    {...register("pickup_area_id", { required: t("redx.pickupAreaRequired") })}
                    className={selectClassName}
                  >
                    <option value="">{t("redx.selectArea")}</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name} ({area.division_name})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={selectIconClass} />
                </div>
                {errors.pickup_area_id && <p className={errorClass}>{errors.pickup_area_id.message}</p>}
              </div>

              <div>
                <label className={labelClass}>{t("redx.deliveryArea")}</label>
                <div className={selectWrapperClass}>
                  <select
                    {...register("delivery_area_id", { required: t("redx.deliveryAreaRequired") })}
                    className={selectClassName}
                  >
                    <option value="">{t("redx.selectArea")}</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name} ({area.division_name})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={selectIconClass} />
                </div>
                {errors.delivery_area_id && <p className={errorClass}>{errors.delivery_area_id.message}</p>}
              </div>

              <div>
                <label className={labelClass}>{t("redx.cashCollectionAmount")}</label>
                <div className="relative">
                  <input
                    type="number"
                    {...register("cash_collection_amount", {
                      required: t("redx.amountRequired"),
                      min: { value: 0, message: t("redx.amountMin") },
                    })}
                    className={`${inputClass} pl-11`}
                    placeholder="1000"
                  />
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.cash_collection_amount && <p className={errorClass}>{errors.cash_collection_amount.message}</p>}
              </div>

              <div>
                <label className={labelClass}>{t("redx.weightGrams")}</label>
                <div className="relative">
                  <input
                    type="number"
                    {...register("weight", {
                      required: t("redx.weightRequired"),
                      min: { value: 1, message: t("redx.minWeight") },
                    })}
                    className={`${inputClass} pl-11`}
                    placeholder="500"
                  />
                  <Weight className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.weight && <p className={errorClass}>{errors.weight.message}</p>}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                isLoading={isLoading}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white w-full md:w-auto"
              >
                <Calculator className="h-4 w-4 mr-2" />
                {t("redx.calculatePrice")}
              </Button>
            </div>
          </form>
        </div>

        {/* Result Card */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {chargeData ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[24px] p-6 text-white shadow-xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{t("redx.estimatedCost")}</h4>
                    <p className="text-xs text-white/80">
                      {t("redx.basedOnInputs")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <p className="text-sm text-white/70 mb-1">
                      {t("redx.deliveryCharge")}
                    </p>
                    <p className="text-3xl font-bold">
                      ৳{chargeData.deliveryCharge ?? chargeData.delivery_charge ?? "0"}
                    </p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <p className="text-sm text-white/70 mb-1">
                      {t("redx.codCharge")}
                    </p>
                    <p className="text-3xl font-bold">
                      ৳{chargeData.codCharge ?? chargeData.cod_charge ?? "0"}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/20">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-white/90">{t("redx.total")}</p>
                      <p className="text-xl font-bold">
                        ৳{(Number(chargeData.deliveryCharge ?? chargeData.delivery_charge ?? 0) + Number(chargeData.codCharge ?? chargeData.cod_charge ?? 0))}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[300px] bg-gray-50 dark:bg-gray-800/50 rounded-[24px] border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center p-6"
              >
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm mb-4">
                  <Calculator className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {t("redx.calculateYourCost")}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px]">
                  {t("redx.fillFormToSeePrice")}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PriceCalculator;
