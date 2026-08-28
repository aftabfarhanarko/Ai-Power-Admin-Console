import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

// Premium Central Hub
const CentralHub = ({ t }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: -180 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.5 }}
      className="absolute z-20 flex flex-col items-center justify-center w-64 h-64 rounded-full bg-white dark:bg-[#1a1f26] shadow-[0_0_80px_rgba(136,124,253,0.3)] border-[10px] border-white dark:border-gray-800 overflow-hidden"
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#887CFD]/10 via-transparent to-[#16C8C7]/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
          className="mb-3"
        >
          <Sparkles className="w-10 h-10 mx-auto text-[#887CFD] fill-[#887CFD]/20" />
        </motion.div>

        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
          {t("aiSalesDirection.aiSales")}
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#887CFD] to-[#6f63e3]">
            {t("aiSalesDirection.direction")}
          </span>
        </h2>

        <div className="flex items-center justify-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-400">
          <div className="w-1.5 h-1.5 rounded-full bg-[#16C8C7] animate-pulse" />
          <span>{t("aiSalesDirection.liveInsights")}</span>
        </div>
      </div>

      {/* Inner decorative rings */}
      <div className="absolute inset-4 rounded-full border-2 border-dashed border-[#887CFD]/20 pointer-events-none" />
      <div className="absolute inset-8 rounded-full border border-[#887CFD]/10 pointer-events-none" />
    </motion.div>
  );
};

export default CentralHub;
