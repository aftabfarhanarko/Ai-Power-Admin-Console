import React from "react";
import { useTranslation } from "react-i18next";
import { Moon, Sun } from "lucide-react";
import { useDarkMode } from "@/hooks/dark-mode";

const ThemeToggle = ({ variant = "default", className = "" }) => {
  const { t } = useTranslation();
  const { isDark, toggleDarkMode } = useDarkMode();

  const title = isDark ? t("theme.lightMode") : t("theme.darkMode");

  if (variant === "compact" || variant === "ghost") {
    const baseClasses =
      variant === "compact"
        ? "flex items-center justify-center h-9 w-9 rounded-lg text-black dark:text-white bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
        : "flex items-center justify-center transition-colors";

    return (
      <button
        onClick={toggleDarkMode}
        title={title}
        aria-label={title}
        className={`${baseClasses} ${className}`}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      onClick={toggleDarkMode}
      title={title}
      aria-label={title}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-black dark:text-white"
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4" />
          <span>{t("theme.lightMode")}</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span>{t("theme.darkMode")}</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
