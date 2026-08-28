import React from "react";

export default function InvoiceDetailsFooterBanner({ companyName, branchLocation }) {
  return (
    <div className="relative h-24 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800 overflow-hidden px-12 flex items-center justify-between">
      <div className="absolute right-0 top-0 h-full w-[40%] bg-gradient-to-l from-[#7c3aed]/5 to-transparent" />
      <div className="space-y-1 relative z-10">
        <p className="text-xs font-black text-gray-900 dark:text-white uppercase">
          {companyName || "SquadCart"}
        </p>
        <p className="text-[10px] text-gray-400">{branchLocation || "-"}</p>
      </div>
      <div className="flex items-center gap-2 relative z-10">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#3b82f6] flex items-center justify-center text-white scale-75">
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          {companyName || "SquadCart"}
        </span>
      </div>
    </div>
  );
}
