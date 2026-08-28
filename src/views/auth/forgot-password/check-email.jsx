import React from "react";
import { Link } from "react-router-dom";
import AuthPage from "..";
import { MailOpen, ArrowRight } from "lucide-react";

const CheckResetPasswordEmailPage = () => {
  return (
    <AuthPage title="Check Your Email" subtitle="We've sent a password reset link to your inbox.">
      <div className="w-full text-center space-y-6">
        {/* Animated Icon container */}
        <div className="flex justify-center my-6">
          <div className="relative flex items-center justify-center w-20 h-20 bg-[var(--brand-primary-dim)] rounded-2xl text-[var(--brand-primary)] border border-[var(--brand-primary-glow)]">
            <MailOpen size={36} className="animate-bounce" />
            <div className="absolute inset-0 rounded-2xl border-2 border-[var(--brand-primary)]/30 animate-ping opacity-25" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        {/* Message Card */}
        <div className="p-5 bg-[var(--surface)] dark:bg-gray-900/40 rounded-xl border border-[var(--border-color)] text-left">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            We sent a secure, temporary link to your recovery email address. Please click the link in that email to create a new password.
          </p>
        </div>

        {/* Helpful Info */}
        <div className="text-xs text-[var(--muted-text)] font-semibold uppercase tracking-wider">
          Haven't received it? Check your spam folder
        </div>

        {/* Sign In Link */}
        <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-800/60">
          <p className="text-sm text-[var(--muted-text)] font-medium">
            Back to{" "}
            <Link to="/login" className="text-[var(--brand-primary)] hover:underline font-bold inline-flex items-center gap-1 group">
              Sign In
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </p>
        </div>
      </div>
    </AuthPage>
  );
};

export default CheckResetPasswordEmailPage;