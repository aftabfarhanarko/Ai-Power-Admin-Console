import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import {
    useGetPackageQuery,
    useUpdatePackageMutation
} from "@/features/package/packageApiSlice";
import { useGetThemesQuery } from "@/features/theme/themeApiSlice";
import {
    ArrowLeft,
    Package,
    Save,
    CheckCircle2,
    XCircle
} from "lucide-react";

// All available features with human label + description text
const FEATURES_OPTIONS = [
    { value: "PRODUCTS", label: "Products", details: "Manage all products (create, edit, delete, list, basic inventory)." },
    { value: "ORDERS", label: "Orders", details: "Access full order list, view order details and basic order actions." },
    { value: "STEADFAST", label: "Steardfast", details: "Use Steadfast courier inside the console for order shipping." },
    { value: "PATHAO", label: "Pathao", details: "Use Pathao courier inside the console for order shipping." },
    { value: "REDX", label: "Redx", details: "Use RedX courier inside the console for order shipping." },
    { value: "NOTIFICATIONS", label: "Notifications", details: "Access notification center and general notification features." },
    { value: "EMAIL_NOTIFICATIONS", label: "Email Notifications", details: "Send and manage email-based notifications to customers." },
    { value: "WHATSAPP_NOTIFICATIONS", label: "Whatsapp Notifications", details: "Send and manage WhatsApp-based notifications to customers." },
    { value: "SMS_NOTIFICATIONS", label: "Sms Notifications", details: "Send and manage SMS-based notifications to customers." },
    { value: "ORDERS_ITEM", label: "Orders Item", details: "View and manage line items inside each order (products, quantity, price)." },
    { value: "CATEGORY", label: "Category", details: "Create, edit and delete product categories." },
    { value: "CUSTOMERS", label: "Customers", details: "View customer list, create new customers and manage customer profiles." },
    { value: "REPORTS", label: "Reports", details: "Access different analytical and summary reports (sales, orders, etc.)." },
    { value: "SETTINGS", label: "Settings", details: "Access main settings page (general, account, preferences, billing, etc.)." },
    { value: "STAFF", label: "Staff", details: "Manage internal staff/users (list, create, edit, basic access)." },
    { value: "SMS_CONFIGURATION", label: "Sms Configuration", details: "Configure SMS gateway credentials and SMS sending settings." },
    { value: "EMAIL_CONFIGURATION", label: "Email Configuration", details: "Configure email SMTP / provider settings for outgoing emails." },
    { value: "PAYMENT_METHODS", label: "Payment Methods", details: "Set up offline payment methods (Cash, Bank Transfer, etc.)." },
    { value: "PAYMENT_GATEWAYS", label: "Payment Gateways", details: "Configure online gateways (SSLCommerz, Stripe, etc.)." },
    { value: "PAYMENT_STATUS", label: "Payment Status", details: "Define and manage different payment statuses (Paid, Unpaid, Pending)." },
    { value: "PAYMENT_TRANSACTIONS", label: "Payment Transactions", details: "View and track individual payment transaction history." },
    { value: "PROMOCODES", label: "Promocodes", details: "Create and manage coupon codes / discount promo codes." },
    { value: "HELP", label: "Help", details: "Access help center, support tickets and documentation section." },
    { value: "BANNERS", label: "Banners", details: "Create and manage simple homepage / site banners." },
    { value: "FRUAD_CHECKER", label: "Fruad Checker", details: "Use fraud-check tools to identify risky or suspicious orders." },
    { value: "MANAGE_USERS", label: "Manage Users", details: "High-level user management (system owners and staff accounts)." },
    { value: "DASHBOARD", label: "Dashboard", details: "Access main dashboard with KPIs, charts and quick stats." },
    { value: "REVENUE", label: "Revenue", details: "View revenue-related cards and graphs inside dashboard/reports." },
    { value: "NEW_CUSTOMERS", label: "New Customers", details: "See metrics and widgets for newly acquired customers." },
    { value: "REPEAT_PURCHASE_RATE", label: "Repeat Purchase Rate", details: "See repeat purchase rate stats and related KPIs." },
    { value: "AVERAGE_ORDER_VALUE", label: "Average Order Value", details: "See AOV (average order value) stats and insights." },
    { value: "STATS", label: "Stats", details: "Access extended statistics page with deeper analytics." },
    { value: "LOG_ACTIVITY", label: "Log Activity", details: "View SquadLog / activity logs for user actions in the system." },
    { value: "REVIEW", label: "Review", details: "View and manage customer product reviews." },
    { value: "PATHAO_COURIER", label: "Pathao Courier", details: "Access Pathao courier integration pages and tools." },
    { value: "STEADFAST_COURIER", label: "Steadfast Courier", details: "Access Steadfast courier integration pages and tools." },
    { value: "REDX_COURIER", label: "Redx Courier", details: "Access RedX courier integration pages and tools." },
    { value: "PATHAO_COURIER_CONFIGURATION", label: "Pathao Courier Configuration", details: "Configure Pathao API keys, credentials and courier settings." },
    { value: "STEADFAST_COURIER_CONFIGURATION", label: "Steadfast Courier Configuration", details: "Configure Steadfast API keys, credentials and courier settings." },
    { value: "REDX_COURIER_CONFIGURATION", label: "Redx Courier Configuration", details: "Configure RedX API keys, credentials and courier settings." },
    { value: "SUPERADMIN_EARNINGS", label: "Superadmin Earnings", details: "Superadmin-level earnings overview and revenue data for all tenants." },
    { value: "SUPERADMIN_STATISTICS", label: "Superadmin Statistics", details: "Global statistics panel for the superadmin (all stores / system-wide)." },
    { value: "AI_REPORT", label: "Ai Report", details: "AI-generated daily/periodic reports with insights and recommendations." },
    { value: "AI_LIVE_FEED", label: "Ai Live Feed", details: "Real-time AI live feed of events, anomalies and important activities." },
    { value: "AI_SALES_DIRECTION", label: "Ai Sales Direction", details: "AI guidance on what to push, which products to focus and sales direction." },
    { value: "PRODUCT_BULK_UPLOAD", label: "Product Bulk Upload", details: "Upload many products at once using CSV / Excel bulk upload." },
    { value: "INVENTORY_MANAGEMENT", label: "Inventory Management", details: "View and manage stock levels, inventory adjustments and stock list." },
    { value: "INVENTORY_HISTORY", label: "Inventory History", details: "See detailed stock movement history (in/out, restock, adjustments)." },
    { value: "FLASH_SELL", label: "Flash Sell", details: "Set up and manage flash sale campaigns from the console." },
    { value: "MEDIA_MANAGEMENT", label: "Media Management", details: "Access media library, upload and manage images/files used in the store." },
    { value: "BANNER_MANAGEMENT", label: "Banner Management", details: "Advanced banner management for different positions and layouts." },
    { value: "BANNERS_OFFERS_MARKETING", label: "Banners Offers Marketing", details: "Marketing-focused banners and offers management (campaign-style)." },
    { value: "ORDER_INVOICE_FINANCE", label: "Order Invoice Finance", details: "Access invoices, credit notes and financial views linked to orders." },
    { value: "ORDER_CREATION_MANUAL", label: "Order Creation Manual", details: "Create orders manually from the console on behalf of customers." },
    { value: "ORDER_TRACKING", label: "Order Tracking", details: "Use the console tracking page to follow order shipping status." },
    { value: "ORDER_EDIT", label: "Order Edit", details: "Edit existing orders (items, customer info, amounts) from console." },
    { value: "SALE_INVOICE_MANAGEMENT", label: "Sale Invoice Management", details: "Create, edit, view and manage sale invoices and recurring invoices." },
    { value: "POLICY_LEGAL_CONTENT", label: "Policy Legal Content", details: "Access the full legal content section (all store policies together)." },
    { value: "PRIVACY_POLICY_MANAGEMENT", label: "Privacy Policy Management", details: "Create and edit the store’s privacy policy content." },
    { value: "TERMS_CONDITIONS_MANAGEMENT", label: "Terms Conditions Management", details: "Create and edit terms & conditions content." },
    { value: "REFUND_POLICY_MANAGEMENT", label: "Refund Policy Management", details: "Create and edit refund/return policy content." },
    { value: "INTEGRATIONS_SETTINGS", label: "Integrations Settings", details: "Access integrations area for managing connected apps and services." },
    { value: "CONNECTED_APPS", label: "Connected Apps", details: "View and manage all third‑party apps connected to the store." },
    { value: "COURIER_INTEGRATION_SETTINGS", label: "Courier Integration Settings", details: "Central settings page for all courier integrations." },
    { value: "NOTIFICATION_SETTINGS", label: "Notification Settings", details: "Configure how and when different notifications are sent." },
    { value: "THEME_MANAGEMENT", label: "Theme Management", details: "Manage storefront themes, preview and switch between themes." },
    { value: "CUSTOM_DOMAIN", label: "Custom Domain", details: "Connect and manage custom domains for the storefront." },
];

// Flat list of values for validation / filtering
const AVAILABLE_FEATURES = FEATURES_OPTIONS.map((f) => f.value);

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

const PackageEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Fetch package details
    const { data: pkg, isLoading: isPkgLoading, isError } = useGetPackageQuery(id);
    const [updatePackage, { isLoading: isUpdating }] = useUpdatePackageMutation();
    const { data: themes = [], isLoading: isLoadingThemes } = useGetThemesQuery();
    
    const [features, setFeatures] = useState([]);
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

    useEffect(() => {
        if (pkg) {
            reset({
                name: pkg.name || "",
                description: pkg.description || "",
                price: pkg.price || "",
                discountPrice: pkg.discountPrice || "",
            });
            // Filter to only valid features
            const validFeatures = (pkg.features || []).filter((f) => AVAILABLE_FEATURES.includes(f));
            setFeatures(validFeatures.length > 0 ? validFeatures : []);
            setIsFeatured(pkg.isFeatured || false);
            setThemeId(pkg?.themeId || "");
        }
    }, [pkg, reset]);

    const toggleFeature = (value) => {
        setFeatures((prev) =>
            prev.includes(value)
                ? prev.filter((f) => f !== value)
                : [...prev, value]
        );
    };

    const onSubmit = async (data) => {
        // Filter to only valid features before submit
        const validFeatures = features.filter((f) => AVAILABLE_FEATURES.includes(f));
        if (!validFeatures.length) {
            toast.error("Select at least one feature");
            return;
        }

        const payload = {
            id: id,
            name: data.name,
            description: data.description,
            price: parseFloat(data.price),
            discountPrice: data.discountPrice ? parseFloat(data.discountPrice) : null,
            isFeatured,
            features: validFeatures,
            ...(themeId && { themeId: parseInt(themeId) }),
        };

        const res = await updatePackage(payload);
        if (res?.data) {
            toast.success("Package updated successfully");
            navigate("/superadmin/packages");
        } else {
            toast.error(res?.error?.data?.message || "Failed to update package");
        }
    };

    if (isPkgLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse">
                        Loading package details...
                    </p>
                </div>
            </div>
        );
    }

    if (isError || !pkg) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                <div className="w-24 h-24 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                    <XCircle className="w-12 h-12 text-rose-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Package Not Found
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md">
                        The package you are looking for does not exist or has been removed.
                    </p>
                </div>
                <Button
                    onClick={() => navigate("/superadmin/packages")}
                    className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Packages
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto space-y-6 p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate("/superadmin/packages")}
                        className="rounded-full h-10 w-10 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </Button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Edit Package
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                            Update package details and features
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isUpdating}
                    className="rounded-xl bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-500/20"
                >
                    {isUpdating ? (
                        <>
                            <div className="w-4 h-4 mr-2 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                            Updating...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form Column */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Package className="w-5 h-5 text-violet-500" />
                            Package Information
                        </h2>
                        <div className="space-y-6">
                            <TextField
                                label="Package Name *"
                                placeholder="e.g., Basic, Premium, Enterprise"
                                register={register}
                                name="name"
                                error={errors.name}
                            />
                            
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Description *
                                </label>
                                <textarea
                                    {...register("description")}
                                    placeholder="Describe the package features and benefits"
                                    className="w-full min-h-[120px] px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-y"
                                />
                                {errors.description && (
                                    <span className="text-red-500 text-xs ml-1">
                                        {errors.description.message}
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <TextField
                                    label="Price (BDT) *"
                                    type="number"
                                    step="0.01"
                                    placeholder="999.00"
                                    register={register}
                                    name="price"
                                    error={errors.price}
                                />
                                <TextField
                                    label="Discount Price (BDT)"
                                    type="number"
                                    step="0.01"
                                    placeholder="799.00"
                                    register={register}
                                    name="discountPrice"
                                    error={errors.discountPrice}
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                                <input
                                    type="checkbox"
                                    id="isFeatured"
                                    className="w-5 h-5 rounded border-amber-400 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                    checked={isFeatured}
                                    onChange={(e) => setIsFeatured(e.target.checked)}
                                />
                                <label
                                    htmlFor="isFeatured"
                                    className="text-sm font-medium text-amber-900 dark:text-amber-100 cursor-pointer select-none"
                                >
                                    Mark as Featured Package
                                    <p className="text-xs font-normal text-amber-700 dark:text-amber-300 mt-0.5">
                                        Featured packages are highlighted to customers
                                    </p>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            Included Features
                        </h2>
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Select the features included in this package ({features.length} selected)
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {FEATURES_OPTIONS.map((feature) => (
                                    <label
                                        key={feature.value}
                                        className={`
                                            flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200
                                            ${features.includes(feature.value)
                                                ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                                                : "bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700"
                                            }
                                        `}
                                    >
                                        <div className={`
                                            w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors
                                            ${features.includes(feature.value)
                                                ? "bg-emerald-500 border-emerald-500"
                                                : "bg-transparent border-slate-300 dark:border-slate-600"
                                            }
                                        `}>
                                            {features.includes(feature.value) && (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span
                                                className={`text-sm font-semibold ${
                                                    features.includes(feature.value)
                                                        ? "text-emerald-900 dark:text-emerald-100"
                                                        : "text-slate-700 dark:text-slate-200"
                                                }`}
                                            >
                                                {feature.label}
                                            </span>
                                            {feature.details && (
                                                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {feature.details}
                                                </span>
                                            )}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={features.includes(feature.value)}
                                            onChange={() => toggleFeature(feature.value)}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Sidebar Column */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 sticky top-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                            Configuration
                        </h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Theme Selection (Optional)
                                </label>
                                <div className="relative">
                                    <select
                                        value={themeId}
                                        onChange={(e) => setThemeId(e.target.value)}
                                        className="w-full appearance-none px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all pr-10"
                                        disabled={isLoadingThemes}
                                    >
                                        <option value="">Select a theme</option>
                                        {themes.map((theme) => (
                                            <option key={theme.id} value={theme.id}>
                                                {theme.domainUrl || `Theme #${theme.id}`}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Assign a specific theme layout to this package
                                </p>
                            </div>

                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                <Button
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={isUpdating}
                                    className="w-full rounded-xl bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-500/20 py-6"
                                >
                                    {isUpdating ? "Updating Package..." : "Save Changes"}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/superadmin/packages")}
                                    className="w-full mt-3 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 py-6 text-slate-600 dark:text-slate-400"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default PackageEditPage;
