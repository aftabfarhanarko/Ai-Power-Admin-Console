import React from "react";
import { Check, CreditCard, Building2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const PaymentModal = ({
  isOpen,
  onClose,
  invoice,
  selectedPaymentMethod,
  onPaymentMethodChange,
  bankPaymentData,
  onBankPaymentDataChange,
  onBkashPayment,
  onBankPayment,
  isLoadingBkash,
  isLoadingBank,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>
        {invoice && (
          <div className="space-y-4">
            <div className="rounded-lg bg-black/5 dark:bg-white/5 border border-gray-100 dark:border-gray-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-black/60 dark:text-white/60">Item:</span>
                <span className="text-sm font-semibold">
                  {invoice.isAddon ? invoice.addonTitle : invoice.invoiceNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-black/60 dark:text-white/60">Amount Due:</span>
                <span className="text-lg font-bold">
                  $ {parseFloat(invoice.dueAmount || invoice.totalAmount).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-black/70 dark:text-white/70">
                Select Payment Method
              </label>
              
              {/* bKash Merchant Payment */}
              <button
                type="button"
                onClick={() => onPaymentMethodChange("bkash")}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedPaymentMethod === "bkash"
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : "border-gray-100 dark:border-gray-800 hover:border-black/20 dark:hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedPaymentMethod === "bkash"
                        ? "bg-green-500 text-white"
                        : "bg-black/5 dark:bg-white/5"
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">bKash Merchant</p>
                    <p className="text-xs text-black/60 dark:text-white/60">
                      Pay securely via bKash
                    </p>
                  </div>
                  {selectedPaymentMethod === "bkash" && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </button>

              {/* Bank Payment */}
              <button
                type="button"
                onClick={() => onPaymentMethodChange("bank")}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedPaymentMethod === "bank"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                    : "border-gray-100 dark:border-gray-800 hover:border-black/20 dark:hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedPaymentMethod === "bank"
                        ? "bg-blue-500 text-white"
                        : "bg-black/5 dark:bg-white/5"
                    }`}
                  >
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">Bank Payment</p>
                    <p className="text-xs text-black/60 dark:text-white/60">
                      Bank transfer (admin verification required)
                    </p>
                  </div>
                  {selectedPaymentMethod === "bank" && (
                    <Check className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              </button>
            </div>

            {/* Bank Payment Form */}
            {selectedPaymentMethod === "bank" && (
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="space-y-2">
                  <label htmlFor="bankName" className="text-sm font-medium text-black/70 dark:text-white/70">
                    Bank Name
                  </label>
                  <input
                    id="bankName"
                    type="text"
                    placeholder="e.g., Dutch Bangla Bank"
                    value={bankPaymentData.bankName}
                    onChange={(e) =>
                      onBankPaymentDataChange({ ...bankPaymentData, bankName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1f26] text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="accLastDigit" className="text-sm font-medium text-black/70 dark:text-white/70">
                    Account Last 4 Digits
                  </label>
                  <input
                    id="accLastDigit"
                    type="text"
                    placeholder="e.g., 1234"
                    maxLength={4}
                    value={bankPaymentData.accLastDigit}
                    onChange={(e) =>
                      onBankPaymentDataChange({
                        ...bankPaymentData,
                        accLastDigit: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1f26] text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                  />
                </div>
                <p className="text-xs text-black/60 dark:text-white/60">
                  After admin verifies your payment, your package will be automatically upgraded.
                </p>
              </div>
            )}

            {/* Payment Info for bKash */}
            {selectedPaymentMethod === "bkash" && (
              <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3">
                <p className="text-xs text-green-700 dark:text-green-300">
                  You will be redirected to bKash payment gateway to complete your payment securely.
                </p>
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoadingBkash || isLoadingBank}
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          {selectedPaymentMethod === "bkash" && (
            <Button
              type="button"
              onClick={onBkashPayment}
              disabled={isLoadingBkash}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {isLoadingBkash ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay with bKash
                </>
              )}
            </Button>
          )}
          {selectedPaymentMethod === "bank" && (
            <Button
              type="button"
              onClick={onBankPayment}
              disabled={isLoadingBank}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isLoadingBank ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 mr-2" />
                  Submit Bank Payment
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
