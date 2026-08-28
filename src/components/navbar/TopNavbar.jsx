import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNotificationSound } from "@/hooks/useNotificationSound";

// components
import ThemeToggle from "@/components/theme/ThemeToggle";
import IconButton from "../buttons/icon-button";
import {
  Bell,
  CheckCircle,
  Search,
  Menu,
  User,
  ShoppingCart,
  Truck,
  AlertCircle,
  Package,
  Check,
  RefreshCw,
  ChevronRight,
  Settings as SettingsIcon,
  X,
  MoreVertical,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useGetAllNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "@/features/notifications/notificationsApiSlice";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { useGlobalSearch } from "@/features/search/searchApiSlice";
import { useSearch } from "@/contexts/SearchContext";
import moment from "moment";

const TopNavbar = ({ setIsMobileMenuOpen }) => {
  const { t } = useTranslation();
  // Fetch user data from API instead of Redux
  const { data: user } = useGetCurrentUserQuery();
  const navigate = useNavigate();

  const companyId = user?.companyId;

  // Global search state
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const { setIsSearching } = useSearch();

  // Mobile search state
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Global search hook
  const {
    results,
    isLoading: isSearchLoading,
    totalResults,
  } = useGlobalSearch(searchTerm, companyId);

  // Single source: all notification data from API (poll every 30s)
  const { data: apiNotifications = [] } = useGetAllNotificationsQuery(
    { companyId },
    { skip: !companyId, refetchInterval: 30000 },
  );

  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState("all");
  const [notificationSearch, setNotificationSearch] = useState("");
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsAsReadMutation();

  // Transform API notifications to match UI format
  const notifications = apiNotifications
    .map((notification) => {
      // Determine icon and color based on notification type (matching backend enum)
      let icon = Bell;
      let iconColor = "text-gray-500";
      let title =
        notification.subject ||
        notification.title ||
        t("notifications.notification");

      switch (notification.type) {
        // Order notifications
        case "order_created":
        case "ORDER_CREATED":
          icon = ShoppingCart;
          iconColor = "text-blue-500";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.newOrderCreated");
          break;
        case "order_confirmed":
        case "ORDER_CONFIRMED":
          icon = CheckCircle;
          iconColor = "text-blue-600";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.orderConfirmed");
          break;
        case "order_processing":
        case "ORDER_PROCESSING":
          icon = Package;
          iconColor = "text-yellow-500";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.orderProcessing");
          break;
        case "order_shipped":
        case "ORDER_SHIPPED":
          icon = Truck;
          iconColor = "text-purple-500";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.orderShipped");
          break;
        case "order_delivered":
        case "ORDER_DELIVERED":
          icon = CheckCircle;
          iconColor = "text-green-500";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.orderDelivered");
          break;
        case "order_cancelled":
        case "ORDER_CANCELLED":
          icon = AlertCircle;
          iconColor = "text-red-500";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.orderCancelled");
          break;
        case "order_refunded":
        case "ORDER_REFUNDED":
          icon = AlertCircle;
          iconColor = "text-orange-600";
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
          title =
            notification.subject ||
            notification.title ||
            t("notifications.paymentReceived");
          break;
        case "payment_failed":
        case "PAYMENT_FAILED":
          icon = AlertCircle;
          iconColor = "text-red-600";
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
          title =
            notification.subject ||
            notification.title ||
            t("notifications.newCustomer");
          break;
        case "customer_updated":
        case "CUSTOMER_UPDATED":
          icon = User;
          iconColor = "text-blue-400";
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
          title =
            notification.subject ||
            notification.title ||
            t("notifications.lowStockAlert");
          break;
        case "out_of_stock":
        case "OUT_OF_STOCK":
          icon = AlertCircle;
          iconColor = "text-red-500";
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
          title =
            notification.subject ||
            notification.title ||
            t("notifications.productAdded");
          break;
        case "product_updated":
        case "PRODUCT_UPDATED":
          icon = Package;
          iconColor = "text-blue-500";
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
          title =
            notification.subject ||
            notification.title ||
            t("notifications.emailBroadcast");
          break;
        case "broadcast_sms":
        case "BROADCAST_SMS":
          icon = Bell;
          iconColor = "text-teal-500";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.smsBroadcast");
          break;

        default:
          icon = Bell;
          iconColor = "text-gray-500";
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
        createdAt: notification.createdAt,
        icon: icon,
        iconColor: iconColor,
        read: notification.isRead || false,
        orderId: notification.orderId,
      };
    })
    .sort((a, b) => {
      // Sort by read status (unread first) and then by time
      if (a.read === b.read) return 0;
      return a.read ? 1 : -1;
    });

  const newNotificationCount = notifications.filter((n) => !n.read).length;

  // Play sound when new unread notifications arrive
  useNotificationSound(newNotificationCount, true);

  // --- Notification Logic for Dropdown ---
  const getCategory = (type) => {
    const urgent = [
      "low_stock",
      "out_of_stock",
      "payment_failed",
      "order_cancelled",
      "order_refunded",
    ];
    const resolved = ["order_delivered", "payment_received", "order_confirmed"];
    if (urgent.includes(type?.toLowerCase())) return "urgent";
    if (resolved.includes(type?.toLowerCase())) return "resolved";
    return "normal";
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      !notificationSearch ||
      n.title.toLowerCase().includes(notificationSearch.toLowerCase()) ||
      n.message.toLowerCase().includes(notificationSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (notificationTab === "all") return true;
    return getCategory(n.type) === notificationTab;
  });

  const counts = {
    all: notifications.length,
    urgent: notifications.filter((n) => getCategory(n.type) === "urgent")
      .length,
    normal: notifications.filter((n) => getCategory(n.type) === "normal")
      .length,
    resolved: notifications.filter((n) => getCategory(n.type) === "resolved")
      .length,
  };

  const today = moment().startOf("day");
  const yesterday = moment().subtract(1, "days").startOf("day");

  const grouped = {
    Today: [],
    Yesterday: [],
    Older: [],
  };

  filteredNotifications.forEach((n) => {
    const date = moment(n.createdAt || new Date());
    if (date.isSameOrAfter(today)) grouped.Today.push(n);
    else if (date.isSameOrAfter(yesterday)) grouped.Yesterday.push(n);
    else grouped.Older.push(n);
  });

  // Handle search input change - show results in real-time
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value && value.trim().length >= 2) {
      setShowSearchResults(true);
      setIsSearching(true);
    } else {
      setShowSearchResults(false);
      setIsSearching(false);
    }
  };

  // Close search results when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showSearchResults, setIsSearching]);

  // Close mobile search when navigating
  const handleSearchNavigation = (path) => {
    navigate(path);
    setSearchTerm("");
    setShowSearchResults(false);
    setIsSearching(false);
    setIsMobileSearchOpen(false);
  };

  return (
    <nav className="w-full bg-white dark:bg-[#09090b] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      {/* Desktop and Tablet Navigation */}
      <div className="hidden sm:flex h-16 items-center gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-3 w-full">
          {/* Mobile Menu Toggle - Visible on tablet */}
          <div className="md:hidden">
            <MoreVertical
              icon={Menu}
              onClick={() => setIsMobileMenuOpen(true)}
              className="!bg-transparent !text-black dark:!text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg p-2 "
            />
          </div>

          {/* Desktop Search Bar */}
          <div
            className="hidden lg:flex flex-1 max-w-xl relative"
            ref={searchContainerRef}
          >
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t("search.placeholder")}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-gray-100/50 dark:bg-white/5 border border-transparent focus:border-blue-500/20 focus:bg-white dark:focus:bg-black/40 focus:ring-4 focus:ring-blue-500/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none transition-all duration-300"
              />
            </div>

            {/* Real-time Search Results Dropdown */}
            {showSearchResults &&
              searchTerm &&
              searchTerm.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#09090b] border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl shadow-black/5 z-50 max-h-[70vh] overflow-y-auto ring-1 ring-black/5">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {t("search.results")} ({totalResults})
                      </h3>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setShowSearchResults(false);
                          setIsSearching(false);
                        }}
                        className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {t("common.clear")}
                      </button>
                    </div>

                    {isSearchLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3 opacity-50"></div>
                        <p className="text-sm text-gray-500">
                          {t("search.searching")}
                        </p>
                      </div>
                    ) : totalResults === 0 ? (
                      <div className="text-center py-12">
                        <Search className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("search.noResults", { term: searchTerm })}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Orders Results */}
                        {results.orders.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                              {t("search.orders")}
                            </h4>
                            <div className="grid gap-2">
                              {results.orders.slice(0, 5).map((o) => (
                                <div
                                  key={o.id}
                                  onClick={() =>
                                    handleSearchNavigation(`/orders/${o.id}`)
                                  }
                                  className="p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-500 transition-colors">
                                        Order #{o.id}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        {o.customer?.name ??
                                          o.customerName ??
                                          "-"}{" "}
                                        <span className="mx-1">•</span>{" "}
                                        {o.status}
                                      </p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                      ${Number(o.totalAmount || 0).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Products Results */}
                        {results.products.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                              {t("search.products")}
                            </h4>
                            <div className="grid gap-2">
                              {results.products.slice(0, 5).map((p) => (
                                <div
                                  key={p.id}
                                  onClick={() =>
                                    handleSearchNavigation(`/products/${p.id}`)
                                  }
                                  className="p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-500 transition-colors">
                                        {p.name ?? p.title ?? "-"}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        SKU: {p.sku || "-"}{" "}
                                        <span className="mx-1">•</span> Stock:{" "}
                                        {p.stock || 0}
                                      </p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                      ${Number(p.price || 0).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Customers Results */}
                        {results.customers.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                              {t("search.customers")}
                            </h4>
                            <div className="grid gap-2">
                              {results.customers.slice(0, 5).map((c) => (
                                <div
                                  key={c.id}
                                  onClick={() =>
                                    handleSearchNavigation(`/customers`)
                                  }
                                  className="p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
                                      {c.name?.charAt(0) || "U"}
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-500 transition-colors">
                                        {c.name ?? "-"}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        {c.email || "-"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-3 lg:gap-4 ml-auto">
            {/* Theme Toggle - Always Visible */}
            <ThemeToggle
              variant="compact"
              className="!bg-gray-100/50 dark:!bg-white/5 !text-gray-700 dark:!text-gray-300 hover:!bg-gray-200 dark:hover:!bg-white/10 border-0 p-2 rounded-lg transition-all duration-200"
              title="Toggle theme"
            />


            <div className="h-6 w-px bg-gray-200 dark:bg-white/10"></div>

            {/* Notifications Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition-colors outline-none">
                  <Bell className="w-5 h-5" />
                  {newNotificationCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#09090b] animate-pulse"></span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-full sm:w-[400px] p-0 overflow-hidden border-gray-100 dark:border-gray-800 shadow-2xl bg-white dark:bg-[#09090b] rounded-2xl"
              >
                {/* Header */}
                <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                    {t("notifications.title")}
                  </h3>
                  <div className="flex items-center gap-3">
                    {newNotificationCount > 0 && (
                      <button
                        onClick={() => markAllAsRead(companyId)}
                        disabled={isMarkingAll}
                        className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors font-medium"
                      >
                        {isMarkingAll
                          ? "Processing..."
                          : t("notifications.markAllRead")}
                      </button>
                    )}
                    <SettingsIcon className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                  </div>
                </div>

                {/* Search */}
                <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t("search.notifications")}
                      value={notificationSearch}
                      onChange={(e) => setNotificationSearch(e.target.value)}
                      className="w-full h-9 pl-9 pr-4 rounded-lg bg-gray-50 dark:bg-white/5 border-none text-sm focus:ring-1 focus:ring-blue-500/50 outline-none"
                    />
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 p-3 border-b border-gray-100 dark:border-gray-800 overflow-x-auto no-scrollbar">
                  {[
                    { id: "all", label: t("notifications.all") },
                    { id: "urgent", label: t("notifications.urgent") },
                    { id: "normal", label: t("notifications.normal") },
                    { id: "resolved", label: t("notifications.resolved") },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setNotificationTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                        notificationTab === tab.id
                          ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
                      }`}
                    >
                      {tab.label}
                      <span
                        className={`px-1 rounded text-[10px] font-bold ${
                          notificationTab === tab.id
                            ? "bg-white/20 text-current"
                            : "bg-black/5 dark:bg-white/10 text-gray-500"
                        }`}
                      >
                        {counts[tab.id] < 10
                          ? `0${counts[tab.id]}`
                          : counts[tab.id]}
                      </span>
                    </button>
                  ))}
                </div>

                {/* List */}
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {filteredNotifications.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 text-sm">
                      {t("notifications.noNotifications")}
                    </div>
                  ) : (
                    Object.entries(grouped).map(
                      ([group, items]) =>
                        items.length > 0 && (
                          <React.Fragment key={group}>
                            <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50/50 dark:bg-white/5 sticky top-0 backdrop-blur-sm z-10">
                              {group}
                            </div>
                            {items.map((notification) => {
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
                                        console.error(e);
                                      }
                                    }
                                    if (notification.orderId)
                                      navigate(
                                        `/orders/${notification.orderId}`,
                                      );
                                  }}
                                  className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0 flex gap-3 group"
                                >
                                  <div
                                    className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${
                                      !notification.read
                                        ? "bg-yellow-500"
                                        : "bg-transparent"
                                    }`}
                                  ></div>
                                  <div className="flex-shrink-0">
                                    <IconComponent
                                      className={`w-5 h-5 ${notification.iconColor}`}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                      {notification.title}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                      {notification.time}
                                    </p>
                                  </div>
                                  <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                  </div>
                                </div>
                              );
                            })}
                          </React.Fragment>
                        ),
                    )
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/5">
                  <button
                    onClick={() => navigate("/notifications")}
                    className="w-full py-2 text-sm text-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                  >
                    {t("notifications.viewAll")}
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden px-4 py-3 flex items-center gap-2 justify-between">
        {/* Left: Menu & Search Toggle */}
        <div className="flex items-center gap-2">
          <IconButton
            icon={Menu}
            onClick={() => setIsMobileMenuOpen(true)}
            className="!bg-transparent !text-black dark:!text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg p-2"
          />
          <IconButton
            icon={Search}
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="!bg-transparent !text-black dark:!text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg p-2"
          />
        </div>

        {/* Center: App Logo/Title - Optional */}
        {/* <div className="text-center flex-1">
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {t("app.name")}
          </p>
        </div> */}

        {/* Right: Theme, Language, Notifications, Profile */}
        <div className="flex items-center gap-1.5">
          {/* Theme Toggle */}
          <ThemeToggle
            variant="compact"
            className="!bg-transparent !text-gray-700 dark:!text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
          />


          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 transition-colors">
                <Bell className="w-5 h-5" />
                {newNotificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#09090b] animate-pulse"></span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-[calc(100vw-3rem)] mr-2 p-0 overflow-hidden border-gray-100 dark:border-gray-800 shadow-2xl bg-white dark:bg-[#09090b] rounded-2xl"
            >
              {/* Header */}
              <div className="p-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {t("notifications.title")}
                </h3>
                <div className="flex items-center gap-2">
                  {newNotificationCount > 0 && (
                    <button
                      onClick={() => markAllAsRead(companyId)}
                      disabled={isMarkingAll}
                      className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                    >
                      {isMarkingAll ? "..." : t("notifications.markAllRead")}
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 p-2 border-b border-gray-100 dark:border-gray-800 overflow-x-auto no-scrollbar">
                {[
                  { id: "all", label: t("notifications.all"), short: "All" },
                  {
                    id: "urgent",
                    label: t("notifications.urgent"),
                    short: "Urg",
                  },
                  {
                    id: "normal",
                    label: t("notifications.normal"),
                    short: "Norm",
                  },
                  {
                    id: "resolved",
                    label: t("notifications.resolved"),
                    short: "Res",
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setNotificationTab(tab.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors whitespace-nowrap ${
                      notificationTab === tab.id
                        ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                        : "bg-gray-50 text-gray-600 dark:bg-white/5 dark:text-gray-400"
                    }`}
                  >
                    {tab.short}
                    <span className="font-bold text-[9px]">
                      {counts[tab.id]}
                    </span>
                  </button>
                ))}
              </div>

              {/* List */}
              <div className="max-h-[50vh] overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="py-8 text-center text-gray-500 text-xs">
                    {t("notifications.noNotifications")}
                  </div>
                ) : (
                  Object.entries(grouped).map(
                    ([group, items]) =>
                      items.length > 0 && (
                        <React.Fragment key={group}>
                          <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50/50 dark:bg-white/5 sticky top-0 backdrop-blur-sm z-10">
                            {group}
                          </div>
                          {items.map((notification) => {
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
                                      console.error(e);
                                    }
                                  }
                                  if (notification.orderId)
                                    navigate(`/orders/${notification.orderId}`);
                                }}
                                className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0 flex gap-2"
                              >
                                <div
                                  className={`mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full ${
                                    !notification.read
                                      ? "bg-yellow-500"
                                      : "bg-transparent"
                                  }`}
                                ></div>
                                <div className="flex-shrink-0">
                                  <IconComponent
                                    className={`w-4 h-4 ${notification.iconColor}`}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-1">
                                    {notification.title}
                                  </p>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ),
                  )
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/5">
                <button
                  onClick={() => navigate("/notifications")}
                  className="w-full py-1.5 text-xs text-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                >
                  {t("notifications.viewAll")}
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Mobile Full-Screen Search */}
      {isMobileSearchOpen && (
        <div className="sm:hidden fixed inset-0 top-16 bg-white dark:bg-[#09090b] z-40">
          <div className="p-4 space-y-4">
            {/* Search Input */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t("search.placeholder")}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                autoFocus
                className="w-full bg-gray-100/50 dark:bg-white/5 border border-transparent focus:border-blue-500/20 focus:bg-white dark:focus:bg-black/40 focus:ring-4 focus:ring-blue-500/10 rounded-xl pl-10 pr-10 py-2.5 text-sm outline-none transition-all duration-300"
              />
              <button
                onClick={() => {
                  setSearchTerm("");
                  setShowSearchResults(false);
                  setIsMobileSearchOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results */}
            {showSearchResults &&
            searchTerm &&
            searchTerm.trim().length >= 2 ? (
              <div className="space-y-4 pb-20">
                {isSearchLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-sm text-gray-500">
                      {t("search.searching")}
                    </p>
                  </div>
                ) : totalResults === 0 ? (
                  <div className="text-center py-8">
                    <Search className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("search.noResults", { term: searchTerm })}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Orders */}
                    {results.orders.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          {t("search.orders")}
                        </h4>
                        <div className="grid gap-2">
                          {results.orders.slice(0, 3).map((o) => (
                            <div
                              key={o.id}
                              onClick={() =>
                                handleSearchNavigation(`/orders/${o.id}`)
                              }
                              className="p-3 rounded-lg bg-gray-50 dark:bg-white/5 active:bg-gray-100 dark:active:bg-white/10 cursor-pointer transition-colors"
                            >
                              <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                Order #{o.id}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {o.customer?.name ?? o.customerName ?? "-"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Products */}
                    {results.products.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          {t("search.products")}
                        </h4>
                        <div className="grid gap-2">
                          {results.products.slice(0, 3).map((p) => (
                            <div
                              key={p.id}
                              onClick={() =>
                                handleSearchNavigation(`/products/${p.id}`)
                              }
                              className="p-3 rounded-lg bg-gray-50 dark:bg-white/5 active:bg-gray-100 dark:active:bg-white/10 cursor-pointer transition-colors"
                            >
                              <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                {p.name ?? p.title ?? "-"}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                ${Number(p.price || 0).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Customers */}
                    {results.customers.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          {t("search.customers")}
                        </h4>
                        <div className="grid gap-2">
                          {results.customers.slice(0, 3).map((c) => (
                            <div
                              key={c.id}
                              onClick={() =>
                                handleSearchNavigation(`/customers`)
                              }
                              className="p-3 rounded-lg bg-gray-50 dark:bg-white/5 active:bg-gray-100 dark:active:bg-white/10 cursor-pointer transition-colors flex items-center gap-2"
                            >
                              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold flex-shrink-0">
                                {c.name?.charAt(0) || "U"}
                              </div>
                              <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                {c.name ?? "-"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Search className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-700 mb-3 opacity-50" />
                <p className="text-sm">{t("search.startTyping")}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default TopNavbar;
