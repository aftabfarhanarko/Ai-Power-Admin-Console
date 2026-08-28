import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  useGetStoresQuery,
  useCreateStoreMutation,
  useGetCitiesQuery,
  useGetZonesQuery,
  useGetAreasQuery,
} from "@/features/pathao/pathaoApiSlice";
import toast from "react-hot-toast";
import TextField from "@/components/input/TextField";
import { Button } from "@/components/ui/button";
import { Store, Plus, MapPin, Loader2, ChevronDown, Building2, Phone, User, X } from "lucide-react";

const ManageStores = () => {
  const { t } = useTranslation();
  const { data: storesData, isLoading: isLoadingStores, refetch } = useGetStoresQuery();
  const [createStore, { isLoading: isCreating }] = useCreateStoreMutation();
  const { data: citiesData } = useGetCitiesQuery();
  
  const [showForm, setShowForm] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  
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
      store_name: "",
      store_contact_name: "",
      store_contact_phone: "",
      store_address: "",
      store_city: "",
      store_zone: "",
      store_area: "",
    },
  });

  // Watch city and zone changes
  const watchCity = watch("store_city");
  const watchZone = watch("store_zone");

  React.useEffect(() => {
    if (watchCity) {
      setSelectedCity(watchCity);
      setValue("store_zone", "");
      setValue("store_area", "");
    }
  }, [watchCity, setValue]);

  React.useEffect(() => {
    if (watchZone) {
      setSelectedZone(watchZone);
      setValue("store_area", "");
    }
  }, [watchZone, setValue]);

  const onSubmit = async (data) => {
    try {
      const storeData = {
        store_name: data.store_name,
        store_contact_name: data.store_contact_name,
        store_contact_phone: data.store_contact_phone,
        store_address: data.store_address,
        store_city_id: Number(data.store_city),
        store_zone_id: Number(data.store_zone),
        store_area_id: Number(data.store_area),
      };

      const result = await createStore(storeData).unwrap();
      
      if (result.code === 200 || result.type === "success") {
        toast.success(t("pathao.storeCreatedSuccess"));
        reset();
        setShowForm(false);
        refetch();
      }
    } catch (error) {
      const errorMessage = error?.data?.message || t("pathao.createStoreFailed");
      toast.error(errorMessage);
      console.error("Create store error:", error);
    }
  };

  const stores = storesData?.data?.data || [];
  const cities = citiesData?.data?.data || [];
  const zones = zonesData?.data?.data || [];
  const areas = areasData?.data?.data || [];

  // Standard Styling Constants
  const cardClass = "bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 shadow-sm";
  const titleClass = "text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2";
  const selectClassName = "flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950/50 px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/20 focus-visible:border-violet-500 transition-all duration-200";
  const selectWrapperClass = "relative";
  const selectIconClass = "absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cardClass}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
              <Store className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("pathao.manageStoresTitle")}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t("pathao.manageStoresDesc") || "Manage your Pathao stores and locations"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="h-10 px-6 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm transition-all duration-200 flex items-center gap-2"
          >
            {showForm ? (
              <>
                <X className="h-4 w-4" />
                {t("common.cancel")}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                {t("pathao.addNewStore")}
              </>
            )}
          </button>
        </div>
      </div>

      {showForm && (
        <div className={cardClass}>
          <div className={titleClass}>
            <Building2 className="w-5 h-5 text-violet-500" />
            {t("pathao.createNewStore")}
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Store Information Section */}
            <div>
              <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
                Store Information
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  label={t("pathao.storeName")}
                  name="store_name"
                  register={register}
                  registerOptions={{ required: t("pathao.storeNameRequired") }}
                  placeholder="Main Store"
                  error={errors.store_name}
                  inputClassName="h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-violet-500/20"
                />

                <TextField
                  label={t("pathao.contactName")}
                  name="store_contact_name"
                  register={register}
                  registerOptions={{ required: t("pathao.contactNameRequired") }}
                  placeholder="John Doe"
                  error={errors.store_contact_name}
                  inputClassName="h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-violet-500/20"
                />

                <TextField
                  label={t("pathao.contactPhone")}
                  name="store_contact_phone"
                  type="tel"
                  register={register}
                  registerOptions={{
                    required: t("pathao.contactPhoneRequired"),
                    pattern: {
                      value: /^01[0-9]{9}$/,
                      message: t("pathao.invalidPhoneFormat"),
                    },
                  }}
                  placeholder="01XXXXXXXXX"
                  error={errors.store_contact_phone}
                  inputClassName="h-12 rounded-xl border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-violet-500/20"
                />
              </div>
            </div>

            {/* Location Section */}
            <div>
              <h5 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider mt-2">
                Location Details
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    {t("pathao.city")} <span className="text-red-500">*</span>
                  </label>
                  <div className={selectWrapperClass}>
                    <select
                      {...register("store_city", { required: t("pathao.cityRequired") })}
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
                  {errors.store_city && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {errors.store_city.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    {t("pathao.zone")} <span className="text-red-500">*</span>
                  </label>
                  <div className={selectWrapperClass}>
                    <select
                      {...register("store_zone", { required: t("pathao.zoneRequired") })}
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
                  {errors.store_zone && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {errors.store_zone.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    {t("pathao.area")} <span className="text-red-500">*</span>
                  </label>
                  <div className={selectWrapperClass}>
                    <select
                      {...register("store_area", { required: t("pathao.areaRequired") })}
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
                  {errors.store_area && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {errors.store_area.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <TextField
                  label={t("pathao.storeAddress")}
                  name="store_address"
                  register={register}
                  registerOptions={{ required: t("pathao.storeAddressRequired") }}
                  placeholder={t("pathao.addressPlaceholder")}
                  multiline
                  rows={3}
                  error={errors.store_address}
                  inputClassName="rounded-xl border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-violet-500/20 min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={isCreating} 
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-violet-500/30 dark:shadow-none transition-all duration-300 flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    {t("pathao.createStore")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Stores */}
      <div>
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Store className="w-5 h-5 text-violet-500" />
          {t("pathao.yourStores")}
        </h4>
        
        {isLoadingStores ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-4" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t("pathao.loadingStores")}
            </p>
          </div>
        ) : stores.length === 0 ? (
          <div className="p-16 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-[24px] bg-gray-50/50 dark:bg-gray-900/20">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-full inline-block mb-4 shadow-sm">
              <Store className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-base font-bold text-gray-900 dark:text-white mb-1">
              {t("pathao.noStoresFoundDesc")}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add your first store to start creating delivery orders
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div 
                key={store.store_id} 
                className={`${cardClass} hover:border-violet-500/30 dark:hover:border-violet-500/30 transition-all duration-300 group`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 transition-colors">
                    <Store className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-base font-bold text-gray-900 dark:text-white mb-3 truncate">
                      {store.store_name}
                    </h5>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {store.store_contact_name}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {store.store_contact_phone}
                        </p>
                      </div>
                      
                      <div className="flex items-start gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {store.store_address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStores;
