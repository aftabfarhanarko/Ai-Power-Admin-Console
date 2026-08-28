import { motion } from "framer-motion";
import { AlertCircle, Sparkles } from "lucide-react";

// Status Section (Loading/Error/Empty states)
const StatusSection = ({ isLoading, isError, hasDirections, t }) => {
  if (isLoading) {
    return (
      <div className="space-y-10 animate-pulse max-w-3xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-8 rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 w-3/4" />
              <div className="h-32 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 rounded-3xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10 border-2 border-red-100 dark:border-red-900/30 max-w-3xl mx-auto relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMzksMzIsNjAsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="relative z-10">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-black text-red-700 dark:text-red-400 mb-2">
            {t("aiSalesDirection.loadFailed")}
          </h3>
          <p className="text-red-600/80 dark:text-red-400/80 text-lg">
            {t("aiSalesDirection.loadFailedDesc")}
          </p>
        </div>
      </motion.div>
    );
  }

  if (!hasDirections) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20 max-w-3xl mx-auto"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
          <Sparkles className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-2xl font-black text-gray-700 dark:text-gray-300 mb-3">
          {t("aiSalesDirection.noInsightsAvailable")}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          {t("aiSalesDirection.noInsightsDesc")}
        </p>
      </motion.div>
    );
  }

  return null;
};

export default StatusSection;
