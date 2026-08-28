import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import TablePaginate from "@/components/table/pagination";

import ActivityLogsHeader from "./components/ActivityLogsHeader";
import ActivityLogsToolbar from "./components/ActivityLogsToolbar";
import ActivityLogsTable from "./components/ActivityLogsTable";
import { useActivityLogsPage } from "./useActivityLogsPage.jsx";

const ActivityLogsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
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
  } = useActivityLogsPage({ t });

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 lg:p-8 space-y-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent -z-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <ActivityLogsHeader t={t} onBack={() => navigate("/manage-users")} />

      <ActivityLogsToolbar
        t={t}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setCurrentPage={setCurrentPage}
        selectedAction={selectedAction}
        setSelectedAction={setSelectedAction}
        actionOptions={actionOptions}
        selectedEntity={selectedEntity}
        setSelectedEntity={setSelectedEntity}
        entityOptions={entityOptions}
        selectedPerformedBy={selectedPerformedBy}
        setSelectedPerformedBy={setSelectedPerformedBy}
        performedByOptions={performedByOptions}
        selectedTargetUser={selectedTargetUser}
        setSelectedTargetUser={setSelectedTargetUser}
        targetUserOptions={targetUserOptions}
      />

      <ActivityLogsTable
        t={t}
        rows={rows}
        isLogsLoading={isLogsLoading}
        isLogsFetching={isLogsFetching}
        isUsersLoading={isUsersLoading}
        isLogsError={isLogsError}
        isUsersError={isUsersError}
      />

      <div className="pt-2">
        <TablePaginate
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          total={totalFromApi}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      </div>
    </div>
  );
};

export default ActivityLogsPage;
