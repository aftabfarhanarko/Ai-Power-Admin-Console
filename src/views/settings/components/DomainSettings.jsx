import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Copy, 
  Server, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  RefreshCw,
  XCircle,
  Link as LinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSelector } from "react-redux";
import { 
  useAddCustomDomainMutation,
  useGetDomainQuery,
  useVerifyDomainMutation,
  useToggleSubdomainMutation,
} from "@/features/devops/devopsApiSlice";
import { motion, AnimatePresence } from "framer-motion";

const DomainSettings = ({ user: userFromApi }) => {
  const { t } = useTranslation();
  const [addCustomDomain, { isLoading: isAddingDomain }] = useAddCustomDomainMutation();
  const [verifyDomain, { isLoading: isVerifying }] = useVerifyDomainMutation();
  const [toggleSubdomain, { isLoading: isToggling }] = useToggleSubdomainMutation();
  
  // Fetch domain info from API
  const { data: domainData, refetch: refetchDomain, isLoading: isLoadingDomain } = useGetDomainQuery();
  
  const authUser = useSelector((state) => state.auth.user);
  const user = userFromApi ?? authUser ?? null;
  const tenantId = user?.tenantId || user?.companyId;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      domain: "",
    },
  });

  // Watch domain value for conditional UI
  const currentDomainValue = watch("domain");

  // Update form when domain data changes
  useEffect(() => {
    if (domainData) {
      reset({ domain: domainData.customDomain ?? "" });
    } else if (user?.customDomain) {
      reset({ domain: user.customDomain ?? "" });
    }
  }, [domainData, user?.customDomain, reset]);

  const onSubmit = async (data) => {
    if (!tenantId) {
      toast.error(t("settings.tenantMissing") || "Missing tenant information.");
      return;
    }

    try {
      const res = await addCustomDomain({
        id: tenantId,
        domain: data.domain,
      }).unwrap();
      toast.success(res?.message || t("settings.domainConnected") || "Domain connected successfully!");
      refetchDomain(); // Refresh domain data
    } catch (error) {
      toast.error(error?.data?.message || t("settings.domainConnectFailed") || "Failed to connect domain");
    }
  };

  const handleVerifyDomain = async () => {
    try {
      const res = await verifyDomain().unwrap();
      if (res.success) {
        toast.success(res.message || "Domain verified successfully!");
        // Wait a bit then refetch to get updated status
        setTimeout(() => {
          refetchDomain();
        }, 500);
      } else {
        toast.error(res.message || "Domain verification failed. Please check your DNS settings.");
      }
    } catch (error) {
      console.error('Verify domain error:', error);
      const errorMessage = error?.data?.message || error?.message || "Failed to verify domain";
      toast.error(errorMessage);
      // Still refetch to get latest status
      setTimeout(() => {
        refetchDomain();
      }, 500);
    }
  };

  const handleToggleSubdomain = async (enabled) => {
    try {
      await toggleSubdomain(enabled).unwrap();
      toast.success(enabled ? "Platform subdomain enabled" : "Platform subdomain disabled");
      refetchDomain();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update subdomain settings");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium text-sm">Active & Secure</span>
          </div>
        );
      case 'pending_dns':
      case 'pending':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium text-sm">Pending DNS</span>
          </div>
        );
      case 'verified':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-medium text-sm">Verified</span>
          </div>
        );
      case 'ssl_provisioning':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-800">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium text-sm">SSL Provisioning</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-800">
            <XCircle className="w-5 h-5" />
            <span className="font-medium text-sm">Verification Failed</span>
          </div>
        );
      default:
        return null;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const subdomain = domainData?.subdomain || user?.subdomain;
  const subdomainEnabled = domainData?.subdomainEnabled ?? true;
  const customDomain = domainData?.customDomain || user?.customDomain;
  const customDomainStatus = domainData?.customDomainStatus || user?.customDomainStatus || 'pending';
  const verificationRequired = domainData?.verificationRequired;
  const txtVerification = domainData?.txtVerification;
  const mainDomain = "console.squadcart.app";
  const fullSubdomain = domainData?.platformSubdomain || (subdomain ? `${subdomain}.${mainDomain}` : null);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
              <Globe className="h-6 w-6" />
            </div>
            Domain Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 ml-14">
            Manage your subdomain and connect your custom domain for a professional store URL.
          </p>
        </div>
        
        {customDomain && getStatusBadge(customDomainStatus)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Configuration */}
        <div className="xl:col-span-2 space-y-6">
          {/* Subdomain Card */}
          {subdomain && (
            <div className="rounded-[24px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] shadow-xl overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-violet-500" />
                    Platform Subdomain
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${subdomainEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`}>
                      {subdomainEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleSubdomain(!subdomainEnabled)}
                      disabled={isToggling}
                      className="h-8"
                    >
                      {isToggling ? <Loader2 className="w-4 h-4 animate-spin" /> : subdomainEnabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-6 md:p-8 space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-xl border border-violet-100 dark:border-violet-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                      <Globe className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Your Subdomain URL</p>
                      <p className="font-mono font-bold text-lg text-gray-900 dark:text-white">
                        {fullSubdomain ? (
                          <a 
                            href={`https://${fullSubdomain}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors flex items-center gap-2"
                          >
                            {fullSubdomain}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          `https://${subdomain}.${mainDomain}`
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(fullSubdomain || `${subdomain}.${mainDomain}`)}
                    className="shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-900 dark:text-white">Auto-deployed on Railway:</strong> Your subdomain is automatically provisioned and ready to use. 
                    Railway will handle SSL certificates automatically once DNS wildcard is configured.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Custom Domain Card */}
          <div className="rounded-[24px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] shadow-xl overflow-hidden">
            <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-violet-500" />
                Custom Domain
              </h3>
            </div>
            
            <div className="p-6 md:p-8 space-y-8">
              {/* Connection Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                    Your Domain Name
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 pr-3 mr-3">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">https://</span>
                      </div>
                      <Input
                        {...register("domain", {
                          required: t("settings.domainRequired") || "Domain is required",
                          pattern: {
                            value: /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/,
                            message: t("settings.invalidDomain") || "Invalid domain format",
                          },
                        })}
                        placeholder="yourstore.com"
                        className="h-12 pl-[110px] bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-violet-500/20 w-full"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={isAddingDomain || isLoadingDomain}
                        className="h-12 px-6 rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25 transition-all"
                      >
                        {isAddingDomain ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                        {customDomain ? "Update" : "Connect"}
                      </Button>
                      {customDomain && (
                        <Button
                          type="button"
                          variant={['pending_dns', 'pending'].includes(customDomainStatus) ? "outline" : "secondary"}
                          onClick={handleVerifyDomain}
                          disabled={isVerifying || isLoadingDomain}
                          className={`h-12 px-6 rounded-xl ${
                            ['pending_dns', 'pending'].includes(customDomainStatus)
                              ? 'border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20' 
                              : ''
                          }`}
                        >
                          {isVerifying ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-2 h-5 w-5" />
                              {['pending_dns', 'pending'].includes(customDomainStatus) ? 'Check verification' : 'Re-verify'}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  {errors.domain && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-2 ml-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.domain.message}
                    </p>
                  )}
                </div>
              </form>

              {/* DNS Instructions */}
              {customDomain && (
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                      <Server className="w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">DNS Configuration Required</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {verificationRequired?.note || 
                            "To connect your domain, you need to add a CNAME record in your DNS provider's settings pointing to Railway."}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 bg-white dark:bg-[#1a1f26] rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm">
                          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Type</p>
                          <p className="font-mono font-medium text-gray-900 dark:text-white">
                            {verificationRequired?.type || 'CNAME'}
                          </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-[#1a1f26] rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm">
                          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Name / Host</p>
                          <p className="font-mono font-medium text-gray-900 dark:text-white">
                            {verificationRequired?.host || '@ / www'}
                          </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-[#1a1f26] rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm relative group sm:col-span-2 lg:col-span-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="overflow-hidden flex-1">
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Value / Target</p>
                              <p 
                                className="font-mono font-medium text-violet-600 dark:text-violet-400 truncate" 
                                title={verificationRequired?.value || 'your-service.up.railway.app'}
                              >
                                {verificationRequired?.value || 'your-service.up.railway.app'}
                              </p>
                            </div>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-gray-400 hover:text-violet-600 shrink-0"
                              onClick={() => copyToClipboard(verificationRequired?.value || 'your-service.up.railway.app')}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* TXT record for automatic verification */}
                      {txtVerification && (
                        <div className="mt-4 p-4 bg-violet-50 dark:bg-violet-900/10 rounded-xl border border-violet-200 dark:border-violet-800">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">TXT record (ownership verification)</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {txtVerification.note || 'Add this TXT record; verification runs automatically every few minutes.'}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-3 bg-white dark:bg-[#1a1f26] rounded-lg border border-gray-200 dark:border-gray-700">
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Name / Host</p>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-sm text-gray-900 dark:text-white break-all">{txtVerification.fullName || txtVerification.name}</p>
                                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => copyToClipboard(txtVerification.fullName || txtVerification.name)}>
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="p-3 bg-white dark:bg-[#1a1f26] rounded-lg border border-gray-200 dark:border-gray-700">
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Value</p>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-sm text-violet-600 dark:text-violet-400 break-all">{txtVerification.value}</p>
                                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => copyToClipboard(txtVerification.value)}>
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {['pending_dns', 'pending'].includes(customDomainStatus) && (
                        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-2">
                                Add DNS records
                              </p>
                              <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                                Add the <strong>CNAME</strong> (and <strong>TXT</strong> if shown) at your DNS provider. Verification runs automatically every few minutes, or click <strong>&quot;Check verification&quot;</strong> to run it now. SSL will be provisioned automatically once verified.
                              </p>
                              <div className="bg-white dark:bg-[#1a1f26] rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                                <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 mb-2">Quick steps:</p>
                                <ol className="text-xs text-amber-700 dark:text-amber-300 space-y-1 list-decimal list-inside">
                                  <li>Add CNAME: www → value above</li>
                                  {txtVerification && <li>Add TXT: name and value above</li>}
                                  <li>Wait a few minutes for DNS propagation</li>
                                  <li>Verification and SSL will activate automatically</li>
                                </ol>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {customDomainStatus === 'failed' && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800">
                          <div className="flex items-start gap-3">
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">
                                Domain Verification Failed
                              </p>
                              <p className="text-sm text-red-700 dark:text-red-300">
                                DNS verification failed. Please check that your DNS records are correctly configured and try verifying again.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Info & Help */}
        <div className="xl:col-span-1 space-y-6">
          {/* Status Card */}
          <div className="rounded-[24px] bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold">SSL Certificate</h3>
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              Railway automatically provisions and renews SSL certificates for all connected domains (both subdomains and custom domains) to ensure your store is secure.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium bg-white/10 p-3 rounded-lg border border-white/10">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Auto-Renewal Enabled</span>
            </div>
          </div>

          {/* Subdomain Info Card */}
          {subdomain && (
            <div className="rounded-[24px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] p-6 shadow-lg">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-violet-500" />
                Subdomain Info
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Subdomain Slug</p>
                  <p className="font-mono font-medium text-gray-900 dark:text-white">{subdomain}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Full URL</p>
                  <p className="font-mono text-sm text-violet-600 dark:text-violet-400 break-all">
                    {fullSubdomain || `${subdomain}.${mainDomain}`}
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-xs text-gray-500 mb-2">Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${subdomainEnabled ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {subdomainEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Help Card */}
          <div className="rounded-[24px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] p-6 shadow-lg">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Need Help?</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 transition-colors cursor-pointer group">
                <div className="mt-0.5 p-1 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 transition-colors">
                  <ArrowRight className="w-3 h-3 group-hover:text-violet-600" />
                </div>
                <span>How to configure Railway DNS</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 transition-colors cursor-pointer group">
                <div className="mt-0.5 p-1 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 transition-colors">
                  <ArrowRight className="w-3 h-3 group-hover:text-violet-600" />
                </div>
                <span>Troubleshooting connection issues</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 transition-colors cursor-pointer group">
                <div className="mt-0.5 p-1 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 transition-colors">
                  <ArrowRight className="w-3 h-3 group-hover:text-violet-600" />
                </div>
                <span>SSL certificate setup</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DomainSettings;
