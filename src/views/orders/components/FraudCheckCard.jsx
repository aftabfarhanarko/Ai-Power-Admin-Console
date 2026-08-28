import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Shield, AlertTriangle, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const FraudCheckCard = ({ phone }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkFraud = async () => {
      if (!phone) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://fraudchecker.link/free-fraud-checker-bd/api/search.php?phone=${encodeURIComponent(
            phone
          )}`
        );
        const result = await response.json();

        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError("No data found");
        }
      } catch (err) {
        console.error("Fraud check error:", err);
        setError("Failed to check fraud status");
      } finally {
        setLoading(false);
      }
    };

    checkFraud();
  }, [phone]);

  if (!phone) return null;

  if (loading) {
    return (
      <div className="relative backdrop-blur-2xl bg-white/40 dark:bg-gray-900/40 rounded-3xl shadow-lg border border-white/50 dark:border-white/20 p-6 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="relative backdrop-blur-2xl bg-white/40 dark:bg-gray-900/40 rounded-3xl shadow-lg border border-white/50 dark:border-white/20 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-500/10 rounded-lg">
            <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("fraud.title") || "Fraud Check"}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
           <AlertCircle className="h-4 w-4" />
           {error || t("fraud.noDataFound") || "No fraud data found"}
        </div>
      </div>
    );
  }

  // Determine risk level/color
  const getRiskInfo = () => {
    const delivered = parseInt(data.totalDelivered) || 0;
    const cancelled = parseInt(data.totalCancelled) || 0;
    const total = parseInt(data.totalOrders) || 0;
    
    // Simple heuristic if not provided by API
    const successRate = total > 0 ? (delivered / total) * 100 : 0;
    
    if (cancelled > delivered && total > 2) {
      return {
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-200 dark:border-red-800",
        icon: AlertTriangle,
        label: "High Risk",
      };
    } else if (successRate > 80) {
      return {
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-200 dark:border-green-800",
        icon: CheckCircle,
        label: "Low Risk",
      };
    } else {
      return {
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-200 dark:border-amber-800",
        icon: Shield,
        label: "Moderate Risk",
      };
    }
  };

  const risk = getRiskInfo();
  const RiskIcon = risk.icon;

  return (
    <div className="relative backdrop-blur-2xl bg-white/40 dark:bg-gray-900/40 rounded-3xl shadow-lg border border-white/50 dark:border-white/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${risk.bg}`}>
            <RiskIcon className={`h-5 w-5 ${risk.color}`} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("fraud.title") || "Fraud Check"}
          </h2>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${risk.bg} ${risk.color} ${risk.border}`}>
          {risk.label}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/5">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t("fraud.totalOrders") || "Total Orders"}
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {data.totalOrders}
          </p>
        </div>
        
        <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/5">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t("fraud.delivered") || "Delivered"}
          </p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
            {data.totalDelivered}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/5">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t("fraud.cancelled") || "Cancelled"}
          </p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
            {data.totalCancelled}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/5">
           <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Success Rate
          </p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
             {data.totalOrders > 0 
                ? Math.round((parseInt(data.totalDelivered) / parseInt(data.totalOrders)) * 100) + "%" 
                : "0%"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FraudCheckCard;
