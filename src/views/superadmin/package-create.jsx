import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import {
    useCreatePackageMutation
} from "@/features/package/packageApiSlice";
import { useGetThemesQuery } from "@/features/theme/themeApiSlice";

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

const PackageCreatePage = () => {
    const navigate = useNavigate();
    const [createPackage, { isLoading: isCreating }] = useCreatePackageMutation();
    const { data: themes = [], isLoading: isLoadingThemes } = useGetThemesQuery();
    
    const [features, setFeatures] = useState([]);
    const [isFeatured, setIsFeatured] = useState(false);
    const [themeId, setThemeId] = useState("");
    const [step, setStep] = useState(1);

    const {
        register,
        handleSubmit,
        watch,
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

    const watchedName = watch("name");
    const watchedDescription = watch("description");
    const watchedPrice = watch("price");
    const watchedDiscountPrice = watch("discountPrice");

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
            navigate("/superadmin/packages");
        } else {
            toast.error(res?.error?.data?.message || "Failed to create package");
        }
    };

    const stepItems = [
        { id: 1, label: "Identifier", helper: "Core naming & signature" },
        { id: 2, label: "Operations", helper: "Capability & module selection" },
        { id: 3, label: "Resources", helper: "Infrastructure & cost allocation" },
        { id: 4, label: "Review", helper: "Final system parity check" },
    ];

    return (
        <div className="max-w-[1440px] mx-auto space-y-12">
            {/* Breadcrumb & Back */}
            <div className="flex items-center gap-4">
                <button 
                    type="button"
                    onClick={() => navigate("/superadmin/packages")}
                    className="p-2 hover:bg-[#f0ecf9] rounded-full transition-all group active:scale-95"
                >
                    <MaterialIcon className="text-[#464555] group-hover:text-[#3525cd]">arrow_back</MaterialIcon>
                </button>
                <nav className="flex items-center gap-1.5 text-xs text-[#777587] uppercase tracking-widest font-semibold">
                    <span>Operations</span>
                    <MaterialIcon className="text-[12px]">chevron_right</MaterialIcon>
                    <span className="text-[#1b1b24]">Create Package</span>
                </nav>
            </div>

            {/* Title Section */}
            <div>
                <h2 className="text-[48px] font-bold tracking-tight text-[#1b1b24] leading-tight mb-2">
                    Initialize New Deployment Package
                </h2>
                <p className="text-base text-[#777587] max-w-2xl leading-relaxed">
                    Define the strategic parameters, core capabilities, and resource allocation logic for the next high-performance operational container.
                </p>
            </div>

            {/* Stepper + Form Grid */}
            <div className="grid grid-cols-12 gap-8 items-start">
                
                {/* Sidebar Column (Stepper + Tips - Span 4) */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    
                    {/* Stepper Progress */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#eae6f4]">
                        <div className="text-[10px] font-bold text-[#777587] uppercase tracking-widest mb-6">
                            Configuration Progress
                        </div>
                        <div className="space-y-4">
                            {stepItems.map((item, index) => {
                                const isActive = step === item.id;
                                const isCompleted = step > item.id;
                                return (
                                    <div 
                                        key={item.id} 
                                        onClick={() => setStep(item.id)}
                                        className={`flex items-start gap-4 p-4 rounded-2xl relative cursor-pointer transition-all ${
                                            isActive 
                                                ? "bg-[#3525cd]/5 border border-[#3525cd]/20" 
                                                : "hover:bg-[#f0ecf9]/50 group"
                                        }`}
                                    >
                                        {isActive && (
                                            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#3525cd] rounded-full"></div>
                                        )}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold transition-all ${
                                            isActive 
                                                ? "bg-[#3525cd] text-white shadow-lg shadow-[#3525cd]/20" 
                                                : isCompleted
                                                    ? "bg-[#10b981]/15 text-[#10b981] group-hover:bg-[#e2dfff] group-hover:text-[#3525cd]"
                                                    : "bg-[#f0ecf9] text-[#464555] group-hover:bg-[#e2dfff] group-hover:text-[#3525cd]"
                                        }`}>
                                            {isCompleted ? (
                                                <MaterialIcon className="text-lg">check</MaterialIcon>
                                            ) : (
                                                <span>{item.id}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className={`text-sm font-bold transition-colors ${
                                                isActive ? "text-[#3525cd]" : "text-[#1b1b24] group-hover:text-[#3525cd]"
                                            }`}>
                                                {item.label}
                                            </h4>
                                            <p className="text-xs text-[#777587] mt-0.5">{item.helper}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* AI Tip card */}
                    <div className="bg-[#3525cd]/5 rounded-3xl p-6 border border-[#3525cd]/10 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#3525cd]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="flex items-center gap-2 mb-3">
                            <MaterialIcon className="text-[#3525cd] text-[18px]">bolt</MaterialIcon>
                            <span className="text-[10px] font-bold text-[#3525cd] uppercase tracking-wider">AI Orchestrator Tip</span>
                        </div>
                        <p className="text-xs text-[#3525cd]/80 leading-relaxed">
                            Our AI engine auto-suggests resource placement once the package signature is confirmed. Ensure the <span className="font-bold">Operational Container Parameters</span> are descriptive for 99.9% matching accuracy.
                        </p>
                    </div>

                </div>

                {/* Form Main Column (Span 8) */}
                <div className="col-span-12 lg:col-span-8">
                    <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-[#3525cd]/5 border border-[#eae6f4] relative overflow-hidden">
                        
                        {/* Glassy Background Accent */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3525cd]/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        
                        <div className="relative z-10">
                            
                            {/* Step 1: Identifier */}
                            {step === 1 && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#1b1b24] mb-1">Package Identification</h3>
                                        <p className="text-xs text-[#777587]">Establish the unique deployment signature for this mission-critical unit.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-extrabold text-[#777587] uppercase tracking-[0.2em] ml-1">
                                                Package Name / Deployment UUID
                                            </label>
                                            <div className="relative">
                                                <input 
                                                    type="text"
                                                    {...register("name")}
                                                    placeholder="e.g. ALPHA-REDACT-2024-X9"
                                                    className="w-full bg-[#f8f9fc] border-2 border-[#eae6f4] rounded-2xl px-6 py-5 text-sm text-[#1b1b24] focus:ring-4 focus:ring-[#3525cd]/10 focus:border-[#3525cd] outline-none transition-all placeholder:text-[#c7c4d8]"
                                                />
                                                {watchedName && !errors.name && (
                                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[#10b981]">
                                                        <MaterialIcon className="text-sm">verified</MaterialIcon>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Available</span>
                                                    </div>
                                                )}
                                            </div>
                                            {errors.name && (
                                                <p className="text-xs text-red-500 font-semibold ml-1">{errors.name.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-extrabold text-[#777587] uppercase tracking-[0.2em] ml-1">
                                                Operational Container Parameters
                                            </label>
                                            <div className="relative">
                                                <textarea 
                                                    rows="6"
                                                    {...register("description")}
                                                    maxLength={1500}
                                                    placeholder="Provide a detailed functional breakdown of the package objective, security protocols, and expected container lifespan..."
                                                    className="w-full bg-[#f8f9fc] border-2 border-[#eae6f4] rounded-3xl px-6 py-5 text-sm text-[#1b1b24] focus:ring-4 focus:ring-[#3525cd]/10 focus:border-[#3525cd] outline-none transition-all resize-none placeholder:text-[#c7c4d8]"
                                                />
                                                <div className="absolute bottom-4 right-4 text-[10px] font-bold text-[#777587] uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-[#eae6f4]">
                                                    {watchedDescription?.length || 0} / 1500 chars
                                                </div>
                                            </div>
                                            {errors.description && (
                                                <p className="text-xs text-red-500 font-semibold ml-1">{errors.description.message}</p>
                                            )}
                                            <p className="mt-2 flex items-center gap-1 text-xs text-[#777587] ml-1">
                                                <MaterialIcon className="text-sm">info</MaterialIcon>
                                                <span>Descriptive keywords assist the auto-scaling balancer in the next phase.</span>
                                            </p>
                                        </div>

                                        {/* Nested stats */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                            <div className="bg-[#f5f2ff]/50 rounded-2xl p-6 border border-[#eae6f4] group hover:border-[#3525cd]/30 transition-all">
                                                <div className="text-[10px] font-bold text-[#777587] uppercase tracking-widest mb-2">Active Target Nodes</div>
                                                <div className="flex items-end gap-2">
                                                    <span className="text-[32px] font-bold text-[#1b1b24] leading-none group-hover:text-[#3525cd] transition-colors">1,204</span>
                                                    <span className="text-[#10b981] text-xs font-bold pb-1">+12.4%</span>
                                                </div>
                                            </div>
                                            <div className="bg-[#f5f2ff]/50 rounded-2xl p-6 border border-[#eae6f4] group hover:border-[#3525cd]/30 transition-all">
                                                <div className="text-[10px] font-bold text-[#777587] uppercase tracking-widest mb-2">Global Queue Load</div>
                                                <div className="flex items-end gap-2">
                                                    <span className="text-[32px] font-bold text-[#1b1b24] leading-none group-hover:text-[#3525cd] transition-colors">0.04%</span>
                                                    <span className="text-[#777587] text-xs font-bold pb-1">Nominal</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Capability Matrix */}
                            {step === 2 && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#1b1b24] mb-1">Capability Matrix</h3>
                                        <p className="text-xs text-[#777587]">Select the core features and operations available in this package.</p>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2 max-h-[450px] overflow-y-auto pr-2">
                                        {FEATURES_OPTIONS.map((feature) => (
                                            <label
                                                key={feature.value}
                                                className={`cursor-pointer rounded-[24px] border p-4 transition-all flex items-start gap-3 ${
                                                    features.includes(feature.value)
                                                        ? "border-[#3525cd] bg-[#3525cd]/5"
                                                        : "border-[#eae6f4] bg-white hover:bg-[#f5f2ff]/30"
                                                }`}
                                            >
                                                <div
                                                    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                                        features.includes(feature.value)
                                                            ? "border-[#3525cd] bg-[#3525cd] text-white"
                                                            : "border-gray-300 bg-white"
                                                    }`}
                                                >
                                                    {features.includes(feature.value) ? (
                                                        <MaterialIcon className="text-[12px] font-bold">check</MaterialIcon>
                                                    ) : null}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`font-semibold text-sm ${features.includes(feature.value) ? "text-[#3525cd]" : "text-[#1b1b24]"}`}>
                                                        {feature.label}
                                                    </p>
                                                    <p className="mt-1 text-xs leading-relaxed text-[#777587]">
                                                        {feature.details}
                                                    </p>
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
                            )}

                            {/* Step 3: Resource Allocation */}
                            {step === 3 && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#1b1b24] mb-1">Resource Allocation</h3>
                                        <p className="text-xs text-[#777587]">Configure pricing, theme binding, and promotion visibility.</p>
                                    </div>

                                    <div className="grid gap-6 lg:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-extrabold text-[#777587] uppercase tracking-[0.2em] ml-1">
                                                Base Price (BDT)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register("price")}
                                                placeholder="999.00"
                                                className="w-full bg-[#f8f9fc] border-2 border-[#eae6f4] rounded-2xl px-6 py-4 text-sm text-[#1b1b24] focus:ring-4 focus:ring-[#3525cd]/10 focus:border-[#3525cd] outline-none transition-all placeholder:text-[#c7c4d8]"
                                            />
                                            {errors.price && (
                                                <p className="text-xs text-red-500 font-semibold ml-1">{errors.price.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-[11px] font-extrabold text-[#777587] uppercase tracking-[0.2em] ml-1">
                                                Discount Price (BDT)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register("discountPrice")}
                                                placeholder="799.00"
                                                className="w-full bg-[#f8f9fc] border-2 border-[#eae6f4] rounded-2xl px-6 py-4 text-sm text-[#1b1b24] focus:ring-4 focus:ring-[#3525cd]/10 focus:border-[#3525cd] outline-none transition-all placeholder:text-[#c7c4d8]"
                                            />
                                            {errors.discountPrice && (
                                                <p className="text-xs text-red-500 font-semibold ml-1">{errors.discountPrice.message}</p>
                                            )}
                                        </div>

                                        <div className="lg:col-span-2 space-y-2">
                                            <label className="block text-[11px] font-extrabold text-[#777587] uppercase tracking-[0.2em] ml-1">
                                                Theme Binding
                                            </label>
                                            <select
                                                value={themeId}
                                                onChange={(e) => setThemeId(e.target.value)}
                                                disabled={isLoadingThemes}
                                                className="w-full bg-[#f8f9fc] border-2 border-[#eae6f4] rounded-2xl px-6 py-4 text-sm text-[#1b1b24] focus:ring-4 focus:ring-[#3525cd]/10 focus:border-[#3525cd] outline-none transition-all"
                                            >
                                                <option value="">Select a theme</option>
                                                {themes.map((theme) => (
                                                    <option key={theme.id} value={theme.id}>
                                                        {theme.domainUrl || `Theme #${theme.id}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <label className="lg:col-span-2 flex cursor-pointer items-start gap-4 rounded-[24px] border border-[#eae6f4] bg-[#f8f9fc] px-6 py-5 hover:bg-[#f5f2ff]/20 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={isFeatured}
                                                onChange={(e) => setIsFeatured(e.target.checked)}
                                                className="h-5 w-5 accent-[#3525cd] text-[#3525cd] border-gray-300 rounded mt-0.5"
                                            />
                                            <div>
                                                <p className="font-semibold text-sm text-[#1b1b24]">Mark As Featured Package</p>
                                                <p className="mt-1 text-xs text-[#777587]">
                                                    Featured packages are highlighted in customer-facing plan cards.
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Review */}
                            {step === 4 && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#1b1b24] mb-1">Review Package Deployment</h3>
                                        <p className="text-xs text-[#777587]">Final validation before creating the package in the backend.</p>
                                    </div>

                                    <div className="grid gap-6 lg:grid-cols-2">
                                        <div className="rounded-[24px] border border-[#eae6f4] bg-[#f8f9fc] p-6">
                                            <p className="text-[10px] font-bold text-[#777587] uppercase tracking-[0.24em]">
                                                Identifier
                                            </p>
                                            <p className="mt-3 text-lg font-bold text-[#1b1b24]">
                                                {watchedName || "Pending package name"}
                                            </p>
                                            <p className="mt-2 text-xs text-[#777587] leading-relaxed">
                                                {watchedDescription
                                                    ? watchedDescription.slice(0, 120) + (watchedDescription.length > 120 ? "..." : "")
                                                    : "Review your package name and summary before initialization."}
                                            </p>
                                        </div>
                                        <div className="rounded-[24px] border border-[#eae6f4] bg-[#f8f9fc] p-6">
                                            <p className="text-[10px] font-bold text-[#777587] uppercase tracking-[0.24em]">
                                                Resource Allocation
                                            </p>
                                            <p className="mt-3 text-[28px] font-black text-[#3525cd]">
                                                {watchedDiscountPrice || watchedPrice ? `৳${watchedDiscountPrice || watchedPrice}` : "TBD"}
                                            </p>
                                            <p className="mt-2 text-xs text-[#777587]">
                                                {features.length} features ready for deployment in this tier.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Footer Actions Section */}
                            <div className="mt-8 flex flex-col gap-6 border-t border-[#f0ecf9] pt-6 sm:flex-row sm:items-center sm:justify-between">
                                <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center">
                                    <div className="rounded-[22px] px-5 py-3 bg-[#f8f9fc] border border-[#eae6f4]">
                                        <p className="text-[10px] font-bold text-[#777587] uppercase tracking-[0.22em]">Active Nodes</p>
                                        <p className="mt-1 text-2xl font-black text-[#1b1b24]">1,204</p>
                                    </div>
                                    <div className="rounded-[22px] px-5 py-3 bg-[#f8f9fc] border border-[#eae6f4]">
                                        <p className="text-[10px] font-bold text-[#777587] uppercase tracking-[0.22em]">Queue Load</p>
                                        <p className="mt-1 text-2xl font-black text-[#1b1b24]">0.04%</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    {step > 1 ? (
                                        <button
                                            type="button"
                                            className="h-12 rounded-2xl border border-[#c7c4d8] bg-transparent text-[#464555] hover:bg-[#f5f2ff] px-6 font-semibold text-sm active:scale-95 transition-all"
                                            onClick={() => setStep((current) => Math.max(1, current - 1))}
                                        >
                                            Back
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="h-12 rounded-2xl border border-[#c7c4d8] bg-transparent text-[#464555] hover:bg-[#f5f2ff] px-6 font-semibold text-sm active:scale-95 transition-all"
                                            onClick={() => navigate("/superadmin/packages")}
                                        >
                                            Discard
                                        </button>
                                    )}

                                    {step < 4 ? (
                                        <button
                                            type="button"
                                            className="h-12 rounded-2xl bg-[#3525cd] text-white hover:bg-[#3525cd]/90 px-8 font-bold text-sm shadow-md shadow-[#3525cd]/20 hover:scale-105 active:scale-95 transition-all"
                                            onClick={() => setStep((current) => Math.min(4, current + 1))}
                                        >
                                            Continue
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleSubmit(onSubmit)}
                                            disabled={isCreating}
                                            className="h-12 rounded-2xl bg-[#3525cd] text-white hover:bg-[#3525cd]/90 px-8 font-bold text-sm shadow-md shadow-[#3525cd]/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isCreating ? (
                                                <>
                                                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                                    Initializing...
                                                </>
                                            ) : (
                                                <>
                                                    Create Package
                                                    <MaterialIcon className="text-sm">arrow_forward</MaterialIcon>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>

            {/* Floating Support FAB */}
            <button 
                type="button"
                onClick={() => toast.success("Connecting with support orchestrator...")}
                className="fixed bottom-8 right-8 w-16 h-16 bg-[#3525cd] text-white rounded-2xl shadow-xl shadow-[#3525cd]/20 flex items-center justify-center group hover:scale-110 active:scale-95 transition-all z-50"
            >
                <MaterialIcon className="text-3xl group-hover:rotate-12 transition-transform">support_agent</MaterialIcon>
            </button>
        </div>
    );
};

export default PackageCreatePage;
