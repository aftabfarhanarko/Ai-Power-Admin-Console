import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  useGetPickupStoresQuery,
  useCreatePickupStoreMutation,
  useGetAreasQuery,
} from "@/features/redx/redxApiSlice";
import toast from "react-hot-toast";
import { Store, Plus, MapPin, ChevronDown, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const ManageStores = () => {
  const { t } = useTranslation();
  const {
    data: storesData,
    isLoading: isLoadingStores,
    refetch,
  } = useGetPickupStoresQuery();
  const [createStore, { isLoading: isCreating }] =
    useCreatePickupStoreMutation();
  const { data: areasData } = useGetAreasQuery();

  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      area_id: "",
    },
  });

  const stores = storesData?.pickup_stores || [];
  const areas = areasData?.areas || [];

  // Standardized Design Classes
  const cardClass =
    "bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-700";
  const titleClass = "text-lg font-bold text-gray-900 dark:text-white";
  const labelClass =
    "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider";
  const inputClass =
    "flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950/50 px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all duration-200 placeholder:text-gray-400";
  const selectClassName =
    "flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950/50 px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all duration-200 appearance-none";
  const selectWrapperClass = "relative group";
  const selectIconClass =
    "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none transition-transform duration-200 group-focus-within:rotate-180";
  const errorClass = "text-red-500 text-xs mt-1 font-medium";

  const onSubmit = async (data) => {
    try {
      const storeData = {
        name: data.name,
        phone: data.phone,
        address: data.address,
        area_id: Number(data.area_id),
      };

      const result = await createStore(storeData).unwrap();

      if (result.id) {
        toast.success(t("redx.storeCreatedSuccess"));
        reset();
        setShowForm(false);
        refetch();
      }
    } catch (error) {
      const errorMessage = error?.data?.message || t("redx.createStoreFailed");
      toast.error(errorMessage);
      console.error("Create store error:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className={titleClass}>{t("redx.manageStoresTitle")}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("redx.manageStoresDesc", "Add and manage your pickup locations")}
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className={`${showForm ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
        >
          {showForm ? (
            <>
              <X className="h-4 w-4 mr-2" />
              {t("common.cancel")}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              {t("redx.addNewStore")}
            </>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, overflow: "hidden" }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={cardClass}>
              <h4 className="text-md font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <Store className="w-4 h-4 text-indigo-600 dark:text-indigo-500" />
                </div>
                {t("redx.createNewStore")}
              </h4>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>{t("redx.storeName")}</label>
                    <input
                      type="text"
                      {...register("name", {
                        required: t("redx.storeNameRequired"),
                      })}
                      className={inputClass}
                      placeholder="e.g. Main Warehouse"
                    />
                    {errors.name && (
                      <p className={errorClass}>{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>{t("redx.storePhone")}</label>
                    <input
                      type="tel"
                      {...register("phone", {
                        required: t("redx.storePhoneRequired"),
                        pattern: {
                          value: /^01[0-9]{9}$/,
                          message: t("redx.invalidPhoneFormat"),
                        },
                      })}
                      className={inputClass}
                      placeholder="01XXXXXXXXX"
                    />
                    {errors.phone && (
                      <p className={errorClass}>{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t("redx.area")}</label>
                  <div className={selectWrapperClass}>
                    <select
                      {...register("area_id", {
                        required: t("redx.areaRequired"),
                      })}
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
                  {errors.area_id && (
                    <p className={errorClass}>{errors.area_id.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>{t("redx.storeAddress")}</label>
                  <textarea
                    {...register("address", {
                      required: t("redx.storeAddressRequired"),
                    })}
                    className={`${inputClass} min-h-[100px] py-3 resize-none`}
                    placeholder={t("redx.addressPlaceholder")}
                  />
                  {errors.address && (
                    <p className={errorClass}>{errors.address.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    isLoading={isCreating}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white w-full md:w-auto"
                  >
                    {t("redx.createStore")}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stores List */}
      <div>
        <h4 className="text-md font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          {t("redx.yourStores")}
          <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 font-medium border border-gray-200 dark:border-gray-700">
            {stores.length}
          </span>
        </h4>

        {isLoadingStores ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>{t("redx.loadingStores")}</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-[24px] border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              {t("redx.noStoresFound", "No stores found")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
              {t("redx.noStoresFoundDesc")}
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("redx.createFirstStore", "Create Your First Store")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={store.id}
                className="group relative bg-white dark:bg-gray-800 rounded-[24px] p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl group-hover:scale-110 transition-transform duration-200">
                    <Store className="h-6 w-6 text-red-600 dark:text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-gray-900 dark:text-white truncate mb-1">
                      {store.name}
                    </h5>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-600">
                        ID: {store.id}
                      </span>
                      {store.area_name && (
                        <span className="truncate">{store.area_name}</span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {store.phone}
                      </p>
                      <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                        <span className="line-clamp-2">{store.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStores;
