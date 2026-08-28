import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

/**
 * OrderStatCard Component
 * 
 * A premium stat card with a "Wave" design, featuring an icon, large value,
 * dynamic trend indicator, and a decorative wave graphic.
 * 
 * @param {string} title - Label of the stat
 * @param {string|number} value - Main stat value
 * @param {string} trend - Trend percentage string (e.g. "25.2%")
 * @param {string} trendDir - Direction of trend ('up' | 'down')
 * @param {Component} icon - Lucide icon component
 * @param {string} color - Text color class for icon/trend (e.g. "text-blue-600")
 * @param {string} bg - Background color class for icon/pill (e.g. "bg-blue-50")
 * @param {string} wave - Text color class for wave SVG (e.g. "text-blue-500")
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
    <motion.div variants={item} whileHover={{ y: -5, transition: { duration: 0.2 } }} className="h-full">
      <Card className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[24px] overflow-hidden relative group h-full">
        <CardContent className="p-6 relative z-10 h-full flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-2xl ${bg} ${color} group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-[50%] text-right">
              {title}
            </span>
          </div>

          <div className="space-y-4">
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {value}
            </h3>

            <div className="flex items-center gap-2">
              <span
                className={`
                  inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full
                  ${bg} ${color}
                `}
              >
                {trendDir === "up" ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {trend}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                vs last month
              </span>
            </div>
          </div>
        </CardContent>

        {/* Wave Graphic */}
        <div
          className={`absolute bottom-0 right-0 w-24 h-16 opacity-10 group-hover:opacity-20 transition-opacity duration-300 ${wave}`}
        >
          <svg
            viewBox="0 0 100 60"
            fill="currentColor"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path d="M0 60 C 20 60, 20 20, 50 20 C 80 20, 80 50, 100 50 L 100 60 Z" />
          </svg>
        </div>
      </Card>
    </motion.div>
  );
};

export default OrderStatCard;
