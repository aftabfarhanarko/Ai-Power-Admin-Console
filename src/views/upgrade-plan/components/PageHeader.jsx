import React from "react";
import { Crown } from "lucide-react";

export const PageHeader = () => {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 grid place-items-center">
          <Crown className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-2xl font-semibold">Upgrade Your Plan</h1>
      </div>
      <p className="text-sm text-black/60 dark:text-white/60">
        Choose the perfect package for your business needs. Upgrade or downgrade anytime.
      </p>
    </div>
  );
};
