import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLazyTrackOrderUnifiedQuery } from "@/features/order/orderApiSlice";
import toast from "react-hot-toast";
import {
  Search,
  Package,
  Truck,
  ArrowLeft,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Copy,
  HelpCircle,
  Phone,
  Mail,
  Share2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const STATUS_BN = {
  "in transit": "পথ অতিক্রমণ করছে",
  "in-transit": "পথ অতিক্রমণ করছে",
  delivered: "ডেলিভারি সম্পন্ন",
  shipped: "পাঠানো হয়েছে",
  processing: "প্রক্রিয়াধীন",
  pending: "অপেক্ষমাণ",
  paid: "পেইড",
  cancelled: "বাতিল",
  refunded: "রিফান্ড",
  "out for delivery": "ডেলিভারির জন্য বের হয়েছে",
  "out-for-delivery": "ডেলিভারির জন্য বের হয়েছে",
  "not found": "পাওয়া যায়নি",
  error: "ত্রুটি",
};

const OrderTrackPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const trackingIdFromUrl = searchParams.get("trackingId")?.trim();

  const [trackOrderUnified, { data: trackData, isLoading }] =
    useLazyTrackOrderUnifiedQuery();
  const [searchValue, setSearchValue] = useState(trackingIdFromUrl || "");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (trackingIdFromUrl) {
      setSearchValue(trackingIdFromUrl);
      setHasSearched(true);
      trackOrderUnified(trackingIdFromUrl).catch(() => {});
    }
  }, [trackingIdFromUrl, trackOrderUnified]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const id = searchValue.trim();
    if (!id) {
      toast.error(t("orders.trackingIdRequired"));
      return;
    }
    setHasSearched(true);
    try {
      await trackOrderUnified(id).unwrap();
    } catch (error) {
      const msg = error?.data?.message || t("orders.orderNotFound");
      toast.error(msg);
    }
  };

  const order = trackData;
  const isFound = order && order.courier !== "Unknown";

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    const map = {
      delivered:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      "in transit":
        "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      shipped:
        "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
      processing:
        "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
      pending:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      cancelled:
        "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
      refunded:
        "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800",
      "not found":
        "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
      error:
        "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
    };
    return (
      map[s] ??
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
    );
  };

  const getCourierColor = (courier) => {
    const c = (courier || "").toLowerCase();
    const map = {
      redx: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
      steadfast:
        "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
      pathao:
        "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
      squadcart:
        "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20",
    };
    return (
      map[c] ??
      "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800"
    );
  };

  const handleCopyTrackingId = () => {
    if (order?.tracking_id) {
      navigator.clipboard.writeText(order.tracking_id);
      toast.success(t("orders.trackingIdCopied"));
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Track Order ${order.tracking_id}`,
          text: `Check my order status: ${order.status}`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      handleCopyTrackingId();
    }
  };

  const getProgressSteps = (currentStatus) => {
    const steps = [
      { id: "pending", label: t("orders.progress.placed") },
      { id: "processing", label: t("orders.progress.processing") },
      { id: "shipped", label: t("orders.progress.shipped") },
      { id: "delivered", label: t("orders.progress.delivered") },
    ];

    // Simple logic to determine current step index
    // In a real app this might be more complex mapping
    const status = (currentStatus || "").toLowerCase();
    let currentIndex = 0;

    if (status.includes("deliver")) currentIndex = 3;
    else if (status.includes("ship") || status.includes("transit"))
      currentIndex = 2;
    else if (status.includes("process")) currentIndex = 1;
    else currentIndex = 0;

    return { steps, currentIndex };
  };

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[32px] border border-white/20 dark:border-slate-800 shadow-2xl shadow-indigo-500/10 overflow-hidden"
      >
        {/* Header Section */}
        <div className="relative p-8 md:p-10 pb-10 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-white dark:from-indigo-900/20 dark:via-slate-900 dark:to-slate-900">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Truck className="w-64 h-64 text-indigo-600 dark:text-indigo-400" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/orders")}
                className="rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-white/50 dark:border-slate-700 transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-slate-200" />
              </Button>

              {hasSearched && isFound && (
                <div className="flex gap-2">
                  <span className="hidden md:flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                    Live Status
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                    className="rounded-full bg-white/50 dark:bg-slate-800/50 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-colors"
                    title="Share Status"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {t("orders.trackOrder")}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md font-medium">
                {t("orders.trackOrderDesc") ||
                  "Real-time updates for your package journey"}
              </p>
            </div>
          </div>
        </div>

        {/* Search Input Section */}
        <div className="p-8 md:p-10">
          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-slate-800 p-2 rounded-[24px] flex flex-row gap-2 border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/20 dark:shadow-none focus-within:ring-4 focus-within:ring-slate-500/10 transition-all duration-300 transform hover:scale-[1.01]">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={
                  t("orders.enterTrackingId") || "Enter tracking number"
                }
                className="flex-1 bg-transparent border-none h-14 px-4 md:px-6 text-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 outline-none font-medium w-full min-w-0"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="h-14 w-14 md:w-auto md:px-8 rounded-[20px] bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-base shadow-xl shadow-slate-200 dark:shadow-none transition-all duration-300 shrink-0"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full animate-spin" />
                    <span className="hidden md:inline">Tracking...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Search className="h-6 w-6 md:h-5 md:w-5" />
                    <span className="hidden md:inline">{t("orders.track")}</span>
                  </span>
                )}
              </Button>
            </div>
          </form>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {hasSearched && isFound && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8 mt-8"
              >
                {/* Status Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Courier Info */}
                  <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg shadow-indigo-500/5 hover:shadow-indigo-500/10 transition-shadow duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                        {t("orders.courier")}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "text-xl font-bold px-4 py-2 rounded-xl inline-block",
                        getCourierColor(order.courier),
                      )}
                    >
                      {order.courier}
                    </div>
                  </div>

                  {/* Tracking ID */}
                  <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg shadow-indigo-500/5 hover:shadow-indigo-500/10 transition-shadow duration-300 group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                        <Package className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                        {t("orders.trackingId")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xl font-bold text-slate-900 dark:text-white tracking-wide font-mono">
                        {order.tracking_id || "-"}
                      </div>
                      <button
                        onClick={handleCopyTrackingId}
                        className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        title="Copy Tracking ID"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Current Status */}
                  <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg shadow-indigo-500/5 hover:shadow-indigo-500/10 transition-shadow duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                        {t("common.status")}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "text-lg font-bold px-3 py-1.5 rounded-lg border inline-flex items-center gap-2",
                        getStatusColor(order.status),
                      )}
                    >
                      {i18n.language === "bn" && order.status
                        ? (STATUS_BN[order.status?.toLowerCase()] ??
                          order.status)
                        : order.status}
                    </div>
                  </div>

                  {/* Estimated Delivery - NEW */}
                  <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg shadow-indigo-500/5 hover:shadow-indigo-500/10 transition-shadow duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">
                        {t("orders.estimatedDelivery")}
                      </span>
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                      {new Date(Date.now() + 86400000 * 3).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" },
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="px-4 py-8">
                  <div className="relative flex items-center justify-between w-full">
                    <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 -z-10 rounded-full" />
                    <div
                      className="absolute left-0 top-1/2 h-1 bg-indigo-500 dark:bg-indigo-400 -z-10 rounded-full transition-all duration-1000"
                      style={{
                        width: `${(getProgressSteps(order.status).currentIndex / 3) * 100}%`,
                      }}
                    />

                    {getProgressSteps(order.status).steps.map((step, idx) => {
                      const { currentIndex } = getProgressSteps(order.status);
                      const isCompleted = idx <= currentIndex;
                      const isCurrent = idx === currentIndex;

                      return (
                        <div
                          key={step.id}
                          className="flex flex-col items-center gap-2"
                        >
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all duration-300 bg-white dark:bg-slate-900",
                              isCompleted
                                ? "border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400"
                                : "border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600",
                              isCurrent &&
                                "scale-110 shadow-lg shadow-indigo-500/20",
                            )}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 fill-indigo-500 text-white dark:fill-indigo-400 dark:text-slate-900" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                            )}
                          </div>
                          <span
                            className={cn(
                              "text-xs font-semibold transition-colors duration-300",
                              isCompleted
                                ? "text-slate-900 dark:text-white"
                                : "text-slate-400 dark:text-slate-600",
                            )}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Timeline */}
                {order.tracking?.length > 0 && (
                  <div className="rounded-[32px] bg-indigo-50/50 dark:bg-slate-800/50 p-8 border border-indigo-100 dark:border-slate-800 backdrop-blur-sm">
                    <h4 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-900 dark:text-white">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400">
                        <Clock className="h-6 w-6" />
                      </div>
                      {t("orders.trackingHistory")}
                    </h4>
                    <div className="relative pl-4 space-y-8 before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-200/50 dark:before:bg-slate-700">
                      {order.tracking.map((d, i) => (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={i}
                          className="relative pl-10 group"
                        >
                          {/* Timeline Dot */}
                          <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-4 border-indigo-500 dark:border-indigo-400 shadow-sm z-10 group-first:scale-110 group-first:shadow-indigo-500/30 transition-all duration-300" />

                          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-indigo-50 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group-hover:border-indigo-200 dark:group-hover:border-indigo-900/50">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
                              <div className="font-semibold text-lg text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                                {d.messageEn || d.messageBn || d.status}
                              </div>
                              {d.time && (
                                <div className="text-sm font-medium text-indigo-500 dark:text-indigo-400 flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full">
                                  <Clock className="w-3.5 h-3.5" />
                                  {new Date(d.time).toLocaleString(
                                    i18n.language === "bn"
                                      ? "bn-BD"
                                      : undefined,
                                    {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </div>
                              )}
                            </div>

                            {d.previousStatus && (
                              <div className="text-sm text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
                                  {d.previousStatus}
                                </span>
                                <ArrowLeft className="w-3 h-3 rotate-180 text-indigo-300" />
                                <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium border border-indigo-100 dark:border-indigo-800">
                                  {d.status}
                                </span>
                              </div>
                            )}

                            {d.reason && (
                              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl inline-block border border-amber-100 dark:border-amber-800/30">
                                {d.reason}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Need Help Section */}
                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-[24px] bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <HelpCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                          Have an issue with your order?
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Our support team is here to help you 24/7
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="rounded-xl border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {t("orders.support.email")}
                      </Button>
                    <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Phone className="w-4 h-4 mr-2" />
                        {t("orders.support.call")}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {hasSearched && !isFound && !isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-slate-50/50 dark:bg-slate-800/20"
              >
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {t("orders.orderNotFound")}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {order?.tracking?.[0]?.messageEn ||
                    order?.tracking?.[0]?.messageBn ||
                    "We couldn't find any order with that tracking number. Please check the number and try again."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderTrackPage;
