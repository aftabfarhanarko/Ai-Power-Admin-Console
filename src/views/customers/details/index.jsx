import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { ShoppingBag, CheckCircle2, ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetUserQuery,
  useDeleteUserMutation,
} from "@/features/user/userApiSlice";
import { useGetOrdersByCustomerQuery } from "@/features/order/orderApiSlice";
import DeleteModal from "@/components/modals/DeleteModal";
import CustomerDetailsHeader from "./components/CustomerDetailsHeader";
import CustomerProfileCard from "./components/CustomerProfileCard";
import CustomerRecentOrdersCard from "./components/CustomerRecentOrdersCard";
import CustomerNotesCard from "./components/CustomerNotesCard";
import CustomerActivityCard from "./components/CustomerActivityCard";

/**
 * CustomerDetailsPage Component
 * Redesigned to match the application's "Order Details" and "Premium" standards.
 */
export default function CustomerDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: user,
    isLoading,
    isError,
  } = useGetUserQuery(id, {
    skip: !id,
  });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: customerOrders = [], isLoading: isLoadingOrders } =
    useGetOrdersByCustomerQuery(
      { customerId: id },
      {
        skip: !id,
      },
    );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa] dark:bg-[#0b0f14]">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {t("customers.loadingDetails")}
        </p>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa] dark:bg-[#0b0f14] space-y-4">
        <p className="text-sm font-medium text-rose-500">
          {t("customers.loadFailed")}
        </p>
        <Button
          variant="outline"
          onClick={() => navigate("/customers")}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("customers.backToCustomers")}
        </Button>
      </div>
    );
  }

  const customer = {
    id: user.id ?? id,
    name: user.name ?? "-",
    email: user.email ?? "-",
    phone: user.phone ?? "-",
    district: user.district ?? "-",
    address: user.address ?? "-",
    isActive: user.isActive ?? false,
    isBanned: user.isBanned ?? false,
    role: user.role ?? "customer",
    companyId: user.companyId ?? "-",
    banReason: user.banReason ?? null,
    bannedAt: user.bannedAt ?? null,
    avatar:
      user.avatar ??
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.name || "Customer",
      )}`,
    joinedDate: user.createdAt ?? new Date().toISOString(),
    successfulOrdersCount: user.successfulOrdersCount ?? 0,
    cancelledOrdersCount: user.cancelledOrdersCount ?? 0,
  };

  const totalOrdersCount =
    Array.isArray(customerOrders) && customerOrders.length
      ? customerOrders.length
      : (customer.successfulOrdersCount ?? 0) +
        (customer.cancelledOrdersCount ?? 0);

  const successfulOrdersFromOrders = Array.isArray(customerOrders)
    ? customerOrders.filter(
        (o) =>
          o.isPaid ||
          (o.status || "").toLowerCase() === "paid" ||
          (o.status || "").toLowerCase() === "delivered",
      ).length
    : (customer.successfulOrdersCount ?? 0);

  const cancelledOrdersFromOrders = Array.isArray(customerOrders)
    ? customerOrders.filter(
        (o) => (o.status || "").toLowerCase() === "cancelled",
      ).length
    : (customer.cancelledOrdersCount ?? 0);

  const statusLabel = customer.isBanned
    ? t("customers.statusBannedLabel")
    : customer.isActive
      ? t("customers.statusActiveLabel")
      : t("customers.statusInactiveLabel");

  const statusClasses =
    statusLabel === t("customers.statusBannedLabel")
      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
      : statusLabel === t("customers.statusInactiveLabel")
        ? "bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800";

  const stats = [
    {
      label: t("customers.statsTotalOrders"),
      value: totalOrdersCount,
      icon: ShoppingBag,
      color: "text-indigo-600",
      bg: "bg-indigo-100 dark:bg-indigo-900/20",
      border: "border-indigo-200 dark:border-indigo-800",
    },
    {
      label: t("customers.statsSuccessfulOrders"),
      value: successfulOrdersFromOrders,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-100 dark:bg-emerald-900/20",
      border: "border-emerald-200 dark:border-emerald-800",
    },
    {
      label: t("customers.statsCancelledOrders"),
      value: cancelledOrdersFromOrders,
      icon: ShieldAlert,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
    },
  ];

  const recentOrders = Array.isArray(customerOrders)
    ? customerOrders.slice(0, 6)
    : [];

  const handleConfirmDelete = async () => {
    try {
      const res = await deleteUser(customer.id);
      if (res?.data || !res?.error) {
        setIsDeleteModalOpen(false);
        navigate("/customers");
      } else {
        window.alert(res?.error?.data?.message || t("common.failed"));
      }
    } catch (e) {
      window.alert(t("common.failed"));
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-10 min-h-screen font-sans bg-[#f8f9fa] dark:bg-[#0b0f14]">
      <CustomerDetailsHeader
        customer={customer}
        statusLabel={statusLabel}
        statusClasses={statusClasses}
        stats={stats}
        isDeleting={isDeleting}
        onOpenDelete={() => setIsDeleteModalOpen(true)}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* --- LEFT COLUMN: Main Content --- */}
        <div className="xl:col-span-2 space-y-8">
          <CustomerProfileCard customer={customer} />
          <CustomerRecentOrdersCard
            recentOrders={recentOrders}
            isLoadingOrders={isLoadingOrders}
          />
        </div>

        {/* --- RIGHT COLUMN: Sidebar --- */}
        <div className="xl:col-span-1 space-y-8">
          <CustomerNotesCard />
          <CustomerActivityCard recentOrders={recentOrders} />
        </div>
      </div>
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t("customers.deleteCustomerTitle")}
        description={t("customers.deleteCustomerDesc")}
        itemName={`${customer.name} (#${customer.id})`}
        isLoading={isDeleting}
      />
    </div>
  );
}
