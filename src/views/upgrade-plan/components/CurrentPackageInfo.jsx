import React from "react";
import { Package, Star } from "lucide-react";

export const CurrentPackageInfo = ({ packageData }) => {
  if (!packageData) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-300/20 dark:border-purple-500/20 p-5">
      <div className="flex items-center gap-2 mb-2">
        <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
          Your Current Package
        </h3>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
            {packageData.name}
          </p>
          <p className="text-xs text-blue-600/70 dark:text-blue-300/70 mt-1">
            ৳{parseFloat(packageData.discountPrice || packageData.price).toFixed(2)}/month
          </p>
        </div>
        {packageData.isFeatured && (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-xs font-medium rounded-full flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            Featured
          </span>
        )}
      </div>
    </div>
  );
};
