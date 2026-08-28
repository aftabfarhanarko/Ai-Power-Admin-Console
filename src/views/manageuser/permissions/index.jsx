import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Check, Shield } from "lucide-react";
import { FeaturePermission, API_ALLOWED_PERMISSION_VALUES } from "@/constants/feature-permission";
import { motion } from "framer-motion";
import { useGetPermissionsQuery, useAssignPermissionsMutation } from "@/features/systemuser/systemuserApiSlice";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";

// Normalize permission to string code (backend may send string or { code, name, value })
const toPermissionCode = (p) =>
  typeof p === "string" ? p : (p?.code ?? p?.name ?? p?.value ?? "");

// Group permissions by category for better UX
const PERMISSION_GROUPS = {
  core: [
    { value: FeaturePermission.DASHBOARD, labelKey: "manageUsers.permissions.labels.dashboard" },
    { value: FeaturePermission.PRODUCTS, labelKey: "manageUsers.permissions.labels.products" },
    { value: FeaturePermission.ORDERS, labelKey: "manageUsers.permissions.labels.orders" },
    { value: FeaturePermission.ORDERS_ITEM, labelKey: "manageUsers.permissions.labels.orderItems" },
    { value: FeaturePermission.CATEGORY, labelKey: "manageUsers.permissions.labels.category" },
    { value: FeaturePermission.CUSTOMERS, labelKey: "manageUsers.permissions.labels.customers" },
  ],
  management: [
    { value: FeaturePermission.MANAGE_USERS, labelKey: "manageUsers.permissions.labels.manageUsers" },
    { value: FeaturePermission.STAFF, labelKey: "manageUsers.permissions.labels.staff" },
    { value: FeaturePermission.SETTINGS, labelKey: "manageUsers.permissions.labels.settings" },
    { value: FeaturePermission.LOG_ACTIVITY, labelKey: "manageUsers.permissions.labels.activityLogs" },
  ],
  marketing: [
    { value: FeaturePermission.BANNERS, labelKey: "manageUsers.permissions.labels.banners" },
    { value: FeaturePermission.PROMOCODES, labelKey: "manageUsers.permissions.labels.promocodes" },
    { value: FeaturePermission.HELP, labelKey: "manageUsers.permissions.labels.help" },
  ],
  notifications: [
    { value: FeaturePermission.NOTIFICATIONS, labelKey: "manageUsers.permissions.labels.notifications" },
    { value: FeaturePermission.EMAIL_NOTIFICATIONS, labelKey: "manageUsers.permissions.labels.emailNotifications" },
    { value: FeaturePermission.WHATSAPP_NOTIFICATIONS, labelKey: "manageUsers.permissions.labels.whatsappNotifications" },
    { value: FeaturePermission.SMS_NOTIFICATIONS, labelKey: "manageUsers.permissions.labels.smsNotifications" },
  ],
  shipping: [
    { value: FeaturePermission.STEADFAST, labelKey: "manageUsers.permissions.labels.steadfastCourier" },
    { value: FeaturePermission.PATHAO, labelKey: "manageUsers.permissions.labels.pathaoCourier" },
    { value: FeaturePermission.REDX, labelKey: "manageUsers.permissions.labels.redxCourier" },
  ],
  reports: [
    { value: FeaturePermission.REPORTS, labelKey: "manageUsers.permissions.labels.reports" },
    { value: FeaturePermission.FRUAD_CHECKER, labelKey: "manageUsers.permissions.labels.fraudChecker" },
    { value: FeaturePermission.REVENUE, labelKey: "manageUsers.permissions.labels.revenue" },
    { value: FeaturePermission.NEW_CUSTOMERS, labelKey: "manageUsers.permissions.labels.newCustomers" },
    { value: FeaturePermission.REPEAT_PURCHASE_RATE, labelKey: "manageUsers.permissions.labels.repeatPurchaseRate" },
    { value: FeaturePermission.AVERAGE_ORDER_VALUE, labelKey: "manageUsers.permissions.labels.averageOrderValue" },
    { value: FeaturePermission.STATS, labelKey: "manageUsers.permissions.labels.stats" },
  ],
  payments: [
    { value: FeaturePermission.PAYMENT_METHODS, labelKey: "manageUsers.permissions.labels.paymentMethods" },
    { value: FeaturePermission.PAYMENT_GATEWAYS, labelKey: "manageUsers.permissions.labels.paymentGateways" },
    { value: FeaturePermission.PAYMENT_STATUS, labelKey: "manageUsers.permissions.labels.paymentStatus" },
    { value: FeaturePermission.PAYMENT_TRANSACTIONS, labelKey: "manageUsers.permissions.labels.paymentTransactions" },
  ],
  configuration: [
    { value: FeaturePermission.SMS_CONFIGURATION, labelKey: "manageUsers.permissions.labels.smsConfiguration" },
    { value: FeaturePermission.EMAIL_CONFIGURATION, labelKey: "manageUsers.permissions.labels.emailConfiguration" },
  ],
};

const PermissionManagerPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const { data: permissionsData, isLoading: isLoadingPermissions } = useGetPermissionsQuery(id, {
    skip: !id,
  });
  const { data: currentUser } = useGetCurrentUserQuery();
  const [assignPermissions, { isLoading: isAssigning }] = useAssignPermissionsMutation();

  // System Owner's permissions: same logic as hasPermission – combine permissions + package.features, normalize to codes
  const systemOwnerPermissionCodes = useMemo(() => {
    const direct = Array.isArray(currentUser?.permissions) ? currentUser.permissions : [];
    const fromPackage = Array.isArray(currentUser?.package?.features) ? currentUser.package.features : [];
    const all = [...direct, ...fromPackage];
    const codes = all.map(toPermissionCode).filter(Boolean);
    return new Set(codes);
  }, [currentUser]);

  // Only show permissions that the System Owner has (same as system owner's list)
  const availablePermissionGroups = useMemo(() => {
    const filtered = {};
    Object.entries(PERMISSION_GROUPS).forEach(([groupKey, permissions]) => {
      const availablePermissions = permissions.filter((p) =>
        systemOwnerPermissionCodes.has(p.value)
      );
      if (availablePermissions.length > 0) {
        filtered[groupKey] = availablePermissions;
      }
    });
    return filtered;
  }, [systemOwnerPermissionCodes]);

  // Load permissions from API: only keep API-allowed and only those the System Owner can assign
  useEffect(() => {
    if (permissionsData?.permissions) {
      const allowedSet = new Set(API_ALLOWED_PERMISSION_VALUES);
      const normalized = permissionsData.permissions.map(toPermissionCode).filter(Boolean);
      setSelectedPermissions((prev) => {
        const valid = normalized.filter(
          (p) => allowedSet.has(p) && systemOwnerPermissionCodes.has(p)
        );
        return valid.length ? valid : prev;
      });
    }
  }, [permissionsData, systemOwnerPermissionCodes]);

  const handlePermissionToggle = (permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSelectAll = (groupPermissions) => {
    const allSelected = groupPermissions.every((p) => selectedPermissions.includes(p.value));
    if (allSelected) {
      // Deselect all in group
      setSelectedPermissions((prev) =>
        prev.filter((p) => !groupPermissions.map((gp) => gp.value).includes(p))
      );
    } else {
      // Select all in group
      const newPermissions = groupPermissions
        .map((gp) => gp.value)
        .filter((p) => !selectedPermissions.includes(p));
      setSelectedPermissions((prev) => [...prev, ...newPermissions]);
    }
  };

  const handleSelectAllPermissions = () => {
    const allAvailablePermissions = Object.values(availablePermissionGroups).flat().map((p) => p.value);
    if (selectedPermissions.length === allAvailablePermissions.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(allAvailablePermissions);
    }
  };

  const handleSubmit = async () => {
    const allowedSet = new Set(API_ALLOWED_PERMISSION_VALUES);
    const permissionsToSend = selectedPermissions.filter((p) => allowedSet.has(p));
    try {
      await assignPermissions({ id, permissions: permissionsToSend }).unwrap();
      toast.success(t("manageUsers.permissions.toast.success"));
      navigate("/manage-users");
    } catch (error) {
      toast.error(
        error?.data?.message ||
          t("manageUsers.permissions.toast.failed"),
      );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const groupVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-[1400px] mx-auto p-4 md:p-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/manage-users")}
            className="rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              {t("manageUsers.permissions.headerTitle")}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {t("manageUsers.permissions.headerSubtitle")}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleSelectAllPermissions}
            className="rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {selectedPermissions.length === Object.values(availablePermissionGroups).flat().length
              ? t("manageUsers.permissions.deselectAll")
              : t("manageUsers.permissions.selectAll")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isAssigning || isLoadingPermissions}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20 rounded-xl px-6"
          >
            {isAssigning ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t("common.saving")}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                <span>{t("common.saveChanges")}</span>
              </div>
            )}
          </Button>
        </div>
      </div>

      {isLoadingPermissions ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-[24px] animate-pulse" />
          ))}
        </div>
      ) : Object.keys(availablePermissionGroups).length === 0 ? (
        <div className="rounded-[24px] border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 p-8 text-center">
          <Shield className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            {t("manageUsers.permissions.emptyOwnerOnly")}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {t("manageUsers.permissions.emptyNoAssignable")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(availablePermissionGroups).map(([groupKey, permissions], index) => (
            <motion.div
              key={groupKey}
              variants={groupVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-[#1e293b]/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-[24px] p-5 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-indigo-500" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {t(`manageUsers.permissions.groups.${groupKey}`)}
                  </h4>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAll(permissions)}
                  className="h-7 text-xs hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                >
                  {permissions.every((p) => selectedPermissions.includes(p.value))
                    ? t("manageUsers.permissions.none")
                    : t("manageUsers.permissions.all")}
                </Button>
              </div>
              
              <div className="space-y-3">
                {permissions.map((permission) => {
                  const isSelected = selectedPermissions.includes(permission.value);
                  return (
                    <label
                      key={permission.value}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                        isSelected 
                          ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/50" 
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border-transparent"
                      }`}
                    >
                      <div className={`
                        flex items-center justify-center w-5 h-5 rounded-md border transition-colors
                        ${isSelected 
                          ? "bg-indigo-600 border-indigo-600 text-white" 
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"}
                      `}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handlePermissionToggle(permission.value)}
                        className="hidden"
                      />
                      <span className={`text-sm ${isSelected ? "font-medium text-indigo-900 dark:text-indigo-100" : "text-gray-600 dark:text-gray-300"}`}>
                        {t(permission.labelKey)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PermissionManagerPage;
