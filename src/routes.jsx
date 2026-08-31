import { createBrowserRouter } from "react-router-dom";

// LAYOUTS
import Layout from "./layout/layout";
import SuperAdminLayout from "./layout/superadmin/layout";

import ErrorPage from "@/views/common/errorPage";

import LoginPage from "@/views/auth/login";
import AdminLoginPage from "@/views/auth/admin-login";
import SuperAdminLoginPage from "@/views/superadmin/login";
import UnifiedLoginPage from "@/views/auth/unified-login";

import PrivateRoute from "./hooks/usePrivateRoute";
import SuperAdminPrivateRoute from "./hooks/useSuperAdminPrivateRoute";
import PermissionRoute from "./hooks/PermissionRoute";
import { FeaturePermission } from "./constants/feature-permission";

import ForgotPasswordRequestPage from "@/views/auth/forgot-password/password-request";
import ResetPasswordPage from "@/views/auth/forgot-password/reset-password";
import CheckResetPasswordEmailPage from "@/views/auth/forgot-password/check-email";
import RegisterPage from "@/views/auth/register";
import DashboardPage from "@/views/dashboard";
import AiReportPage from "@/views/ai-report";
import AiLiveFeedPage from "@/views/ai-live-feed";
import AiSalesDirectionPage from "@/views/ai-sales-direction";
import CategoriesPage from "@/views/categories";
import CreateCategoryPage from "@/views/categories/create";
import CategoryEditPage from "@/views/categories/_id/edit";
import ProductsPage from "@/views/products";
import CreateProductPage from "@/views/products/create";
import BulkUploadPage from "@/views/products/bulk-upload";
import ProductViewPage from "@/views/products/_id";
import ProductEditPage from "@/views/products/_id/edit";
import InventoryPage from "@/views/inventory";
import InventoryHistoryPage from "@/views/inventory/history";
import FlashSellPage from "@/views/flash-sell";
import CustomersPage from "@/views/customers";
import CreateCustomerPage from "@/views/customers/create";
import CustomerDetailsPage from "@/views/customers/details";
import OrdersPage from "@/views/orders";
import CreateOrderPage from "@/views/orders/create";
import OrderTrackPage from "@/views/orders/track";
import OrderViewPage from "@/views/orders/_id";

import OrderEditPage from "@/views/orders/_id/edit";
import InvoicesPage from "@/views/invoices";
import CreateInvoicePage from "@/views/invoices/create";
import SaleInvoiceDetailsPage from "@/views/invoices/[id]/details";
import SaleInvoiceEditPage from "@/views/invoices/[id]/edit";
import CreditNotesPage from "@/views/credit-notes";
import CreateCreditNotePage from "@/views/credit-notes/create";
import CreditNoteDetailsPage from "@/views/credit-notes/_id";
import FraudPage from "@/views/fraud";
import BannerPage from "@/views/banner";
import CreateBannerPage from "@/views/banner/create";
import BannerEditPage from "@/views/banner/_id/edit";
import PromocodePage from "@/views/promocode";
import CreatePromocodePage from "@/views/promocode/create";
import PromocodeEditPage from "@/views/promocode/_id/edit";
import HelpPage from "@/views/help";
import CreateHelpPage from "@/views/help/create";
import HelpDetailPage from "@/views/help/_id";
import ReviewsPage from "@/views/reviews";
import ReviewDetailPage from "@/views/reviews/_id";
import SettingsPage from "@/views/settings"; // settings
import ManageUsersPage from "@/views/manageuser"; // manage users
import CreateUserPage from "@/views/manageuser/create";
import EditUserPage from "@/views/manageuser/edit";
import PermissionManagerPage from "@/views/manageuser/permissions";
import ActivityLogsPage from "@/views/manageuser/activity-logs";
import SuperAdminOverviewPage from "@/views/superadmin"; // super admin overview
import SuperAdminEarningsPage from "@/views/superadmin/earnings";
import SuperAdminCustomersPage from "@/views/superadmin/customers";
import SuperAdminCustomerDetailPage from "@/views/superadmin/customer-detail";
import SuperAdminCustomerEditPage from "@/views/superadmin/customer-edit";
import SuperAdminCustomerCreatePage from "@/views/superadmin/customer-create";
import SuperAdminSupportPage from "@/views/superadmin/support";
import SuperAdminSupportDetailPage from "@/views/superadmin/support-detail";
import SuperAdminSupportCreatePage from "@/views/superadmin/support-create";
import PackageManagementPage from "@/views/superadmin/packagemanagement";
import PackageDetailPage from "@/views/superadmin/package-detail";
import PackageEditPage from "@/views/superadmin/package-edit";
import PackageCreatePage from "@/views/superadmin/package-create";
import ThemeManagementPage from "@/views/superadmin/thememanagement";
import ThemeCreatePage from "@/views/superadmin/theme-create";
import ThemeDetailPage from "@/views/superadmin/theme-detail";
import ThemeEditPage from "@/views/superadmin/theme-edit";
import InvoiceManagementPage from "@/views/superadmin/invoice";
import InvoiceCreatePage from "@/views/superadmin/invoice/create";
import SuperAdminSuperadminsPage from "@/views/superadmin/superadmins";
import SuperAdminSuperadminDetailPage from "@/views/superadmin/superadmin-components/superadmin-detail";
import SuperAdminSuperadminCreatePage from "@/views/superadmin/superadmin-create";
import SuperAdminSuperadminEditPage from "@/views/superadmin/superadmin-edit";
import SuperAdminProfilePage from "@/views/superadmin/profile";
import WebsiteManagementPage from "@/views/superadmin/website-management";
import StatusPage from "@/views/superadmin/StatusPage";
import SecurityPage from "@/views/superadmin/SecurityPage";
import PrivacyPolicyPage from "@/views/privacy-policy";
import CreatePrivacyPolicyPage from "@/views/privacy-policy/create";
import EditPrivacyPolicyPage from "@/views/privacy-policy/edit";
import TermsConditionsPage from "@/views/terms-conditions";
import CreateTermsConditionsPage from "@/views/terms-conditions/create";
import EditTermsConditionsPage from "@/views/terms-conditions/edit";
import RefundPolicyPage from "@/views/refund-policy";
import DomainFinderPage from "@/views/domain-finder";
import CreateRefundPolicyPage from "@/views/refund-policy/create";
import EditRefundPolicyPage from "@/views/refund-policy/edit";
import SteadfastPage from "@/views/steadfast";
import PathaoPage from "@/views/pathao";
import RedXPage from "@/views/redx";
import UpgradePlanPage from "@/views/upgrade-plan";
import NotificationsPage from "@/views/notifications";
import StatisticsPage from "@/views/statistics";
import ConnectedAppsPage from "@/views/connected-apps";
import BannersOffersPage from "@/views/marketing/banners-offers";
import MediaPage from "@/views/media";
import RecurringInvoicesPage from "@/views/invoices/recurring";
import UsagePage from "@/views/usage";
import Usage from "@/views/superadmin/usage";
import DocumentationPage from "@/views/documentation";

import { BASE_PATH } from "@/config/appMode";

// ── Super Admin Console Routes (for VITE_APP_MODE=console) ──
// Console mode includes ALL routes: merchant dashboard + superadmin panel
const consoleRoutes = [
  // Merchant dashboard (accessible to logged-in merchants in console)
  {
    path: "/",
    element: (
      <PrivateRoute>
        <Layout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "/",
        element: (
          <PermissionRoute permission={FeaturePermission.DASHBOARD}>
            <DashboardPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/ai-report",
        element: (
          <PermissionRoute permission={FeaturePermission.AI_REPORT}>
            <AiReportPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/media",
        element: (
          <PermissionRoute permission={FeaturePermission.MEDIA_MANAGEMENT}>
            <MediaPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/ai-live-feed",
        element: (
          <PermissionRoute permission={FeaturePermission.AI_LIVE_FEED}>
            <AiLiveFeedPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/ai-sales-direction",
        element: (
          <PermissionRoute permission={FeaturePermission.AI_SALES_DIRECTION}>
            <AiSalesDirectionPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/statistics",
        element: (
          <PermissionRoute permission={FeaturePermission.STATS}>
            <StatisticsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/connected-apps",
        element: (
          <PermissionRoute permission={FeaturePermission.CONNECTED_APPS}>
            <ConnectedAppsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/banners-offers",
        element: (
          <PermissionRoute
            permission={FeaturePermission.BANNERS_OFFERS_MARKETING}
          >
            <BannersOffersPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/categories",
        element: (
          <PermissionRoute permission={FeaturePermission.CATEGORY}>
            <CategoriesPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/categories/create",
        element: (
          <PermissionRoute permission={FeaturePermission.CATEGORY}>
            <CreateCategoryPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/categories/:id/edit",
        element: (
          <PermissionRoute permission={FeaturePermission.CATEGORY}>
            <CategoryEditPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/products",
        element: (
          <PermissionRoute permission={FeaturePermission.PRODUCTS}>
            <ProductsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/products/create",
        element: (
          <PermissionRoute permission={FeaturePermission.PRODUCTS}>
            <CreateProductPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/products/bulk-upload",
        element: (
          <PermissionRoute permission={FeaturePermission.PRODUCT_BULK_UPLOAD}>
            <BulkUploadPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/products/:id",
        element: (
          <PermissionRoute permission={FeaturePermission.PRODUCTS}>
            <ProductViewPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/products/:id/edit",
        element: (
          <PermissionRoute permission={FeaturePermission.PRODUCTS}>
            <ProductEditPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/inventory",
        element: (
          <PermissionRoute permission={FeaturePermission.INVENTORY_MANAGEMENT}>
            <InventoryPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/inventory/:id/history",
        element: (
          <PermissionRoute permission={FeaturePermission.INVENTORY_HISTORY}>
            <InventoryHistoryPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/flash-sell",
        element: (
          <PermissionRoute permission={FeaturePermission.FLASH_SELL}>
            <FlashSellPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/customers",
        element: (
          <PermissionRoute permission={FeaturePermission.CUSTOMERS}>
            <CustomersPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/customers/create",
        element: (
          <PermissionRoute permission={FeaturePermission.CUSTOMERS}>
            <CreateCustomerPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/customers/:id",
        element: (
          <PermissionRoute permission={FeaturePermission.CUSTOMERS}>
            <CustomerDetailsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/orders",
        element: (
          <PermissionRoute permission={FeaturePermission.ORDERS}>
            <OrdersPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/invoices",
        element: (
          <PermissionRoute permission={FeaturePermission.ORDER_INVOICE_FINANCE}>
            <InvoicesPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/invoices/create",
        element: (
          <PermissionRoute
            permission={FeaturePermission.SALE_INVOICE_MANAGEMENT}
          >
            <CreateInvoicePage />
          </PermissionRoute>
        ),
      },
      {
        path: "/invoices/:id/edit",
        element: (
          <PermissionRoute
            permission={FeaturePermission.SALE_INVOICE_MANAGEMENT}
          >
            <SaleInvoiceEditPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/invoices/:id",
        element: (
          <PermissionRoute
            permission={FeaturePermission.SALE_INVOICE_MANAGEMENT}
          >
            <SaleInvoiceDetailsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/recurring-invoices",
        element: (
          <PermissionRoute
            permission={FeaturePermission.SALE_INVOICE_MANAGEMENT}
          >
            <RecurringInvoicesPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/credit-notes",
        element: (
          <PermissionRoute permission={FeaturePermission.ORDER_INVOICE_FINANCE}>
            <CreditNotesPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/credit-notes/create",
        element: (
          <PermissionRoute permission={FeaturePermission.ORDER_INVOICE_FINANCE}>
            <CreateCreditNotePage />
          </PermissionRoute>
        ),
      },
      {
        path: "/credit-notes/:id",
        element: (
          <PermissionRoute permission={FeaturePermission.ORDER_INVOICE_FINANCE}>
            <CreditNoteDetailsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/orders/create",
        element: (
          <PermissionRoute permission={FeaturePermission.ORDER_CREATION_MANUAL}>
            <CreateOrderPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/orders/track",
        element: (
          <PermissionRoute permission={FeaturePermission.ORDER_TRACKING}>
            <OrderTrackPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/orders/:id",
        element: (
          <PermissionRoute permission={FeaturePermission.ORDERS}>
            <OrderViewPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/orders/:id/edit",
        element: (
          <PermissionRoute permission={FeaturePermission.ORDER_EDIT}>
            <OrderEditPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/fraud",
        element: (
          <PermissionRoute permission={FeaturePermission.FRUAD_CHECKER}>
            <FraudPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/banners",
        element: (
          <PermissionRoute permission={FeaturePermission.BANNERS}>
            <BannerPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/banners/create",
        element: (
          <PermissionRoute permission={FeaturePermission.BANNERS}>
            <CreateBannerPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/banners/:id/edit",
        element: (
          <PermissionRoute permission={FeaturePermission.BANNERS}>
            <BannerEditPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/promocodes",
        element: (
          <PermissionRoute permission={FeaturePermission.PROMOCODES}>
            <PromocodePage />
          </PermissionRoute>
        ),
      },
      {
        path: "/promocodes/create",
        element: (
          <PermissionRoute permission={FeaturePermission.PROMOCODES}>
            <CreatePromocodePage />
          </PermissionRoute>
        ),
      },
      {
        path: "/promocodes/:id/edit",
        element: (
          <PermissionRoute permission={FeaturePermission.PROMOCODES}>
            <PromocodeEditPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/help",
        element: (
          <PermissionRoute permission={FeaturePermission.HELP}>
            <HelpPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/help/create",
        element: (
          <PermissionRoute permission={FeaturePermission.HELP}>
            <CreateHelpPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/documentation",
        element: <DocumentationPage />,
      },
      {
        path: "/help/:id",
        element: (
          <PermissionRoute permission={FeaturePermission.HELP}>
            <HelpDetailPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/reviews",
        element: (
          <PermissionRoute permission={FeaturePermission.REVIEW}>
            <ReviewsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/reviews/:id",
        element: (
          <PermissionRoute permission={FeaturePermission.REVIEW}>
            <ReviewDetailPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/settings",
        element: (
          <PermissionRoute permission={FeaturePermission.SETTINGS}>
            <SettingsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/manage-users",
        element: (
          <PermissionRoute permission={FeaturePermission.STAFF}>
            <ManageUsersPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/manage-users/create",
        element: (
          <PermissionRoute permission={FeaturePermission.STAFF}>
            <CreateUserPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/manage-users/edit/:id",
        element: (
          <PermissionRoute permission={FeaturePermission.STAFF}>
            <EditUserPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/manage-users/permissions/:id",
        element: (
          <PermissionRoute permission={FeaturePermission.STAFF}>
            <PermissionManagerPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/manage-users/activity-logs",
        element: (
          <PermissionRoute permission={FeaturePermission.LOG_ACTIVITY}>
            <ActivityLogsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/privacy-policy",
        element: (
          <PermissionRoute
            permission={FeaturePermission.PRIVACY_POLICY_MANAGEMENT}
          >
            <PrivacyPolicyPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/privacy-policy/create",
        element: (
          <PermissionRoute
            permission={FeaturePermission.PRIVACY_POLICY_MANAGEMENT}
          >
            <CreatePrivacyPolicyPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/privacy-policy/edit",
        element: (
          <PermissionRoute
            permission={FeaturePermission.PRIVACY_POLICY_MANAGEMENT}
          >
            <EditPrivacyPolicyPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/terms-conditions",
        element: (
          <PermissionRoute
            permission={FeaturePermission.TERMS_CONDITIONS_MANAGEMENT}
          >
            <TermsConditionsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/terms-conditions/create",
        element: (
          <PermissionRoute
            permission={FeaturePermission.TERMS_CONDITIONS_MANAGEMENT}
          >
            <CreateTermsConditionsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/terms-conditions/edit",
        element: (
          <PermissionRoute
            permission={FeaturePermission.TERMS_CONDITIONS_MANAGEMENT}
          >
            <EditTermsConditionsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/refund-policy",
        element: (
          <PermissionRoute
            permission={FeaturePermission.REFUND_POLICY_MANAGEMENT}
          >
            <RefundPolicyPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/refund-policy/create",
        element: (
          <PermissionRoute
            permission={FeaturePermission.REFUND_POLICY_MANAGEMENT}
          >
            <CreateRefundPolicyPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/refund-policy/edit",
        element: (
          <PermissionRoute
            permission={FeaturePermission.REFUND_POLICY_MANAGEMENT}
          >
            <EditRefundPolicyPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/steadfast",
        element: (
          <PermissionRoute permission={FeaturePermission.STEADFAST}>
            <SteadfastPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/pathao",
        element: (
          <PermissionRoute permission={FeaturePermission.PATHAO}>
            <PathaoPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/redx",
        element: (
          <PermissionRoute permission={FeaturePermission.REDX}>
            <RedXPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/notifications",
        element: (
          <PermissionRoute permission={FeaturePermission.NOTIFICATION_SETTINGS}>
            <NotificationsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/upgrade-plan",
        element: (
          <PermissionRoute permission={FeaturePermission.SETTINGS}>
            <UpgradePlanPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/usage",
        element: <UsagePage />,
      },
      {
        path: "/domain-finder",
        element: (
          <PermissionRoute permission={FeaturePermission.CUSTOM_DOMAIN}>
            <DomainFinderPage />
          </PermissionRoute>
        ),
      },
    ],
  },
  // Superadmin panel routes
  {
    path: "/superadmin",
    element: (
      <SuperAdminPrivateRoute>
        <SuperAdminLayout />
      </SuperAdminPrivateRoute>
    ),
    children: [
      {
        path: "/superadmin",
        element: (
          <SuperAdminPrivateRoute>
            <SuperAdminOverviewPage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/earnings",
        element: (
          <SuperAdminPrivateRoute>
            <SuperAdminEarningsPage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/customers",
        element: (
          <SuperAdminPrivateRoute>
            <SuperAdminCustomersPage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/customers/create",
        element: (
          <SuperAdminPrivateRoute>
            <SuperAdminCustomerCreatePage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/customers/:id",
        element: (
          <SuperAdminPrivateRoute>
            <SuperAdminCustomerDetailPage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/customers/edit/:id",
        element: (
          <SuperAdminPrivateRoute>
            <SuperAdminCustomerEditPage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/support",
        element: (
          <SuperAdminPrivateRoute>
            <SuperAdminSupportPage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/support/create",
        element: (
          <SuperAdminPrivateRoute>
            <SuperAdminSupportCreatePage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/support/:id",
        element: (
          <SuperAdminPrivateRoute>
            <SuperAdminSupportDetailPage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/packages",
        element: (
          <SuperAdminPrivateRoute>
            <PackageManagementPage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/packages/create",
        element: (
          <SuperAdminPrivateRoute>
            <PackageCreatePage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/packages/:id",
        element: (
          <SuperAdminPrivateRoute>
            <PackageDetailPage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/packages/:id/edit",
        element: (
          <SuperAdminPrivateRoute>
            <PackageEditPage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/themes",
        element: (
          <SuperAdminPrivateRoute>
            <ThemeManagementPage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/themes/create",
        element: (
          <SuperAdminPrivateRoute>
            <ThemeCreatePage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/themes/:id",
        element: (
          <SuperAdminPrivateRoute>
            <ThemeDetailPage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/themes/:id/edit",
        element: (
          <SuperAdminPrivateRoute>
            <ThemeEditPage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/usage",
        element: (
          <SuperAdminPrivateRoute>
            <Usage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/usage/:id",
        element: (
          <SuperAdminPrivateRoute>
            <Usage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/invoices",
        element: (
          <SuperAdminPrivateRoute>
            <InvoiceManagementPage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/invoices/create",
        element: (
          <SuperAdminPrivateRoute>
            <InvoiceCreatePage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/superadmins",
        element: (
          <SuperAdminPrivateRoute>
            <SuperAdminSuperadminsPage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/superadmins/create",
        element: (
          <SuperAdminPrivateRoute>
            <SuperAdminSuperadminCreatePage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/superadmins/edit/:id",
        element: (
          <SuperAdminPrivateRoute>
            <SuperAdminSuperadminEditPage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/superadmins/:id",
        element: (
          <SuperAdminPrivateRoute>
            <SuperAdminSuperadminDetailPage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/profile",
        element: (
          <SuperAdminPrivateRoute>
            <SuperAdminProfilePage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/status",
        element: (
          <SuperAdminPrivateRoute>
            <StatusPage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/security",
        element: (
          <SuperAdminPrivateRoute>
            <SecurityPage />
          </SuperAdminPrivateRoute>
        ),
      },
      {
        path: "/superadmin/website-management",
        element: (
          <SuperAdminPrivateRoute>
            <WebsiteManagementPage />
          </SuperAdminPrivateRoute>
        ),
      },
    ],
  },

  { path: "/superadmin/login", element: <SuperAdminLoginPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordRequestPage /> },
  {
    path: "/forgot-password/check-email",
    element: <CheckResetPasswordEmailPage />,
  },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "*", element: <ErrorPage /> },
];

// ── Create Router Based on App Mode ──

export const routes = createBrowserRouter(consoleRoutes, {
  basename: BASE_PATH,
});
