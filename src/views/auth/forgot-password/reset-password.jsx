import React from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Lock, ShieldCheck, Check, Hexagon } from "lucide-react";

import { useResetPasswordMutation } from "@/features/auth/authApiSlice";
import AuthPage from "..";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { 
    register, 
    handleSubmit,
    watch,
    formState: { errors } 
  } = useForm({
    mode: "onChange"
  });

  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get("id");
  const token = searchParams.get("token");

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  // Watch password fields
  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");

  const isMinLength = passwordValue?.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(passwordValue || "");
  const hasNumber = /[0-9]/.test(passwordValue || "");
  const passwordsMatch = passwordValue && passwordValue === confirmPasswordValue;

  const onSubmit = async (data) => {
    if (!isMinLength || !hasLetter || !hasNumber || !passwordsMatch) {
      toast.error("Please meet all password requirements first.");
      return;
    }

    try {
      const res = await resetPassword({ userId, token, bodyData: data });
      if (res && res?.data?.success) {
        toast.success(res?.data?.message || "Reset password success!");
        navigate("/login");
      } else {
        toast.error(res?.error?.data?.message || "Reset password failed!");
      }
    } catch (err) {
      toast.error("A network error occurred. Please try again.");
    }
  };

  return (
    <AuthPage title="Reset Password" subtitle="Choose a strong, secure new password.">
      <div className="w-full space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* New Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
              New Password
            </label>
            <div className="relative group">
              <input
                id="password"
                type="password"
                {...register("password", { required: "Password is required" })}
                placeholder="••••••••"
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-[var(--foreground)] placeholder-[var(--muted-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/50 focus:border-[var(--brand-primary)] transition-all ${
                  errors.password ? 'border-red-500' : ''
                }`}
                disabled={isLoading}
              />
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-dark)] group-focus-within:text-[var(--brand-primary)] transition-colors" />
            </div>
            {errors.password && (
              <span className="text-red-500 text-xs font-semibold ml-1">{errors.password.message}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
              Confirm Password
            </label>
            <div className="relative group">
              <input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", { required: "Confirmation is required" })}
                placeholder="••••••••"
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-[var(--foreground)] placeholder-[var(--muted-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/50 focus:border-[var(--brand-primary)] transition-all ${
                  errors.confirmPassword ? 'border-red-500' : ''
                }`}
                disabled={isLoading}
              />
              <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-dark)] group-focus-within:text-[var(--brand-primary)] transition-colors" />
            </div>
            {errors.confirmPassword && (
              <span className="text-red-500 text-xs font-semibold ml-1">{errors.confirmPassword.message}</span>
            )}
          </div>

          {/* Security Checklist */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-2 border border-gray-100 dark:border-gray-800">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Security Check</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 font-medium">
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${isMinLength ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-800 text-transparent"}`}><Check size={10} strokeWidth={4} /></div>
                <span className={isMinLength ? "text-gray-900 dark:text-gray-200" : "text-gray-400 dark:text-gray-600"}>At least 8 chars</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${hasLetter ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-800 text-transparent"}`}><Check size={10} strokeWidth={4} /></div>
                <span className={hasLetter ? "text-gray-900 dark:text-gray-200" : "text-gray-400 dark:text-gray-600"}>Contains letters</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${hasNumber ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-800 text-transparent"}`}><Check size={10} strokeWidth={4} /></div>
                <span className={hasNumber ? "text-gray-900 dark:text-gray-200" : "text-gray-400 dark:text-gray-600"}>Contains numbers</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${passwordsMatch ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-800 text-transparent"}`}><Check size={10} strokeWidth={4} /></div>
                <span className={passwordsMatch ? "text-gray-900 dark:text-gray-200" : "text-gray-400 dark:text-gray-600"}>Passwords match</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !passwordValue || !confirmPasswordValue}
            className="w-full py-4 px-4 bg-[var(--brand-primary)] hover:brightness-110 active:scale-[0.99] text-white font-black text-base rounded-xl shadow-xl shadow-[var(--brand-primary-glow)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>Confirming Changes...</span>
            ) : (
              <>
                Confirm Changes
                <Hexagon size={16} fill="currentColor" className="group-hover:rotate-180 transition-transform duration-700" />
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-800/60">
          <p className="text-sm text-[var(--muted-text)] font-medium">
            Remember password?{" "}
            <Link to="/login" className="text-[var(--brand-primary)] hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </AuthPage>
  );
};

export default ResetPasswordPage;