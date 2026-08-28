import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Package,
  Store,
  MapPin,
  Calculator,
  Search,
  ArrowLeft,
  Truck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

import CreateOrder from "./components/CreateOrder";
import ManageStores from "./components/ManageStores";
import Locations from "./components/Locations";
import PriceCalculator from "./components/PriceCalculator";
import TrackParcel from "./components/TrackParcel";

const RedXPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "create";

  const tabs = [
    { id: "create", label: t("redx.createOrder"), icon: Package },
    { id: "track", label: t("redx.trackParcel"), icon: Search },
    { id: "stores", label: t("redx.manageStores"), icon: Store },
    { id: "locations", label: t("redx.locations"), icon: MapPin },
    { id: "calculator", label: t("redx.priceCalculator"), icon: Calculator },
  ];

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "create":
        return <CreateOrder />;
      case "track":
        return <TrackParcel />;
      case "stores":
        return <ManageStores />;
      case "locations":
        return <Locations />;
      case "calculator":
        return <PriceCalculator />;
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
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-500 dark:to-violet-500 bg-clip-text text-transparent">
              {t("redx.title", "RedX Courier")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t(
                "redx.description",
                "Manage your RedX shipments and deliveries",
              )}
            </p>
          </div>
        </div>

        {/* RedX Branding / Status Card */}
        <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Service Status
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Active
              </p>
            </div>
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

export default RedXPage;
