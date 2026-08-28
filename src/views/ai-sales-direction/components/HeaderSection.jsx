import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

// Premium Header Section
const HeaderSection = ({ t }) => {
  return (
    <div className="max-w-5xl mx-auto mb-12 sm:mb-16 text-center relative z-10">
      {/* Hero glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-[#887CFD]/30 via-[#887CFD]/10 to-transparent blur-[120px] rounded-full pointer-events-none" />

      {/* Animated logo container */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
        className="relative inline-flex items-center justify-center p-5 mb-6 rounded-3xl bg-white dark:bg-[#1a1f26] shadow-2xl shadow-[#887CFD]/20 border-4 border-[#887CFD]/20"
      >
        {/* Inner gradient glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#887CFD]/10 to-transparent" />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-[#887CFD] fill-[#887CFD]/30" />
        </motion.div>

        {/* Orbiting dots */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-[#887CFD]"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.5,
            }}
            style={{
              top: "50%",
              left: "50%",
              transformOrigin: `${30 + i * 10}px 0px`,
            }}
          />
        ))}
      </motion.div>

      {/* Title with gradient */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl sm:text-4xl md:text-5xl  font-black text-gray-900 dark:text-white mb-4 tracking-tight px-4"
      >
        {t("aiSalesDirection.aiSales")}{" "}
        <span className="relative inline-block whitespace-nowrap">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#887CFD] via-[#7c6ff5] to-[#6f63e3]">
            {t("aiSalesDirection.direction")}
          </span>
          {/* Underline accent */}
          <motion.div
            className="absolute -bottom-1.5 sm:-bottom-2 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-[#887CFD] to-[#6f63e3] rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-base sm:text-lg md:text-xl font-medium leading-relaxed px-4"
      >
        {t("aiSalesDirection.subtitle")}
      </motion.p>

      {/* Decorative elements */}
      <div className="absolute -top-8 left-1/4 w-20 h-20 bg-[#16C8C7]/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-8 right-1/4 w-32 h-32 bg-[#887CFD]/20 rounded-full blur-3xl" />
    </div>
  );
};

export default HeaderSection;
