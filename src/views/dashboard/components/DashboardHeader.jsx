import React from "react";
import { useTranslation } from "react-i18next";
import TypewriterText from "./TypewriterText";

export default function DashboardHeader({ currentDateTime, getGreeting }) {
  const { t, i18n } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 p-6 rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 shadow-sm relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-nexus-primary/5 via-transparent to-nexus-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="relative z-10">
        <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-nexus-primary to-gray-900 dark:from-white dark:via-nexus-primary dark:to-gray-400 bg-clip-text text-transparent tracking-tighter animate-gradient-x bg-[length:200%_auto]">
          {getGreeting()}, SquadCart
        </h1>
        <div className="text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <TypewriterText
            texts={[
              t("dashboard.overviewTagline1"),
              t("dashboard.overviewTagline2"),
              t("dashboard.overviewTagline3"),
              t("dashboard.overviewTagline4"),
            ]}
          />
        </div>
      </div>

      <div className="text-left md:text-right relative z-10 w-full md:w-auto">
        <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          {currentDateTime.toLocaleTimeString(
            i18n.language === "bn" ? "bn-BD" : "en-US",
            {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </p>
        <p className="text-sm font-medium text-nexus-primary dark:text-nexus-blue mt-0.5 uppercase tracking-wider">
          {currentDateTime.toLocaleDateString(
            i18n.language === "bn" ? "bn-BD" : "en-US",
            {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
