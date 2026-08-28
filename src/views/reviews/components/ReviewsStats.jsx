import React from "react";
import { motion } from "framer-motion";

const ReviewsStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`rounded-2xl p-5 border ${stat.bg} ${stat.border} flex flex-col justify-between h-32 relative overflow-hidden group`}
        >
          <div className="flex justify-between items-start z-10">
            <div>
              <p
                className={`text-xs font-bold uppercase tracking-wider opacity-70 ${stat.color}`}
              >
                {stat.label}
              </p>
              <h3 className={`text-3xl font-black mt-2 ${stat.color}`}>
                {stat.value}
              </h3>
            </div>
            <div
              className={`p-2.5 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm ${stat.color}`}
            >
              <stat.icon className="w-5 h-5" />
            </div>
          </div>

          <stat.icon
            className={`absolute -bottom-4 -right-4 w-24 h-24 opacity-10 rotate-12 ${stat.color} transition-transform group-hover:scale-110 duration-500`}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default ReviewsStats;

