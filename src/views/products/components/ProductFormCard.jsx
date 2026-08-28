import React from "react";

/**
 * Card wrapper for product form sections (e.g. Shipping, Pricing).
 */
export default function ProductFormCard({ children, className = "", hover = true }) {
  return (
    <div
      className={`
        bg-white dark:bg-slate-900 
        rounded-[24px] border border-slate-100 dark:border-slate-800
        shadow-xl shadow-slate-200/50 dark:shadow-none
        overflow-hidden p-6 md:p-8
        transition-all duration-300 ease-out
        ${hover ? "hover:shadow-2xl hover:shadow-slate-200/80 dark:hover:border-indigo-500/30 hover:-translate-y-1" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
