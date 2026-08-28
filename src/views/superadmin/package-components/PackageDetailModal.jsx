import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "lucide-react";

const PackageDetailModal = ({ pkg, onClose }) => {
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatPrice = (price) => {
        if (!price) return "0.00";
        return parseFloat(price).toFixed(2);
    };

    return (
        <Dialog open={!!pkg} onOpenChange={(v) => !v && onClose?.()}>
            <DialogContent className="max-h-[600px] overflow-y-auto max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Package Details
                        {pkg?.isFeatured && (
                            <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                Featured
                            </span>
                        )}
                    </DialogTitle>
                </DialogHeader>

                {pkg && (
                    <div className="space-y-6 text-sm">
                        {/* Package Information Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                                    Package Information
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-black/60 dark:text-white/60 mb-1 block">
                                        Package ID
                                    </label>
                                    <p className="font-semibold">{pkg.id}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-black/60 dark:text-white/60 mb-1 block">
                                        Package Name
                                    </label>
                                    <p className="font-semibold">{pkg.name || "-"}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-black/60 dark:text-white/60 mb-1 block">
                                    Description
                                </label>
                                <p className="text-sm leading-relaxed text-black dark:text-white">
                                    {pkg.description || "-"}
                                </p>
                            </div>
                        </div>

                        {/* Pricing Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                                    Pricing
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-black/60 dark:text-white/60 mb-1 block">
                                        Regular Price
                                    </label>
                                    <p className="font-semibold text-lg text-black dark:text-white">
                                        ৳{formatPrice(pkg.price)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-black/60 dark:text-white/60 mb-1 block">
                                        Discount Price
                                    </label>
                                    <p className="font-semibold text-lg text-green-600 dark:text-green-400">
                                        {pkg.discountPrice ? `৳${formatPrice(pkg.discountPrice)}` : "-"}
                                    </p>
                                </div>
                            </div>

                            {pkg.discountPrice && (
                                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                    <label className="text-xs font-medium text-green-700 dark:text-green-400 mb-1 block">
                                        Total Savings
                                    </label>
                                    <p className="font-semibold text-lg text-emerald-600 dark:text-emerald-400">
                                        ৳{formatPrice(parseFloat(pkg.price) - parseFloat(pkg.discountPrice))} 
                                        {" "}
                                        <span className="text-sm">
                                            ({(((parseFloat(pkg.price) - parseFloat(pkg.discountPrice)) / parseFloat(pkg.price)) * 100).toFixed(0)}% off)
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Theme Section */}
                        {pkg.theme && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                                    <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                                        Theme Details
                                    </h3>
                                </div>
                                <div className="overflow-hidden border border-gray-100 dark:border-gray-800 rounded-lg">
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y divide-black/10 dark:divide-white/10">
                                            <tr className="hover:bg-black/5 dark:hover:bg-white/5">
                                                <td className="px-4 py-2 font-medium text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5">
                                                    Theme ID
                                                </td>
                                                <td className="px-4 py-2 font-semibold">
                                                    {pkg.theme.id}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-black/5 dark:hover:bg-white/5">
                                                <td className="px-4 py-2 font-medium text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5">
                                                    Domain URL
                                                </td>
                                                <td className="px-4 py-2 font-semibold">
                                                    {pkg.theme.domainUrl || "-"}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-black/5 dark:hover:bg-white/5">
                                                <td className="px-4 py-2 font-medium text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5">
                                                    Logo Color Code
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center gap-2">
                                                        {pkg.theme.logoColorCode ? (
                                                            <>
                                                                <div
                                                                    className="w-6 h-6 rounded border border-black/20 dark:border-white/20"
                                                                    style={{ backgroundColor: pkg.theme.logoColorCode }}
                                                                ></div>
                                                                <span className="font-semibold">{pkg.theme.logoColorCode}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-black/40 dark:text-white/40">-</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-black/5 dark:hover:bg-white/5">
                                                <td className="px-4 py-2 font-medium text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5">
                                                    Created At
                                                </td>
                                                <td className="px-4 py-2 text-xs">
                                                    {formatDate(pkg.theme.createdAt)}
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-black/5 dark:hover:bg-white/5">
                                                <td className="px-4 py-2 font-medium text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5">
                                                    Last Updated
                                                </td>
                                                <td className="px-4 py-2 text-xs">
                                                    {formatDate(pkg.theme.updatedAt)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Features Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                                    Features ({pkg.features?.length || 0})
                                </h3>
                            </div>
                            <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-3 bg-black/5 dark:bg-white/5 max-h-[200px] overflow-y-auto">
                                {pkg.features && pkg.features.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {pkg.features.map((feature, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 text-xs"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                                <span>{feature.replace(/_/g, " ")}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-black/50 dark:text-white/50 text-center py-2">
                                        No features listed
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Timeline Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                                    Timeline
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-black/60 dark:text-white/60 mb-1 block">
                                        Created At
                                    </label>
                                    <p className="text-xs">{formatDate(pkg.createdAt)}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-black/60 dark:text-white/60 mb-1 block">
                                        Last Updated
                                    </label>
                                    <p className="text-xs">{formatDate(pkg.updatedAt)}</p>
                                </div>
                            </div>

                            {pkg.deletedAt && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                        This package was deleted on {formatDate(pkg.deletedAt)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PackageDetailModal;
