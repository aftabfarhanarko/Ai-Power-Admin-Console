import React, { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle } from "lucide-react";
import { useVerifyBankPaymentMutation, useRejectBankPaymentMutation } from "@/features/invoice/invoiceApiSlice";

const InlineBankPaymentActions = ({ invoice }) => {
  const [verifyBankPayment, { isLoading: isVerifying }] = useVerifyBankPaymentMutation();
  const [rejectBankPayment, { isLoading: isRejecting }] = useRejectBankPaymentMutation();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Only show for pending bank payments
  if (!invoice?.bankPayment || invoice.bankPayment.status !== "pending") {
    return null;
  }

  const handleVerify = async (e) => {
    e.stopPropagation();
    
    if (!window.confirm(`Verify bank payment for invoice ${invoice.invoiceNumber}?`)) {
      return;
    }

    const res = await verifyBankPayment(invoice.id);
    if (res?.data) {
      toast.success("Bank payment verified successfully");
    } else {
      toast.error(res?.error?.data?.message || "Failed to verify payment");
    }
  };

  const handleReject = async () => {
    const res = await rejectBankPayment({
      id: invoice.id,
      reason: rejectReason || undefined,
    });
    
    if (res?.data) {
      toast.success("Bank payment rejected");
      setShowRejectDialog(false);
      setRejectReason("");
    } else {
      toast.error(res?.error?.data?.message || "Failed to reject payment");
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          onClick={handleVerify}
          disabled={isVerifying}
          title="Approve bank payment"
          className="h-8 w-8 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <CheckCircle2 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setShowRejectDialog(true);
          }}
          disabled={isRejecting}
          title="Reject bank payment"
          className="h-8 w-8 bg-rose-600 hover:bg-rose-700 text-white"
        >
          <XCircle className="h-4 w-4" />
        </Button>
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Reject Bank Payment</DialogTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Invoice: {invoice.invoiceNumber}
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-800">
              <div className="text-sm space-y-1">
                <p className="font-medium text-rose-700 dark:text-rose-300">Bank Payment Details:</p>
                <p className="text-rose-600 dark:text-rose-400">
                  Bank: {invoice.bankPayment.bankName} | Amount: ৳{parseFloat(invoice.bankPayment.amount).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Providing a reason helps the customer understand why the payment was rejected.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={isRejecting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isRejecting ? "Rejecting..." : "Reject Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InlineBankPaymentActions;
