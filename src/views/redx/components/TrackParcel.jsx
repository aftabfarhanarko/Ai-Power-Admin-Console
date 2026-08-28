import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useLazyTrackParcelQuery,
  useLazyGetParcelInfoQuery,
} from "@/features/redx/redxApiSlice";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Search,
  Package,
  MapPin,
  Clock,
  User,
  CreditCard,
  FileText,
  Truck,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_BN = {
  "in transit": "পথ অতিক্রমণ করছে",
  "in-transit": "পথ অতিক্রমণ করছে",
  delivered: "ডেলিভারি সম্পন্ন",
  "out for delivery": "ডেলিভারির জন্য বের হয়েছে",
  "out-for-delivery": "ডেলিভারির জন্য বের হয়েছে",
  "picked up": "কুরিয়ার দ্বারা সংগ্রহ করা হয়েছে",
  "picked-up": "কুরিয়ার দ্বারা সংগ্রহ করা হয়েছে",
  processing: "প্রক্রিয়াধীন",
  pending: "অপেক্ষমাণ",
};

const TrackParcel = () => {
  const { t, i18n } = useTranslation();
  const [trackParcel, { data: trackData, isLoading: isLoadingTrack }] =
    useLazyTrackParcelQuery();
  const [getParcelInfo, { data: parcelInfoData, isLoading: isLoadingInfo }] =
    useLazyGetParcelInfoQuery();

  const [searchValue, setSearchValue] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const trackingId = (data.tracking_id || "").trim();
    if (!trackingId) {
      toast.error(t("redx.trackingIdRequired"));
      return;
    }
    setSearchValue(trackingId);
    setHasSearched(true);
    try {
      await Promise.all([
        trackParcel(trackingId).unwrap(),
        getParcelInfo(trackingId).unwrap(),
      ]);
    } catch (error) {
      const errorMessage = error?.data?.message || t("redx.trackParcelFailed");
      toast.error(errorMessage);
    }
  };

  const parcel = parcelInfoData?.parcel;
  const trackingUpdates = trackData?.tracking || [];
  const isLoading = isLoadingTrack || isLoadingInfo;

  // Standardized Design Classes
  const cardClass =
    "bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 shadow-sm";
  const titleClass =
    "text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2";
  const inputClass =
    "w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-950/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Section */}
      <div className={cardClass}>
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t("redx.trackParcel", "Track Your Parcel")}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t(
              "redx.trackParcelDesc",
              "Enter your tracking ID to get real-time updates",
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-gray-400" />
            <input
              {...register("tracking_id", {
                required: t("redx.trackingIdRequired"),
              })}
              placeholder={t(
                "redx.enterTrackingId",
                "Enter Tracking ID (e.g. REDX-12345)",
              )}
              className={inputClass}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg px-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t("redx.track", "Track")
              )}
            </Button>
          </div>
          {errors.tracking_id && (
            <p className="text-red-500 text-sm mt-2 ml-1">
              {errors.tracking_id.message}
            </p>
          )}
        </form>
      </div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {parcel ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Parcel Details */}
                <div className={cn(cardClass, "lg:col-span-2")}>
                  <h4 className={titleClass}>
                    <Package className="h-5 w-5 text-indigo-500" />
                    {t("redx.parcelDetails", "Parcel Information")}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t("redx.trackingId", "Tracking ID")}
                      </label>
                      <p className="font-bold text-gray-900 dark:text-white text-lg break-all">
                        {parcel.tracking_id}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t("common.status", "Status")}
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 capitalize">
                          {i18n.language === "bn" && parcel.status
                            ? (STATUS_BN[parcel.status?.toLowerCase()] ??
                              parcel.status)
                            : parcel.status?.replace(/-/g, " ")}
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-gray-100 dark:border-gray-800 rounded-xl">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                            {t("common.name", "Customer Name")}
                          </label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {parcel.customer_name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {parcel.customer_phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                            {t("redx.customerAddress", "Address")}
                          </label>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {parcel.customer_address}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-xl">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">
                          {t("redx.cashCollectionAmount", "Cash Collection")}
                        </label>
                        <p className="font-bold text-green-700 dark:text-green-400 text-lg">
                          ৳{parcel.cash_collection_amount}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-xl">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">
                          {t("redx.merchantInvoiceId", "Invoice ID")}
                        </label>
                        <p className="font-bold text-blue-700 dark:text-blue-400 text-lg">
                          {parcel.merchant_invoice_id || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tracking History */}
                <div className={cardClass}>
                  <h4 className={titleClass}>
                    <Clock className="h-5 w-5 text-orange-500" />
                    {t("redx.trackingHistory", "Tracking History")}
                  </h4>

                  <div className="relative pl-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-8 mt-6">
                    {trackingUpdates.length > 0 ? (
                      trackingUpdates.map((update, index) => (
                        <div key={index} className="relative">
                          <span
                            className={cn(
                              "absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-white dark:ring-[#1a1f26]",
                              index === 0
                                ? "bg-red-500"
                                : "bg-gray-300 dark:bg-gray-600",
                            )}
                          />

                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {i18n.language === "bn"
                                ? update.message_bn ||
                                  update.messageBn ||
                                  update.message_en ||
                                  update.messageEn
                                : update.message_en ||
                                  update.messageEn ||
                                  update.message_bn ||
                                  update.messageBn}
                            </p>
                            {update.time && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(update.time).toLocaleString(
                                  i18n.language === "bn" ? "bn-BD" : undefined,
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        {t(
                          "redx.noTrackingHistory",
                          "No tracking history available",
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              !isLoading && (
                <div className="text-center py-12 bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    {t("redx.parcelNotFound", "Parcel Not Found")}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {t(
                      "redx.checkTrackingId",
                      "Please check the tracking ID and try again",
                    )}
                  </p>
                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrackParcel;
