import React from "react";
import { Inbox } from "lucide-react";

/**
 * Premium Glass Empty State Component
 */
export const GlassEmptyState = ({
  icon: Icon = Inbox,
  title = "No data available",
  description = "There are currently no items matching your criteria.",
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div className={`glass-panel p-10 lg:p-16 rounded-3xl text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto my-8 ${className}`}>
      <div className="p-4 rounded-3xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
        <Icon className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default GlassEmptyState;
