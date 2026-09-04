import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

/**
 * Premium Glassmorphism Dashboard Stat & Panel Card
 */
export const GlassCard = ({
  title,
  value,
  subtitle,
  change,
  isPositive,
  icon: Icon,
  iconBg = "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-400/10",
  children,
  className = "",
  badgeText,
}) => {
  return (
    <div className={`glass-card glass-card-hover p-5 lg:p-6 relative overflow-hidden ${className}`}>
      {/* Subtle background ambient glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      {title || value || Icon ? (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            {title && (
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                {title}
              </p>
            )}
            {value !== undefined && (
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {value}
              </h3>
            )}
          </div>

          {Icon && (
            <div className={`p-3 rounded-2xl border border-white/20 dark:border-white/10 shadow-sm shrink-0 ${iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
      ) : null}

      {(change !== undefined || subtitle || badgeText) && (
        <div className="mt-4 flex items-center justify-between gap-2 text-xs">
          {change !== undefined && (
            <div
              className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
                isPositive
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                  : "text-rose-600 dark:text-rose-400 bg-rose-500/10"
              }`}
            >
              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{change}</span>
            </div>
          )}

          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400 truncate font-medium">
              {subtitle}
            </span>
          )}

          {badgeText && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {badgeText}
            </span>
          )}
        </div>
      )}

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default GlassCard;
