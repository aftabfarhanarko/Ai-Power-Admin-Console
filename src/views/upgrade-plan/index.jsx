import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Check,
  Book,
  Flame,
  Download,
  ChevronRight,
  CheckCircle2,
  X,
  RotateCcw,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { generateInvoicePDF } from "@/pages/superadmin/invoice/InvoicePDFGenerator";
import { motion, AnimatePresence } from "framer-motion";
import { useGetPackagesQuery } from "@/features/package/packageApiSlice";
import { PaymentModal, AddonSection } from "./components";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRevertPackageMutation } from "@/features/systemuser/systemuserApiSlice";
import { userDetailsFetched } from "@/features/auth/authSlice";
import {
  useGetInvoicesQuery,
  useCreateInvoiceMutation,
  useInitiateBkashPaymentMutation,
  useSubmitBankPaymentMutation,
} from "@/features/invoice/invoiceApiSlice";

// Feature metadata: label + details, keyed by value (permission)
const FEATURES_OPTIONS = [
  {
    value: "PRODUCTS",
    label: "Products",
    details:
      "Manage all products (create, edit, delete, list, basic inventory).",
  },
  {
    value: "ORDERS",
    label: "Orders",
    details:
      "Access full order list, view order details and basic order actions.",
  },
  {
    value: "STEADFAST",
    label: "Steardfast",
    details: "Use Steadfast courier inside the console for order shipping.",
  },
  {
    value: "PATHAO",
    label: "Pathao",
    details: "Use Pathao courier inside the console for order shipping.",
  },
  {
    value: "REDX",
    label: "Redx",
    details: "Use RedX courier inside the console for order shipping.",
  },
  {
    value: "NOTIFICATIONS",
    label: "Notifications",
    details: "Access notification center and general notification features.",
  },
  {
    value: "EMAIL_NOTIFICATIONS",
    label: "Email Notifications",
    details: "Send and manage email-based notifications to customers.",
  },
  {
    value: "WHATSAPP_NOTIFICATIONS",
    label: "Whatsapp Notifications",
    details: "Send and manage WhatsApp-based notifications to customers.",
  },
  {
    value: "SMS_NOTIFICATIONS",
    label: "Sms Notifications",
    details: "Send and manage SMS-based notifications to customers.",
  },
  {
    value: "ORDERS_ITEM",
    label: "Orders Item",
    details:
      "View and manage line items inside each order (products, quantity, price).",
  },
  {
    value: "CATEGORY",
    label: "Category",
    details: "Create, edit and delete product categories.",
  },
  {
    value: "CUSTOMERS",
    label: "Customers",
    details:
      "View customer list, create new customers and manage customer profiles.",
  },
  {
    value: "REPORTS",
    label: "Reports",
    details:
      "Access different analytical and summary reports (sales, orders, etc.).",
  },
  {
    value: "SETTINGS",
    label: "Settings",
    details:
      "Access main settings page (general, account, preferences, billing, etc.).",
  },
  {
    value: "STAFF",
    label: "Staff",
    details: "Manage internal staff/users (list, create, edit, basic access).",
  },
  {
    value: "SMS_CONFIGURATION",
    label: "Sms Configuration",
    details: "Configure SMS gateway credentials and SMS sending settings.",
  },
  {
    value: "EMAIL_CONFIGURATION",
    label: "Email Configuration",
    details: "Configure email SMTP / provider settings for outgoing emails.",
  },
  {
    value: "PAYMENT_METHODS",
    label: "Payment Methods",
    details: "Set up offline payment methods (Cash, Bank Transfer, etc.).",
  },
  {
    value: "PAYMENT_GATEWAYS",
    label: "Payment Gateways",
    details: "Configure online gateways (SSLCommerz, Stripe, etc.).",
  },
  {
    value: "PAYMENT_STATUS",
    label: "Payment Status",
    details:
      "Define and manage different payment statuses (Paid, Unpaid, Pending).",
  },
  {
    value: "PAYMENT_TRANSACTIONS",
    label: "Payment Transactions",
    details: "View and track individual payment transaction history.",
  },
  {
    value: "PROMOCODES",
    label: "Promocodes",
    details: "Create and manage coupon codes / discount promo codes.",
  },
  {
    value: "HELP",
    label: "Help",
    details: "Access help center, support tickets and documentation section.",
  },
  {
    value: "BANNERS",
    label: "Banners",
    details: "Create and manage simple homepage / site banners.",
  },
  {
    value: "MANAGE_USERS",
    label: "Manage Users",
    details: "High-level user management (system owners and staff accounts).",
  },
  {
    value: "DASHBOARD",
    label: "Dashboard",
    details: "Access main dashboard with KPIs, charts and quick stats.",
  },
  {
    value: "REVENUE",
    label: "Revenue",
    details: "View revenue-related cards and graphs inside dashboard/reports.",
  },
  {
    value: "NEW_CUSTOMERS",
    label: "New Customers",
    details: "See metrics and widgets for newly acquired customers.",
  },
  {
    value: "REPEAT_PURCHASE_RATE",
    label: "Repeat Purchase Rate",
    details: "See repeat purchase rate stats and related KPIs.",
  },
  {
    value: "AVERAGE_ORDER_VALUE",
    label: "Average Order Value",
    details: "See AOV (average order value) stats and insights.",
  },
  {
    value: "STATS",
    label: "Stats",
    details: "Access extended statistics page with deeper analytics.",
  },
  {
    value: "LOG_ACTIVITY",
    label: "Log Activity",
    details: "View SquadLog / activity logs for user actions in the system.",
  },
  {
    value: "REVIEW",
    label: "Review",
    details: "View and manage customer product reviews.",
  },
  {
    value: "PATHAO_COURIER",
    label: "Pathao Courier",
    details: "Access Pathao courier integration pages and tools.",
  },
  {
    value: "STEADFAST_COURIER",
    label: "Steadfast Courier",
    details: "Access Steadfast courier integration pages and tools.",
  },
  {
    value: "REDX_COURIER",
    label: "Redx Courier",
    details: "Access RedX courier integration pages and tools.",
  },
  {
    value: "PATHAO_COURIER_CONFIGURATION",
    label: "Pathao Courier Configuration",
    details: "Configure Pathao API keys, credentials and courier settings.",
  },
  {
    value: "STEADFAST_COURIER_CONFIGURATION",
    label: "Steadfast Courier Configuration",
    details: "Configure Steadfast API keys, credentials and courier settings.",
  },
  {
    value: "REDX_COURIER_CONFIGURATION",
    label: "Redx Courier Configuration",
    details: "Configure RedX API keys, credentials and courier settings.",
  },
  {
    value: "SUPERADMIN_EARNINGS",
    label: "Superadmin Earnings",
    details:
      "Superadmin-level earnings overview and revenue data for all tenants.",
  },
  {
    value: "SUPERADMIN_STATISTICS",
    label: "Superadmin Statistics",
    details:
      "Global statistics panel for the superadmin (all stores / system-wide).",
  },
  {
    value: "AI_REPORT",
    label: "Ai Report",
    details:
      "AI-generated daily/periodic reports with insights and recommendations.",
  },
  {
    value: "AI_LIVE_FEED",
    label: "Ai Live Feed",
    details:
      "Real-time AI live feed of events, anomalies and important activities.",
  },
  {
    value: "AI_SALES_DIRECTION",
    label: "Ai Sales Direction",
    details:
      "AI guidance on what to push, which products to focus and sales direction.",
  },
  {
    value: "PRODUCT_BULK_UPLOAD",
    label: "Product Bulk Upload",
    details: "Upload many products at once using CSV / Excel bulk upload.",
  },
  {
    value: "INVENTORY_MANAGEMENT",
    label: "Inventory Management",
    details:
      "View and manage stock levels, inventory adjustments and stock list.",
  },
  {
    value: "INVENTORY_HISTORY",
    label: "Inventory History",
    details:
      "See detailed stock movement history (in/out, restock, adjustments).",
  },
  {
    value: "MEDIA_MANAGEMENT",
    label: "Media Management",
    details:
      "Access media library, upload and manage images/files used in the store.",
  },
  {
    value: "BANNER_MANAGEMENT",
    label: "Banner Management",
    details: "Advanced banner management for different positions and layouts.",
  },
  {
    value: "BANNERS_OFFERS_MARKETING",
    label: "Banners Offers Marketing",
    details:
      "Marketing-focused banners and offers management (campaign-style).",
  },
  {
    value: "ORDER_INVOICE_FINANCE",
    label: "Order Invoice Finance",
    details:
      "Access invoices, credit notes and financial views linked to orders.",
  },
  {
    value: "ORDER_CREATION_MANUAL",
    label: "Order Creation Manual",
    details: "Create orders manually from the console on behalf of customers.",
  },
  {
    value: "ORDER_TRACKING",
    label: "Order Tracking",
    details: "Use the console tracking page to follow order shipping status.",
  },
  {
    value: "ORDER_EDIT",
    label: "Order Edit",
    details:
      "Edit existing orders (items, customer info, amounts) from console.",
  },
  {
    value: "SALE_INVOICE_MANAGEMENT",
    label: "Sale Invoice Management",
    details:
      "Create, edit, view and manage sale invoices and recurring invoices.",
  },
  {
    value: "POLICY_LEGAL_CONTENT",
    label: "Policy Legal Content",
    details:
      "Access the full legal content section (all store policies together).",
  },
  {
    value: "PRIVACY_POLICY_MANAGEMENT",
    label: "Privacy Policy Management",
    details: "Create and edit the store’s privacy policy content.",
  },
  {
    value: "TERMS_CONDITIONS_MANAGEMENT",
    label: "Terms Conditions Management",
    details: "Create and edit terms & conditions content.",
  },
  {
    value: "REFUND_POLICY_MANAGEMENT",
    label: "Refund Policy Management",
    details: "Create and edit refund/return policy content.",
  },
  {
    value: "INTEGRATIONS_SETTINGS",
    label: "Integrations Settings",
    details:
      "Access integrations area for managing connected apps and services.",
  },
  {
    value: "CONNECTED_APPS",
    label: "Connected Apps",
    details: "View and manage all third‑party apps connected to the store.",
  },
  {
    value: "COURIER_INTEGRATION_SETTINGS",
    label: "Courier Integration Settings",
    details: "Central settings page for all courier integrations.",
  },
  {
    value: "NOTIFICATION_SETTINGS",
    label: "Notification Settings",
    details: "Configure how and when different notifications are sent.",
  },
  {
    value: "THEME_MANAGEMENT",
    label: "Theme Management",
    details: "Manage storefront themes, preview and switch between themes.",
  },
  {
    value: "CUSTOM_DOMAIN",
    label: "Custom Domain",
    details: "Connect and manage custom domains for the storefront.",
  },
];

const getFeatureMeta = (key) => {
  if (!key || typeof key !== "string") {
    return { label: key, details: "" };
  }
  const meta = FEATURES_OPTIONS.find((f) => f.value === key);
  if (meta) return meta;
  // Fallback: humanize the key
  const label = key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toLowerCase())
    .replace(/^./, (c) => c.toUpperCase());
  return { label, details: "" };
};

// Format permission key for display (using metadata where possible)
const featureLabel = (key) => getFeatureMeta(key).label;

// Format price from API (string "999.00" or number) for display
const formatPrice = (value) => {
  if (value == null || value === "") return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "—";
  return num % 1 === 0 ? String(num) : num.toFixed(2);
};

const DEFAULT_PACKAGE_DETAILS = {
  Starter: {
    subtitle: "Ideal for beginners starting ttheir e-commerce journey.",
    features: [
      "Up to 500 Products",
      "10,000 Monthly Visitors",
      "2 Staff Accounts",
      "Basic Reports & Dashboard",
      "Basic Courier Integration",
      "Manual Order Creation",
      "Email Support Only",
    ],
  },
  Premium: {
    subtitle: "For growing businesses needing more power.",
    features: [
      "Everything in Starter",
      "Unlimited Products",
      "50,000 Monthly Visitors",
      "5 Staff Accounts",
      "Full Courier Integrations",
      "Email & WhatsApp Notifications",
      "Payment Gateways & Promocodes",
      "AI Daily Insights",
      "Priority Chat + Email Support",
    ],
  },
  Enterprise: {
    subtitle: "Custom solutions for large-scale operations.",
    features: [
      "Everything in Premium",
      "Unlimited Products & Staff",
      "200,000+ Monthly Visitors",
      "Advanced AI & Live Feed",
      "Custom Domain & Superadmin",
      "Role-Based Access",
      "24/7 Priority + Dedicated Manager",
    ],
  },
};

const OptimizedUpgradePlan = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth?.user);
  const userPackageId = currentUser?.packageId ?? currentUser?.package?.id;
  const [revertPackage, { isLoading: isReverting }] =
    useRevertPackageMutation();
  const [createInvoice] = useCreateInvoiceMutation();
  const [initiateBkashPayment] = useInitiateBkashPaymentMutation();
  const [submitBankPayment] = useSubmitBankPaymentMutation();

  const {
    data: packagesFromApi,
    isLoading: packagesLoading,
    isError: packagesError,
    error: packagesErrorDetail,
    refetch: refetchPackages,
  } = useGetPackagesQuery(undefined, { refetchOnMountOrArgChange: true });
  // Support both: API returns array directly (after transform) or { statusCode, message, data: [] }
  const packagesList = (() => {
    if (Array.isArray(packagesFromApi)) return packagesFromApi;
    if (packagesFromApi?.data && Array.isArray(packagesFromApi.data))
      return packagesFromApi.data;
    return [];
  })();

  const { data: invoicesFromApi, isLoading: invoicesLoading } =
    useGetInvoicesQuery(undefined, { refetchOnMountOrArgChange: true });
  const invoicesList = (() => {
    if (Array.isArray(invoicesFromApi)) return invoicesFromApi;
    if (invoicesFromApi?.data && Array.isArray(invoicesFromApi.data))
      return invoicesFromApi.data;
    return [];
  })();

  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [addonForPayment, setAddonForPayment] = useState(null);

  const plans = useMemo(() => {
    return packagesList.map((pkg) => {
      const isUserPackage =
        pkg.id === userPackageId ||
        (userPackageId != null && Number(pkg.id) === Number(userPackageId));
      // API returns price/discountPrice as strings e.g. "999.00", "799.00"
      const rawPrice = pkg.price != null ? pkg.price : null;
      const rawDiscount = pkg.discountPrice != null ? pkg.discountPrice : null;
      const price =
        rawDiscount != null && String(rawDiscount).trim() !== ""
          ? String(rawDiscount)
          : rawPrice != null && String(rawPrice).trim() !== ""
            ? String(rawPrice)
            : "—";
      
      const details = DEFAULT_PACKAGE_DETAILS[pkg.name] || {
        subtitle: pkg.description || "",
        features: Array.isArray(pkg.features) ? [...pkg.features] : ["—"],
      };

      return {
        id: pkg.id,
        name: pkg.name || "Package",
        subtitle: details.subtitle,
        price,
        rawPrice: rawPrice != null ? String(rawPrice) : null,
        rawDiscount: rawDiscount != null ? String(rawDiscount) : null,
        features: details.features,
        permissions: Array.isArray(pkg.features) ? pkg.features : [],
        buttonText: isUserPackage ? "Active plan" : "Choose Plan",
        badge: isUserPackage ? "Current" : pkg.isFeatured ? "Popular" : null,
        isUserPackage,
      };
    });
  }, [packagesList, userPackageId]);

  // Select user's package by default when plans load
  useEffect(() => {
    if (plans.length && userPackageId != null) {
      const idx = plans.findIndex((p) => p.id === userPackageId);
      if (idx >= 0) setSelectedPlanIndex(idx);
    }
  }, [plans.length, userPackageId, plans]);

  // Logged-in user's current package (for hero section)
  const currentPlan = useMemo(
    () => plans.find((p) => p.isUserPackage) || null,
    [plans],
  );

  // Comparison rows: one per feature permission that exists in ANY plan, each plan gets ✓/✗
  const sortedPlans = useMemo(() => {
    const order = ["Starter", "Premium", "Enterprise"];
    return [...plans].sort((a, b) => {
      const idxA = order.indexOf(a.name);
      const idxB = order.indexOf(b.name);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }, [plans]);

  const comparisonSections = useMemo(() => {
    if (!sortedPlans.length) return [];

    const structure = [
      {
        title: "PRICING & USAGE",
        rows: [
          { label: "Monthly Price", key: "monthly_price" },
          { label: "Yearly Price (Save 20%)", key: "yearly_price" },
          { label: "Product Limit", key: "product_limit" },
          { label: "Visitors/Month", key: "visitors_month" },
          { label: "Staff Accounts", key: "staff_accounts" },
        ],
      },
      {
        title: "FEATURES",
        rows: [
          { label: "Basic Management (Products, Orders, Categories)", code: "PRODUCTS" },
          { label: "Courier Integrations (Full)", key: "courier_full" },
          { label: "Notifications (Email/WhatsApp)", key: "notifications_mix" },
          { label: "Advanced Reports & Analytics", key: "reports_adv" },
          { label: "AI Features (Reports, Live Feed, Sales Direction)", key: "ai_features" },
          { label: "Payment Gateways & Transactions", code: "PAYMENT_GATEWAY" },
          { label: "Inventory & Bulk Upload", code: "INVENTORY" },
          { label: "Marketing Tools (Promocodes, Banners)", code: "MARKETING" },
        ],
      },
      {
        title: "ADVANCED",
        rows: [
          { label: "Custom Domain & Themes", code: "CUSTOM_DOMAIN" },
          { label: "Superadmin & Role-Based Access", code: "SUPERADMIN" },
          { label: "Support Level", key: "support_level" },
        ],
      },
    ];

    const getPlanValue = (plan, row) => {
      const permissions = plan.permissions || [];
      
      // Handle technical codes first
      if (row.code) {
        // Some codes might be different in API, map them if needed
        const codeMap = {
          'PAYMENT_GATEWAY': 'PAYMENTS', // Hypothetical, but common
          'MARKETING': 'PROMO_CODES', // and others
        };
        const actualCode = codeMap[row.code] || row.code;
        return permissions.includes(actualCode);
      }

      // Handle specific keys for marketing data synchronization
      const planData = {
        Starter: {
          monthly_price: "$29",
          yearly_price: "$288 ($24/mo)",
          product_limit: "500",
          visitors_month: "10,000",
          staff_accounts: "2",
          courier_full: "X (Basic)",
          notifications_mix: false,
          reports_adv: "X (Basic)",
          ai_features: "X (None)",
          support_level: "Email",
        },
        Premium: {
          monthly_price: "$79",
          yearly_price: "$768 ($64/mo)",
          product_limit: "Unlimited",
          visitors_month: "50,000",
          staff_accounts: "5",
          courier_full: true,
          notifications_mix: true,
          reports_adv: true,
          ai_features: "✓ (Basic)",
          support_level: "Priority Chat + Email",
        },
        Enterprise: {
          monthly_price: "$149",
          yearly_price: "$1,428 ($119/mo)",
          product_limit: "Unlimited",
          visitors_month: "200,000+",
          staff_accounts: "Unlimited",
          courier_full: true,
          notifications_mix: true,
          reports_adv: true,
          ai_features: "✓ (Full)",
          support_level: "24/7 + Dedicated",
        }
      };

      const data = planData[plan.name];
      if (data && data[row.key] !== undefined) {
        return data[row.key];
      }

      return false;
    };

    return structure.map((section) => ({
      title: section.title,
      rows: section.rows.map((row) => ({
        label: row.label,
        details: "", // Can add details if needed
        planValues: sortedPlans.map((p) => getPlanValue(p, row)),
      })),
    }));
  }, [sortedPlans]);

  const renderComparisonValue = (value) => {
    if (value === true) {
      return (
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          </div>
        </div>
      );
    }
    if (value === false) {
      return (
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <X className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          </div>
        </div>
      );
    }

    // Handle string patterns like "X (Basic)" or "✓ (Basic)"
    if (typeof value === "string") {
      if (value.startsWith("✓")) {
        return (
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-6 h-6 rounded-full border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            </div>
            <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
              {value.replace("✓", "").trim()}
            </span>
          </div>
        );
      }
      if (value.startsWith("X")) {
        return (
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-6 h-6 rounded-full border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <X className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm font-medium text-red-700 dark:text-red-300">
              {value.replace("X", "").trim()}
            </span>
          </div>
        );
      }
    }

    return <span className="text-sm font-medium text-gray-600">{value}</span>;
  };

  // Build billing history from API invoices (package-type only for this page, or all)
  const billingHistory = useMemo(() => {
    return invoicesList.map((inv, index) => {
      const planName =
        plans.find((p) => p.id === inv.packageId)?.name ||
        (inv.packageId ? `Plan #${inv.packageId}` : "—");
      const created = inv.createdAt ? new Date(inv.createdAt) : null;
      const dateStr = created
        ? created.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—";
      const amount =
        inv.totalAmount != null ? formatPrice(inv.totalAmount) : "—";
      const status =
        inv.status === "paid"
          ? "Success"
          : inv.status
            ? String(inv.status).charAt(0).toUpperCase() +
              String(inv.status).slice(1)
            : "—";
      return {
        id: String(inv.id),
        invoice: inv.invoiceNumber || `Invoice#${inv.id}`,
        date: dateStr,
        amount: `$${amount}`,
        plan: planName,
        status,
        raw: inv,
      };
    });
  }, [invoicesList, plans]);

  const totalPaidFromInvoices = useMemo(() => {
    return billingHistory
      .filter((b) => b.raw?.status === "paid")
      .reduce((sum, b) => sum + parseFloat(b.raw?.totalAmount || 0), 0);
  }, [billingHistory]);

  const [isExpanded, setIsExpanded] = useState(true);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  // Payment modal (when clicking "Choose Plan")
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [planForPayment, setPlanForPayment] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("bkash");
  const [bankPaymentData, setBankPaymentData] = useState({
    bankName: "",
    accLastDigit: "",
  });
  const [isLoadingBkash, setIsLoadingBkash] = useState(false);
  const [isLoadingBank, setIsLoadingBank] = useState(false);

  const openPaymentModal = (plan) => {
    if (plan?.buttonText === "Choose Plan") {
      setPlanForPayment(plan);
      setSelectedPaymentMethod("bkash");
      setBankPaymentData({ bankName: "", accLastDigit: "" });
      setShowPaymentModal(true);
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPlanForPayment(null);
  };

  const handleDownloadInvoice = (invoice) => {
    try {
      const invoiceWithCustomer = {
        ...invoice,
        customer: invoice.customer || {
          name: currentUser?.name,
          email: currentUser?.email,
          companyName: currentUser?.companyName,
          companyId: currentUser?.companyId,
          phone: currentUser?.phone,
          branchLocation: currentUser?.branchLocation,
          paymentInfo: currentUser?.paymentInfo,
        },
      };
      generateInvoicePDF(invoiceWithCustomer);
      toast.success("Invoice downloaded");
    } catch (err) {
      console.error("Invoice download failed:", err);
      toast.error("Failed to download invoice");
    }
  };

  const handlePurchaseAddon = (addon) => {
    setPlanForPayment(null);
    setAddonForPayment(addon);
    setShowPaymentModal(true);
  };

  const handleBkashPayment = async () => {
    if (!currentUser?.id) return;
    const isAddon = !!addonForPayment;
    const item = isAddon ? addonForPayment : planForPayment;
    if (!item?.id && !isAddon) return;

    setIsLoadingBkash(true);
    try {
      const amount = parseFloat(item.price);
      if (Number.isNaN(amount) || amount <= 0) {
        throw new Error("Invalid price");
      }
      const createRes = await createInvoice({
        customerId: currentUser.id,
        ...(isAddon ? {} : { packageId: item.id }),
        totalAmount: amount,
        paidAmount: 0,
        amountType: isAddon ? "addon" : "package",
        status: "pending",
        ...(isAddon && {
          addonDetails: {
            type: addonForPayment.type,
            value: addonForPayment.value,
          },
        }),
      }).unwrap();
      const invoice = Array.isArray(createRes) ? createRes[0] : createRes;
      const invoiceId = invoice?.id ?? createRes?.id;
      if (!invoiceId) throw new Error("Invoice not created");
      const initRes = await initiateBkashPayment({ invoiceId }).unwrap();
      const bkashURL = initRes?.bkashURL ?? initRes?.data?.bkashURL;
      if (bkashURL) {
        closePaymentModal();
        window.location.href = bkashURL;
        return;
      }
      throw new Error("bKash URL not received");
    } catch (err) {
      console.error("bKash payment failed:", err);
      setIsLoadingBkash(false);
    }
  };

  const handleBankPayment = async () => {
    if (!currentUser?.id) return;
    const isAddon = !!addonForPayment;
    const item = isAddon ? addonForPayment : planForPayment;
    if (!item?.id && !isAddon) return;

    setIsLoadingBank(true);
    try {
      const amount = parseFloat(item.price);
      if (Number.isNaN(amount) || amount <= 0) {
        throw new Error("Invalid price");
      }
      const createRes = await createInvoice({
        customerId: currentUser.id,
        ...(isAddon ? {} : { packageId: item.id }),
        totalAmount: amount,
        paidAmount: 0,
        amountType: isAddon ? "addon" : "package",
        status: "pending",
        ...(isAddon && {
          addonDetails: {
            type: addonForPayment.type,
            value: addonForPayment.value,
          },
        }),
      }).unwrap();
      const invoice = Array.isArray(createRes) ? createRes[0] : createRes;
      const invoiceId = invoice?.id ?? createRes?.id;
      if (!invoiceId) throw new Error("Invoice not created");
      await submitBankPayment({
        invoiceId,
        bankName: bankPaymentData.bankName,
        accLastDigit: bankPaymentData.accLastDigit,
      }).unwrap();
      closePaymentModal();
    } catch (err) {
      console.error("Bank payment submit failed:", err);
    } finally {
      setIsLoadingBank(false);
    }
  };

  const paymentInvoice = useMemo(() => {
    if (addonForPayment) {
      return {
        invoiceNumber: `Addon-${addonForPayment.type}`,
        dueAmount: addonForPayment.price,
        totalAmount: addonForPayment.price,
        isAddon: true,
        addonTitle: addonForPayment.title,
      };
    }
    if (!planForPayment) return null;
    return {
      invoiceNumber: `Plan-${planForPayment.id}`,
      dueAmount: planForPayment.price,
      totalAmount: planForPayment.price,
    };
  }, [planForPayment, addonForPayment]);

  const hasPreviousPackage = currentUser?.previousPackageId != null;
  const handleRevertToPreviousPlan = async () => {
    if (!currentUser?.id || !hasPreviousPackage) return;
    try {
      const result = await revertPackage(currentUser.id).unwrap();
      dispatch(userDetailsFetched(result));
    } catch (err) {
      console.error("Revert package failed:", err);
    }
  };

  const toggleRowSelection = (index) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 1, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0f14]">
      {/* Revert to previous plan (fallback) banner */}
      {hasPreviousPackage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-8 md:px-12 pt-6"
        >
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium flex items-center gap-2">
              <RotateCcw className="w-4 h-4 flex-shrink-0" />
              Your last upgrade wasn’t completed. Revert to your previous plan?
            </p>
            <button
              type="button"
              onClick={handleRevertToPreviousPlan}
              disabled={isReverting}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold disabled:opacity-60 flex items-center gap-2"
            >
              {isReverting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Reverting...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Revert to previous plan
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Section 1: Hero / Current package */}
      <motion.section
        className="bg-white dark:bg-transparent p-8 md:p-12 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="rounded-3xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 p-8 md:p-12 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left side – package name & price */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg text-xs font-bold border border-orange-200 dark:border-orange-700">
                  BUSINESS
                </span>
                {currentPlan && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full text-xs font-bold shadow-lg shadow-purple-600/20">
                    <Flame className="w-3.5 h-3.5" />
                    {currentPlan.badge === "Current"
                      ? "Current plan"
                      : "Most Popular"}
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-gray-600 dark:text-slate-400 text-lg font-semibold mb-1">
                  Your current package
                </h2>
                {currentPlan?.subtitle && (
                  <p className="text-gray-500 dark:text-slate-500 text-sm">
                    {currentPlan.subtitle}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-gray-900 dark:text-white">
                    {currentPlan?.price != null && currentPlan.price !== "—"
                      ? `$${formatPrice(currentPlan.price)}`
                      : currentUser?.package?.price != null && currentUser.package.price !== "—"
                        ? `$${formatPrice(currentUser.package.price)}`
                        : "—"}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    per seat/month · billed annually
                  </span>
                </div>
                {currentPlan && currentPlan.price !== "—" && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2 flex-wrap">
                    {(currentPlan.rawPrice &&
                      currentPlan.rawDiscount &&
                      parseFloat(currentPlan.rawDiscount) <
                        parseFloat(currentPlan.rawPrice)) ||
                    (currentUser?.package?.price != null &&
                      currentUser.package.discountPrice != null) ? (
                      <>
                        <span className="line-through opacity-60">
                          $
                          {formatPrice(
                            currentPlan.rawPrice || currentUser?.package?.price,
                          )}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded text-xs font-bold border border-green-200 dark:border-green-800">
                          Save{" "}
                          {Math.round(
                            (1 -
                              parseFloat(
                                currentPlan.rawDiscount ||
                                  currentUser?.package?.discountPrice,
                              ) /
                                parseFloat(
                                  currentPlan.rawPrice ||
                                    currentUser?.package?.price,
                                )) *
                              100,
                          )}
                          %
                        </span>
                      </>
                    ) : null}
                    Billed monthly
                  </p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-purple-600/20 transition-all"
                onClick={() =>
                  document
                    .getElementById("plans")
                    ?.scrollIntoView?.({ behavior: "smooth" })
                }
              >
                {currentPlan ? "Compare & upgrade" : "View plans"}
              </motion.button>

              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                14-day money-back guarantee · Cancel anytime
              </p>
            </motion.div>

            {/* Right side – package features */}
            <motion.div
              className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 space-y-4 border border-gray-100 dark:border-slate-800"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-gray-900 dark:text-white font-bold text-base flex items-center gap-2">
                <span className="text-purple-600">✓</span>
                {currentPlan
                  ? `${currentPlan.name} includes:`
                  : "Everything in our plans:"}
              </p>

              <div className="space-y-3">
                {(currentPlan?.features?.length
                  ? currentPlan.features.filter((f) => f !== "—")
                  : [
                      "Multi-platform Selling",
                      "Full Courier Integration",
                      "POS & Order Management",
                      "AI Sales Insights",
                      "Advanced Customer CRM",
                      "Inventory & Bulk Operations",
                      "Custom Domain & Branding",
                    ]
                ).map((feature, i) => {
                  const { label, details } =
                    typeof feature === "string" && feature.length > 2
                      ? getFeatureMeta(feature)
                      : { label: feature, details: "" };
                  return (
                    <motion.div
                      key={i}
                      className="flex items-start gap-3 group cursor-pointer"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                    >
                      <div className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0" />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">
                          {label}
                        </span>
                        {details && (
                          <button
                            type="button"
                            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-help"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {details && (
                          <div className="w-full">
                            <span className="text-xs font-normal text-gray-500 overflow-hidden max-h-0 opacity-0 mt-0 group-hover:max-h-40 group-hover:opacity-100 group-hover:mt-0.5 transition-all duration-700 ease-in-out block">
                              {details}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Addons Section */}
      <motion.section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-orange-500 to-red-500"></div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Growth Add-ons
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Top up your resources instantly without upgrading your entire plan
            </p>
          </div>
        </div>
        <AddonSection
          onPurchase={handlePurchaseAddon}
          isCreatingInvoice={isLoadingBkash || isLoadingBank}
        />
      </motion.section>

      {/* Section 2: Pricing Cards */}
      <motion.section
        className="bg-white dark:bg-transparent p-8 md:p-12 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {packagesLoading ? (
          <motion.div
            className="flex items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-gray-500 dark:text-gray-400">
              Loading packages…
            </div>
          </motion.div>
        ) : packagesError ? (
          <motion.div
            className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-red-700 dark:text-red-300 font-medium mb-2">
              Failed to load packages
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              {packagesErrorDetail?.data?.message ||
                packagesErrorDetail?.error ||
                "Check your connection and try again."}
            </p>
            <button
              type="button"
              onClick={() => refetchPackages()}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700"
            >
              Retry
            </button>
          </motion.div>
        ) : !plans.length ? (
          <motion.div
            className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-12 text-center text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No packages available. Contact support to add plans.
          </motion.div>
        ) : (
          <motion.div
            id="plans"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6 mb-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {plans.map((plan, index) => {
              const isActive = index === selectedPlanIndex;

              return (
                <motion.div
                  key={plan.id ?? index}
                  layout
                  onClick={() => setSelectedPlanIndex(index)}
                  whileHover={{ y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  variants={itemVariants}
                  className={`rounded-2xl p-8 cursor-pointer border-2 transition-all duration-300 relative overflow-hidden ${
                    isActive
                      ? "bg-gradient-to-br from-purple-600 to-purple-700 border-purple-600 text-white shadow-xl shadow-purple-600/20"
                      : plan.isUserPackage
                        ? "bg-white dark:bg-slate-900 border-purple-400 dark:border-purple-500 shadow-md hover:shadow-lg ring-2 ring-purple-200 dark:ring-purple-900/50"
                        : "bg-white dark:bg-slate-900/50 border-gray-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-500 shadow-sm hover:shadow-md"
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <motion.div
                      className={`absolute top-6 right-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        plan.isUserPackage && !isActive
                          ? "bg-purple-600 text-white"
                          : "bg-white/20 text-white backdrop-blur-sm"
                      }`}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", delay: 0.3 }}
                    >
                      <Flame className="w-3.5 h-3.5" />
                      {plan.badge}
                    </motion.div>
                  )}

                  {/* Content */}
                  <div className="mb-8">
                    <h3
                      className={`text-2xl font-bold mb-1 ${isActive ? "text-white" : "text-gray-900"}`}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={`text-sm ${isActive ? "text-purple-100" : "text-gray-500"}`}
                    >
                      {plan.subtitle}
                    </p>
                  </div>

                  {/* Price */}
                  <motion.div
                    className="mb-8"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-baseline gap-1 mb-1">
                      <span
                        className={`text-4xl font-black ${isActive ? "text-white" : "text-gray-900 dark:text-white"}`}
                      >
                        ${formatPrice(plan.price)}
                      </span>
                      <span
                        className={`text-sm ${isActive ? "text-purple-100" : "text-gray-500 dark:text-gray-400"}`}
                      >
                        /year
                      </span>
                    </div>
                    {plan.rawPrice &&
                      plan.rawDiscount &&
                      parseFloat(plan.rawDiscount) <
                        parseFloat(plan.rawPrice) && (
                        <p
                          className={`text-sm flex items-center gap-2 mt-1 ${isActive ? "text-purple-100" : "text-gray-500 dark:text-gray-400"}`}
                        >
                          <span className="line-through opacity-70">
                            ${formatPrice(plan.rawPrice)}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded text-xs font-bold">
                            Save{" "}
                            {Math.round(
                              (1 -
                                parseFloat(plan.rawDiscount) /
                                  parseFloat(plan.rawPrice)) *
                                100,
                            )}
                            %
                          </span>
                        </p>
                      )}
                  </motion.div>

                  {/* Features */}
                  <motion.div
                    className="flex-1 space-y-4 mb-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {plan.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        className="flex items-center gap-3"
                        variants={itemVariants}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + idx * 0.1 }}
                        >
                          <Check
                            className={`w-5 h-5 ${
                              isActive ? "text-purple-200" : "text-purple-600"
                            }`}
                          />
                        </motion.div>
                        <span
                          className={`text-sm font-medium ${
                            isActive ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {typeof feature === "string" && feature.length > 2
                            ? featureLabel(feature)
                            : feature}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Button */}
                  <motion.button
                    type="button"
                    className={`w-full py-3 rounded-xl font-bold text-base transition-all ${
                      isActive
                        ? "bg-white text-purple-600 hover:bg-purple-50"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openPaymentModal(plan);
                    }}
                  >
                    {isActive ? `✓ ${plan.buttonText}` : plan.buttonText}
                  </motion.button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.section>

      {/* Section 3: Feature Comparison */}
      <motion.section
        className="bg-white dark:bg-transparent p-8 md:p-12 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-2">
              <Book className="w-6 h-6 text-purple-600" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Compare features by plan
              </h3>
            </div>
            <p className="text-sm text-gray-500 ml-9">
              Easily compare features across all available plans.
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <div className="w-full min-w-[800px]">
              {/* Table Header */}
              <div
                className="grid bg-gray-100/50 dark:bg-slate-800/30 border-b border-gray-200 dark:border-slate-800"
                style={{
                  gridTemplateColumns: `minmax(180px, 1fr) repeat(${sortedPlans.length}, minmax(100px, 1fr))`,
                }}
              >
                <div className="p-4 font-bold text-gray-900 flex items-center">
                  <span className="text-purple-600 font-bold text-sm bg-purple-50 px-2 py-1 rounded">
                    Feature
                  </span>
                </div>
                {sortedPlans.map((plan, idx) => (
                  <div
                    key={plan.id ?? idx}
                    className={`p-4 text-center font-bold text-gray-900 dark:text-white bg-gray-50/50 dark:bg-slate-800/30 border-l border-gray-100 dark:border-slate-800 ${
                      plan.isUserPackage
                        ? "bg-purple-50/80 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                        : ""
                    }`}
                  >
                    {plan.name}
                    {plan.isUserPackage && (
                      <span className="block text-xs font-normal text-purple-600 mt-0.5">
                        Your plan
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Rows: categorized features */}
              <AnimatePresence>
                {isExpanded && sortedPlans.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="divide-y divide-gray-100">
                      {comparisonSections.map((section, sIdx) => (
                        <React.Fragment key={sIdx}>
                          {/* Category Header Row */}
                          <div
                            className="grid bg-gray-50/50 dark:bg-slate-800/20 border-y border-gray-100 dark:border-slate-800"
                            style={{
                              gridTemplateColumns: `minmax(180px, 1fr) repeat(${sortedPlans.length}, minmax(100px, 1fr))`,
                            }}
                          >
                            <div className="p-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-4">
                              {section.title}
                            </div>
                            {sortedPlans.map((_, pIdx) => (
                              <div
                                key={pIdx}
                                className="border-l border-gray-50"
                              />
                            ))}
                          </div>

                          {section.rows.map((row, rIdx) => (
                            <div
                              key={rIdx}
                              className="grid hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors"
                              style={{
                                gridTemplateColumns: `minmax(180px, 1fr) repeat(${sortedPlans.length}, minmax(100px, 1fr))`,
                              }}
                            >
                              <div className="p-4 py-3 text-sm font-medium text-gray-700 dark:text-slate-300 flex flex-col group cursor-pointer">
                                <div className="flex items-center gap-1.5">
                                  <span>{row.label}</span>
                                  {row.details && (
                                    <button
                                      type="button"
                                      className="text-gray-400 hover:text-gray-600 cursor-help"
                                    >
                                      <Info className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                                {row.details && (
                                  <span className="text-xs font-normal text-gray-500 overflow-hidden max-h-0 opacity-0 mt-0 group-hover:max-h-40 group-hover:opacity-100 group-hover:mt-0.5 transition-all duration-700 ease-in-out block">
                                    {row.details}
                                  </span>
                                )}
                              </div>
                              {(row.planValues || []).map((value, planIdx) => (
                                <div
                                  key={planIdx}
                                  className={`p-4 py-3 text-center flex items-center justify-center border-l border-gray-50 dark:border-slate-800/50 ${
                                    sortedPlans[planIdx]?.isUserPackage
                                      ? "bg-purple-50/30 dark:bg-purple-900/10"
                                      : ""
                                  }`}
                                >
                                  {renderComparisonValue(value)}
                                </div>
                              ))}
                            </div>
                          ))}
                        </React.Fragment>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer toggle */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:text-blue-700"
            >
              {isExpanded
                ? "Hide Detailed Plan Comparison"
                : "Show Detailed Plan Comparison"}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight className="w-4 h-4 rotate-90" />
              </motion.div>
            </button>
          </div>
        </motion.div>
      </motion.section>

      {/* Section 4: Billing History */}
      <motion.section
        className="bg-white dark:bg-transparent p-8 md:p-12 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Billing History</h3>
            <motion.span
              className="text-sm text-gray-500 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {selectedRows.size > 0
                ? `${selectedRows.size} selected`
                : `${billingHistory.length} invoices`}
            </motion.span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-purple-600 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(
                            new Set(billingHistory.map((_, i) => i)),
                          );
                        } else {
                          setSelectedRows(new Set());
                        }
                      }}
                      checked={selectedRows.size === billingHistory.length}
                    />
                  </th>
                  <th className="text-left p-4 font-bold text-gray-600 dark:text-slate-400">No</th>
                  <th className="text-left p-4 font-bold text-gray-600 dark:text-slate-400">
                    Invoices
                  </th>
                  <th className="text-left p-4 font-bold text-gray-600 dark:text-slate-400">
                    Created Date
                  </th>
                  <th className="text-left p-4 font-bold text-gray-600 dark:text-slate-400">
                    Amount
                  </th>
                  <th className="text-left p-4 font-bold text-gray-600 dark:text-slate-400">
                    Plan
                  </th>
                  <th className="text-left p-4 font-bold text-gray-600 dark:text-slate-400">
                    Status
                  </th>
                  <th className="text-right p-4 font-bold text-gray-600 dark:text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {invoicesLoading ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">
                        Loading invoices...
                      </td>
                    </tr>
                  ) : billingHistory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">
                        No invoices yet.
                      </td>
                    </tr>
                  ) : (
                    billingHistory.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${
                          selectedRows.has(index) ? "bg-purple-50 dark:bg-purple-900/20" : ""
                        }`}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-purple-600 cursor-pointer"
                            checked={selectedRows.has(index)}
                            onChange={() => toggleRowSelection(index)}
                          />
                        </td>
                        <td className="p-4 font-semibold text-gray-900 dark:text-white">
                          {item.id}
                        </td>
                        <td className="p-4 font-semibold text-gray-900 dark:text-white">
                          {item.invoice}
                        </td>
                        <td className="p-4 text-gray-600 dark:text-slate-400">{item.date}</td>
                        <td className="p-4 font-semibold text-gray-900 dark:text-white">
                          💰 {item.amount}
                        </td>
                        <td className="p-4 text-gray-700 dark:text-slate-300">{item.plan}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                              item.raw?.status === "paid"
                                ? "bg-green-100 text-green-700"
                                : item.raw?.status === "pending"
                                  ? "bg-amber-100 text-amber-700"
                                  : item.raw?.status === "cancelled" ||
                                      item.raw?.status === "failed"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {item.raw?.status === "paid" && (
                              <Check className="w-3 h-3" />
                            )}
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <motion.div
                            className="flex items-center justify-end"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                          >
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDownloadInvoice(item.raw)}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                            >
                              <Download className="w-4 h-4" />
                              Download invoice
                            </motion.button>
                          </motion.div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-gray-50 dark:bg-slate-800/30 border-t border-gray-200 dark:border-slate-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.75 }}
            >
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Total Invoices
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {billingHistory.length}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Total Paid
              </p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${totalPaidFromInvoices.toFixed(2)}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85 }}
            >
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Status
              </p>
              <p className="text-3xl font-bold text-blue-600 mt-2">Active</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={closePaymentModal}
        invoice={paymentInvoice}
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodChange={setSelectedPaymentMethod}
        bankPaymentData={bankPaymentData}
        onBankPaymentDataChange={setBankPaymentData}
        onBkashPayment={handleBkashPayment}
        onBankPayment={handleBankPayment}
        isLoadingBkash={isLoadingBkash}
        isLoadingBank={isLoadingBank}
      />
    </div>
  );
};

export default OptimizedUpgradePlan;
