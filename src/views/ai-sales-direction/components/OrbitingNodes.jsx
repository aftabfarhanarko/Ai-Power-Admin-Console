import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import { priorityConfig } from "./constants";

// Orbiting Nodes
const OrbitingNodes = ({ directions, getDisplayDirection, t, radiusOuter, center, getPos }) => {
  const total = directions.length;

  return (
    <>
      {directions.map((dir, index) => {
        const disp = getDisplayDirection(index);
        const title = disp?.title ?? dir?.title ?? t("aiSalesDirection.action");
        const action = disp?.action ?? dir?.action ?? "—";
        const priority = (dir?.priority || "medium").toLowerCase();
        const config = priorityConfig[priority] || priorityConfig.medium;
        const Icon = config.icon;

        const angleStep = 360 / total;
        const nodeAngle = index * angleStep - 90 + angleStep / 2;
        const pos = getPos(nodeAngle, radiusOuter);

        const normAngle = (nodeAngle + 360) % 360;
        const isRight = normAngle > 270 || normAngle < 90;

        let textAlignClass = "text-left";
        let containerClass = "left-28 top-1/2 -translate-y-1/2";

        if (!isRight) {
          textAlignClass = "text-right";
          containerClass = "right-28 top-1/2 -translate-y-1/2";
        }

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: index * 0.25 + 0.5,
              type: "spring",
              stiffness: 150,
            }}
            className="absolute z-30 flex items-center justify-center group/node"
            style={{
              left: pos.x,
              top: pos.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Premium Icon Circle with 3D effect */}
            <motion.div
              whileHover={{ scale: 1.2, rotate: 10 }}
              className="relative w-24 h-24 rounded-full bg-white dark:bg-[#1e2530] border-[5px] border-[#887CFD] flex items-center justify-center shadow-2xl z-20 group-hover/node:shadow-[0_0_40px_rgba(136,124,253,0.5)] transition-all duration-500"
            >
              {/* Gradient overlay */}
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.gradient} opacity-0 group-hover/node:opacity-10 transition-opacity duration-500`}
              />

              {/* Icon */}
              <div className="relative z-10">
                <Icon className="w-10 h-10 text-[#887CFD] group-hover/node:scale-110 transition-transform" />
              </div>

              {/* Animated ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[#887CFD]"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.3,
                }}
              />

              {/* Inner glow */}
              <div className="absolute inset-2 rounded-full bg-[#887CFD]/5 group-hover/node:bg-[#887CFD]/10 transition-colors" />
            </motion.div>

            {/* Premium Text Content */}
            <div
              className={`absolute w-[340px] ${containerClass} ${textAlignClass} pointer-events-none`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${index}-${disp?.title || "orig"}`}
                  initial={{ opacity: 0, x: isRight ? 40 : -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 120 }}
                  className="pointer-events-auto"
                >
                  {/* Phase badge */}
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${config.gradient} text-white text-xs font-black uppercase tracking-widest mb-4 shadow-lg ${isRight ? "" : "ml-auto"}`}
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    {t("aiSalesDirection.phase")}{" "}
                    {["I", "II", "III", "IV", "V", "VI"][index] || index + 1}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 leading-tight drop-shadow-md group-hover/node:text-transparent group-hover/node:bg-clip-text group-hover/node:bg-gradient-to-r from-[#887CFD] to-[#6f63e3] transition-all duration-300">
                    {title}
                  </h3>

                  {/* Description card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`relative p-4 rounded-2xl bg-white/95 dark:bg-[#1a1f26]/95 backdrop-blur-xl border-2 border-gray-100 dark:border-gray-800 shadow-xl group-hover/node:shadow-2xl transition-all duration-500 overflow-hidden mt-3 ${isRight ? "text-left" : "text-right"}`}
                  >
                    {/* Card gradient overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover/node:opacity-5 transition-opacity duration-500`}
                    />

                    {/* Content */}
                    <p className="relative z-10 text-sm font-semibold text-gray-600 dark:text-gray-300 leading-relaxed">
                      {action}
                    </p>

                    {/* Bottom accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#887CFD]/50 to-transparent opacity-0 group-hover/node:opacity-100 transition-opacity duration-500" />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </>
  );
};

export default OrbitingNodes;
