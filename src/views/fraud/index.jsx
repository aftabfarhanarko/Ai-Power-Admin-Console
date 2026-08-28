import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { 
  Search, 
  Shield, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  Smartphone, 
  Truck, 
  Package, 
  XCircle, 
  Activity 
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const FraudPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fraudData, setFraudData] = useState(null);
  const [error, setError] = useState(null);

  const getOperatorName = (phone) => {
    if (!phone || phone.length < 3) return t("fraud.operatorUnknown");
    const prefix = phone.substring(0, 3);
    if (["017", "013"].includes(prefix)) return t("fraud.operatorGp");
    if (["019", "014"].includes(prefix)) return t("fraud.operatorBl");
    if (["018", "016"].includes(prefix)) return t("fraud.operatorRobiAirtel");
    if (["015"].includes(prefix)) return t("fraud.operatorTeletalk");
    return t("fraud.operatorUnknown");
  };

  const getFormattedNumber = (phone) => {
    if (!phone) return "";
    return phone.replace(/(\d{4})(\d{6})/, "$1-$2"); // Example formatting
  };

  const runCheck = async (overridePhone) => {
    const phone = (overridePhone ?? phoneNumber)?.trim();
    if (!phone) {
      toast.error(t("fraud.enterPhoneRequired"));
      return;
    }

    setIsLoading(true);
    setError(null);
    setFraudData(null);

    try {
      const response = await fetch(
        `https://fraudchecker.link/free-fraud-checker-bd/api/search.php?phone=${encodeURIComponent(phone)}`
      );
      const result = await response.json();

      if (result.success && result.data) {
        setFraudData(result.data);
        toast.success(t("fraud.checkCompleted"));
      } else {
        setError(t("fraud.noDataFound"));
        toast.error(t("fraud.noDataFound"));
      }
    } catch (error) {
      console.error("Fraud check error:", error);
      setError(t("fraud.checkFailed"));
      toast.error(t("fraud.checkFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const phoneFromQuery = searchParams.get("phone");
    if (phoneFromQuery) {
      setPhoneNumber(phoneFromQuery);
      runCheck(phoneFromQuery);
    }
  }, []);

  const getRiskColor = (rate) => {
    const r = parseFloat(rate);
    if (r >= 90) return "text-green-600 dark:text-green-400";
    if (r >= 70) return "text-blue-600 dark:text-blue-400";
    if (r >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {t("fraud.title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            {t("fraud.subtitle")}
          </p>
        </motion.div>

        {/* Search Input Card */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-[#1a1f26] rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8"
        >
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
              {t("fraud.phoneNumber")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Smartphone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t("fraud.phonePlaceholder")}
                className="w-full pl-11 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-lg"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && runCheck()}
              />
            </div>
            <button
              onClick={() => runCheck()}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t("fraud.checking")}
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  {t("fraud.runCheck")}
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl p-4 flex items-center gap-3 text-red-600 dark:text-red-400"
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {/* Results Section */}
        <AnimatePresence>
          {fraudData && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-6"
            >
              {/* Phone Info */}
              <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Smartphone className="w-5 h-5 text-violet-500" />
                  <h3 className="font-semibold text-lg">{t("fraud.phoneInfo")}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center">
                    <p className="text-violet-600 dark:text-violet-400 font-bold text-lg mb-1">{fraudData.phoneNumber}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("fraud.formatted")}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl text-center">
                    <p className="text-green-600 dark:text-green-400 font-bold text-lg mb-1">
                      {getOperatorName(fraudData.phoneNumber)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("fraud.operator")}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center">
                    <p className="text-gray-700 dark:text-gray-300 font-bold text-lg mb-1">
                      +88{fraudData.phoneNumber}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("fraud.format")}</p>
                  </div>
                </div>
              </div>

              {/* Risk Evaluation */}
              <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    <h3 className="font-semibold text-lg">{t("fraud.riskAssessment")}</h3>
                  </div>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full uppercase">
                    {t("fraud.newCustomer")}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 border border-gray-100 dark:border-gray-800 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{fraudData.totalOrders}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t("fraud.totalOrders")}</p>
                  </div>
                  <div className="text-center p-4 border border-gray-100 dark:border-gray-800 rounded-xl">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{fraudData.totalDelivered}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t("fraud.delivered")}</p>
                  </div>
                  <div className="text-center p-4 border border-gray-100 dark:border-gray-800 rounded-xl">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">{fraudData.totalCancelled}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t("fraud.cancelled")}</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("fraud.overallSuccessRate")}</span>
                    <span className={`text-lg font-bold ${getRiskColor(fraudData.deliveryRate)}`}>{fraudData.deliveryRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-violet-500 to-purple-600 h-2.5 rounded-full transition-all duration-1000"
                      style={{ width: `${fraudData.deliveryRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Courier Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pathao */}
                <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                  <div className="flex items-center gap-3 mb-6 relative">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {t("fraud.courierPathao")}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t("fraud.courierService")}</p>
                    </div>
                  </div>
                  
                  {fraudData.couriers?.find(c => c.name.toLowerCase().includes('pathao')) ? (
                    <div className="space-y-3">
                       {/* Assuming we map the data here, but simplified for the specific design */}
                       {/* Since API returns generic couriers array, we filter. If not found, show API Error */}
                       {(() => {
                         const c = fraudData.couriers.find(c => c.name.toLowerCase().includes('pathao'));
                         return (
                           <>
                             <div className="flex justify-between text-sm">
                               <span className="text-gray-500 dark:text-gray-400">{t("fraud.totalOrders")}</span>
                               <span className="font-semibold">{c.orders}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                               <span className="text-gray-500 dark:text-gray-400">{t("fraud.success")}</span>
                               <span className="font-semibold text-green-600">{c.delivered}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                               <span className="text-gray-500 dark:text-gray-400">{t("fraud.failed")}</span>
                               <span className="font-semibold text-red-600">{c.cancelled}</span>
                             </div>
                             <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                               <span className="text-sm font-medium">{t("fraud.deliveryRate")}</span>
                               <span className="font-bold text-lg">{c.delivery_rate}</span>
                             </div>
                           </>
                         );
                       })()}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      </div>
                      <p className="text-sm font-bold text-red-500">{t("fraud.apiConnectionFailed")}</p>
                      <p className="text-xs text-gray-400 mt-1">{t("fraud.noDataFromApi")}</p>
                    </div>
                  )}
                </div>

                {/* Steadfast */}
                <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                  <div className="flex items-center gap-3 mb-6 relative">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {t("fraud.courierSteadfast")}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t("fraud.courierService")}</p>
                    </div>
                  </div>

                  {fraudData.couriers?.find(c => c.name.toLowerCase().includes('steadfast')) ? (
                    <div className="space-y-3">
                       {(() => {
                         const c = fraudData.couriers.find(c => c.name.toLowerCase().includes('steadfast'));
                         return (
                           <>
                             <div className="flex justify-between text-sm">
                               <span className="text-gray-500 dark:text-gray-400">{t("fraud.totalOrders")}</span>
                               <span className="font-semibold">{c.orders}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                               <span className="text-gray-500 dark:text-gray-400">{t("fraud.success")}</span>
                               <span className="font-semibold text-green-600">{c.delivered}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                               <span className="text-gray-500 dark:text-gray-400">{t("fraud.failed")}</span>
                               <span className="font-semibold text-red-600">{c.cancelled}</span>
                             </div>
                             <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                               <span className="text-sm font-medium">{t("fraud.deliveryRate")}</span>
                               <span className="font-bold text-lg">{c.delivery_rate}</span>
                             </div>
                           </>
                         );
                       })()}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      </div>
                      <p className="text-sm font-bold text-red-500">{t("fraud.apiConnectionFailed")}</p>
                      <p className="text-xs text-gray-400 mt-1">{t("fraud.noDataFromApi")}</p>
                    </div>
                  )}
                </div>

                {/* RedX */}
                <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                  <div className="flex items-center gap-3 mb-6 relative">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {t("fraud.courierRedx")}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t("fraud.courierService")}</p>
                    </div>
                  </div>

                  {fraudData.couriers?.find(c => c.name.toLowerCase().includes('redx')) ? (
                    <div className="space-y-3">
                       {(() => {
                         const c = fraudData.couriers.find(c => c.name.toLowerCase().includes('redx'));
                         return (
                           <>
                             <div className="flex justify-between text-sm">
                               <span className="text-gray-500 dark:text-gray-400">{t("fraud.totalOrders")}</span>
                               <span className="font-semibold">{c.orders}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                               <span className="text-gray-500 dark:text-gray-400">{t("fraud.success")}</span>
                               <span className="font-semibold text-green-600">{c.delivered}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                               <span className="text-gray-500 dark:text-gray-400">{t("fraud.failed")}</span>
                               <span className="font-semibold text-red-600">{c.cancelled}</span>
                             </div>
                             <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                               <span className="text-sm font-medium">{t("fraud.deliveryRate")}</span>
                               <span className="font-bold text-lg">{c.delivery_rate}</span>
                             </div>
                           </>
                         );
                       })()}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      </div>
                      <p className="text-sm font-bold text-red-500">{t("fraud.apiConnectionFailed")}</p>
                      <p className="text-xs text-gray-400 mt-1">{t("fraud.noDataFromApi")}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How to use Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-[#1a1f26] rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Info className="w-5 h-5 text-violet-500" />
            <h3 className="font-bold text-lg">{t("fraud.howToUse")}</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">{t("fraud.step1")}</p>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">{t("fraud.step2")}</p>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">{t("fraud.step3")}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FraudPage;