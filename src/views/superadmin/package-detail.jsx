import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetPackageQuery } from "@/features/package/packageApiSlice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Package,
  Tag,
  Calendar,
  Layers,
  CheckCircle2,
  Star,
  XCircle,
  Info,
} from "lucide-react";
import { MaterialIcon, glassCard, monoTextStyle } from "./stitchPrimitives";

// All available features with human label + description text
const FEATURES_OPTIONS = [
    { value: "PRODUCTS", label: "Products", details: "Manage all products (create, edit, delete, list, basic inventory)." },
    { value: "ORDERS", label: "Orders", details: "Access full order list, view order details and basic order actions." },
    { value: "STEADFAST", label: "Steardfast", details: "Use Steadfast courier inside the console for order shipping." },
    { value: "PATHAO", label: "Pathao", details: "Use Pathao courier inside the console for order shipping." },
    { value: "REDX", label: "Redx", details: "Use RedX courier integration pages and tools." },
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

const PackageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: pkg, isLoading, isError } = useGetPackageQuery(id);
  const [featureModal, setFeatureModal] = React.useState(null);

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

  if (isLoading) {
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
          onClick={() => navigate("/superadmin/package-management")}
          className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Packages
        </Button>
      </div>
    );
  }

  const liveFeatures = pkg.features || [];
  const headlinePrice = pkg.discountPrice || pkg.price || 0;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4 border-b border-white/[0.06] pb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/superadmin/packages")}
          className="h-10 w-10 rounded-full border-white/[0.08] bg-transparent text-[#e1e2e7] hover:bg-white/[0.04]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="truncate text-[38px] font-black tracking-[-0.03em] text-[#f5f7fb]">
              {pkg.name || "Package Overview"}
            </h1>
            {pkg.isFeatured ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#4ade80]/20 bg-[#4ade80]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#4ade80]">
                <Star className="h-3 w-3 fill-current" />
                Live
              </span>
            ) : null}
          </div>
          <p
            className="mt-2 text-[11px] uppercase tracking-[0.28em] text-[#c9c4d0]"
            style={monoTextStyle}
          >
            Package overview / Deployment node / ID: VNG-{pkg.id}-SQUAD-X
          </p>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr_0.7fr]">
        <div className={`${glassCard} rounded-[32px] p-6`}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p
                className="text-[11px] uppercase tracking-[0.24em] text-[#c9c4d0]"
                style={monoTextStyle}
              >
                Package Overview
              </p>
              <p className="mt-3 text-lg font-semibold text-[#f5f7fb]">
                {pkg.description || "Deployment package active across the command network."}
              </p>
            </div>
            <span
              className="rounded-full border border-[#4ade80]/20 bg-[#4ade80]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#4ade80]"
              style={monoTextStyle}
            >
              Live
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#938f9a]" style={monoTextStyle}>
                Package Id
              </p>
              <p className="mt-6 text-[28px] font-black text-[#f5f7fb]">VNG-{pkg.id}</p>
            </div>
            <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#938f9a]" style={monoTextStyle}>
                Current Pricing
              </p>
              <p className="mt-6 text-[28px] font-black text-[#f5f7fb]">
                ৳{formatPrice(headlinePrice)}
                <span className="ml-1 text-sm font-medium text-[#8d94a1]">/mo</span>
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[84%] rounded-full bg-[#d8cdfa]" />
              </div>
              <p className="mt-2 text-xs text-[#c9c4d0]">Resource allocation 84%</p>
            </div>
          </div>
        </div>

        <div className={`${glassCard} rounded-[32px] p-6`}>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#c9c4d0]" style={monoTextStyle}>
            Included Capabilities
          </p>
          <div className="mt-5 space-y-4">
            {liveFeatures.slice(0, 4).map((feature, index) => {
              const meta = FEATURES_OPTIONS.find((item) => item.value === feature);
              return (
                <button
                  key={feature}
                  type="button"
                  className="flex w-full items-start gap-3 text-left"
                  onClick={() =>
                    setFeatureModal({
                      label: meta?.label || feature,
                      details: meta?.details || feature,
                    })
                  }
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#d8cdfa]" />
                  <div>
                    <p className="font-semibold text-[#f5f7fb]">
                      {meta?.label || feature}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#8d94a1]">
                      {meta?.details || "Deployment-ready capability."}
                    </p>
                  </div>
                </button>
              );
            })}
            {!liveFeatures.length ? (
              <p className="text-sm text-[#8d94a1]">No capabilities configured.</p>
            ) : null}
          </div>
        </div>

        <div className={`${glassCard} rounded-[32px] p-6`}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#c9c4d0]" style={monoTextStyle}>
              Live Performance
            </p>
            <span
              className="rounded-full border border-[#4ade80]/20 bg-[#4ade80]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#4ade80]"
              style={monoTextStyle}
            >
              Live Feed
            </span>
          </div>
          <div className="mt-6 space-y-5">
            <div>
              <p className="text-sm text-[#8d94a1]">Response Time</p>
              <p className="mt-1 text-[32px] font-black text-[#f5f7fb]">12.4ms</p>
            </div>
            <div className="h-[48px] w-full">
              <svg className="h-full w-full" fill="none" viewBox="0 0 160 48">
                <path
                  d="M0 24 C24 10, 40 14, 60 24 S100 40, 126 20 S148 30, 160 14"
                  stroke="#d8cdfa"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <Button className="h-11 w-full rounded-full bg-white/[0.04] text-[#f5f7fb] hover:bg-white/[0.07]">
              View Analytics Dashboard
            </Button>
          </div>
        </div>
      </section>

      <section className={`${glassCard} rounded-[32px] p-6`}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#c9c4d0]" style={monoTextStyle}>
              Node Distribution
            </p>
            <p className="mt-1 text-sm text-[#8d94a1]">
              Active clusters across global regions
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#938f9a]" style={monoTextStyle}>
              Active Clusters
            </p>
            <p className="mt-1 font-semibold text-[#f5f7fb]">124</p>
          </div>
        </div>
        <div className="rounded-[28px] border border-white/[0.08] bg-[#080b13] p-4">
          <div className="relative h-[240px] overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_50%_50%,rgba(120,108,255,0.10),transparent_40%)]">
            {[20, 48, 82].map((left, index) => (
              <span
                key={index}
                className="absolute h-4 w-4 rounded-full border border-white/20 bg-[#d8cdfa]"
                style={{ left: `${left}%`, top: `${20 + index * 20}%` }}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#c9c4d0]">
            <span className="rounded-full border border-white/[0.08] px-3 py-1">Primary Node</span>
            <span className="rounded-full border border-white/[0.08] px-3 py-1">Relays</span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className={`${glassCard} rounded-[32px] p-6`}>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#938f9a]" style={monoTextStyle}>
            Developer
          </p>
          <p className="mt-4 text-[40px] font-black text-[#f5f7fb]">৳129</p>
          <p className="text-sm text-[#8d94a1]">2 Global Nodes</p>
          <p className="mt-2 text-sm text-[#8d94a1]">Standard Encryption</p>
          <Button className="mt-8 h-11 w-full rounded-full bg-white/[0.04] text-[#f5f7fb] hover:bg-white/[0.07]">
            Select Plan
          </Button>
        </div>
        <div className="rounded-[32px] border border-[#d8cdfa] bg-[linear-gradient(180deg,rgba(216,205,250,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_0_0_1px_rgba(216,205,250,0.25)_inset]">
          <div className="inline-flex rounded-full border border-[#d8cdfa]/30 bg-[#d8cdfa]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#d8cdfa]">
            Recommended
          </div>
          <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-[#938f9a]" style={monoTextStyle}>
            Enterprise
          </p>
          <p className="mt-4 text-[40px] font-black text-[#f5f7fb]">
            ৳{formatPrice(headlinePrice)}
          </p>
          <p className="text-sm text-[#8d94a1]">
            {liveFeatures.length || 15} deployment capabilities
          </p>
          <p className="mt-2 text-sm text-[#8d94a1]">Priority L3 Support</p>
          <Button className="mt-8 h-11 w-full rounded-full bg-[#d8cdfa] text-[#2a214b] hover:bg-[#cbbfed]">
            Current Plan
          </Button>
        </div>
        <div className={`${glassCard} rounded-[32px] p-6`}>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#938f9a]" style={monoTextStyle}>
            Black Ops
          </p>
          <p className="mt-4 text-[40px] font-black text-[#f5f7fb]">Custom</p>
          <p className="text-sm text-[#8d94a1]">Unlimited Nodes</p>
          <p className="mt-2 text-sm text-[#8d94a1]">White-Glove Migration</p>
          <Button className="mt-8 h-11 w-full rounded-full bg-white/[0.04] text-[#f5f7fb] hover:bg-white/[0.07]">
            Contact Command
          </Button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className={`${glassCard} rounded-[32px] p-6`}>
          <div className="mb-4 flex items-center gap-3">
            <MaterialIcon className="text-[20px] text-[#e6deff]">timeline</MaterialIcon>
            <h2 className="text-[26px] font-bold text-[#f5f7fb]">Mission Timeline</h2>
          </div>
          <div className="space-y-6 border-l border-white/[0.08] pl-6">
            <div className="relative">
              <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-[#4ade80]" />
              <p className="font-semibold text-[#f5f7fb]">Initiation & Core Sync</p>
              <p className="mt-2 text-sm text-[#aab1bd]">
                Package created and synchronized across root container nodes.
              </p>
              <p className="mt-2 text-xs text-[#4ade80]">Completed // {formatDate(pkg.createdAt)}</p>
            </div>
            <div className="relative">
              <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-[#d8cdfa]" />
              <p className="font-semibold text-[#f5f7fb]">Edge Expansion</p>
              <p className="mt-2 text-sm text-[#aab1bd]">
                Capability propagation aligned with current package features.
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[65%] rounded-full bg-[#d8cdfa]" />
              </div>
              <p className="mt-2 text-xs text-[#938f9a]">In progress // 65% stabilized</p>
            </div>
          </div>
        </div>

        <div className={`${glassCard} rounded-[32px] p-6`}>
          <div className="mb-4 flex items-center gap-3">
            <Layers className="h-5 w-5 text-[#d8cdfa]" />
            <h2 className="text-[22px] font-bold text-[#f5f7fb]">Theme Binding</h2>
          </div>
          {pkg.theme ? (
            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#938f9a]" style={monoTextStyle}>
                  Theme ID
                </p>
                <p className="mt-2 font-semibold text-[#f5f7fb]">{pkg.theme.id}</p>
              </div>
              <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#938f9a]" style={monoTextStyle}>
                  Domain URL
                </p>
                <p className="mt-2 break-all text-sm text-[#c9c4d0]">
                  {pkg.theme.domainUrl || "No domain configured"}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#938f9a]" style={monoTextStyle}>
                  Created At
                </p>
                <p className="mt-2 text-sm text-[#c9c4d0]">{formatDate(pkg.theme.createdAt)}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#8d94a1]">No theme assigned to this package.</p>
          )}
        </div>
      </section>
      <Dialog
        open={!!featureModal}
        onOpenChange={(open) => {
          if (!open) setFeatureModal(null);
        }}
      >
        <DialogContent className="border border-white/[0.08] bg-[#111417] text-[#f5f7fb] sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-4 w-4 text-[#d8cdfa]" />
              {featureModal?.label || "Feature details"}
            </DialogTitle>
            {featureModal?.details && (
              <DialogDescription className="mt-2 text-sm text-[#c9c4d0]">
                {featureModal.details}
              </DialogDescription>
            )}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackageDetailPage;
