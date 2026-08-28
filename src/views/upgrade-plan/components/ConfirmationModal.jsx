import React from "react";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  selectedPackage, 
  onConfirm, 
  isLoading 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Plan Upgrade</DialogTitle>
        </DialogHeader>
        {selectedPackage && (
          <div className="space-y-4">
            <p className="text-sm text-black/60 dark:text-white/60">
              You are about to upgrade to:
            </p>
            
            <div className="rounded-lg bg-black/5 dark:bg-white/5 border border-gray-100 dark:border-gray-800 p-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                {selectedPackage.name}
                {selectedPackage.isFeatured && (
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                )}
              </h4>
              <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                {selectedPackage.description}
              </p>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    ৳{parseFloat(selectedPackage.discountPrice || selectedPackage.price).toFixed(2)}
                  </span>
                  <span className="text-sm text-black/60 dark:text-white/60">/month</span>
                </div>
                {selectedPackage.discountPrice && (
                  <span className="text-sm text-black/40 dark:text-white/40 line-through">
                    ৳{parseFloat(selectedPackage.price).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4">
              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-2">
                What happens next:
              </p>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <li>• An invoice will be created for this package</li>
                <li>• You'll be prompted to complete the payment</li>
                <li>• Package will be upgraded after payment is verified</li>
                <li>• You'll get access to all features once payment is confirmed</li>
              </ul>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Confirm Upgrade
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
