import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Star,
  Award,
  ArrowRight,
} from "lucide-react";
import { priorityConfig } from "./constants";

// Premium Timeline Item
const TimelineItem = ({
  direction,
  index,
  total,
  displayTitle,
  displayAction,
  t,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const priority = (direction?.priority || "medium").toLowerCase();
  const config = priorityConfig[priority] || priorityConfig.medium;
  const Icon = config.icon;
  const isLast = index === total - 1;

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        type: "spring",
        stiffness: 100,
      }}
      className="relative pl-8 sm:pl-16 py-3 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced Connector Line with Gradient */}
      {!isLast && (
        <div className="absolute left-[15px] sm:left-[31px] top-12 bottom-0 w-[2px] overflow-hidden">
          <motion.div
            className={`h-full w-full bg-gradient-to-b ${config.gradient}`}
            initial={{ scaleY: 0, opacity: 0.3 }}
            animate={{ scaleY: 1, opacity: 0.5 }}
            transition={{ duration: 0.8, delay: index * 0.15 + 0.3 }}
            style={{ transformOrigin: "top" }}
          />
        </div>
      )}

      {/* Premium Node with Glow Effect */}
      <div className="absolute left-0 sm:left-4 top-4 z-10">
        <motion.div
          className={`relative w-8 h-8 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-xl ${config.glow}`}
          whileHover={{ scale: 1.2, rotate: 180 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {/* Inner glow ring */}
          <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />

          {/* Number badge */}
          <motion.div
            className="relative z-10 w-6 h-6 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-lg"
            animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <span className="text-xs sm:text-sm font-black bg-gradient-to-br from-[#887CFD] to-[#6f63e3] bg-clip-text text-transparent">
              {index + 1}
            </span>
          </motion.div>

          {/* Outer ripple effect */}
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.gradient}`}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>

      {/* Premium Card */}
      <motion.div
        whileHover={{ scale: 1.02, x: 8 }}
        transition={{ type: "spring", stiffness: 300 }}
        className={`relative overflow-hidden rounded-3xl bg-white dark:bg-[#1e2530] border-2 ${config.border} p-6 sm:p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 group/card`}
      >
        {/* Animated gradient background */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover/card:opacity-5 transition-opacity duration-700`}
          animate={isHovered ? { rotate: 360 } : {}}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Glass morphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent dark:from-white/5 dark:via-white/0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 backdrop-blur-sm" />

        {/* Accent top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 overflow-hidden">
          <motion.div
            className={`h-full w-full bg-gradient-to-r ${config.gradient}`}
            initial={{ x: "-100%" }}
            animate={{ x: isHovered ? "0%" : "-100%" }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#887CFD]/10 to-transparent rounded-bl-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10 flex flex-col sm:flex-row gap-5 items-start">
          {/* Premium Icon Box with 3D effect */}
          <motion.div
            className={`relative p-4 rounded-2xl ${config.bg} backdrop-blur-lg shrink-0 shadow-lg group-hover/card:shadow-xl transition-shadow border border-white/20 dark:border-white/5`}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
            <Icon
              className="w-7 h-7 relative z-10"
              style={{ color: config.color }}
            />
            {/* Icon glow effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover/card:opacity-50 transition-opacity"
              style={{ backgroundColor: config.color }}
            />
          </motion.div>

          <div className="flex-1 space-y-3">
            {/* Header with badge */}
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="space-y-2 flex-1">
                <motion.h3
                  className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white group-hover/card:text-transparent group-hover/card:bg-clip-text group-hover/card:bg-gradient-to-r from-[#887CFD] to-[#6f63e3] transition-all duration-300 leading-tight"
                  layoutId={`title-${index}`}
                >
                  {displayTitle ?? direction?.title ?? t("aiSalesDirection.recommendation")}
                </motion.h3>

                {/* Subtitle indicator */}
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500">
                  <Zap className="w-3 h-3" />
                  <span className="uppercase tracking-wider">
                    {t("aiSalesDirection.actionRequired")}
                  </span>
                </div>
              </div>

              {/* Premium Priority Badge */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`relative px-4 py-2 rounded-xl text-xs font-black border-2 ${config.bg} ${config.border} backdrop-blur-sm shadow-lg overflow-hidden`}
                style={{ color: config.color }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-10`}
                />
                <span className="relative z-10 flex items-center gap-1.5">
                  <Star className="w-3 h-3 fill-current" />
                  {t("aiSalesDirection." + (config.badgeKey || "mediumPriority"))}
                </span>
              </motion.div>
            </div>

            {/* Description with enhanced typography */}
            <motion.p
              className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.15 + 0.2 }}
            >
              {displayAction ?? direction?.action ?? "—"}
            </motion.p>

            {/* Action Footer with hover effect */}
            <motion.div
              className={`pt-3 flex items-center justify-between text-sm font-bold cursor-pointer group/action`}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 group-hover/action:text-[#887CFD] transition-colors">
                <Award className="w-4 h-4" />
                <span>{t("aiSalesDirection.viewFullStrategy")}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover/action:translate-x-2" />
              </div>

              {/* Progress indicator */}
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 group-hover/action:bg-[#887CFD]"
                    animate={isHovered ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom shine effect */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#887CFD]/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
      </motion.div>
    </motion.div>
  );
};

export default TimelineItem;
