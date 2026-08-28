import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogFooter,
} from "@/components/ui/dialog";
import { useCreateInvoiceMutation } from "@/features/invoice/invoiceApiSlice";
import { useGetSystemusersQuery } from "@/features/systemuser/systemuserApiSlice";
import { useGetPackagesQuery } from "@/features/package/packageApiSlice";
import { Plus, X } from "lucide-react";
import { MaterialIcon, monoTextStyle } from "../stitchPrimitives";

const schema = yup.object().shape({
    customerId: yup
        .number()
        .required("Customer is required")
        .positive("Please select a customer")
        .typeError("Customer is required"),
    totalAmount: yup
        .number()
        .required("Total amount is required")
        .positive("Amount must be positive")
        .typeError("Total amount must be a number"),
    paidAmount: yup
        .number()
        .nullable()
        .min(0, "Paid amount cannot be negative")
        .typeError("Paid amount must be a number")
        .test("not-exceed-total", "Paid amount cannot exceed total amount", function (value) {
            const { totalAmount } = this.parent;
            if (!value) return true;
            return value <= totalAmount;
        }),
    amountType: yup
        .string()
        .required("Amount type is required")
        .oneOf(["package", "service", "other"], "Invalid amount type"),
    status: yup
        .string()
        .required("Status is required")
        .oneOf(["pending", "paid", "cancelled"], "Invalid status"),
    bankName: yup.string().nullable(),
    bankAmount: yup
        .number()
        .nullable()
        .positive("Bank amount must be positive")
        .typeError("Bank amount must be a number"),
    accLastDigit: yup.string().nullable(),
    bankPaymentStatus: yup
        .string()
        .nullable()
        .oneOf(["verified", "pending", "rejected", null], "Invalid bank payment status"),
    bkashPaymentID: yup.string().nullable(),
    bkashTrxID: yup.string().nullable(),
});

const InvoiceCreateForm = ({
    triggerLabel = "Add Invoice",
    triggerClassName = "",
}) => {
    const [open, setOpen] = useState(false);
    const [createInvoice, { isLoading }] = useCreateInvoiceMutation();
    const { data: customers = [] } = useGetSystemusersQuery();
    const { data: packages = [] } = useGetPackagesQuery();
    const [showBankPayment, setShowBankPayment] = useState(false);
    const [showBkashPayment, setShowBkashPayment] = useState(false);
    const [selectedPackageName, setSelectedPackageName] = useState("");
    const [taxOverride, setTaxOverride] = useState("0");
    const [notes, setNotes] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            customerId: "",
            packageId: "",
            totalAmount: "",
            paidAmount: "0",
            amountType: "package",
            status: "pending",
            bankName: "",
            bankAmount: "",
            accLastDigit: "",
            bankPaymentStatus: "pending",
            bkashPaymentID: "",
            bkashTrxID: "",
        },
    });

    const totalAmount = watch("totalAmount");
    const paidAmount = watch("paidAmount");
    const customerId = watch("customerId");
    const packageId = watch("packageId");
    const selectedCustomer = useMemo(
        () => customers.find((customer) => customer.id === parseInt(customerId, 10)),
        [customerId, customers],
    );
    const selectedPackage = useMemo(
        () => packages.find((pkg) => pkg.id === parseInt(packageId, 10)),
        [packageId, packages],
    );

    // Auto-fill total amount when package is selected
    React.useEffect(() => {
        if (packageId) {
            const selectedPackage = packages.find(p => p.id === parseInt(packageId));
            if (selectedPackage) {
                const amount = parseFloat(selectedPackage.discountPrice ?? selectedPackage.price ?? 0);
                setSelectedPackageName(selectedPackage.name);
                if (amount > 0) {
                    setValue("totalAmount", amount.toString(), { shouldValidate: true });
                }
            }
        } else {
            setSelectedPackageName("");
        }
    }, [packageId, packages, setValue]);

    // Auto-populate package name and price when customer is selected (if no package selected)
    React.useEffect(() => {
        if (customerId && !packageId) {
            const selectedCustomer = customers.find(c => c.id === parseInt(customerId));
            if (selectedCustomer?.paymentInfo) {
                const { packagename, amount } = selectedCustomer.paymentInfo;
                if (packagename) {
                    setSelectedPackageName(packagename);
                }
                if (amount) {
                    setValue("totalAmount", amount.toString(), { shouldValidate: true });
                }
            } else {
                setSelectedPackageName("");
            }
        } else if (!packageId) {
            setSelectedPackageName("");
        }
    }, [customerId, packageId, customers, setValue]);

    // Auto-calculate due amount
    const dueAmount = totalAmount && paidAmount 
        ? (parseFloat(totalAmount) - parseFloat(paidAmount || 0)).toFixed(2)
        : "0.00";
    const subtotal = Number(totalAmount || 0) * 1;
    const estimatedTax = subtotal * (Number(taxOverride || 0) / 100);
    const finalTotal = subtotal + estimatedTax;

    const resetState = () => {
        reset({
            customerId: "",
            packageId: "",
            totalAmount: "",
            paidAmount: "0",
            amountType: "package",
            status: "pending",
            bankName: "",
            bankAmount: "",
            accLastDigit: "",
            bankPaymentStatus: "pending",
            bkashPaymentID: "",
            bkashTrxID: "",
        });
        setShowBankPayment(false);
        setShowBkashPayment(false);
        setSelectedPackageName("");
        setTaxOverride("0");
        setNotes("");
    };

    const onSubmit = async (data) => {
        const payload = {
            customerId: parseInt(data.customerId),
            totalAmount: Number(parseFloat(finalTotal || data.totalAmount).toFixed(2)),
            paidAmount: data.paidAmount ? Number(parseFloat(data.paidAmount).toFixed(2)) : 0,
            amountType: data.amountType,
            status: data.status,
        };
        if (data.packageId) {
            payload.packageId = parseInt(data.packageId);
        }

        // Add bank payment if provided
        if (showBankPayment && data.bankName) {
            payload.bankPayment = {
                bankName: data.bankName,
                amount: data.bankAmount ? parseFloat(data.bankAmount) : 0,
                accLastDigit: data.accLastDigit || "",
                status: data.bankPaymentStatus || "pending",
            };
        }

        // Add bkash payment if provided
        if (showBkashPayment) {
            if (data.bkashPaymentID) payload.bkashPaymentID = data.bkashPaymentID;
            if (data.bkashTrxID) payload.bkashTrxID = data.bkashTrxID;
        }

        const res = await createInvoice(payload);
        if (res?.data) {
            toast.success("Invoice created successfully");
            resetState();
            setOpen(false);
        } else {
            toast.error(res?.error?.data?.message || "Failed to create invoice");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    className={`flex w-full items-center gap-2 sm:w-auto ${triggerClassName || "bg-violet-600 text-white shadow-sm shadow-violet-200 hover:bg-violet-700 dark:shadow-none"}`}
                >
                    <Plus className="h-4 w-4" />
                    {triggerLabel}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[92vh] max-w-[980px] overflow-y-auto border border-white/[0.08] bg-[#101319] p-0 text-[#e1e2e7] shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="border-b border-white/[0.06] bg-[#0e1117] px-5 py-4 sm:px-6">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
                                    <MaterialIcon className="text-[20px] text-[#cabeff]">
                                        note_add
                                    </MaterialIcon>
                                </div>
                                <div>
                                    <p
                                        className="text-[11px] uppercase tracking-[0.32em] text-[#c9c4d0]"
                                        style={monoTextStyle}
                                    >
                                        {selectedCustomer ? "System Command" : "New Invoice"}
                                    </p>
                                    <h2 className="mt-1 text-[28px] font-black leading-none text-[#f5f7fb]">
                                        {selectedCustomer ? "Generate Invoice" : "Create New Invoice"}
                                    </h2>
                                    <p
                                        className="mt-2 text-[12px] uppercase tracking-[0.24em] text-[#938f9a]"
                                        style={monoTextStyle}
                                    >
                                        Transaction_id: {selectedCustomer?.id || "9844-AX"}
                                    </p>
                                </div>
                            </div>
                            <button
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#c9c4d0] transition-colors hover:text-white"
                                onClick={() => {
                                    setOpen(false);
                                    resetState();
                                }}
                                type="button"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-6 px-5 py-6 sm:px-6 lg:grid-cols-[1.15fr_1fr]">
                        <div className="space-y-6">
                            <div>
                                <p
                                    className="mb-3 text-[11px] uppercase tracking-[0.28em] text-[#c9c4d0]"
                                    style={monoTextStyle}
                                >
                                    Terminal / Client Entity
                                </p>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <select
                                            {...register("customerId")}
                                            className="h-12 w-full rounded-full border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-[#f1f4f8] outline-none"
                                        >
                                            <option value="">Select Client Node...</option>
                                            {customers.map((customer) => (
                                                <option key={customer.id} value={customer.id}>
                                                    {customer.name} - {customer.companyName || customer.email}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.customerId && (
                                            <span className="mt-2 block text-xs text-[#ffb4ab]">
                                                {errors.customerId.message}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center rounded-full border border-white/[0.08] bg-white/[0.02] px-4">
                                        <MaterialIcon className="mr-3 text-[18px] text-[#938f9a]">
                                            person
                                        </MaterialIcon>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-[#f1f4f8]">
                                                {selectedCustomer?.name || "No Client Selected"}
                                            </p>
                                            <p
                                                className="truncate text-[10px] uppercase tracking-[0.22em] text-[#6f7482]"
                                                style={monoTextStyle}
                                            >
                                                {selectedCustomer?.email || "Waiting for data"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p
                                    className="mb-3 text-[11px] uppercase tracking-[0.28em] text-[#c9c4d0]"
                                    style={monoTextStyle}
                                >
                                    Resource Package
                                </p>
                                <div className="grid gap-3">
                                    {packages.slice(0, 4).map((pkg) => {
                                        const checked = String(packageId) === String(pkg.id);
                                        const displayPrice = Number(
                                            pkg.discountPrice ?? pkg.price ?? 0,
                                        ).toLocaleString();

                                        return (
                                            <label
                                                key={pkg.id}
                                                className={`flex cursor-pointer items-start justify-between rounded-[26px] border px-4 py-4 transition-all ${
                                                    checked
                                                        ? "border-[#d8cdfa] bg-[linear-gradient(180deg,rgba(230,222,255,0.08),rgba(230,222,255,0.03))] shadow-[0_0_0_1px_rgba(230,222,255,0.25)_inset]"
                                                        : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05]"
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span
                                                        className={`mt-1 h-4 w-4 rounded-full border ${
                                                            checked
                                                                ? "border-[#d8cdfa] bg-[#d8cdfa]"
                                                                : "border-white/20"
                                                        }`}
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-[#f5f7fb]">
                                                            {pkg.name}
                                                        </p>
                                                        <p className="mt-1 text-sm text-[#aab1bd]">
                                                            {pkg.description?.slice(0, 54) ||
                                                                "Core maintenance & reporting"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-[#f5f7fb]">
                                                        ৳{displayPrice}
                                                    </p>
                                                </div>
                                                <input
                                                    {...register("packageId")}
                                                    className="hidden"
                                                    type="radio"
                                                    value={pkg.id}
                                                />
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <p
                                    className="mb-3 text-[11px] uppercase tracking-[0.28em] text-[#c9c4d0]"
                                    style={monoTextStyle}
                                >
                                    Deployment Notes
                                </p>
                                <textarea
                                    className="min-h-[132px] w-full rounded-[28px] border border-white/[0.08] bg-white/[0.04] px-4 py-4 text-sm text-[#f1f4f8] outline-none placeholder:text-[#6f7482]"
                                    onChange={(event) => setNotes(event.target.value)}
                                    placeholder="Brief system justification or billing notes..."
                                    value={notes}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <p
                                    className="mb-3 text-[11px] uppercase tracking-[0.28em] text-[#c9c4d0]"
                                    style={monoTextStyle}
                                >
                                    Financial Ledger
                                </p>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label
                                            className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[#938f9a]"
                                            style={monoTextStyle}
                                        >
                                            Rate (BDT)
                                        </label>
                                        <input
                                            {...register("totalAmount")}
                                            className="h-12 w-full rounded-full border border-white/[0.08] bg-white/[0.04] px-4 text-lg font-semibold text-[#f1f4f8] outline-none"
                                            placeholder="0.00"
                                            step="0.01"
                                            type="number"
                                        />
                                        {errors.totalAmount && (
                                            <span className="mt-2 block text-xs text-[#ffb4ab]">
                                                {errors.totalAmount.message}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <label
                                            className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[#938f9a]"
                                            style={monoTextStyle}
                                        >
                                            Paid Amount
                                        </label>
                                        <input
                                            {...register("paidAmount")}
                                            className="h-12 w-full rounded-full border border-white/[0.08] bg-white/[0.04] px-4 text-lg font-semibold text-[#f1f4f8] outline-none"
                                            placeholder="0.00"
                                            step="0.01"
                                            type="number"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <div className="flex items-center justify-between">
                                            <label
                                                className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[#938f9a]"
                                                style={monoTextStyle}
                                            >
                                                Tax Override (%)
                                            </label>
                                            <span className="text-sm font-semibold text-[#f5f7fb]">
                                                {Number(taxOverride || 0).toFixed(2)}%
                                            </span>
                                        </div>
                                        <input
                                            className="w-full accent-[#d8cdfa]"
                                            max="100"
                                            min="0"
                                            onChange={(event) => setTaxOverride(event.target.value)}
                                            type="range"
                                            value={taxOverride}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p
                                    className="mb-3 text-[11px] uppercase tracking-[0.28em] text-[#c9c4d0]"
                                    style={monoTextStyle}
                                >
                                    Transaction Channel
                                </p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <button
                                        className={`rounded-[28px] border px-4 py-5 text-left transition-all ${
                                            showBankPayment
                                                ? "border-[#d8cdfa] bg-[linear-gradient(180deg,rgba(230,222,255,0.08),rgba(230,222,255,0.03))]"
                                                : "border-white/[0.08] bg-white/[0.03]"
                                        }`}
                                        onClick={() => {
                                            setShowBankPayment(true);
                                            setShowBkashPayment(false);
                                        }}
                                        type="button"
                                    >
                                        <MaterialIcon className="text-[22px] text-[#d8cdfa]">
                                            account_balance
                                        </MaterialIcon>
                                        <p
                                            className="mt-6 text-[11px] uppercase tracking-[0.24em] text-[#d9d1f6]"
                                            style={monoTextStyle}
                                        >
                                            Bank Transfer
                                        </p>
                                    </button>
                                    <button
                                        className={`rounded-[28px] border px-4 py-5 text-left transition-all ${
                                            showBkashPayment
                                                ? "border-[#d8cdfa] bg-[linear-gradient(180deg,rgba(230,222,255,0.08),rgba(230,222,255,0.03))]"
                                                : "border-white/[0.08] bg-white/[0.03]"
                                        }`}
                                        onClick={() => {
                                            setShowBkashPayment(true);
                                            setShowBankPayment(false);
                                        }}
                                        type="button"
                                    >
                                        <MaterialIcon className="text-[22px] text-[#d8cdfa]">
                                            account_balance_wallet
                                        </MaterialIcon>
                                        <p
                                            className="mt-6 text-[11px] uppercase tracking-[0.24em] text-[#d9d1f6]"
                                            style={monoTextStyle}
                                        >
                                            Bkash Gateway
                                        </p>
                                    </button>
                                </div>
                            </div>

                            {showBankPayment ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <input
                                        {...register("bankName")}
                                        className="h-12 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-[#f1f4f8] outline-none"
                                        placeholder="Bank Name"
                                    />
                                    <input
                                        {...register("bankAmount")}
                                        className="h-12 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-[#f1f4f8] outline-none"
                                        placeholder="Transfer Amount"
                                        step="0.01"
                                        type="number"
                                    />
                                    <input
                                        {...register("accLastDigit")}
                                        className="h-12 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-[#f1f4f8] outline-none"
                                        placeholder="Account Last Digits"
                                    />
                                    <select
                                        {...register("bankPaymentStatus")}
                                        className="h-12 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-[#f1f4f8] outline-none"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="verified">Verified</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            ) : null}

                            {showBkashPayment ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <input
                                        {...register("bkashPaymentID")}
                                        className="h-12 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-[#f1f4f8] outline-none"
                                        placeholder="Bkash Payment ID"
                                    />
                                    <input
                                        {...register("bkashTrxID")}
                                        className="h-12 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-[#f1f4f8] outline-none"
                                        placeholder="Bkash Transaction ID"
                                    />
                                </div>
                            ) : null}

                            <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.04] p-5">
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span
                                            className="text-[11px] uppercase tracking-[0.22em] text-[#938f9a]"
                                            style={monoTextStyle}
                                        >
                                            Subtotal
                                        </span>
                                        <span className="font-semibold text-[#f5f7fb]">
                                            ৳{subtotal.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span
                                            className="text-[11px] uppercase tracking-[0.22em] text-[#938f9a]"
                                            style={monoTextStyle}
                                        >
                                            Estimated Tax
                                        </span>
                                        <span className="font-semibold text-[#f5f7fb]">
                                            ৳{estimatedTax.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="border-t border-white/[0.08] pt-3 flex items-center justify-between">
                                        <span
                                            className="text-[11px] uppercase tracking-[0.22em] text-[#f5f7fb]"
                                            style={monoTextStyle}
                                        >
                                            Final Total
                                        </span>
                                        <span className="text-xl font-black text-[#f5f7fb]">
                                            ৳{finalTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/[0.06] bg-[#0e1117] px-5 py-4 sm:px-6">
                        <DialogFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-12 rounded-full border-white/[0.08] bg-transparent px-6 text-[#e1e2e7] hover:bg-white/[0.04]"
                            >
                                Save Draft
                            </Button>
                            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-12 rounded-full px-6 text-[#c9c4d0] hover:bg-white/[0.04] hover:text-white"
                                    onClick={() => {
                                        setOpen(false);
                                        resetState();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="h-12 rounded-full bg-[#d8cdfa] px-8 text-[12px] font-bold uppercase tracking-[0.24em] text-[#29224d] hover:bg-[#cbc0ee]"
                                    style={monoTextStyle}
                                >
                                    {isLoading ? "Deploying..." : "Deploy Invoice"}
                                </Button>
                            </div>
                        </DialogFooter>
                        <p
                            className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-[#6f7482]"
                            style={monoTextStyle}
                        >
                            Authorization code: Aether-772-X
                        </p>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default InvoiceCreateForm;
