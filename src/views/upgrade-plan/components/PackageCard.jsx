import React, { useState } from "react";
import { Check, Star, ArrowRight, Zap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Feature metadata: label + details, keyed by value (permission)
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

const getFeatureMeta = (code) => {
  const meta = FEATURES_OPTIONS.find((f) => f.value === code);
  if (!meta) {
    return {
      label: code.replace(/_/g, " "),
      details: "",
    };
  }
  return meta;
};

export const PackageCard = ({ pkg, isCurrentPackage, onSelect }) => {
  const price = parseFloat(pkg.discountPrice || pkg.price);
  const originalPrice = pkg.discountPrice ? parseFloat(pkg.price) : null;
  const [featureModal, setFeatureModal] = useState(null);

  return (
    <div
      className={`rounded-2xl border p-6 transition-all ${
        isCurrentPackage
          ? "bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-700"
          : pkg.isFeatured
          ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-300 dark:border-amber-700 shadow-lg"
          : "bg-white dark:bg-[#1a1f26] border-gray-100 dark:border-gray-800 hover:border-black/20 dark:hover:border-white/20 hover:shadow-md"
      }`}
    >
      {/* Package Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {pkg.name}
            {pkg.isFeatured && (
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            )}
          </h3>
          <p className="text-xs text-black/60 dark:text-white/60 mt-1 line-clamp-2">
            {pkg.description}
          </p>
        </div>
        {isCurrentPackage && (
          <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
            <Check className="h-3 w-3" />
            Active
          </span>
        )}
      </div>

      {/* Pricing */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">৳{price.toFixed(2)}</span>
          <span className="text-sm text-black/60 dark:text-white/60">/month</span>
        </div>
        {originalPrice && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-black/40 dark:text-white/40 line-through">
              ৳{originalPrice.toFixed(2)}
            </span>
            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded-full font-medium">
              {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
            </span>
          </div>
        )}
      </div>

      {/* Features */}
      {pkg.features && pkg.features.length > 0 && (
        <div className="mb-4 space-y-2">
          {pkg.features.map((feature, idx) => {
            const { label, details } = getFeatureMeta(feature);
            return (
              <div key={idx} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 flex items-start gap-1.5">
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-black/80 dark:text-white">
                      {label}
                    </span>
                    {details && (
                      <p className="text-[11px] text-black/60 dark:text-white/60 mt-0.5">
                        {details}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="mt-0.5 text-current/70 hover:text-current cursor-pointer"
                    title={details || "No additional details available"}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (details) {
                        setFeatureModal({ label, details });
                      }
                    }}
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={() => onSelect(pkg)}
        disabled={isCurrentPackage}
        className={`w-full ${
          isCurrentPackage
            ? "bg-green-500/20 text-green-700 dark:text-green-300 cursor-not-allowed"
            : pkg.isFeatured
            ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            : "bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black"
        }`}
      >
        {isCurrentPackage ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Current Plan
          </>
        ) : (
          <>
            {pkg.isFeatured ? (
              <Zap className="h-4 w-4 mr-2" />
            ) : (
              <ArrowRight className="h-4 w-4 mr-2" />
            )}
            Select Plan
          </>
        )}
      </Button>

      {/* Feature details modal */}
      <Dialog
        open={!!featureModal}
        onOpenChange={(open) => {
          if (!open) setFeatureModal(null);
        }}
      >
        <DialogContent className="sm:max-w-[420px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-4 w-4 text-purple-600" />
              {featureModal?.label || "Feature details"}
            </DialogTitle>
            {featureModal?.details && (
              <DialogDescription className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {featureModal.details}
              </DialogDescription>
            )}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};
