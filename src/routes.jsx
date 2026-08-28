import { createBrowserRouter } from "react-router-dom";

// LAYOUTS
import Layout from "./layout/layout";
import SuperAdminLayout from "./layout/superadmin/layout";

import ErrorPage from "./pages/common/errorPage";

import LoginPage from "./pages/auth/login";
import AdminLoginPage from "./pages/auth/admin-login";
import SuperAdminLoginPage from "./pages/superadmin/login";
import UnifiedLoginPage from "./pages/auth/unified-login";

import PrivateRoute from "./hooks/usePrivateRoute";
import SuperAdminPrivateRoute from "./hooks/useSuperAdminPrivateRoute";
import PermissionRoute from "./hooks/PermissionRoute";
import { FeaturePermission } from "./constants/feature-permission";

import ForgotPasswordRequestPage from "./pages/auth/forgot-password/password-request";
import ResetPasswordPage from "./pages/auth/forgot-password/reset-password";
import CheckResetPasswordEmailPage from "./pages/auth/forgot-password/check-email";
import RegisterPage from "./pages/auth/register";
import DashboardPage from "./pages/dashboard";
import AiReportPage from "./pages/ai-report";
import AiLiveFeedPage from "./pages/ai-live-feed";
import AiSalesDirectionPage from "./pages/ai-sales-direction";
import CategoriesPage from "./pages/categories";
import CreateCategoryPage from "./pages/categories/create";
import CategoryEditPage from "./pages/categories/_id/edit";
import ProductsPage from "./pages/products";
import CreateProductPage from "./pages/products/create";
import BulkUploadPage from "./pages/products/bulk-upload";
import ProductViewPage from "./pages/products/_id";
import ProductEditPage from "./pages/products/_id/edit";
import InventoryPage from "./pages/inventory";
import InventoryHistoryPage from "./pages/inventory/history";
import FlashSellPage from "./pages/flash-sell";
import CustomersPage from "./pages/customers";
import CreateCustomerPage from "./pages/customers/create";
import CustomerDetailsPage from "./pages/customers/details";
import OrdersPage from "./pages/orders";
import CreateOrderPage from "./pages/orders/create";
import OrderTrackPage from "./pages/orders/track";
import OrderViewPage from "./pages/orders/_id";

import OrderEditPage from "./pages/orders/_id/edit";
import InvoicesPage from "./pages/invoices";
import CreateInvoicePage from "./pages/invoices/create";
import SaleInvoiceDetailsPage from "./pages/invoices/[id]/details";
import SaleInvoiceEditPage from "./pages/invoices/[id]/edit";
import CreditNotesPage from "./pages/credit-notes";
import CreateCreditNotePage from "./pages/credit-notes/create";
import CreditNoteDetailsPage from "./pages/credit-notes/_id";
import FraudPage from "./pages/fraud";
import BannerPage from "./pages/banner";
import CreateBannerPage from "./pages/banner/create";
import BannerEditPage from "./pages/banner/_id/edit";
import PromocodePage from "./pages/promocode";
import CreatePromocodePage from "./pages/promocode/create";
import PromocodeEditPage from "./pages/promocode/_id/edit";
import HelpPage from "./pages/help";
import CreateHelpPage from "./pages/help/create";
import HelpDetailPage from "./pages/help/_id";
import ReviewsPage from "./pages/reviews";
import ReviewDetailPage from "./pages/reviews/_id";
import SettingsPage from "./pages/settings"; // settings
import ManageUsersPage from "./pages/manageuser"; // manage users
import CreateUserPage from "./pages/manageuser/create";
import EditUserPage from "./pages/manageuser/edit";
import PermissionManagerPage from "./pages/manageuser/permissions";
import ActivityLogsPage from "./pages/manageuser/activity-logs";
import SuperAdminOverviewPage from "./pages/superadmin"; // super admin overview
import SuperAdminEarningsPage from "./pages/superadmin/earnings";
import SuperAdminCustomersPage from "./pages/superadmin/customers";
import SuperAdminCustomerDetailPage from "./pages/superadmin/customer-detail";
import SuperAdminCustomerEditPage from "./pages/superadmin/customer-edit";
import SuperAdminCustomerCreatePage from "./pages/superadmin/customer-create";
import SuperAdminSupportPage from "./pages/superadmin/support";
import SuperAdminSupportDetailPage from "./pages/superadmin/support-detail";
import SuperAdminSupportCreatePage from "./pages/superadmin/support-create";
import PackageManagementPage from "./pages/superadmin/packagemanagement";
import PackageDetailPage from "./pages/superadmin/package-detail";
import PackageEditPage from "./pages/superadmin/package-edit";
import PackageCreatePage from "./pages/superadmin/package-create";
import ThemeManagementPage from "./pages/superadmin/thememanagement";
import ThemeCreatePage from "./pages/superadmin/theme-create";
import ThemeDetailPage from "./pages/superadmin/theme-detail";
import ThemeEditPage from "./pages/superadmin/theme-edit";
import InvoiceManagementPage from "./pages/superadmin/invoice";
import InvoiceCreatePage from "./pages/superadmin/invoice/create";
import SuperAdminSuperadminsPage from "./pages/superadmin/superadmins";
import SuperAdminSuperadminDetailPage from "./pages/superadmin/superadmin-components/superadmin-detail";
import SuperAdminSuperadminCreatePage from "./pages/superadmin/superadmin-create";
import SuperAdminSuperadminEditPage from "./pages/superadmin/superadmin-edit";
import SuperAdminProfilePage from "./pages/superadmin/profile";
import WebsiteManagementPage from "./pages/superadmin/website-management";
import StatusPage from "./views/superadmin/StatusPage";
import SecurityPage from "./views/superadmin/SecurityPage";
import PrivacyPolicyPage from "./pages/privacy-policy";
import CreatePrivacyPolicyPage from "./pages/privacy-policy/create";
import EditPrivacyPolicyPage from "./pages/privacy-policy/edit";
import TermsConditionsPage from "./pages/terms-conditions";
import CreateTermsConditionsPage from "./pages/terms-conditions/create";
import EditTermsConditionsPage from "./pages/terms-conditions/edit";
import RefundPolicyPage from "./pages/refund-policy";
import DomainFinderPage from "./pages/domain-finder";
import CreateRefundPolicyPage from "./pages/refund-policy/create";
import EditRefundPolicyPage from "./pages/refund-policy/edit";
import SteadfastPage from "./pages/steadfast";
import PathaoPage from "./pages/pathao";
import RedXPage from "./pages/redx";
import UpgradePlanPage from "./pages/upgrade-plan";
import NotificationsPage from "./pages/notifications";
import StatisticsPage from "./pages/statistics";
import ConnectedAppsPage from "./pages/connected-apps";
import BannersOffersPage from "./pages/marketing/banners-offers";
import MediaPage from "./pages/media";
import RecurringInvoicesPage from "./pages/invoices/recurring";
import UsagePage from "./pages/usage";
import Usage from "./pages/superadmin/usage";
import DocumentationPage from "./pages/documentation";

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
