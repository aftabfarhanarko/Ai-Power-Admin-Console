import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useCreateInvoiceMutation } from "@/features/invoice/invoiceApiSlice";
import { useGetSystemusersQuery } from "@/features/systemuser/systemuserApiSlice";
import { useGetPackagesQuery } from "@/features/package/packageApiSlice";
import { PageShell } from "../../stitchPrimitives";
import dhakaMapGrid from "@/assets/images/dhaka_map_grid.png";

const formatCurrency = (value) =>
  `৳${Number(value || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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
    .typeError("Paid amount must be a number"),
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

const InvoiceCreatePage = () => {
  const navigate = useNavigate();
  const [createInvoice, { isLoading: isCreating }] = useCreateInvoiceMutation();
  const { data: customers = [] } = useGetSystemusersQuery();
  const { data: packages = [] } = useGetPackagesQuery();

  const [paymentMethod, setPaymentMethod] = useState("bank"); // bank | card | wallet
  const [taxPercent, setTaxPercent] = useState(12);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isTermsChecked, setIsTermsChecked] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      customerId: "",
      packageId: "",
      totalAmount: "",
      paidAmount: 0,
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

  const customerId = watch("customerId");
  const packageId = watch("packageId");
  const baseRate = watch("totalAmount");
  const paidAmount = watch("paidAmount");

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === parseInt(customerId, 10)),
    [customerId, customers]
  );

  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === parseInt(packageId, 10)),
    [packageId, packages]
  );

  // Auto-fill price when package is selected
  React.useEffect(() => {
    if (packageId) {
      const pkg = packages.find((p) => p.id === parseInt(packageId, 10));
      if (pkg) {
        const amt = parseFloat(pkg.discountPrice ?? pkg.price ?? 0);
        if (amt > 0) {
          setValue("totalAmount", amt.toString(), { shouldValidate: true });
        }
      }
    }
  }, [packageId, packages, setValue]);

  // Calculations
  const rateValue = Number(baseRate || 0);
  const subtotal = rateValue * quantity;
  const taxAmount = subtotal * (taxPercent / 100);
  const finalTotal = Math.max(subtotal + taxAmount - discountAmount, 0);
  const balance = Math.max(finalTotal - Number(paidAmount || 0), 0);

  // Update status automatically based on balance
  React.useEffect(() => {
    if (balance === 0 && finalTotal > 0) {
      setValue("status", "paid");
    } else {
      setValue("status", "pending");
    }
  }, [balance, finalTotal, setValue]);

  const onSubmit = async (data) => {
    if (!isTermsChecked) {
      toast.error("Please accept the terms and conditions.");
      return;
    }

    const payload = {
      customerId: parseInt(data.customerId, 10),
      totalAmount: Number(finalTotal.toFixed(2)),
      paidAmount: data.paidAmount ? Number(parseFloat(data.paidAmount).toFixed(2)) : 0,
      amountType: data.amountType,
      status: data.status,
    };

    if (data.packageId) {
      payload.packageId = parseInt(data.packageId, 10);
    }

    // Add bank payment if bank method selected
    if (paymentMethod === "bank" && data.bankName) {
      payload.bankPayment = {
        bankName: data.bankName,
        amount: data.bankAmount ? parseFloat(data.bankAmount) : payload.paidAmount,
        accLastDigit: data.accLastDigit || "",
        status: data.bankPaymentStatus || "pending",
      };
    }

    // Add bkash/wallet details if wallet method selected
    if (paymentMethod === "wallet") {
      if (data.bkashPaymentID) payload.bkashPaymentID = data.bkashPaymentID;
      if (data.bkashTrxID) payload.bkashTrxID = data.bkashTrxID;
    }

    const res = await createInvoice(payload);
    if (res?.data) {
      toast.success("Invoice created successfully");
      navigate("/superadmin/invoices");
    } else {
      toast.error(res?.error?.data?.message || "Failed to create invoice");
    }
  };

  return (
    <PageShell className="space-y-6 max-w-6xl mx-auto px-4 py-4 lg:px-8">
      {/* Header section */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                to="/superadmin/invoices"
                className="text-[#3525cd] hover:underline text-sm font-semibold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Invoices
              </Link>
            </div>
            <h2 className="text-3xl font-bold text-slate-800">Create New Invoice</h2>
            <p className="text-sm text-gray-500">Draft a professional billing statement for your enterprise customers.</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/superadmin/invoices")}
              className="px-5 py-2.5 bg-white border border-gray-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-6 py-2.5 bg-[#3525cd] text-white rounded-xl font-semibold shadow-md shadow-[#3525cd]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 border-none"
            >
              <span className="material-symbols-outlined text-sm">send</span> 
              {isCreating ? "Generating..." : "Generate Invoice"}
            </button>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column: Customer & Service package */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Customer Information Card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200/60 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#e2dfff] flex items-center justify-center text-[#3525cd]">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Customer Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">Customer Name</label>
                  <select
                    {...register("customerId")}
                    className="w-full bg-slate-50 border border-gray-100 rounded-xl p-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] transition-all cursor-pointer"
                  >
                    <option value="">Select a customer...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.customerId && (
                    <span className="text-xs text-red-500 block mt-1">{errors.customerId.message}</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">Billing Email</label>
                  <input
                    type="email"
                    value={selectedCustomer?.email || ""}
                    disabled
                    className="w-full bg-slate-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-400 cursor-not-allowed outline-none"
                    placeholder="billing@company.com"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">Billing Address / Company</label>
                  <textarea
                    rows="2"
                    value={selectedCustomer ? `${selectedCustomer.companyName || ""}\n${selectedCustomer.branchLocation || ""}` : ""}
                    disabled
                    className="w-full bg-slate-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-400 cursor-not-allowed resize-none outline-none"
                    placeholder="Street address, City, Country"
                  />
                </div>
              </div>
            </div>

            {/* Service Package Card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200/60 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
                    <span className="material-symbols-outlined">inventory_2</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Service Package</h3>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    {...register("amountType")}
                    className="bg-slate-50 border border-gray-100 rounded-xl px-3 py-1.5 text-xs text-slate-600 outline-none cursor-pointer"
                  >
                    <option value="package">Package</option>
                    <option value="service">Service</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5 mb-4">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">Select Active Plan</label>
                  <select
                    {...register("packageId")}
                    className="w-full bg-slate-50 border border-gray-100 rounded-xl p-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] transition-all cursor-pointer"
                  >
                    <option value="">Select package plan...</option>
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} - {formatCurrency(pkg.discountPrice ?? pkg.price)}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPackage && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-gray-100">
                    <div className="p-3 bg-white rounded-xl shadow-xs text-[#3525cd]">
                      <span className="material-symbols-outlined text-xl">rocket_launch</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 text-sm">{selectedPackage.name}</p>
                      <p className="text-xs text-gray-400">{selectedPackage.description || "Active subscription package node."}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">{formatCurrency(selectedPackage.discountPrice ?? selectedPackage.price)}</p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Active Tier</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Rate (BDT)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("totalAmount")}
                      className="w-full bg-slate-50 border border-gray-100 rounded-xl p-3 text-sm text-slate-700 outline-none"
                      placeholder="0.00"
                    />
                    {errors.totalAmount && (
                      <span className="text-xs text-red-500 block mt-1">{errors.totalAmount.message}</span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Quantity</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(parseInt(e.target.value, 10) || 1, 1))}
                      className="w-full bg-slate-50 border border-gray-100 rounded-xl p-3 text-sm text-center text-slate-700 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Tax (%)</label>
                    <input
                      type="number"
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(Math.max(parseFloat(e.target.value) || 0, 0))}
                      className="w-full bg-slate-50 border border-gray-100 rounded-xl p-3 text-sm text-center text-slate-700 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Discount (BDT)</label>
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Math.max(parseFloat(e.target.value) || 0, 0))}
                      className="w-full bg-slate-50 border border-gray-100 rounded-xl p-3 text-sm text-center text-slate-700 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Totals & Payments */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Summary Card */}
            <div className="bg-[#3525cd] text-white p-6 rounded-3xl shadow-xl shadow-[#3525cd]/20 relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
              
              <h3 className="text-xs font-bold opacity-80 uppercase tracking-widest mb-4">Payment Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm opacity-90">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm opacity-90">
                  <span>Tax ({taxPercent}%)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-sm opacity-90 text-red-200">
                    <span>Discount</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="h-[1px] bg-white/20 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-base">Total Due</span>
                  <span className="text-2xl font-black">{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                  <p className="text-[9px] uppercase opacity-70 font-bold">Paid</p>
                  <p className="font-bold text-sm">{formatCurrency(paidAmount)}</p>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                  <p className="text-[9px] uppercase opacity-70 font-bold">Balance</p>
                  <p className="font-bold text-sm">{formatCurrency(balance)}</p>
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200/60 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-4">Payment Methods</h3>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#3525cd] transition-all cursor-pointer ${
                  paymentMethod === "bank" ? "border-[#3525cd] bg-[#e2dfff]/20" : ""
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "bank"}
                    onChange={() => setPaymentMethod("bank")}
                    className="w-4 h-4 text-[#3525cd] focus:ring-[#3525cd] border-gray-300"
                  />
                  <span className="material-symbols-outlined text-gray-500">account_balance</span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-700">Bank Transfer</p>
                    <p className="text-[9px] text-gray-400">Swift/Manual SEPA Transfer</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#3525cd] transition-all cursor-pointer ${
                  paymentMethod === "card" ? "border-[#3525cd] bg-[#e2dfff]/20" : ""
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    className="w-4 h-4 text-[#3525cd] focus:ring-[#3525cd] border-gray-300"
                  />
                  <span className="material-symbols-outlined text-gray-500">credit_card</span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-700">Credit Card</p>
                    <p className="text-[9px] text-gray-400">Visa, Mastercard, Amex</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#3525cd] transition-all cursor-pointer ${
                  paymentMethod === "wallet" ? "border-[#3525cd] bg-[#e2dfff]/20" : ""
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "wallet"}
                    onChange={() => setPaymentMethod("wallet")}
                    className="w-4 h-4 text-[#3525cd] focus:ring-[#3525cd] border-gray-300"
                  />
                  <span className="material-symbols-outlined text-gray-500">token</span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-700">Digital Wallet</p>
                    <p className="text-[9px] text-gray-400">Bkash Gateway Gateway</p>
                  </div>
                </label>
              </div>

              {/* Conditional Inputs */}
              {paymentMethod === "bank" && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 block uppercase">Bank Name</label>
                    <input
                      type="text"
                      {...register("bankName")}
                      className="w-full bg-slate-50 border border-gray-100 rounded-xl p-2.5 text-xs text-slate-700 outline-none"
                      placeholder="e.g. City Bank"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 block uppercase">Account Last 4 Digits</label>
                      <input
                        type="text"
                        {...register("accLastDigit")}
                        className="w-full bg-slate-50 border border-gray-100 rounded-xl p-2.5 text-xs text-slate-700 outline-none"
                        placeholder="1234"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 block uppercase">Transfer Amount (BDT)</label>
                      <input
                        type="number"
                        step="0.01"
                        {...register("bankAmount")}
                        className="w-full bg-slate-50 border border-gray-100 rounded-xl p-2.5 text-xs text-slate-700 outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "wallet" && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 block uppercase">Bkash Payment ID</label>
                    <input
                      type="text"
                      {...register("bkashPaymentID")}
                      className="w-full bg-slate-50 border border-gray-100 rounded-xl p-2.5 text-xs text-slate-700 outline-none"
                      placeholder="PAY1283..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 block uppercase">Bkash Transaction ID</label>
                    <input
                      type="text"
                      {...register("bkashTrxID")}
                      className="w-full bg-slate-50 border border-gray-100 rounded-xl p-2.5 text-xs text-slate-700 outline-none"
                      placeholder="BKSH1923..."
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 block uppercase">Amount Received (BDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("paidAmount")}
                    className="w-full bg-slate-50 border border-gray-100 rounded-xl p-3 text-sm text-slate-700 outline-none"
                    placeholder="0.00"
                  />
                  {errors.paidAmount && (
                    <span className="text-xs text-red-500 block mt-1">{errors.paidAmount.message}</span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-700 font-semibold">Net 30 Payment Terms</span>
                  <div
                    onClick={() => setIsTermsChecked(!isTermsChecked)}
                    className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${
                      isTermsChecked ? "bg-[#3525cd]" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-md transform duration-300 ${
                        isTermsChecked ? "translate-x-4" : ""
                      }`}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  By generating this invoice, you agree to Squadlog's International Standard billing terms. Net 30 payment terms apply.
                </p>
              </div>
            </div>


          </div>
        </div>
      </form>
    </PageShell>
  );
};

export default InvoiceCreatePage;
