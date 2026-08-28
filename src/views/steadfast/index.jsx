import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Package,
  PackageCheck,
  Search,
  DollarSign,
  RotateCcw,
  CreditCard,
  Building2,
  Truck,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useGetBalanceQuery } from "@/features/steadfast/steadfastApiSlice";

import CreateOrder from "./components/CreateOrder";
import BulkOrder from "./components/BulkOrder";
import CheckStatus from "./components/CheckStatus";
import CheckBalance from "./components/CheckBalance";
import ReturnRequests from "./components/ReturnRequests";
import Payments from "./components/Payments";
import PoliceStations from "./components/PoliceStations";

const SteadfastPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "create";
  const { data: balanceData } = useGetBalanceQuery();

  const tabs = [
    {
      id: "create",
      label: t("steadfast.createOrder", "Create Order"),
      icon: Package,
    },
    {
      id: "bulk",
      label: t("steadfast.bulkOrder", "Bulk Order"),
      icon: PackageCheck,
    },
    {
      id: "status",
      label: t("steadfast.checkStatus", "Check Status"),
      icon: Search,
    },
    {
      id: "balance",
      label: t("steadfast.balance", "Balance"),
      icon: DollarSign,
    },
    {
      id: "returns",
      label: t("steadfast.returnRequests", "Returns"),
      icon: RotateCcw,
    },
    {
      id: "payments",
      label: t("steadfast.payments", "Payments"),
      icon: CreditCard,
    },
    {
      id: "police",
      label: t("steadfast.policeStations", "Police Stations"),
      icon: Building2,
    },
  ];

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "create":
        return <CreateOrder />;
      case "bulk":
        return <BulkOrder />;
      case "status":
        return <CheckStatus />;
      case "balance":
        return <CheckBalance />;
      case "returns":
        return <ReturnRequests />;
      case "payments":
        return <Payments />;
      case "police":
        return <PoliceStations />;
      default:
        return <CreateOrder />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-4 md:p-6 lg:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {t("steadfast.title", "Steadfast Courier")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t(
                "steadfast.description",
                "Manage your shipments and track deliveries efficiently",
              )}
            </p>
          </div>
        </div>

        {/* Balance Card - Mini */}
        <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Current Balance
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ৳{balanceData?.current_balance || "0.00"}
            </p>
          </div>
        </div>
      </div>

      {/* Premium Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm w-full md:w-fit overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap",
                isActive
                  ? "text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon
                className={cn(
                  "w-4 h-4 relative z-10",
                  isActive ? "text-white" : "text-gray-500 dark:text-gray-400",
                )}
              />
              <span
                className={cn("relative z-10", isActive ? "text-white" : "")}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SteadfastPage;
