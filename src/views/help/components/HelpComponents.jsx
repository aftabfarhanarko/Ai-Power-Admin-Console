import React from "react";
import { 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  ChevronsUp,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }) {
  const styles = {
    open: "text-emerald-700 bg-emerald-50 border-emerald-200 ring-1 ring-emerald-600/20 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400",
    pending:
      "text-violet-700 bg-violet-50 border-violet-200 ring-1 ring-violet-600/20 dark:bg-violet-900/30 dark:border-violet-800 dark:text-violet-400",
    in_progress:
      "text-blue-700 bg-blue-50 border-blue-200 ring-1 ring-blue-600/20 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400",
    resolved:
      "text-emerald-700 bg-emerald-50 border-emerald-200 ring-1 ring-emerald-600/20 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400",
    closed:
      "text-blue-700 bg-blue-50 border-blue-200 ring-1 ring-blue-600/20 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400",
    "on hold":
      "text-orange-700 bg-orange-50 border-orange-200 ring-1 ring-orange-600/20 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400",
  };
  const style = styles[status?.toLowerCase()] || styles.open;

  return (
    <span
      className={cn(
        "px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize shadow-sm tracking-wide",
        style
      )}
    >
      {status}
    </span>
  );
}

export function PriorityIcon({ priority }) {
  const p = priority?.toLowerCase();
  
  if (p === "highest") {
    return (
      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
        <ChevronsUp className="w-4 h-4" />
      </div>
    );
  }
  
  if (p === "high") {
    return (
      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
        <ArrowUp className="w-4 h-4" />
      </div>
    );
  }
  
  if (p === "medium") {
    return (
      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
        <Minus className="w-4 h-4" />
      </div>
    );
  }
  
  // low
  return (
    <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
      <ArrowDown className="w-4 h-4" />
    </div>
  );
}
