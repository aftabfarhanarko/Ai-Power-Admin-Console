import React, { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Package, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useCreatePackageMutation } from "@/features/package/packageApiSlice";
import { useGetThemesQuery } from "@/features/theme/themeApiSlice";

const FEATURE_DISPLAY_NAMES = {
    PATHAO: "Pathao Courier",
    STEADFAST: "Steadfast Courier",
    REDX: "RedX Courier",
    LOG_ACTIVITY: "Activity Logs (SquadLog)",
    SUPERADMIN_EARNINGS: "Superadmin Earnings",
    SUPERADMIN_STATISTICS: "Superadmin Statistics",
    AI_REPORT: "AI Report",
    AI_LIVE_FEED: "AI Live Feed",
    AI_SALES_DIRECTION: "AI Sales Direction",
    PRODUCT_BULK_UPLOAD: "Product Bulk Upload",
    INVENTORY_MANAGEMENT: "Inventory Management",
    INVENTORY_HISTORY: "Inventory History",
    FLASH_SELL: "Flash Sell (Console)",
    MEDIA_MANAGEMENT: "Media Management",
    BANNER_MANAGEMENT: "Banner Management",
    BANNERS_OFFERS_MARKETING: "Banners & Offers (Marketing)",
    ORDER_INVOICE_FINANCE: "Order, Invoice & Finance",
    ORDER_CREATION_MANUAL: "Order Creation (Manual)",
    ORDER_TRACKING: "Order Tracking (Console)",
    ORDER_EDIT: "Order Edit",
    SALE_INVOICE_MANAGEMENT: "Sale Invoice Management",
    POLICY_LEGAL_CONTENT: "Policy & Legal Content",
    PRIVACY_POLICY_MANAGEMENT: "Privacy Policy Management",
    TERMS_CONDITIONS_MANAGEMENT: "Terms & Conditions Management",
    REFUND_POLICY_MANAGEMENT: "Refund Policy Management",
    INTEGRATIONS_SETTINGS: "Integrations & Settings",
    CONNECTED_APPS: "Connected Apps",
    COURIER_INTEGRATION_SETTINGS: "Courier Integration Settings",
    NOTIFICATION_SETTINGS: "Notification Settings",
    THEME_MANAGEMENT: "Theme Management",
    CUSTOM_DOMAIN: "Custom Domain",
};

const getFeatureDisplayName = (feature) =>
    FEATURE_DISPLAY_NAMES[feature] || feature.replace(/_/g, " ");

const AVAILABLE_FEATURES = [
    "PRODUCTS",
    "ORDERS",
    "STEADFAST",
    "PATHAO",
    "REDX",
    "NOTIFICATIONS",
    "EMAIL_NOTIFICATIONS",
    "WHATSAPP_NOTIFICATIONS",
    "SMS_NOTIFICATIONS",
    "ORDERS_ITEM",
    "CATEGORY",
    "CUSTOMERS",
    "REPORTS",
    "SETTINGS",
    "STAFF",
    "SMS_CONFIGURATION",
    "EMAIL_CONFIGURATION",
    "PAYMENT_METHODS",
    "PAYMENT_GATEWAYS",
    "PAYMENT_STATUS",
    "PAYMENT_TRANSACTIONS",
    "PROMOCODES",
    "HELP",
    "BANNERS",
    "FRUAD_CHECKER",
    "MANAGE_USERS",
    "DASHBOARD",
    "REVENUE",
    "NEW_CUSTOMERS",
    "REPEAT_PURCHASE_RATE",
    "AVERAGE_ORDER_VALUE",
    "STATS",
    "LOG_ACTIVITY",
    "REVIEW",
    "PATHAO_COURIER",
    "STEADFAST_COURIER",
    "REDX_COURIER",
    "PATHAO_COURIER_CONFIGURATION",
    "STEADFAST_COURIER_CONFIGURATION",
    "REDX_COURIER_CONFIGURATION",
    // New granular superadmin & AI features
    "SUPERADMIN_EARNINGS",
    "SUPERADMIN_STATISTICS",
    "AI_REPORT",
    "AI_LIVE_FEED",
    "AI_SALES_DIRECTION",
    // Catalog, inventory & promos
    "PRODUCT_BULK_UPLOAD",
    "INVENTORY_MANAGEMENT",
    "INVENTORY_HISTORY",
    "FLASH_SELL",
    "MEDIA_MANAGEMENT",
    "BANNER_MANAGEMENT",
    "BANNERS_OFFERS_MARKETING",
    // Orders, invoices & finance
    "ORDER_INVOICE_FINANCE",
    "ORDER_CREATION_MANUAL",
    "ORDER_TRACKING",
    "ORDER_EDIT",
    "SALE_INVOICE_MANAGEMENT",
    // Policy & legal content
    "POLICY_LEGAL_CONTENT",
    "PRIVACY_POLICY_MANAGEMENT",
    "TERMS_CONDITIONS_MANAGEMENT",
    "REFUND_POLICY_MANAGEMENT",
    // Integrations & settings
    "INTEGRATIONS_SETTINGS",
    "CONNECTED_APPS",
    "COURIER_INTEGRATION_SETTINGS",
    "NOTIFICATION_SETTINGS",
    "THEME_MANAGEMENT",
    "CUSTOM_DOMAIN",
];

const schema = yup.object().shape({
    name: yup
        .string()
        .required("Package name is required")
        .min(2, "Name must be at least 2 characters"),
    description: yup
        .string()
        .required("Description is required")
        .min(10, "Description must be at least 10 characters"),
    price: yup
        .number()
        .required("Price is required")
        .positive("Price must be positive")
        .typeError("Price must be a number"),
    discountPrice: yup
        .number()
        .nullable()
        .positive("Discount price must be positive")
        .typeError("Discount price must be a number")
        .test("is-less-than-price", "Discount price must be less than price", function (value) {
            const { price } = this.parent;
            if (!value) return true;
            return value < price;
        }),
});

const PackageCreateForm = () => {
    const [open, setOpen] = useState(false);
    const [createPackage, { isLoading }] = useCreatePackageMutation();
    const { data: themes = [], isLoading: isLoadingThemes } = useGetThemesQuery();
    const [features, setFeatures] = useState(["DASHBOARD", "ORDERS", "PRODUCTS"]);
    const [isFeatured, setIsFeatured] = useState(false);
    const [themeId, setThemeId] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
            description: "",
            price: "",
            discountPrice: "",
        },
    });

    const toggleFeature = (value) => {
        setFeatures((prev) =>
            prev.includes(value)
                ? prev.filter((f) => f !== value)
                : [...prev, value]
        );
    };

    const onSubmit = async (data) => {
        const validFeatures = features.filter((f) => AVAILABLE_FEATURES.includes(f));
        if (!validFeatures.length) {
            toast.error("Select at least one feature");
            return;
        }

        const payload = {
            name: data.name,
            description: data.description,
            price: parseFloat(data.price),
            discountPrice: data.discountPrice ? parseFloat(data.discountPrice) : null,
            isFeatured,
            features: validFeatures,
            ...(themeId && { themeId: parseInt(themeId) }),
        };

        const res = await createPackage(payload);
        if (res?.data) {
            toast.success("Package created successfully");
            reset();
            setFeatures(["DASHBOARD", "ORDERS", "PRODUCTS"]);
            setIsFeatured(false);
            setThemeId("");
            setOpen(false);
        } else {
            toast.error(res?.error?.data?.message || "Failed to create package");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 rounded-xl">Add Package</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto rounded-[24px] p-0 border-0 shadow-2xl bg-white dark:bg-slate-900">
                <DialogHeader className="bg-gradient-to-br from-violet-600 to-indigo-700 p-6 text-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Package className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold">Create New Package</DialogTitle>
                            <p className="text-violet-100 text-sm mt-1">
                                Define package details, pricing, and features
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <TextField
                            label="Package Name *"
                            placeholder="e.g., Basic, Premium, Enterprise"
                            register={register}
                            name="name"
                            error={errors.name}
                            className="h-14 rounded-xl border-slate-200 dark:border-slate-700 focus:ring-violet-500"
                        />
                        
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Description *
                            </label>
                            <textarea
                                {...register("description")}
                                placeholder="Describe the package features and benefits"
                                className="w-full min-h-[100px] px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none"
                            />
                            {errors.description && (
                                <span className="text-rose-500 text-xs ml-1 font-medium">
                                    {errors.description.message}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextField
                                label="Price (BDT) *"
                                type="number"
                                step="0.01"
                                placeholder="999.00"
                                register={register}
                                name="price"
                                error={errors.price}
                                className="h-14 rounded-xl border-slate-200 dark:border-slate-700 focus:ring-violet-500"
                            />
                            <TextField
                                label="Discount Price (BDT)"
                                type="number"
                                step="0.01"
                                placeholder="799.00"
                                register={register}
                                name="discountPrice"
                                error={errors.discountPrice}
                                className="h-14 rounded-xl border-slate-200 dark:border-slate-700 focus:ring-violet-500"
                            />
                        </div>

                        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <input
                                type="checkbox"
                                id="isFeatured"
                                className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                checked={isFeatured}
                                onChange={(e) => setIsFeatured(e.target.checked)}
                            />
                            <label
                                htmlFor="isFeatured"
                                className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                            >
                                Mark as Featured Package
                            </label>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Theme (Optional)
                            </label>
                            <div className="relative">
                                <select
                                    value={themeId}
                                    onChange={(e) => setThemeId(e.target.value)}
                                    className="w-full h-14 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all appearance-none"
                                    disabled={isLoadingThemes}
                                >
                                    <option value="">Select a theme</option>
                                    {themes.map((theme) => (
                                        <option key={theme.id} value={theme.id}>
                                            {theme.domainUrl || `Theme #${theme.id}`}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Features * <span className="text-slate-400 font-normal ml-1">(Select at least one)</span>
                                </p>
                                <span className="text-xs font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2 py-1 rounded-full">
                                    {features.length} selected
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[240px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/50">
                                {AVAILABLE_FEATURES.map((feature) => (
                                    <label
                                        key={feature}
                                        className={`flex items-center gap-3 p-2 rounded-lg text-sm cursor-pointer transition-colors ${
                                            features.includes(feature)
                                                ? "bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800"
                                                : "hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                            features.includes(feature)
                                                ? "bg-violet-600 border-violet-600 text-white"
                                                : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                                        }`}>
                                            {features.includes(feature) && <Check className="w-3.5 h-3.5" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={features.includes(feature)}
                                            onChange={() => toggleFeature(feature)}
                                        />
                                        <span className={features.includes(feature) ? "font-medium text-violet-900 dark:text-violet-100" : "text-slate-600 dark:text-slate-400"}>
                                            {getFeatureDisplayName(feature)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 h-12 px-6"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 h-12 px-6"
                        >
                            {isLoading ? "Creating..." : "Create Package"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default PackageCreateForm;
