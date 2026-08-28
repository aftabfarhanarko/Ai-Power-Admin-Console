import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Settings, 
  Bell, 
  Building2, 
  ShieldCheck, 
  Truck, 
  Globe, 
  CreditCard,
  KeyRound,
  ChevronLeft
} from "lucide-react";

// Import Settings Components
import PreferencesSettings from "./components/PreferencesSettings";
import PasswordSettings from "./components/PasswordSettings";
import NotificationSettings from "./components/NotificationSettings";
import AccountSettings from "./components/AccountSettings";
import UserPermissionSettings from "./components/UserPermissionSettings";
import CourierSettings from "./components/CourierSettings";
import DomainSettings from "./components/DomainSettings";
import BillingSettings from "./components/BillingSettings";
import ProfileSettings from "./components/ProfileSettings";

const SettingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") || "profile";
  const { t } = useTranslation();
  const { data: currentUser, isLoading: isLoadingUser } =
    useGetCurrentUserQuery();

  // Redirect to default tab if none provided
  useEffect(() => {
    if (!searchParams.get("tab")) {
      setSearchParams({ tab: "profile" }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Update Password", icon: KeyRound },
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "account", label: "Account", icon: Building2 },
    { id: "permissions", label: "Permissions", icon: ShieldCheck },
    { id: "courier", label: "Courier Integration", icon: Truck },
    { id: "domain", label: "Custom Domain", icon: Globe },
    { id: "billings", label: "Billings", icon: CreditCard },
  ];

  const renderContent = () => {
    if (
      isLoadingUser &&
      (activeTab === "profile" ||
        activeTab === "password" ||
        activeTab === "account" ||
        activeTab === "courier" ||
        activeTab === "domain" ||
        activeTab === "billings" ||
        activeTab === "notifications")
    ) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin h-10 w-10 border-2 border-violet-600 border-t-transparent rounded-full" />
        </div>
      );
    }
    switch (activeTab) {
      case "profile":
        return <ProfileSettings user={currentUser} />;
      case "password":
        return <PasswordSettings user={currentUser} />;
      case "preferences":
        return <PreferencesSettings />;
      case "notifications":
        return <NotificationSettings user={currentUser} />;
      case "account":
        return <AccountSettings user={currentUser} />;
      case "permissions":
        return <UserPermissionSettings />;
      case "courier":
        return <CourierSettings user={currentUser} />;
      case "domain":
        return <DomainSettings user={currentUser} />;
      case "billings":
        return <BillingSettings user={currentUser} />;
      default:
        return <ProfileSettings user={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-200"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                Settings
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Manage your courier orders, track deliveries, and handle returns
              </p>
            </div>
          </div>
        </div>


        {/* Content Area */}
        <div className="relative min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
