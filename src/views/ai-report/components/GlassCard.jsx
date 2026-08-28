import React from "react";

const GlassCard = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-zinc-900/80 backdrop-blur-2xl border border-gray-100 dark:border-white/10 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-[0_2px_20px_rgb(0,0,0,0.2)] rounded-3xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] ${className}`}
  >
    {children}
  </div>
);

export default GlassCard;
