import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
    ArrowLeft, 
    Edit, 
    Globe, 
    Palette, 
    Calendar,
    Hash,
    Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGetThemeQuery } from "@/features/theme/themeApiSlice";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const ThemeDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: theme, isLoading, error } = useGetThemeQuery(id);

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
        );
    }

    if (error || !theme) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4">
                <p className="text-red-500">Failed to load theme details</p>
                <Button onClick={() => navigate("/superadmin/themes")}>
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            className="space-y-6 pb-12 max-w-[1600px] mx-auto p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate("/superadmin/themes")}
                        className="rounded-full h-10 w-10 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </Button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Theme Details
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                            View detailed information about this theme.
                        </p>
                    </div>
                </div>
                {/* Future: Add Edit Button here if needed */}
                {/* <Button
                    onClick={() => navigate(`/superadmin/themes/${id}/edit`)}
                    className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20"
                >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Theme
                </Button> */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Basic Info */}
                <motion.div 
                    variants={itemVariants} 
                    className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6"
                >
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
                            <Palette className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                            Theme Information
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                                    <Hash className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wider">Theme ID</span>
                                </div>
                                <p className="font-mono text-sm text-slate-700 dark:text-slate-300 break-all">
                                    {theme.id}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                                    <Globe className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wider">Domain URL</span>
                                </div>
                                {theme.domainUrl ? (
                                    <a
                                        href={theme.domainUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium break-all"
                                    >
                                        {theme.domainUrl}
                                    </a>
                                ) : (
                                    <p className="text-sm text-slate-400">-</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Colors</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div
                                        className="w-10 h-10 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 ring-2 ring-white dark:ring-slate-900"
                                        style={{ backgroundColor: theme.primaryColorCode }}
                                    ></div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Primary Color</p>
                                        <p className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {theme.primaryColorCode || "-"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div
                                        className="w-10 h-10 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 ring-2 ring-white dark:ring-slate-900"
                                        style={{ backgroundColor: theme.secondaryColorCode }}
                                    ></div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Secondary Color</p>
                                        <p className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {theme.secondaryColorCode || "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Logo & Meta */}
                <motion.div 
                    variants={itemVariants} 
                    className="space-y-6"
                >
                    {/* Logo Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                                <Globe className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                Logo Preview
                            </h3>
                        </div>
                        
                        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-8 bg-slate-50 dark:bg-slate-900 flex items-center justify-center relative group overflow-hidden min-h-[200px]">
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,#00000005_25%,transparent_25%,transparent_75%,#00000005_75%,#00000005),linear-gradient(45deg,#00000005_25%,transparent_25%,transparent_75%,#00000005_75%,#00000005)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]"></div>
                            {theme.logo ? (
                                <img
                                    src={theme.logo}
                                    alt="Theme Logo"
                                    className="max-h-40 max-w-full object-contain relative z-10 drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = '<p class="text-sm text-rose-500 flex items-center gap-2">Failed to load logo image</p>';
                                    }}
                                />
                            ) : (
                                <div className="text-slate-400 text-sm flex flex-col items-center gap-2 z-10">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                        <Globe className="w-6 h-6 text-slate-400" />
                                    </div>
                                    No logo uploaded
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                Timestamps
                            </h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800/50">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Created At</span>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {formatDate(theme.createdAt)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Last Updated</span>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {formatDate(theme.updatedAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ThemeDetailPage;
