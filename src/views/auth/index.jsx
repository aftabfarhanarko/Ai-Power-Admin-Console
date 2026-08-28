import React from "react";
import { Link } from "react-router-dom";
import { Hexagon } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";

const AuthPage = ({ children, title = "Welcome Back!", subtitle = "" }) => {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden dark:bg-gradient-to-br dark:from-gray-950 dark:via-[#090b11] dark:to-gray-950 bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 sm:p-10 transition-colors duration-300">
      {/* Theme Toggle - top right */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle variant="compact" />
      </div>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--brand-primary)]/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-[var(--brand-secondary)]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--brand-primary)]/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-[520px] mx-auto">
        <div className="card p-8 sm:p-12 shadow-2xl backdrop-blur-md bg-white/90 dark:bg-[#111622]/90 border border-gray-200/50 dark:border-gray-800/60 rounded-2xl transition-all duration-300 hover:shadow-3xl">
          <div className="w-full mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-[var(--brand-primary)] p-2.5 rounded-xl text-white group-hover:rotate-12 transition-all duration-300 shadow-lg shadow-[var(--brand-primary)]/20">
                  <Hexagon size={26} fill="currentColor" className="text-white" />
                </div>
                <span className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
                  SquadCart <span className="text-[var(--brand-primary)]">Console</span>
                </span>
              </Link>
            </div>

            {/* Title and Subtitle (only shown if provided) */}
            {title && (
              <h2 className="text-2xl font-bold text-center dark:text-white text-gray-800 mt-3">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-center text-black/40 dark:text-white/50 mb-8 mt-2">
                {subtitle}
              </p>
            )}

            {/* Content */}
            <div className="mt-6">{children}</div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -z-10 top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--brand-primary)]/50 to-transparent"></div>
        <div className="absolute -z-10 bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--brand-secondary)]/50 to-transparent"></div>
      </div>
    </div>
  );
};

export default AuthPage;