import React, { useState, useEffect } from "react";
import {
  Check,
  Moon,
  Sun,
  Monitor,
  Palette,
  Paintbrush,
  Laptop,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY_THEME = "theme";
const STORAGE_KEY_DARK = "darkMode";
const STORAGE_KEY_CUSTOM_COLOR = "customColor";
const DEFAULT_PRIMARY = "#5347CE";

/** Convert hex to HSL string for CSS var(--primary): "H S% L%" */
const hexToHSL = (hex) => {
  const n = hex.replace(/^#/, "");
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lR = Math.round(l * 100);
  return `${h} ${s}% ${lR}%`;
};

const getStoredTheme = () => {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY_THEME);
  if (stored && ["light", "dark", "custom"].includes(stored)) return stored;
  return localStorage.getItem(STORAGE_KEY_DARK) === "true" ? "dark" : "light";
};

const getStoredCustomColor = () => {
  if (typeof window === "undefined") return DEFAULT_PRIMARY;
  return localStorage.getItem(STORAGE_KEY_CUSTOM_COLOR) || DEFAULT_PRIMARY;
};

const applyTheme = (theme, customColor, useDarkForCustom) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.removeAttribute("data-theme");
    root.style.removeProperty("--nexus-primary");
    root.style.removeProperty("--nexus-secondary");
    root.style.removeProperty("--primary");
    root.style.removeProperty("--primary-foreground");
    localStorage.setItem(STORAGE_KEY_DARK, "true");
  } else if (theme === "custom" && customColor) {
    root.setAttribute("data-theme", "custom");
    root.style.setProperty("--nexus-primary", customColor);
    root.style.setProperty("--nexus-secondary", customColor);
    root.style.setProperty("--primary", hexToHSL(customColor));
    root.style.setProperty("--primary-foreground", "0 0% 100%");
    if (useDarkForCustom !== undefined) {
      if (useDarkForCustom) {
        root.classList.add("dark");
        localStorage.setItem(STORAGE_KEY_DARK, "true");
      } else {
        root.classList.remove("dark");
        localStorage.setItem(STORAGE_KEY_DARK, "false");
      }
    }
  } else {
    root.classList.remove("dark");
    root.removeAttribute("data-theme");
    root.style.removeProperty("--nexus-primary");
    root.style.removeProperty("--nexus-secondary");
    root.style.removeProperty("--primary");
    root.style.removeProperty("--primary-foreground");
    localStorage.setItem(STORAGE_KEY_DARK, "false");
  }
  if (theme === "dark") {
    root.style.removeProperty("--primary");
    root.style.removeProperty("--primary-foreground");
  }
  localStorage.setItem(STORAGE_KEY_THEME, theme);
};

const isDarkStored = () =>
  typeof window !== "undefined" &&
  localStorage.getItem(STORAGE_KEY_DARK) === "true";

const ThemeCard = ({
  active,
  onClick,
  title,
  icon: Icon,
  color,
  children,
  isDark,
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "relative cursor-pointer overflow-hidden rounded-[24px] border-2 transition-all duration-300",
      active
        ? "border-violet-500 ring-2 ring-violet-500/20 shadow-xl"
        : "border-gray-200 dark:border-gray-800 hover:border-violet-300 dark:hover:border-violet-700 shadow-sm hover:shadow-md",
      isDark ? "bg-[#1e293b]" : "bg-white",
    )}
  >
    {/* Header */}
    <div className="p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "p-2 rounded-xl",
            active
              ? "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <span
          className={cn(
            "font-semibold",
            isDark ? "text-white" : "text-gray-900",
          )}
        >
          {title}
        </span>
      </div>
      {active && (
        <div className="h-6 w-6 rounded-full bg-violet-500 flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
      )}
    </div>

    {/* Content/Preview */}
    <div className="p-5">
      <div
        className={cn(
          "aspect-[16/9] rounded-xl overflow-hidden relative border",
          isDark ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200",
        )}
      >
        {children}
      </div>
    </div>
  </motion.div>
);

const PreferencesSettings = () => {
  const [theme, setTheme] = useState(getStoredTheme);
  const [customColor, setCustomColor] = useState(getStoredCustomColor);
  const [customUseDark, setCustomUseDark] = useState(isDarkStored);

  useEffect(() => {
    applyTheme(
      theme === "custom" ? "custom" : theme,
      theme === "custom" ? customColor : null,
    );
    if (theme === "custom") setCustomUseDark(isDarkStored());
  }, [theme, customColor]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    if (newTheme !== "custom") applyTheme(newTheme, null);
  };

  const handleCustomColorChange = (hex) => {
    setCustomColor(hex);
    localStorage.setItem(STORAGE_KEY_CUSTOM_COLOR, hex);
    if (theme === "custom") applyTheme("custom", hex);
  };

  const handleCustomDarkToggle = () => {
    const next = !customUseDark;
    setCustomUseDark(next);
    applyTheme("custom", customColor, next);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-violet-600 to-indigo-600 p-8 shadow-xl">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2">Appearance</h2>
          <p className="text-violet-100 max-w-2xl text-lg">
            Customize your interface theme and colors to match your brand or
            personal preference.
          </p>
        </div>
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Palette className="w-5 h-5 text-violet-500" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Theme Selection
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Light Mode */}
          <ThemeCard
            active={theme === "light"}
            onClick={() => handleThemeChange("light")}
            title="Light Mode"
            icon={Sun}
            isDark={false}
          >
            <div className="absolute inset-0 p-3 flex gap-3">
              <div className="w-1/4 bg-white rounded-lg border border-gray-200 h-full shadow-sm flex flex-col gap-2 p-2">
                <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                <div className="h-2 w-3/4 bg-gray-100 rounded-full"></div>
                <div className="mt-auto h-2 w-1/2 bg-gray-100 rounded-full"></div>
              </div>
              <div className="w-3/4 flex flex-col gap-3">
                <div className="h-10 bg-white border border-gray-200 rounded-lg shadow-sm w-full flex items-center px-3 gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400/80"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80"></div>
                </div>
                <div className="flex-1 bg-violet-50 rounded-lg border border-violet-100 p-2">
                  <div className="h-full w-full bg-white rounded border border-violet-200/50"></div>
                </div>
              </div>
            </div>
          </ThemeCard>

          {/* Dark Mode */}
          <ThemeCard
            active={theme === "dark"}
            onClick={() => handleThemeChange("dark")}
            title="Dark Mode"
            icon={Moon}
            isDark={true}
          >
            <div className="absolute inset-0 p-3 flex gap-3">
              <div className="w-1/4 bg-gray-800 rounded-lg border border-gray-700 h-full shadow-sm flex flex-col gap-2 p-2">
                <div className="h-2 w-full bg-gray-700 rounded-full"></div>
                <div className="h-2 w-3/4 bg-gray-700 rounded-full"></div>
                <div className="mt-auto h-2 w-1/2 bg-gray-700 rounded-full"></div>
              </div>
              <div className="w-3/4 flex flex-col gap-3">
                <div className="h-10 bg-gray-800 border border-gray-700 rounded-lg shadow-sm w-full flex items-center px-3 gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/50"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50"></div>
                </div>
                <div className="flex-1 bg-gray-800/50 rounded-lg border border-gray-700 p-2">
                  <div className="h-full w-full bg-gray-800 rounded border border-gray-700"></div>
                </div>
              </div>
            </div>
          </ThemeCard>

          {/* Custom Theme */}
          <ThemeCard
            active={theme === "custom"}
            onClick={() => handleThemeChange("custom")}
            title="Custom Brand"
            icon={Paintbrush}
            isDark={customUseDark}
          >
            <div className="absolute inset-0 p-3 flex gap-3">
              <div
                className={cn(
                  "w-1/4 rounded-lg border h-full shadow-sm flex flex-col gap-2 p-2",
                  customUseDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200",
                )}
              >
                <div
                  className="h-2 w-full rounded-full opacity-60"
                  style={{ backgroundColor: customColor }}
                ></div>
                <div
                  className="h-2 w-3/4 rounded-full opacity-40"
                  style={{ backgroundColor: customColor }}
                ></div>
                <div
                  className="mt-auto h-2 w-1/2 rounded-full opacity-40"
                  style={{ backgroundColor: customColor }}
                ></div>
              </div>
              <div className="w-3/4 flex flex-col gap-3">
                <div
                  className={cn(
                    "h-10 border rounded-lg shadow-sm w-full flex items-center px-3 gap-2",
                    customUseDark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200",
                  )}
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full opacity-70"
                    style={{ backgroundColor: customColor }}
                  ></div>
                  <div
                    className="h-2.5 w-2.5 rounded-full opacity-70"
                    style={{ backgroundColor: customColor }}
                  ></div>
                </div>
                <div
                  className={cn(
                    "flex-1 rounded-lg border p-2",
                    customUseDark
                      ? "bg-gray-800/50 border-gray-700"
                      : "bg-gray-50 border-gray-100",
                  )}
                >
                  <div
                    className="h-full w-full rounded border opacity-20"
                    style={{
                      backgroundColor: customColor,
                      borderColor: customColor,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </ThemeCard>
        </div>

        {/* Customization Panel */}
        <AnimatePresence>
          {theme === "custom" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-[24px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] shadow-xl p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left: Color Picker */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Primary Color
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Choose a primary color for your brand identity.
                      </p>

                      <div className="flex flex-wrap items-center gap-4">
                        <div className="relative group">
                          <input
                            type="color"
                            value={customColor}
                            onChange={(e) =>
                              handleCustomColorChange(e.target.value)
                            }
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            aria-label="Pick custom primary color"
                          />
                          <div
                            className="w-16 h-16 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center transition-transform group-hover:scale-105"
                            style={{ backgroundColor: customColor }}
                          >
                            <Palette className="w-6 h-6 text-white mix-blend-difference" />
                          </div>
                        </div>

                        <div className="flex-1">
                          <input
                            type="text"
                            value={customColor}
                            onChange={(e) => {
                              const v = e.target.value.trim();
                              if (/^#[0-9A-Fa-f]{6}$/.test(v) || v === "")
                                handleCustomColorChange(v || DEFAULT_PRIMARY);
                            }}
                            className="w-full max-w-[150px] px-4 py-3 text-sm font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                            placeholder="#5347CE"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Popular Presets
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {[
                          "#5347CE",
                          "#2563eb",
                          "#059669",
                          "#dc2626",
                          "#ea580c",
                          "#7c3aed",
                          "#0891b2",
                          "#be185d",
                        ].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleCustomColorChange(preset)}
                            className={cn(
                              "w-10 h-10 rounded-xl border-2 transition-all hover:scale-110 shadow-sm",
                              customColor === preset
                                ? "border-gray-900 dark:border-white ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#1a1f26] scale-110"
                                : "border-transparent",
                            )}
                            style={{ backgroundColor: preset }}
                            aria-label={`Use ${preset}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Dark Mode Toggle for Custom */}
                  <div className="w-px bg-gray-200 dark:bg-gray-800 hidden md:block" />

                  <div className="flex-1 space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Background Preference
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Choose between light or dark background for your custom
                        theme.
                      </p>
                    </div>

                    <div
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-colors"
                      onClick={handleCustomDarkToggle}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            customUseDark
                              ? "bg-gray-800 text-white"
                              : "bg-white text-gray-900 border border-gray-200",
                          )}
                        >
                          {customUseDark ? (
                            <Moon className="w-5 h-5" />
                          ) : (
                            <Sun className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Dark Mode
                          </p>
                          <p className="text-xs text-gray-500">
                            Enable dark background
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="custom-dark"
                        checked={customUseDark}
                        onCheckedChange={handleCustomDarkToggle}
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-900/50">
                      <div className="flex gap-3">
                        <Laptop className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-violet-700 dark:text-violet-300">
                          Your custom theme will be applied across the entire
                          dashboard. The primary color will be used for buttons,
                          links, and active states.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PreferencesSettings;
