import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCreateHelpMutation } from "@/features/help/helpApiSlice";
import { ArrowLeft, Sparkles, ShieldCheck, Activity, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const MaterialIcon = ({ children, className = "", filled = false }) => (
  <span
    className={`material-symbols-outlined select-none ${className}`}
    style={{
      fontVariationSettings: `"FILL" ${filled ? 1 : 0}, "wght" 400, "GRAD" 0, "opsz" 24`,
    }}
  >
    {children}
  </span>
);

const SuperAdminSupportCreatePage = () => {
  const navigate = useNavigate();
  const [createHelp, { isLoading: isCreating }] = useCreateHelpMutation();

  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("General");

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !subject.trim()) {
      toast.error("Please fill in all required fields (Email and Subject).");
      return;
    }

    try {
      const issuePayload = `${subject.trim()}\n\n${description.trim()}`;
      const res = await createHelp({
        email: email.trim(),
        issue: issuePayload,
        priority,
        category,
        tags: [category],
        attachments: [],
      });
      if (res?.data || !res?.error) {
        toast.success("Support ticket created successfully.");
        navigate("/superadmin/support");
      } else {
        toast.error(res?.error?.data?.message || "Failed to create support ticket.");
      }
    } catch (err) {
      toast.error(err?.message || "An unexpected error occurred.");
    }
  };

  const handleDiscard = () => {
    setEmail("");
    setSubject("");
    setDescription("");
    setPriority("medium");
    setCategory("General");
    toast.success("Form discarded.");
    navigate("/superadmin/support");
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 pb-16">
      {/* Header and Breadcrumbs */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 mb-2">
            <span 
              onClick={() => navigate("/superadmin/support")}
              className="text-[12px] font-semibold tracking-[0.05em] text-[#777587] uppercase cursor-pointer hover:text-[#3525cd] transition-colors"
            >
              Support
            </span>
            <span className="material-symbols-outlined text-[14px] text-[#777587]">chevron_right</span>
            <span className="text-[12px] font-semibold tracking-[0.05em] text-[#3525cd] uppercase">Initialize Ticket</span>
          </nav>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/superadmin/support")}
              className="rounded-full h-10 w-10 border-[#eae6f4] hover:bg-[#f0ecf9] transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-[#1b1b24]" />
            </Button>
            <div>
              <h3 className="text-[32px] md:text-[40px] font-bold tracking-[-0.02em] text-[#1b1b24] leading-tight">
                Create Support Ticket
              </h3>
              <p className="text-[16px] text-[#777587] mt-1 max-w-2xl font-normal leading-relaxed">
                Manually record or dispatch a merchant inquiry into the active support nexus.
              </p>
            </div>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleDiscard}
            className="h-11 px-5 rounded-xl border-[#eae6f4] text-[#1b1b24] hover:bg-[#f8f9fc] hover:text-[#ef4444] transition-all font-semibold"
          >
            Discard
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isCreating}
            className="h-11 px-6 rounded-xl bg-[#3525cd] text-white hover:bg-[#3525cd]/90 transition-all font-semibold shadow-lg shadow-[#3525cd]/20"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 mr-2 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Ticket"
            )}
          </Button>
        </div>
      </section>

      {/* Main Bento Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left main form card */}
        <div className="lg:col-span-8 bg-white border-2 border-[#eae6f4] rounded-[40px] p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-[#f0ecf9] pb-4 mb-6">
              <h4 className="text-[20px] font-semibold text-[#1b1b24] flex items-center gap-2">
                <MaterialIcon className="text-[#3525cd]">confirmation_number</MaterialIcon>
                Ticket Information
              </h4>
            </div>

            <div className="space-y-4">
              {/* Customer Email */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#777587] tracking-wider uppercase">
                  Customer Email <span className="text-[#ef4444]">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#777587] text-[20px]">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@store.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-2xl border-2 border-[#eae6f4] bg-[#f8f9fc] text-[#1b1b24] focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] outline-none text-[14px] font-medium transition-all"
                  />
                </div>
              </div>

              {/* Issue / Subject */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#777587] tracking-wider uppercase">
                  Issue / Subject <span className="text-[#ef4444]">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#777587] text-[20px]">
                    subject
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Brief summary of the issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-2xl border-2 border-[#eae6f4] bg-[#f8f9fc] text-[#1b1b24] focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] outline-none text-[14px] font-medium transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#777587] tracking-wider uppercase">
                  Detailed Description
                </label>
                <textarea
                  rows={6}
                  placeholder="Provide comprehensive details about the anomaly, reproduction steps, or log error payloads..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-[#eae6f4] bg-[#f8f9fc] text-[#1b1b24] focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] outline-none text-[14px] font-medium resize-none transition-all leading-relaxed"
                />
              </div>

              {/* Select fields row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-[#777587] tracking-wider uppercase">
                    Priority Tier
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#777587] text-[20px]">
                      priority_high
                    </span>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 rounded-2xl border-2 border-[#eae6f4] bg-[#f8f9fc] text-[#1b1b24] focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] outline-none text-[14px] font-medium transition-all appearance-none cursor-pointer"
                    >
                      <option value="low">Low (Standard SLA)</option>
                      <option value="medium">Medium (4 Hours SLA)</option>
                      <option value="high">High (2 Hours SLA)</option>
                      <option value="critical">Critical (Immediate SLA)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#777587] pointer-events-none">
                      unfold_more
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-[#777587] tracking-wider uppercase">
                    Support Category
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#777587] text-[20px]">
                      category
                    </span>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 rounded-2xl border-2 border-[#eae6f4] bg-[#f8f9fc] text-[#1b1b24] focus:ring-2 focus:ring-[#3525cd]/20 focus:border-[#3525cd] outline-none text-[14px] font-medium transition-all appearance-none cursor-pointer"
                    >
                      <option value="General">General Inquiries</option>
                      <option value="Billing">Billing & Packages</option>
                      <option value="Technical">Technical Bug reports</option>
                      <option value="Hardware">Hardware & POS Issues</option>
                      <option value="Account">Account Security</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#777587] pointer-events-none">
                      unfold_more
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Right sidebar column */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Helper Tip Card */}
          <div className="bg-gradient-to-br from-[#3525cd]/5 to-[#3525cd]/10 border-2 border-[#3525cd]/10 rounded-[32px] p-6 text-[#1b1b24]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-[#3525cd]/10 text-[#3525cd]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h5 className="text-[16px] font-bold text-[#3525cd]">Operator Tips</h5>
            </div>
            <ul className="space-y-3 text-[13px] text-[#464555] font-medium list-disc list-inside leading-relaxed">
              <li>
                Verify that the merchant email matches an active account to link their history.
              </li>
              <li>
                Use concise subject lines that describe the exact anomaly or system affected.
              </li>
              <li>
                Higher priority tickets trigger instant Slack/Discord webhook alerts to on-duty engineering squads.
              </li>
            </ul>
          </div>

          {/* System Status Indicators */}
          <div className="bg-white border-2 border-[#eae6f4] rounded-[32px] p-6 space-y-6">
            <h5 className="text-[18px] font-bold text-[#1b1b24]">System Context</h5>

            {/* SLA status */}
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-[#10b981]/10 text-[#10b981] mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#1b1b24]">SLA Compliance</p>
                <p className="text-[12px] text-[#777587] mt-0.5">
                  Currently running at <span className="font-bold text-[#10b981]">99.8%</span> target compliance.
                </p>
              </div>
            </div>

            {/* Load indicator */}
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-[#f59e0b]/10 text-[#f59e0b] mt-0.5">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#1b1b24]">Regional Dispatch Load</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[12px] font-bold text-[#f59e0b] uppercase bg-[#f59e0b]/10 px-2 py-0.5 rounded-md">
                    Moderate Load
                  </span>
                  <span className="text-[12px] text-[#777587]">avg wait ~8 mins</span>
                </div>
              </div>
            </div>

            {/* Online experts count */}
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-[#3525cd]/10 text-[#3525cd] mt-0.5">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#1b1b24]">Active Responders</p>
                <p className="text-[12px] text-[#777587] mt-0.5">
                  <span className="font-bold text-[#3525cd]">84 technicians</span> currently online across routing regions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSupportCreatePage;
