import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useUpdateInvoiceMutation } from "@/features/invoice/invoiceApiSlice";

const schema = yup.object().shape({
    status: yup
        .string()
        .required("Status is required")
        .oneOf(["pending", "paid", "cancelled"], "Invalid status"),
    paidAmount: yup
        .number()
        .nullable()
        .min(0, "Paid amount cannot be negative")
        .typeError("Paid amount must be a number"),
    bankPaymentStatus: yup
        .string()
        .nullable()
        .oneOf(["verified", "pending", "rejected", null], "Invalid bank payment status"),
});

const InvoiceStatusUpdateForm = ({ invoice, onClose }) => {
    const [updateInvoice, { isLoading }] = useUpdateInvoiceMutation();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            status: invoice?.status || "pending",
            paidAmount: invoice?.paidAmount || "0",
            bankPaymentStatus: invoice?.bankPayment?.status || "pending",
        },
    });

    useEffect(() => {
        if (invoice) {
            reset({
                status: invoice.status || "pending",
                paidAmount: invoice.paidAmount || "0",
                bankPaymentStatus: invoice.bankPayment?.status || "pending",
            });
        }
    }, [invoice, reset]);

    const totalAmount = parseFloat(invoice?.totalAmount || 0);
    const paidAmount = watch("paidAmount");
    const dueAmount = totalAmount && paidAmount 
        ? (totalAmount - parseFloat(paidAmount || 0)).toFixed(2)
        : "0.00";

    const onSubmit = async (data) => {
        const payload = {
            id: invoice.id,
            status: data.status,
            paidAmount: data.paidAmount ? Number(parseFloat(data.paidAmount).toFixed(2)) : 0,
        };

        // Update bank payment status if it exists
        if (invoice.bankPayment && data.bankPaymentStatus) {
            payload.bankPayment = {
                ...invoice.bankPayment,
                status: data.bankPaymentStatus,
            };
        }

        const res = await updateInvoice(payload);
        if (res?.data) {
            toast.success("Invoice updated successfully");
            onClose?.();
        } else {
            toast.error(res?.error?.data?.message || "Failed to update invoice");
        }
    };

    if (!invoice) return null;

    return (
        <Dialog open={!!invoice} onOpenChange={(v) => !v && onClose?.()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Update Invoice Status</DialogTitle>
                    <p className="text-sm text-black/60 dark:text-white/60">
                        Invoice: {invoice.invoiceNumber}
                    </p>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Invoice Summary */}
                    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-gray-800 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-black/60 dark:text-white/60">Customer:</span>
                            <span className="font-medium">{invoice.customer?.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-black/60 dark:text-white/60">Total Amount:</span>
                            <span className="font-semibold">৳{parseFloat(invoice.totalAmount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-black/60 dark:text-white/60">Current Status:</span>
                            <span className={`font-medium capitalize ${
                                invoice.status === 'paid' ? 'text-green-600 dark:text-green-400' :
                                invoice.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-red-600 dark:text-red-400'
                            }`}>
                                {invoice.status}
                            </span>
                        </div>
                    </div>

                    {/* Status Update */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-black/70 dark:text-white/70">
                            Invoice Status *
                        </label>
                        <select
                            {...register("status")}
                            className="w-full px-3 py-2 text-sm rounded-md border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                        >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        {errors.status && (
                            <span className="text-red-500 text-xs ml-1">
                                {errors.status.message}
                            </span>
                        )}
                    </div>

                    {/* Paid Amount Update */}
                    <TextField
                        label="Paid Amount (BDT)"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        register={register}
                        name="paidAmount"
                        error={errors.paidAmount}
                    />

                    {/* Due Amount Display */}
                    <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-black/60 dark:text-white/60">Remaining Due Amount</p>
                        <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                            ৳{dueAmount}
                        </p>
                    </div>

                    {/* Bank Payment Status (if exists) */}
                    {invoice.bankPayment && (
                        <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                Bank Payment Status
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <p className="text-black/60 dark:text-white/60">Bank:</p>
                                    <p className="font-medium">{invoice.bankPayment.bankName}</p>
                                </div>
                                <div>
                                    <p className="text-black/60 dark:text-white/60">Amount:</p>
                                    <p className="font-medium">৳{parseFloat(invoice.bankPayment.amount).toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-black/70 dark:text-white/70">
                                    Payment Verification Status
                                </label>
                                <select
                                    {...register("bankPaymentStatus")}
                                    className="w-full px-3 py-2 text-sm rounded-md border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="verified">Verified</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                            onClick={() => onClose?.()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"
                        >
                            {isLoading ? "Updating..." : "Update Invoice"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default InvoiceStatusUpdateForm;
