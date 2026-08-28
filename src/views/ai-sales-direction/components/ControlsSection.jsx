import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

// Premium Controls
const ControlsSection = ({ generatedAt, langMode, handleTranslate, isTranslating, hasDirections, t }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-6 mb-10 bg-white/80 dark:bg-[#1a1f26]/80 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border-2 border-gray-100 dark:border-gray-800 shadow-2xl max-w-3xl mx-auto relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#887CFD]/5 via-transparent to-[#16C8C7]/5 pointer-events-none" />

      {/* Status indicator */}
      <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto justify-center sm:justify-start">
        <div className="relative">
          <div className="w-3 h-3 rounded-full bg-[#16C8C7] animate-pulse" />
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-[#16C8C7] animate-ping" />
        </div>
        <div>
          <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
            {generatedAt ? (
              <>
                {t("aiSalesDirection.updated")}{" "}
                {new Date(generatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </>
            ) : (
              t("aiSalesDirection.liveAnalysis")
            )}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("aiSalesDirection.realTimeInsights")}
          </p>
        </div>
      </div>

      {/* Language buttons */}
      <div className="flex flex-wrap justify-center gap-3 relative z-10 w-full sm:w-auto">
        {[
          { code: "bn", labelKey: "bangla", icon: "🇧🇩" },
          { code: "bn-Latn", labelKey: "minglish", icon: "🔤" },
          { code: "en", labelKey: "english", icon: "🇬🇧" },
        ].map(({ code, labelKey, icon }) => (
          <motion.button
            key={code}
            onClick={() => handleTranslate(code)}
            disabled={isTranslating || langMode === code || !hasDirections}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative px-4 sm:px-5 py-2 sm:py-3 rounded-2xl transition-all flex items-center gap-2 text-xs sm:text-sm font-black overflow-hidden flex-1 sm:flex-none justify-center ${
              langMode === code
                ? "bg-gradient-to-r from-[#887CFD] to-[#6f63e3] text-white shadow-xl shadow-[#887CFD]/40 border-2 border-[#887CFD]"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-transparent"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {langMode === code && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            <span className="text-base sm:text-lg">{icon}</span>
            <span className="relative z-10 whitespace-nowrap">{t("aiSalesDirection." + labelKey)}</span>
            {langMode === code && (
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 relative z-10" />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default ControlsSection;
