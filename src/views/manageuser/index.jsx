import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Mail,
  Phone,
  MapPin,
  Activity,
  User,
  ChevronRight,
  ChevronLeft,
  Settings,
  Plus,
  Trash2,
  Edit,
  MoreVertical,
  Check,
  X,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import {
  useGetSystemusersQuery,
  useDeleteSystemuserMutation,
  useUpdateSystemuserMutation,
} from "@/features/systemuser/systemuserApiSlice";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import {
  hasPermission,
  FeaturePermission,
} from "@/constants/feature-permission";

// Normalize API user to UI shape (image, joinedDate, lastActive, permissions, activities)
function normalizeUser(u) {
  const createdAt = u.createdAt
    ? new Date(u.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
  return {
    ...u,
    id: u.id,
    name: u.name ?? "—",
    email: u.email ?? "—",
    phone: u.phone ?? "—",
    companyName: u.companyName ?? "—",
    role: u.role ?? null,
    isActive: u.isActive ?? true,
    image: u.photo ?? u.image ?? null,
    joinedDate: createdAt,
    rawCreatedAt: u.createdAt, // Keep raw for stats
    lastActive: u.lastActiveAt ?? "—",
    permissions: Array.isArray(u.permissions) ? u.permissions : [],
    activities: Array.isArray(u.activities) ? u.activities : [],
  };
}

// --- Components ---

const StatusBadge = ({ active }) => {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
        active
          ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
          : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
      }`}
    >
      {active ? t("manageUsers.status.active") : t("manageUsers.status.inactive")}
    </span>
  );
};

const RoleBadge = ({ role }) => {
  const colors = {
    SYSTEM_OWNER:
      "text-indigo-600 bg-indigo-50 border-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 dark:border-indigo-500/20",
    SUPER_ADMIN:
      "text-violet-600 bg-violet-50 border-violet-100 dark:text-violet-400 dark:bg-violet-500/10 dark:border-violet-500/20",
    MANAGER:
      "text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20",
    EMPLOYEE:
      "text-slate-600 bg-slate-50 border-slate-100 dark:text-slate-400 dark:bg-slate-800/50 dark:border-slate-700",
  };

  if (!role) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border text-slate-500 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700">
        No Role
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${colors[role] || colors.EMPLOYEE}`}
    >
      {role.replace(/_/g, " ")}
    </span>
  );
};

// Premium Stats Card Component (Wave Design)
const StatCard = ({
  title,
  value,
  trend,
  trendDir,
  icon: Icon,
  color,
  bg,
  wave,
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden group hover:shadow-xl transition-all duration-300"
    >
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`p-3 rounded-xl ${bg} ${color} transition-transform group-hover:scale-110 duration-300`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {title}
          </p>
        </div>

        <div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            {value}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md border ${
                trendDir === "up"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-500/20"
                  : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-500/20"
              }`}
            >
              {trendDir === "up" ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {trend}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              vs last month
            </span>
          </div>
        </div>
      </div>

      {/* Wave Graphic */}
      <div
        className={`absolute bottom-0 right-0 w-24 h-16 opacity-10 group-hover:opacity-20 transition-opacity duration-300 ${wave}`}
      >
        <svg
          viewBox="0 0 100 60"
          fill="currentColor"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path d="M0 60 C 20 60, 20 20, 50 20 C 80 20, 80 50, 100 50 L 100 60 Z" />
        </svg>
      </div>
    </motion.div>
  );
};

const ManageUsersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: currentUser } = useGetCurrentUserQuery();
  const canManageUsers = hasPermission(
    currentUser,
    FeaturePermission.MANAGE_USERS,
  );
  const canViewActivityLogs = hasPermission(
    currentUser,
    FeaturePermission.LOG_ACTIVITY,
  );
  const { data: apiData, isLoading, isError, error } = useGetSystemusersQuery();
  const [deleteSystemuser, { isLoading: isDeleting }] =
    useDeleteSystemuserMutation();
  const [updateSystemuser, { isLoading: isUpdating }] =
    useUpdateSystemuserMutation();

  const rawList = apiData?.data ?? apiData ?? [];
  const users = useMemo(
    () => (Array.isArray(rawList) ? rawList.map(normalizeUser) : []),
    [rawList],
  );

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  // Select first user when list loads or sync with URL
  useEffect(() => {
    if (users.length > 0) {
      const urlUserId = searchParams.get("userId");
      if (urlUserId) {
        // Find user by ID (loose comparison for string/number)
        const user = users.find((u) => String(u.id) === urlUserId);
        if (user) {
          setSelectedUserId(user.id);
          return;
        }
      }
      
      // Fallback to first user if no URL param or user not found
      if (!selectedUserId) {
        setSelectedUserId(users[0].id);
      }
    } else if (users.length === 0) {
      setSelectedUserId(null);
    }
  }, [users, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps
  const TAB_MAPPING = {
    "all-users": "All Users",
    active: "Active",
    inactive: "Inactive",
  };
  const REVERSE_TAB_MAPPING = {
    "All Users": "all-users",
    Active: "active",
    Inactive: "inactive",
  };

  const activeTab = TAB_MAPPING[searchParams.get("tab")] || "All Users";

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: REVERSE_TAB_MAPPING[tabName] || "all-users" });
  };

  const [showMobileDetail, setShowMobileDetail] = useState(false);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId),
    [users, selectedUserId],
  );

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab =
        activeTab === "All Users"
          ? true
          : activeTab === "Active"
            ? user.isActive
            : activeTab === "Inactive"
              ? !user.isActive
              : true;
      return matchesSearch && matchesTab;
    });
  }, [users, searchTerm, activeTab]);

  // Stats Calculation
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const inactive = total - active;

    // Calculate new users this month
    const now = new Date();
    const newUsers = users.filter((u) => {
      if (!u.rawCreatedAt) return false;
      const date = new Date(u.rawCreatedAt);
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;

    return [
      {
        title: t("manageUsers.stats.totalUsers"),
        value: total,
        trend: "+12%", // Mock data for trend
        trendDir: "up",
        icon: Users,
        color: "text-indigo-600 dark:text-indigo-400",
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        wave: "text-indigo-500",
      },
      {
        title: t("manageUsers.stats.activeNow"),
        value: active,
        trend: "+5%",
        trendDir: "up",
        icon: UserCheck,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        wave: "text-emerald-500",
      },
      {
        title: t("manageUsers.stats.inactive"),
        value: inactive,
        trend: "-2%",
        trendDir: "down",
        icon: UserX,
        color: "text-rose-600 dark:text-rose-400",
        bg: "bg-rose-50 dark:bg-rose-900/20",
        wave: "text-rose-500",
      },
      {
        title: t("manageUsers.stats.newThisMonth"),
        value: newUsers,
        trend: "+8%",
        trendDir: "up",
        icon: UserPlus,
        color: "text-violet-600 dark:text-violet-400",
        bg: "bg-violet-50 dark:bg-violet-900/20",
        wave: "text-violet-500",
      },
    ];
  }, [users, t]);

  const [actionUserId, setActionUserId] = useState(null); // id being acted on (delete/active/inactive)
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    action: null, // 'delete' | 'active' | 'inactive'
    user: null, // { id, name, email }
  });

  const closeConfirmModal = () => {
    setConfirmModal({ open: false, action: null, user: null });
  };

  const handleDeleteClick = (user) => {
    setConfirmModal({
      open: true,
      action: "delete",
      user: { id: user.id, name: user.name, email: user.email },
    });
  };

  const handleActiveClick = (user) => {
    setConfirmModal({
      open: true,
      action: "active",
      user: { id: user.id, name: user.name, email: user.email },
    });
  };

  const handleInactiveClick = (user) => {
    setConfirmModal({
      open: true,
      action: "inactive",
      user: { id: user.id, name: user.name, email: user.email },
    });
  };

  const handleConfirmSubmit = async () => {
    const { action, user } = confirmModal;
    if (!user) return;
    const id = user.id;
    setActionUserId(id);
    try {
      if (action === "delete") {
        await deleteSystemuser(id).unwrap();
        if (selectedUserId === id) {
          setSelectedUserId(users.find((u) => u.id !== id)?.id ?? null);
          setShowMobileDetail(false);
        }
        toast.success("User deleted successfully");
      } else if (action === "active") {
        await updateSystemuser({ id, isActive: true }).unwrap();
        toast.success("User set to active");
      } else if (action === "inactive") {
        await updateSystemuser({ id, isActive: false }).unwrap();
        toast.success("User set to inactive");
      }
      closeConfirmModal();
    } catch (err) {
      toast.error(
        err?.data?.message ||
          (action === "delete"
            ? "Failed to delete user"
            : "Failed to update user"),
      );
    } finally {
      setActionUserId(null);
    }
  };

  const isBusy = (id) => actionUserId === id;

  // Mobile detail view handler
  const handleUserClick = (id) => {
    setSelectedUserId(id);
    // Update URL with selected user ID
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("userId", id);
      return newParams;
    });
    
    // On mobile, show detail view
    if (window.innerWidth < 1024) {
      setShowMobileDetail(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-6 flex flex-col items-center justify-center">
        <div className="animate-spin h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full" />
        <p className="mt-4 text-sm text-gray-500">Loading users...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen p-4 md:p-6 flex flex-col items-center justify-center">
        <p className="text-red-500 text-sm">
          {error?.data?.message || "Failed to load users"}
        </p>
        <p className="mt-2 text-gray-500 text-xs">
          Check your connection and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:h-screen lg:overflow-hidden flex flex-col bg-slate-50 dark:bg-black">
      {/* Top Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              {t("manageUsers.header.title")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("manageUsers.header.subtitle")}
            </p>
          </div>
        </div>
        {(canManageUsers || canViewActivityLogs) && (
          <div className="flex gap-3">
            {canViewActivityLogs && (
              <Button
                variant="outline"
                onClick={() => navigate("/manage-users/activity-logs")}
                className="rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Activity className="h-4 w-4 mr-2" />
                {t("manageUsers.activityLogs")}
              </Button>
            )}
            {canManageUsers && (
              <Button
                onClick={() => navigate("/manage-users/create")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("manageUsers.header.addUser")}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 shrink-0"
      >
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </motion.div>

      {/* Main Layout Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* CENTER - USER LIST */}
        <div className="col-span-1 lg:col-span-8 xl:col-span-9 flex flex-col bg-white dark:bg-[#1a1f26] rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Toolbar & Tabs */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              {Object.keys(REVERSE_TAB_MAPPING).map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {t(`manageUsers.tabs.${REVERSE_TAB_MAPPING[tab]}`)}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t("manageUsers.search.placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 px-4 py-3 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-[10px] font-bold text-gray-500 uppercase tracking-wider backdrop-blur-sm">
            <div className="col-span-8 md:col-span-4 pl-2 md:pl-4">
              {t("manageUsers.table.userDetails")}
            </div>
            <div className="hidden md:block md:col-span-3">
              {t("manageUsers.table.role")}
            </div>
            <div className="col-span-4 md:col-span-3 text-right md:text-left">
              {t("manageUsers.table.status")}
            </div>
            {canManageUsers && (
              <div className="hidden md:block md:col-span-2 text-center">
                {t("manageUsers.table.actions")}
              </div>
            )}
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <motion.div
                  layoutId={user.id}
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className={`group relative grid grid-cols-12 items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedUserId === user.id
                      ? "bg-indigo-50/80 dark:bg-indigo-900/20 ring-1 ring-indigo-200 dark:ring-indigo-800"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent"
                  }`}
                >
                  {/* Selection Indicator */}
                  {selectedUserId === user.id && (
                    <motion.div
                      layoutId="selection-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full"
                    />
                  )}

                  <div className="col-span-8 md:col-span-4 flex items-center gap-3 pl-2 md:pl-4">
                    <div className="relative">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center ring-2 ring-white dark:ring-gray-800 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${user.isActive ? "bg-emerald-500" : "bg-gray-300"}`}
                      />
                    </div>
                    <div className="min-w-0">
                      <h4
                        className={`text-sm font-bold truncate ${selectedUserId === user.id ? "text-indigo-900 dark:text-indigo-100" : "text-gray-900 dark:text-white"}`}
                      >
                        {user.name}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="hidden md:block md:col-span-3">
                    <RoleBadge role={user.role} />
                  </div>

                  <div className="col-span-4 md:col-span-3 flex justify-end md:justify-start">
                    <StatusBadge active={user.isActive} />
                  </div>

                  {canManageUsers && (
                    <div
                      className="hidden md:block md:col-span-2 flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="end"
                          className="w-48 rounded-xl"
                        >
                          {/* Edit */}
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/manage-users/edit/${user.id}`)
                            }
                            className="cursor-pointer font-medium"
                            disabled={isBusy(user.id)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            <span>{t("manageUsers.actions.edit")}</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/manage-users/permissions/${user.id}`)
                            }
                            className="cursor-pointer font-medium"
                            disabled={isBusy(user.id)}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            <span>{t("manageUsers.actions.permissions")}</span>
                          </DropdownMenuItem>

                          {/* Active */}
                          <DropdownMenuItem
                            onClick={() => handleActiveClick(user)}
                            disabled={isBusy(user.id) || user.isActive}
                            className="cursor-pointer text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-900/10 font-medium"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span>
                              {isBusy(user.id)
                                ? "..."
                                : t("manageUsers.actions.setActive")}
                            </span>
                          </DropdownMenuItem>

                          {/* Inactive */}
                          <DropdownMenuItem
                            onClick={() => handleInactiveClick(user)}
                            disabled={isBusy(user.id) || !user.isActive}
                            className="cursor-pointer text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-900/10 font-medium"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            <span>
                              {isBusy(user.id)
                                ? "..."
                                : t("manageUsers.actions.setInactive")}
                            </span>
                          </DropdownMenuItem>

                          {/* Delete */}
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(user)}
                            disabled={isBusy(user.id)}
                            className="text-red-600 focus:text-red-600 cursor-pointer focus:bg-red-50 dark:focus:bg-red-900/10 font-medium"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>
                              {isBusy(user.id)
                                ? "..."
                                : t("manageUsers.actions.deleteUser")}
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="h-16 w-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 opacity-20" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {t("manageUsers.empty.title")}
                </h3>
                <p className="text-sm">
                  {t("manageUsers.empty.subtitle")}
                </p>
              </div>
            )}
          </div>

          {/* Footer Pagination */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>
              {t("manageUsers.footer.showing", {
                count: filteredUsers.length,
              })}
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
                disabled
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
              >
                1
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR - DETAILS (Desktop) */}
        <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
          {selectedUser ? (
            <motion.div
              key={selectedUser.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-[#1a1f26] rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col overflow-hidden"
            >
              {/* System Header */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/80 via-indigo-50/20 to-transparent dark:from-indigo-950/30 dark:via-indigo-950/5 pointer-events-none" />

                {/* Top Actions */}
                <div className="relative z-10 flex justify-between items-center p-6 pb-2">
                  <div className="flex items-center gap-2 px-2.5 py-1 bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-lg border border-gray-100 dark:border-gray-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="font-mono text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                        {t("manageUsers.details.id", {
                          id: selectedUser.id,
                        })}
                      </span>
                  </div>
                  {canManageUsers && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full hover:bg-white/80 dark:hover:bg-black/20"
                        >
                          <MoreHorizontal className="h-4 w-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/manage-users/edit/${selectedUser.id}`)
                          }
                          className="cursor-pointer"
                          disabled={isBusy(selectedUser.id)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit User</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleActiveClick(selectedUser)}
                          disabled={
                            isBusy(selectedUser.id) || selectedUser.isActive
                          }
                          className="cursor-pointer text-green-600 focus:text-green-600 focus:bg-green-50 dark:focus:bg-green-900/10"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          <span>Set Active</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleInactiveClick(selectedUser)}
                          disabled={
                            isBusy(selectedUser.id) || !selectedUser.isActive
                          }
                          className="cursor-pointer text-yellow-600 focus:text-yellow-600 focus:bg-yellow-50 dark:focus:bg-yellow-900/10"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          <span>Set Inactive</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(selectedUser)}
                          disabled={isBusy(selectedUser.id)}
                          className="text-red-600 focus:text-red-600 cursor-pointer focus:bg-red-50 dark:focus:bg-red-900/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete User</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Profile Section */}
                <div className="relative z-10 flex flex-col items-center text-center px-6 pb-6">
                  <div className="relative mb-4 group">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-75 blur group-hover:opacity-100 transition duration-500" />
                    {selectedUser.image ? (
                      <img
                        src={selectedUser.image}
                        alt=""
                        className="relative h-24 w-24 rounded-full object-cover border-[4px] border-white dark:border-[#1a1f26] shadow-xl"
                      />
                    ) : (
                      <div className="relative h-24 w-24 rounded-full bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center border-[4px] border-white dark:border-[#1a1f26] shadow-xl">
                        <User className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-white dark:bg-[#1a1f26] rounded-full p-1.5 shadow-sm">
                      <div
                        className={`h-3 w-3 rounded-full ring-2 ring-white dark:ring-[#1a1f26] ${selectedUser.isActive ? "bg-emerald-500" : "bg-gray-300"}`}
                      />
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">
                    {selectedUser.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">
                    {selectedUser.email}
                  </p>

                  <div className="flex items-center gap-2">
                    <RoleBadge role={selectedUser.role} />
                  </div>
                </div>
              </div>

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                {/* System Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-3.5 w-3.5 text-indigo-500" />
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        Joined
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white pl-5.5">
                      {selectedUser.joinedDate}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        Activity
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white pl-5.5">
                      {selectedUser.lastActive}
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-1 h-4 bg-indigo-500 rounded-full" />
                        {t("manageUsers.details.contactTitle")}
                  </h4>
                  <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-1 space-y-1">
                    <div className="flex items-center gap-3 p-3 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-colors group">
                      <div className="h-8 w-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-indigo-500 shadow-sm transition-colors">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                          {t("manageUsers.details.phoneLabel")}
                        </p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                          {selectedUser.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-colors group">
                      <div className="h-8 w-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-indigo-500 shadow-sm transition-colors">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                          {t("manageUsers.details.companyLabel")}
                        </p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                          {selectedUser.companyName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Permissions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="w-1 h-4 bg-purple-500 rounded-full" />
                      {t("manageUsers.details.systemAccessTitle")}
                    </h4>
                    <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold rounded-md uppercase tracking-wide border border-purple-100 dark:border-purple-900/30">
                      Level {selectedUser.permissions?.length ?? 0}
                    </span>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-5">
                      <Shield className="h-24 w-24" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(selectedUser.permissions ?? []).map((perm, idx) => {
                          const label =
                            typeof perm === "string"
                              ? perm
                              : (perm?.name ?? perm?.code ?? "—");
                          return (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[10px] font-medium text-gray-600 dark:text-gray-300 shadow-sm"
                            >
                              {String(label).replace(/_/g, " ")}
                            </span>
                          );
                        })}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-medium text-gray-500">
                          <span>
                            {t("manageUsers.details.securityClearanceLabel")}
                          </span>
                          <span className="text-purple-600 dark:text-purple-400">
                            {t("manageUsers.details.securityClearanceValue")}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[92%] rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Logs */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-1 h-4 bg-emerald-500 rounded-full" />
                    {t("manageUsers.details.logsTitle")}
                  </h4>
                  <div className="relative pl-2">
                    <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-gray-200 dark:bg-gray-800" />
                    <div className="space-y-6">
                      {(selectedUser.activities ?? []).length === 0 ? (
                        <p className="text-xs text-gray-400 pl-6">
                          {t("manageUsers.details.noLogs")}
                        </p>
                      ) : (
                        (selectedUser.activities ?? []).map((activity, idx) => {
                          const time =
                            activity.time ??
                            activity.createdAt ??
                            activity.timestamp ??
                            "—";
                          const text =
                            activity.text ??
                            activity.description ??
                            activity.action ??
                            "—";
                          const type = activity.type ?? activity.action ?? "";
                          return (
                            <div
                              key={activity.id ?? idx}
                              className="relative pl-6 group"
                            >
                              <div
                                className={`absolute left-[7px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#1a1f26] shadow-sm transition-transform group-hover:scale-125 ${
                                  type === "system"
                                    ? "bg-red-500"
                                    : type === "create"
                                      ? "bg-emerald-500"
                                      : "bg-blue-500"
                                }`}
                              />
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tight">
                                  {typeof time === "string"
                                    ? time
                                    : (time?.toLocaleString?.() ?? "—")}
                                </span>
                                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {text}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              {canManageUsers && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1f26] space-y-3 z-10">
                  <Button
                    className="w-full bg-nexus-primary hover:bg-nexus-primary/90 text-white rounded-xl shadow-lg shadow-indigo-500/20 h-11 font-medium transition-all active:scale-[0.98]"
                    onClick={() =>
                      navigate(`/manage-users/edit/${selectedUser.id}`)
                    }
                    disabled={isBusy(selectedUser.id)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t("manageUsers.details.modifyAccess")}
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="ghost"
                      className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 h-10 rounded-xl font-medium"
                      onClick={() => handleActiveClick(selectedUser)}
                      disabled={
                        isBusy(selectedUser.id) || selectedUser.isActive
                      }
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {isBusy(selectedUser.id)
                        ? "..."
                        : t("manageUsers.status.active")}
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 h-10 rounded-xl font-medium"
                      onClick={() => handleInactiveClick(selectedUser)}
                      disabled={
                        isBusy(selectedUser.id) || !selectedUser.isActive
                      }
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      {isBusy(selectedUser.id)
                        ? "..."
                        : t("manageUsers.status.inactive")}
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 h-10 rounded-xl font-medium transition-all active:scale-[0.98]"
                    onClick={() => handleDeleteClick(selectedUser)}
                    disabled={isBusy(selectedUser.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isBusy(selectedUser.id)
                      ? "..."
                      : t("manageUsers.details.revokeAccess")}
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800 p-8 text-center">
              <div className="h-20 w-20 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 opacity-20" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {t("manageUsers.details.emptyTitle")}
              </h3>
              <p className="text-sm max-w-[200px]">
                {t("manageUsers.details.emptySubtitle")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE DETAIL MODAL/OVERLAY */}
      <AnimatePresence>
        {showMobileDetail && selectedUser && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 lg:hidden bg-white dark:bg-[#1a1f26] flex flex-col"
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setShowMobileDetail(false)}
              >
                <ChevronLeft className="h-5 w-5 mr-1" />{" "}
                {t("manageUsers.mobile.back")}
              </Button>
              <h3 className="font-semibold">
                {t("manageUsers.mobile.title")}
              </h3>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Reusing the detail view content structure for mobile */}
              <div className="flex flex-col items-center text-center mb-6">
                {selectedUser.image ? (
                  <img
                    src={selectedUser.image}
                    alt=""
                    className="h-24 w-24 rounded-full object-cover mb-3"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-3">
                    <User className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedUser.name}
                </h2>
                <p className="text-gray-500">{selectedUser.email}</p>
                <div className="mt-2 flex gap-2 justify-center">
                  <RoleBadge role={selectedUser.role} />
                  <StatusBadge active={selectedUser.isActive} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t("manageUsers.mobile.contactTitle")}
                  </h4>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Phone className="h-4 w-4" /> {selectedUser.phone}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="h-4 w-4" /> {selectedUser.companyName}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    {t("manageUsers.mobile.activityTitle")}
                  </h4>
                  <div className="space-y-3">
                    {selectedUser.activities?.map((activity, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div
                          className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
                            activity.type === "system"
                              ? "bg-red-400"
                              : "bg-green-400"
                          }`}
                        />
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {activity.text}
                          </p>
                          <p className="text-xs text-gray-400">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {canManageUsers && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <Button
                  className="w-full bg-indigo-600 text-white rounded-xl py-6"
                  onClick={() =>
                    navigate(`/manage-users/edit/${selectedUser.id}`)
                  }
                  disabled={isBusy(selectedUser.id)}
                >
                  {t("manageUsers.mobile.editDetails")}
                </Button>
                <Button
                  className="w-full bg-indigo-600 text-white rounded-xl py-6"
                  onClick={() =>
                    navigate(`/manage-users/permissions/${selectedUser.id}`)
                  }
                  disabled={isBusy(selectedUser.id)}
                >
                  {t("manageUsers.actions.permissions")}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="text-green-600 border-green-200 rounded-xl py-6"
                    onClick={() => handleActiveClick(selectedUser)}
                    disabled={isBusy(selectedUser.id) || selectedUser.isActive}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {isBusy(selectedUser.id)
                      ? "..."
                      : t("manageUsers.status.active")}
                  </Button>
                  <Button
                    variant="outline"
                    className="text-yellow-600 border-yellow-200 rounded-xl py-6"
                    onClick={() => handleInactiveClick(selectedUser)}
                    disabled={isBusy(selectedUser.id) || !selectedUser.isActive}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    {isBusy(selectedUser.id)
                      ? "..."
                      : t("manageUsers.status.inactive")}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  className="w-full text-red-600"
                  onClick={() => handleDeleteClick(selectedUser)}
                  disabled={isBusy(selectedUser.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isBusy(selectedUser.id)
                    ? "..."
                    : t("manageUsers.mobile.removeUser")}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation modal for Delete / Active / Inactive */}
      <Dialog
        open={confirmModal.open}
        onOpenChange={(open) => !open && closeConfirmModal()}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {confirmModal.action === "delete" &&
                t("manageUsers.deleteConfirm", {
                  email: confirmModal.user?.email ?? "",
                })}
              {confirmModal.action === "active" &&
                t("manageUsers.activeConfirmTitle")}
              {confirmModal.action === "inactive" &&
                t("manageUsers.inactiveConfirmTitle")}
            </DialogTitle>
            <DialogDescription>
              {confirmModal.action === "delete" &&
                t("manageUsers.deleteConfirmDesc")}
              {confirmModal.action === "active" &&
                t("manageUsers.activeConfirmDesc")}
              {confirmModal.action === "inactive" &&
                t("manageUsers.inactiveConfirmDesc")}
            </DialogDescription>
          </DialogHeader>
          {confirmModal.user && (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">{confirmModal.user.name}</span>
              {confirmModal.user.email && (
                <span className="text-gray-500 dark:text-gray-400">
                  {" "}
                  — {confirmModal.user.email}
                </span>
              )}
            </p>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={closeConfirmModal}
              disabled={!!actionUserId}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant={
                confirmModal.action === "delete" ? "destructive" : "default"
              }
              onClick={handleConfirmSubmit}
              disabled={!!actionUserId}
              className={
                confirmModal.action === "delete"
                  ? "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                  : confirmModal.action === "active"
                    ? "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                    : ""
              }
            >
              {actionUserId
                ? t("common.processing")
                : confirmModal.action === "delete"
                  ? t("common.delete")
                  : confirmModal.action === "active"
                    ? t("common.active")
                    : t("manageUsers.setInactive")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageUsersPage;
