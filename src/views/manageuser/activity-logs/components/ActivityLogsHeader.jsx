import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";

const ActivityLogsHeader = ({ t, onBack }) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-xl hover:bg-white dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent tracking-tight">
            {t("activityLogs.title")}
          </h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4" /> Security
            </span>
            <span>•</span>
            <span>{t("activityLogs.description")}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityLogsHeader;

