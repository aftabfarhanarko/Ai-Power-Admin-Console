import React from "react";
import { Button } from "@/components/ui/button";

export const PaymentVerificationBanner = ({ onCheckNow }) => {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-300/20 dark:border-emerald-500/20 p-5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">
            Verifying Payment...
          </h3>
          <p className="text-xs text-green-600/70 dark:text-green-300/70">
            We're checking your payment status. Your package will be upgraded automatically once payment is confirmed.
          </p>
        </div>
        <Button
          onClick={onCheckNow}
          variant="outline"
          size="sm"
          className="text-green-600 border-green-500/30 hover:bg-green-500/10"
        >
          Check Now
        </Button>
      </div>
    </div>
  );
};
