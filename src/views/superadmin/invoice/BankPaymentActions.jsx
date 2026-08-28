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

const BankPaymentActions = ({ invoice }) => {
  const [verifyBankPayment, { isLoading: isVerifying }] = useVerifyBankPaymentMutation();
  const [rejectBankPayment, { isLoading: isRejecting }] = useRejectBankPaymentMutation();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleVerify = async () => {
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

  // Don't show actions if no bank payment or already verified/rejected
  if (!invoice?.bankPayment) {
    return null;
  }

  const { status } = invoice.bankPayment;

  return (
    <div className="flex items-center gap-2">
      {status === "pending" && (
        <>
          <Button
            size="sm"
            onClick={handleVerify}
            disabled={isVerifying}
            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isVerifying ? "Verifying..." : "Approve Payment"}
          </Button>
          <Button
            size="sm"
            onClick={() => setShowRejectDialog(true)}
            disabled={isRejecting}
            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Reject Payment
          </Button>
        </>
      )}

      {status === "verified" && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Payment Verified
          </span>
        </div>
      )}

      {status === "rejected" && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
          <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          <span className="text-sm font-medium text-rose-700 dark:text-rose-300">
            Payment Rejected
          </span>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Bank Payment</DialogTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Invoice: {invoice.invoiceNumber}
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-800">
              <p className="text-sm text-rose-700 dark:text-rose-300">
                You are about to reject this bank payment. This action will update the payment status.
              </p>
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
    </div>
  );
};

export default BankPaymentActions;
