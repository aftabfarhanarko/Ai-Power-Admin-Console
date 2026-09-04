import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

/**
 * OrderStatCard Component - Premium Glassmorphism Stat Card
 */
const OrderStatCard = ({ 
  title, 
  value, 
  trend, 
  trendDir, 
  icon: Icon, 
  color, 
  bg, 
  wave 
}) => {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={item} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="h-full">
      <div className="glass-card glass-card-hover relative overflow-hidden h-full p-5 lg:p-6 flex flex-col justify-between group">
        {/* Subtle glow background */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/5 dark:bg-indigo-400/10 rounded-full blur-xl pointer-events-none" />

        <div>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className={`p-3 rounded-2xl border border-white/20 dark:border-white/10 ${bg} ${color} group-hover:scale-105 transition-transform duration-300 shadow-xs`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
              {title}
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-3">
            {value}
          </h3>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50 dark:border-white/5 text-xs">
          <span
            className={`
              inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full
              ${trendDir === "up" ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" : "text-rose-600 dark:text-rose-400 bg-rose-500/10"}
            `}
          >
            {trendDir === "up" ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {trend}
          </span>
          <span className="text-slate-400 font-medium">
            vs last month
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderStatCard;
