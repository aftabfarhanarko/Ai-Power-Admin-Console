import React from "react";
import { useTranslation } from "react-i18next";
import { Download, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomerNotifications from "./CustomerNotifications";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { hasPermission, FeaturePermission } from "@/constants/feature-permission";

const CustomerHeader = ({ onExport }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: user } = useGetCurrentUserQuery();

  const canCreateCustomer = hasPermission(user, FeaturePermission.CUSTOMERS);

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-[32px] font-semibold tracking-tight text-gray-900 dark:text-white leading-tight">
          {t("customers.title", "Customers")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base mt-1">
          {t("customers.pageSubtitle", "Manage your global enterprise client portfolio and subscription statuses.")}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <CustomerNotifications />

        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#1a1f26] border border-gray-200 dark:border-gray-700 rounded-xl text-indigo-600 dark:text-indigo-400 font-semibold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          {t("customers.exportToPdf", "Export List")}
        </button>

        {canCreateCustomer && (
          <button
            onClick={() => navigate("/customers/create")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            {t("customers.addCustomer", "Create New")}
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomerHeader;
