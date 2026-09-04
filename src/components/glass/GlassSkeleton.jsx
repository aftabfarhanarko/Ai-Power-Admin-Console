import React from "react";

export const GlassSkeleton = ({ className = "" }) => {
  return <div className={`glass-skeleton ${className}`} />;
};

export const GlassCardSkeleton = () => (
  <div className="glass-card p-6 space-y-4">
    <div className="flex justify-between items-center">
      <GlassSkeleton className="h-4 w-28" />
      <GlassSkeleton className="h-10 w-10 rounded-2xl" />
    </div>
    <GlassSkeleton className="h-8 w-36" />
    <GlassSkeleton className="h-4 w-48" />
  </div>
);

export const GlassTableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="glass-table-container p-4 space-y-3">
    <div className="flex gap-4 mb-4">
      {Array.from({ length: cols }).map((_, i) => (
        <GlassSkeleton key={i} className="h-6 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-4 py-2 border-t border-slate-200/50 dark:border-white/5">
        {Array.from({ length: cols }).map((_, c) => (
          <GlassSkeleton key={c} className="h-5 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export default GlassSkeleton;
