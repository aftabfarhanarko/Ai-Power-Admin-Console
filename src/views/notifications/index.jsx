import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import {
  Bell,
  ShoppingCart,
  CheckCircle,
  Package,
  Truck,
  AlertCircle,
  User,
  Filter,
  RefreshCw,
  Check,
  Clock,
  Search,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import {
  useGetAllNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "@/features/notifications/notificationsApiSlice";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";

const NotificationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch user data from API instead of Redux
  const { data: user } = useGetCurrentUserQuery();
  const companyId = user?.companyId;

  // Single source: all data from notifications API
  const {
    data: apiNotifications = [],
    isLoading,
    refetch: refetchAll,
  } = useGetAllNotificationsQuery({ companyId }, { skip: !companyId });

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsAsReadMutation();

  // Transform API notifications to match UI format
  const notifications = apiNotifications
    .map((notification) => {
      // Determine icon and color based on notification type (matching backend enum)
      let icon = Bell;
      let iconColor = "text-gray-500";
      let bgGradient =
        "from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900";
      let title =
        notification.subject ||
        notification.title ||
        t("notifications.notification");

      switch (notification.type) {
        // Order notifications
        case "order_created":
        case "ORDER_CREATED":
          icon = ShoppingCart;
          iconColor = "text-[#976DF7]";
          bgGradient =
            "from-[#976DF7]/10 to-[#976DF7]/20 dark:from-[#976DF7]/20 dark:to-[#976DF7]/10";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.newOrderCreated");
          break;
        case "order_confirmed":
        case "ORDER_CONFIRMED":
          icon = CheckCircle;
          iconColor = "text-[#976DF7]";
          bgGradient =
            "from-[#976DF7]/10 to-[#976DF7]/20 dark:from-[#976DF7]/20 dark:to-[#976DF7]/10";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.orderConfirmed");
          break;
        case "order_processing":
        case "ORDER_PROCESSING":
          icon = Package;
          iconColor = "text-yellow-500";
          bgGradient =
            "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.orderProcessing");
          break;
        case "order_shipped":
        case "ORDER_SHIPPED":
          icon = Truck;
          iconColor = "text-purple-500";
          bgGradient =
            "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.orderShipped");
          break;
        case "order_delivered":
        case "ORDER_DELIVERED":
          icon = CheckCircle;
          iconColor = "text-green-500";
          bgGradient =
            "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.orderDelivered");
          break;
        case "order_cancelled":
        case "ORDER_CANCELLED":
          icon = AlertCircle;
          iconColor = "text-red-500";
          bgGradient =
            "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.orderCancelled");
          break;
        case "order_refunded":
        case "ORDER_REFUNDED":
          icon = AlertCircle;
          iconColor = "text-orange-600";
          bgGradient =
            "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.orderRefunded");
          break;

        // Payment notifications
        case "payment_received":
        case "PAYMENT_RECEIVED":
          icon = CheckCircle;
          iconColor = "text-green-600";
          bgGradient =
            "from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.paymentReceived");
          break;
        case "payment_failed":
        case "PAYMENT_FAILED":
          icon = AlertCircle;
          iconColor = "text-red-600";
          bgGradient =
            "from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.paymentFailed");
          break;

        // Customer notifications
        case "new_customer":
        case "NEW_CUSTOMER":
          icon = User;
          iconColor = "text-indigo-500";
          bgGradient =
            "from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.newCustomer");
          break;
        case "customer_updated":
        case "CUSTOMER_UPDATED":
          icon = User;
          iconColor = "text-blue-400";
          bgGradient =
            "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.customerUpdated");
          break;

        // Stock notifications
        case "low_stock":
        case "LOW_STOCK":
          icon = AlertCircle;
          iconColor = "text-orange-500";
          bgGradient =
            "from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.lowStockAlert");
          break;
        case "out_of_stock":
        case "OUT_OF_STOCK":
          icon = AlertCircle;
          iconColor = "text-red-500";
          bgGradient =
            "from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.outOfStock");
          break;

        // Product notifications
        case "product_added":
        case "PRODUCT_ADDED":
          icon = Package;
          iconColor = "text-green-500";
          bgGradient =
            "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.productAdded");
          break;
        case "product_updated":
        case "PRODUCT_UPDATED":
          icon = Package;
          iconColor = "text-blue-500";
          bgGradient =
            "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.productUpdated");
          break;

        // Broadcast notifications
        case "broadcast_email":
        case "BROADCAST_EMAIL":
          icon = Bell;
          iconColor = "text-indigo-500";
          bgGradient =
            "from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.emailBroadcast");
          break;
        case "broadcast_sms":
        case "BROADCAST_SMS":
          icon = Bell;
          iconColor = "text-teal-500";
          bgGradient =
            "from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.smsBroadcast");
          break;

        default:
          icon = Bell;
          iconColor = "text-gray-500";
          bgGradient =
            "from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.notification");
      }

      return {
        id: notification.id || notification._id,
        type: notification.type || "general",
        title: title,
        message:
          notification.message || t("notifications.defaultMessage"),
        time: notification.createdAt
          ? moment(notification.createdAt).fromNow()
          : t("notifications.justNow"),
        rawTime: notification.createdAt || new Date(),
        icon: icon,
        iconColor: iconColor,
        bgGradient: bgGradient,
        read: notification.isRead || false,
        orderId: notification.orderId,
      };
    })
    .sort((a, b) => {
      // Sort by time (newest first)
      return new Date(b.rawTime) - new Date(a.rawTime);
    });

  const newNotificationCount = notifications.filter((n) => !n.read).length;

  // Filter Logic
  const filteredNotifications = notifications.filter((n) => {
    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !n.read;
    if (activeFilter === "orders")
      return (
        n.type.toLowerCase().includes("order") ||
        n.type.toLowerCase().includes("payment")
      );
    if (activeFilter === "customers")
      return n.type.toLowerCase().includes("customer");
    if (activeFilter === "stock")
      return (
        n.type.toLowerCase().includes("stock") ||
        n.type.toLowerCase().includes("product")
      );
    return true;
  });

  // Group by Date
  const groupedNotifications = filteredNotifications.reduce(
    (groups, notification) => {
      const date = moment(notification.rawTime);
      const today = moment().startOf("day");
      const yesterday = moment().subtract(1, "days").startOf("day");

      let groupKey = "Earlier";
      if (date.isSame(today, "d")) groupKey = "Today";
      else if (date.isSame(yesterday, "d")) groupKey = "Yesterday";

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(notification);
      return groups;
    },
    {},
  );

  // Group order for display
  const groupOrder = ["Today", "Yesterday", "Earlier"];

  const handleRefresh = () => {
    refetchAll();
  };

  const filters = [
    { id: "all", label: t("notifications.filters.all") },
    { id: "unread", label: t("notifications.filters.unread") },
    { id: "orders", label: t("notifications.filters.orders") },
    { id: "customers", label: t("notifications.filters.customers") },
    { id: "stock", label: t("notifications.filters.stock") },
  ];

  // Stats for Premium UI
  const stats = [
    {
      label: t("notifications.stats.totalUnread"),
      value: notifications.filter((n) => !n.read).length,
      icon: Bell,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-100 dark:border-red-900/30",
    },
    {
      label: t("notifications.stats.orderUpdates"),
      value: notifications.filter((n) => n.type.toLowerCase().includes("order"))
        .length,
      icon: ShoppingCart,
      color: "text-[#976DF7]",
      bg: "bg-[#976DF7]/10 dark:bg-[#976DF7]/20",
      border: "border-[#976DF7]/20 dark:border-[#976DF7]/30",
    },
    {
      label: t("notifications.stats.stockAlerts"),
      value: notifications.filter((n) => n.type.toLowerCase().includes("stock"))
        .length,
      icon: Package,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-100 dark:border-orange-900/30",
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t("notifications.title")}
            </h1>
            {newNotificationCount > 0 && (
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                {t("notifications.newBadge", {
                  count: newNotificationCount,
                })}
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {t("notifications.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {newNotificationCount > 0 && (
            <button
              onClick={() => markAllAsRead(companyId)}
              disabled={isMarkingAll}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
            >
              <Check className="h-4 w-4" />
              {isMarkingAll
                ? t("common.processing")
                : t("notifications.markAllAsRead")}
            </button>
          )}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#976DF7] text-white hover:bg-[#8250e5] transition-all shadow-md shadow-[#976DF7]/20"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            {t("notifications.refresh")}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl border ${stat.border} ${stat.bg} flex items-center gap-4 transition-transform hover:scale-[1.02]`}
          >
            <div
              className={`p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm ${stat.color}`}
            >
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`
              whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${
                activeFilter === filter.id
                  ? "bg-[#976DF7] text-white dark:bg-white dark:text-gray-900 shadow-md transform scale-105"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }
            `}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t("notifications.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#976DF7]/20 focus:border-[#976DF7] transition-all"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-8 min-h-[400px]">
        {isLoading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#976DF7] mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 animate-pulse">
              {t("notifications.loading")}
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="h-20 w-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Bell className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              {t("notifications.noneTitle")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
              {activeFilter === "all"
                ? t("notifications.noNotifications")
                : t("notifications.noneForFilter", {
                    filter: t(
                      `notifications.filters.${activeFilter}`,
                    ).toLowerCase(),
                  })}
            </p>
            {activeFilter !== "all" && (
              <button
                onClick={() => setActiveFilter("all")}
                className="mt-4 text-[#976DF7] dark:text-[#976DF7] hover:underline font-medium"
              >
                {t("notifications.viewAll")}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {groupOrder.map((group) => {
              const groupNotifications = groupedNotifications[group];
              if (!groupNotifications || groupNotifications.length === 0)
                return null;

              return (
                <div key={group} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {group}
                    </h2>
                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
                  </div>

                  <div className="grid gap-3">
                    {groupNotifications.map((notification) => {
                      const IconComponent = notification.icon;
                      return (
                        <div
                          key={notification.id}
                          onClick={async () => {
                            if (!notification.read) {
                              try {
                                await markAsRead({
                                  id: notification.id,
                                  companyId,
                                }).unwrap();
                              } catch (e) {
                                console.error("Failed to mark as read:", e);
                              }
                            }
                            if (notification.orderId) {
                              navigate(`/orders/${notification.orderId}`);
                            }
                          }}
                          className={`
                            group relative overflow-hidden p-4 rounded-xl transition-all duration-300 border
                            ${
                              !notification.read
                                ? "bg-white dark:bg-gray-800 border-[#976DF7]/20 dark:border-blue-900/50 shadow-sm hover:shadow-md"
                                : "bg-gray-50/50 dark:bg-gray-900/20 border-transparent hover:bg-white dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                            }
                            cursor-pointer
                          `}
                        >
                          {/* Hover Actions */}
                          <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead({
                                    id: notification.id,
                                    companyId,
                                  });
                                }}
                                className="p-1.5 rounded-lg bg-white dark:bg-gray-700 text-gray-500 hover:text-[#976DF7] shadow-sm border border-gray-100 dark:border-gray-600"
                                title={t("notifications.markAsRead")}
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          {/* Unread Indicator (New Design) */}
                          {!notification.read && (
                            <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-[#976DF7] shadow-sm shadow-[#976DF7]/50 group-hover:opacity-0 transition-opacity"></div>
                          )}

                          <div className="flex gap-4">
                            {/* Icon Box */}
                            <div
                              className={`
                              flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center
                              bg-gradient-to-br ${notification.bgGradient}
                              shadow-inner
                            `}
                            >
                              <IconComponent
                                className={`h-6 w-6 ${notification.iconColor}`}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 pr-6">
                                <div>
                                  <h4
                                    className={`text-sm font-semibold mb-1 ${!notification.read ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}
                                  >
                                    {notification.title}
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                    {notification.message}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 mt-3">
                                <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
                                  <Clock className="h-3 w-3" />
                                  {notification.time}
                                </span>
                                {notification.orderId && (
                                  <span className="flex items-center gap-1 text-xs font-medium text-[#976DF7] dark:text-blue-400 bg-[#976DF7]/10 dark:bg-blue-900/20 px-2 py-0.5 rounded-md">
                                    Order #
                                    {String(notification.orderId).slice(-6)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Chevron */}
                            <div className="flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
                              <ChevronRight className="h-5 w-5 text-gray-300" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
