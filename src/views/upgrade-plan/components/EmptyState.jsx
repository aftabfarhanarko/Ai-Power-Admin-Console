import React from "react";
import { Package } from "lucide-react";

export const EmptyState = () => {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-12 text-center">
      <Package className="h-16 w-16 text-black/20 dark:text-white/20 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">No Packages Available</h3>
      <p className="text-sm text-black/60 dark:text-white/60">
        There are currently no subscription packages available. Please check back later.
      </p>
    </div>
  );
};
