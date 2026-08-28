import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetSystemusersQuery } from "@/features/systemuser/systemuserApiSlice";
import { useImpersonateMerchantMutation } from "@/features/superadminAuth/superadminAuthApiSlice";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  CreditCard,
  Package,
  Shield,
  Palette,
  Bell,
  Truck,
  CheckCircle2,
  XCircle,
  Calendar,
  Layers,
  Pencil,
  LogIn,
} from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const SuperAdminCustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = useMemo(() => Number(id), [id]);
  const [impersonating, setImpersonating] = useState(false);
  const [impersonateMerchant] = useImpersonateMerchantMutation();

  const { data: users = [], isLoading } = useGetSystemusersQuery();

  const user = useMemo(
    () => users.find((u) => String(u.id) === String(numericId)),
    [users, numericId],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">
            Loading customer details...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-24 h-24 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
          <XCircle className="w-12 h-12 text-rose-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Customer Not Found
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">
            The customer you are looking for does not exist or has been removed.
          </p>
        </div>
        <Button
          onClick={() => navigate("/superadmin/customers")}
          className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    );
  }

  // Helper to check config status
  const hasPathao =
    user.pathaoConfig?.clientId && user.pathaoConfig?.clientSecret;
  const hasSteadfast =
    user.steadfastConfig?.apiKey && user.steadfastConfig?.secretKey;
  const hasNotifications =
    user.notificationConfig?.email || user.notificationConfig?.whatsapp;

  return (
    <motion.div
      className="space-y-8 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Simple Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Building2 className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Customer Detail
            </h1>
            <span
              className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border ${
                user.isActive
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                  : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800"
              }`}
            >
              {user.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm md:text-base text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {user.companyName || user.name}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="break-all">{user.email}</span>
            <span className="hidden sm:inline">•</span>
            <span className="font-mono text-xs md:text-sm bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {user.companyId || user.id}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => navigate("/superadmin/customers")}
            variant="outline"
            className="rounded-xl flex-1 sm:flex-none"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={() => navigate(`/superadmin/customers/edit/${user.id}`)}
            className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 dark:shadow-none flex-1 sm:flex-none"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit Customer
          </Button>
          <Button
            disabled={impersonating}
            onClick={async () => {
              setImpersonating(true);
              try {
                const result = await impersonateMerchant({ merchantId: user.id }).unwrap();
                if (result?.accessToken) {
                  sessionStorage.setItem("isImpersonating", "true");
                  sessionStorage.setItem("impersonatedMerchantId", String(user.id));
                  sessionStorage.setItem("accessToken", result.accessToken);
                  window.location.href = "/dashboard";
                }
              } catch (err) {
                console.error("Impersonation failed", err);
              } finally {
                setImpersonating(false);
              }
            }}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 dark:shadow-none flex-1 sm:flex-none"
          >
            <LogIn className="w-4 h-4 mr-2" />
            {impersonating ? "Logging in…" : "Login as Merchant"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column - Main Info */}
        <div className="xl:col-span-2 space-y-6 md:space-y-8">
          {/* Basic Info & Contact */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Business Information
              </h3>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Logo Section */}
              <div className="flex flex-col items-center space-y-3 min-w-[120px]">
                {user.companyLogo ? (
                  <img
                    src={user.companyLogo}
                    alt="Logo"
                    className="w-24 h-24 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <Building2 className="w-10 h-10 text-slate-400" />
                  </div>
                )}
                <span className="text-xs font-mono text-slate-400">
                  ID: {user.companyId || user.id}
                </span>
              </div>

              {/* Details Grid */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Company Name
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white text-base">
                    {user.companyName}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Owner Name
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white text-base">
                    {user.name}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Email Address
                  </p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {user.email}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Phone Number
                  </p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {user.phone || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Domain
                  </p>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <a
                      href={user.domainName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 dark:text-violet-400 font-medium hover:underline"
                    >
                      {user.domainName || "No domain connected"}
                    </a>
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Address
                  </p>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {user.branchLocation || "No location set"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Branding & Theme */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Branding Configuration
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Primary Color
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
                    style={{ backgroundColor: user.primaryColor || "#000000" }}
                  />
                  <span className="font-mono text-sm font-medium">
                    {user.primaryColor || "Default"}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Secondary Color
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
                    style={{
                      backgroundColor: user.secondaryColor || "#000000",
                    }}
                  />
                  <span className="font-mono text-sm font-medium">
                    {user.secondaryColor || "Default"}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Theme ID
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold">
                    {user.themeId || "1"}
                  </div>
                  <span className="text-sm font-medium">
                    {user.themeId
                      ? `Custom Theme #${user.themeId}`
                      : "Default Theme"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Status & Config */}
        <div className="space-y-6 md:space-y-8">
          {/* Subscription Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-slate-400" />
                Subscription Plan
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                  Current Package
                </p>
                <div className="flex justify-between items-start">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                    {user.paymentInfo?.packagename || "No Package"}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      user.paymentInfo?.paymentstatus === "PAID" || user.paymentInfo?.paymentstatus === "Active"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}
                  >
                    {user.paymentInfo?.paymentstatus || "PENDING"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Amount</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    ৳ {user.paymentInfo?.amount || 0}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 mb-1">Payment Method</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {user.paymentInfo?.paymentmethod || "-"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Integrations Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-slate-400" />
                Integrations
              </h3>
            </div>
            <div className="p-2">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors rounded-xl">
                  <div className="flex items-center gap-3">
                    <Truck className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Pathao
                    </span>
                  </div>
                  {hasPathao ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                  )}
                </div>

                <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors rounded-xl">
                  <div className="flex items-center gap-3">
                    <Truck className="w-4 h-4 text-teal-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Steadfast
                    </span>
                  </div>
                  {hasSteadfast ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                  )}
                </div>

                <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors rounded-xl">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-orange-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Notifications
                    </span>
                  </div>
                  {hasNotifications ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Permissions */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-slate-400" />
                Active Permissions
              </h3>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {Array.isArray(user.permissions) &&
                user.permissions.length > 0 ? (
                  user.permissions.map((permission, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700"
                    >
                      {permission}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                    No specific permissions assigned
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      {/* Modal - removed as we now use a separate page */}
    </motion.div>
  );
};

export default SuperAdminCustomerDetailPage;
