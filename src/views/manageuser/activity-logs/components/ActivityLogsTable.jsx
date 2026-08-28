import React from "react";
import { motion } from "framer-motion";
import { History } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SkeletonBar = ({ className = "" }) => (
  <div
    className={`h-3 rounded bg-slate-200/70 dark:bg-slate-700/50 ${className}`}
  />
);

const ActivityLogsTable = ({
  t,
  rows,
  isLogsLoading,
  isLogsFetching,
  isUsersLoading,
  isLogsError,
  isUsersError,
}) => {
  const isLoading = isLogsLoading || isLogsFetching || isUsersLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none"
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-sm">
            <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
              <TableHead className="h-14 pl-6 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("activityLogs.date")}
              </TableHead>
              <TableHead className="h-14 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("activityLogs.action")}
              </TableHead>
              <TableHead className="h-14 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("activityLogs.entity")}
              </TableHead>
              <TableHead className="h-14 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("activityLogs.description")}
              </TableHead>
              <TableHead className="h-14 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("activityLogs.performedBy")}
              </TableHead>
              <TableHead className="h-14 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("activityLogs.targetUser")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <TableRow
                  key={i}
                  className="border-slate-100 dark:border-slate-800/50"
                >
                  <TableCell className="pl-6 py-5">
                    <div className="animate-pulse space-y-2">
                      <SkeletonBar className="w-32" />
                      <SkeletonBar className="w-20 h-2.5 opacity-70" />
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="animate-pulse">
                      <SkeletonBar className="w-24 h-6 rounded-md" />
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="animate-pulse">
                      <SkeletonBar className="w-20 h-6 rounded-md" />
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="animate-pulse space-y-2">
                      <SkeletonBar className="w-[90%]" />
                      <SkeletonBar className="w-[65%] opacity-70" />
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="animate-pulse flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200/70 dark:bg-slate-700/50" />
                      <SkeletonBar className="w-28" />
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="animate-pulse">
                      <SkeletonBar className="w-28" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : isLogsError || isUsersError ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      <History className="w-8 h-8 opacity-50" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      Failed to load logs
                    </h3>
                    <p className="text-sm">
                      Please try again (or check your login/token).
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      <History className="w-8 h-8 opacity-50" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      No logs found
                    </h3>
                    <p className="text-sm">
                      Try adjusting your filters or search terms
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((log) => (
                <TableRow
                  key={log.id}
                  className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-slate-100 dark:border-slate-800/50"
                >
                  <TableCell className="pl-6 font-medium text-slate-900 dark:text-white text-sm">
                    {log.date}
                  </TableCell>
                  <TableCell>{log.actionBadge}</TableCell>
                  <TableCell>
                    <span className="font-mono text-xs font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300">
                      {log.entity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-sm text-slate-600 dark:text-slate-300 max-w-xs block truncate"
                      title={log.description}
                    >
                      {log.description}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {String(log.performedBy || "-")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {log.performedBy}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {log.targetUser}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};

export default ActivityLogsTable;

