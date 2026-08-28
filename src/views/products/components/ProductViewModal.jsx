import React from "react";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export default function ProductViewModal({ product }) {
    const { t } = useTranslation();
    if (!product) return null;

    const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
    const otherImages = product.images?.filter((img) => !img.isPrimary) || [];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                    title={t("common.view")}
                >
                    <Eye className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("products.productDetails")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                                {t("products.basicInformation")}
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-black/70 dark:text-white/70">{t("common.name")}</label>
                                <p className="text-base text-black dark:text-white mt-1">{product.name || product.title || "-"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-black/70 dark:text-white/70">{t("products.sku")}</label>
                                <p className="text-base text-black dark:text-white mt-1">{product.sku || "-"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-black/70 dark:text-white/70">{t("products.category")}</label>
                                <p className="text-base text-black dark:text-white mt-1">
                                    {product.category?.name || "-"}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-black/70 dark:text-white/70">{t("common.status")}</label>
                                <p className="text-base text-black dark:text-white mt-1">
                                    <span
                                        className={`px-2 py-1 rounded text-sm ${product.isActive
                                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                            }`}
                                    >
                                        {product.isActive ? t("common.active") : t("common.disabled")}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div>
                                <label className="text-sm font-medium text-black/70 dark:text-white/70">
                                    {t("products.description")}
                                </label>
                                <p className="text-base text-black dark:text-white mt-1 whitespace-pre-wrap">
                                    {product.description}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pricing Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                                {t("products.pricing")}
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-black/70 dark:text-white/70">{t("products.price")}</label>
                                <p className="text-base text-black dark:text-white mt-1">
                                    {typeof product.price === "number"
                                        ? `$${product.price.toFixed(2)}`
                                        : product.price || "-"}
                                </p>
                            </div>
                            {product.discountPrice && (
                                <div>
                                    <label className="text-sm font-medium text-black/70 dark:text-white/70">
                                        {t("products.discountPrice")}
                                    </label>
                                    <p className="text-base text-green-600 dark:text-green-400 mt-1 font-semibold">
                                        ${typeof product.discountPrice === "number"
                                            ? product.discountPrice.toFixed(2)
                                            : product.discountPrice}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Images & Media Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                                {t("products.imagesAndMedia")}
                            </h3>
                        </div>

                        {/* Thumbnail */}
                        {product.thumbnail && (
                            <div>
                                <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
                                    {t("products.thumbnail")}
                                </label>
                                <div className="border border-black/5 dark:border-gray-800 rounded-md overflow-hidden">
                                    <img
                                        src={product.thumbnail}
                                        alt={t("products.productThumbnailAlt")}
                                        className="w-full h-64 object-cover"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Primary Image */}
                        {primaryImage && (
                            <div>
                                <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
                                    {t("products.primaryImage")}
                                </label>
                                <div className="border border-black/5 dark:border-gray-800 rounded-md overflow-hidden">
                                    <img
                                        src={primaryImage.url}
                                        alt={primaryImage.alt || t("products.primaryProductImageAlt")}
                                        className="w-full h-64 object-cover"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                        }}
                                    />
                                    {primaryImage.alt && (
                                        <p className="p-2 text-xs text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5">
                                            {primaryImage.alt}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Other Images */}
                        {otherImages.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
                                    {t("products.additionalImages")} ({otherImages.length})
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    {otherImages.map((img, index) => (
                                        <div
                                            key={index}
                                            className="border border-black/5 dark:border-gray-800 rounded-md overflow-hidden"
                                        >
                                            <img
                                                src={img.url}
                                                alt={img.alt || `${t("products.productImageAlt")} ${index + 1}`}
                                                className="w-full h-48 object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = "none";
                                                }}
                                            />
                                            {img.alt && (
                                                <p className="p-2 text-xs text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5">
                                                    {img.alt}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Images (if no primary/secondary distinction) */}
                        {product.images && product.images.length > 0 && !primaryImage && (
                            <div>
                                <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
                                    {t("products.productImages")} ({product.images.length})
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    {product.images.map((img, index) => (
                                        <div
                                            key={index}
                                            className="border border-black/5 dark:border-gray-800 rounded-md overflow-hidden"
                                        >
                                            <img
                                                src={img.url}
                                                alt={img.alt || `${t("products.productImageAlt")} ${index + 1}`}
                                                className="w-full h-48 object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = "none";
                                                }}
                                            />
                                            {img.alt && (
                                                <p className="p-2 text-xs text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5">
                                                    {img.alt}
                                                </p>
                                            )}
                                            {img.isPrimary && (
                                                <p className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                                    {t("products.primary")}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

