import React from "react";
import { Info } from "lucide-react";

/**
 * Label + input wrapper with optional error and hint for product form.
 */
export default function ProductFormInput({
  label,
  error,
  required,
  hint,
  children,
  className = "",
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
          <Info className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
