import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, ChevronRight, Hexagon } from "lucide-react";

import { useForgotPasswordMutation } from "@/features/auth/authApiSlice";
import AuthPage from "..";

const ForgotPasswordRequestPage = () => {
  const navigate = useNavigate();
  const { 
    register, 
    handleSubmit,
    formState: { errors } 
  } = useForm();
  
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const onSubmit = async (data) => {
    try {
      const res = await forgotPassword(data);
      if (res && res?.data?.success) {
        toast.success(res?.data?.message || "Reset Link sent successfully!");
        navigate("/forgot-password/check-email");
      } else {
        toast.error(res?.error?.data?.message || "Failed to send reset link!");
      }
    } catch (err) {
      toast.error("A network error occurred. Please try again.");
    }
  };

  return (
    <AuthPage title="Reset Password" subtitle="Enter your email to receive a recovery link.">
      <div className="w-full space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Address */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
              Recovery Email Address
            </label>
            <div className="relative group">
              <input
                id="email"
                type="email"
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                placeholder="superadmin@squadcart.com"
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-[var(--foreground)] placeholder-[var(--muted-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/50 focus:border-[var(--brand-primary)] transition-all ${
                  errors.email ? 'border-red-500' : ''
                }`}
                disabled={isLoading}
              />
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-dark)] group-focus-within:text-[var(--brand-primary)] transition-colors" />
            </div>
            {errors.email && (
              <span className="text-red-500 text-xs font-semibold ml-1">{errors.email.message}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-4 bg-[var(--brand-primary)] hover:brightness-110 active:scale-[0.99] text-white font-bold text-base rounded-xl shadow-xl shadow-[var(--brand-primary-glow)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>Sending Email...</span>
            ) : (
              <>
                Send Reset Link
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-800/60">
          <p className="text-sm text-[var(--muted-text)] font-medium">
            Remember your password?{" "}
            <Link to="/login" className="text-[var(--brand-primary)] hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </AuthPage>
  );
};

export default ForgotPasswordRequestPage;