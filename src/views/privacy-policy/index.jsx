import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Shield, Calendar, Clock, CheckCircle2, FileText, AlertCircle } from "lucide-react";
import { useGetPrivacyPoliciesQuery } from "@/features/privacy-policy/privacyPolicyApiSlice";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const PrivacyPolicyPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const authUser = useSelector((state) => state.auth.user);
    const { data: policies = [], isLoading } = useGetPrivacyPoliciesQuery({ companyId: authUser?.companyId });

    // Get the latest policy (most recent)
    const latestPolicy = policies.length > 0 ? policies[0] : null;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span className="text-indigo-500 font-medium">
                            {t("nav.contentPolicy")}
                        </span>
                        <span>/</span>
                        <span>{t("privacyPolicy.title")}</span>
                    </div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400 drop-shadow-sm">
                        {t("privacyPolicy.title")}
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">
                        {t("privacyPolicy.manageDesc")}
                    </p>
                </div>
                <div>
                    {latestPolicy ? (
                        <Button
                            onClick={() => navigate("/privacy-policy/edit")}
                            className="rounded-xl h-12 px-8 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            <Pencil className="w-5 h-5 mr-2" />
                            {t("privacyPolicy.edit")}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => navigate("/privacy-policy/create")}
                            className="rounded-xl h-12 px-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            {t("privacyPolicy.create")}
                        </Button>
                    )}
                </div>
            </div>

            {!latestPolicy ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-12 text-center shadow-xl"
                >
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6">
                        <Shield className="w-12 h-12 text-indigo-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">{t("privacyPolicy.noPolicyFound")}</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        {t("privacyPolicy.notFoundDesc")}
                    </p>
                    <Button
                        onClick={() => navigate("/privacy-policy/create")}
                        className="rounded-xl h-12 px-8 bg-black text-white hover:bg-black/80"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        {t("privacyPolicy.create")}
                    </Button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-[#1a1f26] rounded-[24px] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/20"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-lg">
                                    {t("privacyPolicy.contentSectionTitle")}
                                </h3>
                            </div>
                            <div className="p-8">
                                <div
                                    className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-indigo-600 dark:prose-a:text-indigo-400"
                                    dangerouslySetInnerHTML={{ __html: latestPolicy.content || "" }}
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Status Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/20"
                        >
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-emerald-500" />
                                {t("common.status")}
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/20">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                            {t("common.active")}
                                        </span>
                                    </div>
                                    <p className="text-xs text-emerald-600/80 dark:text-emerald-400/70">
                                        {t("privacyPolicy.createdSuccess")}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Meta Info Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-black/20"
                        >
                             <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-violet-500" />
                                {t("common.timeline")}
                            </h3>

                            <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100 dark:before:bg-gray-800">
                                <div className="relative pl-12">
                                    <div className="absolute left-0 top-0 p-2 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-600 border border-white dark:border-[#1a1f26] shadow-sm z-10">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                                            {t("privacyPolicy.lastUpdated")}
                                        </p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {latestPolicy.updatedAt ? new Date(latestPolicy.updatedAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : "-"}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {latestPolicy.updatedAt ? new Date(latestPolicy.updatedAt).toLocaleTimeString() : ""}
                                        </p>
                                    </div>
                                </div>

                                <div className="relative pl-12">
                                    <div className="absolute left-0 top-0 p-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 border border-white dark:border-[#1a1f26] shadow-sm z-10">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                                            {t("privacyPolicy.created")}
                                        </p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {latestPolicy.createdAt ? new Date(latestPolicy.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrivacyPolicyPage;
