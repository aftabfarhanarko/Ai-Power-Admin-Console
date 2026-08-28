import React from "react";
import { motion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ActivityLogsToolbar = ({
  t,
  searchTerm,
  setSearchTerm,
  setCurrentPage,
  selectedAction,
  setSelectedAction,
  actionOptions,
  selectedEntity,
  setSelectedEntity,
  entityOptions,
  selectedPerformedBy,
  setSelectedPerformedBy,
  performedByOptions,
  selectedTargetUser,
  setSelectedTargetUser,
  targetUserOptions,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col xl:flex-row items-center justify-between gap-4 shadow-sm"
    >
      <div className="relative w-full xl:max-w-xs group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 sm:flex-none justify-between border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl min-w-[160px]"
            >
              <span className="truncate mr-2">{selectedAction.label}</span>
              <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-xl border-slate-200 dark:border-slate-800 max-h-[300px] overflow-y-auto"
          >
            <DropdownMenuLabel>
              {t("activityLogs.filterByAction")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {actionOptions.map((opt, i) => (
              <DropdownMenuItem
                key={i}
                onClick={() => {
                  setSelectedAction(opt);
                }}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 sm:flex-none justify-between border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl min-w-[160px]"
            >
              <span className="truncate mr-2">{selectedEntity.label}</span>
              <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-xl border-slate-200 dark:border-slate-800"
          >
            <DropdownMenuLabel>
              {t("activityLogs.filterByEntity")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {entityOptions.map((opt, i) => (
              <DropdownMenuItem
                key={i}
                onClick={() => {
                  setSelectedEntity(opt);
                }}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 sm:flex-none justify-between border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl min-w-[160px]"
            >
              <span className="truncate mr-2">{selectedPerformedBy.label}</span>
              <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-xl border-slate-200 dark:border-slate-800 max-h-[300px] overflow-y-auto"
          >
            <DropdownMenuLabel>
              {t("activityLogs.filterByPerformedBy")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {performedByOptions.map((opt, i) => (
              <DropdownMenuItem
                key={i}
                onClick={() => {
                  setSelectedPerformedBy(opt);
                }}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 sm:flex-none justify-between border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl min-w-[160px]"
            >
              <span className="truncate mr-2">{selectedTargetUser.label}</span>
              <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-xl border-slate-200 dark:border-slate-800 max-h-[300px] overflow-y-auto"
          >
            <DropdownMenuLabel>
              {t("activityLogs.filterByTargetUser")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {targetUserOptions.map((opt, i) => (
              <DropdownMenuItem
                key={i}
                onClick={() => {
                  setSelectedTargetUser(opt);
                }}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};

export default ActivityLogsToolbar;

