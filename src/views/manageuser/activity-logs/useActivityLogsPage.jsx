import React, { useEffect, useMemo, useState } from "react";

import {
  useGetActivityLogsQuery,
  useGetSystemusersQuery,
} from "@/features/systemuser/systemuserApiSlice";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getActionBadgeClass = (action) => {
  const colors = {
    CREATE:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    UPDATE:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    DELETE:
      "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800",
    PERMISSION_ASSIGN:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    PERMISSION_REVOKE:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    STATUS_CHANGE:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    PASSWORD_CHANGE:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
    BARCODE_SCAN:
      "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  };
  return (
    colors[action] ||
    "bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
  );
};

const getActionBadge = (action) => {
  return (
    <span
      className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getActionBadgeClass(action)}`}
    >
      {String(action || "").replace(/_/g, " ")}
    </span>
  );
};

export function useActivityLogsPage({ t }) {
  const {
    data: systemUsersRes,
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useGetSystemusersQuery();

  const systemUsers = useMemo(() => {
    const raw = systemUsersRes?.data ?? systemUsersRes ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [systemUsersRes]);

  const actionOptions = useMemo(
    () => [
      { label: t("activityLogs.allActions"), value: "" },
      { label: t("activityLogs.create"), value: "CREATE" },
      { label: t("activityLogs.update"), value: "UPDATE" },
      { label: t("activityLogs.delete"), value: "DELETE" },
      { label: t("activityLogs.permissionAssign"), value: "PERMISSION_ASSIGN" },
      { label: t("activityLogs.permissionRevoke"), value: "PERMISSION_REVOKE" },
      { label: t("activityLogs.statusChange"), value: "STATUS_CHANGE" },
      { label: t("activityLogs.passwordChange"), value: "PASSWORD_CHANGE" },
      { label: t("activityLogs.barcodeScan"), value: "BARCODE_SCAN" },
    ],
    [t],
  );

  const entityOptions = useMemo(
    () => [
      { label: t("activityLogs.allEntities"), value: "" },
      { label: t("activityLogs.systemUser"), value: "SYSTEM_USER" },
      { label: t("activityLogs.product"), value: "PRODUCT" },
      { label: t("activityLogs.order"), value: "ORDER" },
      { label: t("activityLogs.category"), value: "CATEGORY" },
      { label: t("activityLogs.customer"), value: "CUSTOMER" },
      { label: t("activityLogs.inventory") || "Inventory", value: "INVENTORY" },
      { label: t("activityLogs.banner") || "Banner", value: "BANNER" },
      { label: t("activityLogs.promocode") || "Promocode", value: "PROMOCODE" },
    ],
    [t],
  );

  const performedByOptions = useMemo(
    () => [
      { label: t("activityLogs.allUsers"), value: "" },
      ...systemUsers.map((u) => ({
        label: `${u.name || u.email || "User"} (${u.email || u.id})`,
        value: String(u.id),
      })),
    ],
    [t, systemUsers],
  );

  const targetUserOptions = useMemo(
    () => [
      { label: t("activityLogs.allUsers"), value: "" },
      ...systemUsers.map((u) => ({
        label: `${u.name || u.email || "User"} (${u.email || u.id})`,
        value: String(u.id),
      })),
    ],
    [t, systemUsers],
  );

  const [selectedAction, setSelectedAction] = useState(actionOptions[0]);
  const [selectedEntity, setSelectedEntity] = useState(entityOptions[0]);
  const [selectedPerformedBy, setSelectedPerformedBy] = useState({
    label: t("activityLogs.allUsers"),
    value: "",
  });
  const [selectedTargetUser, setSelectedTargetUser] = useState({
    label: t("activityLogs.allUsers"),
    value: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const offset = useMemo(
    () => (Math.max(currentPage, 1) - 1) * pageSize,
    [currentPage, pageSize],
  );

  const logsQueryParams = useMemo(
    () => ({
      action: selectedAction?.value || undefined,
      entity: selectedEntity?.value || undefined,
      performedByUserId: selectedPerformedBy?.value || undefined,
      targetUserId: selectedTargetUser?.value || undefined,
      limit: pageSize,
      offset,
    }),
    [
      selectedAction?.value,
      selectedEntity?.value,
      selectedPerformedBy?.value,
      selectedTargetUser?.value,
      pageSize,
      offset,
    ],
  );

  const {
    data: logsRes,
    isLoading: isLogsLoading,
    isFetching: isLogsFetching,
    isError: isLogsError,
  } = useGetActivityLogsQuery(logsQueryParams);

  const logsData = useMemo(() => logsRes?.logs ?? [], [logsRes]);
  const totalFromApi = useMemo(() => logsRes?.total ?? 0, [logsRes]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedAction?.value,
    selectedEntity?.value,
    selectedPerformedBy?.value,
    selectedTargetUser?.value,
    pageSize,
  ]);

  const rows = useMemo(() => {
    let logs = logsData || [];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      logs = logs.filter(
        (log) =>
          log.action?.toLowerCase().includes(lower) ||
          log.entity?.toLowerCase().includes(lower) ||
          log.description?.toLowerCase().includes(lower) ||
          log.performedBy?.name?.toLowerCase().includes(lower) ||
          log.performedBy?.email?.toLowerCase().includes(lower) ||
          log.targetUser?.name?.toLowerCase().includes(lower) ||
          log.targetUser?.email?.toLowerCase().includes(lower),
      );
    }

    return logs.map((log) => ({
      id: log.id,
      date: formatDate(log.createdAt),
      actionBadge: getActionBadge(log.action),
      action: log.action,
      entity: (log.entity || "").replace(/_/g, " "),
      description: log.description || "-",
      performedBy: log.performedBy?.name || log.performedBy?.email || "-",
      targetUser: log.targetUser?.name || log.targetUser?.email || "-",
      raw: log,
    }));
  }, [logsData, searchTerm]);

  return {
    actionOptions,
    entityOptions,
    performedByOptions,
    targetUserOptions,
    selectedAction,
    setSelectedAction,
    selectedEntity,
    setSelectedEntity,
    selectedPerformedBy,
    setSelectedPerformedBy,
    selectedTargetUser,
    setSelectedTargetUser,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalFromApi,
    rows,
    isUsersLoading,
    isUsersError,
    isLogsLoading,
    isLogsFetching,
    isLogsError,
  };
}

