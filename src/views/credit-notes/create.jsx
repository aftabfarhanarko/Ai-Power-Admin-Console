import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Save, 
  X, 
  PlusCircle, 
  FileText,
  User as UserIcon,
  DollarSign,
  AlertCircle,
  Loader2,
  CreditCard,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateCreditNoteMutation } from "@/features/credit-note/creditNoteApiSlice";
import { useGetSaleInvoicesQuery } from "@/features/invoice/saleInvoiceApiSlice";
import { useGetUsersQuery } from "@/features/user/userApiSlice";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

/**
 * CreateCreditNotePage Component
 * Form to create a new Sales Return / Credit Note.
 */
const CreateCreditNotePage = () => {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  
  // API Mutations and Queries
  const [createCreditNote, { isLoading }] = useCreateCreditNoteMutation();
  const { data: invoices } = useGetSaleInvoicesQuery(authUser?.companyId);
  const { data: users } = useGetUsersQuery({ companyId: authUser?.companyId });

  // Form State
  const [formData, setFormData] = useState({
    creditNoteNumber: `CN${Math.floor(Math.random() * 90000) + 10000}`,
    customerId: "",
    invoiceId: "",
    amount: "",
    paymentMode: "Cash",
    reason: "",
    status: "Pending"
  });

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerId || !formData.amount) {
      toast.error("Please fill in the required fields");
      return;
    }

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        customerId: parseInt(formData.customerId),
        invoiceId: formData.invoiceId ? parseInt(formData.invoiceId) : undefined,
        companyId: authUser?.companyId
      };

      await createCreditNote(payload).unwrap();
      toast.success("Credit note created successfully");
      navigate("/credit-notes");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create credit note");
    }
  };

  return (
    <div className="p-6 lg:p-10 bg-gray-50 dark:bg-[#0b0f14] min-h-screen font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-xl bg-white dark:bg-[#1a1f26] shadow-sm border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#2c323c] transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">New Credit Note</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Create a sales return record for tracking</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-black/40 overflow-hidden relative">
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#976DF7] to-[#7c3aed]" />

          <div className="p-8 lg:p-10 space-y-10">
            
            {/* Section: Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="w-10 h-10 rounded-full bg-[#976DF7]/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#976DF7]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Basic Information</h3>
                  <p className="text-xs text-gray-500 font-medium">Customer details and reference numbers</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Credit Note ID (Read-only) */}
                <div className="space-y-2 group">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    Credit Note Number
                  </label>
                  <div className="relative">
                    <input 
                      value={formData.creditNoteNumber}
                      readOnly
                      className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/20 text-gray-500 font-bold focus:outline-none cursor-not-allowed"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#976DF7] bg-[#976DF7]/10 px-2 py-1 rounded-md">
                      AUTO
                    </div>
                  </div>
                </div>

                {/* Customer Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    Customer <span className="text-[#976DF7]">*</span>
                  </label>
                  <div className="relative group">
                    <UserIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${formData.customerId ? 'text-[#976DF7]' : 'text-gray-400'}`} />
                    <select 
                      className={`w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:ring-2 focus:ring-[#976DF7]/20 focus:border-[#976DF7] group-hover:border-[#976DF7]/50 focus:outline-none transition-all appearance-none font-medium cursor-pointer ${formData.customerId ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}
                      value={formData.customerId}
                      onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                      required
                    >
                      <option value="" className="text-gray-500 bg-white dark:bg-[#1a1f26]">Select Customer</option>
                      {users?.map(u => (
                        <option key={u.id} value={u.id} className="text-gray-900 dark:text-gray-200 bg-white dark:bg-[#1a1f26]">{u.name} ({u.email || u.phone})</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-hover:translate-x-0.5">
                      <ChevronLeft className="w-4 h-4 text-gray-400 -rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Related Invoice (Optional) */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Related Invoice</label>
                  <div className="relative group">
                    <FileText className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${formData.invoiceId ? 'text-[#976DF7]' : 'text-gray-400'}`} />
                    <select 
                      className={`w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:ring-2 focus:ring-[#976DF7]/20 focus:border-[#976DF7] group-hover:border-[#976DF7]/50 focus:outline-none transition-all appearance-none font-medium cursor-pointer ${formData.invoiceId ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}
                      value={formData.invoiceId}
                      onChange={(e) => setFormData({...formData, invoiceId: e.target.value})}
                    >
                      <option value="" className="text-gray-500 bg-white dark:bg-[#1a1f26]">Select Invoice (Optional)</option>
                      {invoices?.map(inv => (
                        <option key={inv.id} value={inv.id} className="text-gray-900 dark:text-gray-200 bg-white dark:bg-[#1a1f26]">{inv.invoiceNumber}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-hover:translate-x-0.5">
                      <ChevronLeft className="w-4 h-4 text-gray-400 -rotate-90" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Financial Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="w-10 h-10 rounded-full bg-[#976DF7]/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[#976DF7]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Financial Details</h3>
                  <p className="text-xs text-gray-500 font-medium">Amount and payment status</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    Refund Amount <span className="text-[#976DF7]">*</span>
                  </label>
                  <div className="relative group">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold group-focus-within:text-[#976DF7] transition-colors">$</span>
                     <input 
                       type="number"
                       placeholder="0.00"
                       className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:ring-2 focus:ring-[#976DF7]/20 focus:border-[#976DF7] focus:outline-none transition-all font-bold text-lg"
                       value={formData.amount}
                       onChange={(e) => setFormData({...formData, amount: e.target.value})}
                       required
                     />
                  </div>
                </div>

                {/* Payment Mode */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Payment Mode</label>
                  <div className="relative group">
                    <CreditCard className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${formData.paymentMode ? 'text-[#976DF7]' : 'text-gray-400'}`} />
                    <select 
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:ring-2 focus:ring-[#976DF7]/20 focus:border-[#976DF7] group-hover:border-[#976DF7]/50 focus:outline-none transition-all appearance-none font-medium cursor-pointer text-gray-900 dark:text-white"
                      value={formData.paymentMode}
                      onChange={(e) => setFormData({...formData, paymentMode: e.target.value})}
                    >
                      <option value="Cash" className="bg-white dark:bg-[#1a1f26]">Cash</option>
                      <option value="Cheque" className="bg-white dark:bg-[#1a1f26]">Cheque</option>
                      <option value="Bank Transfer" className="bg-white dark:bg-[#1a1f26]">Bank Transfer</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-hover:translate-x-0.5">
                      <ChevronLeft className="w-4 h-4 text-gray-400 -rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Initial Status</label>
                  <div className="relative group">
                    <Activity className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${formData.status ? 'text-[#976DF7]' : 'text-gray-400'}`} />
                    <select 
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:ring-2 focus:ring-[#976DF7]/20 focus:border-[#976DF7] group-hover:border-[#976DF7]/50 focus:outline-none transition-all appearance-none font-medium cursor-pointer text-gray-900 dark:text-white"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="Pending" className="bg-white dark:bg-[#1a1f26]">Pending</option>
                      <option value="Paid" className="bg-white dark:bg-[#1a1f26]">Paid</option>
                      <option value="Cancelled" className="bg-white dark:bg-[#1a1f26]">Cancelled</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-hover:translate-x-0.5">
                      <ChevronLeft className="w-4 h-4 text-gray-400 -rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason / Notes */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                   Reason for Return
                </label>
                <textarea 
                  placeholder="Explain the reason for this credit note..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:ring-2 focus:ring-[#976DF7]/20 focus:border-[#976DF7] focus:outline-none transition-all h-32 resize-none font-medium text-gray-700 dark:text-gray-200"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="px-8 py-6 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
             <Button 
               type="button"
               variant="outline" 
               className="px-8 h-12 border-gray-200 dark:border-gray-800 hover:bg-white hover:text-red-500 hover:border-red-200 dark:hover:bg-white/5 font-bold transition-all"
               onClick={() => navigate(-1)}
             >
                Cancel
             </Button>
             <Button 
               type="submit"
               disabled={isLoading}
               className="px-10 h-12 bg-gradient-to-r from-[#976DF7] to-[#7c3aed] hover:shadow-lg hover:shadow-[#976DF7]/25 hover:-translate-y-0.5 text-white font-bold transition-all duration-200"
             >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Credit Note
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCreditNotePage;
